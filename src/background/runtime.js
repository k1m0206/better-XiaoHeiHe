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
