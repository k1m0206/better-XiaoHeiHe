(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n\n帖子总结\n一句话概括帖子核心内容。\n\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\n\nAI评论\n像真实网友一样简短评价或补充观点，避免AI味。返回md格式。";
  const ENHANCED_PATH_PREFIXES = ["/app/bbs", "/app/topic/link", "/app/user/profile", "/app/user/favour", "/app/search"];
  const MAX_AI_MESSAGES = 8;
  const MAX_AI_CONTENT_LENGTH = 20000;

  function normalizeAiSettings(settings) {
    return {
      enabled: settings?.enabled !== false,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function getStorage(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result || {});
      });
    });
  }

  async function readAiSettings() {
    const result = await getStorage(AI_SETTINGS_STORAGE_KEY);
    return normalizeAiSettings(result?.[AI_SETTINGS_STORAGE_KEY]);
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

  function isEnhancedXiaoHeiHeUrl(url) {
    let parsed;
    try {
      parsed = new URL(url || "");
    } catch {
      return false;
    }

    return parsed.origin === "https://www.xiaoheihe.cn"
      && ENHANCED_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix));
  }

  function isExtensionPageUrl(url) {
    return typeof url === "string" && url.startsWith(chrome.runtime.getURL(""));
  }

  function isAllowedSender(sender) {
    return isEnhancedXiaoHeiHeUrl(sender?.tab?.url) || isExtensionPageUrl(sender?.url);
  }

  function buildChatUrl(baseUrl) {
    const url = new URL(`${String(baseUrl || "").replace(/\/+$/, "")}/chat/completions`);
    const isLocalHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (url.protocol !== "https:" && !isLocalHttp) {
      throw new Error("Base URL 必须使用 HTTPS，或使用本机 localhost 调试地址");
    }
    return url.href;
  }

  function clampTemperature(value) {
    const temperature = Number(value);
    return Number.isFinite(temperature) ? Math.min(2, Math.max(0, temperature)) : 0.2;
  }

  function normalizeMessages(messages) {
    let remainingLength = MAX_AI_CONTENT_LENGTH;
    const normalizedMessages = [];

    (Array.isArray(messages) ? messages : []).slice(0, MAX_AI_MESSAGES).forEach((message) => {
      if (remainingLength <= 0) {
        return;
      }

      const content = String(message?.content || "").slice(0, remainingLength);
      if (!content) {
        return;
      }

      normalizedMessages.push({
        role: ["system", "user", "assistant"].includes(message?.role) ? message.role : "user",
        content
      });
      remainingLength -= content.length;
    });

    if (!normalizedMessages.length) {
      throw new Error("AI 请求内容为空");
    }

    return normalizedMessages;
  }

  async function requestChat(detail, overrideSettings = null) {
    const settings = overrideSettings ? normalizeAiSettings(overrideSettings) : await readAiSettings();
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
          messages: normalizeMessages(detail?.messages),
          temperature: clampTemperature(detail?.temperature)
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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "better-xiaoheihe-open-ai-settings") {
      openAiSettings();
      return false;
    }

    if (message?.type === "better-xiaoheihe-ai-test") {
      if (!isAllowedSender(sender)) {
        sendResponse({ ok: false, error: "不允许的 AI 请求来源" });
        return false;
      }

      requestChat({
        messages: [{ role: "user", content: "请回复 OK" }],
        temperature: 0
      }, message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    if (!isAllowedSender(sender)) {
      sendResponse({ ok: false, error: "不允许的 AI 请求来源" });
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });
})();
