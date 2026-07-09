$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Join-SourceBundle {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $true)]
    [string]$SourceRoot,

    [Parameter(Mandatory = $true)]
    [string[]]$Files,

    [Parameter(Mandatory = $true)]
    [string]$EditHint
  )

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("(function () {")
  $lines.Add("  // 此文件由 scripts/build-source-bundles.ps1 根据拆分模块生成。")
  $lines.Add("  // $EditHint")

  foreach ($file in $Files) {
    $path = Join-Path $SourceRoot $file
    if (-not (Test-Path $path)) {
      throw "Missing source chunk: $path"
    }

    $relativePath = Resolve-Path -Relative $path
    $lines.Add("  // BEGIN $relativePath")
    foreach ($line in Get-Content -LiteralPath $path) {
      $lines.Add($line)
    }
    $lines.Add("  // END $relativePath")
  }

  $lines.Add("})();")
  [System.IO.File]::WriteAllText($OutputPath, ($lines -join [Environment]::NewLine) + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

$contentSourceRoot = Join-Path $root "src\content"
$backgroundSourceRoot = Join-Path $root "src\background"

Join-SourceBundle `
  -OutputPath (Join-Path $root "src\content.js") `
  -SourceRoot $contentSourceRoot `
  -EditHint "请优先修改 src/content 下的模块源文件。" `
  -Files @(
    "state.js",
    "layout-style.js",
    "hot-search-sidebar.js",
    "hot-search-api.js",
    "request-context.js",
    "api-signing.js",
    "message-normalizer.js",
    "comment-renderer.js",
    "comment-cache.js",
    "feed.js",
    "ai-summary.js",
    "feed-actions.js",
    "settings-state.js",
    "settings-renderers.js",
    "ai-bot-log-panel.js",
    "settings-shell.js",
    "ai-settings-actions.js",
    "ai-bot-actions.js",
    "settings-mount.js",
    "header.js",
    "link-page.js",
    "navigation.js"
  )

Join-SourceBundle `
  -OutputPath (Join-Path $root "src\background.js") `
  -SourceRoot $backgroundSourceRoot `
  -EditHint "请优先修改 src/background 下的模块源文件。" `
  -Files @(
    "state.js",
    "xiaoheihe-api.js",
    "ai-service.js",
    "ai-bot-data.js",
    "ai-bot-api.js",
    "ai-bot-compose.js",
    "ai-bot-queue.js",
    "ai-bot-processor.js",
    "ai-bot-runtime.js",
    "dnr-rules.js",
    "runtime.js"
  )

Write-Host "Generated src/content.js and src/background.js"
