# Firefox Build Script using web-ext

# --- 配置 ---
# 构建输出目录
$BuildDir = "build"
# 插件临时打包目录名
$PackageDirName = "firefox-package"

# --- 脚本正文 ---

# 派生目录变量
$TempPackageDir = "$PSScriptRoot/../$BuildDir/$PackageDirName"
$ArtifactsDir = "$PSScriptRoot/../$BuildDir"

try {
    # 1. 清理旧的构建文件
    Write-Host "Cleaning previous build..."
    if (Test-Path $TempPackageDir) {
        Remove-Item -Recurse -Force $TempPackageDir
    }

    # 2. 创建临时的打包目录
    Write-Host "Creating temporary package directory..."
    New-Item -ItemType Directory -Force -Path $TempPackageDir | Out-Null

    # 3. 复制插件文件到打包目录
    Write-Host "Copying extension files..."
    Copy-Item -Path "$PSScriptRoot/../src/content.js" -Destination $TempPackageDir
    Copy-Item -Path "$PSScriptRoot/../assets" -Destination $TempPackageDir -Recurse
    Copy-Item -Path "$PSScriptRoot/../manifest-firefox.json" -Destination "$TempPackageDir/manifest.json"

    # 4. 获取版本号并生成文件名
    Write-Host "Generating filename..."
    $ManifestContent = Get-Content "$TempPackageDir/manifest.json" -Raw | ConvertFrom-Json
    $Version = $ManifestContent.version
    $OutputFilename = "better-xiaoheihe-firefox-v${Version}.zip"
    Write-Host "Output filename will be: $OutputFilename"

    # 5. 使用 web-ext 进行 lint 和 build
    Write-Host "Linting with web-ext..."
    web-ext lint --source-dir $TempPackageDir

    Write-Host "Building with web-ext..."
    web-ext build --source-dir $TempPackageDir --artifacts-dir $ArtifactsDir --filename $OutputFilename --overwrite-dest

    # 6. 完成
    Write-Host "Build completed successfully!"
    Write-Host "Output file: $ArtifactsDir/$OutputFilename"

} finally {
    # 7. 清理临时目录 (如果存在)
    if (Test-Path $TempPackageDir) {
        Write-Host "Cleaning up temporary directory..."
        Remove-Item -Recurse -Force $TempPackageDir
    }
    
    # 8. 等待用户按键
    Write-Host "Press any key to exit..."
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
}
