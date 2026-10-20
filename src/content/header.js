// 顶部收藏、搜索和消息入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function ensureFavoriteEntry() {
    const headerMessageButton = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    const nativeMessageButton = document.querySelector(".hb-view-header .message-center__btn");
    const anchor = headerMessageButton || nativeMessageButton;
    if (!anchor) {
      removeFavoriteEntry();
      return;
    }

    let entry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("button");
      entry.className = FAVORITE_ENTRY_CLASS;
      entry.type = "button";
      entry.innerHTML = `
        <svg class="better-xiaoheihe-favorite-entry__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 4.75A2.25 2.25 0 0 1 8.75 2.5h6.5a2.25 2.25 0 0 1 2.25 2.25v16.1a.75.75 0 0 1-1.18.61L12 18.43l-4.32 3.03a.75.75 0 0 1-1.18-.61V4.75Z"></path>
        </svg>
      `;
      entry.title = "查看收藏";
      entry.setAttribute("aria-label", "查看收藏");
      entry.setAttribute("aria-expanded", "false");
    }
    entry.onpointerdown = (event) => handleFavoriteEntryClick(event, entry);
    entry.onclick = (event) => handleFavoriteEntryClick(event, entry);
    bindFavoriteEntryClickDelegation();

    if (entry.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", entry);
    }
  }

  function getCurrentSearchQuery() {
    if (!isSearchPage()) {
      return "";
    }

    try {
      return new URL(window.location.href).searchParams.get("q") || "";
    } catch (error) {
      return "";
    }
  }

  function removeMessagePopover() {
    document.querySelector(`.${MESSAGE_POPOVER_CLASS}`)?.remove();
    document.querySelector(`.${HEADER_MESSAGE_CLASS}`)?.setAttribute("aria-expanded", "false");
  }

  function removeFavoritePopover() {
    document.querySelector(`.${FAVORITE_POPOVER_CLASS}`)?.remove();
    document.querySelector(`.${FAVORITE_ENTRY_CLASS}`)?.setAttribute("aria-expanded", "false");
  }

  function ensureFavoritePopover() {
    let popover = document.querySelector(`.${FAVORITE_POPOVER_CLASS}`);
    if (popover) {
      return popover;
    }

    popover = document.createElement("div");
    popover.className = FAVORITE_POPOVER_CLASS;
    popover.hidden = true;
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", "收藏");
    popover.innerHTML = `
      <div class="better-message-popover__header">
        <div class="better-message-popover__title">
          <strong>收藏</strong>
        </div>
        <a class="better-favorite-popover__all-link" href="/app/user/favour/content" target="_blank" rel="noopener noreferrer" title="在新标签页打开站内收藏页">
          站内收藏页
          <span aria-hidden="true">›</span>
        </a>
      </div>
      <div class="better-message-popover__body"></div>
    `;
    popover.querySelector(".better-message-popover__body")?.addEventListener("scroll", (event) => {
      handleFavoritePopoverScroll(event.currentTarget);
    });
    bindHeaderPopoverInteractions(popover);
    bindFavoriteBrowserInteractions(popover);
    document.body.appendChild(popover);
    return popover;
  }

  function removeHeaderMessage() {
    document.querySelectorAll(`.${HEADER_MESSAGE_CLASS}`).forEach((entry) => {
      entry.remove();
    });
    removeMessagePopover();
  }

  function ensureMessagePopover() {
    let popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
    if (popover) {
      return popover;
    }

    popover = document.createElement("div");
    popover.className = MESSAGE_POPOVER_CLASS;
    popover.hidden = true;
    popover.innerHTML = `
      <div class="better-message-popover__header">
        <div class="better-message-popover__title">
          <strong>消息</strong>
        </div>
        <div class="better-message-popover__tabs" role="tablist" aria-label="消息类型">
          <button class="better-message-popover__tab" type="button" role="tab" data-message-tab="reply" aria-selected="true">回复</button>
          <button class="better-message-popover__tab" type="button" role="tab" data-message-tab="award" aria-selected="false">点赞</button>
        </div>
      </div>
      <div class="better-message-popover__body">
        <div class="better-message-popover__state">点击刷新查看消息</div>
      </div>
    `;
    popover.querySelectorAll(".better-message-popover__tab").forEach((tab) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        setMessagePopoverTab(tab.dataset.messageTab || "reply");
      });
    });
    popover.querySelector(".better-message-popover__body")?.addEventListener("scroll", (event) => {
      const body = event.currentTarget;
      const state = getActiveMessageTabState();
      if (
        state.hasMore
        && !state.loading
        && body.scrollTop + body.clientHeight >= body.scrollHeight - 80
      ) {
        fetchAndRenderReplyMessages({ append: true });
      }
    });
    bindHeaderPopoverInteractions(popover);
    document.body.appendChild(popover);
    return popover;
  }

  function positionMessagePopover(button, popover) {
    if (!button || !popover || popover.hidden) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), Math.max(12, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 10, Math.max(12, window.innerHeight - 80));
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }

  function positionFavoritePopover(button, popover) {
    positionMessagePopover(button, popover);
  }

  function setMessagePopoverState(contentHtml) {
    const popover = ensureMessagePopover();
    const body = popover.querySelector(".better-message-popover__body");
    if (body) {
      body.innerHTML = contentHtml;
    }
  }

  function renderHeaderPopoverLoading(label) {
    return `
      <div class="better-message-popover__loading-state" role="status" aria-live="polite">
        <span class="better-message-popover__visually-hidden">${escapeHtml(label)}</span>
        ${Array.from({ length: 3 }, () => `
          <div class="better-message-popover__skeleton-card" aria-hidden="true">
            <div class="better-message-popover__skeleton-author">
              <span class="better-message-popover__skeleton better-message-popover__skeleton--avatar"></span>
              <span class="better-message-popover__skeleton better-message-popover__skeleton--name"></span>
            </div>
            <div class="better-message-popover__skeleton-content">
              <div class="better-message-popover__skeleton-copy">
                <span class="better-message-popover__skeleton better-message-popover__skeleton--title"></span>
                <span class="better-message-popover__skeleton better-message-popover__skeleton--text"></span>
                <span class="better-message-popover__skeleton better-message-popover__skeleton--text-short"></span>
              </div>
              <span class="better-message-popover__skeleton better-message-popover__skeleton--thumbnail"></span>
            </div>
            <div class="better-message-popover__skeleton-footer">
              <span class="better-message-popover__skeleton better-message-popover__skeleton--pill"></span>
              <span class="better-message-popover__skeleton better-message-popover__skeleton--pill-short"></span>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function normalizeHeaderProfileId(value) {
    const profileId = String(value || "").trim();
    return /^\d+$/.test(profileId) ? profileId : "";
  }

  function renderHeaderProfileAttributes(profileId, label = "查看用户主页") {
    const normalizedProfileId = normalizeHeaderProfileId(profileId);
    return normalizedProfileId
      ? ` data-better-profile-id="${escapeHtml(normalizedProfileId)}" role="link" tabindex="0" title="${escapeHtml(label)}"`
      : "";
  }

  function renderHeaderImageViewerAttributes(imageUrls, index = 0, label = "查看图片") {
    const urls = (Array.isArray(imageUrls) ? imageUrls : []).filter(isSafeCommentImageUrl);
    return urls.length
      ? ` data-better-image-urls="${escapeHtml(JSON.stringify(urls))}" data-better-image-index="${escapeHtml(index)}" role="button" tabindex="0" aria-label="${escapeHtml(label)}"`
      : "";
  }

  function activateHeaderPopoverInteraction(event) {
    if (!(event.target instanceof Element)) {
      return false;
    }

    const profileTarget = event.target.closest("[data-better-profile-id]");
    if (profileTarget) {
      const profileId = normalizeHeaderProfileId(profileTarget.dataset.betterProfileId);
      if (profileId) {
        event.preventDefault();
        event.stopPropagation();
        window.location.href = `/app/user/profile/${profileId}`;
        return true;
      }
    }

    const imageTarget = event.target.closest("[data-better-image-urls]");
    if (!imageTarget) {
      return false;
    }
    let imageUrls = [];
    try {
      imageUrls = JSON.parse(imageTarget.dataset.betterImageUrls || "[]");
    } catch {
      imageUrls = [];
    }
    if (!Array.isArray(imageUrls) || !imageUrls.length) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    return openImageViewerFromUrls(imageUrls, Number(imageTarget.dataset.betterImageIndex || 0));
  }

  function bindHeaderPopoverInteractions(popover) {
    if (!popover || popover.dataset.interactionsBound === "1") {
      return;
    }
    popover.dataset.interactionsBound = "1";
    popover.addEventListener("click", activateHeaderPopoverInteraction);
    popover.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key) || !(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest("[data-better-profile-id], [data-better-image-urls]")) {
        activateHeaderPopoverInteraction(event);
      }
    });
  }

  // 收藏数据归一化、收藏夹适配和列表渲染都在 favorite-browser.js 中实现。

  function getActiveMessageTabState() {
    return messagePopoverState.tabs[messagePopoverState.activeTab] || messagePopoverState.tabs.reply;
  }

  function updateMessagePopoverTabs() {
    const popover = ensureMessagePopover();
    popover.querySelectorAll(".better-message-popover__tab").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.messageTab === messagePopoverState.activeTab));
    });
  }

  function setMessagePopoverTab(tab) {
    messagePopoverState.activeTab = tab === "award" ? "award" : "reply";
    updateMessagePopoverTabs();
    const state = getActiveMessageTabState();
    if (state.messages.length) {
      renderReplyMessages(state);
      return;
    }
    fetchAndRenderReplyMessages();
  }

  function renderReplyMessages(state = getActiveMessageTabState(), options = {}) {
    const messages = state.messages || [];

    if (!messages.length) {
      setMessagePopoverState(`<div class="better-message-popover__state">暂时没有新的${messagePopoverState.activeTab === "award" ? "点赞" : "回复"}消息</div>`);
      return;
    }

    const animateFrom = Number.isFinite(options.animateFrom) ? Math.max(0, options.animateFrom) : messages.length;
    setMessagePopoverState(messages.map((message, messageIndex) => {
      const actors = Array.isArray(message.actors) ? message.actors : [];
      const visibleActors = actors.slice(0, 3);
      const hiddenActorCount = Math.max(0, Number(message.awardCount || actors.length || 0) - visibleActors.length);
      const actorAvatarHtml = visibleActors.length ? `
        <div class="better-message-popover__likers">
          ${visibleActors.map((actor) => actor.avatar
            ? `<img class="better-message-popover__liker-avatar" src="${escapeHtml(actor.avatar)}" alt=""${renderHeaderProfileAttributes(actor.id)}>`
            : `<span class="better-message-popover__liker-avatar"${renderHeaderProfileAttributes(actor.id)}>${escapeHtml(actor.avatarFallback)}</span>`).join("")}
          ${hiddenActorCount > 0 ? `<span class="better-message-popover__liker-more">+${escapeHtml(hiddenActorCount)}</span>` : ""}
        </div>
      ` : (message.avatar
        ? `<img class="better-message-popover__avatar" src="${escapeHtml(message.avatar)}" alt=""${renderHeaderProfileAttributes(message.userId)}>`
        : `<div class="better-message-popover__avatar"${renderHeaderProfileAttributes(message.userId)}>${escapeHtml(message.avatarFallback)}</div>`);
      const itemClass = [
        "better-message-popover__item",
        messageIndex >= animateFrom ? "better-message-popover__item--enter" : "",
        message.awardKind === "post" ? "better-message-popover__item--award-post" : "",
        message.awardKind === "comment" ? "better-message-popover__item--award-comment" : ""
      ].filter(Boolean).join(" ");
      return `
      <a class="${itemClass}" href="/app/bbs/link/${escapeHtml(message.linkId)}"${messageIndex >= animateFrom ? ` style="--better-popover-enter-index: ${Math.min(messageIndex - animateFrom, 8)}"` : ""}>
        <div class="better-message-popover__actor">
          ${actorAvatarHtml}
          <div class="better-message-popover__actor-main">
            <div class="better-message-popover__actor-line">
              <span class="better-message-popover__user"${renderHeaderProfileAttributes(message.userId)}>${escapeHtml(message.userName)}</span>
              ${renderUserLevel(message.userLevel)}
              <span class="better-message-popover__action">${escapeHtml(message.actionText)}</span>
              <span class="better-message-popover__type">${escapeHtml(message.typeLabel)}</span>
            </div>
            <span class="better-message-popover__time">${escapeHtml(formatCommentTime(message.timestamp))}</span>
          </div>
        </div>
        ${message.awardKind === "post" ? "" : (message.awardKind === "comment" ? `
          <div class="better-message-popover__comment-target">
            <span class="better-message-popover__comment-target-label">被点赞的评论</span>
            <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
            ${message.targetImages?.length ? `
              <div class="better-message-popover__target-images">
                ${message.targetImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="评论图片 ${escapeHtml(index + 1)}" loading="lazy"${renderHeaderImageViewerAttributes(message.targetImages, index, `查看评论图片 ${index + 1}`)}>`).join("")}
              </div>
            ` : ""}
          </div>
        ` : `
          <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
          ${message.contentImages?.length ? `
            <div class="better-message-popover__target-images">
              ${message.contentImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="回复图片 ${escapeHtml(index + 1)}" loading="lazy"${renderHeaderImageViewerAttributes(message.contentImages, index, `查看回复图片 ${index + 1}`)}>`).join("")}
            </div>
          ` : ""}
          ${message.replyTargetContent ? `
            <div class="better-message-popover__comment-target">
              <span class="better-message-popover__comment-target-label">被回复的内容</span>
              <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.replyTargetContent))}</div>
            </div>
          ` : ""}
        `)}
        <div class="better-message-popover__post">
          <div class="better-message-popover__context">
            ${message.linkAuthor ? `
              <div class="better-message-popover__post-author">
                ${message.linkAuthorAvatar ? `<img class="better-message-popover__post-author-avatar" src="${escapeHtml(message.linkAuthorAvatar)}" alt=""${renderHeaderProfileAttributes(message.linkAuthorId)}>` : `<span class="better-message-popover__post-author-avatar"${renderHeaderProfileAttributes(message.linkAuthorId)}>${escapeHtml(message.linkAuthorAvatarFallback)}</span>`}
                <span class="better-message-popover__post-author-name"${renderHeaderProfileAttributes(message.linkAuthorId)}>${escapeHtml(message.linkAuthor)}</span>
                ${renderUserLevel(message.linkAuthorLevel)}
              </div>
            ` : ""}
            <div class="better-message-popover__post-content-row">
              <div class="better-message-popover__post-copy">
                <span class="better-message-popover__link-title">${renderEmojiTokensInHtml(escapeHtml(message.title))}</span>
                ${message.description ? `<span class="better-message-popover__link-desc">${renderEmojiTokensInHtml(escapeHtml(message.description))}</span>` : ""}
              </div>
              ${message.linkImages?.length ? `
                <span class="better-message-popover__post-thumbnail"${renderHeaderImageViewerAttributes(message.linkImages, 0, `查看帖子图片，共 ${message.linkImages.length} 张`)}>
                  <img src="${escapeHtml(message.linkImages[0])}" alt="" loading="lazy" decoding="async">
                  ${message.linkImages.length > 1 ? `<span class="better-message-popover__post-image-count">+${escapeHtml(message.linkImages.length - 1)}</span>` : ""}
                </span>
              ` : ""}
            </div>
          </div>
        </div>
        ${(message.topicName || message.topicIcon) ? `<div class="better-message-popover__media-row better-message-popover__message-topic-row">${renderPostBrowserTopic(message)}</div>` : ""}
      </a>
    `;
    }).join("") + (state.loading
      ? '<div class="better-message-popover__footer-state">正在加载更多...</div>'
      : (state.hasMore ? '<div class="better-message-popover__footer-state">继续下滑加载更多</div>' : '<div class="better-message-popover__footer-state">没有更多消息了</div>')));
  }

  function fetchReplyMessages(options = {}) {
    const limit = Number(options.limit || 20);
    const tab = options.tab === "award" ? "award" : "reply";
    return runAfterIdentityCookiesRestored(() => fetch(buildMessageApiUrl({
      limit,
      offset: options.offset || 0,
      listType: tab === "award" ? 1 : 0
    }), {
      credentials: "include",
      headers: {
        accept: "application/json"
      }
    })).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "消息查询失败");
      }
      const rawMessages = data?.result?.messages || data?.result?.list || data?.result?.Lists || data?.messages || [];
      return {
        messages: normalizeReplyMessages(rawMessages, { tab }),
        hasMore: Array.isArray(rawMessages) && rawMessages.length >= limit
      };
    });
  }

  function fetchAndRenderReplyMessages(options = {}) {
    const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    const popover = ensureMessagePopover();
    const activeTab = messagePopoverState.activeTab;
    const activeState = getActiveMessageTabState();
    if (activeState.loading) {
      return Promise.resolve();
    }
    const append = options.append === true;
    const previousMessageCount = activeState.messages.length;
    activeState.loading = true;
    button?.classList.add("is-loading");
    if (!append) {
      activeState.messages = [];
      activeState.offset = 0;
      activeState.hasMore = true;
      setMessagePopoverState(renderHeaderPopoverLoading(`正在加载${activeTab === "award" ? "点赞" : "回复"}消息`));
    } else {
      renderReplyMessages(activeState);
    }
    return loadEmojis().then(() => fetchReplyMessages({ tab: activeTab, offset: append ? activeState.offset : 0, limit: 20 }))
      .then((payload) => {
        const mergedMessages = append
          ? [...activeState.messages, ...payload.messages]
          : payload.messages;
        const seenMessageIds = new Set();
        activeState.messages = mergedMessages.filter((message) => {
          const key = message.id || `${message.linkId}-${message.timestamp}-${message.content}`;
          if (seenMessageIds.has(key)) {
            return false;
          }
          seenMessageIds.add(key);
          return true;
        });
        activeState.offset = activeState.messages.length;
        activeState.hasMore = payload.hasMore;
        activeState.loading = false;
        renderReplyMessages(activeState, { animateFrom: append ? previousMessageCount : 0 });
      })
      .catch((error) => {
        activeState.loading = false;
        if (append && activeState.messages.length) {
          renderReplyMessages(activeState);
          return;
        }
        setMessagePopoverState(`<div class="better-message-popover__state">${escapeHtml(error?.message || "消息加载失败")}</div>`);
      })
      .finally(() => {
        button?.classList.remove("is-loading");
        positionMessagePopover(button, popover);
      });
  }

  function closeMessagePopover() {
    const popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
    const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    if (popover) {
      popover.hidden = true;
    }
    button?.setAttribute("aria-expanded", "false");
  }

  function bindMessagePopoverOutsideClick() {
    if (messagePopoverOutsideClickBound) {
      return;
    }

    messagePopoverOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      if (event.__betterHeaderMessageHandled) {
        return;
      }
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest(`.${MESSAGE_POPOVER_CLASS}, .${HEADER_MESSAGE_CLASS}, .${IMAGE_VIEWER_CLASS}`)) {
        return;
      }
      closeMessagePopover();
    }, true);
    window.addEventListener("resize", () => {
      const popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
      const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
      if (popover && button && !popover.hidden) {
        positionMessagePopover(button, popover);
      }
    });
  }

  function toggleMessagePopover(button) {
    const popover = ensureMessagePopover();
    const shouldOpen = popover.hidden;
    if (!shouldOpen) {
      closeMessagePopover();
      return;
    }
    popover.hidden = false;
    button.setAttribute("aria-expanded", "true");
    closeFavoritePopover();
    closeBrowseHistoryPopover();
    positionMessagePopover(button, popover);
    bindMessagePopoverOutsideClick();
    fetchAndRenderReplyMessages();
  }

  function closeFavoritePopover() {
    const popover = document.querySelector(`.${FAVORITE_POPOVER_CLASS}`);
    const button = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (popover) {
      popover.hidden = true;
    }
    button?.setAttribute("aria-expanded", "false");
  }

  function bindFavoritePopoverOutsideClick() {
    if (favoritePopoverOutsideClickBound) {
      return;
    }

    favoritePopoverOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest(`.${FAVORITE_POPOVER_CLASS}, .${FAVORITE_ENTRY_CLASS}, .${IMAGE_VIEWER_CLASS}`)) {
        return;
      }
      closeFavoritePopover();
    }, true);
    window.addEventListener("resize", () => {
      const popover = document.querySelector(`.${FAVORITE_POPOVER_CLASS}`);
      const button = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
      if (popover && button && !popover.hidden) {
        positionFavoritePopover(button, popover);
      }
    });
  }

  function toggleFavoritePopover(button) {
    const popover = ensureFavoritePopover();
    const shouldOpen = popover.hidden;
    if (!shouldOpen) {
      closeFavoritePopover();
      return;
    }
    popover.hidden = false;
    button.setAttribute("aria-expanded", "true");
    closeMessagePopover();
    closeBrowseHistoryPopover();
    positionFavoritePopover(button, popover);
    bindFavoritePopoverOutsideClick();
    openFavoriteBrowser();
  }

  function handleFavoriteEntryClick(event, button) {
    if (event.__betterFavoriteEntryHandled) {
      return;
    }
    if (event.type === "click" && Date.now() - favoriteEntryLastPointerHandledAt < 500) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      return;
    }
    event.__betterFavoriteEntryHandled = true;
    if (event.type === "pointerdown") {
      favoriteEntryLastPointerHandledAt = Date.now();
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    toggleFavoritePopover(button);
  }

  function bindFavoriteEntryClickDelegation() {
    if (favoriteEntryClickBound) {
      return;
    }

    favoriteEntryClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${FAVORITE_ENTRY_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleFavoriteEntryClick(event, button);
    }, true);
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${FAVORITE_ENTRY_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleFavoriteEntryClick(event, button);
    }, true);
  }

  function handleHeaderMessageClick(event, button) {
    if (event.__betterHeaderMessageHandled) {
      return;
    }
    event.__betterHeaderMessageHandled = true;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    toggleMessagePopover(button);
  }

  function bindHeaderMessageClickDelegation() {
    if (headerMessageClickBound) {
      return;
    }

    headerMessageClickBound = true;
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${HEADER_MESSAGE_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleHeaderMessageClick(event, button);
    }, true);
  }

  function ensureHeaderMessage(settingsEntry) {
    if (!settingsEntry) {
      removeHeaderMessage();
      return;
    }

    let button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    if (!button) {
      button = document.createElement("button");
      button.className = HEADER_MESSAGE_CLASS;
      button.type = "button";
      button.title = "回复我的";
      button.setAttribute("aria-label", "回复我的");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `
        <i aria-hidden="true">
          <svg class="better-header-message__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6.5h16v11H4z"></path>
            <path d="m4.8 7.2 7.2 5.6 7.2-5.6"></path>
          </svg>
        </i>
      `;
    }
    bindHeaderMessageClickDelegation();

    const favoriteEntry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (favoriteEntry && favoriteEntry.parentElement === settingsEntry.parentElement) {
      if (favoriteEntry.previousElementSibling !== button) {
        favoriteEntry.insertAdjacentElement("beforebegin", button);
      }
      return;
    }

    if (settingsEntry.previousElementSibling !== button) {
      settingsEntry.insertAdjacentElement("beforebegin", button);
    }
  }

  function readHeaderSearchHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) || "[]");
      if (!Array.isArray(value)) {
        return [];
      }
      return [...new Set(value.map((item) => String(item || "").trim()).filter(Boolean))].slice(0, 12);
    } catch {
      return [];
    }
  }

  function writeHeaderSearchHistory(query) {
    const normalizedQuery = String(query || "").trim();
    if (!normalizedQuery) {
      return;
    }

    try {
      const nextHistory = [
        normalizedQuery,
        ...readHeaderSearchHistory().filter((item) => item !== normalizedQuery)
      ].slice(0, 12);
      localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
    } catch {
      // Ignore unavailable page storage and continue with the search.
    }
  }

  function closeHeaderSearchHistory(form) {
    const history = form?.querySelector(`.${HEADER_SEARCH_HISTORY_CLASS}`);
    if (history) {
      history.hidden = true;
    }
  }

  function renderHeaderSearchHistory(form) {
    const history = form.querySelector(`.${HEADER_SEARCH_HISTORY_CLASS}`);
    const input = form.querySelector(".better-header-search__input");
    if (!history || !input) {
      return;
    }

    const keyword = input.value.trim().toLocaleLowerCase();
    const items = readHeaderSearchHistory().filter((item) => (
      !keyword || item.toLocaleLowerCase().includes(keyword)
    ));
    history.replaceChildren();
    if (!items.length) {
      history.hidden = true;
      return;
    }

    const title = document.createElement("div");
    title.className = "better-header-search__history-title";
    title.textContent = "搜索历史";
    history.appendChild(title);

    items.forEach((item) => {
      const button = document.createElement("button");
      button.className = "better-header-search__history-item";
      button.type = "button";
      button.setAttribute("role", "option");
      button.textContent = item;
      button.addEventListener("click", () => {
        input.value = item;
        writeHeaderSearchHistory(item);
        closeHeaderSearchHistory(form);
        window.location.href = `/app/search?q=${encodeURIComponent(item)}`;
      });
      history.appendChild(button);
    });
    history.hidden = false;
  }

  function bindHeaderSearchHistoryOutsideClick() {
    if (headerSearchHistoryOutsideClickBound) {
      return;
    }

    headerSearchHistoryOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(`.${HEADER_SEARCH_CLASS}`)) {
        return;
      }
      document.querySelectorAll(`.${HEADER_SEARCH_CLASS}`).forEach(closeHeaderSearchHistory);
    });
  }

  function ensureHeaderSearch(settingsEntry) {
    if (!settingsEntry) {
      removeHeaderSearch();
      return;
    }

    let form = document.querySelector(`.${HEADER_SEARCH_CLASS}`);
    if (!form) {
      form = document.createElement("form");
      form.className = HEADER_SEARCH_CLASS;
      form.setAttribute("role", "search");
      form.innerHTML = `
        <input class="better-header-search__input" type="search" autocomplete="off" placeholder="搜索小黑盒" aria-label="搜索小黑盒">
        <button class="better-header-search__submit" type="submit" aria-label="搜索">
          <i class="hb-icon" aria-hidden="true">
            <svg class="hb-iconfont" aria-hidden="true">
              <use xlink:href="#icon-common_search_line_24x24"></use>
            </svg>
          </i>
        </button>
        <div class="${HEADER_SEARCH_HISTORY_CLASS}" role="listbox" aria-label="搜索历史" hidden></div>
      `;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector(".better-header-search__input");
        const query = input?.value?.trim() || "";
        writeHeaderSearchHistory(query);
        closeHeaderSearchHistory(form);
        window.location.href = query ? `/app/search?q=${encodeURIComponent(query)}` : "/app/search";
      });
      form.addEventListener("pointerdown", (event) => {
        if (event.target instanceof Element && event.target.closest(`.better-header-search__submit, .${HEADER_SEARCH_HISTORY_CLASS}`)) {
          return;
        }
        const input = form.querySelector(".better-header-search__input");
        input?.focus();
        renderHeaderSearchHistory(form);
      });
      const input = form.querySelector(".better-header-search__input");
      input?.addEventListener("focus", () => renderHeaderSearchHistory(form));
      input?.addEventListener("input", () => renderHeaderSearchHistory(form));
      input?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeHeaderSearchHistory(form);
        }
      });
      bindHeaderSearchHistoryOutsideClick();
    }

    const input = form.querySelector(".better-header-search__input");
    if (input && document.activeElement !== input) {
      input.value = getCurrentSearchQuery();
    }

    const messageButton = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    if (messageButton && messageButton.parentElement === settingsEntry.parentElement) {
      if (messageButton.previousElementSibling !== form) {
        messageButton.insertAdjacentElement("beforebegin", form);
      }
      ensureLinkPageToolbar(form);
      return;
    }

    if (settingsEntry.previousElementSibling !== form) {
      settingsEntry.insertAdjacentElement("beforebegin", form);
    }
    ensureLinkPageToolbar(form);
  }

  // ---------------------------------------------------------------------------
  // 文章详情页顶部工具条：AI 总结 / 复制链接
  // 位置：全局搜索框左侧，与搜索框同处顶部一行 flex 布局（不使用固定坐标，
  // 窄窗口时由 CSS 收缩文字、保留图标和 tooltip）。
  // AI 按钮复用 link-page.js / ai-summary.js 的 summarizeLinkPage() 与按钮状态函数，
  // 不新增第二套请求逻辑；旧的白色横条 AI 按钮由 ensureLinkPageAiSummaryButton() 清理。
  // ---------------------------------------------------------------------------
  const NATIVE_LINK_ACTION_LABELS = ["ai", "ai总结", "ai 总结", "总结", "复制", "复制链接", "copy", "copy link"];

  function showHeaderToast(message) {
    if (!message) {
      return;
    }

    let toast = document.querySelector(`.${HEADER_TOAST_CLASS}`);
    if (!toast) {
      toast = document.createElement("div");
      toast.className = HEADER_TOAST_CLASS;
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(headerToastTimer);
    headerToastTimer = window.setTimeout(() => {
      toast?.classList.remove("is-visible");
    }, TOAST_DURATION);
  }

  function getLinkPageCanonicalUrl() {
    const linkId = getCurrentLinkId();
    if (!linkId) {
      return "";
    }
    // 只保留稳定路径，不带来源、排序等临时参数。
    return `${window.location.protocol}//${window.location.host}/app/bbs/link/${linkId}`;
  }

  function copyTextToClipboardFallback(text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return Boolean(copied);
    } catch (error) {
      return false;
    }
  }

  function copyTextToClipboard(text) {
    if (!text) {
      return Promise.resolve(false);
    }
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text).then(() => true).catch(() => copyTextToClipboardFallback(text));
    }
    return Promise.resolve(copyTextToClipboardFallback(text));
  }

  function handleLinkPageToolbarCopy(event) {
    event.preventDefault();
    event.stopPropagation();
    const url = getLinkPageCanonicalUrl();
    return copyTextToClipboard(url).then((copied) => {
      showHeaderToast(copied ? "链接已复制" : "复制失败，请手动复制");
    });
  }

  function createLinkPageToolbar() {
    const toolbar = document.createElement("div");
    toolbar.className = LINK_PAGE_TOOLBAR_CLASS;
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "文章操作");
    toolbar.innerHTML = `
      <button type="button" class="${LINK_PAGE_TOOLBAR_SUMMARY_CLASS} better-ai-summary-button better-link-page-ai-summary"
        title="AI 总结" aria-label="AI 总结" data-ai-idle-label="AI 总结" data-ai-done-label="查看总结">
        <i class="better-link-page-toolbar__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9 12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path></svg>
        </i>
        <span class="better-link-page-toolbar__label" data-ai-button-label>AI 总结</span>
      </button>
      <button type="button" class="${LINK_PAGE_TOOLBAR_COPY_CLASS}" title="复制链接" aria-label="复制链接">
        <i class="better-link-page-toolbar__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16"><rect x="9" y="9" width="10.5" height="10.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"></rect><path d="M6.5 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8v.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>
        </i>
        <span class="better-link-page-toolbar__label">复制链接</span>
      </button>
    `;

    toolbar.querySelector(`.${LINK_PAGE_TOOLBAR_COPY_CLASS}`)?.addEventListener("click", handleLinkPageToolbarCopy);
    toolbar.querySelector(`.${LINK_PAGE_TOOLBAR_SUMMARY_CLASS}`)?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      summarizeLinkPage(event.currentTarget);
    });
    return toolbar;
  }

  function updateLinkPageToolbarState(toolbar) {
    if (!toolbar) {
      return;
    }
    const summaryButton = toolbar.querySelector(`.${LINK_PAGE_TOOLBAR_SUMMARY_CLASS}`);
    if (summaryButton) {
      summaryButton.hidden = !isAiFeatureEnabled();
    }
    toolbar.dataset.linkId = getCurrentLinkId();
  }

  function markNativeLinkPageActions() {
    const container = document.querySelector(".hb-bbs-link__header .page-header__container, #page-bbs-link .page-header__container");
    if (!container) {
      return;
    }
    container.querySelectorAll("button, a[href], [role='button']").forEach((element) => {
      if (element.closest(`.${LINK_PAGE_TOOLBAR_CLASS}`)) {
        return;
      }
      const label = [element.getAttribute("aria-label"), element.getAttribute("title"), element.textContent]
        .filter(Boolean)
        .join(" ")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (!label) {
        return;
      }
      if (label.includes("返回") || label === "back" || label.startsWith("back ") || label.endsWith(" back")) {
        element.removeAttribute("data-better-relocated-action");
        return;
      }
      if (NATIVE_LINK_ACTION_LABELS.some((candidate) => label === candidate || label.includes(candidate))) {
        element.setAttribute("data-better-relocated-action", "true");
      }
    });
  }

  function restoreNativeLinkPageActions() {
    document.querySelectorAll("[data-better-relocated-action]").forEach((element) => {
      element.removeAttribute("data-better-relocated-action");
    });
  }

  function removeLinkPageToolbar() {
    document.querySelectorAll(`.${LINK_PAGE_TOOLBAR_CLASS}`).forEach((toolbar) => toolbar.remove());
  }

  function ensureLinkPageToolbar(searchForm) {
    if (!isLinkPage()) {
      removeLinkPageToolbar();
      restoreNativeLinkPageActions();
      return null;
    }

    const form = searchForm || document.querySelector(`.${HEADER_SEARCH_CLASS}`);
    if (!form) {
      // 搜索框还没插入时先不建工具条，等 ensureHeaderSearch() 再来一次。
      return null;
    }

    let toolbar = document.querySelector(`.${LINK_PAGE_TOOLBAR_CLASS}`);
    if (!toolbar) {
      toolbar = createLinkPageToolbar();
    }
    if (toolbar.parentElement !== form.parentElement || toolbar.nextElementSibling !== form) {
      form.insertAdjacentElement("beforebegin", toolbar);
    }
    updateLinkPageToolbarState(toolbar);
    markNativeLinkPageActions();
    return toolbar;
  }

  function setHeaderMoreMenuOpen(menu, isOpen) {
    menu.classList.toggle(HEADER_MORE_MENU_OPEN_CLASS, isOpen);
    menu.querySelector(`.${HEADER_MORE_MENU_TOGGLE_CLASS}`)?.setAttribute("aria-expanded", String(isOpen));
  }

  function closeHeaderMoreMenu() {
    document.querySelectorAll(`.${HEADER_MORE_MENU_CLASS}.${HEADER_MORE_MENU_OPEN_CLASS}`).forEach((menu) => {
      setHeaderMoreMenuOpen(menu, false);
    });
  }

  function bindHeaderMoreMenuOutsideClick() {
    if (headerMoreMenuOutsideClickBound) {
      return;
    }

    headerMoreMenuOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(`.${HEADER_MORE_MENU_CLASS}`)) {
        return;
      }
      closeHeaderMoreMenu();
    });
  }

  function removeHeaderMoreMenu() {
    document.querySelectorAll(`.${HEADER_MORE_MENU_CLASS}`).forEach((menu) => {
      menu.remove();
    });
    document.querySelectorAll(`.${HEADER_MORE_MENU_SOURCE_CLASS}`).forEach((button) => {
      button.classList.remove(HEADER_MORE_MENU_SOURCE_CLASS);
    });
  }

  function ensureHeaderMoreMenu() {
    const navLinks = document.querySelector(".nav .nav-links");
    if (!navLinks) {
      return;
    }

    const secondaryLabels = new Set(["小黑盒加速器", "黑盒语音", "黑盒工坊", "开放平台", "加入我们"]);
    const nativeButtons = Array.from(navLinks.querySelectorAll(":scope > button.nav-link"));
    const sourceButtons = nativeButtons.filter((button) => secondaryLabels.has(button.textContent?.trim() || ""));
    sourceButtons.forEach((button) => button.classList.add(HEADER_MORE_MENU_SOURCE_CLASS));

    if (!sourceButtons.length) {
      return;
    }

    let menu = navLinks.querySelector(`:scope > .${HEADER_MORE_MENU_CLASS}`);
    if (!menu) {
      menu = document.createElement("div");
      menu.className = HEADER_MORE_MENU_CLASS;

      const toggle = document.createElement("button");
      toggle.className = HEADER_MORE_MENU_TOGGLE_CLASS;
      toggle.type = "button";
      toggle.setAttribute("aria-haspopup", "menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = `
        <span>更多</span>
        <i class="hb-icon" aria-hidden="true">
          <svg class="hb-iconfont" aria-hidden="true">
            <use xlink:href="#icon-common_arrow_down_line_24x24"></use>
          </svg>
        </i>
      `;
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setHeaderMoreMenuOpen(menu, !menu.classList.contains(HEADER_MORE_MENU_OPEN_CLASS));
      });

      const panel = document.createElement("div");
      panel.className = HEADER_MORE_MENU_PANEL_CLASS;
      panel.setAttribute("role", "menu");
      panel.addEventListener("click", (event) => {
        const item = event.target instanceof Element
          ? event.target.closest("[data-header-more-label]")
          : null;
        if (!item) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const label = item.dataset.headerMoreLabel || "";
        const source = Array.from(navLinks.querySelectorAll(`:scope > button.${HEADER_MORE_MENU_SOURCE_CLASS}`))
          .find((button) => button.textContent?.trim() === label);
        closeHeaderMoreMenu();
        source?.click();
      });

      menu.append(toggle, panel);
      const communityButton = nativeButtons.find((button) => button.textContent?.trim() === "社区");
      if (communityButton) {
        communityButton.insertAdjacentElement("afterend", menu);
      } else {
        navLinks.appendChild(menu);
      }
    }

    const panel = menu.querySelector(`.${HEADER_MORE_MENU_PANEL_CLASS}`);
    const signature = sourceButtons.map((button) => button.textContent?.trim() || "").join("|");
    if (panel && panel.dataset.signature !== signature) {
      panel.dataset.signature = signature;
      panel.replaceChildren(...sourceButtons.map((button) => {
        const item = document.createElement("button");
        item.type = "button";
        item.setAttribute("role", "menuitem");
        item.dataset.headerMoreLabel = button.textContent?.trim() || "";
        item.textContent = button.textContent?.trim() || "";
        return item;
      }));
    }

    bindHeaderMoreMenuOutsideClick();
  }

  function ensureSettingsEntry() {
    const favoriteEntry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    const messageButton = document.querySelector(".hb-view-header .message-center__btn");
    const publishButton = document.querySelector(".nav-actions .publish-btn");
    const anchor = favoriteEntry || messageButton;
    if (!publishButton && !anchor) {
      removeSettingsEntry();
      return;
    }

    let entry = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("button");
      entry.className = SETTINGS_ENTRY_CLASS;
      entry.type = "button";
      entry.title = "设置";
      entry.setAttribute("aria-label", "设置");
      entry.setAttribute("aria-expanded", "false");
      entry.innerHTML = '<i class="hb-icon heybox-common_setting_line_24x24" aria-hidden="true">⚙</i>';
      entry.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSettingsPanel(entry);
      });
    }

    entry.classList.toggle("better-xiaoheihe-settings-entry--before-publish", Boolean(publishButton));
    if (publishButton) {
      if (entry.nextElementSibling !== publishButton) {
        publishButton.insertAdjacentElement("beforebegin", entry);
      }
      ensureHeaderSearch(entry);
      ensureHeaderMessage(entry);
      ensureFavoriteEntry();
      ensureBrowseHistoryEntry();
      return;
    }

    if (entry.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", entry);
    }
    ensureHeaderSearch(entry);
    ensureHeaderMessage(entry);
    ensureFavoriteEntry();
    ensureBrowseHistoryEntry();
  }



