(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手。请用中文简洁总结帖子主旨、评论区主要观点、争议点或有用信息。不要编造不存在的信息。";
  let currentSettings = normalizeAiSettings();

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled === true,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function dispatchSettings(settings) {
    currentSettings = normalizeAiSettings(settings);
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, {
      detail: {
        enabled: currentSettings.enabled,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        summaryPrompt: currentSettings.summaryPrompt
      }
    }));
  }

  function readSettings() {
    chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
      dispatchSettings(result?.[AI_SETTINGS_STORAGE_KEY]);
    });
  }

  function sendChatResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(CHAT_RESPONSE_EVENT, {
      detail: {
        id,
        ...payload
      }
    }));
  }

  async function requestChat(detail) {
    const id = detail?.id || "";
    const settings = currentSettings;
    if (!id || !settings.baseUrl || !settings.model) {
      sendChatResponse(id, { ok: false, error: "请先填写 Base URL 和模型" });
      return;
    }

    chrome.runtime.sendMessage({
      type: "better-xiaoheihe-ai-chat",
      detail: {
        settings,
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: Number.isFinite(detail?.temperature) ? detail.temperature : 0.2
      }
    }, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        sendChatResponse(id, {
          ok: false,
          error: error.message || "AI 请求失败"
        });
        return;
      }

      sendChatResponse(id, {
        ok: response?.ok === true,
        content: response?.content || "",
        error: response?.error || "AI 请求失败"
      });
    });
  }

  window.addEventListener(SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(event.detail));

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_SETTINGS_STORAGE_KEY]) {
      dispatchSettings(changes[AI_SETTINGS_STORAGE_KEY].newValue);
    }
  });

  readSettings();
})();
