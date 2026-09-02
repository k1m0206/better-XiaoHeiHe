$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$zip = Join-Path $dist "better-XiaoHeiHe.zip"

$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$defaultLocale = [string]$manifest.default_locale
if ([string]::IsNullOrWhiteSpace($defaultLocale)) {
  throw "manifest.json must define default_locale when _locales is present."
}

$defaultMessagesPath = Join-Path $root "_locales/$defaultLocale/messages.json"
if (-not (Test-Path -LiteralPath $defaultMessagesPath -PathType Leaf)) {
  throw "Default locale messages file was not found: $defaultMessagesPath"
}

$defaultMessages = Get-Content -LiteralPath $defaultMessagesPath -Raw -Encoding UTF8 | ConvertFrom-Json
$requiredMessageKeys = @(
  "extensionName",
  "extensionShortName",
  "extensionDescription"
)
foreach ($messageKey in $requiredMessageKeys) {
  $messageEntry = $defaultMessages.PSObject.Properties[$messageKey].Value
  if ($null -eq $messageEntry -or [string]::IsNullOrWhiteSpace([string]$messageEntry.message)) {
    throw "Default locale '$defaultLocale' is missing message key '$messageKey'."
  }
}

# Edge Dev 153 cannot load zh_CN as default_locale. Until that regression is
# resolved, en intentionally aliases zh_CN and must stay synchronized with it.
if ($defaultLocale -eq "en") {
  $zhCnMessagesPath = Join-Path $root "_locales/zh_CN/messages.json"
  if (-not (Test-Path -LiteralPath $zhCnMessagesPath -PathType Leaf)) {
    throw "Chinese locale messages file was not found: $zhCnMessagesPath"
  }

  $zhCnMessages = Get-Content -LiteralPath $zhCnMessagesPath -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($messageKey in $requiredMessageKeys) {
    $defaultMessage = [string]$defaultMessages.PSObject.Properties[$messageKey].Value.message
    $zhCnMessage = [string]$zhCnMessages.PSObject.Properties[$messageKey].Value.message
    if ($defaultMessage -cne $zhCnMessage) {
      throw "Compatibility locale message '$messageKey' must match zh_CN."
    }
  }
}

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
