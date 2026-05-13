(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const SETTINGS_OPEN_EVENT = "better-xiaoheihe-ai-settings-open";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  let currentSettings = normalizeAiSettings();

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

  function buildChatUrl(baseUrl) {
    return `${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`;
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
          messages: Array.isArray(detail?.messages) ? detail.messages : [],
          temperature: Number.isFinite(detail?.temperature) ? detail.temperature : 0.2
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        sendChatResponse(id, {
          ok: false,
          error: data?.error?.message || `请求失败：${response.status}`
        });
        return;
      }

      const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
      sendChatResponse(id, {
        ok: true,
        content: String(content || "").trim() || "模型没有返回内容"
      });
    } catch (error) {
      sendChatResponse(id, {
        ok: false,
        error: error?.message || "AI 请求失败"
      });
    }
  }

  window.addEventListener(SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(SETTINGS_OPEN_EVENT, () => {
    chrome.runtime.sendMessage({ type: "better-xiaoheihe-open-ai-settings" });
  });
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(event.detail));

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_SETTINGS_STORAGE_KEY]) {
      dispatchSettings(changes[AI_SETTINGS_STORAGE_KEY].newValue);
    }
  });

  readSettings();
})();
