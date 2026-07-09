$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Join-SourceBundle {
  param(
    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [Parameter(Mandatory = $true)]
    [string[]]$Files,

    [Parameter(Mandatory = $true)]
    [string]$EditHint
  )

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("(function () {")
  $lines.Add("  // 此文件由 scripts/build-source-bundles.ps1 根据模块源码生成。")
  $lines.Add("  // 禁止直接修改本入口文件，改动会在下次生成时被覆盖。")
  $lines.Add("  // $EditHint")

  foreach ($file in $Files) {
    $path = Join-Path $root $file
    if (-not (Test-Path $path)) {
      throw "Missing source chunk: $path"
    }

    $lines.Add("  // BEGIN $file")
    foreach ($line in Get-Content -LiteralPath $path) {
      $lines.Add($line)
    }
    $lines.Add("  // END $file")
  }

  $lines.Add("})();")
  [System.IO.File]::WriteAllText($OutputPath, ($lines -join [Environment]::NewLine) + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))
}

Join-SourceBundle `
  -OutputPath (Join-Path $root "src\content.js") `
  -EditHint "请优先修改 src/content 下的模块源文件。" `
  -Files @(
    "src\shared\constants.js",
    "src\shared\normalizers.js",
    "src\content\state.js",
    "src\content\layout-style.js",
    "src\content\hot-search-sidebar.js",
    "src\content\hot-search-api.js",
    "src\content\request-context.js",
    "src\content\api-signing.js",
    "src\content\message-normalizer.js",
    "src\content\comment-renderer.js",
    "src\content\comment-cache.js",
    "src\content\feed.js",
    "src\content\ai-summary.js",
    "src\content\feed-actions.js",
    "src\content\settings-state.js",
    "src\content\settings-renderers.js",
    "src\content\ai-bot-log-panel.js",
    "src\content\settings-shell.js",
    "src\content\ai-settings-actions.js",
    "src\content\ai-bot-actions.js",
    "src\content\settings-mount.js",
    "src\content\header.js",
    "src\content\link-page.js",
    "src\content\navigation.js"
  )

Join-SourceBundle `
  -OutputPath (Join-Path $root "src\background.js") `
  -EditHint "请优先修改 src/background 下的模块源文件。" `
  -Files @(
    "src\shared\constants.js",
    "src\shared\normalizers.js",
    "src\background\state.js",
    "src\background\xiaoheihe-api.js",
    "src\background\ai-service.js",
    "src\background\ai-bot-data.js",
    "src\background\ai-bot-api.js",
    "src\background\ai-bot-compose.js",
    "src\background\ai-bot-queue.js",
    "src\background\ai-bot-processor.js",
    "src\background\ai-bot-runtime.js",
    "src\background\dnr-rules.js",
    "src\background\runtime.js"
  )

Join-SourceBundle `
  -OutputPath (Join-Path $root "src\ai-bridge.js") `
  -EditHint "请优先修改 src/ai-bridge 和 src/shared 下的模块源文件。" `
  -Files @(
    "src\shared\constants.js",
    "src\shared\normalizers.js",
    "src\ai-bridge\bridge.js"
  )

Write-Host "Generated src/content.js, src/background.js and src/ai-bridge.js"
