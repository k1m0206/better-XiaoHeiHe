(function () {
  // Generated from module sources by scripts/build-source-bundles.ps1.
  // Do not edit this generated entry file directly; changes will be overwritten.
  // Edit module sources under src/ai-bridge and src/shared instead.
  // BEGIN src\shared\constants.js
// 跨 content、background、ai-bridge 共享的协议常量。
// 本文件会被 scripts/build-source-bundles.ps1 拼入各入口文件，请勿放入依赖具体运行环境的逻辑。
  const HIDE_CY_COMMENTS_STORAGE_KEY = "better-xiaoheihe-hide-cy-comments";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
  const COMMENT_PREVIEW_SORT_STORAGE_KEY = "better-xiaoheihe-comment-preview-sort";
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const UI_STATE_STORAGE_KEY = "better-xiaoheihe-ui-state";
  const COMMENT_EMOJI_USAGE_STORAGE_KEY = "better-xiaoheihe-comment-emoji-usage";
  const FEED_LAYOUT_SETTINGS_STORAGE_KEY = "better-xiaoheihe-feed-layout-settings";
  const HOT_SEARCH_DISABLED_STORAGE_KEY = "better-xiaoheihe-hot-search-disabled";

  const LOCAL_SETTINGS_STORAGE_KEYS = [
    HIDE_CY_COMMENTS_STORAGE_KEY,
    BLOCKED_KEYWORDS_STORAGE_KEY,
    LEVEL_FILTERS_STORAGE_KEY,
    COMMENT_PREVIEW_SORT_STORAGE_KEY,
    UI_STATE_STORAGE_KEY,
    COMMENT_EMOJI_USAGE_STORAGE_KEY,
    FEED_LAYOUT_SETTINGS_STORAGE_KEY,
    HOT_SEARCH_DISABLED_STORAGE_KEY
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
  // BEGIN src\ai-bridge\bridge.js
// AI 桥接脚本运行逻辑。
// 本文件会和 src/shared 下的共享协议一起生成 src/ai-bridge.js。
let currentSettings = normalizeAiSettings();
  let extensionContextInvalidated = false;

  function isExtensionContextInvalidatedError(error) {
    return /Extension context invalidated/i.test(String(error?.message || error || ""));
  }

  function getExtensionUnavailableError(error, fallback = "扩展上下文已失效，请刷新页面后重试") {
    if (isExtensionContextInvalidatedError(error)) {
      extensionContextInvalidated = true;
      return "扩展已重新加载，请刷新页面后重试";
    }
    return String(error?.message || error || fallback);
  }

  function isExtensionContextAvailable() {
    if (extensionContextInvalidated) {
      return false;
    }
    try {
      return typeof chrome !== "undefined" && Boolean(chrome.runtime?.id && chrome.storage?.local);
    } catch (error) {
      getExtensionUnavailableError(error);
      return false;
    }
  }

  function getRuntimeLastErrorMessage(fallback = "") {
    try {
      return chrome.runtime.lastError?.message || "";
    } catch (error) {
      return getExtensionUnavailableError(error, fallback);
    }
  }

  function sendRuntimeMessageSafely(message, fallbackMessage, callback) {
    if (!isExtensionContextAvailable()) {
      callback({ ok: false, error: "扩展已重新加载，请刷新页面后重试" });
      return;
    }

    try {
      chrome.runtime.sendMessage(message, (response) => {
        const errorMessage = getRuntimeLastErrorMessage(fallbackMessage);
        callback(errorMessage ? { ok: false, error: errorMessage } : response);
      });
    } catch (error) {
      callback({ ok: false, error: getExtensionUnavailableError(error, fallbackMessage) });
    }
  }

  function readStorageLocalSafely(keys, callback) {
    if (!isExtensionContextAvailable()) {
      callback({}, "扩展已重新加载，请刷新页面后重试");
      return;
    }

    try {
      chrome.storage.local.get(keys, (result) => {
        callback(result || {}, getRuntimeLastErrorMessage("读取本地设置失败"));
      });
    } catch (error) {
      callback({}, getExtensionUnavailableError(error, "读取本地设置失败"));
    }
  }

  function writeStorageLocalSafely(values) {
    if (!isExtensionContextAvailable()) {
      return;
    }

    try {
      chrome.storage.local.set(values);
    } catch (error) {
      getExtensionUnavailableError(error);
    }
  }

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


  function dispatchSettings(settings) {
    currentSettings = normalizeAiSettings(settings);
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_EVENT, {
      detail: stringifyEventDetail({
        enabled: currentSettings.enabled,
        provider: currentSettings.provider,
        endpointMode: currentSettings.endpointMode,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        apiKey: currentSettings.apiKey,
        allowEmoji: currentSettings.allowEmoji,
        autoPopup: currentSettings.autoPopup,
        summaryPrompt: currentSettings.summaryPrompt
      })
    }));
  }

  function readSettings() {
    readStorageLocalSafely(AI_SETTINGS_STORAGE_KEY, (result) => {
      dispatchSettings(result?.[AI_SETTINGS_STORAGE_KEY]);
    });
  }

  function sendChatResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(AI_CHAT_RESPONSE_EVENT, {
      detail: stringifyEventDetail({
        id,
        ...payload
      })
    }));
  }

  function sendModelListResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(AI_MODEL_LIST_RESPONSE_EVENT, {
      detail: stringifyEventDetail({
        id,
        ...payload
      })
    }));
  }

  function sendSanitizedCookieRuleResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(SANITIZED_COOKIE_RULE_RESPONSE_EVENT, {
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

    sendRuntimeMessageSafely({
      type: "better-xiaoheihe-ai-chat",
      detail: {
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: Number.isFinite(detail?.temperature) ? detail.temperature : 0.2
      }
    }, "AI 请求失败", (response) => {
      sendChatResponse(id, response || {
        ok: false,
        error: "AI 请求失败"
      });
    });
  }

  function requestModelList(detail) {
    const id = detail?.id || "";
    const settings = normalizeAiSettings(detail?.settings || currentSettings);
    if (!id || !settings.baseUrl) {
      sendModelListResponse(id, { ok: false, error: "请先填写 Base URL" });
      return;
    }

    sendRuntimeMessageSafely({
      type: detail?.cacheOnly ? "better-xiaoheihe-ai-get-model-cache" : "better-xiaoheihe-ai-list-models",
      detail: {
        settings
      }
    }, "模型列表拉取失败", (response) => {
      sendModelListResponse(id, response || {
        ok: false,
        error: "模型列表拉取失败"
      });
    });
  }

  function requestSanitizedCookieRuleChange(detail = {}) {
    const id = detail?.id || "";
    const action = detail?.action === "release" ? "release" : "activate";
    sendRuntimeMessageSafely({
      type: action === "release"
        ? "better-xiaoheihe-release-sanitized-comment-cookie"
        : "better-xiaoheihe-activate-sanitized-comment-cookie",
      detail: {
        id,
        cookieHeader: String(detail?.cookieHeader || "")
      }
    }, "请求头规则处理失败", (response) => {
      sendSanitizedCookieRuleResponse(id, response || {
        ok: false,
        error: "请求头规则处理失败"
      });
    });
  }

  function getRequestedLocalSettingsKeys(detail) {
    const requestedKeys = Array.isArray(detail?.keys) ? detail.keys : LOCAL_SETTINGS_STORAGE_KEYS;
    return requestedKeys.filter((key) => LOCAL_SETTINGS_STORAGE_KEYS.includes(key));
  }

  function dispatchLocalSettingsResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(LOCAL_SETTINGS_RESPONSE_EVENT, {
      detail: stringifyEventDetail({
        id,
        ...payload
      })
    }));
  }

  function readLocalSettings(detail = {}) {
    const id = detail?.id || "";
    const keys = getRequestedLocalSettingsKeys(detail);
    readStorageLocalSafely(keys, (result, errorMessage) => {
      if (errorMessage) {
        dispatchLocalSettingsResponse(id, {
          ok: false,
          error: errorMessage,
          values: {},
          keysPresent: {}
        });
        return;
      }

      dispatchLocalSettingsResponse(id, {
        ok: true,
        values: result || {},
        keysPresent: keys.reduce((present, key) => {
          present[key] = Object.prototype.hasOwnProperty.call(result || {}, key);
          return present;
        }, {})
      });
    });
  }

  function saveLocalSettings(detail = {}) {
    const sourceValues = detail?.values && typeof detail.values === "object" ? detail.values : detail;
    const values = LOCAL_SETTINGS_STORAGE_KEYS.reduce((nextValues, key) => {
      if (Object.prototype.hasOwnProperty.call(sourceValues || {}, key)) {
        nextValues[key] = sourceValues[key];
      }
      return nextValues;
    }, {});

    if (!Object.keys(values).length) {
      return;
    }

    writeStorageLocalSafely(values);
  }

  window.addEventListener(AI_SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(AI_SETTINGS_SAVE_EVENT, (event) => {
    const nextSettings = normalizeAiSettings(parseEventDetail(event.detail));
    dispatchSettings(nextSettings);
    writeStorageLocalSafely({
      [AI_SETTINGS_STORAGE_KEY]: nextSettings
    });
  });
  window.addEventListener(AI_CHAT_REQUEST_EVENT, (event) => requestChat(parseEventDetail(event.detail)));
  window.addEventListener(AI_MODEL_LIST_REQUEST_EVENT, (event) => requestModelList(parseEventDetail(event.detail)));
  window.addEventListener(SANITIZED_COOKIE_RULE_REQUEST_EVENT, (event) => requestSanitizedCookieRuleChange(parseEventDetail(event.detail)));
  window.addEventListener(LOCAL_SETTINGS_REQUEST_EVENT, (event) => readLocalSettings(parseEventDetail(event.detail)));
  window.addEventListener(LOCAL_SETTINGS_SAVE_EVENT, (event) => saveLocalSettings(parseEventDetail(event.detail)));

  if (isExtensionContextAvailable()) {
    try {
      chrome.runtime.onMessage.addListener((message) => {
        if (message?.type !== "better-xiaoheihe-open-page-settings") {
          return false;
        }
        window.dispatchEvent(new CustomEvent(OPEN_PAGE_SETTINGS_EVENT, {
          detail: stringifyEventDetail(message.detail || {})
        }));
        return false;
      });

      chrome.storage.onChanged.addListener((changes, areaName) => {
        try {
          if (areaName === "local" && changes[AI_SETTINGS_STORAGE_KEY]) {
            dispatchSettings(changes[AI_SETTINGS_STORAGE_KEY].newValue);
          }

          if (areaName !== "local") {
            return;
          }

          const localSettingsChanges = Object.keys(changes).reduce((result, key) => {
            if (LOCAL_SETTINGS_STORAGE_KEYS.includes(key)) {
              result[key] = {
                oldValue: changes[key].oldValue,
                newValue: changes[key].newValue
              };
            }
            return result;
          }, {});

          if (Object.keys(localSettingsChanges).length) {
            window.dispatchEvent(new CustomEvent(LOCAL_SETTINGS_CHANGED_EVENT, {
              detail: stringifyEventDetail({
                changes: localSettingsChanges,
                values: Object.keys(localSettingsChanges).reduce((values, key) => {
                  values[key] = localSettingsChanges[key].newValue;
                  return values;
                }, {})
              })
            }));
          }
        } catch (error) {
          getExtensionUnavailableError(error);
        }
      });
    } catch (error) {
      getExtensionUnavailableError(error);
    }
  }

  readSettings();
  // END src\ai-bridge\bridge.js
})();
