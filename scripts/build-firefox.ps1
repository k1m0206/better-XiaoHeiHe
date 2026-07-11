param(
    [switch]$PauseOnExit,
    [switch]$CleanPackage
)

$ErrorActionPreference = "Stop"

# Firefox 专属打包脚本
# 产物:
#   build/firefox-package/              解包目录，可用于 about:debugging 临时加载
#   build/better-xiaoheihe-firefox-v*.xpi  本地测试用 xpi
#   dist/better-XiaoHeiHe-firefox.zip      提交 AMO 审核用 zip

# --- 常量 ---
$BuildDir = "build"
$PackageDirName = "firefox-package"

# --- 派生路径 ---
$RootDir = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $RootDir "dist"
$ArtifactsDir = Join-Path $RootDir $BuildDir
$TempPackageDir = Join-Path $ArtifactsDir $PackageDirName
$WebExt = Get-Command "web-ext" -ErrorAction SilentlyContinue
$LogPath = Join-Path $ArtifactsDir "build-firefox.log"

function Write-BuildLog {
    param([string]$Message)

    Write-Host $Message
    Add-Content -LiteralPath $LogPath -Value $Message
}

function New-ExtensionZip {
    param(
        [string]$SourceDir,
        [string]$DestinationPath
    )

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $archive = [System.IO.Compression.ZipFile]::Open($DestinationPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        Get-ChildItem -LiteralPath $SourceDir -Recurse -File | ForEach-Object {
            $relativePath = $_.FullName.Substring($SourceDir.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
            $entryName = $relativePath.Replace([System.IO.Path]::DirectorySeparatorChar, "/").Replace([System.IO.Path]::AltDirectorySeparatorChar, "/")
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $archive,
                $_.FullName,
                $entryName,
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    } finally {
        $archive.Dispose()
    }
}

try {
    # 0. 准备目录
    New-Item -ItemType Directory -Force -Path $ArtifactsDir | Out-Null
    New-Item -ItemType Directory -Force -Path $DistDir | Out-Null
    Set-Content -LiteralPath $LogPath -Value "Firefox build started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # 1. 生成打包入口文件
    Write-BuildLog "Generating source bundles..."
    & (Join-Path $PSScriptRoot "build-source-bundles.ps1")

    # 1. 清理上次构建
    Write-BuildLog "Cleaning previous build..."
    if (Test-Path $TempPackageDir) {
        Remove-Item -LiteralPath $TempPackageDir -Recurse -Force
    }

    # 2. 创建临时打包目录
    Write-BuildLog "Creating temporary package directory..."
    New-Item -ItemType Directory -Force -Path $TempPackageDir | Out-Null

    # 3. 复制扩展文件（只打包入口文件，不包含模块源码子目录）
    Write-BuildLog "Copying extension files..."
    $TempSrcDir = Join-Path $TempPackageDir "src"
    New-Item -ItemType Directory -Force -Path $TempSrcDir | Out-Null
    Get-ChildItem -Path (Join-Path $RootDir "src") -File -Filter "*.js" | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $TempSrcDir
    }
    Copy-Item -LiteralPath (Join-Path $RootDir "assets") -Destination $TempPackageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $RootDir "_locales") -Destination $TempPackageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $RootDir "manifest-firefox.json") -Destination (Join-Path $TempPackageDir "manifest.json")

    # 4. 读取版本号
    Write-BuildLog "Generating filename..."
    $ManifestContent = Get-Content (Join-Path $TempPackageDir "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json
    $Version = $ManifestContent.version
    $OutputFilename = "better-xiaoheihe-firefox-v${Version}.xpi"
    Write-BuildLog "Output filename will be: $OutputFilename"

    # 5. web-ext lint（如果可用）
    if ($WebExt) {
        Write-BuildLog "Linting with web-ext..."
        & $WebExt lint --source-dir $TempPackageDir
    } else {
        Write-BuildLog "web-ext was not found in PATH. Skipping lint and continuing package build."
    }

    # 6. 生成 xpi（本地测试用）
    Write-BuildLog "Building Firefox .xpi..."
    $XpiPath = Join-Path $ArtifactsDir $OutputFilename
    if (Test-Path $XpiPath) {
        Remove-Item -LiteralPath $XpiPath -Force
    }
    New-ExtensionZip -SourceDir $TempPackageDir -DestinationPath $XpiPath
    Write-BuildLog ("XPI: {0}" -f $XpiPath)

    # 7. 生成 zip（提交 AMO 审核用）
    Write-BuildLog "Building AMO upload zip..."
    $AmoZipPath = Join-Path $DistDir "better-XiaoHeiHe-firefox-v${Version}.zip"
    if (Test-Path $AmoZipPath) {
        Remove-Item -LiteralPath $AmoZipPath -Force
    }
    New-ExtensionZip -SourceDir $TempPackageDir -DestinationPath $AmoZipPath
    Write-BuildLog ("AMO zip: {0}" -f $AmoZipPath)

    # 8. 完成
    Write-BuildLog "Build completed successfully!"
    Write-BuildLog "Firefox build finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

} catch {
    Write-BuildLog ("Build failed: {0}" -f $_.Exception.Message)
    throw
} finally {
    # 保留解包目录供 about:debugging 临时加载
    if ($CleanPackage -and (Test-Path $TempPackageDir)) {
        Write-BuildLog "Cleaning up temporary directory..."
        Remove-Item -LiteralPath $TempPackageDir -Recurse -Force
    } elseif (Test-Path $TempPackageDir) {
        Write-BuildLog ("Temporary add-on directory kept for debugging: {0}" -f $TempPackageDir)
    }

    if ($PauseOnExit) {
        Write-Host ""
        Write-Host "Press any key to exit..."
        $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    }
}
