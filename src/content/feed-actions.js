// 信息流点击捕获、行高同步、左侧菜单与快捷屏蔽。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function bindFeedItemActions(item, linkId) {
    if (item.dataset.betterActionsBound === "1") {
      return;
    }

    item.dataset.betterActionsBound = "1";
    item.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const fallbackImageWrap = event.target.closest(".better-feed-fallback-image-wrap");
      if (fallbackImageWrap && item.contains(fallbackImageWrap)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openFeedFallbackImageViewer(fallbackImageWrap);
        return;
      }

      const aiButton = event.target.closest(".better-ai-summary-button");
      if (aiButton && item.contains(aiButton)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        summarizeFeedItem(item, linkId, aiButton);
        return;
      }

      const linkAwardButton = event.target.closest(".content-list__like");
      if (!linkAwardButton || !item.contains(linkAwardButton)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      awardLink(linkId, linkAwardButton);
    });
  }

  function bindFeedAwardCapture() {
    if (feedAwardCaptureBound) {
      return;
    }

    feedAwardCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const linkAwardButton = event.target.closest(".content-list__like");
      const item = linkAwardButton?.closest(FEED_ITEM_SELECTOR);
      if (!linkAwardButton || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const linkId = getLinkIdFromItem(item);
      if (!linkId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      awardLink(linkId, linkAwardButton);
    }, true);
  }

  function bindTopicBlockContextMenu() {
    if (topicBlockContextMenuBound) {
      return;
    }

    topicBlockContextMenuBound = true;
    document.addEventListener("contextmenu", (event) => {
      if (!(event.target instanceof Element) || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const topicText = getTopicTextFromContextTarget(event.target);
      if (!topicText) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openTopicBlockMenu(topicText, event.clientX, event.clientY);
    }, true);
  }

  function closeTopicBlockMenu() {
    document.querySelector(`.${TOPIC_BLOCK_MENU_CLASS}`)?.remove();
  }

  function positionTopicBlockMenu(menu, x, y) {
    const margin = 8;
    const left = Math.min(window.innerWidth - menu.offsetWidth - margin, Math.max(margin, x));
    const top = Math.min(window.innerHeight - menu.offsetHeight - margin, Math.max(margin, y));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function openTopicBlockMenu(topicText, x, y) {
    closeTopicBlockMenu();

    const menu = document.createElement("div");
    menu.className = TOPIC_BLOCK_MENU_CLASS;
    menu.innerHTML = `
      <button class="better-topic-block-menu__button" type="button">
        <svg class="better-topic-block-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M6.7 17.3 17.3 6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        <span class="better-topic-block-menu__label">屏蔽「${escapeHtml(topicText)}」</span>
      </button>
    `;
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!(event.target instanceof Element) || !event.target.closest(".better-topic-block-menu__button")) {
        return;
      }

      addFeedBlockedKeywordFromTopic(topicText);
      closeTopicBlockMenu();
    });
    document.body.appendChild(menu);
    positionTopicBlockMenu(menu, x, y);

    const closeOnOutsideClick = (event) => {
      if (event.target instanceof Element && event.target.closest(`.${TOPIC_BLOCK_MENU_CLASS}`)) {
        return;
      }
      closeTopicBlockMenu();
      document.removeEventListener("click", closeOnOutsideClick, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      closeTopicBlockMenu();
      document.removeEventListener("click", closeOnOutsideClick, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };

    window.setTimeout(() => {
      document.addEventListener("click", closeOnOutsideClick, true);
      document.addEventListener("keydown", closeOnEscape, true);
    }, 0);
  }

  function syncRowHeight(row) {
    if (!row) {
      return;
    }

    const item = getRowFeedItem(row);
    if (!item) {
      return;
    }

    const height = Math.ceil(item.getBoundingClientRect().height);
    if (height > 0) {
      row.style.setProperty("--better-row-height", `${height}px`);
    }
  }

  function scheduleRowHeightSync(row) {
    if (!row) {
      return;
    }

    window.requestAnimationFrame(() => {
      syncRowHeight(row);
    });
  }

  function observeRowHeight(row, item) {
    if (!row || !item) {
      return;
    }

    if (!rowResizeObserver && window.ResizeObserver) {
      rowResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          syncRowHeight(entry.target.closest(`.${ROW_CLASS}`));
        });
      });
    }

    rowResizeObserver?.observe(item);
    item.querySelectorAll("img").forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener("load", () => syncRowHeight(row), { once: true });
      image.addEventListener("error", () => syncRowHeight(row), { once: true });
    });
    scheduleRowHeightSync(row);
  }

  function getRowFeedItem(row) {
    return row?.querySelector(":scope > .hb-cpt__bbs-list-content")
      || row?.querySelector(":scope > .hb-cpt__bbs-content")
      || null;
  }

  function bindFeedImageCapture() {
    if (feedImageCaptureBound) {
      return;
    }

    feedImageCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const fallbackImageWrap = event.target.closest(".better-feed-fallback-image-wrap");
      const item = fallbackImageWrap?.closest(FEED_ITEM_SELECTOR);
      if (!fallbackImageWrap || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openFeedFallbackImageViewer(fallbackImageWrap);
    }, true);
  }

  function hasNativeFeedImages(item) {
    return Array.from(item?.querySelectorAll("img") || []).some((image) => (
      !image.closest(".better-feed-fallback-images")
      && !image.closest(".bbs-list-content__header")
      && !image.closest(".bbs-content__bottom-line")
    ));
  }

  function normalizeNativeFeedImageLayout(item) {
    const wrapper = item?.querySelector(".bbs-content__imgs-wrapper");
    const images = Array.from(wrapper?.querySelectorAll(":scope > .bbs-content__image") || []);
    if (!wrapper || images.length < 2) {
      wrapper?.classList.remove("better-native-feed-images--row");
      wrapper?.classList.remove("better-native-feed-images--feature");
      wrapper?.style.removeProperty("--better-native-image-count");
      return;
    }

    const topPositions = images.map((image) => Number.parseFloat(image.style.top || "0"));
    const isSingleRow = topPositions.every((top) => Number.isFinite(top) && Math.abs(top - topPositions[0]) < 1);
    const leftPositions = images.map((image) => Number.parseFloat(image.style.left || "0"));
    const isFeatureLayout = images.length === 3
      && Math.abs(topPositions[0]) < 1
      && Math.abs(topPositions[1]) < 1
      && topPositions[2] > topPositions[1]
      && leftPositions[1] > leftPositions[0]
      && Math.abs(leftPositions[2] - leftPositions[1]) < 1;
    wrapper.classList.toggle("better-native-feed-images--row", isSingleRow);
    wrapper.classList.toggle("better-native-feed-images--feature", isFeatureLayout);
    if (isSingleRow) {
      wrapper.style.setProperty("--better-native-image-count", String(images.length));
    } else {
      wrapper.style.removeProperty("--better-native-image-count");
    }
  }

  function ensureFeedItemFallbackImages(item, detail) {
    const existing = item?.querySelector(".better-feed-fallback-images");
    const imageUrls = Array.isArray(detail?.feedImageUrls) ? detail.feedImageUrls.filter(isSafeCommentImageUrl) : [];
    if (!item || hasNativeFeedImages(item) || !imageUrls.length) {
      existing?.remove();
      return;
    }

    const thumbnailUrls = Array.isArray(detail?.feedThumbnailUrls) ? detail.feedThumbnailUrls : [];
    const visibleImages = imageUrls.slice(0, 3);
    const signature = JSON.stringify([imageUrls, thumbnailUrls]);
    if (existing?.dataset.signature === signature) {
      return;
    }

    const container = existing || document.createElement("div");
    container.className = "better-feed-fallback-images";
    container.dataset.signature = signature;
    container.dataset.visibleCount = String(visibleImages.length);
    container.innerHTML = visibleImages.map((url, index) => {
      const thumbnailUrl = isSafeCommentImageUrl(thumbnailUrls[index]) ? thumbnailUrls[index] : url;
      const remainingCount = index === visibleImages.length - 1 && imageUrls.length > visibleImages.length
        ? imageUrls.length - visibleImages.length + 1
        : 0;
      return `
        <span class="better-feed-fallback-image-wrap">
          <img class="better-feed-fallback-image" src="${escapeHtml(thumbnailUrl)}" alt="帖子图片 ${escapeHtml(index + 1)}" loading="lazy">
          ${remainingCount > 0 ? `<span class="better-feed-fallback-more">+${escapeHtml(remainingCount)}</span>` : ""}
        </span>
      `;
    }).join("");

    if (!existing) {
      const bottomLine = item.querySelector(".bbs-content__bottom-line");
      if (bottomLine) {
        bottomLine.insertAdjacentElement("beforebegin", container);
      } else {
        item.appendChild(container);
      }
    }

    container.querySelectorAll("img").forEach((image) => {
      image.addEventListener("load", () => scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`)), { once: true });
      image.addEventListener("error", () => scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`)), { once: true });
    });
    scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`));
  }

  function updateFeedItemFallbackImages(linkId, detail) {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach((item) => {
      if (getLinkIdFromItem(item) === String(linkId)) {
        ensureFeedItemFallbackImages(item, detail);
      }
    });
  }

  function enhanceFeedItem(item) {
    if (item.closest(`.${ROW_CLASS}`)) {
      ensureFeedItemUserLevel(item);
      normalizeNativeFeedImageLayout(item);
      ensureFeedItemFallbackImages(item, commentCache.get(getLinkIdFromItem(item))?.linkDetail);
      return;
    }

    const linkId = getLinkIdFromItem(item);
    if (!linkId) {
      return;
    }

    bindFeedItemActions(item, linkId);
    ensureAiSummaryButton(item);
    ensureFeedItemUserLevel(item);
    setFeedItemPublishTime(item, commentCache.get(linkId)?.linkCreateAt);

    const searchResultRow = item.parentElement?.classList.contains("search-result__link")
      ? item.parentElement
      : null;
    const row = searchResultRow || document.createElement("div");
    row.classList.add(ROW_CLASS);

    const preview = document.createElement("aside");
    preview.className = PREVIEW_CLASS;
    preview.dataset.linkId = linkId;
    preview.dataset.commentCount = getCommentCountFromItem(item);

    if (!searchResultRow) {
      item.parentNode.insertBefore(row, item);
      row.appendChild(item);
    }
    row.appendChild(preview);
    applyFeedItemKeywordFilter(row, item);
    renderPreview(preview, null);
    normalizeNativeFeedImageLayout(item);
    observeRowHeight(row, item);
    observePreview(preview);
    ensureFeedItemFallbackImages(item, commentCache.get(linkId)?.linkDetail);
  }

  function enhanceFeed() {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach(enhanceFeedItem);
    refreshFeedItemFilters();
  }

  function refreshFeedItemFilters() {
    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      applyFeedItemKeywordFilter(row, getRowFeedItem(row));
    });
    refreshTopicEntryFilters();
  }

  function getTopMenuMountPoint() {
    return document.querySelector(".hb-view-header .view-header__right")
      || document.querySelector(".hb-view-header .hb-layout-main__container--main")
      || null;
  }

  function setTopMenuOpen(topMenu, isOpen) {
    topMenu.classList.toggle(TOP_MENU_OPEN_CLASS, isOpen);
    topMenu.querySelector(`.${TOP_MENU_TOGGLE_CLASS}`)?.setAttribute("aria-expanded", String(isOpen));
  }

  function closeTopMenus() {
    document.querySelectorAll(`.${TOP_MENU_CLASS}.${TOP_MENU_OPEN_CLASS}`).forEach((topMenu) => {
      setTopMenuOpen(topMenu, false);
    });
  }

  function bindTopMenuOutsideClick() {
    if (topMenuOutsideClickBound) {
      return;
    }

    topMenuOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(`.${TOP_MENU_CLASS}`)) {
        return;
      }

      if (event.target instanceof Element && (
        event.target.closest(`.${SETTINGS_ENTRY_CLASS}`)
        || event.target.closest(`.${SETTINGS_PANEL_CLASS}`)
      )) {
        return;
      }

      closeTopMenus();
      closeSettingsPanel();
    });
  }

  function ensureTopMenuParts(topMenu) {
    let toggle = topMenu.querySelector(`.${TOP_MENU_TOGGLE_CLASS}`);
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = TOP_MENU_TOGGLE_CLASS;
      toggle.type = "button";
      toggle.title = "展开菜单";
      toggle.setAttribute("aria-label", "展开菜单");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="hb-icon heybox-common_list2_line_24x24"></i>';
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setTopMenuOpen(topMenu, !topMenu.classList.contains(TOP_MENU_OPEN_CLASS));
      });
      topMenu.appendChild(toggle);
    }

    let panel = topMenu.querySelector(`.${TOP_MENU_PANEL_CLASS}`);
    if (!panel) {
      panel = document.createElement("div");
      panel.className = TOP_MENU_PANEL_CLASS;
      panel.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      topMenu.appendChild(panel);
    }

    bindTopMenuOutsideClick();
    return panel;
  }

  function removeDuplicateTopMenus(activeTopMenu) {
    document.querySelectorAll(`.${TOP_MENU_CLASS}`).forEach((topMenu) => {
      if (topMenu !== activeTopMenu) {
        topMenu.remove();
      }
    });
  }

  function findLeftMenu() {
    const menus = Array.from(document.querySelectorAll(".hb-websit__left-section"));
    return menus.find((menu) => !menu.closest(`.${TOP_MENU_CLASS}`)) || menus[0] || null;
  }

  function moveLeftMenuToTop() {
    const leftMenu = findLeftMenu();
    const mountPoint = getTopMenuMountPoint();

    if (!leftMenu || !mountPoint) {
      return;
    }

    if (!leftMenuOriginalPosition) {
      leftMenuOriginalPosition = {
        parent: leftMenu.parentElement,
        nextSibling: leftMenu.nextSibling
      };
    }

    let topMenu = mountPoint.querySelector(`.${TOP_MENU_CLASS}`);
    if (!topMenu) {
      topMenu = document.createElement("div");
      topMenu.className = TOP_MENU_CLASS;
      mountPoint.insertBefore(topMenu, mountPoint.firstChild);
    }

    const panel = ensureTopMenuParts(topMenu);
    if (leftMenu.parentElement !== panel) {
      panel.appendChild(leftMenu);
    }

    removeDuplicateTopMenus(topMenu);
  }

  function restoreLeftMenu() {
    const leftMenu = document.querySelector(`.${TOP_MENU_CLASS} .hb-websit__left-section`);

    closeTopMenus();

    if (leftMenu && leftMenuOriginalPosition?.parent?.isConnected) {
      leftMenuOriginalPosition.parent.insertBefore(
        leftMenu,
        leftMenuOriginalPosition.nextSibling?.isConnected ? leftMenuOriginalPosition.nextSibling : null
      );
    }

    removeDuplicateTopMenus(null);
  }

  function removeFavoriteEntry() {
    document.querySelectorAll(`.${FAVORITE_ENTRY_CLASS}`).forEach((entry) => {
      entry.remove();
    });
  }

  function removeHeaderSearch() {
    document.querySelectorAll(`.${HEADER_SEARCH_CLASS}`).forEach((entry) => {
      entry.remove();
    });
  }

  function removeSettingsEntry() {
    document.querySelectorAll(`.${SETTINGS_ENTRY_CLASS}`).forEach((entry) => {
      entry.remove();
    });
    removeHeaderSearch();
    removeHeaderMessage();
    document.querySelector(`.${SETTINGS_PANEL_CLASS}`)?.remove();
  }

