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
      <div class="better-settings__scope-tabs" role="tablist" aria-label="屏蔽类型">
        <button class="better-settings__scope-tab" type="button" role="tab" data-blocked-scope="${BLOCKED_KEYWORD_SCOPES.FEED}" aria-selected="${activeScope === BLOCKED_KEYWORD_SCOPES.FEED ? "true" : "false"}">帖子</button>
        <button class="better-settings__scope-tab" type="button" role="tab" data-blocked-scope="${BLOCKED_KEYWORD_SCOPES.COMMENT}" aria-selected="${activeScope === BLOCKED_KEYWORD_SCOPES.COMMENT ? "true" : "false"}">评论</button>
      </div>
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

  function renderFeedLayoutSettingsPanelContent() {
    const layout = feedLayoutSettings;
    const commentWidth = 100 - layout.postWidth;

    return `
      <div class="better-settings__section better-settings__layout-section">
        <div class="better-settings__section-title">信息流布局</div>
        <div class="better-settings__desc">首页、话题、搜索、用户主页和收藏等信息流统一使用此配置。</div>
        <div class="better-settings__layout-control">
          <div class="better-settings__layout-control-header">
            <span>帖子 + 评论区总宽度</span>
            <output class="better-settings__layout-total-value">${layout.totalWidth}%</output>
          </div>
          <input class="better-settings__layout-range better-settings__layout-total-range" type="range" min="${FEED_LAYOUT_TOTAL_WIDTH_MIN}" max="${FEED_LAYOUT_TOTAL_WIDTH_MAX}" step="1" value="${layout.totalWidth}">
          <div class="better-settings__layout-scale"><span>${FEED_LAYOUT_TOTAL_WIDTH_MIN}%</span><span>${FEED_LAYOUT_TOTAL_WIDTH_MAX}%</span></div>
        </div>
        <div class="better-settings__layout-control">
          <div class="better-settings__layout-control-header">
            <span>帖子 / 评论区宽度占比</span>
            <output class="better-settings__layout-ratio-value">帖子 ${layout.postWidth}% · 评论 ${commentWidth}%</output>
          </div>
          <input class="better-settings__layout-range better-settings__layout-post-range" type="range" min="${FEED_LAYOUT_POST_WIDTH_MIN}" max="${FEED_LAYOUT_POST_WIDTH_MAX}" step="1" value="${layout.postWidth}">
          <div class="better-settings__layout-scale"><span>评论更宽</span><span>帖子更宽</span></div>
        </div>
        <div class="better-settings__layout-preview" style="--better-layout-preview-total: ${layout.totalWidth}%; --better-layout-preview-post: ${layout.postWidth}%; --better-layout-preview-comment: ${commentWidth}%" aria-hidden="true">
          <span class="better-settings__layout-preview-post">帖子</span>
          <span class="better-settings__layout-preview-comment">评论区</span>
        </div>
        <button class="better-settings__text-button better-settings__layout-reset" type="button">恢复默认值</button>
      </div>
    `;
  }

  function renderSettingsPanel() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    if (!panel) {
      return;
    }

    panel.innerHTML = `
      <div class="better-settings__tabs" role="tablist" aria-label="设置分类">
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.GENERAL}" aria-selected="${activeSettingsTab === SETTINGS_TABS.GENERAL ? "true" : "false"}">通用</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.BLOCKED}" aria-selected="${activeSettingsTab === SETTINGS_TABS.BLOCKED ? "true" : "false"}">屏蔽</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AI}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AI ? "true" : "false"}">AI 总结</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AIBOT}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AIBOT ? "true" : "false"}">AI Bot</button>
      </div>
      ${activeSettingsTab === SETTINGS_TABS.AI
        ? renderAiSettingsPanelContent()
        : (activeSettingsTab === SETTINGS_TABS.GENERAL
          ? renderFeedLayoutSettingsPanelContent()
          : (activeSettingsTab === SETTINGS_TABS.AIBOT
            ? renderAiBotSettingsPanelContent()
            : (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS ? renderAiBotLogsPanelContent() : renderBlockedSettingsPanelContent())))}
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

