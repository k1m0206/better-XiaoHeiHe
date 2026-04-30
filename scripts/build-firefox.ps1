# Firefox Build Script

# This script packages the extension for Firefox distribution.

# Set paths
$extensionPath = "./path-to-extension"
$outputPath = "./build/output.xpi"

# Build command
"zip -r $outputPath $extensionPath"

Write-Host "Build completed! The extension is packaged as $outputPath."