// 评论页数据读取和帖子详情缓存。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function fetchCommentPageData(linkId, page, options = {}) {
    return Promise.all([
      loadEmojis(),
      (options.identityOnly ? fetchCommentApiJsonWithIdentity : fetchCommentApiJson)(
        (requestOptions) => buildCommentApiUrl(linkId, page, requestOptions)
      )
    ]).then(([, data]) => {
      if (data?.status === "ok") {
        cacheLinkDetailFromApiData(linkId, data);
      }
      return data;
    });
  }

  function getPlainTextFromHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    const blockTexts = Array.from(template.content.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote"))
      .map((node) => node.textContent?.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const text = blockTexts.length ? blockTexts.join("\n") : template.content.textContent;
    return String(text || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  }

  function getImageUrlsFromHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    return Array.from(template.content.querySelectorAll("img"))
      .map((image) => image.getAttribute("data-original") || image.getAttribute("src") || "")
      .filter(Boolean);
  }

  function uniqueStrings(values) {
    return Array.from(new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean)));
  }

  function parseLinkRichText(rawText) {
    const result = { content: "", imageUrls: [] };
    if (!rawText) {
      return result;
    }

    try {
      const parts = JSON.parse(rawText);
      if (Array.isArray(parts)) {
        const textParts = [];
        const imageUrls = [];
        parts.forEach((part) => {
          if (!part || typeof part !== "object") {
            return;
          }

          if (part.type === "html" && part.text) {
            textParts.push(getPlainTextFromHtml(part.text));
            imageUrls.push(...getImageUrlsFromHtml(part.text));
          } else if (part.type === "text" && part.text) {
            textParts.push(String(part.text).trim());
          } else if (part.type === "img" && part.url) {
            imageUrls.push(part.url);
          }
        });
        result.content = textParts.filter(Boolean).join("\n");
        result.imageUrls = uniqueStrings(imageUrls);
        return result;
      }
    } catch {
      // Fall back to treating the field as plain HTML/text.
    }

    result.content = getPlainTextFromHtml(rawText) || String(rawText).trim();
    result.imageUrls = getImageUrlsFromHtml(rawText);
    return result;
  }

  function getLinkDetailFromApiLink(link) {
    if (!link || typeof link !== "object") {
      return null;
    }

    const richText = parseLinkRichText(link.text);
    const feedImageUrls = uniqueStrings(Array.isArray(link.imgs) ? link.imgs : []);
    const feedThumbnailUrls = uniqueStrings(Array.isArray(link.thumbs) ? link.thumbs : []);
    return {
      title: String(link.title || "").trim(),
      author: String(link.user?.username || link.user?.nickname || "").trim(),
      content: richText.content || String(link.description || "").trim(),
      imageUrls: uniqueStrings([...richText.imageUrls, ...feedImageUrls]),
      feedImageUrls,
      feedThumbnailUrls,
      topic: uniqueStrings([
        ...(Array.isArray(link.topics) ? link.topics.map((topic) => topic?.name) : []),
        ...(Array.isArray(link.tags) ? link.tags.map((tag) => tag?.text || tag?.name) : []),
        ...(Array.isArray(link.hashtags) ? link.hashtags.map((tag) => tag?.text || tag?.name) : [])
      ]).join("\n")
    };
  }

  function cacheLinkDetailFromApiData(linkId, data) {
    const detail = getLinkDetailFromApiLink(data?.result?.link);
    if (!detail) {
      return null;
    }

    const state = commentCache.get(linkId) || { commentGroups: [] };
    const previousDetail = state.linkDetail || {};
    state.linkDetail = {
      ...previousDetail,
      ...detail,
      content: detail.content || previousDetail.content || "",
      imageUrls: uniqueStrings([...(previousDetail.imageUrls || []), ...detail.imageUrls]),
      feedImageUrls: detail.feedImageUrls.length ? detail.feedImageUrls : (previousDetail.feedImageUrls || []),
      feedThumbnailUrls: detail.feedThumbnailUrls.length ? detail.feedThumbnailUrls : (previousDetail.feedThumbnailUrls || [])
    };
    commentCache.set(linkId, state);
    updateFeedItemFallbackImages(linkId, state.linkDetail);
    return state.linkDetail;
  }

  function cacheCommentPageFromApiData(linkId, page, data, options = {}) {
    if (data?.status !== "ok") {
      return commentCache.get(linkId);
    }

    const state = commentCache.get(linkId) || { commentGroups: [] };
    if (options.onlyIfEmpty && state.commentGroups?.length) {
      return state;
    }

    const pageGroups = normalizeCommentGroups(data);
    const originalIndexOffset = page === 1 ? 0 : (state.commentGroups?.length || 0);
    pageGroups.forEach((group, index) => {
      group.originalIndex = originalIndexOffset + index;
    });
    state.commentGroups = page === 1 ? pageGroups : (state.commentGroups || []).concat(pageGroups);
    state.commentCount = data.result?.link?.comment_num || data.result?.total_floor_num || state.commentCount;
    state.linkCreateAt = getLinkCreateTime(data.result?.link) || state.linkCreateAt;
    state.page = Math.max(Number(state.page) || 0, page);
    state.failed = false;
    state.loadMoreFailed = false;
    state.loadingMore = false;
    state.hasMore = pageGroups.length >= COMMENT_PAGE_LIMIT;
    commentCache.set(linkId, state);
    return state;
  }

  function delay(ms) {
