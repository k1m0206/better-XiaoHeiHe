(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const enabledInput = document.getElementById("enabled");
  const baseUrlInput = document.getElementById("baseUrl");
  const modelInput = document.getElementById("model");
  const apiKeyInput = document.getElementById("apiKey");
  const summaryPromptInput = document.getElementById("summaryPrompt");
  const resetPromptButton = document.getElementById("resetPrompt");
  const testButton = document.getElementById("test");
  const statusElement = document.getElementById("status");
  const enabledLabel = document.getElementById("enabledLabel");

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled !== false,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function getFormSettings() {
    return normalizeAiSettings({
      enabled: enabledInput.checked,
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

  function fillForm(settings) {
    const normalized = normalizeAiSettings(settings);
    enabledInput.checked = normalized.enabled;
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

  function resetSummaryPrompt() {
    summaryPromptInput.value = DEFAULT_SUMMARY_PROMPT;
    saveSettings();
    setStatus("已恢复默认提示词", false);
  }

  chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
    fillForm(result?.[AI_SETTINGS_STORAGE_KEY]);
  });

  [enabledInput, baseUrlInput, modelInput, apiKeyInput, summaryPromptInput].forEach((input) => {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
  });
  enabledInput.addEventListener("change", syncEnabledLabel);
  resetPromptButton.addEventListener("click", resetSummaryPrompt);
  testButton.addEventListener("click", testConnection);
})();
