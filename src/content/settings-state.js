// 设置面板状态、关键词和 AI 连接状态。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function hasBlockedKeyword(keyword, scope) {
    const normalized = normalizeBlockedKeyword(keyword).toLowerCase();
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    return blockedKeywords.some((item) => {
      return item.keyword.toLowerCase() === normalized && normalizeBlockedKeywordScope(item.scope) === normalizedScope;
    });
  }

  function setActiveBlockedKeywordScope(scope) {
    activeBlockedKeywordScope = normalizeBlockedKeywordScope(scope);
    activeSettingsTab = SETTINGS_TABS.BLOCKED;
    renderSettingsPanel();
  }

  function setActiveSettingsTab(tab) {
    const blockedScopes = [SETTINGS_TABS.FEED, SETTINGS_TABS.COMMENT];
    const standaloneTabs = [
      SETTINGS_TABS.BLOCKED,
      SETTINGS_TABS.GENERAL,
      SETTINGS_TABS.AI,
      ...(AI_BOT_FEATURE_ENABLED ? [SETTINGS_TABS.AIBOT, SETTINGS_TABS.AIBOT_LOGS] : [])
    ];
    if (blockedScopes.includes(tab)) {
      activeBlockedKeywordScope = normalizeBlockedKeywordScope(tab);
      activeSettingsTab = SETTINGS_TABS.BLOCKED;
    } else {
      activeSettingsTab = standaloneTabs.includes(tab) ? tab : SETTINGS_TABS.GENERAL;
    }
    renderSettingsPanel();
    if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
      loadEmojis().then(() => {
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          refreshAiBotLogsPanel();
        }
      });
      startAiBotLogAutoRefresh();
    } else {
      stopAiBotLogAutoRefresh();
    }
  }

  function addBlockedKeyword(keyword, scope = BLOCKED_KEYWORD_SCOPES.COMMENT) {
    const normalized = normalizeBlockedKeyword(keyword);
    if (!normalized) {
      return;
    }

    writeBlockedKeywordsState([...blockedKeywords, {
      keyword: normalized,
      count: 0,
      scope: normalizeBlockedKeywordScope(scope)
    }]);
    renderSettingsPanel();
    scheduleKeywordFiltersRefresh();
  }

  function addFeedBlockedKeywordFromTopic(topicText) {
    const normalized = normalizeBlockedKeyword(topicText);
    if (!normalized) {
      return;
    }

    if (hasBlockedKeyword(normalized, BLOCKED_KEYWORD_SCOPES.FEED)) {
      scheduleKeywordFiltersRefresh();
      return;
    }

    addBlockedKeyword(normalized, BLOCKED_KEYWORD_SCOPES.FEED);
  }

  function removeBlockedKeyword(keyword, scope = BLOCKED_KEYWORD_SCOPES.COMMENT) {
    const normalized = normalizeBlockedKeyword(keyword).toLowerCase();
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    writeBlockedKeywordsState(blockedKeywords.filter((item) => {
      return item.keyword.toLowerCase() !== normalized || normalizeBlockedKeywordScope(item.scope) !== normalizedScope;
    }));
    renderSettingsPanel();
    scheduleKeywordFiltersRefresh();
  }

  function updateLevelFilter(scope, nextFilter, options = {}) {
    const shouldRender = options.render !== false;
    const shouldRefresh = options.refresh !== false;
    writeLevelFilterState(scope, nextFilter, {
      persist: options.persist
    });
    if (shouldRender) {
      renderSettingsPanel();
    }
    if (shouldRefresh) {
      scheduleKeywordFiltersRefresh();
    }
  }

  function positionSettingsPanel(panel, button) {
    const rect = button.getBoundingClientRect();
    const margin = 8;
    const availableBelow = window.innerHeight - rect.bottom - margin * 2;
    const availableAbove = rect.top - margin * 2;
    const shouldOpenAbove = availableBelow < 320 && availableAbove > availableBelow;
    const maxPanelHeight = Math.max(240, shouldOpenAbove ? availableAbove : availableBelow);
    panel.style.maxHeight = `${maxPanelHeight}px`;
    const left = Math.min(window.innerWidth - panel.offsetWidth - margin, Math.max(margin, rect.right - panel.offsetWidth));
    const top = shouldOpenAbove
      ? Math.max(margin, rect.top - panel.offsetHeight - margin)
      : Math.min(rect.bottom + margin, window.innerHeight - panel.offsetHeight - margin);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    const list = panel.querySelector(".better-settings__list");
    if (!list) {
      return;
    }

    list.style.maxHeight = "";
    const listRect = list.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const availableListHeight = panelRect.bottom - listRect.top - margin;
    list.style.maxHeight = `${Math.max(120, availableListHeight)}px`;
  }

  function repositionSettingsPanelIfOpen() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!panel || panel.hidden || !button) {
      return;
    }

    positionSettingsPanel(panel, button);
  }

  function getAiSettingsFormValues(panel) {
    return normalizeAiSettings({
      enabled: panel.querySelector(".better-settings__ai-enabled")?.checked,
      provider: panel.querySelector(".better-settings__ai-provider")?.value,
      baseUrl: panel.querySelector(".better-settings__ai-base-url")?.value,
      model: panel.querySelector(".better-settings__ai-model")?.value,
      apiKey: panel.querySelector(".better-settings__ai-api-key")?.value,
      allowEmoji: panel.querySelector(".better-settings__ai-allow-emoji")?.checked !== false,
      autoPopup: panel.querySelector(".better-settings__ai-auto-popup")?.checked !== false,
      summaryPrompt: panel.querySelector(".better-settings__ai-summary-prompt")?.value
    });
  }

  function getAiConnectionFingerprint(settings) {
    return [
      settings?.provider || "",
      settings?.baseUrl || "",
      settings?.model || "",
      settings?.apiKey || ""
    ].join("\n");
  }

  function getAiConnectionState(scope, settings) {
    const fingerprint = getAiConnectionFingerprint(settings);
    const status = aiConnectionStatus[scope] || { state: "idle", fingerprint: "" };
    return status.fingerprint === fingerprint ? status.state : "idle";
  }

  function renderAiConnectionDot(scope, settings) {
    const state = getAiConnectionState(scope, settings);
    const className = state === "ok"
      ? "better-settings__connection-dot is-ok"
      : (state === "error" ? "better-settings__connection-dot is-error" : "better-settings__connection-dot");
    const title = state === "ok"
      ? "接入状态：连通"
      : (state === "error" ? "接入状态：失败" : "接入状态：未测试");
    return `<span class="${className}" data-ai-connection-status="${escapeHtml(scope)}" title="${escapeHtml(title)}"></span>`;
  }

  function syncAiConnectionDot(scope, settings) {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const dot = panel?.querySelector(`[data-ai-connection-status="${scope}"]`);
    const button = panel?.querySelector(scope === "aiBot"
      ? ".better-settings__ai-bot-test"
      : ".better-settings__ai-test");
    const state = getAiConnectionState(scope, settings || (scope === "aiBot" ? aiBotSettings : aiSettings));
    const title = state === "ok"
      ? "接入状态：连通"
      : (state === "error" ? "接入状态：失败" : "接入状态：未测试");

    if (dot) {
      dot.classList.toggle("is-ok", state === "ok");
      dot.classList.toggle("is-error", state === "error");
      dot.title = title;
    }
    if (button) {
      button.classList.toggle("is-ok", state === "ok");
      button.classList.toggle("is-error", state === "error");
      button.title = title;
    }
  }

  function setAiConnectionStatus(scope, state, settings) {
    const nextSettings = settings || (scope === "aiBot" ? aiBotSettings : aiSettings);
    aiConnectionStatus[scope] = {
      state,
      fingerprint: getAiConnectionFingerprint(nextSettings)
    };
    syncAiConnectionDot(scope, nextSettings);
  }

  function saveAiSettingsFromPanel(panel) {
    const nextSettings = getAiSettingsFormValues(panel);
    const shouldClearSummaryCache = [
      "enabled",
      "provider",
      "baseUrl",
      "model",
      "apiKey",
      "allowEmoji",
      "summaryPrompt"
    ].some((key) => nextSettings[key] !== aiSettings[key]);
    aiSettings = nextSettings;
    syncAiConnectionDot("ai", nextSettings);
    if (shouldClearSummaryCache) {
      aiSummaryCache.clear();
    }
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_SAVE_EVENT, {
      detail: JSON.stringify(nextSettings)
    }));
    syncAiSummaryButtons();
    const status = panel.querySelector(".better-settings__message");
    if (status) {
      status.textContent = "已保存";
      status.style.color = "#8a9299";
    }
    const statusPill = panel.querySelector(".better-settings__ai-status");
    if (statusPill) {
      statusPill.textContent = nextSettings.enabled ? "已开启" : "未开启";
      statusPill.classList.toggle("is-on", nextSettings.enabled);
    }
  }

  function syncAutoHeightTextarea(textarea) {
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 240 ? "auto" : "hidden";
  }

  function syncSettingsAutoHeightTextareas(panel) {
    panel?.querySelectorAll(".better-settings__textarea").forEach(syncAutoHeightTextarea);
  }

  function renderAiProviderOptions() {
    const options = [
      [AI_PROVIDERS.OPENAI_COMPATIBLE, "OpenAI Compatible · Chat Completions"],
      [AI_PROVIDERS.OPENAI_RESPONSES, "OpenAI · Responses"],
      [AI_PROVIDERS.ANTHROPIC, "Anthropic · Messages"],
      [AI_PROVIDERS.GEMINI, "Gemini · Generate Content"]
    ];
    return options.map(([value, label]) => `
      <option value="${escapeHtml(value)}"${aiSettings.provider === value ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

