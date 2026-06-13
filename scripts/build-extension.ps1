[CmdletBinding()]
param(
  [ValidateSet("chrome", "firefox", "all")]
  [string]$Target = "all",
  [switch]$KeepStaging
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$chromeZip = Join-Path $dist "better-XiaoHeiHe-chrome.zip"
$firefoxZip = Join-Path $dist "better-XiaoHeiHe-firefox.zip"
$firefoxStaging = Join-Path $dist "firefox-staging"

$commonItems = @("README.md", "PRIVACY.md", "src", "assets", "_locales")
$chromeItems = @("manifest.json") + $commonItems + @("CHROME_STORE.md")
$firefoxItems = $commonItems + @("FIREFOX_STORE.md")

function Get-RootPath {
  param([Parameter(Mandatory = $true)][string]$RelativePath)
  return Join-Path $root $RelativePath
}

function Remove-PathIfExists {
  param([Parameter(Mandatory = $true)][string]$Path)
  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Recurse -Force
  }
}

function Assert-PackageItemsExist {
  param([Parameter(Mandatory = $true)][string[]]$Items)
  foreach ($item in $Items) {
    if (-not (Test-Path -LiteralPath (Get-RootPath $item))) {
      throw "Required package item not found: $item"
    }
  }
}

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Content
  )
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

# Windows PowerShell 5.1 escapes non-ASCII as \uXXXX in ConvertTo-Json; restore them.
function ConvertFrom-JsonUnicodeEscapes {
  param([Parameter(Mandatory = $true)][string]$Json)
  return [regex]::Replace($Json, "(?<!\\)\\u([0-9a-fA-F]{4})", {
    param($match)
    return [string][char]([Convert]::ToInt32($match.Groups[1].Value, 16))
  })
}

function New-ZipFromRootItems {
  param(
    [Parameter(Mandatory = $true)][string[]]$Items,
    [Parameter(Mandatory = $true)][string]$DestinationPath
  )
  Assert-PackageItemsExist -Items $Items
  Remove-PathIfExists -Path $DestinationPath
  $paths = $Items | ForEach-Object { Get-RootPath $_ }
  Compress-Archive -Path $paths -DestinationPath $DestinationPath -Force
  Write-Host "Created $DestinationPath"
}

function New-FirefoxManifest {
  param([Parameter(Mandatory = $true)][string]$DestinationPath)

  $sourceManifestPath = Get-RootPath "manifest.json"
  if (-not (Test-Path -LiteralPath $sourceManifestPath)) {
    throw "Required package item not found: manifest.json"
  }

  $manifest = Get-Content -LiteralPath $sourceManifestPath -Raw | ConvertFrom-Json
  $manifest.background = [ordered]@{ scripts = @("src/background.js") }

  $gecko = [ordered]@{
    id = "better-xiaoheihe@k1m0206.github.io"
    strict_min_version = "140.0"
    data_collection_permissions = [ordered]@{
      required = @("websiteContent", "personalCommunications")
      optional = @()
    }
  }
  $browserSpecificSettings = [ordered]@{ gecko = $gecko }

  if ($manifest.PSObject.Properties.Name -contains "browser_specific_settings") {
    $manifest.browser_specific_settings = $browserSpecificSettings
  } else {
    $manifest | Add-Member -MemberType NoteProperty -Name "browser_specific_settings" -Value $browserSpecificSettings
  }

  $json = $manifest | ConvertTo-Json -Depth 20
  $json = ConvertFrom-JsonUnicodeEscapes -Json $json
  Write-Utf8NoBom -Path $DestinationPath -Content ($json + [Environment]::NewLine)
}

function New-FirefoxZip {
  Remove-PathIfExists -Path $firefoxStaging
  try {
    Assert-PackageItemsExist -Items $firefoxItems
    New-Item -ItemType Directory -Force -Path $firefoxStaging | Out-Null
    foreach ($item in $firefoxItems) {
      Copy-Item -LiteralPath (Get-RootPath $item) -Destination $firefoxStaging -Recurse -Force
    }
    New-FirefoxManifest -DestinationPath (Join-Path $firefoxStaging "manifest.json")

    Remove-PathIfExists -Path $firefoxZip
    $stagedPaths = @(Get-ChildItem -LiteralPath $firefoxStaging | ForEach-Object { $_.FullName })
    if (-not $stagedPaths.Length) {
      throw "Firefox staging directory is empty."
    }
    Compress-Archive -Path $stagedPaths -DestinationPath $firefoxZip -Force
    Write-Host "Created $firefoxZip"
  } finally {
    if (-not $KeepStaging) {
      Remove-PathIfExists -Path $firefoxStaging
    }
  }

  if ($KeepStaging) {
    Write-Host "Kept staging dir for lint: $firefoxStaging"
  }
}

New-Item -ItemType Directory -Force -Path $dist | Out-Null

if ($Target -eq "chrome" -or $Target -eq "all") {
  New-ZipFromRootItems -Items $chromeItems -DestinationPath $chromeZip
}

if ($Target -eq "firefox" -or $Target -eq "all") {
  New-FirefoxZip
}
