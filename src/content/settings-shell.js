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
      <a class="better-settings__project-link" href="https://github.com/k1m0206/better-XiaoHeiHe" target="_blank" rel="noopener noreferrer" aria-label="在 GitHub 查看 better-XiaoHeiHe 开源项目">
        <span class="better-settings__project-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.22.7-3.9-1.36-3.9-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.3-5.27-1.29-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.5 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.03c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z"/>
          </svg>
        </span>
        <span class="better-settings__project-content">
          <span class="better-settings__project-title">开源项目</span>
          <span class="better-settings__project-repo">k1m0206/better-XiaoHeiHe</span>
          <span class="better-settings__project-desc">查看源码、提交反馈或参与贡献</span>
        </span>
        <span class="better-settings__project-arrow" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M7 5h8v8M15 5 6 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </a>
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

