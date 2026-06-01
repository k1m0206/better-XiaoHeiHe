(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
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
  const apiKeyInput = document.getElementById("apiKey");
  const summaryPromptInput = document.getElementById("summaryPrompt");
  const resetPromptButton = document.getElementById("resetPrompt");
  const fetchModelsButton = document.getElementById("fetchModels");
  const testButton = document.getElementById("test");
  const statusElement = document.getElementById("status");
  const enabledLabel = document.getElementById("enabledLabel");

  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_PROVIDER;
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
    modelOptions.innerHTML = "";
    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      modelOptions.appendChild(option);
    });
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
  }

  chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
    fillForm(result?.[AI_SETTINGS_STORAGE_KEY]);
  });

  [enabledInput, baseUrlInput, modelInput, apiKeyInput, summaryPromptInput].forEach((input) => {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
  });
  providerInput.addEventListener("change", syncProviderDefaults);
  enabledInput.addEventListener("change", syncEnabledLabel);
  resetPromptButton.addEventListener("click", resetSummaryPrompt);
  fetchModelsButton.addEventListener("click", fetchModels);
  testButton.addEventListener("click", testConnection);
})();
