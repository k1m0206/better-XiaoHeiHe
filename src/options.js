(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const AI_BOT_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-settings";
  const AI_BOT_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-logs";
  const AI_BOT_MESSAGE_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-message-logs";
  const AI_BOT_REPLY_QUEUE_STORAGE_KEY = "better-xiaoheihe-ai-bot-reply-queue";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
  const AI_BOT_DEFAULT_PROMPT = "你是小黑盒社区自动回复助手。请根据消息类型、帖子正文、评论区上下文和触发消息的那条评论，生成一条自然、友好、简洁的中文回复。可以自然使用提供的小黑盒表情短码，但不要编造未提供的短码。不要暴露你是AI，不要使用模板化开头，不要编造事实，不要输出Markdown。";
  const AI_BOT_LOG_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
  const LEVEL_FILTER_MIN = 7;
  const LEVEL_FILTER_MAX = 18;
  const BLOCKED_KEYWORD_SCOPES = {
    FEED: "feed",
    COMMENT: "comment"
  };
  const BLOCKED_KEYWORD_SCOPE_LABELS = {
    [BLOCKED_KEYWORD_SCOPES.FEED]: "帖子",
    [BLOCKED_KEYWORD_SCOPES.COMMENT]: "评论"
  };
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const AI_PROVIDERS = {
    OPENAI_COMPATIBLE: "openai-compatible",
    OPENAI_RESPONSES: "openai-responses",
    ANTHROPIC: "anthropic",
    GEMINI: "gemini"
  };
  const DEFAULT_PROVIDER = AI_PROVIDERS.OPENAI_COMPATIBLE;
  const PROVIDER_DEFAULT_BASE_URLS = {
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: "https://api.openai.com/v1",
    [AI_PROVIDERS.OPENAI_RESPONSES]: "https://api.openai.com/v1",
    [AI_PROVIDERS.ANTHROPIC]: "https://api.anthropic.com/v1",
    [AI_PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta"
  };
  const enabledInput = document.getElementById("enabled");
  const providerInput = document.getElementById("provider");
  const baseUrlInput = document.getElementById("baseUrl");
  const modelInput = document.getElementById("model");
  const modelOptions = document.getElementById("modelOptions");
  const modelDropdownButton = document.getElementById("modelDropdown");
  const modelMenu = document.getElementById("modelMenu");
  const apiKeyInput = document.getElementById("apiKey");
  const summaryPromptInput = document.getElementById("summaryPrompt");
  const resetPromptButton = document.getElementById("resetPrompt");
  const fetchModelsButton = document.getElementById("fetchModels");
  const testButton = document.getElementById("test");
  const statusElement = document.getElementById("status");
  const enabledLabel = document.getElementById("enabledLabel");
  const aiBotProviderInput = document.getElementById("aiBotProvider");
  const aiBotBaseUrlInput = document.getElementById("aiBotBaseUrl");
  const aiBotModelInput = document.getElementById("aiBotModel");
  const aiBotModelOptions = document.getElementById("aiBotModelOptions");
  const aiBotModelDropdownButton = document.getElementById("aiBotModelDropdown");
  const aiBotModelMenu = document.getElementById("aiBotModelMenu");
  const aiBotApiKeyInput = document.getElementById("aiBotApiKey");
  const aiBotPollMinutesInput = document.getElementById("aiBotPollMinutes");
  const aiBotMessageFreshMinutesInput = document.getElementById("aiBotMessageFreshMinutes");
  const aiBotReplyMentionsInput = document.getElementById("aiBotReplyMentions");
  const aiBotReplyCommentsInput = document.getElementById("aiBotReplyComments");
  const aiBotWhitelistInput = document.getElementById("aiBotWhitelist");
  const aiBotCommentPromptInput = document.getElementById("aiBotCommentPrompt");
  const aiBotResetPromptButton = document.getElementById("aiBotResetPrompt");
  const aiBotFetchModelsButton = document.getElementById("aiBotFetchModels");
  const aiBotTestButton = document.getElementById("aiBotTest");
  const aiBotRunNowButton = document.getElementById("aiBotRunNow");
  const aiBotViewLogsButton = document.getElementById("aiBotViewLogs");
  const aiBotStatusElement = document.getElementById("aiBotStatus");
  const aiBotLogsElement = document.getElementById("aiBotLogs");
  const aiBotMessageLogsElement = document.getElementById("aiBotMessageLogs");
  const aiBotPendingMessagesElement = document.getElementById("aiBotPendingMessages");
  const aiBotClearLogsButton = document.getElementById("aiBotClearLogs");
  const aiBotBackSettingsButton = document.getElementById("aiBotBackSettings");
  const aiBotRefreshLogsButton = document.getElementById("aiBotRefreshLogs");
  const aiBotLogStatusElement = document.getElementById("aiBotLogStatus");
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  let blockedKeywords = [];
  let levelFilters = normalizeLevelFilters({});
  let aiBotLogRefreshTimer = null;
  let activeAiBotLogView = "runtime";
  const expandedAiBotLogIds = new Set();
  const connectionStatus = {
    ai: { state: "idle", fingerprint: "" },
    aiBot: { state: "idle", fingerprint: "" }
  };

  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_PROVIDER;
  }

  function normalizeBlockedKeyword(keyword) {
    return String(keyword || "").trim();
  }

  function normalizeBlockedKeywordScope(scope) {
    return Object.values(BLOCKED_KEYWORD_SCOPES).includes(scope)
      ? scope
      : BLOCKED_KEYWORD_SCOPES.COMMENT;
  }

  function normalizeBlockedKeywords(keywords) {
    const seen = new Set();
    return (Array.isArray(keywords) ? keywords : [])
      .map((item) => {
        const keyword = normalizeBlockedKeyword(typeof item === "string" ? item : item?.keyword);
        const count = Math.max(0, Number.parseInt(typeof item === "object" && item ? item.count : 0, 10) || 0);
        const scope = normalizeBlockedKeywordScope(typeof item === "object" && item ? item.scope : null);
        return { keyword, count, scope };
      })
      .filter((item) => {
        const key = `${item.scope}:${item.keyword.toLowerCase()}`;
        if (!item.keyword || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function createDefaultLevelFilter() {
    return {
      enabled: false,
      maxLevel: LEVEL_FILTER_MIN
    };
  }

  function normalizeLevelFilter(filter) {
    const normalized = createDefaultLevelFilter();
    if (!filter || typeof filter !== "object") {
      return normalized;
    }

    const maxLevel = Number.parseInt(filter.maxLevel, 10);
    normalized.enabled = filter.enabled === true || filter.enabled === "1" || filter.enabled === "true";
    normalized.maxLevel = Math.min(LEVEL_FILTER_MAX, Math.max(LEVEL_FILTER_MIN, Number.isFinite(maxLevel) ? maxLevel : LEVEL_FILTER_MIN));
    return normalized;
  }

  function normalizeLevelFilters(filters) {
    return Object.values(BLOCKED_KEYWORD_SCOPES).reduce((result, scope) => {
      result[scope] = normalizeLevelFilter(filters?.[scope]);
      return result;
    }, {});
  }

  function getLevelFilterLabel(maxLevel) {
    return `Lv.${Math.min(LEVEL_FILTER_MAX, Math.max(LEVEL_FILTER_MIN, Number.parseInt(maxLevel, 10) || LEVEL_FILTER_MIN))}`;
  }

  function saveBlockedKeywords() {
    chrome.storage.local.set({
      [BLOCKED_KEYWORDS_STORAGE_KEY]: blockedKeywords
    });
  }

  function saveLevelFilters() {
    chrome.storage.local.set({
      [LEVEL_FILTERS_STORAGE_KEY]: levelFilters
    });
  }

  function renderLevelFilter(scope) {
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    const filter = levelFilters[normalizedScope] || createDefaultLevelFilter();
    const enabledInput = document.querySelector(`.level-enabled[data-scope="${normalizedScope}"]`);
    const rangeInput = document.querySelector(`.level-range[data-scope="${normalizedScope}"]`);
    const valueLabel = document.getElementById(`${normalizedScope}LevelValue`);

    if (enabledInput) {
      enabledInput.checked = filter.enabled;
    }
    if (rangeInput) {
      rangeInput.value = filter.maxLevel;
    }
    if (valueLabel) {
      valueLabel.textContent = `展示 ${getLevelFilterLabel(filter.maxLevel)} 及以上${BLOCKED_KEYWORD_SCOPE_LABELS[normalizedScope]}`;
    }
  }

  function renderKeywordList(scope) {
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    const list = document.querySelector(`.keyword-list[data-scope="${normalizedScope}"]`);
    if (!list) {
      return;
    }

    const keywords = blockedKeywords.filter((item) => normalizeBlockedKeywordScope(item.scope) === normalizedScope);
    list.innerHTML = "";
    if (!keywords.length) {
      const empty = document.createElement("div");
      empty.className = "keyword-empty";
      empty.textContent = `暂无${BLOCKED_KEYWORD_SCOPE_LABELS[normalizedScope]}屏蔽关键词`;
      list.appendChild(empty);
      return;
    }

    keywords.forEach((item) => {
      const row = document.createElement("div");
      row.className = "keyword-item";

      const scopePill = document.createElement("span");
      scopePill.className = "keyword-scope";
      scopePill.textContent = BLOCKED_KEYWORD_SCOPE_LABELS[normalizedScope];

      const text = document.createElement("span");
      text.className = "keyword-text";
      text.title = item.keyword;
      text.textContent = item.keyword;

      const count = document.createElement("span");
      count.className = "keyword-count";
      count.title = "屏蔽生效次数";
      count.textContent = `${Math.max(0, Number.parseInt(item.count, 10) || 0)} 次`;

      const remove = document.createElement("button");
      remove.className = "keyword-remove";
      remove.type = "button";
      remove.dataset.keyword = item.keyword;
      remove.dataset.scope = normalizedScope;
      remove.setAttribute("aria-label", `删除关键词 ${item.keyword}`);
      remove.textContent = "×";

      row.append(scopePill, text, count, remove);
      list.appendChild(row);
    });
  }

  function renderLocalSettings() {
    Object.values(BLOCKED_KEYWORD_SCOPES).forEach((scope) => {
      renderLevelFilter(scope);
      renderKeywordList(scope);
    });
  }

  function loadLocalSettings() {
    chrome.storage.local.get([BLOCKED_KEYWORDS_STORAGE_KEY, LEVEL_FILTERS_STORAGE_KEY], (result) => {
      blockedKeywords = normalizeBlockedKeywords(result?.[BLOCKED_KEYWORDS_STORAGE_KEY]);
      levelFilters = normalizeLevelFilters(result?.[LEVEL_FILTERS_STORAGE_KEY]);
      renderLocalSettings();
    });
  }

  function addBlockedKeyword(keyword, scope) {
    const normalized = normalizeBlockedKeyword(keyword);
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    if (!normalized) {
      return;
    }

    const exists = blockedKeywords.some((item) => {
      return normalizeBlockedKeywordScope(item.scope) === normalizedScope
        && item.keyword.toLowerCase() === normalized.toLowerCase();
    });
    if (exists) {
      renderKeywordList(normalizedScope);
      return;
    }

    blockedKeywords = normalizeBlockedKeywords([...blockedKeywords, {
      keyword: normalized,
      count: 0,
      scope: normalizedScope
    }]);
    saveBlockedKeywords();
    renderKeywordList(normalizedScope);
  }

  function removeBlockedKeyword(keyword, scope) {
    const normalized = normalizeBlockedKeyword(keyword).toLowerCase();
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    blockedKeywords = blockedKeywords.filter((item) => {
      return normalizeBlockedKeywordScope(item.scope) !== normalizedScope
        || item.keyword.toLowerCase() !== normalized;
    });
    saveBlockedKeywords();
    renderKeywordList(normalizedScope);
  }

  function updateLevelFilter(scope, nextFilter) {
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    levelFilters = normalizeLevelFilters({
      ...levelFilters,
      [normalizedScope]: {
        ...levelFilters[normalizedScope],
        ...nextFilter
      }
    });
    saveLevelFilters();
    renderLevelFilter(normalizedScope);
  }

  function setActiveTab(tab) {
    const nextTab = tab === "ai" || tab === "aibot" || tab === "aibot-logs" ? tab : normalizeBlockedKeywordScope(tab);
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === nextTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    tabPanels.forEach((panel) => {
      const isActive = panel.dataset.panel === nextTab;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
    if (nextTab === "ai") {
      loadCachedModelOptions();
    }
    if (nextTab === "aibot") {
      refreshAiBotStatus();
      loadCachedAiBotModelOptions();
    }
    if (nextTab === "aibot-logs") {
      startAiBotLogAutoRefresh();
      setAiBotLogView(activeAiBotLogView);
    } else {
      stopAiBotLogAutoRefresh();
    }
  }

  function normalizeAiSettings(settings) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: String(settings?.baseUrl || PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function normalizeIdList(value) {
    return [...new Set((Array.isArray(value) ? value : String(value || "").split(/[\s,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter(Boolean))];
  }

  function normalizeAiBotSettings(settings) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    const isEnabled = settings?.enabled === true;
    const replyMentions = isEnabled && settings?.replyMentions !== false;
    const replyComments = isEnabled && settings?.replyComments === true;
    return {
      enabled: replyMentions || replyComments,
      provider,
      endpointMode: provider,
      baseUrl: String(settings?.baseUrl || PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      pollMinutes: Math.max(1, Number.parseInt(settings?.pollMinutes, 10) || 1),
      messageFreshMinutes: Math.max(1, Number.parseInt(settings?.messageFreshMinutes, 10) || 5),
      replyMentions,
      replyComments,
      whitelistUserIds: normalizeIdList(settings?.whitelistUserIds || settings?.whitelistText),
      commentPrompt: String(settings?.commentPrompt || "").trim() || AI_BOT_DEFAULT_PROMPT
    };
  }

  function getFormSettings() {
    return normalizeAiSettings({
      enabled: enabledInput.checked,
      provider: providerInput.value,
      baseUrl: baseUrlInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput.value,
      summaryPrompt: summaryPromptInput.value
    });
  }

  function getAiBotFormSettings() {
    return normalizeAiBotSettings({
      enabled: aiBotReplyMentionsInput.checked || aiBotReplyCommentsInput.checked,
      provider: aiBotProviderInput.value,
      baseUrl: aiBotBaseUrlInput.value,
      model: aiBotModelInput.value,
      apiKey: aiBotApiKeyInput.value,
      pollMinutes: aiBotPollMinutesInput.value,
      messageFreshMinutes: aiBotMessageFreshMinutesInput.value,
      replyMentions: aiBotReplyMentionsInput.checked,
      replyComments: aiBotReplyCommentsInput.checked,
      whitelistText: aiBotWhitelistInput.value,
      commentPrompt: aiBotCommentPromptInput.value
    });
  }

  function getConnectionFingerprint(settings) {
    return [
      settings?.provider || "",
      settings?.baseUrl || "",
      settings?.model || "",
      settings?.apiKey || ""
    ].join("\n");
  }

  function getConnectionSettings(scope) {
    return scope === "aiBot" ? getAiBotFormSettings() : getFormSettings();
  }

  function syncConnectionDot(scope) {
    const dot = document.querySelector(`[data-connection-status="${scope}"]`);
    if (!dot) {
      return;
    }
    const currentFingerprint = getConnectionFingerprint(getConnectionSettings(scope));
    const state = connectionStatus[scope]?.fingerprint === currentFingerprint
      ? connectionStatus[scope].state
      : "idle";
    dot.classList.toggle("is-ok", state === "ok");
    dot.classList.toggle("is-error", state === "error");
    dot.title = state === "ok"
      ? "接入状态：连通"
      : (state === "error" ? "接入状态：失败" : "接入状态：未测试");
  }

  function setConnectionStatus(scope, state) {
    connectionStatus[scope] = {
      state,
      fingerprint: getConnectionFingerprint(getConnectionSettings(scope))
    };
    syncConnectionDot(scope);
  }

  function resetConnectionStatusIfChanged(scope) {
    syncConnectionDot(scope);
  }

  function setStatus(text, isError) {
    statusElement.textContent = text;
    statusElement.style.color = isError ? "#d33b4a" : "#68727d";
  }

  function syncEnabledLabel() {
    enabledLabel.textContent = enabledInput.checked ? "已开启" : "未开启";
    enabledLabel.classList.toggle("is-on", enabledInput.checked);
  }

  function saveSettings() {
    chrome.storage.local.set({
      [AI_SETTINGS_STORAGE_KEY]: getFormSettings()
    });
  }

  function saveAiBotSettings() {
    const settings = getAiBotFormSettings();
    chrome.storage.local.set({
      [AI_BOT_SETTINGS_STORAGE_KEY]: settings
    });
  }

  function fillModelOptions(models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    modelOptions.innerHTML = "";
    modelMenu.innerHTML = "";
    modelDropdownButton.disabled = !normalizedModels.length;
    setModelMenuOpen(false);

    normalizedModels.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      modelOptions.appendChild(option);

      const menuOption = document.createElement("button");
      menuOption.type = "button";
      menuOption.className = "model-option";
      menuOption.dataset.model = model;
      menuOption.textContent = model;
      menuOption.title = model;
      menuOption.setAttribute("role", "option");
      modelMenu.appendChild(menuOption);
    });
    syncSelectedModelOption();
  }

  function getModelCacheKey(settings) {
    const normalized = normalizeAiSettings(settings);
    return `${normalized.provider}:${normalized.baseUrl}`;
  }

  function getProviderModelCacheKey(settings) {
    return normalizeAiSettings(settings).provider;
  }

  function setModelMenuOpen(isOpen) {
    const open = Boolean(isOpen) && !modelDropdownButton.disabled;
    modelMenu.hidden = !open;
    modelDropdownButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggleModelMenu() {
    setModelMenuOpen(modelMenu.hidden);
  }

  function syncSelectedModelOption() {
    const value = modelInput.value.trim();
    modelMenu.querySelectorAll(".model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function selectFetchedModel(model) {
    if (!model) {
      return;
    }

    modelInput.value = model;
    syncSelectedModelOption();
    setModelMenuOpen(false);
    saveSettings();
    resetConnectionStatusIfChanged("ai");
    setStatus(`已选择模型：${model}`, false);
  }

  function fillAiBotModelOptions(models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    aiBotModelOptions.innerHTML = "";
    aiBotModelMenu.innerHTML = "";
    aiBotModelDropdownButton.disabled = !normalizedModels.length;
    setAiBotModelMenuOpen(false);

    normalizedModels.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      aiBotModelOptions.appendChild(option);

      const menuOption = document.createElement("button");
      menuOption.type = "button";
      menuOption.className = "model-option ai-bot-model-option";
      menuOption.dataset.model = model;
      menuOption.textContent = model;
      menuOption.title = model;
      menuOption.setAttribute("role", "option");
      aiBotModelMenu.appendChild(menuOption);
    });
    syncSelectedAiBotModelOption();
  }

  function setAiBotModelMenuOpen(isOpen) {
    const open = Boolean(isOpen) && !aiBotModelDropdownButton.disabled;
    aiBotModelMenu.hidden = !open;
    aiBotModelDropdownButton.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function toggleAiBotModelMenu() {
    setAiBotModelMenuOpen(aiBotModelMenu.hidden);
  }

  function syncSelectedAiBotModelOption() {
    const value = aiBotModelInput.value.trim();
    aiBotModelMenu.querySelectorAll(".ai-bot-model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function selectFetchedAiBotModel(model) {
    if (!model) {
      return;
    }

    aiBotModelInput.value = model;
    syncSelectedAiBotModelOption();
    setAiBotModelMenuOpen(false);
    saveAiBotSettings();
    resetConnectionStatusIfChanged("aiBot");
    setAiBotStatus(`已选择模型：${model}`, false);
  }

  function syncSecretToggle(input) {
    const button = document.querySelector(`[data-secret-toggle="${input?.id || ""}"]`);
    if (!button || !input) {
      return;
    }
    const isVisible = input.type === "text";
    button.textContent = isVisible ? "隐藏" : "显示";
    button.setAttribute("aria-label", isVisible ? "隐藏 API Key" : "显示 API Key");
    button.setAttribute("aria-pressed", isVisible ? "true" : "false");
  }

  function toggleSecretInput(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
      return;
    }
    input.type = input.type === "password" ? "text" : "password";
    syncSecretToggle(input);
  }

  function fillForm(settings) {
    const normalized = normalizeAiSettings(settings);
    enabledInput.checked = normalized.enabled;
    providerInput.value = normalized.provider;
    baseUrlInput.value = normalized.baseUrl;
    modelInput.value = normalized.model;
    apiKeyInput.value = normalized.apiKey;
    summaryPromptInput.value = normalized.summaryPrompt;
    syncSecretToggle(apiKeyInput);
    syncEnabledLabel();
    syncConnectionDot("ai");
    loadCachedModelOptions();
  }

  function fillAiBotForm(settings) {
    const normalized = normalizeAiBotSettings(settings);
    aiBotProviderInput.value = normalized.provider;
    aiBotBaseUrlInput.value = normalized.baseUrl;
    aiBotModelInput.value = normalized.model;
    aiBotApiKeyInput.value = normalized.apiKey;
    aiBotPollMinutesInput.value = normalized.pollMinutes;
    aiBotMessageFreshMinutesInput.value = normalized.messageFreshMinutes;
    aiBotReplyMentionsInput.checked = normalized.replyMentions;
    aiBotReplyCommentsInput.checked = normalized.replyComments;
    aiBotWhitelistInput.value = normalized.whitelistUserIds.join("\n");
    aiBotCommentPromptInput.value = normalized.commentPrompt;
    syncSecretToggle(aiBotApiKeyInput);
    syncConnectionDot("aiBot");
    loadCachedAiBotModelOptions();
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message || "请求失败"));
          return;
        }
        resolve(response || {});
      });
    });
  }

  async function testConnection() {
    const settings = getFormSettings();
    if (!settings.baseUrl || !settings.model) {
      setStatus("请先填写 Base URL 和模型", true);
      setConnectionStatus("ai", "error");
      return;
    }

    testButton.disabled = true;
    setStatus("测试中...", false);
    try {
      const response = await sendMessage({
        type: "better-xiaoheihe-ai-test",
        detail: {
          settings
        }
      });
      if (!response.ok) {
        setStatus(response.error || "连接失败", true);
        setConnectionStatus("ai", "error");
        return;
      }
      setStatus("连接成功", false);
      setConnectionStatus("ai", "ok");
      saveSettings();
    } catch (error) {
      setStatus(error?.message || "连接失败", true);
      setConnectionStatus("ai", "error");
    } finally {
      testButton.disabled = false;
    }
  }

  function setAiBotStatus(text, isError) {
    aiBotStatusElement.textContent = text;
    aiBotStatusElement.style.color = isError ? "#d33b4a" : "#68727d";
  }

  function setAiBotLogStatus(text, isError) {
    aiBotLogStatusElement.textContent = text;
    aiBotLogStatusElement.style.color = isError ? "#d33b4a" : "#68727d";
  }

  function setAiBotLogView(view) {
    activeAiBotLogView = ["message", "pending"].includes(view) ? view : "runtime";
    document.querySelectorAll("[data-ai-bot-log-view]").forEach((button) => {
      const active = button.dataset.aiBotLogView === activeAiBotLogView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    document.querySelectorAll("[data-ai-bot-log-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.aiBotLogPanel !== activeAiBotLogView;
    });
  }

  async function testAiBotConnection() {
    const settings = getAiBotFormSettings();
    if (!settings.baseUrl || !settings.model) {
      setAiBotStatus("请先填写 Base URL 和模型", true);
      setConnectionStatus("aiBot", "error");
      return;
    }

    aiBotTestButton.disabled = true;
    setAiBotStatus("测试中...", false);
    try {
      const response = await sendMessage({
        type: "better-xiaoheihe-ai-bot-test",
        detail: {
          settings
        }
      });
      if (!response.ok) {
        setAiBotStatus(response.error || "连接失败", true);
        setConnectionStatus("aiBot", "error");
        return;
      }
      setAiBotStatus("连接成功", false);
      setConnectionStatus("aiBot", "ok");
      saveAiBotSettings();
    } catch (error) {
      setAiBotStatus(error?.message || "连接失败", true);
      setConnectionStatus("aiBot", "error");
    } finally {
      aiBotTestButton.disabled = false;
    }
  }

  async function runAiBotNow() {
    aiBotRunNowButton.disabled = true;
    setAiBotStatus("正在轮询...", false);
    saveAiBotSettings();
    try {
      const response = await sendMessage({ type: "better-xiaoheihe-ai-bot-run-now" });
      if (!response.ok) {
        setAiBotStatus(response.error || "轮询失败", true);
        return;
      }
      setAiBotStatus(`轮询完成：${response.count || 0} 条消息`, false);
      renderAiBotLogsFromStorage();
    } catch (error) {
      setAiBotStatus(error?.message || "轮询失败", true);
    } finally {
      aiBotRunNowButton.disabled = false;
    }
  }

  async function refreshAiBotStatus() {
    try {
      const response = await sendMessage({ type: "better-xiaoheihe-ai-bot-status" });
      if (response.running) {
        setAiBotStatus("正在运行", false);
        return;
      }
      setAiBotStatus(response.enabled ? "等待下一次轮询" : "回复开关未开启", false);
    } catch {
      setAiBotStatus("", false);
    }
  }

  function renderAiBotLogs(logs) {
    const now = Date.now();
    const normalizedLogs = (Array.isArray(logs) ? logs : [])
      .filter((log) => Number(log?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS);
    const previousScrollTop = aiBotLogsElement.scrollTop;
    const wasNearTop = previousScrollTop <= 4;
    aiBotLogsElement.querySelectorAll(".log-detail-wrap").forEach((detail) => {
      const logId = detail.dataset.logId || "";
      if (!logId) {
        return;
      }
      if (detail.open) {
        expandedAiBotLogIds.add(logId);
      } else {
        expandedAiBotLogIds.delete(logId);
      }
    });
    aiBotLogsElement.innerHTML = "";
    if (!normalizedLogs.length) {
      const empty = document.createElement("div");
      empty.className = "log-empty";
      empty.textContent = "暂无运行日志";
      aiBotLogsElement.appendChild(empty);
      return;
    }

    normalizedLogs.forEach((log) => {
      const item = document.createElement("div");
      item.className = "log-item";
      const logId = String(log.id || log.timestamp || `${log.level || ""}:${log.message || ""}`);

      const meta = document.createElement("div");
      meta.className = "log-meta";

      const level = document.createElement("span");
      level.className = `log-level log-level--${log.level || "info"}`;
      level.textContent = {
        success: "成功",
        warn: "提醒",
        error: "错误",
        info: "信息"
      }[log.level] || "信息";

      const time = document.createElement("span");
      time.textContent = log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false });

      const message = document.createElement("div");
      message.className = "log-message";
      message.textContent = log.message || "";

      const detailEntries = Object.entries(log.detail || {})
        .filter(([, value]) => value !== undefined && value !== null && value !== "");
      const detailText = detailEntries
        .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
        .join("\n");

      meta.append(level, time);
      item.append(meta, message);
      if (detailEntries.length) {
        const detailWrap = document.createElement("details");
        detailWrap.className = "log-detail-wrap";
        detailWrap.dataset.logId = logId;
        detailWrap.open = expandedAiBotLogIds.has(logId);

        const summary = document.createElement("summary");
        summary.className = "log-detail-summary";
        summary.textContent = log.level === "error" ? "展开错误详情" : "展开日志详情";

        const copy = document.createElement("button");
        copy.className = "log-copy";
        copy.type = "button";
        copy.textContent = "复制";
        copy.dataset.copyText = [
          `[${level.textContent}] ${time.textContent}`,
          log.message || "",
          detailText
        ].filter(Boolean).join("\n");

        const detail = document.createElement("pre");
        detail.className = "log-detail";
        detail.textContent = detailText;

        detailWrap.append(summary, copy, detail);
        item.appendChild(detailWrap);
      }
      aiBotLogsElement.appendChild(item);
    });
    aiBotLogsElement.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, aiBotLogsElement.scrollHeight);
  }

  function renderAiBotMessageLogs(logs) {
    const now = Date.now();
    const normalizedLogs = (Array.isArray(logs) ? logs : [])
      .filter((log) => !log?.skipped && Number(log?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
      .sort((left, right) => Number(right?.sentTimestamp || right?.timestamp || 0) - Number(left?.sentTimestamp || left?.timestamp || 0));
    const previousScrollTop = aiBotMessageLogsElement.scrollTop;
    const wasNearTop = previousScrollTop <= 4;
    aiBotMessageLogsElement.innerHTML = "";
    if (!normalizedLogs.length) {
      const empty = document.createElement("div");
      empty.className = "log-empty";
      empty.textContent = "暂无 AI 回复记录";
      aiBotMessageLogsElement.appendChild(empty);
      return;
    }

    normalizedLogs.forEach((log) => {
      const item = document.createElement("div");
      item.className = "message-log-item" + (log.skipped ? " message-log-item--skipped" : "");

      const meta = document.createElement("div");
      meta.className = "log-meta";
      const type = document.createElement("span");
      type.className = "log-level " + (log.skipped ? "log-level--warn" : "log-level--success");
      type.textContent = log.skipped
        ? (log.skipReason === "content_moderation" ? "已跳过" : log.skipReason === "queue_expired" ? "队列超时" : log.skipReason === "send_failed" ? "发送失败" : log.skipReason === "source_disabled" ? "开关关闭" : log.skipReason === "stale" ? "已过期" : log.skipReason === "missing_target" ? "缺少目标" : "跳过")
        : (log.typeLabel || (log.messageSource === "comment" ? "评论" : "@"));
      const time = document.createElement("span");
      time.textContent = log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false });
      meta.append(type, time);

      const title = document.createElement("div");
      title.className = "message-log-title";
      title.textContent = log.linkTitle || `帖子 ${log.linkId || ""}`;

      const target = document.createElement("div");
      target.className = "message-log-target";
      target.textContent = [
        log.senderName ? `消息发送人：${log.senderName}${log.senderId ? `（${log.senderId}）` : ""}` : "",
        `消息时间：${log.messageTimeText || (log.messageTimestamp ? new Date(log.messageTimestamp).toLocaleString("zh-CN", { hour12: false }) : "未知")}`,
        `发送时间：${log.sentTimeText || log.timeText || new Date(log.sentTimestamp || log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false })}`,
        log.linkId ? `帖子ID：${log.linkId}` : "",
        log.replyCommentId ? `回复评论ID：${log.replyCommentId}` : "",
        log.commentId ? `发送评论ID：${log.commentId}` : ""
      ].filter(Boolean).join(" · ");

      const messageText = document.createElement("div");
      messageText.className = "message-log-source";
      messageText.textContent = `消息内容：${log.messageText || log.triggerText || ""}`;

      const reply = document.createElement("div");
      reply.className = "message-log-reply" + (log.skipped ? " message-log-reply--skipped" : "");
      reply.textContent = `回复内容：${log.replyText || ""}`;

      item.append(meta, title, target, messageText, reply);
      aiBotMessageLogsElement.appendChild(item);
    });
    aiBotMessageLogsElement.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, aiBotMessageLogsElement.scrollHeight);
  }

  function renderAiBotPendingMessages(queue) {
    const normalizedQueue = (Array.isArray(queue) ? queue : [])
      .map((item) => ({
        ...item,
        queuedAt: Number(item?.queuedAt || 0),
        messageTimestamp: Number(item?.messageTimestamp || 0)
      }))
      .filter((item) => item.messageId && item.queuedAt)
      .sort((left, right) => Number(right.messageTimestamp || right.queuedAt) - Number(left.messageTimestamp || left.queuedAt));
    const previousScrollTop = aiBotPendingMessagesElement.scrollTop;
    const wasNearTop = previousScrollTop <= 4;
    aiBotPendingMessagesElement.innerHTML = "";
    if (!normalizedQueue.length) {
      const empty = document.createElement("div");
      empty.className = "log-empty";
      empty.textContent = "暂无待处理消息";
      aiBotPendingMessagesElement.appendChild(empty);
      return;
    }

    normalizedQueue.forEach((pending) => {
      const item = document.createElement("div");
      item.className = "message-log-item";

      const meta = document.createElement("div");
      meta.className = "log-meta";
      const type = document.createElement("span");
      type.className = "log-level log-level--warn";
      type.textContent = "待处理";
      const time = document.createElement("span");
      time.textContent = pending.queuedAt ? new Date(pending.queuedAt).toLocaleString("zh-CN", { hour12: false }) : "未知时间";
      meta.append(type, time);

      const title = document.createElement("div");
      title.className = "message-log-title";
      title.textContent = pending.context?.detail?.title || `帖子 ${pending.linkId || ""}`;

      const target = document.createElement("div");
      target.className = "message-log-target";
      target.textContent = [
        `类型：${pending.messageSource === "comment" ? "评论/回复我的消息" : "@我的消息"}`,
        pending.senderName ? `消息发送人：${pending.senderName}${pending.senderId ? `（${pending.senderId}）` : ""}` : "",
        `等待：${Math.max(0, Math.floor((Date.now() - pending.queuedAt) / 1000))} 秒`,
        pending.messageTimestamp ? `消息时间：${new Date(pending.messageTimestamp).toLocaleString("zh-CN", { hour12: false })}` : "",
        pending.linkId ? `帖子ID：${pending.linkId}` : "",
        pending.replyCommentId ? `回复评论ID：${pending.replyCommentId}` : "",
        pending.rootCommentId ? `根评论ID：${pending.rootCommentId}` : ""
      ].filter(Boolean).join(" · ");

      const messageText = document.createElement("div");
      messageText.className = "message-log-source";
      messageText.textContent = `消息内容：${pending.messageText || ""}`;

      item.append(meta, title, target, messageText);
      aiBotPendingMessagesElement.appendChild(item);
    });
    aiBotPendingMessagesElement.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, aiBotPendingMessagesElement.scrollHeight);
  }

  function renderAiBotLogsFromStorage() {
    setAiBotLogStatus("正在加载日志...", false);
    chrome.storage.local.get([AI_BOT_LOGS_STORAGE_KEY, AI_BOT_MESSAGE_LOGS_STORAGE_KEY, AI_BOT_REPLY_QUEUE_STORAGE_KEY], (result) => {
      renderAiBotLogs(result?.[AI_BOT_LOGS_STORAGE_KEY]);
      renderAiBotMessageLogs(result?.[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
      renderAiBotPendingMessages(result?.[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
      setAiBotLogStatus(`日志已更新：${new Date().toLocaleTimeString("zh-CN", { hour12: false })}`, false);
    });
  }

  function startAiBotLogAutoRefresh() {
    renderAiBotLogsFromStorage();
    if (aiBotLogRefreshTimer) {
      return;
    }
    aiBotLogRefreshTimer = window.setInterval(renderAiBotLogsFromStorage, 1000);
  }

  function stopAiBotLogAutoRefresh() {
    if (!aiBotLogRefreshTimer) {
      return;
    }
    window.clearInterval(aiBotLogRefreshTimer);
    aiBotLogRefreshTimer = null;
  }

  async function clearAiBotLogs() {
    aiBotClearLogsButton.disabled = true;
    try {
      await sendMessage({ type: "better-xiaoheihe-ai-bot-clear-logs" });
      renderAiBotLogs([]);
      renderAiBotMessageLogs([]);
      renderAiBotLogsFromStorage();
      setAiBotLogStatus("日志已清空", false);
    } catch (error) {
      setAiBotLogStatus(error?.message || "清空日志失败", true);
    } finally {
      aiBotClearLogsButton.disabled = false;
    }
  }

  async function copyAiBotLogText(button) {
    const text = button?.dataset?.copyText || "";
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      const previousText = button.textContent;
      button.textContent = "已复制";
      window.setTimeout(() => {
        button.textContent = previousText || "复制";
      }, 1200);
    } catch {
      setAiBotLogStatus("复制失败，请手动选择文本复制", true);
    }
  }

  function resetAiBotPrompt() {
    aiBotCommentPromptInput.value = AI_BOT_DEFAULT_PROMPT;
    saveAiBotSettings();
    setAiBotStatus("已恢复默认提示词", false);
  }

  function syncAiBotRuleInputs() {
    const settings = getAiBotFormSettings();
    aiBotPollMinutesInput.value = settings.pollMinutes;
    aiBotMessageFreshMinutesInput.value = settings.messageFreshMinutes;
    aiBotWhitelistInput.value = settings.whitelistUserIds.join("\n");
    saveAiBotSettings();
  }

  function syncAiBotProviderDefaults() {
    const provider = normalizeProvider(aiBotProviderInput.value);
    const defaults = Object.values(PROVIDER_DEFAULT_BASE_URLS);
    if (!aiBotBaseUrlInput.value || defaults.includes(aiBotBaseUrlInput.value.replace(/\/+$/, ""))) {
      aiBotBaseUrlInput.value = PROVIDER_DEFAULT_BASE_URLS[provider];
    }
    fillAiBotModelOptions([]);
    saveAiBotSettings();
    loadCachedAiBotModelOptions();
  }

  async function fetchModels() {
    const settings = getFormSettings();
    if (!settings.baseUrl) {
      setStatus("请先填写 Base URL", true);
      return;
    }

    fetchModelsButton.disabled = true;
    setStatus("正在拉取模型...", false);
    try {
      const response = await sendMessage({
        type: "better-xiaoheihe-ai-list-models",
        detail: {
          settings
        }
      });
      if (!response.ok) {
        setStatus(response.error || "模型列表拉取失败", true);
        return;
      }
      fillModelOptions(Array.isArray(response.models) ? response.models : []);
      setStatus(response.models?.length ? `已拉取 ${response.models.length} 个模型` : "未返回可用模型，可手动填写", false);
      saveSettings();
    } catch (error) {
      setStatus(error?.message || "模型列表拉取失败", true);
    } finally {
      fetchModelsButton.disabled = false;
    }
  }

  async function fetchAiBotModels() {
    const settings = getAiBotFormSettings();
    if (!settings.baseUrl) {
      setAiBotStatus("请先填写 Base URL", true);
      return;
    }

    aiBotFetchModelsButton.disabled = true;
    setAiBotStatus("正在拉取模型...", false);
    try {
      const response = await sendMessage({
        type: "better-xiaoheihe-ai-list-models",
        detail: {
          settings
        }
      });
      if (!response.ok) {
        setAiBotStatus(response.error || "模型列表拉取失败", true);
        return;
      }
      fillAiBotModelOptions(Array.isArray(response.models) ? response.models : []);
      setAiBotStatus(response.models?.length ? `已拉取 ${response.models.length} 个模型` : "未返回可用模型，可手动填写", false);
      saveAiBotSettings();
    } catch (error) {
      setAiBotStatus(error?.message || "模型列表拉取失败", true);
    } finally {
      aiBotFetchModelsButton.disabled = false;
    }
  }

  function resetSummaryPrompt() {
    summaryPromptInput.value = DEFAULT_SUMMARY_PROMPT;
    saveSettings();
    setStatus("已恢复默认提示词", false);
  }

  function syncProviderDefaults() {
    const provider = normalizeProvider(providerInput.value);
    const defaults = Object.values(PROVIDER_DEFAULT_BASE_URLS);
    if (!baseUrlInput.value || defaults.includes(baseUrlInput.value.replace(/\/+$/, ""))) {
      baseUrlInput.value = PROVIDER_DEFAULT_BASE_URLS[provider];
    }
    fillModelOptions([]);
    saveSettings();
    loadCachedModelOptions();
  }

  function loadCachedModelOptions() {
    chrome.storage.local.get(AI_MODEL_CACHE_STORAGE_KEY, (result) => {
      const cache = result?.[AI_MODEL_CACHE_STORAGE_KEY];
      const settings = getFormSettings();
      const legacyProviderCache = Object.values(cache || {})
        .filter((item) => item?.provider === settings.provider)
        .sort((left, right) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))[0];
      const models = (cache?.[getModelCacheKey(settings)] || cache?.[getProviderModelCacheKey(settings)] || legacyProviderCache)?.models;
      fillModelOptions(Array.isArray(models) ? models : []);
    });
  }

  function loadCachedAiBotModelOptions() {
    chrome.storage.local.get(AI_MODEL_CACHE_STORAGE_KEY, (result) => {
      const cache = result?.[AI_MODEL_CACHE_STORAGE_KEY];
      const settings = getAiBotFormSettings();
      const legacyProviderCache = Object.values(cache || {})
        .filter((item) => item?.provider === settings.provider)
        .sort((left, right) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))[0];
      const models = (cache?.[getModelCacheKey(settings)] || cache?.[getProviderModelCacheKey(settings)] || legacyProviderCache)?.models;
      fillAiBotModelOptions(Array.isArray(models) ? models : []);
    });
  }

  chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
    fillForm(result?.[AI_SETTINGS_STORAGE_KEY]);
  });
  chrome.storage.local.get([AI_BOT_SETTINGS_STORAGE_KEY, AI_BOT_LOGS_STORAGE_KEY, AI_BOT_MESSAGE_LOGS_STORAGE_KEY, AI_BOT_REPLY_QUEUE_STORAGE_KEY], (result) => {
    fillAiBotForm(result?.[AI_BOT_SETTINGS_STORAGE_KEY]);
    renderAiBotLogs(result?.[AI_BOT_LOGS_STORAGE_KEY]);
    renderAiBotMessageLogs(result?.[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
    renderAiBotPendingMessages(result?.[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
    refreshAiBotStatus();
  });
  loadLocalSettings();

  [enabledInput, baseUrlInput, modelInput, apiKeyInput, summaryPromptInput].forEach((input) => {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
  });
  [aiBotBaseUrlInput, aiBotModelInput, aiBotApiKeyInput, aiBotPollMinutesInput, aiBotMessageFreshMinutesInput, aiBotReplyMentionsInput, aiBotReplyCommentsInput, aiBotWhitelistInput, aiBotCommentPromptInput].forEach((input) => {
    input.addEventListener("change", saveAiBotSettings);
    input.addEventListener("input", saveAiBotSettings);
  });
  [providerInput, baseUrlInput, modelInput, apiKeyInput].forEach((input) => {
    input.addEventListener("change", () => resetConnectionStatusIfChanged("ai"));
    input.addEventListener("input", () => resetConnectionStatusIfChanged("ai"));
  });
  [aiBotProviderInput, aiBotBaseUrlInput, aiBotModelInput, aiBotApiKeyInput].forEach((input) => {
    input.addEventListener("change", () => resetConnectionStatusIfChanged("aiBot"));
    input.addEventListener("input", () => resetConnectionStatusIfChanged("aiBot"));
  });
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });
  document.querySelectorAll(".keyword-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector(".keyword-input");
      addBlockedKeyword(input?.value, form.dataset.scope);
      if (input) {
        input.value = "";
        input.focus();
      }
    });
  });
  document.querySelectorAll(".keyword-list").forEach((list) => {
    list.addEventListener("click", (event) => {
      const button = event.target.closest(".keyword-remove");
      if (!button) {
        return;
      }
      removeBlockedKeyword(button.dataset.keyword, button.dataset.scope);
    });
  });
  document.querySelectorAll(".level-enabled").forEach((input) => {
    input.addEventListener("change", () => {
      updateLevelFilter(input.dataset.scope, {
        enabled: input.checked
      });
    });
  });
  document.querySelectorAll(".level-range").forEach((input) => {
    input.addEventListener("input", () => {
      updateLevelFilter(input.dataset.scope, {
        maxLevel: input.value
      });
    });
  });
  document.querySelectorAll("[data-secret-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleSecretInput(button.dataset.secretToggle));
  });
  modelInput.addEventListener("change", syncSelectedModelOption);
  modelInput.addEventListener("input", syncSelectedModelOption);
  aiBotModelInput.addEventListener("change", syncSelectedAiBotModelOption);
  aiBotModelInput.addEventListener("input", syncSelectedAiBotModelOption);
  baseUrlInput.addEventListener("change", loadCachedModelOptions);
  aiBotBaseUrlInput.addEventListener("change", loadCachedAiBotModelOptions);
  modelDropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleModelMenu();
  });
  aiBotModelDropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleAiBotModelMenu();
  });
  modelMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const option = event.target.closest(".model-option");
    selectFetchedModel(option?.dataset.model);
  });
  aiBotModelMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const option = event.target.closest(".ai-bot-model-option");
    selectFetchedAiBotModel(option?.dataset.model);
  });
  document.addEventListener("click", () => {
    setModelMenuOpen(false);
    setAiBotModelMenuOpen(false);
  });
  providerInput.addEventListener("change", syncProviderDefaults);
  enabledInput.addEventListener("change", syncEnabledLabel);
  resetPromptButton.addEventListener("click", resetSummaryPrompt);
  fetchModelsButton.addEventListener("click", fetchModels);
  testButton.addEventListener("click", testConnection);
  aiBotProviderInput.addEventListener("change", syncAiBotProviderDefaults);
  aiBotResetPromptButton.addEventListener("click", resetAiBotPrompt);
  aiBotPollMinutesInput.addEventListener("change", syncAiBotRuleInputs);
  aiBotMessageFreshMinutesInput.addEventListener("change", syncAiBotRuleInputs);
  aiBotWhitelistInput.addEventListener("change", syncAiBotRuleInputs);
  [aiBotReplyMentionsInput, aiBotReplyCommentsInput].forEach((input) => {
    input.addEventListener("change", refreshAiBotStatus);
  });
  aiBotFetchModelsButton.addEventListener("click", fetchAiBotModels);
  aiBotTestButton.addEventListener("click", testAiBotConnection);
  aiBotRunNowButton.addEventListener("click", runAiBotNow);
  aiBotViewLogsButton.addEventListener("click", () => setActiveTab("aibot-logs"));
  aiBotBackSettingsButton.addEventListener("click", () => setActiveTab("aibot"));
  aiBotRefreshLogsButton.addEventListener("click", renderAiBotLogsFromStorage);
  aiBotClearLogsButton.addEventListener("click", clearAiBotLogs);
  document.querySelectorAll("[data-ai-bot-log-view]").forEach((button) => {
    button.addEventListener("click", () => setAiBotLogView(button.dataset.aiBotLogView));
  });
  aiBotLogsElement.addEventListener("click", (event) => {
    const button = event.target.closest(".log-copy");
    if (button) {
      copyAiBotLogText(button);
    }
  });
  aiBotLogsElement.addEventListener("toggle", (event) => {
    const detail = event.target.closest(".log-detail-wrap");
    const logId = detail?.dataset.logId || "";
    if (!logId) {
      return;
    }
    if (detail.open) {
      expandedAiBotLogIds.add(logId);
    } else {
      expandedAiBotLogIds.delete(logId);
    }
  }, true);
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }
    if (changes[BLOCKED_KEYWORDS_STORAGE_KEY]) {
      blockedKeywords = normalizeBlockedKeywords(changes[BLOCKED_KEYWORDS_STORAGE_KEY].newValue);
      renderLocalSettings();
    }
    if (changes[LEVEL_FILTERS_STORAGE_KEY]) {
      levelFilters = normalizeLevelFilters(changes[LEVEL_FILTERS_STORAGE_KEY].newValue);
      renderLocalSettings();
    }
    if (changes[AI_BOT_SETTINGS_STORAGE_KEY]) {
      const aiBotPanel = document.querySelector('[data-panel="aibot"]');
      if (!aiBotPanel?.contains(document.activeElement)) {
        fillAiBotForm(changes[AI_BOT_SETTINGS_STORAGE_KEY].newValue);
      }
      refreshAiBotStatus();
    }
    if (changes[AI_BOT_LOGS_STORAGE_KEY]) {
      renderAiBotLogs(changes[AI_BOT_LOGS_STORAGE_KEY].newValue);
    }
    if (changes[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]) {
      renderAiBotMessageLogs(changes[AI_BOT_MESSAGE_LOGS_STORAGE_KEY].newValue);
    }
    if (changes[AI_BOT_REPLY_QUEUE_STORAGE_KEY]) {
      renderAiBotPendingMessages(changes[AI_BOT_REPLY_QUEUE_STORAGE_KEY].newValue);
    }
  });
})();
