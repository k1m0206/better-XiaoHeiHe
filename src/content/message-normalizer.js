// 消息入口数据提取和消息列表归一化。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function stripMessageHtml(value) {
    const text = String(value || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/gi, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    return text.replace(/\s+/g, " ").trim();
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

  function getReplyMessageLinkId(message) {
    return String(findFirstFieldDeep(message, [
      "linkid",
      "link_id",
      "linkId"
    ]) || "").trim();
  }

  function getReplyMessageUserName(message) {
    return String(message?.user_a?.username || findFirstFieldDeep(message, [
      "username",
      "user_name",
      "nickname",
      "nick_name",
      "name"
    ]) || "盒友").trim();
  }

  function getReplyMessageAvatar(message) {
    return String(
      message?.user_a?.avatar
      || message?.user_a?.avartar
      || findFirstFieldDeep(message, ["avatar", "avartar", "avatar_url", "avatarUrl"])
      || ""
    ).trim();
  }

  function getReplyMessageTitle(message) {
    return stripMessageHtml(message?.link_title || findFirstFieldDeep(message, [
      "title",
      "link_title",
      "linkTitle",
      "target_title",
      "targetTitle"
    ])) || "查看相关帖子";
  }

  function getReplyMessageLinkDescription(message) {
    return stripMessageHtml(message?.link_desc || message?.link_text || message?.link_content || "");
  }

  function getReplyMessageContent(message) {
    const content = stripMessageHtml(message?.comment_a_text || findFirstFieldDeep(message, [
      "comment_a_text",
      "content",
      "text",
      "comment",
      "comment_text",
      "reply_content",
      "replyContent",
      "message",
      "msg"
    ]));
    if (content) {
      return content;
    }
    return "对你的内容进行了回复";
  }

  function getReplyMessageTargetContent(message) {
    const type = String(message?.message_type || message?.type || "");
    if (type !== "1" && !message?.comment_b_text && !message?.comment_b_id) {
      return "";
    }
    return stripMessageHtml(message?.comment_b_text || message?.reply_to_text || message?.target_comment_text || "");
  }

  function getReplyMessageTopicName(message) {
    const topic = Array.isArray(message?.topics) ? message.topics[0] : message?.topic;
    return String(message?.topic_name || topic?.name || "").trim();
  }

  function getReplyMessageTopicIcon(message) {
    const topic = Array.isArray(message?.topics) ? message.topics[0] : message?.topic;
    return String(
      message?.topic_icon
      || message?.topic_pic_url
      || message?.topic_img
      || topic?.pic_url
      || topic?.icon
      || topic?.img
      || topic?.avatar
      || ""
    ).trim();
  }

  function normalizeMessageImageList(value) {
    if (Array.isArray(value)) {
      return value.flatMap(normalizeMessageImageList);
    }
    if (value && typeof value === "object") {
      return normalizeMessageImageList(value.url || value.src || value.img || value.image || value.origin || "");
    }
    return String(value || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  function getReplyMessageLinkImages(message) {
    return uniqueStrings([
      ...normalizeMessageImageList(message?.link_img),
      ...normalizeMessageImageList(message?.link_imgs),
      ...normalizeMessageImageList(message?.link_images),
      ...normalizeMessageImageList(message?.imgs),
      ...normalizeMessageImageList(message?.images),
      ...normalizeMessageImageList(message?.image)
    ]);
  }

  function getReplyMessageCommentImages(message) {
    return uniqueStrings([
      ...normalizeMessageImageList(message?.comment_img),
      ...normalizeMessageImageList(message?.comment_imgs),
      ...normalizeMessageImageList(message?.comment_images)
    ]);
  }

  function getReplyMessageLinkAuthor(message) {
    const author = message?.link_user && typeof message.link_user === "object"
      ? message.link_user
      : message?.link?.user || message?.link?.author || {};
    return String(
      (typeof message?.link_user === "string" ? message.link_user : "")
      || message?.link_author
      || message?.author
      || author?.username
      || author?.user_name
      || author?.nickname
      || author?.name
      || ""
    ).trim();
  }

  function getReplyMessageLinkAuthorAvatar(message) {
    const author = message?.link_user && typeof message.link_user === "object"
      ? message.link_user
      : message?.link?.user || message?.link?.author || {};
    return String(
      message?.link_user_avatar
      || message?.author_avatar
      || author?.avatar
      || author?.avartar
      || author?.avatar_url
      || author?.avatarUrl
      || ""
    ).trim();
  }

  function getReplyMessageLinkAuthorLevel(message) {
    const author = message?.link_user && typeof message.link_user === "object"
      ? message.link_user
      : message?.link?.user || message?.link?.author || {};
    const level = normalizeUserLevel(
      message?.link_user_level
      || message?.author_level
      || author?.level_info?.level
      || author?.level
      || author?.user_level
      || ""
    );
    return level ? `Lv.${level}` : "";
  }

  function getMessageUserName(user) {
    return String(user?.username || user?.user_name || user?.nickname || user?.name || "盒友").trim();
  }

  function getMessageUserAvatar(user) {
    return String(user?.avatar || user?.avartar || user?.avatar_url || user?.avatarUrl || "").trim();
  }

  function getMessageUserLevel(user) {
    const level = normalizeUserLevel(user?.level_info?.level || user?.level || user?.user_level || "");
    return level ? `Lv.${level}` : "";
  }

  function getAwardMessageActors(message) {
    const users = Array.isArray(message?.user_as)
      ? message.user_as
      : [message?.user_a].filter(Boolean);
    return users.map((user) => ({
      name: getMessageUserName(user),
      avatar: getMessageUserAvatar(user),
      avatarFallback: Array.from(getMessageUserName(user) || "盒")[0] || "盒",
      level: getMessageUserLevel(user)
    })).filter((user) => user.name || user.avatar);
  }

  function getAwardMessageKind(message) {
    const type = String(message?.message_type || message?.type || "");
    if (type === "7" || message?.comment_b_id || message?.comment_b_text || message?.comment_img) {
      return "comment";
    }
    return "post";
  }

  function getAwardMessageCount(message, actors) {
    const raw = Number(message?.comment_award_num || message?.link_award_num || actors?.length || 0);
    return Number.isFinite(raw) && raw > 0 ? raw : (actors?.length || 0);
  }

  function getAwardMessageUserName(actors, awardCount) {
    const firstName = actors?.[0]?.name || "盒友";
    if (awardCount > 1) {
      return `${firstName} 等 ${awardCount} 人`;
    }
    return firstName;
  }

  function getAwardMessageContent(message, awardKind) {
    if (awardKind === "comment") {
      return stripMessageHtml(message?.comment_b_text || message?.comment_text || message?.comment_content || "") || "你的评论被点赞了";
    }
    return stripMessageHtml(message?.link_desc || message?.link_text || message?.link_content || "") || "你的帖子被点赞了";
  }

  function getAwardMessageTargetImages(message) {
    return uniqueStrings([
      ...normalizeMessageImageList(message?.comment_img),
      ...normalizeMessageImageList(message?.comment_imgs),
      ...normalizeMessageImageList(message?.comment_images)
    ]);
  }

  function getReplyMessageTypeLabel(message) {
    const type = String(message?.message_type || message?.type || "");
    if (messagePopoverState.activeTab === "award") {
      return "点赞";
    }
    if (type === "1") {
      return "回复";
    }
    if (type === "2") {
      return "评论";
    }
    if (/award|like|support|up/i.test(type)) {
      return "点赞";
    }
    return "互动";
  }

  function getReplyMessageActionText(message) {
    const type = String(message?.message_type || message?.type || "");
    if (messagePopoverState.activeTab === "award") {
      return "点赞了你";
    }
    if (type === "1") {
      return "回复了你";
    }
    if (type === "2") {
      return "评论了你";
    }
    return "与你互动";
  }

  function getReplyMessageTimestamp(message) {
    const raw = Number(findFirstFieldDeep(message, [
      "create_at",
      "created_at",
      "timestamp",
      "time",
      "date"
    ]));
    if (!Number.isFinite(raw) || raw <= 0) {
      return 0;
    }
    return raw > 100000000000 ? Math.floor(raw / 1000) : raw;
  }

  function normalizeReplyMessages(messages, options = {}) {
    const tab = options.tab === "award" ? "award" : "reply";
    return (Array.isArray(messages) ? messages : [])
      .filter((message) => tab === "award" || ["1", "2"].includes(String(message?.message_type || message?.type || "")))
      .map((message) => {
        const awardKind = tab === "award" ? getAwardMessageKind(message) : "";
        const actors = tab === "award" ? getAwardMessageActors(message) : [];
        const awardCount = tab === "award" ? getAwardMessageCount(message, actors) : 0;
        const userName = tab === "award" ? getAwardMessageUserName(actors, awardCount) : getReplyMessageUserName(message);
        const avatar = tab === "award" ? (actors[0]?.avatar || "") : getReplyMessageAvatar(message);
        return {
          id: String(findFirstFieldDeep(message, ["id", "message_id", "messageId"]) || `${getReplyMessageLinkId(message)}-${getReplyMessageTimestamp(message)}-${tab === "award" ? getAwardMessageContent(message, awardKind) : getReplyMessageContent(message)}`),
          linkId: getReplyMessageLinkId(message),
          userName,
          userLevel: tab === "award" ? (actors[0]?.level || "") : getMessageUserLevel(message?.user_a),
          avatar,
          avatarFallback: Array.from(userName || "盒")[0] || "盒",
          actionText: tab === "award"
            ? (awardKind === "comment" ? "点赞了你的评论" : "点赞了你的帖子")
            : getReplyMessageActionText(message),
          typeLabel: tab === "award"
            ? (awardKind === "comment" ? "评论点赞" : "帖子点赞")
            : getReplyMessageTypeLabel(message),
          title: getReplyMessageTitle(message),
          description: getReplyMessageLinkDescription(message),
          content: tab === "award" ? getAwardMessageContent(message, awardKind) : getReplyMessageContent(message),
          contentImages: tab === "award" ? [] : getReplyMessageCommentImages(message),
          replyTargetContent: tab === "award" ? "" : getReplyMessageTargetContent(message),
          topicName: getReplyMessageTopicName(message),
          topicIcon: getReplyMessageTopicIcon(message),
          linkImages: getReplyMessageLinkImages(message),
          targetImages: tab === "award" && awardKind === "comment" ? getAwardMessageTargetImages(message) : [],
          linkAuthor: getReplyMessageLinkAuthor(message),
          linkAuthorAvatar: tab === "award"
            ? String(message?.link_user_avatar || message?.author_avatar || "").trim()
            : getReplyMessageLinkAuthorAvatar(message),
          linkAuthorAvatarFallback: Array.from(getReplyMessageLinkAuthor(message) || "作")[0] || "作",
          linkAuthorLevel: tab === "award"
            ? (() => {
              const level = normalizeUserLevel(message?.link_user_level || message?.author_level || "");
              return level ? `Lv.${level}` : "";
            })()
            : getReplyMessageLinkAuthorLevel(message),
          timestamp: getReplyMessageTimestamp(message),
          awardKind,
          awardCount,
          actors
        };
      })
      .filter((message) => message.linkId)
      .sort((left, right) => Number(right.timestamp || 0) - Number(left.timestamp || 0));
  }

