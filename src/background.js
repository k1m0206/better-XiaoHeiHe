(function () {
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手。请用中文简洁总结帖子主旨、评论区主要观点、争议点或有用信息。不要编造不存在的信息。";

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled === true,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function buildChatUrl(baseUrl) {
    return `${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`;
  }

  async function requestChat(detail) {
    const settings = normalizeAiSettings(detail?.settings);
    if (!settings.enabled || !settings.baseUrl || !settings.model) {
      return { ok: false, error: "请先开启 AI，并填写 Base URL 和模型" };
    }

    const headers = {
      accept: "application/json",
      "content-type": "application/json"
    };
    if (settings.apiKey) {
      headers.authorization = `Bearer ${settings.apiKey}`;
    }

    try {
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
        return {
          ok: false,
          error: data?.error?.message || `请求失败：${response.status}`
        };
      }

      const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
      return {
        ok: true,
        content: String(content || "").trim() || "模型没有返回内容"
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "AI 请求失败"
      };
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });
})();
