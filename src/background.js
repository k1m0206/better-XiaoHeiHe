(function () {
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled !== false,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function openAiSettings() {
    const url = chrome.runtime.getURL("src/options.html");
    if (chrome.windows?.create) {
      chrome.windows.create({
        url,
        type: "popup",
        width: 470,
        height: 680
      });
      return;
    }

    chrome.tabs.create({ url });
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
    if (message?.type === "better-xiaoheihe-open-ai-settings") {
      openAiSettings();
      return false;
    }

    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });
})();
