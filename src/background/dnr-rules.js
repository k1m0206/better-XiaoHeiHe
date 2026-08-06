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

