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
    popover.innerHTML = `
      <div class="better-message-popover__header">
        <div class="better-message-popover__title">
          <strong>收藏</strong>
        </div>
      </div>
      <div class="better-message-popover__body">
        <div class="better-message-popover__state">点击刷新查看收藏</div>
      </div>
    `;
    popover.querySelector(".better-message-popover__body")?.addEventListener("scroll", (event) => {
      const body = event.currentTarget;
      if (
        favoritePopoverState.hasMore
        && !favoritePopoverState.loading
        && body.scrollTop + body.clientHeight >= body.scrollHeight - 80
      ) {
        fetchAndRenderFavouritePosts({ append: true });
      }
    });
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

  function setFavoritePopoverState(contentHtml) {
    const popover = ensureFavoritePopover();
    const body = popover.querySelector(".better-message-popover__body");
    if (body) {
      body.innerHTML = contentHtml;
    }
  }

  function getFavouritePostLinkId(item) {
    return String(item?.linkid || item?.link_id || item?.id || item?.link?.linkid || item?.link?.id || "").trim();
  }

  function getFavouritePostAuthor(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    return String(
      item?.username
      || item?.user_name
      || item?.nickname
      || item?.link_user
      || item?.author_name
      || item?.link_user_name
      || author?.username
      || author?.user_name
      || author?.nickname
      || author?.name
      || ""
    ).trim();
  }

  function getFavouritePostAuthorAvatar(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    return String(
      item?.avatar
      || item?.avartar
      || item?.author_avatar
      || item?.link_user_avatar
      || author?.avatar
      || author?.avartar
      || author?.avatar_url
      || author?.avatarUrl
      || ""
    ).trim();
  }

  function getFavouritePostAuthorLevel(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    const level = normalizeUserLevel(
      item?.level
      || item?.user_level
      || item?.author_level
      || item?.link_user_level
      || author?.level_info?.level
      || author?.level
      || author?.user_level
      || ""
    );
    return level ? `Lv.${level}` : "";
  }

  function normalizeFavouritePosts(items) {
    return (Array.isArray(items) ? items : []).map((item) => {
      const topic = Array.isArray(item?.topics) ? item.topics[0] : item?.topic;
      const author = getFavouritePostAuthor(item);
      return {
        id: getFavouritePostLinkId(item),
        title: String(item?.title || item?.link?.title || "未命名帖子"),
        description: String(item?.description || item?.desc || item?.link?.description || ""),
        author,
        authorAvatar: getFavouritePostAuthorAvatar(item),
        authorAvatarFallback: Array.from(author || "作")[0] || "作",
        authorLevel: getFavouritePostAuthorLevel(item),
        timestamp: Number(item?.create_at || item?.created_at || item?.time || 0),
        awardCount: Number(item?.link_award_num || item?.up || item?.support_num || 0),
        commentCount: Number(item?.comment_num || item?.reply_num || 0),
        topicName: String(topic?.name || ""),
        topicIcon: String(topic?.pic_url || topic?.icon || "")
      };
    }).filter((item) => item.id);
  }

  function renderFavouritePosts(state = favoritePopoverState) {
    const items = state.items || [];
    if (!items.length) {
      setFavoritePopoverState('<div class="better-message-popover__state">暂时没有收藏帖子</div>');
      return;
    }

    setFavoritePopoverState(items.map((item) => `
      <a class="better-message-popover__item better-favorite-popover__item" href="/app/bbs/link/${escapeHtml(item.id)}">
        <div class="better-message-popover__context">
          ${item.author ? `
            <div class="better-favorite-popover__author">
              ${item.authorAvatar ? `<img class="better-favorite-popover__author-avatar" src="${escapeHtml(item.authorAvatar)}" alt="">` : `<span class="better-favorite-popover__author-avatar" aria-hidden="true">${escapeHtml(item.authorAvatarFallback)}</span>`}
              <span class="better-favorite-popover__author-name">${escapeHtml(item.author)}</span>
              ${item.authorLevel ? `<span class="better-favorite-popover__author-level">${escapeHtml(item.authorLevel)}</span>` : ""}
            </div>
          ` : ""}
          <span class="better-message-popover__link-title">${renderEmojiTokensInHtml(escapeHtml(item.title))}</span>
          ${item.description ? `<span class="better-message-popover__link-desc">${renderEmojiTokensInHtml(escapeHtml(item.description))}</span>` : ""}
          <div class="better-message-popover__media-row">
            ${item.topicName ? `
              <span class="better-message-popover__topic">
                ${item.topicIcon ? `<img class="better-favorite-popover__topic-icon" src="${escapeHtml(item.topicIcon)}" alt="">` : ""}
                ${escapeHtml(item.topicName)}
              </span>
            ` : ""}
            <span class="better-favorite-popover__meta">${escapeHtml(formatCommentTime(item.timestamp))}</span>
            <span class="better-favorite-popover__meta">赞 ${escapeHtml(item.awardCount)}</span>
            <span class="better-favorite-popover__meta">评 ${escapeHtml(item.commentCount)}</span>
          </div>
        </div>
      </a>
    `).join("") + (state.loading
      ? '<div class="better-message-popover__footer-state">正在加载更多...</div>'
      : (state.hasMore ? '<div class="better-message-popover__footer-state">继续下滑加载更多</div>' : '<div class="better-message-popover__footer-state">没有更多收藏了</div>')));
  }

  function fetchFavouritePosts(options = {}) {
    const limit = Number(options.limit || 20);
    return runAfterIdentityCookiesRestored(() => fetch(buildFavourListApiUrl({
      offset: options.offset || 0,
      limit
    }), {
      credentials: "include",
      headers: {
        accept: "application/json"
      }
    })).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "收藏查询失败");
      }
      const rawItems = data?.result?.links || data?.result?.list || data?.result || data?.links || [];
      return {
        items: normalizeFavouritePosts(rawItems),
        hasMore: Array.isArray(rawItems) && rawItems.length >= limit
      };
    });
  }

  function fetchAndRenderFavouritePosts(options = {}) {
    const button = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    const popover = ensureFavoritePopover();
    if (favoritePopoverState.loading) {
      return Promise.resolve();
    }
    const append = options.append === true;
    favoritePopoverState.loading = true;
    button?.classList.add("is-loading");
    if (!append) {
      favoritePopoverState.items = [];
      favoritePopoverState.offset = 0;
      favoritePopoverState.hasMore = true;
      setFavoritePopoverState('<div class="better-message-popover__state">正在拉取收藏...</div>');
    } else {
      renderFavouritePosts();
    }
    return loadEmojis().then(() => fetchFavouritePosts({ offset: append ? favoritePopoverState.offset : 0, limit: 20 }))
      .then((payload) => {
        const mergedItems = append
          ? [...favoritePopoverState.items, ...payload.items]
          : payload.items;
        const seenIds = new Set();
        favoritePopoverState.items = mergedItems.filter((item) => {
          if (seenIds.has(item.id)) {
            return false;
          }
          seenIds.add(item.id);
          return true;
        });
        favoritePopoverState.offset = favoritePopoverState.items.length;
        favoritePopoverState.hasMore = payload.hasMore;
        favoritePopoverState.loading = false;
        renderFavouritePosts();
      })
      .catch((error) => {
        favoritePopoverState.loading = false;
        if (append && favoritePopoverState.items.length) {
          renderFavouritePosts();
          return;
        }
        setFavoritePopoverState(`<div class="better-message-popover__state">${escapeHtml(error?.message || "收藏加载失败")}</div>`);
      })
      .finally(() => {
        button?.classList.remove("is-loading");
        positionFavoritePopover(button, popover);
      });
  }

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

  function renderReplyMessages(state = getActiveMessageTabState()) {
    const messages = state.messages || [];

    if (!messages.length) {
      setMessagePopoverState(`<div class="better-message-popover__state">暂时没有新的${messagePopoverState.activeTab === "award" ? "点赞" : "回复"}消息</div>`);
      return;
    }

    setMessagePopoverState(messages.map((message) => {
      const actors = Array.isArray(message.actors) ? message.actors : [];
      const visibleActors = actors.slice(0, 3);
      const hiddenActorCount = Math.max(0, Number(message.awardCount || actors.length || 0) - visibleActors.length);
      const actorAvatarHtml = visibleActors.length ? `
        <div class="better-message-popover__likers" aria-hidden="true">
          ${visibleActors.map((actor) => actor.avatar
            ? `<img class="better-message-popover__liker-avatar" src="${escapeHtml(actor.avatar)}" alt="">`
            : `<span class="better-message-popover__liker-avatar">${escapeHtml(actor.avatarFallback)}</span>`).join("")}
          ${hiddenActorCount > 0 ? `<span class="better-message-popover__liker-more">+${escapeHtml(hiddenActorCount)}</span>` : ""}
        </div>
      ` : (message.avatar
        ? `<img class="better-message-popover__avatar" src="${escapeHtml(message.avatar)}" alt="">`
        : `<div class="better-message-popover__avatar" aria-hidden="true">${escapeHtml(message.avatarFallback)}</div>`);
      const itemClass = [
        "better-message-popover__item",
        message.awardKind === "post" ? "better-message-popover__item--award-post" : "",
        message.awardKind === "comment" ? "better-message-popover__item--award-comment" : ""
      ].filter(Boolean).join(" ");
      return `
      <a class="${itemClass}" href="/app/bbs/link/${escapeHtml(message.linkId)}">
        <div class="better-message-popover__actor">
          ${actorAvatarHtml}
          <div class="better-message-popover__actor-main">
            <div class="better-message-popover__actor-line">
              <span class="better-message-popover__user">${escapeHtml(message.userName)}</span>
              <span class="better-message-popover__action">${escapeHtml(message.actionText)}</span>
              <span class="better-message-popover__type">${escapeHtml(message.typeLabel)}</span>
            </div>
            <span class="better-message-popover__time">${escapeHtml(formatCommentTime(message.timestamp))}</span>
          </div>
        </div>
        ${message.awardKind === "comment" ? `
          <div class="better-message-popover__comment-target">
            <span class="better-message-popover__comment-target-label">被点赞的评论</span>
            <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
            ${message.targetImages?.length ? `
              <div class="better-message-popover__target-images">
                ${message.targetImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="评论图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
              </div>
            ` : ""}
          </div>
        ` : `
          <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
          ${message.contentImages?.length ? `
            <div class="better-message-popover__target-images">
              ${message.contentImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="回复图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
            </div>
          ` : ""}
          ${message.replyTargetContent ? `
            <div class="better-message-popover__comment-target">
              <span class="better-message-popover__comment-target-label">被回复的内容</span>
              <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.replyTargetContent))}</div>
            </div>
          ` : ""}
        `}
        <div class="better-message-popover__post">
          <div class="better-message-popover__context">
            ${message.linkAuthor ? `
              <div class="better-message-popover__post-author">
                ${message.linkAuthorAvatar ? `<img class="better-message-popover__post-author-avatar" src="${escapeHtml(message.linkAuthorAvatar)}" alt="">` : `<span class="better-message-popover__post-author-avatar" aria-hidden="true">${escapeHtml(message.linkAuthorAvatarFallback)}</span>`}
                <span class="better-message-popover__post-author-name">${escapeHtml(message.linkAuthor)}</span>
                ${message.linkAuthorLevel ? `<span class="better-message-popover__post-author-level">${escapeHtml(message.linkAuthorLevel)}</span>` : ""}
              </div>
            ` : ""}
            <span class="better-message-popover__link-title">${renderEmojiTokensInHtml(escapeHtml(message.title))}</span>
            ${message.description ? `<span class="better-message-popover__link-desc">${renderEmojiTokensInHtml(escapeHtml(message.description))}</span>` : ""}
            ${(message.linkImages?.length || message.topicName) ? `
              <div class="better-message-popover__media-row${message.linkImages?.length ? " better-message-popover__media-row--with-images" : ""}">
                ${message.linkImages?.length ? `
                  <div class="better-message-popover__thumbs">
                    ${message.linkImages.map((url, index) => `<img class="better-message-popover__thumb" src="${escapeHtml(url)}" alt="帖子图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
                  </div>
                ` : ""}
                ${message.topicName ? `
                  <span class="better-message-popover__topic">
                    ${message.topicIcon ? `<img class="better-message-popover__topic-icon" src="${escapeHtml(message.topicIcon)}" alt="">` : ""}
                    ${escapeHtml(message.topicName)}
                  </span>
                ` : ""}
              </div>
            ` : ""}
          </div>
        </div>
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
    activeState.loading = true;
    button?.classList.add("is-loading");
    if (!append) {
      activeState.messages = [];
      activeState.offset = 0;
      activeState.hasMore = true;
      setMessagePopoverState(`<div class="better-message-popover__state">正在拉取${activeTab === "award" ? "点赞" : "回复"}消息...</div>`);
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
        renderReplyMessages(activeState);
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
      if (event.target.closest(`.${MESSAGE_POPOVER_CLASS}, .${HEADER_MESSAGE_CLASS}`)) {
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
      fetchAndRenderReplyMessages();
      return;
    }
    popover.hidden = !shouldOpen;
    button.setAttribute("aria-expanded", String(shouldOpen));
    closeFavoritePopover();
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
      if (event.target.closest(`.${FAVORITE_POPOVER_CLASS}, .${FAVORITE_ENTRY_CLASS}`)) {
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
      fetchAndRenderFavouritePosts();
      return;
    }
    popover.hidden = false;
    button.setAttribute("aria-expanded", "true");
    closeMessagePopover();
    positionFavoritePopover(button, popover);
    bindFavoritePopoverOutsideClick();
    fetchAndRenderFavouritePosts();
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
    document.addEventListener("pointerdown", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${HEADER_MESSAGE_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleHeaderMessageClick(event, button);
    }, true);
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
    button.onpointerdown = (event) => handleHeaderMessageClick(event, button);
    button.onclick = (event) => handleHeaderMessageClick(event, button);
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
      return;
    }

    if (settingsEntry.previousElementSibling !== form) {
      settingsEntry.insertAdjacentElement("beforebegin", form);
    }
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
      return;
    }

    if (entry.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", entry);
    }
    ensureHeaderSearch(entry);
    ensureHeaderMessage(entry);
    ensureFavoriteEntry();
  }



