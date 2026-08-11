(function () {
  // Generated from module sources by scripts/build-source-bundles.ps1.
  // Do not edit this generated entry file directly; changes will be overwritten.
  // Edit module sources under src/background instead.
  // BEGIN src\shared\constants.js
// 跨 content、background、ai-bridge 共享的协议常量。
// 本文件会被 scripts/build-source-bundles.ps1 拼入各入口文件，请勿放入依赖具体运行环境的逻辑。
  const HIDE_CY_COMMENTS_STORAGE_KEY = "better-xiaoheihe-hide-cy-comments";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
  const COMMENT_PREVIEW_SORT_STORAGE_KEY = "better-xiaoheihe-comment-preview-sort";
  const VIDEO_POSTS_BLOCKED_STORAGE_KEY = "better-xiaoheihe-video-posts-blocked";
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const UI_STATE_STORAGE_KEY = "better-xiaoheihe-ui-state";
  const COMMENT_EMOJI_USAGE_STORAGE_KEY = "better-xiaoheihe-comment-emoji-usage";
  const FEED_LAYOUT_SETTINGS_STORAGE_KEY = "better-xiaoheihe-feed-layout-settings";
  const HOT_SEARCH_DISABLED_STORAGE_KEY = "better-xiaoheihe-hot-search-disabled";
  const SIMILAR_CONTENT_DISABLED_STORAGE_KEY = "better-xiaoheihe-similar-content-disabled";
  const RECOMMENDED_COMMUNITIES_DISABLED_STORAGE_KEY = "better-xiaoheihe-recommended-communities-disabled";

  const LOCAL_SETTINGS_STORAGE_KEYS = [
    HIDE_CY_COMMENTS_STORAGE_KEY,
    BLOCKED_KEYWORDS_STORAGE_KEY,
    LEVEL_FILTERS_STORAGE_KEY,
    COMMENT_PREVIEW_SORT_STORAGE_KEY,
    VIDEO_POSTS_BLOCKED_STORAGE_KEY,
    UI_STATE_STORAGE_KEY,
    COMMENT_EMOJI_USAGE_STORAGE_KEY,
    FEED_LAYOUT_SETTINGS_STORAGE_KEY,
    HOT_SEARCH_DISABLED_STORAGE_KEY,
    SIMILAR_CONTENT_DISABLED_STORAGE_KEY,
    RECOMMENDED_COMMUNITIES_DISABLED_STORAGE_KEY
  ];

  const LOCAL_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-local-settings-request";
  const LOCAL_SETTINGS_RESPONSE_EVENT = "better-xiaoheihe-local-settings-response";
  const LOCAL_SETTINGS_SAVE_EVENT = "better-xiaoheihe-local-settings-save";
  const LOCAL_SETTINGS_CHANGED_EVENT = "better-xiaoheihe-local-settings-changed";
  const OPEN_PAGE_SETTINGS_EVENT = "better-xiaoheihe-open-page-settings";
  const AI_SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const AI_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const AI_SETTINGS_SAVE_EVENT = "better-xiaoheihe-ai-settings-save";
  const AI_CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const AI_CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const AI_MODEL_LIST_REQUEST_EVENT = "better-xiaoheihe-ai-model-list-request";
  const AI_MODEL_LIST_RESPONSE_EVENT = "better-xiaoheihe-ai-model-list-response";
  const SANITIZED_COOKIE_RULE_REQUEST_EVENT = "better-xiaoheihe-sanitized-cookie-rule-request";
  const SANITIZED_COOKIE_RULE_RESPONSE_EVENT = "better-xiaoheihe-sanitized-cookie-rule-response";

  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";

  const AI_PROVIDERS = {
    OPENAI_COMPATIBLE: "openai-compatible",
    OPENAI_RESPONSES: "openai-responses",
    ANTHROPIC: "anthropic",
    GEMINI: "gemini"
  };
  const DEFAULT_AI_PROVIDER = AI_PROVIDERS.OPENAI_COMPATIBLE;
  const AI_PROVIDER_DEFAULT_BASE_URLS = {
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: "https://api.openai.com/v1",
    [AI_PROVIDERS.OPENAI_RESPONSES]: "https://api.openai.com/v1",
    [AI_PROVIDERS.ANTHROPIC]: "https://api.anthropic.com/v1",
    [AI_PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta"
  };
  // END src\shared\constants.js
  // BEGIN src\shared\normalizers.js
// 跨入口复用的配置归一化逻辑。
// 依赖 src/shared/constants.js，生成入口时必须在 constants.js 之后拼入。
  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_AI_PROVIDER;
  }
  function normalizeBaseUrl(baseUrl, provider) {
    return String(baseUrl || AI_PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, "");
  }

  function normalizeAiSettings(settings = {}) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: normalizeBaseUrl(settings?.baseUrl, provider),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      allowEmoji: settings?.allowEmoji !== false,
      autoPopup: settings?.autoPopup !== false,
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function normalizeIdList(value) {
    return [...new Set((Array.isArray(value) ? value : String(value || "").split(/[\s,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter(Boolean))];
  }

  function normalizeKeywordList(value) {
    const seen = new Set();
    return (Array.isArray(value) ? value : String(value || "").split(/[\r\n,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter((item) => {
        const normalized = item.toLocaleLowerCase();
        if (!normalized || seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  }
  // END src\shared\normalizers.js
  // BEGIN src\shared\workshop-signing.js
// Workshop 写接口附加签名。当前网页端以版本 15 的 HMAC-SHA256 生成 _rnd。
// 本文件由 content 和 background 入口共同复用，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const WORKSHOP_RND_VERSION = "15";
  const WORKSHOP_RND_SECRET = "Z7mFG4tQp9Ws2LxB8H";

  async function createWorkshopRndParam(signedParams) {
    const nonce = String(signedParams?.nonce || "");
    const time = String(signedParams?._time || "");
    if (!nonce || !time || !globalThis.crypto?.subtle) {
      throw new Error("无法生成 Workshop 接口签名");
    }

    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(WORKSHOP_RND_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${WORKSHOP_RND_SECRET}${nonce}${time}:${nonce}`)
    );
    const hex = Array.from(new Uint8Array(signature))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    return `${WORKSHOP_RND_VERSION}:${hex}`;
  }
  // END src\shared\workshop-signing.js
  // BEGIN src\background\state.js
// 后台设置、模型缓存和 action 入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const WEB_ORIGIN = "https://www.xiaoheihe.cn";
  const COMMUNITY_HOME_URL = `${WEB_ORIGIN}/app/bbs/home`;
  const SANITIZED_COMMENT_COOKIE_RULE_ID = 101;
  const sanitizedCommentCookieRules = new Map();
  let sanitizedCommentCookieRuleQueue = Promise.resolve();


  function storageGet(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => resolve(result || {}));
    });
  }

  function storageSet(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, resolve);
    });
  }

  function storageRemove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
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

  function openCommunityHomeFromAction(tab) {
    if (tab?.id && chrome.tabs?.update) {
      chrome.tabs.update(tab.id, { url: COMMUNITY_HOME_URL }, () => {
        void chrome.runtime.lastError;
      });
      return;
    }

    if (!chrome.tabs?.create) {
      return;
    }

    chrome.tabs.create({ url: COMMUNITY_HOME_URL }, () => {
      void chrome.runtime.lastError;
    });
  }

  // END src\background\state.js
  // BEGIN src\background\ai-service.js
// AI provider 请求、模型列表和响应解析。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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
  // END src\background\ai-service.js
  // BEGIN src\background\dnr-rules.js
// DNR cookie/header 规则管理。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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

  const actionClickEvent = chrome.action?.onClicked || chrome.browserAction?.onClicked;
  actionClickEvent?.addListener((tab) => {
    openCommunityHomeFromAction(tab);
  });

  // END src\background\dnr-rules.js
  // BEGIN src\background\runtime.js
// 后台安装、storage 和 message 监听。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const LEGACY_AI_BOT_STORAGE_KEYS = [
    "better-xiaoheihe-ai-bot-settings",
    "better-xiaoheihe-ai-bot-consent",
    "better-xiaoheihe-ai-bot-logs",
    "better-xiaoheihe-ai-bot-message-logs",
    "better-xiaoheihe-ai-bot-emoji-codes",
    "better-xiaoheihe-ai-bot-replied-records",
    "better-xiaoheihe-ai-bot-feed-comment-records",
    "better-xiaoheihe-ai-bot-reply-target-records",
    "better-xiaoheihe-ai-bot-reply-queue",
    "better-xiaoheihe-ai-bot-runtime"
  ];

  chrome.runtime.onInstalled?.addListener(() => {
    storageRemove(LEGACY_AI_BOT_STORAGE_KEYS);
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
  // END src\background\runtime.js
})();
