$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$zip = Join-Path $dist "better-XiaoHeiHe.zip"

& (Join-Path $PSScriptRoot "build-source-bundles.ps1")

New-Item -ItemType Directory -Force -Path $dist | Out-Null
if (Test-Path $zip) {
  Remove-Item -LiteralPath $zip
}

$items = @(
  "manifest.json",
  "README.md",
  "PRIVACY.md",
  "CHROME_STORE.md",
  "src",
  "assets",
  "_locales"
)

$paths = $items | ForEach-Object { Join-Path $root $_ }
Compress-Archive -Path $paths -DestinationPath $zip -Force
Write-Host "Created $zip"
