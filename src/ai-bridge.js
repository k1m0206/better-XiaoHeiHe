(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled === true,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || "")
    };
  }

  function dispatchSettings(settings) {
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, {
      detail: normalizeAiSettings(settings)
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
    const settings = normalizeAiSettings(detail?.settings);
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
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(event.detail));

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_SETTINGS_STORAGE_KEY]) {
      dispatchSettings(changes[AI_SETTINGS_STORAGE_KEY].newValue);
    }
  });

  readSettings();
})();
