(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const SETTINGS_SAVE_EVENT = "better-xiaoheihe-ai-settings-save";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const MODEL_LIST_REQUEST_EVENT = "better-xiaoheihe-ai-model-list-request";
  const MODEL_LIST_RESPONSE_EVENT = "better-xiaoheihe-ai-model-list-response";
  const SANITIZED_COOKIE_RULE_REQUEST_EVENT = "better-xiaoheihe-sanitized-cookie-rule-request";
  const SANITIZED_COOKIE_RULE_RESPONSE_EVENT = "better-xiaoheihe-sanitized-cookie-rule-response";
  const LOCAL_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-local-settings-request";
  const LOCAL_SETTINGS_RESPONSE_EVENT = "better-xiaoheihe-local-settings-response";
  const LOCAL_SETTINGS_SAVE_EVENT = "better-xiaoheihe-local-settings-save";
  const LOCAL_SETTINGS_CHANGED_EVENT = "better-xiaoheihe-local-settings-changed";
  const AI_BOT_RUNTIME_REQUEST_EVENT = "better-xiaoheihe-ai-bot-runtime-request";
  const AI_BOT_RUNTIME_RESPONSE_EVENT = "better-xiaoheihe-ai-bot-runtime-response";
  const OPEN_PAGE_SETTINGS_EVENT = "better-xiaoheihe-open-page-settings";
  const LOCAL_SETTINGS_STORAGE_KEYS = [
    "better-xiaoheihe-hide-cy-comments",
    "better-xiaoheihe-blocked-keywords",
    "better-xiaoheihe-level-filters",
    "better-xiaoheihe-comment-preview-sort",
    "better-xiaoheihe-ai-bot-settings",
    "better-xiaoheihe-ai-bot-logs",
    "better-xiaoheihe-ai-bot-message-logs",
    "better-xiaoheihe-ai-bot-reply-queue",
    "better-xiaoheihe-api-params",
    "better-xiaoheihe-ui-state"
  ];
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

  function normalizeAiSettings(settings) {
    const provider = Object.values(AI_PROVIDERS).includes(settings?.provider || settings?.endpointMode)
      ? (settings?.provider || settings?.endpointMode)
      : DEFAULT_PROVIDER;
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: String(settings?.baseUrl || PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      allowEmoji: settings?.allowEmoji !== false,
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function dispatchSettings(settings) {
    currentSettings = normalizeAiSettings(settings);
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, {
      detail: stringifyEventDetail({
        enabled: currentSettings.enabled,
        provider: currentSettings.provider,
        endpointMode: currentSettings.endpointMode,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        apiKey: currentSettings.apiKey,
        allowEmoji: currentSettings.allowEmoji,
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
    window.dispatchEvent(new CustomEvent(CHAT_RESPONSE_EVENT, {
      detail: stringifyEventDetail({
        id,
        ...payload
      })
    }));
  }

  function sendModelListResponse(id, payload) {
    window.dispatchEvent(new CustomEvent(MODEL_LIST_RESPONSE_EVENT, {
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

  function requestAiBotRuntime(detail = {}) {
    const id = detail?.id || "";
    const type = String(detail?.type || "");
    if (!id || !type) {
      return;
    }

    sendRuntimeMessageSafely({
      type,
      detail: detail?.detail || {}
    }, "请求失败", (response) => {
      window.dispatchEvent(new CustomEvent(AI_BOT_RUNTIME_RESPONSE_EVENT, {
        detail: stringifyEventDetail({
          id,
          ...(response || { ok: false, error: "请求失败" })
        })
      }));
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

  window.addEventListener(SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(SETTINGS_SAVE_EVENT, (event) => {
    const nextSettings = normalizeAiSettings(parseEventDetail(event.detail));
    dispatchSettings(nextSettings);
    writeStorageLocalSafely({
      [AI_SETTINGS_STORAGE_KEY]: nextSettings
    });
  });
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(parseEventDetail(event.detail)));
  window.addEventListener(MODEL_LIST_REQUEST_EVENT, (event) => requestModelList(parseEventDetail(event.detail)));
  window.addEventListener(SANITIZED_COOKIE_RULE_REQUEST_EVENT, (event) => requestSanitizedCookieRuleChange(parseEventDetail(event.detail)));
  window.addEventListener(AI_BOT_RUNTIME_REQUEST_EVENT, (event) => requestAiBotRuntime(parseEventDetail(event.detail)));
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
})();
