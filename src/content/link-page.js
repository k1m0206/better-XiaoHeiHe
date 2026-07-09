// 帖子详情页评论过滤、排序和详情页 AI 总结入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function filterLinkPageComments() {
    if (!isLinkPage()) {
      return 0;
    }

    let hiddenCount = 0;

    // Iterate over all top-level comment containers
    document.querySelectorAll('.link-comment__list .link-comment__comment-item').forEach(topLevelItem => {
      // Reset display style for the top-level item and all its replies before re-evaluating
      topLevelItem.style.display = '';
      topLevelItem.querySelectorAll('.comment-children-item').forEach(reply => {
        reply.style.display = '';
      });

      // Check the top-level comment itself
      const topLevelUsernameEl = topLevelItem.querySelector('.info-box__username');
      const topLevelContentEl = topLevelItem.querySelector('.comment-item__content');
      const topLevelUsername = topLevelUsernameEl?.textContent?.trim() || '';
      const topLevelContentText = topLevelContentEl?.textContent?.trim() || '';
      const topLevelUserLevel = getLevelFromElement(topLevelItem);
      
      // A comment is considered "CY" if its content has the 'cy' class or the username contains 'cy'
      const isTopLevelCy = topLevelContentEl?.classList.contains('cy') || topLevelUsername.toLowerCase().includes('cy');
      const isTopLevelBlocked = isBlockedByKeyword({ text: topLevelContentText, user: { username: topLevelUsername } });
      const isTopLevelBlockedByLevel = shouldHideByLevel(topLevelUserLevel, BLOCKED_KEYWORD_SCOPES.COMMENT);

      if ((hideCyComments && isTopLevelCy) || isTopLevelBlocked || isTopLevelBlockedByLevel) {
        topLevelItem.style.display = 'none';
        hiddenCount++; // Count the hidden top-level comment
      } else {
        // If top-level is not hidden, check its replies individually
        topLevelItem.querySelectorAll('.comment-children-item').forEach(replyItem => {
          const replyUsernameEl = replyItem.querySelector('.children-item__comment-creator');
          const replyContentEl = replyItem.querySelector('.children-item__comment-content');
          const replyUsername = replyUsernameEl?.textContent?.trim() || '';
          const replyContentText = replyContentEl?.textContent?.trim() || '';
          const replyUserLevel = getLevelFromElement(replyItem);

          const isReplyCy = replyContentEl?.classList.contains('cy') || replyUsername.toLowerCase().includes('cy');
          const isReplyBlocked = isBlockedByKeyword({ text: replyContentText, user: { username: replyUsername } });
          const isReplyBlockedByLevel = shouldHideByLevel(replyUserLevel, BLOCKED_KEYWORD_SCOPES.COMMENT);

          if ((hideCyComments && isReplyCy) || isReplyBlocked || isReplyBlockedByLevel) {
            replyItem.style.display = 'none';
            hiddenCount++; // Count each hidden reply
          }
        });
      }
    });

    return hiddenCount;
  }

  function getLinkPageCommentOriginalIndex(item) {
    if (!item.dataset.betterOriginalIndex) {
      const siblings = Array.from(item.parentElement?.querySelectorAll('.link-comment__comment-item') || []);
      item.dataset.betterOriginalIndex = String(Math.max(0, siblings.indexOf(item)));
    }
    return Number.parseInt(item.dataset.betterOriginalIndex, 10) || 0;
  }

  function getLinkPageCommentUpCount(item) {
    const text = item.querySelector('.comment-item__like, .comment-item__support, .comment-item__action-like, .heybox-thumbs-up')?.parentElement?.textContent
      || item.querySelector('[class*="like"], [class*="support"]')?.textContent
      || '';
    const match = text.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) || 0 : 0;
  }

  function normalizeLinkPageCommentTimestamp(value) {
    const text = String(value || '').trim();
    if (!text) {
      return 0;
    }

    const numericValue = Number(text);
    if (Number.isFinite(numericValue) && numericValue > 0) {
      return numericValue > 100000000000 ? numericValue : numericValue * 1000;
    }

    const parsedValue = Date.parse(text.replace(/\//g, '-'));
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  function getLinkPageCommentExactTime(timeElement) {
    if (!timeElement) {
      return 0;
    }

    const candidates = [
      timeElement.getAttribute('datetime'),
      timeElement.getAttribute('data-time'),
      timeElement.getAttribute('data-timestamp'),
      timeElement.getAttribute('data-create-at'),
      timeElement.getAttribute('data-created-at'),
      timeElement.getAttribute('title')
    ];
    for (const candidate of candidates) {
      const timestamp = normalizeLinkPageCommentTimestamp(candidate);
      if (timestamp) {
        return timestamp;
      }
    }
    return 0;
  }

  function getLinkPageCommentCreateTime(item, sortNow = Date.now()) {
    const cachedTime = linkPageCommentTimeCache.get(item);
    if (Number.isFinite(cachedTime)) {
      return cachedTime;
    }

    const timeElement = item.querySelector('.info-box__time, .comment-item__time, time, [class*="time"]');
    const exactTime = getLinkPageCommentExactTime(timeElement);
    if (exactTime) {
      linkPageCommentTimeCache.set(item, exactTime);
      return exactTime;
    }

    const text = timeElement?.textContent?.trim() || '';
    const dateTimeMatch = text.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})(?:日)?(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    let timestamp = 0;
    if (dateTimeMatch) {
      timestamp = new Date(
        Number(dateTimeMatch[1]),
        Number(dateTimeMatch[2]) - 1,
        Number(dateTimeMatch[3]),
        Number(dateTimeMatch[4] || 0),
        Number(dateTimeMatch[5] || 0),
        Number(dateTimeMatch[6] || 0)
      ).getTime() || 0;
    } else if (/\d+\s*分钟前/.test(text)) {
      timestamp = sortNow - (Number.parseInt(text, 10) || 0) * 60 * 1000;
    } else if (/\d+\s*小时前/.test(text)) {
      timestamp = sortNow - (Number.parseInt(text, 10) || 0) * 60 * 60 * 1000;
    } else if (/\d+\s*天前/.test(text)) {
      timestamp = sortNow - (Number.parseInt(text, 10) || 0) * 24 * 60 * 60 * 1000;
    }

    if (timestamp) {
      linkPageCommentTimeCache.set(item, timestamp);
    }
    return timestamp;
  }

  function isLinkPageOwnerComment(item) {
    return Boolean(item.querySelector('.better-comment-preview__owner'))
      || /作者/.test(item.querySelector('.info-box__username')?.parentElement?.textContent || '');
  }

  function compareLinkPageCommentItems(left, right, sortNow) {
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.HOT) {
      const hotDiff = getLinkPageCommentUpCount(right) - getLinkPageCommentUpCount(left);
      return hotDiff || getLinkPageCommentOriginalIndex(left) - getLinkPageCommentOriginalIndex(right);
    }
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.NEWEST) {
      const timeDiff = getLinkPageCommentCreateTime(right, sortNow) - getLinkPageCommentCreateTime(left, sortNow);
      return timeDiff || getLinkPageCommentOriginalIndex(left) - getLinkPageCommentOriginalIndex(right);
    }
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.AUTHOR) {
      const ownerDiff = Number(isLinkPageOwnerComment(right)) - Number(isLinkPageOwnerComment(left));
      return ownerDiff || getLinkPageCommentOriginalIndex(left) - getLinkPageCommentOriginalIndex(right);
    }
    return getLinkPageCommentOriginalIndex(left) - getLinkPageCommentOriginalIndex(right);
  }

  function sortLinkPageComments() {
    const items = Array.from(document.querySelectorAll('.link-comment__list > .link-comment__comment-item'));
    items.forEach(getLinkPageCommentOriginalIndex);

    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.DEFAULT) {
      items.forEach((item) => {
        if (item.style.order) {
          item.style.order = '';
        }
      });
      return;
    }

    const sortNow = Date.now();
    [...items].sort((left, right) => compareLinkPageCommentItems(left, right, sortNow)).forEach((item, index) => {
      const nextOrder = String(index + 1);
      if (item.style.order !== nextOrder) {
        item.style.order = nextOrder;
      }
    });
  }

  function updateLinkPageFilterControls() {
    if (!isLinkPage()) {
      return;
    }

    const toggleButton = document.querySelector('.link-comment .better-comment-preview__cy-toggle');
    if (!toggleButton) {
      return;
    }

    toggleButton.setAttribute('aria-pressed', hideCyComments ? 'true' : 'false');
    toggleButton.setAttribute('title', hideCyComments ? '显示插眼及屏蔽评论' : '隐藏插眼及屏蔽评论');

    sortLinkPageComments();
    syncCommentSortControls();
    const hiddenCount = filterLinkPageComments();

    const countSpan = document.querySelector('.link-comment .better-comment-preview__filtered-count');
    if (countSpan) {
      countSpan.textContent = hiddenCount > 0 ? `${hiddenCount}` : '';
      countSpan.title = `已屏蔽 ${hiddenCount} 条评论`;
    }
  }

  function getLinkPageAiSummaryButton() {
    return document.querySelector(".hb-bbs-link__header .better-link-page-ai-summary");
  }

  function ensureLinkPageAiSummaryButton() {
    document.querySelectorAll(".link-comment .better-link-page-ai-summary").forEach((button) => {
      button.remove();
    });

    const mountPoint = document.querySelector(".hb-bbs-link__header .page-header__container");
    let button = getLinkPageAiSummaryButton();
    if (!isAiFeatureEnabled()) {
      button?.remove();
      return;
    }
    if (!mountPoint) {
      return;
    }

    if (!button) {
      button = document.createElement("button");
      button.className = "better-ai-summary-button better-link-page-ai-summary";
      button.type = "button";
      button.title = "AI 总结";
      button.setAttribute("aria-label", "AI 总结");
      button.textContent = "AI";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        summarizeLinkPage(button);
      });
    }

    if (button.parentElement !== mountPoint) {
      mountPoint.appendChild(button);
    }
    const linkId = getCurrentLinkId();
    setAiButtonComplete(button, Boolean(linkId && aiSummaryCache.has(linkId)));
  }

  function addFilterToBbsLink() {
    if (!isLinkPage()) {
      return;
    }

    ensureLinkPageCommentUserLevels();
    moveLinkPageEmptyStateIntoCommentPanel();
    ensureLinkPageAiSummaryButton();

    const mountPoint = document.querySelector('.link-comment .hb-cpt__pagination-inner');
    if (!mountPoint) {
      return;
    }

    if (!mountPoint.querySelector('.better-comment-preview__toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'better-comment-preview__toolbar';

      const sortWrapper = document.createElement('div');
      sortWrapper.innerHTML = renderCommentSortControls();
      const sortControls = sortWrapper.firstElementChild;

      const toggleButton = document.createElement('button');
      toggleButton.className = 'better-comment-preview__cy-toggle';
      toggleButton.type = 'button';

      const switchSpan = document.createElement('span');
      switchSpan.className = 'better-comment-preview__cy-toggle-switch';
      switchSpan.setAttribute('aria-hidden', 'true');

      const labelSpan = document.createElement('span');
      labelSpan.textContent = '屏蔽CY';

      const countSpan = document.createElement('span');
      countSpan.className = 'better-comment-preview__filtered-count';

      toggleButton.append(switchSpan, labelSpan);
      toolbar.append(sortControls, toggleButton, countSpan);

      toggleButton.addEventListener('click', () => {
        setHideCyComments(!hideCyComments);
      });

      mountPoint.append(toolbar);
    }

    const toolbar = mountPoint.querySelector('.better-comment-preview__toolbar');
    if (toolbar && !toolbar.querySelector('.better-comment-preview__sort-group')) {
      const sortWrapper = document.createElement('div');
      sortWrapper.innerHTML = renderCommentSortControls();
      toolbar.insertAdjacentElement('afterbegin', sortWrapper.firstElementChild);
    }
    if (toolbar) {
      bindLinkPageSortControls(toolbar);
    }

    updateLinkPageFilterControls();
  }

  function refreshAllCommentFilters() {
    renderAllPreviews();
    updateLinkPageFilterControls();
  }

  function refreshAllKeywordFilters() {
    refreshFeedItemFilters();
    refreshAllCommentFilters();
  }

  function scheduleKeywordFiltersRefresh() {
    refreshAllKeywordFilters();
    window.requestAnimationFrame(refreshAllKeywordFilters);
    window.setTimeout(refreshAllKeywordFilters, 120);
  }

