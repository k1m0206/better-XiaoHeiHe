// AI 总结设置表单渲染。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function renderAiSettingsPanelContent() {
    const promptLength = Array.from(aiSettings.summaryPrompt || "").length;
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI 总结</div>
            <div class="better-settings__ai-subtitle">帖子和评论区摘要</div>
          </div>
          <label class="better-settings__ai-master-toggle" title="${aiSettings.enabled ? "关闭 AI 总结" : "开启 AI 总结"}">
            <input class="better-settings__ai-enabled" type="checkbox" aria-label="AI 总结"${aiSettings.enabled ? " checked" : ""}>
            <span class="better-settings__ai-master-control" aria-hidden="true">
              <span class="better-settings__ai-status${aiSettings.enabled ? " is-on" : ""}">${aiSettings.enabled ? "已开启" : "未开启"}</span>
              <span class="better-settings__ai-master-track">
                <span class="better-settings__ai-master-thumb"></span>
              </span>
            </span>
          </label>
        </div>
        <div class="better-settings__ai-body">
          <details class="better-settings__collapsible-section" data-connection-config="ai"${uiState.aiConnectionConfigOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__connection-title">接入配置 ${renderAiConnectionDot("ai", aiSettings)}</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__field">
              <span class="better-settings__field-title">服务商类型</span>
              <select class="better-settings__select better-settings__ai-provider">
                ${renderAiProviderOptions()}
              </select>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">Base URL</span>
              <input class="better-settings__text-input better-settings__ai-base-url" name="better-xiaoheihe-ai-base-url" type="url" value="${escapeHtml(aiSettings.baseUrl)}" autocomplete="section-better-xiaoheihe-ai username" placeholder="https://api.openai.com/v1">
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">
                模型
                <button class="better-settings__text-button better-settings__ai-fetch-models" type="button">拉取模型</button>
              </span>
              <div class="better-settings__ai-model-combobox">
                <input class="better-settings__text-input better-settings__ai-model" name="better-xiaoheihe-ai-model" type="text" value="${escapeHtml(aiSettings.model)}" autocomplete="off" placeholder="gpt-4.1-mini">
                <button class="better-settings__ai-model-dropdown" type="button" aria-label="选择已拉取模型" aria-expanded="false" disabled></button>
                <div class="better-settings__ai-model-menu" role="listbox" hidden></div>
              </div>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">API Key</span>
              <div class="better-settings__connection-input">
                <div class="better-settings__secret-input">
                  <input class="better-settings__text-input better-settings__ai-api-key" name="better-xiaoheihe-ai-api-key" type="password" value="${escapeHtml(aiSettings.apiKey)}" autocomplete="section-better-xiaoheihe-ai current-password" placeholder="sk-...">
                  <button class="better-settings__secret-toggle" type="button" data-secret-input=".better-settings__ai-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button>
                </div>
                <button class="better-settings__primary better-settings__connection-test better-settings__ai-test" type="button">测试连通</button>
              </div>
            </label>
            <div class="better-settings__config-actions">
              <span class="better-settings__message" role="status">${isAiConfigured() ? "已配置" : "请填写 Base URL 和模型"}</span>
            </div>
          </details>
          <details class="better-settings__collapsible-section better-settings__ai-prompt-section" data-ai-prompt-section${uiState.aiPromptSettingsOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary better-settings__ai-prompt-summary">
              <span class="better-settings__connection-title">提示词设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <div class="better-settings__ai-prompt-expand-body">
              <div class="better-settings__ai-prompt-guide">
                <span class="better-settings__ai-prompt-guide-icon" aria-hidden="true">AI</span>
                <span>提示词会与帖子正文及评论一起发送给当前配置的 AI 服务商。</span>
              </div>
              <label class="better-settings__field better-settings__ai-prompt-field">
                <span class="better-settings__field-title">
                  <span>总结提示词</span>
                  <span class="better-settings__ai-prompt-count">${escapeHtml(promptLength)} 字</span>
                </span>
                <textarea class="better-settings__textarea better-settings__ai-summary-prompt" placeholder="描述希望 AI 如何总结帖子和评论区">${escapeHtml(aiSettings.summaryPrompt)}</textarea>
              </label>
              <div class="better-settings__ai-prompt-options">
                <label class="better-settings__ai-prompt-option">
                  <span class="better-settings__ai-prompt-option-copy">
                    <span class="better-settings__ai-prompt-option-title">允许表情</span>
                    <span class="better-settings__ai-prompt-option-desc">允许总结中使用小黑盒表情</span>
                  </span>
                  <input class="better-settings__ai-allow-emoji" type="checkbox"${aiSettings.allowEmoji ? " checked" : ""}>
                  <span class="better-settings__ai-prompt-option-switch" aria-hidden="true"><span></span></span>
                </label>
                <label class="better-settings__ai-prompt-option">
                  <span class="better-settings__ai-prompt-option-copy">
                    <span class="better-settings__ai-prompt-option-title">自动弹出</span>
                    <span class="better-settings__ai-prompt-option-desc">总结完成后自动打开结果窗口</span>
                  </span>
                  <input class="better-settings__ai-auto-popup" type="checkbox"${aiSettings.autoPopup ? " checked" : ""}>
                  <span class="better-settings__ai-prompt-option-switch" aria-hidden="true"><span></span></span>
                </label>
              </div>
              <div class="better-settings__ai-prompt-footer">
                <span class="better-settings__ai-prompt-footer-note">修改内容会即时保存</span>
                <button class="better-settings__ai-prompt-reset better-settings__ai-reset-prompt" type="button">恢复默认提示词</button>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
  }
