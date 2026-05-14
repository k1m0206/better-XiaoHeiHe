(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const SETTINGS_SAVE_EVENT = "better-xiaoheihe-ai-settings-save";
  const SETTINGS_OPEN_EVENT = "better-xiaoheihe-ai-settings-open";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  let currentSettings = normalizeAiSettings();

  function parseEventDetail(detail) {
    if (typeof detail !== "string") {
      return detail || {};
    }

    try {
      return JSON.parse(detail) || {};
    } catch {
      return {};
    }
  }

  function stringifyEventDetail(detail) {
    return JSON.stringify(detail || {});
  }

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled !== false,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function dispatchSettings(settings) {
    currentSettings = normalizeAiSettings(settings);
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, {
      detail: stringifyEventDetail({
        enabled: currentSettings.enabled,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        apiKey: currentSettings.apiKey,
        summaryPrompt: currentSettings.summaryPrompt
      })
    }));
  }

  function readSettings() {
    chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
      dispatchSettings(result?.[AI_SETTINGS_STORAGE_KEY]);
    });
  }

  function sendChatResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(CHAT_RESPONSE_EVENT, {
      detail: stringifyEventDetail({
        id,
        ...payload
      })
    }));
  }

  function requestChat(detail) {
    const id = detail?.id || "";
    const settings = currentSettings;
    if (!id || !settings.baseUrl || !settings.model) {
      sendChatResponse(id, { ok: false, error: "请先填写 Base URL 和模型" });
      return;
    }

    chrome.runtime.sendMessage({
      type: "better-xiaoheihe-ai-chat",
      detail: {
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: Number.isFinite(detail?.temperature) ? detail.temperature : 0.2
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        sendChatResponse(id, {
          ok: false,
          error: chrome.runtime.lastError.message || "AI 请求失败"
        });
        return;
      }

      sendChatResponse(id, response || {
        ok: false,
        error: "AI 请求失败"
      });
    });
  }

  window.addEventListener(SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(SETTINGS_SAVE_EVENT, (event) => {
    const nextSettings = normalizeAiSettings(parseEventDetail(event.detail));
    dispatchSettings(nextSettings);
    chrome.storage.local.set({
      [AI_SETTINGS_STORAGE_KEY]: nextSettings
    });
  });
  window.addEventListener(SETTINGS_OPEN_EVENT, () => {
    chrome.runtime.sendMessage({ type: "better-xiaoheihe-open-ai-settings" });
  });
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(parseEventDetail(event.detail)));

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_SETTINGS_STORAGE_KEY]) {
      dispatchSettings(changes[AI_SETTINGS_STORAGE_KEY].newValue);
    }
  });

  readSettings();
})();
