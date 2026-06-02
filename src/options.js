(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
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
  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  let blockedKeywords = [];
  let levelFilters = normalizeLevelFilters({});

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
    const nextTab = tab === "ai" ? "ai" : normalizeBlockedKeywordScope(tab);
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
    setStatus(`已选择模型：${model}`, false);
  }

  function fillForm(settings) {
    const normalized = normalizeAiSettings(settings);
    enabledInput.checked = normalized.enabled;
    providerInput.value = normalized.provider;
    baseUrlInput.value = normalized.baseUrl;
    modelInput.value = normalized.model;
    apiKeyInput.value = normalized.apiKey;
    summaryPromptInput.value = normalized.summaryPrompt;
    syncEnabledLabel();
    loadCachedModelOptions();
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
        return;
      }
      setStatus("连接成功", false);
      saveSettings();
    } catch (error) {
      setStatus(error?.message || "连接失败", true);
    } finally {
      testButton.disabled = false;
    }
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

  chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
    fillForm(result?.[AI_SETTINGS_STORAGE_KEY]);
  });
  loadLocalSettings();

  [enabledInput, baseUrlInput, modelInput, apiKeyInput, summaryPromptInput].forEach((input) => {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
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
  modelInput.addEventListener("change", syncSelectedModelOption);
  modelInput.addEventListener("input", syncSelectedModelOption);
  baseUrlInput.addEventListener("change", loadCachedModelOptions);
  modelDropdownButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleModelMenu();
  });
  modelMenu.addEventListener("click", (event) => {
    event.stopPropagation();
    const option = event.target.closest(".model-option");
    selectFetchedModel(option?.dataset.model);
  });
  document.addEventListener("click", () => setModelMenuOpen(false));
  providerInput.addEventListener("change", syncProviderDefaults);
  enabledInput.addEventListener("change", syncEnabledLabel);
  resetPromptButton.addEventListener("click", resetSummaryPrompt);
  fetchModelsButton.addEventListener("click", fetchModels);
  testButton.addEventListener("click", testConnection);
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
  });
})();
