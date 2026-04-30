# Firefox Build Script

# --- 配置 ---
# 构建输出目录
$BuildDir = "build"
# 插件源文件目录
$SourceDir = "."
# 插件包的根目录名
$ExtensionName = "better-xiaoheihe-firefox"
# 最终生成的zip包名
$OutputFile = "$BuildDir/${ExtensionName}.zip"

# --- 脚本正文 ---

# 派生目录变量
$PackageDir = "$PSScriptRoot/../$BuildDir/$ExtensionName"
$FinalOutputFile = "$PSScriptRoot/../$OutputFile"

# 1. 清理旧的构建文件
Write-Host "Cleaning previous build..."
if (Test-Path $PackageDir) {
    Remove-Item -Recurse -Force $PackageDir
}
if (Test-Path $FinalOutputFile) {
    Remove-Item -Force $FinalOutputFile
}

# 2. 创建临时的打包目录
Write-Host "Creating build directory..."
New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null

# 3. 复制插件文件到打包目录
Write-Host "Copying extension files..."
Copy-Item -Path "$PSScriptRoot/../src/content.js" -Destination $PackageDir
Copy-Item -Path "$PSScriptRoot/../assets" -Destination $PackageDir -Recurse
Copy-Item -Path "$PSScriptRoot/../manifest-firefox.json" -Destination "$PackageDir/manifest.json"

# 4. 创建 ZIP 压缩包
Write-Host "Creating zip archive..."
Compress-Archive -Path "$PackageDir/*" -DestinationPath $FinalOutputFile

# 5. 完成
Write-Host "Build completed successfully!"
Write-Host "Output file: $FinalOutputFile"
