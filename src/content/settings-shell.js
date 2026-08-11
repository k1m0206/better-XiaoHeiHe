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
          <label class="better-settings__ai-master-toggle" title="${activeLevelFilter.enabled ? "关闭" : "开启"}${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}等级过滤">
            <input class="better-settings__level-enabled" type="checkbox" data-scope="${escapeHtml(activeScope)}" aria-label="${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}等级过滤"${activeLevelFilter.enabled ? " checked" : ""}>
            <span class="better-settings__ai-master-control" aria-hidden="true">
              <span class="better-settings__ai-status${activeLevelFilter.enabled ? " is-on" : ""}">${activeLevelFilter.enabled ? "已开启" : "未开启"}</span>
              <span class="better-settings__ai-master-track">
                <span class="better-settings__ai-master-thumb"></span>
              </span>
            </span>
          </label>
        </div>
        <div class="better-settings__level-row">
          <span class="better-settings__level-value">展示 ${escapeHtml(activeLevelLabel)} 及以上${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}</span>
        </div>
        <input class="better-settings__level-range" type="range" min="${LEVEL_FILTER_MIN}" max="${LEVEL_FILTER_MAX}" step="1" value="${escapeHtml(activeLevelFilter.maxLevel)}" data-scope="${escapeHtml(activeScope)}">
      </div>
      ${activeScope === BLOCKED_KEYWORD_SCOPES.FEED ? `
        <div class="better-settings__section">
          <div class="better-settings__level-row">
            <span class="better-settings__section-title">屏蔽视频帖子</span>
            <label class="better-settings__ai-master-toggle" title="${videoPostsBlocked ? "关闭" : "开启"}视频帖子屏蔽">
              <input class="better-settings__video-posts-toggle" type="checkbox" aria-label="屏蔽视频帖子"${videoPostsBlocked ? " checked" : ""}>
              <span class="better-settings__ai-master-control" aria-hidden="true">
                <span class="better-settings__ai-status${videoPostsBlocked ? " is-on" : ""}">${videoPostsBlocked ? "已开启" : "未开启"}</span>
                <span class="better-settings__ai-master-track">
                  <span class="better-settings__ai-master-thumb"></span>
                </span>
              </span>
            </label>
          </div>
          <div class="better-settings__desc">隐藏视频帖子。</div>
        </div>
      ` : ""}
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
      <div class="better-settings__section better-settings__visibility-section">
        <div class="better-settings__visibility-grid">
          <div class="better-settings__visibility-item">
            <div class="better-settings__visibility-copy">
              <div class="better-settings__section-title">相似内容</div>
            </div>
            <button class="better-settings__visibility-toggle better-settings__similar-content-toggle" type="button" role="switch" aria-checked="${similarContentDisabled ? "false" : "true"}" aria-label="${similarContentDisabled ? "恢复显示相似内容" : "关闭相似内容"}" title="${similarContentDisabled ? "恢复显示相似内容" : "关闭相似内容"}">
              <span class="better-settings__level-switch" aria-hidden="true"></span>
            </button>
          </div>
          <div class="better-settings__visibility-item">
            <div class="better-settings__visibility-copy">
              <div class="better-settings__section-title">为你推荐</div>
            </div>
            <button class="better-settings__visibility-toggle better-settings__recommended-communities-toggle" type="button" role="switch" aria-checked="${recommendedCommunitiesDisabled ? "false" : "true"}" aria-label="${recommendedCommunitiesDisabled ? "恢复显示为你推荐" : "关闭为你推荐"}" title="${recommendedCommunitiesDisabled ? "恢复显示为你推荐" : "关闭为你推荐"}">
              <span class="better-settings__level-switch" aria-hidden="true"></span>
            </button>
          </div>
          <div class="better-settings__visibility-item">
            <div class="better-settings__visibility-copy">
              <div class="better-settings__section-title">黑盒热搜</div>
            </div>
            <button class="better-settings__visibility-toggle better-settings__hot-search-toggle" type="button" role="switch" aria-checked="${hotSearchDisabled ? "false" : "true"}" aria-label="${hotSearchDisabled ? "恢复显示黑盒热搜" : "关闭黑盒热搜"}" title="${hotSearchDisabled ? "恢复显示热搜" : "关闭黑盒热搜"}">
              <span class="better-settings__level-switch" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
      <div class="better-settings__external-links">
        <a class="better-settings__project-link better-settings__project-link--community" href="https://www.xiaoheihe.cn/jm56gbaa" target="_blank" rel="noopener noreferrer" aria-label="加入小黑盒插件沟通群">
          <span class="better-settings__project-icon better-settings__project-icon--community" aria-hidden="true">
            <img src="data:image/png;base64,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" alt="">
          </span>
          <span class="better-settings__project-content">
            <span class="better-settings__project-title">插件沟通群</span>
            <span class="better-settings__project-repo">小黑盒群</span>
            <span class="better-settings__project-desc">交流使用问题、功能建议与插件动态</span>
          </span>
          <span class="better-settings__project-arrow" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M7 5h8v8M15 5 6 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </a>
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
      </div>
      ${activeSettingsTab === SETTINGS_TABS.AI
        ? renderAiSettingsPanelContent()
        : (activeSettingsTab === SETTINGS_TABS.GENERAL
          ? renderFeedLayoutSettingsPanelContent()
          : renderBlockedSettingsPanelContent())}
    `;
    if (activeSettingsTab === SETTINGS_TABS.GENERAL) {
      bindFeedLayoutRangeInputs(panel);
    }
    syncSettingsAutoHeightTextareas(panel);
    if (activeSettingsTab === SETTINGS_TABS.AI) {
      syncAiConnectionDot("ai", aiSettings);
      loadCachedAiModelOptions(panel);
    }
    repositionSettingsPanelIfOpen();
  }

