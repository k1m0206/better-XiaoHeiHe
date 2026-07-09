// AI Bot 数据提取、上下文归一化和评论查找。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function getCookie(name) {
    return new Promise((resolve) => {
      if (!chrome.cookies?.get) {
        resolve("");
        return;
      }

      chrome.cookies.get({ url: "https://www.xiaoheihe.cn/", name }, (cookie) => {
        resolve(cookie?.value || "");
      });
    });
  }

  async function getCurrentHeyboxId() {
    return await getCookie("heybox_id") || await getCookie("user_heybox_id");
  }

  function getUserId(user) {
    return String(user?.heybox_id || user?.user_heybox_id || user?.userid || user?.user_id || user?.uid || user?.id || "").trim();
  }

  function getUserDisplayName(user) {
    return String(user?.username || user?.nickname || user?.name || "").trim();
  }

  function stripHtml(value) {
    return String(value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#039;/g, "'")
      .replace(/\[cube_([^\]]+)\]/g, "[$1]")
      .trim();
  }

  function uniqueStrings(values) {
    return [...new Set((values || []).map((value) => String(value || "").trim()).filter(Boolean))];
  }

  function getImageUrlsFromHtml(value) {
    const urls = [];
    String(value || "").replace(/<img\b[^>]*\b(?:data-original|src)=["']([^"']+)["'][^>]*>/gi, (_match, url) => {
      urls.push(url);
      return _match;
    });
    return urls;
  }

  function getImageUrlsFromRichText(value) {
    if (!value) {
      return [];
    }

    const urls = getImageUrlsFromHtml(value);
    try {
      const parts = JSON.parse(value);
      const visit = (part) => {
        if (Array.isArray(part)) {
          part.forEach(visit);
          return;
        }
        if (!part || typeof part !== "object") {
          return;
        }
        if ((part.type === "img" || part.type === "image") && (part.url || part.image || part.src)) {
          urls.push(part.url || part.image || part.src);
        }
        Object.values(part).forEach(visit);
      };
      visit(parts);
    } catch {
      // Plain HTML/text has already been handled above.
    }
    return urls;
  }

  function getLinkImageUrls(link = {}) {
    const listImageUrls = Array.isArray(link.imgs) && link.imgs.length
      ? link.imgs
      : (Array.isArray(link.thumbs) ? link.thumbs : []);
    return uniqueStrings([
      ...listImageUrls,
      ...getImageUrlsFromRichText(link.text)
    ]).filter((url) => /^https?:\/\//i.test(url));
  }

  function getCommentId(comment) {
    return comment?.comment_id || comment?.commentid || comment?.commentId || comment?.id || comment?.cid || "";
  }

  function getCommentUpCount(comment) {
    const values = [
      comment?.up,
      comment?.up_num,
      comment?.up_count,
      comment?.support_num,
      comment?.support_count,
      comment?.like_num,
      comment?.like_count
    ];
    const value = values.find((item) => Number.isFinite(Number(item)));
    return Number(value) || 0;
  }

  function getLinkIdFromMessage(message) {
    return String(
      message?.link?.linkid
      || message?.link?.link_id
      || message?.linkid
      || message?.link_id
      || message?.target?.linkid
      || ""
    ).trim();
  }

  function getLinkIdFromFeedItem(link) {
    return String(link?.linkid || link?.link_id || link?.id || "").trim();
  }

  function getFeedItemDetail(link = {}) {
    return {
      title: String(link.title || "").trim(),
      authorId: getUserId(link.user || {}),
      author: String(link.user?.username || link.user?.nickname || "").trim(),
      content: stripHtml(link.text || link.description || ""),
      imageUrls: getLinkImageUrls(link),
      topic: [
        ...(Array.isArray(link.topics) ? link.topics.map((topic) => typeof topic === "string" ? topic : (topic?.name || topic?.text)) : []),
        ...(Array.isArray(link.tags) ? link.tags.map((tag) => typeof tag === "string" ? tag : (tag?.text || tag?.name)) : []),
        ...(Array.isArray(link.hashtags) ? link.hashtags.map((tag) => typeof tag === "string" ? tag : (tag?.text || tag?.name)) : [])
      ].filter(Boolean).join("\n"),
      commentNum: Number(link.comment_num || link.comment_count || 0) || 0,
      up: Number(link.up || link.up_num || 0) || 0
    };
  }

  function getFeedItemUrl(link) {
    const linkId = getLinkIdFromFeedItem(link);
    return linkId ? `https://www.xiaoheihe.cn/app/bbs/link/${linkId}` : "";
  }

  function getLinkUrl(linkId) {
    return linkId ? `https://www.xiaoheihe.cn/app/bbs/link/${linkId}` : "";
  }

  function getAiBotReplyTargetId(user) {
    const userId = getUserId(user || {});
    if (userId) {
      return `id:${userId}`;
    }
    const userName = getUserDisplayName(user || {});
    return userName ? `name:${userName}` : "";
  }

  function getAiBotReplyTargetRecordKey(linkId, targetId) {
    return linkId && targetId ? `${String(linkId)}::${String(targetId)}` : "";
  }

  function getAiBotReplyCommentRecordKey(linkId, replyCommentId) {
    return linkId && replyCommentId ? `${String(linkId)}::${String(replyCommentId)}` : "";
  }

  function getFeedItemTimestampMs(link) {
    const rawTimestamp = Number(
      link?.create_at
      || link?.created_at
      || link?.post_time
      || link?.publish_at
      || link?.time
      || 0
    );
    if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0) {
      return 0;
    }
    return rawTimestamp > 100000000000 ? rawTimestamp : Math.floor(rawTimestamp * 1000);
  }

  function selectFeedItemByStrategy(links, strategy) {
    const validLinks = links.filter((link) => getLinkIdFromFeedItem(link));
    if (validLinks.length === 0) {
      return null;
    }
    if (strategy === "latest") {
      return validLinks.reduce((latest, current) => {
        const latestTime = getFeedItemTimestampMs(latest);
        const currentTime = getFeedItemTimestampMs(current);
        return currentTime > latestTime ? current : latest;
      }, validLinks[0]);
    }
    if (strategy === "hot") {
      return validLinks.reduce((hot, current) => {
        const hotScore = Number(hot.comment_num || hot.comment_count || 0) + Number(hot.up || hot.up_num || 0);
        const currentScore = Number(current.comment_num || current.comment_count || 0) + Number(current.up || current.up_num || 0);
        return currentScore > hotScore ? current : hot;
      }, validLinks[0]);
    }
    return validLinks[0];
  }

  function findFirstFieldDeep(source, names, seen = new Set()) {
    if (!source || typeof source !== "object" || seen.has(source)) {
      return "";
    }
    seen.add(source);

    for (const name of names) {
      if (source[name] !== undefined && source[name] !== null && source[name] !== "") {
        return source[name];
      }
    }

    for (const value of Object.values(source)) {
      if (value && typeof value === "object") {
        const found = findFirstFieldDeep(value, names, seen);
        if (found !== "") {
          return found;
        }
      }
    }
    return "";
  }

  function getReplyCommentIdFromMessage(message) {
    return String(findFirstFieldDeep(message, [
      "comment_id",
      "commentid",
      "commentId",
      "comment_a_id",
      "replyid",
      "reply_id",
      "cid"
    ]) || "").trim();
  }

  function getRootCommentIdFromMessage(message) {
    return String(findFirstFieldDeep(message, [
      "root_id",
      "root_comment_id",
      "rootCommentId",
      "root_commentid"
    ]) || "").trim();
  }

  function normalizeCommentGroups(data) {
    const rawComments = data?.result?.comments || data?.result?.comment || data?.comments || [];
    return (Array.isArray(rawComments) ? rawComments : [])
      .map((item) => {
        if (item?.root || item?.comment) {
          const rootSource = item.root || item.comment;
          const root = Array.isArray(rootSource) ? rootSource[0] : rootSource;
          const replies = item.replies || item.children || item.sub_comments || item.subComments || [];
          return {
            root,
            replies: Array.isArray(replies) ? replies : []
          };
        }

        return {
          root: item,
          replies: Array.isArray(item?.replies || item?.children) ? (item.replies || item.children) : []
        };
      })
      .filter((group) => group.root);
  }

  function getLinkDetail(data) {
    const link = data?.result?.link || {};
    return {
      title: String(link.title || "").trim(),
      authorId: getUserId(link.user || {}),
      author: String(link.user?.username || link.user?.nickname || "").trim(),
      content: stripHtml(link.text || link.description || ""),
      imageUrls: getLinkImageUrls(link),
      topic: [
        ...(Array.isArray(link.topics) ? link.topics.map((topic) => topic?.name) : []),
        ...(Array.isArray(link.tags) ? link.tags.map((tag) => tag?.text || tag?.name) : []),
        ...(Array.isArray(link.hashtags) ? link.hashtags.map((tag) => tag?.text || tag?.name) : [])
      ].filter(Boolean).join("\n")
    };
  }

  function getCommentLine(comment) {
    const userName = comment?.user?.username || comment?.user?.nickname || "匿名用户";
    const text = stripHtml(comment?.text || comment?.content || "");
    return text ? `${userName}：${text}` : "";
  }

  function getAiBotCommentLines(groups) {
    let order = 0;
    const entries = (groups || []).flatMap((group) => {
      return [group.root, ...(group.replies || [])].filter(Boolean).map((comment) => {
        order += 1;
        return {
          line: getCommentLine(comment),
          up: getCommentUpCount(comment),
          order
        };
      });
    }).filter((entry) => entry.line);

    const selected = entries.length > AI_BOT_COMMENT_LIMIT
      ? entries.slice().sort((left, right) => (right.up - left.up) || (left.order - right.order)).slice(0, AI_BOT_COMMENT_LIMIT)
      : entries;
    return selected.slice().sort((left, right) => left.order - right.order).map((entry) => entry.line);
  }

  function findCommentById(groups, commentId) {
    const normalizedId = String(commentId || "");
    for (const group of groups || []) {
      const comments = [group.root, ...(group.replies || [])].filter(Boolean);
      const comment = comments.find((item) => String(getCommentId(item)) === normalizedId);
      if (comment) {
        return comment;
      }
    }
    return null;
  }

