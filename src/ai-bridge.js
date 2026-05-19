(function () {
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const SETTINGS_SAVE_EVENT = "better-xiaoheihe-ai-settings-save";
  const SETTINGS_OPEN_EVENT = "better-xiaoheihe-ai-settings-open";
  const CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const SANITIZED_COOKIE_RULE_REQUEST_EVENT = "better-xiaoheihe-sanitized-cookie-rule-request";
  const SANITIZED_COOKIE_RULE_RESPONSE_EVENT = "better-xiaoheihe-sanitized-cookie-rule-response";
  const LOCAL_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-local-settings-request";
  const LOCAL_SETTINGS_RESPONSE_EVENT = "better-xiaoheihe-local-settings-response";
  const LOCAL_SETTINGS_SAVE_EVENT = "better-xiaoheihe-local-settings-save";
  const LOCAL_SETTINGS_CHANGED_EVENT = "better-xiaoheihe-local-settings-changed";
  const LOCAL_SETTINGS_STORAGE_KEYS = [
    "better-xiaoheihe-hide-cy-comments",
    "better-xiaoheihe-blocked-keywords",
    "better-xiaoheihe-level-filters"
  ];
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  let currentSettings = normalizeAiSettings();

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
    return {
      enabled: settings?.enabled !== false,
      baseUrl: String(settings?.baseUrl || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function dispatchSettings(settings) {
    currentSettings = normalizeAiSettings(settings);
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, {
      detail: stringifyEventDetail({
        enabled: currentSettings.enabled,
        baseUrl: currentSettings.baseUrl,
        model: currentSettings.model,
        apiKey: currentSettings.apiKey,
        summaryPrompt: currentSettings.summaryPrompt
      })
    }));
  }

  function readSettings() {
    chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
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

    chrome.runtime.sendMessage({
      type: "better-xiaoheihe-ai-chat",
      detail: {
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: Number.isFinite(detail?.temperature) ? detail.temperature : 0.2
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        sendChatResponse(id, {
          ok: false,
          error: chrome.runtime.lastError.message || "AI 请求失败"
        });
        return;
      }

      sendChatResponse(id, response || {
        ok: false,
        error: "AI 请求失败"
      });
    });
  }

  function requestSanitizedCookieRuleChange(detail = {}) {
    const id = detail?.id || "";
    const action = detail?.action === "release" ? "release" : "activate";
    chrome.runtime.sendMessage({
      type: action === "release"
        ? "better-xiaoheihe-release-sanitized-comment-cookie"
        : "better-xiaoheihe-activate-sanitized-comment-cookie",
      detail: {
        id,
        cookieHeader: String(detail?.cookieHeader || "")
      }
    }, (response) => {
      if (chrome.runtime.lastError) {
        sendSanitizedCookieRuleResponse(id, {
          ok: false,
          error: chrome.runtime.lastError.message || "请求头规则处理失败"
        });
        return;
      }

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
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        dispatchLocalSettingsResponse(id, {
          ok: false,
          error: chrome.runtime.lastError.message || "读取本地设置失败",
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

    chrome.storage.local.set(values);
  }

  window.addEventListener(SETTINGS_REQUEST_EVENT, readSettings);
  window.addEventListener(SETTINGS_SAVE_EVENT, (event) => {
    const nextSettings = normalizeAiSettings(parseEventDetail(event.detail));
    dispatchSettings(nextSettings);
    chrome.storage.local.set({
      [AI_SETTINGS_STORAGE_KEY]: nextSettings
    });
  });
  window.addEventListener(SETTINGS_OPEN_EVENT, () => {
    chrome.runtime.sendMessage({ type: "better-xiaoheihe-open-ai-settings" });
  });
  window.addEventListener(CHAT_REQUEST_EVENT, (event) => requestChat(parseEventDetail(event.detail)));
  window.addEventListener(SANITIZED_COOKIE_RULE_REQUEST_EVENT, (event) => requestSanitizedCookieRuleChange(parseEventDetail(event.detail)));
  window.addEventListener(LOCAL_SETTINGS_REQUEST_EVENT, (event) => readLocalSettings(parseEventDetail(event.detail)));
  window.addEventListener(LOCAL_SETTINGS_SAVE_EVENT, (event) => saveLocalSettings(parseEventDetail(event.detail)));

  chrome.storage.onChanged.addListener((changes, areaName) => {
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
  });

  readSettings();
})();
