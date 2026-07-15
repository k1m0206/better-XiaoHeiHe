// 评论预览、回复表单、图片处理和信息流增强。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function requestCommentApiJson(buildUrl, includeIdentity) {
    return fetch(buildUrl({ includeHeyboxId: includeIdentity }), {
      credentials: "include",
      headers: {
        accept: "*/*"
      }
    }).then((response) => response.json());
  }

  function fetchCommentApiJson(buildUrl) {
    return runWithSanitizedCommentCookie(() => requestCommentApiJson(buildUrl, false))
      .then((data) => (data?.status === "ok" ? data : requestCommentApiJson(buildUrl, true)))
      .catch(() => requestCommentApiJson(buildUrl, true));
  }

  function fetchCommentApiJsonWithIdentity(buildUrl) {
    return requestCommentApiJson(buildUrl, true);
  }

  function retryFirstCommentPageWithIdentity(linkId) {
    return delay(COMMENT_IDENTITY_RETRY_DELAY)
      .then(() => fetchCommentPageData(linkId, 1, { identityOnly: true }));
  }

  function markFirstCommentPageFailed(linkId) {
    const state = commentCache.get(linkId) || { commentGroups: [] };
    state.failed = true;
    state.loadingMore = false;
    state.loadMoreFailed = false;
    state.hasMore = false;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function retryFailedFirstCommentPage(linkId) {
    return retryFirstCommentPageWithIdentity(linkId).then((retryData) => {
      const retryState = commentCache.get(linkId) || { commentGroups: [] };
      if (retryData?.status !== "ok") {
        markFirstCommentPageFailed(linkId);
        return;
      }

      const nextState = cacheCommentPageFromApiData(linkId, 1, retryData) || retryState;
      updateFeedItemPublishTime(linkId, nextState.linkCreateAt);
      renderLinkedPreviews(linkId);
    }).catch(() => markFirstCommentPageFailed(linkId));
  }

  function fetchCommentPage(linkId, page) {
    fetchCommentPageData(linkId, page).then((data) => {
      const state = commentCache.get(linkId) || { commentGroups: [] };
      if (data?.status !== "ok") {
        if (page === 1) {
          retryFailedFirstCommentPage(linkId);
          return;
        }

        state.failed = page === 1;
        state.loadingMore = false;
        state.loadMoreFailed = page > 1;
        state.hasMore = false;
        commentCache.set(linkId, state);
        renderLinkedPreviews(linkId);
        return;
      }

      const nextState = cacheCommentPageFromApiData(linkId, page, data) || state;
      updateFeedItemPublishTime(linkId, nextState.linkCreateAt);
      renderLinkedPreviews(linkId);
    }).catch(() => {
      if (page === 1) {
        retryFailedFirstCommentPage(linkId);
        return;
      }

      const state = commentCache.get(linkId) || { commentGroups: [] };
      state.failed = page === 1;
      state.loadingMore = false;
      state.loadMoreFailed = page > 1;
      state.hasMore = false;
      commentCache.set(linkId, state);
      renderLinkedPreviews(linkId);
    });
  }

  function getLastReplyValue(group) {
    const lastReply = group.replies?.at(-1);
    return getCommentId(lastReply) || getCommentId(group.root);
  }

  function findCommentGroup(linkId, rootCommentId) {
    const state = commentCache.get(linkId);
    const group = state?.commentGroups?.find((item) => {
      return String(getCommentId(item.root)) === String(rootCommentId);
    });

    return { state, group };
  }

  function mergeReplyComments(group, replies) {
    const existingIds = new Set((group.replies || []).map((reply) => String(getCommentId(reply))));
    const nextReplies = replies.filter((reply) => {
      const replyId = String(getCommentId(reply));
      if (!replyId || existingIds.has(replyId)) {
        return false;
      }
      existingIds.add(replyId);
      return true;
    });

    group.replies = (group.replies || []).concat(nextReplies);
    group.replyCount = Math.max(Number(group.replyCount) || 0, group.replies.length);
    group.repliesHasMore = nextReplies.length > 0
      && (nextReplies.length >= SUB_COMMENT_PAGE_LIMIT || group.replies.length < group.replyCount);
  }

  function loadMoreReplyComments(preview, rootCommentId) {
    const linkId = preview.dataset.linkId;
    const { state, group } = findCommentGroup(linkId, rootCommentId);
    if (!linkId || !state || !group || group.repliesLoading) {
      return;
    }

    group.repliesLoading = true;
    group.repliesFailed = false;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);

    Promise.all([
      loadEmojis(),
      fetchCommentApiJson((options) => buildSubCommentApiUrl(rootCommentId, getLastReplyValue(group), options))
    ]).then(([, data]) => {
      const { state: nextState, group: nextGroup } = findCommentGroup(linkId, rootCommentId);
      if (!nextState || !nextGroup) {
        return;
      }

      nextGroup.repliesLoading = false;
      if (data?.status !== "ok") {
        nextGroup.repliesFailed = true;
        commentCache.set(linkId, nextState);
        renderLinkedPreviews(linkId);
        return;
      }

      mergeReplyComments(nextGroup, normalizeSubComments(data, rootCommentId));
      nextGroup.repliesFailed = false;
      commentCache.set(linkId, nextState);
      renderLinkedPreviews(linkId);
    }).catch(() => {
      const { state: nextState, group: nextGroup } = findCommentGroup(linkId, rootCommentId);
      if (!nextState || !nextGroup) {
        return;
      }

      nextGroup.repliesLoading = false;
      nextGroup.repliesFailed = true;
      commentCache.set(linkId, nextState);
      renderLinkedPreviews(linkId);
    });
  }

  function renderLinkedPreviews(linkId) {
    const state = commentCache.get(linkId);
    document.querySelectorAll(`.${PREVIEW_CLASS}`).forEach((node) => {
      if (node.dataset.linkId !== linkId) {
        return;
      }

      const list = node.querySelector(".better-comment-preview__list");
      const scrollTop = list?.scrollTop || 0;
      renderPreview(node, state);
      const nextList = node.querySelector(".better-comment-preview__list");
      if (nextList) {
        nextList.scrollTop = scrollTop;
      }
    });
    syncCyToggleControls();
  }

  function renderAllPreviews() {
    document.querySelectorAll(`.${PREVIEW_CLASS}`).forEach((node) => {
      const linkId = node.dataset.linkId || "";
      const state = commentCache.get(linkId);
      if (!state) {
        return;
      }

      const list = node.querySelector(".better-comment-preview__list");
      const scrollTop = list?.scrollTop || 0;
      renderPreview(node, state);
      const nextList = node.querySelector(".better-comment-preview__list");
      if (nextList) {
        nextList.scrollTop = scrollTop;
      }
    });
    syncCyToggleControls();
  }

  function setHideCyComments(isHidden) {
    hideCyComments = isHidden;
    writeHideCyCommentsState(isHidden);
    syncCyToggleControls();
    refreshAllCommentFilters();
  }

  function setCommentPreviewSort(sort) {
    commentPreviewSort = normalizeCommentPreviewSort(sort);
    writeCommentPreviewSortState(commentPreviewSort);
    syncCommentSortControls();
    refreshAllCommentFilters();
  }

  function updateCachedComment(commentId, updater) {
    let changedLinkId = "";
    commentCache.forEach((state, linkId) => {
      if (!state?.commentGroups?.length) {
        return;
      }

      const changed = state.commentGroups.some((group) => {
        const comments = [group.root, ...(group.replies || [])];
        const comment = comments.find((item) => String(getCommentId(item)) === String(commentId));
        if (!comment) {
          return false;
        }

        updater(comment);
        return true;
      });

      if (changed) {
        changedLinkId = linkId;
      }
    });

    if (changedLinkId) {
      renderLinkedPreviews(changedLinkId);
    }

    return Boolean(changedLinkId);
  }

  function updateSupportButton(button, count, supported) {
    const countElement = button.querySelector("span");
    if (countElement) {
      countElement.textContent = String(count);
    }
    button.classList.toggle("better-comment-preview__up--active", supported);
    button.disabled = false;
    delete button.dataset.loading;
  }

  function supportComment(commentId, button) {
    if (!commentId || button.dataset.loading === "1") {
      return;
    }

    button.dataset.loading = "1";
    button.disabled = true;

    runAfterIdentityCookiesRestored(() => fetch(buildCommentSupportApiUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams({
        comment_id: commentId,
        support_type: "1"
      }).toString()
    })).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        delete button.dataset.loading;
        button.disabled = false;
        return;
      }

      const changed = updateCachedComment(commentId, (comment) => {
        if (!isCommentSupported(comment)) {
          comment.up = getCommentUpCount(comment) + 1;
        }
        comment.is_support = 1;
        comment.better_supported = true;
      });

      if (!changed) {
        updateSupportButton(button, getCommentUpCount({ up: button.querySelector("span")?.textContent }) + 1, true);
      }
    }).catch(() => {
      delete button.dataset.loading;
      button.disabled = false;
    });
  }

  function getLinkAwardCountElement(linkAwardButton) {
    return linkAwardButton.querySelector(LINK_AWARD_COUNT_SELECTOR);
  }

  function getLinkAwardCount(linkAwardButton) {
    const count = Number(getLinkAwardCountElement(linkAwardButton)?.textContent?.trim() || 0);
    return Number.isFinite(count) ? count : 0;
  }

  function updateLinkAwardButtons(linkId, updater) {
    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      const item = getRowFeedItem(row);
      if (!item || getLinkIdFromItem(item) !== linkId) {
        return;
      }

      const linkAwardButton = item.querySelector(LINK_AWARD_BUTTON_SELECTOR);
      if (linkAwardButton) {
        updater(linkAwardButton);
      }
    });
  }

  function awardLink(linkId, linkAwardButton) {
    if (!linkId || linkAwardButton.dataset.loading === "1") {
      return;
    }

    const state = commentCache.get(linkId) || { commentGroups: [] };
    if (state.linkAwarded) {
      return;
    }

    linkAwardButton.dataset.loading = "1";
    linkAwardButton.classList.add("better-link-award--loading");
    state.linkAwarding = true;
    commentCache.set(linkId, state);

    runAfterIdentityCookiesRestored(() => fetch(buildLinkAwardApiUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams({
        link_id: linkId,
        award_type: "1"
      }).toString()
    })).then((response) => response.json()).then((data) => {
      const nextState = commentCache.get(linkId) || state;
      nextState.linkAwarding = false;
      if (data?.status === "ok") {
        nextState.linkAwarded = true;
        updateLinkAwardButtons(linkId, (button) => {
          delete button.dataset.loading;
          button.classList.remove("better-link-award--loading");
          button.classList.add("better-link-award--active");
          const countElement = getLinkAwardCountElement(button);
          if (countElement) {
            countElement.textContent = String(getLinkAwardCount(button) + 1);
          }
        });
      } else {
        updateLinkAwardButtons(linkId, (button) => {
          delete button.dataset.loading;
          button.classList.remove("better-link-award--loading");
        });
      }
      commentCache.set(linkId, nextState);
    }).catch(() => {
      const nextState = commentCache.get(linkId) || state;
      nextState.linkAwarding = false;
      commentCache.set(linkId, nextState);
      updateLinkAwardButtons(linkId, (button) => {
        delete button.dataset.loading;
        button.classList.remove("better-link-award--loading");
      });
    });
  }

  function ensureImageViewer() {
    let viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
    if (viewer) {
      return viewer;
    }

    viewer = document.createElement("div");
    viewer.className = IMAGE_VIEWER_CLASS;
    viewer.hidden = true;
    viewer.innerHTML = `
      <button class="better-image-viewer__close" type="button" aria-label="关闭图片预览">×</button>
      <button class="better-image-viewer__prev" type="button" aria-label="上一张">‹</button>
      <img class="better-image-viewer__image" alt="">
      <button class="better-image-viewer__next" type="button" aria-label="下一张">›</button>
      <div class="better-image-viewer__counter"></div>
    `;
    viewer.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target === viewer || event.target.closest(".better-image-viewer__close")) {
        closeImageViewer();
        return;
      }

      if (event.target.closest(".better-image-viewer__prev")) {
        showImageViewerAt(activeImageViewerIndex - 1);
        return;
      }

      if (event.target.closest(".better-image-viewer__next")) {
        showImageViewerAt(activeImageViewerIndex + 1);
      }
    });
    document.body.appendChild(viewer);
    bindImageViewerKeydown();
    return viewer;
  }

  function bindImageViewerKeydown() {
    if (imageViewerKeydownBound) {
      return;
    }

    imageViewerKeydownBound = true;
    document.addEventListener("keydown", (event) => {
      const viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
      if (!viewer || viewer.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeImageViewer();
      } else if (event.key === "ArrowLeft") {
        showImageViewerAt(activeImageViewerIndex - 1);
      } else if (event.key === "ArrowRight") {
        showImageViewerAt(activeImageViewerIndex + 1);
      }
    });
  }

  function getImageViewerPreload(imageUrl) {
    if (imageViewerPreloadCache.has(imageUrl)) {
      return imageViewerPreloadCache.get(imageUrl);
    }

    const preloadImage = new Image();
    preloadImage.decoding = "async";
    preloadImage.addEventListener("error", () => {
      if (imageViewerPreloadCache.get(imageUrl) === preloadImage) {
        imageViewerPreloadCache.delete(imageUrl);
      }
    }, { once: true });
    imageViewerPreloadCache.set(imageUrl, preloadImage);
    preloadImage.src = imageUrl;
    return preloadImage;
  }

  function preloadNearbyImageViewerImages() {
    const imageCount = activeImageViewerImages.length;
    if (imageCount <= 1) {
      return;
    }

    const preloadIndexes = new Set();
    const preloadAheadCount = Math.min(3, imageCount - 1);
    for (let offset = 1; offset <= preloadAheadCount; offset += 1) {
      preloadIndexes.add((activeImageViewerIndex + offset) % imageCount);
    }
    preloadIndexes.add((activeImageViewerIndex - 1 + imageCount) % imageCount);
    preloadIndexes.forEach((preloadIndex) => {
      getImageViewerPreload(activeImageViewerImages[preloadIndex]);
    });
  }

  function pruneImageViewerPreloadCache() {
    const activeImageUrls = new Set(activeImageViewerImages);
    Array.from(imageViewerPreloadCache.keys()).forEach((imageUrl) => {
      if (!activeImageUrls.has(imageUrl)) {
        imageViewerPreloadCache.delete(imageUrl);
      }
    });
  }

  function showImageViewerAt(index) {
    if (!activeImageViewerImages.length) {
      return;
    }

    const viewer = ensureImageViewer();
    const image = viewer.querySelector(".better-image-viewer__image");
    const counter = viewer.querySelector(".better-image-viewer__counter");
    const prev = viewer.querySelector(".better-image-viewer__prev");
    const next = viewer.querySelector(".better-image-viewer__next");
    const wasHidden = viewer.hidden;
    const previousIndex = activeImageViewerIndex;
    const direction = wasHidden ? "open" : (index < previousIndex ? "prev" : "next");
    activeImageViewerIndex = (index + activeImageViewerImages.length) % activeImageViewerImages.length;
    const imageUrl = activeImageViewerImages[activeImageViewerIndex];
    const loadToken = ++imageViewerLoadToken;
    pruneImageViewerPreloadCache();
    counter.textContent = activeImageViewerImages.length > 1
      ? `${activeImageViewerIndex + 1} / ${activeImageViewerImages.length}`
      : "";
    prev.hidden = activeImageViewerImages.length <= 1;
    next.hidden = activeImageViewerImages.length <= 1;
    lockPageScroll(IMAGE_VIEWER_CLASS);
    viewer.hidden = false;
    viewer.classList.add("better-image-viewer--loading");

    const revealImage = () => {
      if (loadToken !== imageViewerLoadToken || viewer.hidden) {
        return;
      }

      const transitionClass = `better-image-viewer__image--enter-${direction}`;
      image.classList.remove(
        "better-image-viewer__image--enter-open",
        "better-image-viewer__image--enter-prev",
        "better-image-viewer__image--enter-next"
      );
      image.src = imageUrl;
      viewer.classList.remove("better-image-viewer--loading");
      void image.offsetWidth;
      image.classList.add(transitionClass);
      image.addEventListener("animationend", () => image.classList.remove(transitionClass), { once: true });
      window.setTimeout(() => {
        if (loadToken === imageViewerLoadToken) {
          image.classList.remove(transitionClass);
        }
      }, 320);
      preloadNearbyImageViewerImages();
    };

    if (image.src === imageUrl && image.complete) {
      revealImage();
      return;
    }

    const preloadImage = getImageViewerPreload(imageUrl);
    if (preloadImage.complete) {
      revealImage();
      return;
    }
    preloadImage.addEventListener("load", revealImage, { once: true });
    preloadImage.addEventListener("error", revealImage, { once: true });
  }

  function closeImageViewer() {
    const viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
    if (!viewer) {
      return;
    }

    imageViewerLoadToken += 1;
    viewer.hidden = true;
    viewer.classList.remove("better-image-viewer--loading");
    const image = viewer.querySelector(".better-image-viewer__image");
    if (image) {
      image.classList.remove(
        "better-image-viewer__image--enter-open",
        "better-image-viewer__image--enter-prev",
        "better-image-viewer__image--enter-next"
      );
      image.removeAttribute("src");
    }
    unlockPageScroll(IMAGE_VIEWER_CLASS);
  }

  function updateExpandButton(textElement) {
    const expandButton = textElement.nextElementSibling;
    if (textElement.scrollHeight > textElement.clientHeight) {
      expandButton.style.display = "block";
    }
  }

  function toggleCommentExpansion(textElement) {
    const isExpanded = textElement.dataset.expanded === "true";
    const expandButton = textElement.nextElementSibling;
    if (isExpanded) {
      // collapse
      textElement.dataset.expanded = "false";
      textElement.style.webkitLineClamp = "3";
      expandButton.textContent = "展开";
      expandButton.classList.remove("is-expanded");
    } else {
      // expand
      textElement.dataset.expanded = "true";
      textElement.style.webkitLineClamp = "none";
      expandButton.textContent = "收起";
      expandButton.classList.add("is-expanded");
    }
  }

  function openImageViewerFromUrls(imageUrls, index = 0) {
    activeImageViewerImages = (Array.isArray(imageUrls) ? imageUrls : []).filter(isSafeCommentImageUrl);
    if (!activeImageViewerImages.length) {
      return false;
    }
    showImageViewerAt(Math.max(0, Number(index) || 0));
    return true;
  }

  function openCommentImageViewer(imageLink) {
    const imageGroup = imageLink.closest(".better-comment-preview__images");
    const links = Array.from(imageGroup?.querySelectorAll(".better-comment-preview__image-link") || [imageLink]);
    const index = Math.max(0, links.indexOf(imageLink));
    openImageViewerFromUrls(links.map((link) => link.dataset.previewSrc || link.href), index);
  }

  function openFeedFallbackImageViewer(imageWrap) {
    const imageGroup = imageWrap.closest(".better-feed-fallback-images");
    const visibleWraps = Array.from(imageGroup?.querySelectorAll(".better-feed-fallback-image-wrap") || []);
    if (!imageGroup || !visibleWraps.length) {
      return;
    }

    let imageUrls = [];
    try {
      const signature = JSON.parse(imageGroup.dataset.signature || "[]");
      imageUrls = Array.isArray(signature?.[0]) ? signature[0].filter(isSafeCommentImageUrl) : [];
    } catch {
      imageUrls = [];
    }
    if (!imageUrls.length) {
      imageUrls = visibleWraps
        .map((wrap) => wrap.querySelector(".better-feed-fallback-image")?.src || "")
        .filter(isSafeCommentImageUrl);
    }
    if (!imageUrls.length) {
      return;
    }

    openImageViewerFromUrls(imageUrls, Math.max(0, visibleWraps.indexOf(imageWrap)));
  }

  function openFeedNativeImageViewer(imageWrap, item) {
    const imageGroup = imageWrap?.closest(".bbs-content__imgs-wrapper");
    const visibleWraps = Array.from(imageGroup?.querySelectorAll(":scope > .bbs-content__image") || []);
    if (!imageGroup || !visibleWraps.length) {
      return;
    }

    const linkId = getLinkIdFromItem(item);
    const cachedImageUrls = commentCache.get(linkId)?.linkDetail?.feedImageUrls || [];
    const imageUrls = cachedImageUrls.filter(isSafeCommentImageUrl);
    const viewerImageUrls = imageUrls.length
      ? imageUrls
      : visibleWraps
        .map((wrap) => wrap.querySelector(".hb-cpt__image-elem")?.currentSrc
          || wrap.querySelector(".hb-cpt__image-elem")?.src
          || "")
        .filter(isSafeCommentImageUrl);
    openImageViewerFromUrls(viewerImageUrls, Math.max(0, visibleWraps.indexOf(imageWrap)));
  }

  function findCachedComment(linkId, commentId) {
    const state = commentCache.get(linkId);
    if (!state?.commentGroups?.length || !commentId) {
      return { state, group: null, comment: null };
    }

    for (const group of state.commentGroups) {
      if (String(getCommentId(group.root)) === String(commentId)) {
        return { state, group, comment: group.root };
      }

      const reply = (group.replies || []).find((item) => String(getCommentId(item)) === String(commentId));
      if (reply) {
        return { state, group, comment: reply };
      }
    }

    return { state, group: null, comment: null };
  }

  function getPreviewReplyTargetFromElement(element) {
    if (!element) {
      return null;
    }

    const commentId = element.dataset.commentId || "";
    if (!commentId) {
      return null;
    }

    return {
      commentId,
      rootCommentId: element.dataset.rootCommentId || commentId,
      username: element.dataset.commentUsername || ""
    };
  }

  function openPreviewReplyForm(preview, target) {
    const linkId = preview.dataset.linkId || "";
    if (!linkId || !target?.commentId) {
      return;
    }

    const state = commentCache.get(linkId);
    if (!state) {
      return;
    }

    const { comment } = target.commentId === POST_COMMENT_TARGET_ID
      ? { comment: null }
      : findCachedComment(linkId, target.commentId);
    state.activeReplyTarget = {
      commentId: String(target.commentId),
      rootCommentId: String(target.rootCommentId || target.commentId),
      username: target.username || getCommentUserName(comment)
    };
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);

    window.requestAnimationFrame(() => {
      const form = preview.querySelector(".better-comment-preview__reply-form");
      form?.querySelector(".better-comment-preview__reply-input")?.focus();
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
    });
  }

  function closePreviewReplyForm(preview) {
    const linkId = preview.dataset.linkId || "";
    const state = commentCache.get(linkId);
    if (!state?.activeReplyTarget) {
      return;
    }

    delete state.activeReplyTarget;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function getPreviewReplyClickTarget(event, preview) {
    if (!(event.target instanceof Element)) {
      return null;
    }

    if (event.target.closest("a, button, input, textarea, select, label, .better-comment-preview__reply-form, .better-comment-preview__images")) {
      return null;
    }

    const targetElement = event.target.closest(".better-comment-preview__item[data-comment-id], .better-comment-preview__reply[data-comment-id]");
    if (!targetElement || !preview.contains(targetElement)) {
      return null;
    }

    return getPreviewReplyTargetFromElement(targetElement);
  }

  function getCreatedCommentFromResponse(data) {
    const candidates = [
      data?.result?.comment?.comment?.[0],
      data?.result?.comment?.[0],
      data?.result?.comment,
      data?.comment,
      data?.result
    ];

    return candidates.find((item) => item && typeof item === "object" && !Array.isArray(item)) || {};
  }

  function normalizeCreatedReplyComment(data, text, targetComment) {
    const created = { ...getCreatedCommentFromResponse(data) };
    if (!getCommentId(created)) {
      created.commentid = data?.commentid || data?.comment_id || Date.now();
    }
    if (!created.text) {
      created.text = text;
    }
    if (!created.create_at) {
      created.create_at = Math.floor(Date.now() / 1000);
    }
    if (!created.user || typeof created.user !== "object") {
      created.user = { username: "我" };
    }
    if ((!created.replyuser || typeof created.replyuser !== "object") && targetComment?.user) {
      created.replyuser = targetComment.user;
    }
    rememberCommentUserLevels(created);
    return created;
  }

  function prependCreatedPostComment(linkId, data, text) {
    const state = commentCache.get(linkId);
    if (!state) {
      return;
    }

    const createdComment = normalizeCreatedReplyComment(data, text, null);
    const createdCommentId = String(getCommentId(createdComment));
    const existingIds = new Set((state.commentGroups || []).map((group) => String(getCommentId(group.root))));
    if (!existingIds.has(createdCommentId)) {
      state.commentGroups = [{
        root: createdComment,
        replies: [],
        originalIndex: -1,
        replyCount: 0,
        repliesHasMore: false,
        repliesLoading: false,
        repliesFailed: false
      }].concat(state.commentGroups || []);
    }
    delete state.activeReplyTarget;
    state.commentCount = String((Number.parseInt(state.commentCount, 10) || 0) + 1);
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function appendCreatedReplyComment(linkId, rootCommentId, replyCommentId, data, text) {
    const { state, group } = findCommentGroup(linkId, rootCommentId);
    if (!state || !group) {
      return;
    }

    const targetComment = findCachedComment(linkId, replyCommentId).comment || group.root;
    const createdComment = normalizeCreatedReplyComment(data, text, targetComment);
    const createdCommentId = String(getCommentId(createdComment));
    const existingIds = new Set((group.replies || []).map((reply) => String(getCommentId(reply))));
    if (!existingIds.has(createdCommentId)) {
      group.replies = (group.replies || []).concat(createdComment);
    }
    group.replyCount = Math.max(Number(group.replyCount) || 0, group.replies.length);
    delete state.activeReplyTarget;
    state.commentCount = String((Number.parseInt(state.commentCount, 10) || 0) + 1);
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function setReplyFormSending(form, isSending) {
    form.dataset.submitting = isSending ? "true" : "false";
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (editor) {
      editor.setAttribute("contenteditable", isSending ? "false" : "true");
    }
    form.querySelectorAll("button").forEach((element) => {
      element.disabled = isSending;
    });
  }

  function setReplyFormStatus(form, message, isError = false) {
    const status = form.querySelector(".better-comment-preview__reply-status");
    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function getEmojiShortcode(emoji) {
    const token = String(emoji?.token || emoji?.code || "").trim().replace(/^\[/, "").replace(/\]$/, "");
    return token ? `[${token}]` : "";
  }

  function getEmojiByShortcode(shortcode) {
    const token = String(shortcode || "").trim().replace(/^\[/, "").replace(/\]$/, "");
    return emojiCache.get(token) || emojiCache.get(normalizeEmojiToken(token)) || null;
  }

  function recordEmojiUsage(shortcode) {
    const token = String(shortcode || "").trim();
    if (!token) {
      return;
    }

    emojiUsageStats = normalizeEmojiUsageStats({
      ...emojiUsageStats,
      [token]: (Number.parseInt(emojiUsageStats[token], 10) || 0) + 1
    });
    persistEmojiUsageStats();
  }

  function getEmojiPickerItems() {
    const seen = new Set();
    return Array.from(emojiCache.values()).filter((emoji) => {
      const shortcode = getEmojiShortcode(emoji);
      const key = emoji?.img || shortcode;
      if (!shortcode || !emoji?.img || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function getCommonEmojiPickerItems(allEmojis) {
    return [...allEmojis]
      .filter((emoji) => (emojiUsageStats[getEmojiShortcode(emoji)] || 0) > 0)
      .sort((left, right) => {
        const countDiff = (emojiUsageStats[getEmojiShortcode(right)] || 0) - (emojiUsageStats[getEmojiShortcode(left)] || 0);
        return countDiff || getEmojiShortcode(left).localeCompare(getEmojiShortcode(right), "zh-CN");
      })
      .slice(0, 12);
  }

  function renderEmojiOption(emoji) {
    const shortcode = getEmojiShortcode(emoji);
    return `
      <button class="better-comment-preview__emoji-option" type="button" data-emoji-text="${escapeHtml(shortcode)}" title="${escapeHtml(shortcode)}">
        <img class="better-comment-preview__emoji-option-image" src="${escapeHtml(emoji.img)}" alt="${escapeHtml(shortcode)}" loading="lazy">
      </button>
    `;
  }

  function renderReplyEmojiPanel(panel) {
    const emojis = getEmojiPickerItems();
    const commonEmojis = getCommonEmojiPickerItems(emojis);
    panel.dataset.loaded = "1";
    if (!emojis.length) {
      panel.innerHTML = '<div class="better-comment-preview__emoji-panel-state">暂无可用表情</div>';
      return;
    }

    panel.innerHTML = `
      ${commonEmojis.length ? `
        <div class="better-comment-preview__emoji-section">
          <div class="better-comment-preview__emoji-section-title">常用</div>
          <div class="better-comment-preview__emoji-common-row">
            ${commonEmojis.map(renderEmojiOption).join("")}
          </div>
        </div>
      ` : ""}
      <div class="better-comment-preview__emoji-section">
        <div class="better-comment-preview__emoji-section-title">全部</div>
        <div class="better-comment-preview__emoji-grid">
          ${emojis.map(renderEmojiOption).join("")}
        </div>
      </div>
    `;
  }

  function closeReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel) {
      return;
    }

    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    const tools = form.querySelector(".better-comment-preview__reply-tools");
    if (tools && panel.parentElement !== tools) {
      tools.appendChild(panel);
    }
    if (activeReplyEmojiForm === form) {
      activeReplyEmojiForm = null;
    }
  }

  function closeOtherReplyEmojiPanels(activeForm = null) {
    document.querySelectorAll(`.${PREVIEW_CLASS} .better-comment-preview__reply-form`).forEach((form) => {
      if (form !== activeForm) {
        closeReplyEmojiPanel(form);
      }
    });
  }

  function getOpenReplyEmojiForm() {
    if (activeReplyEmojiForm?._betterReplyEmojiPanel && !activeReplyEmojiForm._betterReplyEmojiPanel.hidden) {
      return activeReplyEmojiForm;
    }
    return Array.from(document.querySelectorAll(`.${PREVIEW_CLASS} .better-comment-preview__reply-form`))
      .find((form) => form.querySelector(".better-comment-preview__emoji-panel:not([hidden])")) || null;
  }

  function positionReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel || panel.hidden) {
      return;
    }

    const buttonRect = toggle.getBoundingClientRect();
    const panelWidth = Math.min(280, Math.max(180, window.innerWidth - 48));
    const left = Math.min(
      Math.max(12, buttonRect.left),
      Math.max(12, window.innerWidth - panelWidth - 12)
    );
    const top = buttonRect.bottom + 8;
    const maxHeight = Math.max(96, Math.min(220, window.innerHeight - top - 12));

    panel.style.setProperty("--better-emoji-panel-left", `${left}px`);
    panel.style.setProperty("--better-emoji-panel-top", `${top}px`);
    panel.style.setProperty("--better-emoji-panel-max-height", `${maxHeight}px`);
  }

  function toggleReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel) {
      return;
    }

    form._betterReplyEmojiPanel = panel;
    const shouldOpen = panel.hidden;
    closeOtherReplyEmojiPanels(form);
    if (shouldOpen && panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }
    panel.hidden = !shouldOpen;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    activeReplyEmojiForm = shouldOpen ? form : null;
    positionReplyEmojiPanel(form);
    if (!shouldOpen) {
      return;
    }
    if (panel.dataset.loaded === "1") {
      renderReplyEmojiPanel(panel);
      positionReplyEmojiPanel(form);
      return;
    }

    panel.innerHTML = '<div class="better-comment-preview__emoji-panel-state">表情加载中</div>';
    loadEmojis().then(() => {
      renderReplyEmojiPanel(panel);
      positionReplyEmojiPanel(form);
    });
  }

  function saveReplyEditorSelection(form) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      form._betterReplyRange = range.cloneRange();
    }
  }

  function moveReplyEditorCaretToEnd(editor) {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function restoreReplyEditorSelection(form) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    if (form._betterReplyRange && editor.contains(form._betterReplyRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(form._betterReplyRange);
      return;
    }

    moveReplyEditorCaretToEnd(editor);
  }

  function serializeReplyEditorNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node;
    if (element.matches(".better-comment-preview__reply-input-emoji")) {
      return element.dataset.emojiText || element.getAttribute("alt") || "";
    }
    if (element.tagName === "BR") {
      return "\n";
    }

    const text = Array.from(element.childNodes).map(serializeReplyEditorNode).join("");
    return /^(DIV|P)$/i.test(element.tagName) ? `${text}\n` : text;
  }

  function serializeReplyEditor(editor) {
    return Array.from(editor?.childNodes || [])
      .map(serializeReplyEditorNode)
      .join("")
      .replace(/\u00a0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function insertEmojiIntoReplyForm(form, emojiText) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (!editor || !emojiText) {
      return;
    }

    const emoji = getEmojiByShortcode(emojiText);
    restoreReplyEditorSelection(form);

    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const insertedNode = emoji?.img
      ? document.createElement("img")
      : document.createTextNode(emojiText);
    if (insertedNode instanceof HTMLImageElement) {
      insertedNode.className = "better-comment-preview__reply-input-emoji";
      insertedNode.src = emoji.img;
      insertedNode.alt = emojiText;
      insertedNode.title = emojiText;
      insertedNode.dataset.emojiText = emojiText;
      insertedNode.contentEditable = "false";
      insertedNode.draggable = false;
    }

    range.insertNode(insertedNode);
    range.setStartAfter(insertedNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveReplyEditorSelection(form);
    recordEmojiUsage(emojiText);
  }

  function getReplyFormImages(form) {
    return Array.isArray(form._betterReplyImages) ? form._betterReplyImages : [];
  }

  function setReplyFormImages(form, images) {
    getReplyFormImages(form).forEach((image) => {
      if (!images.includes(image) && image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
    form._betterReplyImages = images;
    renderReplyFormImages(form);
  }

  function renderReplyFormImages(form) {
    const container = form.querySelector(".better-comment-preview__reply-attachments");
    if (!container) {
      return;
    }

    const images = getReplyFormImages(form);
    container.hidden = !images.length;
    container.innerHTML = images.map((image, index) => `
      <span class="better-comment-preview__reply-attachment">
        <img class="better-comment-preview__reply-attachment-image" src="${escapeHtml(image.previewUrl)}" alt="待上传图片 ${escapeHtml(index + 1)}">
        <button class="better-comment-preview__reply-attachment-remove" type="button" data-image-index="${escapeHtml(index)}" aria-label="移除图片" title="移除图片">×</button>
      </span>
    `).join("");
    scheduleRowHeightSync(form.closest(`.${ROW_CLASS}`));
  }

  function getImageFileSize(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const size = {
          width: image.naturalWidth || image.width || 0,
          height: image.naturalHeight || image.height || 0
        };
        URL.revokeObjectURL(url);
        resolve(size);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      image.src = url;
    });
  }

  function addReplyFormImageFiles(form, files) {
    const imageFiles = Array.from(files || []).filter((file) => file?.type?.startsWith("image/"));
    if (!imageFiles.length) {
      return;
    }

    const existingImages = getReplyFormImages(form);
    const availableCount = Math.max(0, COMMENT_REPLY_IMAGE_MAX_COUNT - existingImages.length);
    const nextFiles = imageFiles.slice(0, availableCount);
    if (!nextFiles.length) {
      setReplyFormStatus(form, `最多上传 ${COMMENT_REPLY_IMAGE_MAX_COUNT} 张图片`, true);
      return;
    }

    Promise.all(nextFiles.map(async (file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      ...(await getImageFileSize(file))
    }))).then((items) => {
      setReplyFormImages(form, existingImages.concat(items));
      setReplyFormStatus(form, imageFiles.length > availableCount ? `最多上传 ${COMMENT_REPLY_IMAGE_MAX_COUNT} 张图片` : "");
    });
  }

  function removeReplyFormImage(form, index) {
    const images = getReplyFormImages(form);
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);
    setReplyFormImages(form, nextImages);
    setReplyFormStatus(form, "");
  }

  function encodeCosComponent(value) {
    return encodeURIComponent(String(value))
      .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  function encodeCosPath(path) {
    return `/${String(path || "").replace(/^\/+/, "").split("/").map(encodeCosComponent).join("/")}`;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function sha1Hex(input) {
    return crypto.subtle.digest("SHA-1", new TextEncoder().encode(input))
      .then((buffer) => bytesToHex(new Uint8Array(buffer)));
  }

  function hmacSha1Hex(key, input) {
    return crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    ).then((cryptoKey) => crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(input)))
      .then((buffer) => bytesToHex(new Uint8Array(buffer)));
  }

  async function buildCosPutAuthorization({ key, host, credentials, startTime, expiredTime }) {
    const signTime = `${startTime};${expiredTime}`;
    const method = "put";
    const canonicalUri = encodeCosPath(key);
    const httpString = `${method}\n${canonicalUri}\n\nhost=${encodeCosComponent(host).toLowerCase()}\n`;
    const stringToSign = `sha1\n${signTime}\n${await sha1Hex(httpString)}\n`;
    const signKey = await hmacSha1Hex(credentials.tmpSecretKey, signTime);
    const signature = await hmacSha1Hex(signKey, stringToSign);

    return [
      "q-sign-algorithm=sha1",
      `q-ak=${credentials.tmpSecretId}`,
      `q-sign-time=${signTime}`,
      `q-key-time=${signTime}`,
      "q-header-list=host",
      "q-url-param-list=",
      `q-signature=${signature}`
    ].join("&");
  }

  function postCommentApiForm(url, body) {
    return fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams(body).toString()
    }).then((response) => response.json());
  }

  function requestCommentUploadInfo(images) {
    return postCommentApiForm(buildCommentUploadInfoApiUrl(), {
      file_infos: JSON.stringify(images.map((image) => ({
        name: image.file.name || "image.png",
        mimetype: image.file.type || "image/png",
        fsize: image.file.size || 0,
        width: image.width || 0,
        height: image.height || 0
      }))),
      scope: "bbs",
      need_cache: "0"
    });
  }

  function requestCommentUploadToken(bucket, keys, images) {
    return postCommentApiForm(buildCommentUploadTokenApiUrl(), {
      bucket,
      keys: JSON.stringify(keys),
      mimetypes: JSON.stringify(images.map((image) => image.file.type || "image/png")),
      is_multipart_upload: "0"
    });
  }

  function requestCommentUploadCallback(keys) {
    return postCommentApiForm(buildCommentUploadCallbackApiUrl(), {
      keys: JSON.stringify(keys)
    });
  }

  async function uploadCommentImageToCos(image, key, uploadInfo, tokenInfo) {
    const credentials = tokenInfo?.credentials;
    if (!credentials?.tmpSecretId || !credentials?.tmpSecretKey || !credentials?.sessionToken) {
      throw new Error("图片上传凭证无效");
    }

    const host = `${uploadInfo.bucket}.cos.${uploadInfo.region}.myqcloud.com`;
    const url = `https://${host}${encodeCosPath(key)}`;
    const authorization = await buildCosPutAuthorization({
      key,
      host,
      credentials,
      startTime: tokenInfo.startTime || Math.floor(Date.now() / 1000),
      expiredTime: tokenInfo.expiredTime || Math.floor(Date.now() / 1000) + 600
    });
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        authorization,
        "content-type": image.file.type || "application/octet-stream",
        "x-cos-security-token": credentials.sessionToken
      },
      body: image.file
    });
    if (!response.ok) {
      throw new Error("图片上传失败");
    }
  }

  async function uploadReplyFormImages(images) {
    if (!images.length) {
      return [];
    }

    const infoData = await requestCommentUploadInfo(images);
    const uploadInfo = infoData?.result;
    const keys = uploadInfo?.keys || [];
    if (infoData?.status !== "ok" || !uploadInfo?.bucket || !uploadInfo?.region || keys.length !== images.length) {
      throw new Error(infoData?.msg || "获取图片上传信息失败");
    }

    const tokenData = await requestCommentUploadToken(uploadInfo.bucket, keys, images);
    const tokenInfo = tokenData?.result;
    if (tokenData?.status !== "ok" || !tokenInfo?.credentials) {
      throw new Error(tokenData?.msg || "获取图片上传凭证失败");
    }

    await Promise.all(images.map((image, index) => uploadCommentImageToCos(image, keys[index], uploadInfo, tokenInfo)));

    const callbackData = await requestCommentUploadCallback(keys);
    const previewUrls = callbackData?.result?.preview_urls || callbackData?.result?.thumbs || [];
    if (callbackData?.status !== "ok" || previewUrls.length !== images.length) {
      throw new Error(callbackData?.msg || "图片上传回调失败");
    }
    return previewUrls;
  }

  async function submitPreviewReplyForm(preview, form) {
    const linkId = preview.dataset.linkId || "";
    const replyCommentId = form.dataset.commentId || "";
    const rootCommentId = form.dataset.rootCommentId || replyCommentId;
    const isPostComment = replyCommentId === POST_COMMENT_TARGET_ID;
    const submitReplyCommentId = isPostComment ? "-1" : replyCommentId;
    const submitRootCommentId = isPostComment ? "-1" : rootCommentId;
    const editor = form.querySelector(".better-comment-preview__reply-input");
    const text = serializeReplyEditor(editor);
    const images = getReplyFormImages(form);
    if (!linkId || !submitReplyCommentId || !submitRootCommentId) {
      setReplyFormStatus(form, "缺少评论目标", true);
      return;
    }
    if (!text && !images.length) {
      setReplyFormStatus(form, "先写点内容或上传图片吧", true);
      editor?.focus();
      return;
    }
    if (text.length > COMMENT_REPLY_TEXT_MAX_LENGTH) {
      setReplyFormStatus(form, `最多 ${COMMENT_REPLY_TEXT_MAX_LENGTH} 字`, true);
      editor?.focus();
      return;
    }

    setReplyFormSending(form, true);
    setReplyFormStatus(form, images.length ? "图片上传中" : "发送中");

    runAfterIdentityCookiesRestored(async () => {
      const imageUrls = await uploadReplyFormImages(images);
      setReplyFormStatus(form, "发送中");
      return postCommentApiForm(await buildCommentCreateApiUrl(), {
        is_cy: "0",
        link_id: linkId,
        reply_id: submitReplyCommentId,
        root_id: submitRootCommentId,
        text,
        ...(imageUrls.length ? { imgs: imageUrls.join(",") } : {})
      });
    }).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "发送失败");
      }

      if (isPostComment) {
        prependCreatedPostComment(linkId, data, text);
      } else {
        appendCreatedReplyComment(linkId, rootCommentId, replyCommentId, data, text);
      }
    }).catch((error) => {
      setReplyFormSending(form, false);
      setReplyFormStatus(form, error?.message || "发送失败", true);
      editor?.focus();
    });
  }

  function bindPreviewActions(preview) {
    if (preview.dataset.actionsBound === "1") {
      return;
    }

    preview.dataset.actionsBound = "1";
    ["keyup", "mouseup", "input", "focusin"].forEach((eventName) => {
      preview.addEventListener(eventName, (event) => {
        const editor = event.target instanceof Element
          ? event.target.closest(".better-comment-preview__reply-input")
          : null;
        const form = editor?.closest(".better-comment-preview__reply-form");
        if (editor && form && preview.contains(editor)) {
          saveReplyEditorSelection(form);
        }
      });
    });

    preview.addEventListener("submit", (event) => {
      const form = event.target instanceof Element
        ? event.target.closest(".better-comment-preview__reply-form")
        : null;
      if (!form || !preview.contains(form)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      submitPreviewReplyForm(preview, form);
    });

    preview.addEventListener("change", (event) => {
      const input = event.target instanceof Element
        ? event.target.closest(".better-comment-preview__reply-file-input")
        : null;
      const form = input?.closest(".better-comment-preview__reply-form");
      if (!input || !form || !preview.contains(input)) {
        return;
      }

      addReplyFormImageFiles(form, input.files);
      input.value = "";
    });

    preview.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const cancelButton = event.target.closest(".better-comment-preview__reply-cancel");
      if (cancelButton && preview.contains(cancelButton)) {
        event.preventDefault();
        event.stopPropagation();
        closePreviewReplyForm(preview);
        return;
      }

      const emojiToggle = event.target.closest(".better-comment-preview__emoji-toggle");
      if (emojiToggle && preview.contains(emojiToggle)) {
        const form = emojiToggle.closest(".better-comment-preview__reply-form");
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          toggleReplyEmojiPanel(form);
          return;
        }
      }

      const emojiOption = event.target.closest(".better-comment-preview__emoji-option");
      if (emojiOption && (preview.contains(emojiOption) || activeReplyEmojiForm)) {
        const form = emojiOption.closest(".better-comment-preview__reply-form") || getOpenReplyEmojiForm();
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          insertEmojiIntoReplyForm(form, emojiOption.dataset.emojiText || "");
          return;
        }
      }

      const imageUploadButton = event.target.closest(".better-comment-preview__image-upload");
      if (imageUploadButton && preview.contains(imageUploadButton)) {
        const form = imageUploadButton.closest(".better-comment-preview__reply-form");
        const input = form?.querySelector(".better-comment-preview__reply-file-input");
        if (input) {
          event.preventDefault();
          event.stopPropagation();
          input.click();
          return;
        }
      }

      const imageRemoveButton = event.target.closest(".better-comment-preview__reply-attachment-remove");
      if (imageRemoveButton && preview.contains(imageRemoveButton)) {
        const form = imageRemoveButton.closest(".better-comment-preview__reply-form");
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          removeReplyFormImage(form, Number.parseInt(imageRemoveButton.dataset.imageIndex, 10));
          return;
        }
      }

      const imageLink = event.target.closest(".better-comment-preview__image-link");
      if (imageLink && preview.contains(imageLink)) {
        event.preventDefault();
        event.stopPropagation();
        openCommentImageViewer(imageLink);
        return;
      }

      const cyToggle = event.target.closest(".better-comment-preview__cy-toggle");
      if (cyToggle && preview.contains(cyToggle)) {
        event.preventDefault();
        event.stopPropagation();
        setHideCyComments(!hideCyComments);
        return;
      }

      const sortButton = event.target.closest(".better-comment-preview__sort-option");
      if (sortButton && preview.contains(sortButton)) {
        event.preventDefault();
        event.stopPropagation();
        setCommentPreviewSort(sortButton.dataset.sort);
        return;
      }

      const reloadButton = event.target.closest(".better-comment-preview__reload");
      if (reloadButton && preview.contains(reloadButton)) {
        event.preventDefault();
        event.stopPropagation();
        reloadPreviewComments(preview);
        return;
      }

      const replyMoreButton = event.target.closest(".better-comment-preview__reply-more");
      if (replyMoreButton && preview.contains(replyMoreButton)) {
        event.preventDefault();
        event.stopPropagation();
        loadMoreReplyComments(preview, replyMoreButton.dataset.rootCommentId);
        return;
      }

      const expandButton = event.target.closest(".better-comment-preview__expand-button");
      if (expandButton && preview.contains(expandButton)) {
        event.preventDefault();
        event.stopPropagation();
        toggleCommentExpansion(expandButton.previousElementSibling);
        return;
      }

      const commentLink = event.target.closest(".better-comment-preview__text a, .better-comment-preview__reply-text a");
      if (commentLink && preview.contains(commentLink)) {
        const webHref = getHeyboxWebHref(commentLink.getAttribute("href") || "");
        if (webHref) {
          event.preventDefault();
          event.stopPropagation();
          window.location.href = webHref;
          return;
        }
      }

      const supportButton = event.target.closest(".better-comment-preview__up");
      if (supportButton && preview.contains(supportButton)) {
        event.preventDefault();
        event.stopPropagation();
        supportComment(supportButton.dataset.commentId, supportButton);
        return;
      }

      const postCommentButton = event.target.closest(".better-comment-preview__post-comment");
      if (postCommentButton && preview.contains(postCommentButton)) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, {
          commentId: POST_COMMENT_TARGET_ID,
          rootCommentId: POST_COMMENT_TARGET_ID,
          username: "帖子正文"
        });
        return;
      }

      const replyButton = event.target.closest(".better-comment-preview__reply-action");
      if (replyButton && preview.contains(replyButton)) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, getPreviewReplyTargetFromElement(replyButton));
        return;
      }

      const replyTarget = getPreviewReplyClickTarget(event, preview);
      if (replyTarget) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, replyTarget);
      }
    });

  }

  function loadMorePreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    const state = commentCache.get(linkId);
    if (!linkId || !state || state.loadingMore || !state.hasMore) {
      return;
    }

    state.loadingMore = true;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
    fetchCommentPage(linkId, (state.page || 1) + 1);
  }

  function reloadPreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    if (!linkId) {
      return;
    }

    const previousState = commentCache.get(linkId);
    const pending = {
      commentGroups: [],
      page: 0,
      hasMore: true,
      loadingMore: true,
      linkDetail: previousState?.linkDetail
    };
    commentCache.set(linkId, pending);
    renderLinkedPreviews(linkId);
    fetchCommentPage(linkId, 1);
  }

  function bindPreviewListScroll(preview) {
    const list = preview.querySelector(".better-comment-preview__list");
    if (!list) {
      return;
    }

    const loadMoreIfNearBottom = () => {
      const distanceToBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
      if (distanceToBottom <= 80) {
        loadMorePreviewComments(preview);
      }
    };

    list.addEventListener("scroll", loadMoreIfNearBottom);
    window.requestAnimationFrame(loadMoreIfNearBottom);
  }

  function loadPreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    if (!linkId) {
      return;
    }

    const state = commentCache.get(linkId);
    const hasCommentLoadState = Boolean(
      state
      && (Number(state.page) > 0 || state.loadingMore || state.failed)
    );
    if (hasCommentLoadState) {
      renderPreview(preview, state);
      return;
    }

    reloadPreviewComments(preview);
  }

  function observePreview(preview) {
    if (!previewObserver) {
      previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadPreviewComments(entry.target);
            previewObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: "300px"
      });
    }

    previewObserver.observe(preview);
  }

  function getLinkIdFromItem(item) {
    const href = item.getAttribute("href") || "";
    return href.match(/\/app\/bbs\/link\/(\d+)/)?.[1] || "";
  }

  function getCommentCountFromItem(item) {
    return item.querySelector(".content-list__comment-cnt")?.textContent?.trim() || "0";
  }

  function getFeedItemContentText(item) {
    return [
      item.querySelector(".bbs-content__title")?.textContent,
      item.querySelector(".bbs-content__content")?.textContent
    ].filter(Boolean).join("\n");
  }

  function getFeedItemTopicText(item) {
    return Array.from(item.querySelectorAll(".content-tag-text, .bbs-new-style-bottom__rich-stack .bbs-new-style-bottom__rich-node"))
      .map((tag) => tag.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getFeedItemAuthorText(item) {
    return item.querySelector(".header__user .list-content__username, .header__user .name, .list-content__username")?.textContent?.trim() || "";
  }

  function normalizeSummaryImageUrl(url) {
    try {
      const parsedUrl = new URL(url, window.location.href);
      return /^https?:$/.test(parsedUrl.protocol) ? parsedUrl.href : "";
    } catch {
      return "";
    }
  }

  function getFeedItemImageUrls(item) {
    const ignoredContainers = ".header__user, .list-content__avatar, .hb-cpt-avatar, .better-comment-preview__images";
    return Array.from(item.querySelectorAll("img"))
      .filter((image) => !image.closest(ignoredContainers))
      .map((image) => normalizeSummaryImageUrl(image.currentSrc || image.src || image.getAttribute("data-src") || ""))
      .filter(Boolean)
      .filter((url, index, urls) => urls.indexOf(url) === index);
  }

  function getLevelFromElement(container) {
    const levelElement = container?.querySelector?.(
      '.hb-level-tag[class*="hb-level-"], .level-tag__wrapper[class*="level-"], .list-content__level .hb-level-tag, .list-content__level .level-tag__wrapper, .hb-cpt__level-tag .level-tag__wrapper'
    );
    if (!levelElement) {
      return null;
    }

    const classLevel = Array.from(levelElement.classList || [])
      .map((className) => className.match(/(?:hb-)?level-(\d+)/)?.[1])
      .find(Boolean);
    return parseUserLevelValue(classLevel || levelElement.textContent);
  }

  function getFeedItemUserLevel(item) {
    return getLevelFromElement(item);
  }

  function createDefaultLevelTagElement() {
    const normalizedLevel = String(DEFAULT_USER_LEVEL);
    const tag = document.createElement("div");
    tag.className = `hb-level-tag hb-level-${normalizedLevel} list-content__level better-default-level-tag`;

    const inner = document.createElement("div");
    inner.className = "hb-level-tag__inner";

    const text = document.createElement("div");
    text.className = "hb-level-tag__inner__text";
    text.textContent = ` Lv.${normalizedLevel}`;
    inner.appendChild(text);
    tag.appendChild(inner);
    return tag;
  }

  function ensureDefaultUserLevelTag(userContainer) {
    if (!userContainer) {
      return;
    }

    const nativeLevelTag = userContainer.querySelector(".hb-cpt__level-tag:not(.better-default-level-tag), .hb-level-tag");
    if (nativeLevelTag) {
      userContainer.querySelectorAll(".better-default-level-tag").forEach((tag) => tag.remove());
      return;
    }

    if (userContainer.querySelector(".better-default-level-tag, .hb-cpt__level-tag, .hb-level-tag, .level-tag__wrapper")) {
      return;
    }

    const nameElement = userContainer.matches?.(".list-content__username, .name, .info-box__username, .children-item__comment-creator")
      ? userContainer
      : userContainer.querySelector(".list-content__username, .name, .info-box__username, .children-item__comment-creator");
    if (!nameElement) {
      return;
    }

    nameElement.insertAdjacentElement("afterend", createDefaultLevelTagElement());
  }

  function ensureFeedItemUserLevel(item) {
    ensureDefaultUserLevelTag(item?.querySelector?.(".header__user"));
  }

  function ensureLinkPageCommentUserLevels() {
    if (!isLinkPage()) {
      return;
    }

    document.querySelectorAll(".link-comment .better-default-level-tag").forEach((tag) => {
      tag.remove();
    });
  }

  function moveLinkPageEmptyStateIntoCommentPanel() {
    if (!isLinkPage()) {
      return;
    }

    const commentPanel = document.querySelector(".hb-bbs-link .link-comment");
    const emptyState = document.querySelector(".hb-bbs-link__container > .hb-cpt__empty");
    if (!commentPanel) {
      return;
    }

    if (emptyState) {
      commentPanel.appendChild(emptyState);
    }

    document.querySelectorAll(".hb-bbs-link .scroll-list__no-more-desc").forEach((noMoreDesc) => {
      noMoreDesc.remove();
    });
  }

  function getTopicTextFromContextTarget(target) {
    const tag = target?.closest?.(
      ".content-list__tag-item, .hb-cpt__content-tag, .content-tag-text, .hb-view-catalog__button, .bbs-new-style-bottom__rich-stack, .bbs-new-style-bottom__rich-node"
    );
    if (!tag) {
      return "";
    }

    const textNode = tag.querySelector?.(".content-tag-text, .bbs-new-style-bottom__rich-node") || tag;
    return normalizeBlockedKeyword(textNode.textContent);
  }

  function getFeedItemBlockedTargetKey(item, scope) {
    return `${normalizeBlockedKeywordScope(scope)}:${getLinkIdFromItem(item) || item.getAttribute("href") || getFeedItemContentText(item)}`;
  }

  function shouldHideFeedItem(item) {
    const feedText = [
      getFeedItemContentText(item),
      getFeedItemTopicText(item)
    ].filter(Boolean).join("\n");

    return isBlockedTextByKeyword(
      feedText,
      BLOCKED_KEYWORD_SCOPES.FEED,
      getFeedItemBlockedTargetKey(item, BLOCKED_KEYWORD_SCOPES.FEED)
    ) || shouldHideByLevel(getFeedItemUserLevel(item), BLOCKED_KEYWORD_SCOPES.FEED);
  }

  function getTopicEntryText(entry) {
    return normalizeBlockedKeyword(entry?.textContent);
  }

  function shouldHideTopicEntry(entry) {
    const topicText = getTopicEntryText(entry);
    if (!topicText) {
      return false;
    }

    return isBlockedTextByKeyword(
      topicText,
      BLOCKED_KEYWORD_SCOPES.FEED,
      `topic-entry:${topicText}`
    );
  }

  function applyFeedItemKeywordFilter(row, item) {
    if (!row || !item) {
      return;
    }

    const shouldHide = shouldHideFeedItem(item);
    row.hidden = shouldHide;
    row.style.display = shouldHide ? "none" : "";
  }

  function refreshTopicEntryFilters() {
    document.querySelectorAll(".hb-view-catalog__button").forEach((entry) => {
      const shouldHide = shouldHideTopicEntry(entry);
      entry.hidden = shouldHide;
      entry.style.display = shouldHide ? "none" : "";
    });
  }

  function ensureFeedItemPublishTime(item) {
    const legacyBottomRight = item.querySelector(".content-list__bottom--right");
    const bottomMainRow = item.querySelector(".bbs-new-style-bottom__main-row");
    const actions = bottomMainRow?.querySelector(".bbs-new-style-bottom__actions");
    const mount = legacyBottomRight || bottomMainRow;
    if (!mount) {
      return null;
    }

    let timeElement = mount.querySelector(".better-link-publish-time");
    if (!timeElement) {
      timeElement = document.createElement("span");
      timeElement.className = "better-link-publish-time";
      if (actions && actions.parentElement === mount) {
        mount.insertBefore(timeElement, actions);
      } else {
        mount.insertBefore(timeElement, mount.firstChild);
      }
    }

    return timeElement;
  }

  function setFeedItemPublishTime(item, timestamp) {
    const timeElement = ensureFeedItemPublishTime(item);
    if (!timeElement) {
      return;
    }

    timeElement.textContent = timestamp ? formatCommentTime(timestamp) : "";
    timeElement.hidden = !timestamp;
  }

  function updateFeedItemPublishTime(linkId, timestamp) {
    if (!timestamp) {
      return;
    }

    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      const item = getRowFeedItem(row);
      if (item && getLinkIdFromItem(item) === linkId) {
        setFeedItemPublishTime(item, timestamp);
      }
    });
  }

  function ensureAiSummaryButton(item) {
    const header = item.querySelector(".bbs-list-content__header");
    const operationButton = header?.querySelector(".list-cotent__operation-btn, .list-content__operation-btn");
    if (!header || !operationButton) {
      return;
    }

    header.classList.toggle("better-ai-summary-header", isAiFeatureEnabled());
    let button = header.querySelector(".better-ai-summary-button");
    if (!isAiFeatureEnabled()) {
      button?.remove();
      return;
    }

    if (!button) {
      button = document.createElement("button");
      button.className = "better-ai-summary-button";
      button.type = "button";
      button.title = "AI 总结";
      button.setAttribute("aria-label", "AI 总结");
      button.textContent = "AI";
      operationButton.insertAdjacentElement("beforebegin", button);
    }
    const linkId = getLinkIdFromItem(item);
    setAiButtonComplete(button, Boolean(linkId && aiSummaryCache.has(linkId)));
  }

  function syncAiSummaryButtons() {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach(ensureAiSummaryButton);
    ensureLinkPageAiSummaryButton();
  }

