// 路由监听、页面观察、全局事件绑定和启动流程。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function handlePage() {
    if (!isEnhancedPage()) {
      document.documentElement.classList.remove(HOME_LAYOUT_CLASS);
      document.documentElement.classList.remove(LINK_DETAIL_LAYOUT_CLASS);
      restoreLeftMenu();
      removeHotSearchSidebar();
      removeFavoriteEntry();
      removeSettingsEntry();
      removeHeaderMoreMenu();
      closeTopicBlockMenu();
      return;
    }

    const wasLinkPage = document.documentElement.classList.contains(LINK_DETAIL_LAYOUT_CLASS);

    injectLayoutStyle();
    ensureHeaderMoreMenu();
    ensureFavoriteEntry();
    ensureSettingsEntry();

    document.documentElement.classList.add(HOME_LAYOUT_CLASS);
    document.documentElement.classList.toggle(LINK_DETAIL_LAYOUT_CLASS, isLinkPage());
    moveLeftMenuToTop();
    moveSearchHotListToLeftSidebar();
    removeRightContent();
    if (isLinkPage()) {
      addFilterToBbsLink();
    } else {
      enhanceFeed();
      if (wasLinkPage && savedScrollY !== null) {
        const targetY = savedScrollY;
        savedScrollY = null;
        window.requestAnimationFrame(() => {
          window.scrollTo(0, targetY);
        });
      }
    }

  }

  function scheduleHandlePage() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      handlingPage = true;
      handlePage();
      handlingPage = false;
    });
  }

  function scheduleHandlePageAfterRoute() {
    window.setTimeout(scheduleHandlePage, 0);
    window.setTimeout(scheduleHandlePage, 120);
  }

  function scheduleLinkPageFilterRefresh() {
    if (!isLinkPage()) {
      return;
    }

    if (linkPageFilterRefreshTimer) {
      window.clearTimeout(linkPageFilterRefreshTimer);
    }
    window.requestAnimationFrame(updateLinkPageFilterControls);
    linkPageFilterRefreshTimer = window.setTimeout(() => {
      linkPageFilterRefreshTimer = null;
      ensureLinkPageFilterControls();
      updateLinkPageFilterControls();
    }, 160);
  }

  function mutationNodeMatches(node, selector) {
    return node?.nodeType === Node.ELEMENT_NODE
      && (node.matches(selector) || Boolean(node.querySelector(selector)));
  }

  function mutationTargetMatches(mutation, selector) {
    const target = mutation.target?.nodeType === Node.ELEMENT_NODE
      ? mutation.target
      : mutation.target?.parentElement;
    return mutationNodeMatches(target, selector);
  }

  function shouldRefreshLinkPageForMutations(mutations) {
    const commentStructureSelector = [
      '.link-comment',
      '.link-comment__list',
      '.link-comment__comment-item',
      '.comment-children-item',
      '.comment-item__content',
      '.children-item__comment-content'
    ].join(', ');
    const setupStructureSelector = [
      '.link-comment .hb-cpt__pagination-inner',
      '.hb-bbs-link__header',
      '.scroll-list__no-more-desc'
    ].join(', ');

    return mutations.some((mutation) => {
      if (
        mutationTargetMatches(mutation, commentStructureSelector)
        || mutationTargetMatches(mutation, setupStructureSelector)
      ) {
        return true;
      }

      const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return changedNodes.some((node) => (
        mutationNodeMatches(node, commentStructureSelector)
        || mutationNodeMatches(node, setupStructureSelector)
      ));
    });
  }

  function shouldRefreshHomePageForMutations(mutations) {
    const homeStructureSelector = [
      FEED_ITEM_SELECTOR,
      `.${ROW_CLASS}`,
      ".hb-bbs-home",
      ".bbs-home__content-list",
      ".bbs-home__content-item"
    ].join(", ");

    return mutations.some((mutation) => {
      const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return changedNodes.some((node) => mutationNodeMatches(node, homeStructureSelector));
    });
  }

  function observePage() {
    const observer = new MutationObserver((mutations) => {
      if (handlingPage) {
        return;
      }
      if (isLinkPage()) {
        if (shouldRefreshLinkPageForMutations(mutations)) {
          scheduleLinkPageFilterRefresh();
        }
        return;
      }

      if (shouldRefreshHomePageForMutations(mutations)) {
        scheduleHandlePage();
        scheduleLinkPageFilterRefresh();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function installRouteHooks() {
    window.addEventListener("popstate", scheduleHandlePageAfterRoute);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      savedScrollY = window.scrollY;
      const result = originalPushState.apply(this, args);
      scheduleHandlePageAfterRoute();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      scheduleHandlePageAfterRoute();
      return result;
    };
  }

  function installLocalSettingsStateSync() {
    window.addEventListener("storage", (event) => {
      if (!useLegacyLocalSettingsSync) {
        return;
      }

      if (event.key === HIDE_CY_COMMENTS_STORAGE_KEY) {
        syncLegacyHideCyCommentsState();
      }
      if (event.key === BLOCKED_KEYWORDS_STORAGE_KEY) {
        syncLegacyBlockedKeywordsState();
      }
      if (event.key === LEVEL_FILTERS_STORAGE_KEY) {
        syncLegacyLevelFiltersState();
      }
      if (event.key === COMMENT_PREVIEW_SORT_STORAGE_KEY) {
        syncCommentPreviewSortState(localStorage.getItem(COMMENT_PREVIEW_SORT_STORAGE_KEY));
      }
    });

    window.addEventListener(LOCAL_SETTINGS_CHANGED_EVENT, (event) => {
      const detail = parseEventDetail(event.detail);
      const values = detail.values || {};
      if (Object.prototype.hasOwnProperty.call(values, HIDE_CY_COMMENTS_STORAGE_KEY)) {
        syncHideCyCommentsState(values[HIDE_CY_COMMENTS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, BLOCKED_KEYWORDS_STORAGE_KEY)) {
        syncBlockedKeywordsState(values[BLOCKED_KEYWORDS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, LEVEL_FILTERS_STORAGE_KEY)) {
        syncLevelFiltersState(values[LEVEL_FILTERS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, COMMENT_PREVIEW_SORT_STORAGE_KEY)) {
        syncCommentPreviewSortState(values[COMMENT_PREVIEW_SORT_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, UI_STATE_STORAGE_KEY)) {
        syncUiState(values[UI_STATE_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, COMMENT_EMOJI_USAGE_STORAGE_KEY)) {
        syncEmojiUsageStats(values[COMMENT_EMOJI_USAGE_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_SETTINGS_STORAGE_KEY)) {
        aiBotSettings = normalizeAiBotSettings(values[AI_BOT_SETTINGS_STORAGE_KEY]);
        const settingsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
        const isEditingAiBotSettings = activeSettingsTab === SETTINGS_TABS.AIBOT
          && settingsPanel
          && !settingsPanel.hidden
          && settingsPanel.contains(document.activeElement);
        if (!isEditingAiBotSettings) {
          renderSettingsPanel();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_CONSENT_STORAGE_KEY)) {
        aiBotConsentAccepted = values[AI_BOT_CONSENT_STORAGE_KEY] === true;
        if (activeSettingsTab === SETTINGS_TABS.AIBOT) {
          renderSettingsPanel();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_LOGS_STORAGE_KEY)) {
        aiBotLogs = normalizeAiBotLogs(values[AI_BOT_LOGS_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          updateAiBotRuntimeLogList();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_MESSAGE_LOGS_STORAGE_KEY)) {
        aiBotMessageLogs = normalizeAiBotMessageLogs(values[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          refreshAiBotTodayStatsPanel();
          loadEmojis().finally(() => {
            const messageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
            if (messageLogList) {
              const signature = getAiBotMessageLogSignature();
              if (messageLogList.dataset.signature === signature) {
                return;
              }
              const previousScrollTop = messageLogList.scrollTop;
              const wasNearTop = previousScrollTop <= 4;
              messageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
              messageLogList.dataset.signature = signature;
              messageLogList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, messageLogList.scrollHeight);
            }
          });
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_REPLY_QUEUE_STORAGE_KEY)) {
        aiBotReplyQueue = normalizeAiBotReplyQueue(values[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          loadEmojis().finally(() => {
            const pendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
            if (pendingLogList) {
              const signature = `${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`;
              if (pendingLogList.dataset.signature === signature) {
                return;
              }
              const previousScrollTop = pendingLogList.scrollTop;
              const wasNearTop = previousScrollTop <= 4;
              pendingLogList.innerHTML = renderAiBotReplyQueueItemsHtml();
              pendingLogList.dataset.signature = signature;
              pendingLogList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, pendingLogList.scrollHeight);
            }
          });
        }
      }
    });
  }

  function bindFeedAiCapture() {
    if (feedAiCaptureBound) {
      return;
    }

    feedAiCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const aiButton = event.target.closest(".better-ai-summary-button");
      const item = aiButton?.closest(FEED_ITEM_SELECTOR);
      if (!aiButton || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const linkId = getLinkIdFromItem(item);
      if (!linkId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      summarizeFeedItem(item, linkId, aiButton);
    }, true);
  }

  function bindHeyboxWebLinkCapture() {
    if (heyboxWebLinkCaptureBound) {
      return;
    }

    heyboxWebLinkCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest(
        ".better-comment-preview__text a, .better-comment-preview__reply-text a, .link-comment .comment-item__content a"
      );
      if (!link || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      if (link.closest(".comment-item__image-box, .comment-item__image-wrapper") || link.querySelector("img")) {
        return;
      }

      const webHref = getHeyboxWebHref(link.getAttribute("href") || "");
      if (!webHref) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.href = webHref;
    }, true);
  }

  function bindReplyEmojiOutsideClick() {
    if (replyEmojiOutsideClickBound) {
      return;
    }

    replyEmojiOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        closeOtherReplyEmojiPanels();
        return;
      }

      const emojiOption = event.target.closest(".better-comment-preview__emoji-option");
      if (emojiOption) {
        const form = getOpenReplyEmojiForm();
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          insertEmojiIntoReplyForm(form, emojiOption.dataset.emojiText || "");
        }
        return;
      }

      if (event.target.closest(".better-comment-preview__emoji-panel, .better-comment-preview__emoji-toggle")) {
        return;
      }

      closeOtherReplyEmojiPanels();
    });
    window.addEventListener("resize", () => {
      const form = getOpenReplyEmojiForm();
      if (form) {
        positionReplyEmojiPanel(form);
      }
    });
    window.addEventListener("scroll", (event) => {
      if (event.target instanceof Element && event.target.closest(".better-comment-preview__emoji-panel")) {
        return;
      }

      const form = getOpenReplyEmojiForm();
      if (form) {
        positionReplyEmojiPanel(form);
      }
    }, true);
  }

  function installAiSettingsSync() {
    window.addEventListener(OPEN_PAGE_SETTINGS_EVENT, handleOpenPageSettings);
    window.addEventListener(AI_SETTINGS_EVENT, (event) => {
      let settingsDetail = {};
      try {
        settingsDetail = typeof event.detail === "string" ? JSON.parse(event.detail) : (event.detail || {});
      } catch {
        settingsDetail = {};
      }
      const previousSummaryConfigKey = JSON.stringify({
        enabled: aiSettings.enabled,
        provider: aiSettings.provider,
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model,
        apiKey: aiSettings.apiKey,
        allowEmoji: aiSettings.allowEmoji,
        summaryPrompt: aiSettings.summaryPrompt
      });
      aiSettings = normalizeAiSettings(settingsDetail);
      const nextSummaryConfigKey = JSON.stringify({
        enabled: aiSettings.enabled,
        provider: aiSettings.provider,
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model,
        apiKey: aiSettings.apiKey,
        allowEmoji: aiSettings.allowEmoji,
        summaryPrompt: aiSettings.summaryPrompt
      });
      if (nextSummaryConfigKey !== previousSummaryConfigKey) {
        aiSummaryCache.clear();
      }
      const settingsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      const isEditingAiSettings = activeSettingsTab === SETTINGS_TABS.AI
        && settingsPanel
        && !settingsPanel.hidden
        && settingsPanel.contains(document.activeElement);
      if (!isEditingAiSettings) {
        renderSettingsPanel();
      }
      syncAiSummaryButtons();
    });
    window.addEventListener(AI_CHAT_RESPONSE_EVENT, handleAiChatResponse);
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_REQUEST_EVENT));
  }

  async function start() {
    installApiParamCapture();
    captureExistingApiEntries();
    bindFeedAiCapture();
    bindFeedAwardCapture();
    bindFeedImageCapture();
    bindHeyboxWebLinkCapture();
    bindTopicBlockContextMenu();
    bindReplyEmojiOutsideClick();
    installLocalSettingsStateSync();
    await loadLocalSettingsState();
    installAiSettingsSync();
    scheduleHandlePage();
    observePage();
    installRouteHooks();
  }

  if (document.documentElement) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
