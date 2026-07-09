// 顶部收藏、搜索和消息入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function ensureFavoriteEntry() {
    const messageButton = document.querySelector(".hb-view-header .message-center__btn");
    if (!messageButton) {
      removeFavoriteEntry();
      return;
    }

    let entry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("a");
      entry.className = FAVORITE_ENTRY_CLASS;
      entry.innerHTML = '<i class="hb-icon heybox-bbs_favorite_filled_24x24 better-xiaoheihe-favorite-entry__icon" aria-hidden="true">★</i><span>收藏</span>';
      entry.title = "查看收藏";
      entry.setAttribute("aria-label", "查看收藏");
    }

    entry.href = "/app/user/favour/content";
    if (entry.previousElementSibling !== messageButton) {
      messageButton.insertAdjacentElement("afterend", entry);
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

  function setMessagePopoverState(contentHtml) {
    const popover = ensureMessagePopover();
    const body = popover.querySelector(".better-message-popover__body");
    if (body) {
      body.innerHTML = contentHtml;
    }
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
              <div class="better-message-popover__media-row">
                ${message.linkImages?.length ? `
                  <div class="better-message-popover__thumbs">
                    ${message.linkImages.map((url, index) => `<img class="better-message-popover__thumb" src="${escapeHtml(url)}" alt="帖子图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
                  </div>
                ` : ""}
                ${message.topicName ? `<span class="better-message-popover__topic">${escapeHtml(message.topicName)}</span>` : ""}
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
    positionMessagePopover(button, popover);
    bindMessagePopoverOutsideClick();
    fetchAndRenderReplyMessages();
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

    if (settingsEntry.previousElementSibling !== button) {
      settingsEntry.insertAdjacentElement("beforebegin", button);
    }
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
      `;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector(".better-header-search__input");
        const query = input?.value?.trim() || "";
        window.location.href = query ? `/app/search?q=${encodeURIComponent(query)}` : "/app/search";
      });
    }

    const input = form.querySelector(".better-header-search__input");
    if (input && document.activeElement !== input) {
      input.value = getCurrentSearchQuery();
    }

    if (settingsEntry.previousElementSibling !== form) {
      settingsEntry.insertAdjacentElement("beforebegin", form);
    }
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
      return;
    }

    if (entry.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", entry);
    }
    ensureHeaderSearch(entry);
    ensureHeaderMessage(entry);
  }



