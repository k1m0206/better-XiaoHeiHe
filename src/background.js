(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const IDENTITY_COOKIE_NAMES = ["heybox_id", "user_heybox_id"];
  const IDENTITY_COOKIE_AUTO_RESTORE_DELAY = 10000;
  const removedIdentityCookieSets = new Map();

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
    const normalizedBaseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
    return /\/chat\/completions$/i.test(normalizedBaseUrl)
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/chat/completions`;
  }

  function readAiSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
        resolve(normalizeAiSettings(result?.[AI_SETTINGS_STORAGE_KEY]));
      });
    });
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

  function getCookieUrl(cookie) {
    const protocol = cookie.secure ? "https:" : "http:";
    const domain = String(cookie.domain || "").replace(/^\./, "");
    return `${protocol}//${domain}${cookie.path || "/"}`;
  }

  function getIdentityCookies() {
    return new Promise((resolve) => {
      chrome.cookies.getAll({}, (cookies) => {
        const error = chrome.runtime.lastError;
        if (error) {
          resolve([]);
          return;
        }

        resolve((cookies || []).filter((cookie) => {
          const domain = String(cookie.domain || "").replace(/^\./, "");
          return IDENTITY_COOKIE_NAMES.includes(cookie.name)
            && (domain === "xiaoheihe.cn" || domain.endsWith(".xiaoheihe.cn"));
        }));
      });
    });
  }

  function removeCookie(cookie) {
    return new Promise((resolve) => {
      chrome.cookies.remove({
        url: getCookieUrl(cookie),
        name: cookie.name,
        storeId: cookie.storeId
      }, () => resolve());
    });
  }

  function setCookie(cookie) {
    return new Promise((resolve) => {
      const details = {
        url: getCookieUrl(cookie),
        name: cookie.name,
        value: cookie.value,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        storeId: cookie.storeId
      };

      if (cookie.domain?.startsWith(".")) {
        details.domain = cookie.domain;
      }

      if (!cookie.session && Number.isFinite(cookie.expirationDate)) {
        details.expirationDate = cookie.expirationDate;
      }

      chrome.cookies.set(details, () => resolve());
    });
  }

  async function removeIdentityCookies(detail = {}) {
    const id = detail.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const cookies = await getIdentityCookies();
    await Promise.all(cookies.map(removeCookie));
    const timer = setTimeout(() => {
      restoreIdentityCookies({ id });
    }, IDENTITY_COOKIE_AUTO_RESTORE_DELAY);
    removedIdentityCookieSets.set(id, { cookies, timer });
    return { ok: true, id, count: cookies.length };
  }

  async function restoreIdentityCookies(detail = {}) {
    const id = detail.id || "";
    const entry = removedIdentityCookieSets.get(id);
    removedIdentityCookieSets.delete(id);
    if (entry?.timer) {
      clearTimeout(entry.timer);
    }

    const cookies = Array.isArray(entry) ? entry : entry?.cookies || [];
    await Promise.all(cookies.map(setCookie));
    return { ok: true, id, count: cookies.length };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "better-xiaoheihe-open-ai-settings") {
      openAiSettings();
      return false;
    }

    if (message?.type === "better-xiaoheihe-ai-test") {
      requestChat({
        messages: [{ role: "user", content: "请回复 OK" }],
        temperature: 0
      }, message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-remove-identity-cookies") {
      removeIdentityCookies(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-restore-identity-cookies") {
      restoreIdentityCookies(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });
})();
