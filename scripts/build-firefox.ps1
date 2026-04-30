param(
    [switch]$PauseOnExit
)

$ErrorActionPreference = "Stop"

# Firefox Build Script

# --- Config ---
# Build output directory
$BuildDir = "build"
# Temporary package directory name
$PackageDirName = "firefox-package"

# --- Script ---

# Derived paths
$RootDir = Split-Path -Parent $PSScriptRoot
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
    New-Item -ItemType Directory -Force -Path $ArtifactsDir | Out-Null
    Set-Content -LiteralPath $LogPath -Value "Firefox build started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

    # 1. Clean previous build files
    Write-BuildLog "Cleaning previous build..."
    if (Test-Path $TempPackageDir) {
        Remove-Item -LiteralPath $TempPackageDir -Recurse -Force
    }

    # 2. Create temporary package directory
    Write-BuildLog "Creating temporary package directory..."
    New-Item -ItemType Directory -Force -Path $TempPackageDir | Out-Null

    # 3. Copy extension files
    Write-BuildLog "Copying extension files..."
    Copy-Item -LiteralPath (Join-Path $RootDir "src") -Destination $TempPackageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $RootDir "assets") -Destination $TempPackageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $RootDir "manifest-firefox.json") -Destination (Join-Path $TempPackageDir "manifest.json")

    # 4. Read version and generate output filename
    Write-BuildLog "Generating filename..."
    $ManifestContent = Get-Content (Join-Path $TempPackageDir "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json
    $Version = $ManifestContent.version
    $OutputFilename = "better-xiaoheihe-firefox-v${Version}.zip"
    Write-BuildLog "Output filename will be: $OutputFilename"

    # 5. Run web-ext lint if available, then continue packaging
    if ($WebExt) {
        Write-BuildLog "Linting with web-ext..."
        & $WebExt lint --source-dir $TempPackageDir
    } else {
        Write-BuildLog "web-ext was not found in PATH. Skipping lint and continuing package build."
    }

    Write-BuildLog "Building Firefox package..."
    $OutputPath = Join-Path $ArtifactsDir $OutputFilename
    if (Test-Path $OutputPath) {
        Remove-Item -LiteralPath $OutputPath -Force
    }
    New-ExtensionZip -SourceDir $TempPackageDir -DestinationPath $OutputPath

    # 6. Done
    Write-BuildLog "Build completed successfully!"
    Write-BuildLog ("Output file: {0}" -f $OutputPath)
    Write-BuildLog "Firefox build finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

} catch {
    Write-BuildLog ("Build failed: {0}" -f $_.Exception.Message)
    throw
} finally {
    # 7. Clean temporary directory if it exists
    if (Test-Path $TempPackageDir) {
        Write-BuildLog "Cleaning up temporary directory..."
        Remove-Item -LiteralPath $TempPackageDir -Recurse -Force
    }

    if ($PauseOnExit) {
        Write-Host ""
        Write-Host "Press any key to exit..."
        $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    }
}
