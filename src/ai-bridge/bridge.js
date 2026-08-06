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
