// 设置面板整体内容渲染。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function renderBlockedSettingsPanelContent() {
    const activeScope = normalizeBlockedKeywordScope(activeBlockedKeywordScope);
    const visibleBlockedKeywords = blockedKeywords.filter((item) => normalizeBlockedKeywordScope(item.scope) === activeScope);
    const activeLevelFilter = levelFilters[activeScope] || createDefaultLevelFilter();
    const activeLevelLabel = getLevelFilterLabel(activeLevelFilter.maxLevel);
    const listHtml = visibleBlockedKeywords.length
      ? `<div class="better-settings__list">
          ${visibleBlockedKeywords.map((item) => `
            <div class="better-settings__keyword">
              <span class="better-settings__keyword-scope">${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[normalizeBlockedKeywordScope(item.scope)])}</span>
              <span class="better-settings__keyword-text" title="${escapeHtml(item.keyword)}">${escapeHtml(item.keyword)}</span>
              <span class="better-settings__keyword-actions">
                <span class="better-settings__keyword-count" title="屏蔽生效次数">${escapeHtml(item.count)} 次</span>
                <button class="better-settings__remove" type="button" data-keyword="${escapeHtml(item.keyword)}" data-scope="${escapeHtml(normalizeBlockedKeywordScope(item.scope))}" aria-label="删除关键词 ${escapeHtml(item.keyword)}">×</button>
              </span>
            </div>
          `).join("")}
        </div>`
      : `<div class="better-settings__empty">暂无${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}屏蔽关键词</div>`;

    return `
      <div class="better-settings__section">
        <div class="better-settings__level-row">
          <span class="better-settings__section-title">等级过滤</span>
          <label class="better-settings__level-toggle">
            <input class="better-settings__level-enabled" type="checkbox" data-scope="${escapeHtml(activeScope)}"${activeLevelFilter.enabled ? " checked" : ""}>
            <span class="better-settings__level-switch" aria-hidden="true"></span>
          </label>
        </div>
        <div class="better-settings__level-row">
          <span class="better-settings__level-value">展示 ${escapeHtml(activeLevelLabel)} 及以上${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}</span>
        </div>
        <input class="better-settings__level-range" type="range" min="${LEVEL_FILTER_MIN}" max="${LEVEL_FILTER_MAX}" step="1" value="${escapeHtml(activeLevelFilter.maxLevel)}" data-scope="${escapeHtml(activeScope)}">
      </div>
      <div class="better-settings__section">
        <div class="better-settings__section-title">屏蔽关键词</div>
        <div class="better-settings__desc">评论关键词隐藏评论；帖子关键词同时匹配标题、正文和分区/话题，命中后隐藏整条帖子。</div>
        <form class="better-settings__form">
          <input class="better-settings__input" type="text" placeholder="输入关键词">
          <button class="better-settings__add" type="submit">添加</button>
        </form>
        ${listHtml}
      </div>
    `;
  }

  function renderSettingsPanel() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    if (!panel) {
      return;
    }

    panel.innerHTML = `
      <div class="better-settings__tabs" role="tablist" aria-label="屏蔽范围">
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.FEED}" aria-selected="${activeSettingsTab === SETTINGS_TABS.FEED ? "true" : "false"}">帖子</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.COMMENT}" aria-selected="${activeSettingsTab === SETTINGS_TABS.COMMENT ? "true" : "false"}">评论</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AI}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AI ? "true" : "false"}">AI 总结</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AIBOT}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AIBOT ? "true" : "false"}">AI Bot</button>
      </div>
      ${activeSettingsTab === SETTINGS_TABS.AI
        ? renderAiSettingsPanelContent()
        : (activeSettingsTab === SETTINGS_TABS.AIBOT
          ? renderAiBotSettingsPanelContent()
          : (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS ? renderAiBotLogsPanelContent() : renderBlockedSettingsPanelContent()))}
    `;
    syncSettingsAutoHeightTextareas(panel);
    if (activeSettingsTab === SETTINGS_TABS.AI) {
      syncAiConnectionDot("ai", aiSettings);
      loadCachedAiModelOptions(panel);
    }
    if (activeSettingsTab === SETTINGS_TABS.AIBOT) {
      syncAiConnectionDot("aiBot", aiBotSettings);
      loadCachedAiBotModelOptions(panel);
    }
    repositionSettingsPanelIfOpen();
  }

