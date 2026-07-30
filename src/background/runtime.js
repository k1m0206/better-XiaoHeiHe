// 后台安装、启动、storage、message 和 alarm 监听；AI Bot 熔断期间相关消息统一拒绝执行。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  chrome.runtime.onInstalled?.addListener(() => {
    syncAiBotAlarm({ reset: true });
  });

  chrome.runtime.onStartup?.addListener(() => {
    syncAiBotAlarm();
  });

  chrome.alarms?.onAlarm?.addListener((alarm) => {
    if (alarm?.name === AI_BOT_ALARM_NAME) {
      runAiBotPoll("alarm");
    }
    if (alarm?.name === AI_BOT_FEED_ALARM_NAME) {
      runAiBotFeedComment().catch(() => {});
    }
    if (alarm?.name === AI_BOT_QUEUE_ALARM_NAME) {
      runAiBotQueueConsumer().catch(() => {});
    }
  });

  chrome.storage.onChanged?.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_BOT_SETTINGS_STORAGE_KEY]) {
      const wasEnabled = normalizeAiBotSettings(changes[AI_BOT_SETTINGS_STORAGE_KEY].oldValue).enabled;
      const isEnabled = normalizeAiBotSettings(changes[AI_BOT_SETTINGS_STORAGE_KEY].newValue).enabled;
      if (!wasEnabled && isEnabled) {
        resetAiBotCommentFailures();
      }
      syncAiBotAlarm({ reset: true });
    }
    if (areaName === "local" && changes[AI_BOT_CONSENT_STORAGE_KEY]) {
      syncAiBotAlarm({ reset: true });
    }
    if (areaName === "local" && changes[API_PARAMS_STORAGE_KEY]) {
      cachedApiParams = normalizeCachedApiParams(changes[API_PARAMS_STORAGE_KEY].newValue);
    }
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

    if (message?.type === "better-xiaoheihe-ai-bot-test") {
      if (!AI_BOT_FEATURE_ENABLED) {
        sendResponse({ ok: false, disabled: true, error: "AI Bot 功能已停用" });
        return false;
      }
      requestChat({
        messages: [{ role: "user", content: "请回复 OK" }],
        temperature: 0
      }, {
        ...message.detail?.settings,
        enabled: true
      }).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-status") {
      getAiBotStatus().then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-run-now") {
      if (!AI_BOT_FEATURE_ENABLED) {
        sendResponse({ ok: false, disabled: true, error: "AI Bot 功能已停用" });
        return false;
      }
      runAiBotPoll("manual").then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-clear-logs") {
      storageSet({
        [AI_BOT_LOGS_STORAGE_KEY]: [],
        [AI_BOT_MESSAGE_LOGS_STORAGE_KEY]: []
      }).then(() => sendResponse({ ok: true }));
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

  syncAiBotAlarm();
