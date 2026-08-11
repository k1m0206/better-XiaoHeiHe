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

  function ensureLinkPageFilterControls() {
    const mountPoint = document.querySelector('.link-comment .hb-cpt__pagination-inner');
    if (!mountPoint) {
      return null;
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
    return toolbar;
  }

  function restoreLinkPageRelatedContent() {
    const mountPoints = [...document.querySelectorAll(`#page-bbs-link .${RELATED_CONTENT_MOUNT_CLASS}`)];
    if (!mountPoints.length) {
      return;
    }

    const source = document.querySelector('#page-bbs-link .cpt-right-side .dynamic-content');
    if (source) {
      mountPoints.forEach((mountPoint) => {
        [...mountPoint.children].forEach((block) => source.appendChild(block));
        mountPoint.remove();
      });
    }
  }

  function ensureLinkPageRelatedTopicRow(mountPoint) {
    const topicContainer = mountPoint.querySelector(
      '.bbs-link__related-recommend.topic .related-recommend__container'
    );
    if (!topicContainer) {
      return;
    }

    let topicRow = topicContainer.querySelector(`.${RELATED_TOPIC_ROW_CLASS}`);
    if (!topicRow) {
      topicRow = document.createElement('div');
      topicRow.className = RELATED_TOPIC_ROW_CLASS;
      topicRow.setAttribute('role', 'list');
      topicContainer.append(topicRow);
    }

    [...topicContainer.children]
      .filter((child) => child.matches('.related-recommend__link-item--topic'))
      .forEach((topic) => topicRow.appendChild(topic));

    topicRow.querySelectorAll('.related-recommend__link-item--topic').forEach((topic) => {
      if (topic.dataset.betterTopicClickBound === 'true') {
        return;
      }

      const triggerTopicButton = () => topic.querySelector('.hot-topic__look')?.click();
      topic.dataset.betterTopicClickBound = 'true';
      topic.setAttribute('role', 'button');
      topic.tabIndex = 0;
      topic.addEventListener('click', (event) => {
        if (event.target.closest('.hot-topic__look')) {
          return;
        }
        triggerTopicButton();
      });
      topic.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        event.preventDefault();
        triggerTopicButton();
      });
    });
  }

  function hasLinkPageSimilarContent(block) {
    return Boolean(block?.querySelector('.related-recommend__link-item--content'));
  }

  function isStoredBooleanEnabled(value) {
    return value === true || value === '1' || value === 'true';
  }

  function syncSimilarContentDisabledState(savedState) {
    const isDisabled = isStoredBooleanEnabled(savedState);
    if (isDisabled === similarContentDisabled) {
      return;
    }

    similarContentDisabled = isDisabled;
    moveLinkPageRelatedContent();
    if (activeSettingsTab === SETTINGS_TABS.GENERAL) {
      renderSettingsPanel();
    }
  }

  function setSimilarContentDisabled(isDisabled) {
    syncSimilarContentDisabledState(isDisabled);
    saveLocalSettings({
      [SIMILAR_CONTENT_DISABLED_STORAGE_KEY]: isDisabled === true
    });
  }

  function syncRecommendedCommunitiesDisabledState(savedState) {
    const isDisabled = isStoredBooleanEnabled(savedState);
    if (isDisabled === recommendedCommunitiesDisabled) {
      return;
    }

    recommendedCommunitiesDisabled = isDisabled;
    moveLinkPageRelatedContent();
    if (activeSettingsTab === SETTINGS_TABS.GENERAL) {
      renderSettingsPanel();
    }
  }

  function setRecommendedCommunitiesDisabled(isDisabled) {
    syncRecommendedCommunitiesDisabledState(isDisabled);
    saveLocalSettings({
      [RECOMMENDED_COMMUNITIES_DISABLED_STORAGE_KEY]: isDisabled === true
    });
  }

  function ensureLinkPageRelatedCloseButton(block, type) {
    const header = block.querySelector('.related-recommend__container--header');
    if (!header) {
      return;
    }

    let closeButton = header.querySelector(`.${RELATED_CONTENT_CLOSE_CLASS}`);
    if (!closeButton) {
      closeButton = document.createElement('button');
      closeButton.className = RELATED_CONTENT_CLOSE_CLASS;
      closeButton.type = 'button';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (type === 'content') {
          setSimilarContentDisabled(true);
        } else {
          setRecommendedCommunitiesDisabled(true);
        }
      });
      header.appendChild(closeButton);
    }

    const label = type === 'content' ? '相似内容' : '为你推荐';
    closeButton.setAttribute('aria-label', `关闭${label}`);
    closeButton.setAttribute('title', `关闭${label}`);
  }

  function updateLinkPageRelatedContentVisibility(mountPoint, hasSimilarContent) {
    const contentBlock = mountPoint.querySelector('.bbs-link__related-recommend.content');
    const topicBlock = mountPoint.querySelector('.bbs-link__related-recommend.topic');
    if (contentBlock) {
      ensureLinkPageRelatedCloseButton(contentBlock, 'content');
      contentBlock.hidden = similarContentDisabled;
    }
    if (topicBlock) {
      ensureLinkPageRelatedCloseButton(topicBlock, 'topic');
      topicBlock.hidden = recommendedCommunitiesDisabled || !hasSimilarContent;
    }

    mountPoint.hidden = ![contentBlock, topicBlock].some((block) => block && !block.hidden);
  }

  function moveLinkPageRelatedContent() {
    if (!isLinkPage()) {
      return;
    }

    const source = document.querySelector('#page-bbs-link .cpt-right-side .dynamic-content');
    const postContent = document.querySelector('#page-bbs-link .hb-bbs-link__content');
    const existingMountPoint = document.querySelector(`#page-bbs-link .${RELATED_CONTENT_MOUNT_CLASS}`);
    if (!source || !postContent) {
      return;
    }

    const blocks = [...source.children].filter((child) => (
      child.matches('.bbs-link__related-recommend.content, .bbs-link__related-recommend.topic')
    ));
    const sourceContentBlock = blocks.find((block) => block.classList.contains('content'));
    const mountedContentBlock = existingMountPoint?.querySelector('.bbs-link__related-recommend.content');
    const hasSimilarContent = hasLinkPageSimilarContent(sourceContentBlock)
      || hasLinkPageSimilarContent(mountedContentBlock);
    if (!hasSimilarContent) {
      if (existingMountPoint) {
        existingMountPoint.hidden = true;
      }
      return;
    }

    const blocksToMove = blocks.filter((block) => {
      if (block.classList.contains('content')) {
        return !similarContentDisabled;
      }
      return !recommendedCommunitiesDisabled;
    });

    if (!blocksToMove.length && !existingMountPoint) {
      return;
    }

    let mountPoint = existingMountPoint;
    if (!mountPoint) {
      mountPoint = document.createElement('section');
      mountPoint.className = RELATED_CONTENT_MOUNT_CLASS;
      mountPoint.setAttribute('aria-label', '相关内容');
      postContent.insertAdjacentElement('afterend', mountPoint);
    }

    blocksToMove.forEach((block) => mountPoint.appendChild(block));
    if (mountPoint.querySelector('.bbs-link__related-recommend.topic')) {
      ensureLinkPageRelatedTopicRow(mountPoint);
    }
    updateLinkPageRelatedContentVisibility(mountPoint, hasSimilarContent);
  }

  function addFilterToBbsLink({ moveRelatedContent = true } = {}) {
    if (!isLinkPage()) {
      return;
    }

    if (moveRelatedContent) {
      moveLinkPageRelatedContent();
    }
    ensureLinkPageCommentUserLevels();
    moveLinkPageEmptyStateIntoCommentPanel();
    ensureLinkPageAiSummaryButton();

    if (!ensureLinkPageFilterControls()) {
      return;
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

