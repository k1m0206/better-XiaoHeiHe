// 浏览历史：本地存储、顶部入口、历史弹层与历史帖新标签页链接。
// 本文件由 scripts/build-source-bundles.ps1 拼入 src/content.js，请勿直接修改生成文件。
  let browseHistoryClearArmed = false;
  let browseHistoryClearTimer = null;

  function normalizeHistoryText(value, maxLength) {
    return truncateText(String(value ?? "").replace(/[\s\u3000]+/g, " ").trim(), maxLength);
  }

  function normalizeBrowseHistoryEntry(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const id = String(raw.id || "").trim();
    if (!id || !LINK_ID_REGEXP.test(id)) {
      return null;
    }

    const visitedAt = Number(raw.visitedAt);
    if (!Number.isFinite(visitedAt) || visitedAt <= 0) {
      // 旧数据或损坏数据不进入列表，避免排序出现 NaN。
      return null;
    }

    const imageUrls = Array.isArray(raw.imageUrls)
      ? raw.imageUrls.map((url) => String(url || "").trim()).filter(Boolean).slice(0, 9)
      : [];
    return {
      id,
      url: `/app/bbs/link/${id}`,
      title: normalizeHistoryText(raw.title, 120),
      description: normalizeHistoryText(raw.description, 160),
      author: normalizeHistoryText(raw.author, 40),
      authorId: normalizeHistoryText(raw.authorId, 32),
      authorAvatar: String(raw.authorAvatar || "").trim(),
      authorLevel: String(raw.authorLevel || "").trim(),
      topicName: normalizeHistoryText(raw.topicName, 40),
      topicIcon: String(raw.topicIcon || "").trim(),
      thumbnailUrl: String(raw.thumbnailUrl || imageUrls[0] || "").trim(),
      imageCount: Math.max(0, Number(raw.imageCount) || 0),
      imageUrls,
      visitedAt,
      schemaVersion: BROWSE_HISTORY_SCHEMA_VERSION
    };
  }

  function normalizeBrowseHistoryEntries(list) {
    const seenIds = new Set();
    return (Array.isArray(list) ? list : [])
      .map((item) => normalizeBrowseHistoryEntry(item))
      .filter((item) => {
        if (!item || seenIds.has(item.id)) {
          return false;
        }
        seenIds.add(item.id);
        return true;
      })
      .sort((left, right) => right.visitedAt - left.visitedAt)
      .slice(0, BROWSE_HISTORY_MAX_ENTRIES);
  }

  function mergeBrowseHistoryEntry(existing, next) {
    const merged = existing ? { ...existing } : {};
    ["title", "description", "author", "authorId", "authorAvatar", "authorLevel", "topicName", "topicIcon", "thumbnailUrl"].forEach((key) => {
      if (next[key]) {
        merged[key] = next[key];
      }
    });
    if (next.imageCount > 0) {
      merged.imageCount = next.imageCount;
    }
    if (next.imageUrls.length) {
      merged.imageUrls = next.imageUrls;
    }
    merged.id = next.id;
    merged.url = next.url;
    merged.visitedAt = next.visitedAt;
    merged.schemaVersion = BROWSE_HISTORY_SCHEMA_VERSION;
    return merged;
  }

  function persistBrowseHistory(items) {
    saveLocalSettings({
      [BROWSE_HISTORY_STORAGE_KEY]: items
    });
  }

  function syncBrowseHistoryState(savedItems) {
    const nextItems = normalizeBrowseHistoryEntries(savedItems);
    browseHistoryState.items = nextItems;
    if (JSON.stringify(nextItems) === JSON.stringify(browseHistoryItems)) {
      if (isBrowseHistoryPopoverOpen()) {
        renderBrowseHistory();
      }
      return;
    }

    browseHistoryItems = nextItems;
    if (isBrowseHistoryPopoverOpen()) {
      renderBrowseHistory();
    }
  }

  // 记录一次帖子浏览：同一帖子不新增重复记录，只更新 visitedAt 并移到最前面。
  function recordBrowseHistoryEntry(entry) {
    const nextEntry = normalizeBrowseHistoryEntry({
      ...entry,
      visitedAt: Date.now()
    });
    if (!nextEntry) {
      return false;
    }

    const existing = browseHistoryItems.find((item) => item.id === nextEntry.id) || null;
    const mergedEntry = mergeBrowseHistoryEntry(existing, nextEntry);
    const items = [
      mergedEntry,
      ...browseHistoryItems.filter((item) => item.id !== nextEntry.id)
    ].slice(0, BROWSE_HISTORY_MAX_ENTRIES);
    browseHistoryItems = items;
    browseHistoryState.items = items;
    browseHistoryState.error = "";
    persistBrowseHistory(items);
    if (isBrowseHistoryPopoverOpen()) {
      renderBrowseHistory();
    }
    return true;
  }

  function clearBrowseHistory() {
    if (browseHistoryClearTimer) {
      window.clearTimeout(browseHistoryClearTimer);
      browseHistoryClearTimer = null;
    }
    browseHistoryClearArmed = false;
    browseHistoryItems = [];
    browseHistoryState.items = [];
    browseHistoryState.error = "";
    browseHistoryState.loading = false;
    persistBrowseHistory([]);
    renderBrowseHistory();
  }

  function formatBrowseHistoryTime(visitedAt) {
    const timestamp = Math.floor((Number(visitedAt) || 0) / 1000);
    return timestamp > 0 ? formatCommentTime(timestamp) : "";
  }

  // 只读取帖子详情页 DOM 与已缓存的详情数据，不发起额外请求，也不在加载失败时写入。
  function collectLinkPageHistoryEntry(linkId) {
    const root = document.querySelector("#page-bbs-link") || document.querySelector(".hb-bbs-link");
    if (!root || !linkId) {
      return null;
    }

    const detail = typeof getCachedLinkDetail === "function" ? getCachedLinkDetail(linkId) : null;
    const title = detail?.title || root.querySelector(".section-title__content")?.textContent || "";
    if (!normalizeHistoryText(title, 120)) {
      return null;
    }

    const contentText = detail?.content || Array.from(root.querySelectorAll(".post__content .com-text"))
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join("\n");
    const domImageUrls = Array.from(root.querySelectorAll(".post__content img.hb-cpt__image-elem"))
      .map((image) => image.currentSrc || image.src || image.getAttribute("src") || "");
    const imageUrls = uniqueStrings([...(detail?.imageUrls || []), ...domImageUrls]).slice(0, 9);
    const authorNode = root.querySelector(".link-user__username");
    const avatarNode = root.querySelector(".link-user__avatar img")
      || root.querySelector(".link-user .hb-cpt__avatar img")
      || root.querySelector(".link-user img");
    const authorLevelNode = root.querySelector(".link-user .hb-cpt__level-tag, .link-user .hb-level-tag, .link-user .level-tag__wrapper");
    const authorHref = String(authorNode?.closest("a")?.getAttribute("href") || authorNode?.getAttribute("href") || "");
    const authorId = authorHref.match(/\/app\/user\/profile\/(\d+)/)?.[1] || "";
    const topicTextNode = root.querySelector(".link-section-tags .content-tag-text");
    const topicElement = topicTextNode?.closest(".content-list__tag-item, .hb-cpt__content-tag, a, [class*=tag]") || topicTextNode?.parentElement;
    const topicIconNode = topicElement?.querySelector("img");

    return {
      id: linkId,
      title: normalizeHistoryText(title, 120),
      description: normalizeHistoryText(contentText, 160),
      author: normalizeHistoryText(authorNode?.textContent || detail?.author || "", 40),
      authorId,
      authorAvatar: String(avatarNode?.currentSrc || avatarNode?.src || "").trim(),
      authorLevel: normalizeUserLevel(authorLevelNode?.textContent || detail?.authorLevel || ""),
      topicName: normalizeHistoryText(topicTextNode?.textContent || detail?.topic || "", 40),
      topicIcon: String(topicIconNode?.currentSrc || topicIconNode?.src || detail?.topicIcon || "").trim(),
      thumbnailUrl: imageUrls[0] || "",
      imageCount: imageUrls.length,
      imageUrls,
      visitedAt: Date.now(),
      schemaVersion: BROWSE_HISTORY_SCHEMA_VERSION
    };
  }

  function resetBrowseHistoryRecordState() {
    if (browseHistoryRecordTimer) {
      window.clearTimeout(browseHistoryRecordTimer);
      browseHistoryRecordTimer = null;
    }
    browseHistoryPromptRecordPath = "";
  }

  // 详情页增强流程里调用：等标题出现后再写一次历史，同一个路径在本标签页只写一次。
  function scheduleBrowseHistoryRecord() {
    if (!isLinkPage()) {
      resetBrowseHistoryRecordState();
      return;
    }

    const linkId = getCurrentLinkId();
    if (!linkId) {
      return;
    }

    const path = `${window.location.pathname}${window.location.search}`;
    if (browseHistoryPromptRecordPath === path) {
      return;
    }

    if (browseHistoryRecordTimer) {
      window.clearTimeout(browseHistoryRecordTimer);
      browseHistoryRecordTimer = null;
    }
    browseHistoryPromptRecordPath = path;
    const startedAt = Date.now();
    const attempt = (count) => {
      if (browseHistoryPromptRecordPath !== path) {
        return;
      }

      const entry = collectLinkPageHistoryEntry(linkId);
      if (entry) {
        browseHistoryRecordTimer = null;
        recordBrowseHistoryEntry(entry);
        return;
      }

      if (Date.now() - startedAt >= BROWSE_HISTORY_RECORD_TIMEOUT) {
        browseHistoryRecordTimer = null;
        return;
      }
      browseHistoryRecordTimer = window.setTimeout(() => attempt(count + 1), count < 4 ? 120 : 400);
    };
    attempt(0);
  }

  function isBrowseHistoryPopoverOpen() {
    const popover = document.querySelector(`.${BROWSE_HISTORY_POPOVER_CLASS}`);
    return Boolean(popover && !popover.hidden);
  }

  function removeBrowseHistoryPopover() {
    document.querySelector(`.${BROWSE_HISTORY_POPOVER_CLASS}`)?.remove();
    document.querySelector(`.${BROWSE_HISTORY_ENTRY_CLASS}`)?.setAttribute("aria-expanded", "false");
  }

  function removeBrowseHistoryEntry() {
    document.querySelectorAll(`.${BROWSE_HISTORY_ENTRY_CLASS}`).forEach((entry) => {
      entry.remove();
    });
    removeBrowseHistoryPopover();
  }

  function renderBrowseHistoryItemMeta(item) {
    return `
      <span class="better-favorite-popover__meta">${escapeHtml(formatBrowseHistoryTime(item.visitedAt) || "刚刚")}</span>
      ${renderPostBrowserTopic(item)}
    `;
  }

  function renderBrowseHistory() {
    const popover = ensureBrowseHistoryPopover();
    const body = popover.querySelector(".better-message-popover__body");
    if (!body) {
      return;
    }

    const state = browseHistoryState;
    const items = browseHistoryItems.slice(0, BROWSE_HISTORY_PANEL_LIMIT);
    const clearButton = popover.querySelector("[data-history-clear]");
    if (clearButton) {
      clearButton.disabled = !browseHistoryItems.length;
      clearButton.textContent = browseHistoryClearArmed ? "确认清空" : "清空历史";
    }

    if (state.loading) {
      body.innerHTML = `
        <div class="better-favorite-browser__state-card" role="status" aria-live="polite">
          <p class="better-favorite-browser__state-text">正在加载浏览历史…</p>
        </div>
      `;
      return;
    }
    if (state.error) {
      body.innerHTML = `
        <div class="better-favorite-browser__state-card">
          <p class="better-favorite-browser__state-text">${escapeHtml(state.error)}</p>
          <button type="button" class="better-favorite-browser__retry" data-history-retry="1">重试</button>
        </div>
      `;
      return;
    }
    if (!items.length) {
      body.innerHTML = `
        <div class="better-favorite-browser__state-card">
          <p class="better-favorite-browser__state-text">还没有浏览记录</p>
          <p class="better-favorite-browser__state-hint">打开任意帖子详情页后会自动记录，只保存在本地。</p>
        </div>
      `;
      return;
    }

    body.innerHTML = `
      <div class="better-browse-history__list" role="list">
        ${items.map((item, index) => renderPostBrowserItem(item, {
          openTarget: "history",
          animateIndex: -1,
          metaHtml: renderBrowseHistoryItemMeta(item)
        })).join("")}
      </div>
    `;
  }

  function refreshBrowseHistoryFromStorage() {
    if (browseHistoryReady) {
      browseHistoryState.loading = false;
      browseHistoryState.error = "";
      renderBrowseHistory();
      return Promise.resolve(browseHistoryItems);
    }

    browseHistoryState.loading = true;
    renderBrowseHistory();
    return requestLocalSettingsState().then((response) => {
      browseHistoryReady = true;
      browseHistoryState.loading = false;
      if (response?.ok) {
        browseHistoryState.error = "";
        syncBrowseHistoryState(response.values?.[BROWSE_HISTORY_STORAGE_KEY]);
      } else {
        browseHistoryState.error = "无法读取本地存储，请刷新页面重试";
      }
      if (isBrowseHistoryPopoverOpen()) {
        renderBrowseHistory();
      }
      return browseHistoryItems;
    });
  }

  function ensureBrowseHistoryPopover() {
    let popover = document.querySelector(`.${BROWSE_HISTORY_POPOVER_CLASS}`);
    if (popover) {
      return popover;
    }

    popover = document.createElement("div");
    popover.className = BROWSE_HISTORY_POPOVER_CLASS;
    popover.hidden = true;
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-label", "浏览历史");
    popover.innerHTML = `
      <div class="better-message-popover__header">
        <div class="better-message-popover__title">
          <strong>浏览历史</strong>
        </div>
        <button type="button" class="better-favorite-browser__text-button" data-history-clear="1" aria-label="清空浏览历史">清空历史</button>
      </div>
      <div class="better-message-popover__body"></div>
    `;
    bindHeaderPopoverInteractions(popover);
    bindBrowseHistoryInteractions(popover);
    document.body.appendChild(popover);
    return popover;
  }

  function bindBrowseHistoryInteractions(popover) {
    if (!popover || popover.dataset.historyInteractionsBound === "1") {
      return;
    }

    popover.dataset.historyInteractionsBound = "1";
    isolatePostBrowserLinkClicks(popover);
    popover.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.closest("[data-history-retry]")) {
        event.preventDefault();
        refreshBrowseHistoryFromStorage();
        return;
      }

      if (!event.target.closest("[data-history-clear]")) {
        return;
      }

      event.preventDefault();
      if (!browseHistoryItems.length) {
        return;
      }
      if (!browseHistoryClearArmed) {
        browseHistoryClearArmed = true;
        renderBrowseHistory();
        browseHistoryClearTimer = window.setTimeout(() => {
          browseHistoryClearArmed = false;
          browseHistoryClearTimer = null;
          if (isBrowseHistoryPopoverOpen()) {
            renderBrowseHistory();
          }
        }, 4000);
        return;
      }
      clearBrowseHistory();
    });
  }

  function positionBrowseHistoryPopover(button, popover) {
    positionMessagePopover(button, popover);
  }

  function closeBrowseHistoryPopover() {
    const popover = document.querySelector(`.${BROWSE_HISTORY_POPOVER_CLASS}`);
    const button = document.querySelector(`.${BROWSE_HISTORY_ENTRY_CLASS}`);
    if (popover) {
      popover.hidden = true;
    }
    if (browseHistoryClearTimer) {
      window.clearTimeout(browseHistoryClearTimer);
      browseHistoryClearTimer = null;
    }
    browseHistoryClearArmed = false;
    button?.setAttribute("aria-expanded", "false");
  }

  function bindBrowseHistoryPopoverOutsideClick() {
    if (browseHistoryPopoverOutsideClickBound) {
      return;
    }

    browseHistoryPopoverOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest(`.${BROWSE_HISTORY_POPOVER_CLASS}, .${BROWSE_HISTORY_ENTRY_CLASS}, .${IMAGE_VIEWER_CLASS}`)) {
        return;
      }
      closeBrowseHistoryPopover();
    }, true);
    window.addEventListener("resize", () => {
      const popover = document.querySelector(`.${BROWSE_HISTORY_POPOVER_CLASS}`);
      const button = document.querySelector(`.${BROWSE_HISTORY_ENTRY_CLASS}`);
      if (popover && button && !popover.hidden) {
        positionBrowseHistoryPopover(button, popover);
      }
    });
  }

  function toggleBrowseHistoryPopover(button) {
    const popover = ensureBrowseHistoryPopover();
    const shouldOpen = popover.hidden;
    if (!shouldOpen) {
      closeBrowseHistoryPopover();
      return;
    }

    closeMessagePopover();
    closeFavoritePopover();
    popover.hidden = false;
    button.setAttribute("aria-expanded", "true");
    positionBrowseHistoryPopover(button, popover);
    bindBrowseHistoryPopoverOutsideClick();
    if (browseHistoryReady) {
      browseHistoryState.loading = false;
      browseHistoryState.error = "";
      renderBrowseHistory();
      loadEmojis().then(() => {
        if (isBrowseHistoryPopoverOpen()) {
          renderBrowseHistory();
        }
      }).catch(() => {});
      return;
    }
    refreshBrowseHistoryFromStorage();
  }

  function handleBrowseHistoryEntryClick(event, button) {
    if (event.__betterBrowseHistoryEntryHandled) {
      return;
    }
    if (event.type === "click" && Date.now() - browseHistoryEntryLastPointerHandledAt < 500) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      return;
    }
    event.__betterBrowseHistoryEntryHandled = true;
    if (event.type === "pointerdown") {
      browseHistoryEntryLastPointerHandledAt = Date.now();
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    toggleBrowseHistoryPopover(button);
  }

  function bindBrowseHistoryEntryClickDelegation() {
    if (browseHistoryEntryClickBound) {
      return;
    }

    browseHistoryEntryClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${BROWSE_HISTORY_ENTRY_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleBrowseHistoryEntryClick(event, button);
    }, true);
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${BROWSE_HISTORY_ENTRY_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleBrowseHistoryEntryClick(event, button);
    }, true);
  }

  function ensureBrowseHistoryEntry() {
    const favoriteEntry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (!favoriteEntry) {
      removeBrowseHistoryEntry();
      return;
    }

    let entry = document.querySelector(`.${BROWSE_HISTORY_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("button");
      entry.className = BROWSE_HISTORY_ENTRY_CLASS;
      entry.type = "button";
      entry.title = "查看浏览历史";
      entry.setAttribute("aria-label", "查看浏览历史");
      entry.setAttribute("aria-expanded", "false");
      entry.innerHTML = `
        <svg class="better-xiaoheihe-history-entry__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"></path>
          <path d="M12.75 6.5h-1.5v6.35l4.6 2.7.75-1.3-3.85-2.25V6.5Z"></path>
        </svg>
      `;
    }
    entry.onpointerdown = (event) => handleBrowseHistoryEntryClick(event, entry);
    entry.onclick = (event) => handleBrowseHistoryEntryClick(event, entry);
    bindBrowseHistoryEntryClickDelegation();

    if (entry.previousElementSibling !== favoriteEntry) {
      favoriteEntry.insertAdjacentElement("afterend", entry);
    }
  }
