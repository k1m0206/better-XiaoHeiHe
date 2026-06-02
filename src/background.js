(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const AI_PROVIDERS = {
    OPENAI_COMPATIBLE: "openai-compatible",
    OPENAI_RESPONSES: "openai-responses",
    ANTHROPIC: "anthropic",
    GEMINI: "gemini"
  };
  const DEFAULT_PROVIDER = AI_PROVIDERS.OPENAI_COMPATIBLE;
  const PROVIDER_DEFAULT_BASE_URLS = {
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: "https://api.openai.com/v1",
    [AI_PROVIDERS.OPENAI_RESPONSES]: "https://api.openai.com/v1",
    [AI_PROVIDERS.ANTHROPIC]: "https://api.anthropic.com/v1",
    [AI_PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta"
  };
  const SANITIZED_COMMENT_COOKIE_RULE_ID = 101;
  const sanitizedCommentCookieRules = new Map();
  let sanitizedCommentCookieRuleQueue = Promise.resolve();

  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_PROVIDER;
  }

  function normalizeBaseUrl(baseUrl, provider) {
    return String(baseUrl || PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, "");
  }

  function normalizeAiSettings(settings) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: normalizeBaseUrl(settings?.baseUrl, provider),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function normalizeModelList(models) {
    return [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))]
      .sort((left, right) => left.localeCompare(right));
  }

  function getModelCacheKey(settings) {
    const normalized = normalizeAiSettings(settings);
    return `${normalized.provider}:${normalized.baseUrl}`;
  }

  function getProviderModelCacheKey(settings) {
    return normalizeAiSettings(settings).provider;
  }

  function readModelListCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_MODEL_CACHE_STORAGE_KEY, (result) => {
        const cache = result?.[AI_MODEL_CACHE_STORAGE_KEY];
        resolve(cache && typeof cache === "object" ? cache : {});
      });
    });
  }

  async function getCachedModelList(settings) {
    const cache = await readModelListCache();
    const provider = normalizeAiSettings(settings).provider;
    const exactCache = cache[getModelCacheKey(settings)];
    const providerCache = cache[getProviderModelCacheKey(settings)];
    const legacyProviderCache = Object.values(cache)
      .filter((item) => item?.provider === provider)
      .sort((left, right) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))[0];
    return {
      ok: true,
      models: normalizeModelList((exactCache || providerCache || legacyProviderCache)?.models)
    };
  }

  async function writeModelListCache(settings, models) {
    const normalizedSettings = normalizeAiSettings(settings);
    const normalizedModels = normalizeModelList(models);
    const cache = await readModelListCache();
    await new Promise((resolve) => {
      chrome.storage.local.set({
        [AI_MODEL_CACHE_STORAGE_KEY]: {
          ...cache,
          [getModelCacheKey(normalizedSettings)]: {
            provider: normalizedSettings.provider,
            baseUrl: normalizedSettings.baseUrl,
            models: normalizedModels,
            updatedAt: Date.now()
          },
          [getProviderModelCacheKey(normalizedSettings)]: {
            provider: normalizedSettings.provider,
            baseUrl: normalizedSettings.baseUrl,
            models: normalizedModels,
            updatedAt: Date.now()
          }
        }
      }, resolve);
    });
    return normalizedModels;
  }

  function openAiSettings() {
    const url = chrome.runtime.getURL("src/options.html");
    if (chrome.windows?.create) {
      chrome.windows.create({
        url,
        type: "popup",
        width: 500,
        height: 760
      });
      return;
    }

    chrome.tabs.create({ url });
  }

  function buildProviderUrl(baseUrl, path) {
    const normalizedBaseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    return normalizedPath ? `${normalizedBaseUrl}/${normalizedPath}` : normalizedBaseUrl;
  }

  function buildOpenAiChatUrl(baseUrl) {
    return /\/chat\/completions$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "chat/completions");
  }

  function buildOpenAiResponsesUrl(baseUrl) {
    return /\/responses$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "responses");
  }

  function buildModelsUrl(baseUrl) {
    return /\/models$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "models");
  }

  function readAiSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
        resolve(normalizeAiSettings(result?.[AI_SETTINGS_STORAGE_KEY]));
      });
    });
  }

  function createJsonHeaders(settings) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json"
    };
    if (settings.apiKey) {
      headers.authorization = `Bearer ${settings.apiKey}`;
    }
    return headers;
  }

  async function readJsonResponse(response) {
    const text = await response.text().catch(() => "");
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  function getProviderError(data, response) {
    return data?.error?.message || data?.error || data?.message || data?.text || `请求失败：${response.status}`;
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(String(getProviderError(data, response)));
    }
    return data;
  }

  function getTemperature(detail) {
    return Number.isFinite(detail?.temperature) ? detail.temperature : 0.2;
  }

  function splitSystemMessages(messages) {
    const system = [];
    const rest = [];
    (Array.isArray(messages) ? messages : []).forEach((message) => {
      const role = String(message?.role || "user");
      const content = String(message?.content || "");
      if (!content) {
        return;
      }
      if (role === "system") {
        system.push(content);
        return;
      }
      rest.push({ role, content });
    });
    return { system: system.join("\n\n"), messages: rest };
  }

  function parseOpenAiContent(data) {
    return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
  }

  function parseResponsesContent(data) {
    if (data?.output_text) {
      return data.output_text;
    }

    const parts = [];
    (data?.output || []).forEach((item) => {
      (item?.content || []).forEach((content) => {
        if (content?.text) {
          parts.push(content.text);
        }
      });
    });
    return parts.join("\n");
  }

  function parseAnthropicContent(data) {
    return (data?.content || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  function parseGeminiContent(data) {
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  async function requestOpenAiCompatibleChat(settings, detail) {
    const data = await fetchJson(buildOpenAiChatUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseOpenAiContent(data);
  }

  async function requestOpenAiResponses(settings, detail) {
    const data = await fetchJson(buildOpenAiResponsesUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        input: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseResponsesContent(data);
  }

  async function requestAnthropicChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }

    const body = {
      model: settings.model,
      messages: messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      })),
      max_tokens: 2048,
      temperature: getTemperature(detail)
    };
    if (system) {
      body.system = system;
    }

    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "messages"), {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return parseAnthropicContent(data);
  }

  function appendGeminiApiKey(url, apiKey) {
    if (!apiKey) {
      return url;
    }

    const nextUrl = new URL(url);
    nextUrl.searchParams.set("key", apiKey);
    return nextUrl.toString();
  }

  async function requestGeminiChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const geminiMessages = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));
    if (system) {
      const firstUserMessage = geminiMessages.find((message) => message.role === "user");
      if (firstUserMessage) {
        firstUserMessage.parts[0].text = `${system}\n\n${firstUserMessage.parts[0].text}`;
      } else {
        geminiMessages.unshift({
          role: "user",
          parts: [{ text: system }]
        });
      }
    }

    const body = {
      contents: geminiMessages,
      generationConfig: {
        temperature: getTemperature(detail)
      }
    };

    const url = appendGeminiApiKey(buildProviderUrl(settings.baseUrl, `models/${encodeURIComponent(settings.model)}:generateContent`), settings.apiKey);
    const data = await fetchJson(url, {
      method: "POST",
      headers: createJsonHeaders({ ...settings, apiKey: "" }),
      body: JSON.stringify(body)
    });
    return parseGeminiContent(data);
  }

  async function requestChat(detail, overrideSettings = null) {
    const settings = overrideSettings ? normalizeAiSettings(overrideSettings) : await readAiSettings();
    if (!settings.enabled || !settings.baseUrl || !settings.model) {
      return { ok: false, error: "请先开启 AI，并填写 Base URL 和模型" };
    }

    try {
      const requesters = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: requestOpenAiCompatibleChat,
        [AI_PROVIDERS.OPENAI_RESPONSES]: requestOpenAiResponses,
        [AI_PROVIDERS.ANTHROPIC]: requestAnthropicChat,
        [AI_PROVIDERS.GEMINI]: requestGeminiChat
      };
      const content = await requesters[settings.provider](settings, detail);
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

  function parseOpenAiModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseAnthropicModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseGeminiModels(data) {
    return (data?.models || [])
      .filter((model) => !Array.isArray(model?.supportedGenerationMethods) || model.supportedGenerationMethods.includes("generateContent"))
      .map((model) => String(model?.name || "").replace(/^models\//, ""))
      .filter(Boolean);
  }

  async function listOpenAiModels(settings) {
    const data = await fetchJson(buildModelsUrl(settings.baseUrl), {
      method: "GET",
      headers: createJsonHeaders(settings)
    });
    return parseOpenAiModels(data);
  }

  async function listAnthropicModels(settings) {
    const headers = {
      accept: "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }
    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "models"), {
      method: "GET",
      headers
    });
    return parseAnthropicModels(data);
  }

  async function listGeminiModels(settings) {
    const data = await fetchJson(appendGeminiApiKey(buildProviderUrl(settings.baseUrl, "models"), settings.apiKey), {
      method: "GET",
      headers: { accept: "application/json" }
    });
    return parseGeminiModels(data);
  }

  async function listModels(overrideSettings = null) {
    const settings = normalizeAiSettings(overrideSettings || await readAiSettings());
    if (!settings.baseUrl) {
      return { ok: false, error: "请先填写 Base URL" };
    }

    try {
      const listers = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: listOpenAiModels,
        [AI_PROVIDERS.OPENAI_RESPONSES]: listOpenAiModels,
        [AI_PROVIDERS.ANTHROPIC]: listAnthropicModels,
        [AI_PROVIDERS.GEMINI]: listGeminiModels
      };
      const models = await listers[settings.provider](settings);
      const cachedModels = await writeModelListCache(settings, models);
      return {
        ok: true,
        models: cachedModels
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "模型列表拉取失败"
      };
    }
  }

  function updateSanitizedCommentCookieRule(cookieHeader) {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({
          ok: false,
          error: "当前浏览器不支持请求头规则"
        });
        return;
      }

      const requestHeaderRule = cookieHeader
        ? { header: "cookie", operation: "set", value: cookieHeader }
        : { header: "cookie", operation: "remove" };
      const addRules = [{
        id: SANITIZED_COMMENT_COOKIE_RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [requestHeaderRule]
        },
        condition: {
          regexFilter: "^https://api\\.xiaoheihe\\.cn/bbs/app/(link/tree|comment/sub/comments)(\\?|$)",
          initiatorDomains: ["xiaoheihe.cn"],
          requestMethods: ["get"],
          resourceTypes: ["xmlhttprequest"]
        }
      }];

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [SANITIZED_COMMENT_COOKIE_RULE_ID],
        addRules
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "请求头规则更新失败"
        } : { ok: true });
      });
    });
  }

  function clearSanitizedCommentCookieRule() {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({ ok: true });
        return;
      }

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [SANITIZED_COMMENT_COOKIE_RULE_ID]
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "请求头规则清理失败"
        } : { ok: true });
      });
    });
  }

  function getLastSanitizedCookieHeader() {
    let lastCookieHeader = "";
    sanitizedCommentCookieRules.forEach((cookieHeader) => {
      lastCookieHeader = cookieHeader;
    });
    return lastCookieHeader;
  }

  function queueSanitizedCommentCookieRuleUpdate(task) {
    const next = sanitizedCommentCookieRuleQueue.then(task, task);
    sanitizedCommentCookieRuleQueue = next.catch(() => {});
    return next;
  }

  function activateSanitizedCommentCookieRule(detail = {}) {
    return queueSanitizedCommentCookieRuleUpdate(async () => {
      const id = String(detail.id || "");
      if (!id) {
        return { ok: false, error: "缺少请求头规则 ID" };
      }

      const cookieHeader = String(detail.cookieHeader || "");
      sanitizedCommentCookieRules.set(id, cookieHeader);
      const result = await updateSanitizedCommentCookieRule(cookieHeader);
      if (!result.ok) {
        sanitizedCommentCookieRules.delete(id);
      }
      return { id, ...result };
    });
  }

  function releaseSanitizedCommentCookieRule(detail = {}) {
    return queueSanitizedCommentCookieRuleUpdate(async () => {
      const id = String(detail.id || "");
      if (id) {
        sanitizedCommentCookieRules.delete(id);
      }

      const result = sanitizedCommentCookieRules.size
        ? await updateSanitizedCommentCookieRule(getLastSanitizedCookieHeader())
        : await clearSanitizedCommentCookieRule();
      return { id, ...result };
    });
  }

  chrome.action?.onClicked?.addListener(() => {
    openAiSettings();
  });

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

    if (message?.type === "better-xiaoheihe-ai-list-models") {
      listModels(message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-get-model-cache") {
      getCachedModelList(message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-activate-sanitized-comment-cookie") {
      activateSanitizedCommentCookieRule(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-release-sanitized-comment-cookie") {
      releaseSanitizedCommentCookieRule(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });
})();
