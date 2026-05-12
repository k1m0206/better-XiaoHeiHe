(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const enabledInput = document.getElementById("enabled");
  const baseUrlInput = document.getElementById("baseUrl");
  const modelInput = document.getElementById("model");
  const apiKeyInput = document.getElementById("apiKey");
  const testButton = document.getElementById("test");
  const statusElement = document.getElementById("status");

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled === true,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || "")
    };
  }

  function getFormSettings() {
    return normalizeAiSettings({
      enabled: enabledInput.checked,
      baseUrl: baseUrlInput.value,
      model: modelInput.value,
      apiKey: apiKeyInput.value
    });
  }

  function setStatus(text, isError) {
    statusElement.textContent = text;
    statusElement.style.color = isError ? "#d33b4a" : "#68727d";
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
  }

  function buildChatUrl(baseUrl) {
    return `${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`;
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
      const headers = {
        accept: "application/json",
        "content-type": "application/json"
      };
      if (settings.apiKey) {
        headers.authorization = `Bearer ${settings.apiKey}`;
      }
      const response = await fetch(buildChatUrl(settings.baseUrl), {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: "user", content: "请回复 OK" }
          ],
          temperature: 0
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(data?.error?.message || `连接失败：${response.status}`, true);
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

  chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
    fillForm(result?.[AI_SETTINGS_STORAGE_KEY]);
  });

  [enabledInput, baseUrlInput, modelInput, apiKeyInput].forEach((input) => {
    input.addEventListener("change", saveSettings);
    input.addEventListener("input", saveSettings);
  });
  testButton.addEventListener("click", testConnection);
})();
