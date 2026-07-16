// 评论数据归一化、过滤、排序和预览渲染。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function normalizeCommentText(text) {
    return String(text || "").replace(/\[cube_([^\]]+)\]/g, "[$1]");
  }

  function normalizeEmojiToken(token) {
    return String(token || "").replace(/^cube_/, "");
  }

  function getEmojiImageKey(img) {
    try {
      const pathname = new URL(img, window.location.href).pathname;
      return pathname.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
    } catch {
      return "";
    }
  }

  function addEmojiMapEntry(key, emoji) {
    if (!key || emojiCache.has(key)) {
      return;
    }

    emojiCache.set(key, {
      img: emoji.img,
      code: emoji.code || emoji.name || key,
      token: emoji.token || normalizeEmojiToken(emoji.code || emoji.name || key),
      type: emoji.type
    });
  }

  function normalizeEmojiData(data) {
    const groups = Array.isArray(data?.result?.emoji_groups) ? data.result.emoji_groups : [];
    groups.forEach((group) => {
      const groupCode = group.group_code || group.group_name || "";
      const emojis = Array.isArray(group.emojis) ? group.emojis : [];
      emojis.forEach((emoji) => {
        if (!emoji?.img) {
          return;
        }

        const code = String(emoji.code || emoji.name || "").trim();
        const normalizedCode = normalizeEmojiToken(code);
        const imageKey = getEmojiImageKey(emoji.img);
        const token = groupCode && normalizedCode ? `${groupCode}_${normalizedCode}` : (code || imageKey);
        const emojiEntry = {
          ...emoji,
          code: code || token,
          token
        };
        addEmojiMapEntry(code, emojiEntry);
        addEmojiMapEntry(normalizedCode, emojiEntry);
        addEmojiMapEntry(token, emojiEntry);
        addEmojiMapEntry(`${groupCode}_${code}`, emojiEntry);
        addEmojiMapEntry(imageKey, emojiEntry);
        addEmojiMapEntry(`${groupCode}_${imageKey}`, {
          ...emojiEntry,
          token: groupCode && imageKey ? `${groupCode}_${imageKey}` : token
        });
      });
    });
  }

  function loadEmojis() {
    if (emojiCache.size) {
      return Promise.resolve(emojiCache);
    }

    if (emojiPromise) {
      return emojiPromise;
    }

    emojiPromise = fetch(buildEmojiApiUrl(), {
      credentials: "include",
      headers: {
        accept: "*/*"
      }
    }).then((response) => response.json()).then((data) => {
      if (data?.status === "ok") {
        normalizeEmojiData(data);
      }

      return emojiCache;
    }).catch(() => emojiCache);

    return emojiPromise;
  }

  function renderEmojiImage(emoji) {
    const className = emoji.type === 2
      ? "better-comment-preview__emoji better-comment-preview__emoji--big"
      : "better-comment-preview__emoji";
    const label = emoji.token || emoji.code;
    return `<img class="${className}" src="${escapeHtml(emoji.img)}" alt="[${escapeHtml(label)}]" title="${escapeHtml(label)}" loading="lazy">`;
  }

  function renderPlainCommentText(text) {
    return String(text || "").split(/(\[[^\]\r\n]{1,40}\])/g).map((part) => {
      const matched = part.match(/^\[([^\]\r\n]{1,40})\]$/);
      if (!matched) {
        return escapeHtml(part);
      }

      const emoji = emojiCache.get(matched[1]) || emojiCache.get(normalizeEmojiToken(matched[1]));
      return emoji ? renderEmojiImage(emoji) : escapeHtml(normalizeCommentText(part));
    }).join("");
  }

  function renderEmojiTokensInHtml(html) {
    return String(html || "").split(/(<[^>]+>)/g).map((part) => {
      if (!part || part.startsWith("<")) {
        return part;
      }

      return part.split(/(\[[^\]\r\n]{1,40}\])/g).map((token) => {
        const matched = token.match(/^\[([^\]\r\n]{1,40})\]$/);
        if (!matched) {
          return token;
        }

        const normalizedToken = normalizeEmojiToken(matched[1]);
        const emoji = emojiCache.get(matched[1]) || emojiCache.get(normalizedToken);
        return emoji ? renderEmojiImage(emoji) : token;
      }).join("");
    }).join("");
  }

  function cleanAiSummaryContent(content, allowEmoji = true) {
    const text = String(content || "")
      .replace(/\s*\[\d{1,6}\](?=\s|$|[，。！？、,.!?；;：:])/g, "")
      .replace(/[ \t]{2,}/g, " ");
    if (allowEmoji) {
      return text;
    }

    return text
      .replace(/\[[^\]\r\n]{1,40}\]/g, "")
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/[ \t]{2,}/g, " ");
  }

  function isSafeCommentLink(href) {
    return /^(heybox|https?):\/\//i.test(href);
  }

  function isSafeCommentImageUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function normalizeCommentLinkHref(href) {
    const webHref = getHeyboxWebHref(href);
    if (webHref) {
      return webHref;
    }

    if (!href.toLowerCase().startsWith("heybox://")) {
      return href;
    }

    return href.replace(/%(?!25)([0-9a-f]{2})/gi, "%25$1");
  }

  function getHeyboxWebHref(href) {
    let payload = getHeyboxLinkPayload(href);
    if (!payload) {
      return "";
    }

    for (let index = 0; index < 3; index += 1) {
      try {
        const decoded = decodeURIComponent(payload);
        if (decoded === payload) {
          break;
        }
        payload = decoded;
      } catch {
        break;
      }
    }

    try {
      const data = JSON.parse(payload);
      if (data?.protocol_type === "openLink") {
        const linkId = data?.link?.linkid;
        return /^\d+$/.test(String(linkId)) ? `/app/bbs/link/${linkId}` : "";
      }

      if (data?.protocol_type === "openGameDetail") {
        const gameType = String(data?.game_type || "").toLowerCase();
        const appId = data?.app_id;
        return /^[a-z0-9_-]+$/.test(gameType) && /^\d+$/.test(String(appId))
          ? `/app/topic/game/${gameType}/${appId}`
          : "";
      }

      if (data?.protocol_type === "openUser") {
        const userId = data?.user_id;
        return /^\d+$/.test(String(userId)) ? `/app/user/profile/${userId}` : "";
      }

      return "";
    } catch {
      return "";
    }
  }

  function getHeyboxLinkPayload(href) {
    const rawHref = String(href || "");
    if (/^heybox:\/\//i.test(rawHref)) {
      return rawHref.replace(/^heybox:\/\//i, "");
    }

    try {
      const parsedUrl = new URL(rawHref, window.location.href);
      const hash = parsedUrl.hash.replace(/^#/, "");
      return /^heybox:\/\//i.test(hash) ? hash.replace(/^heybox:\/\//i, "") : "";
    } catch {
      return "";
    }
  }

  function getCommentLinkRenderType(href) {
    try {
      const parsedUrl = new URL(href, window.location.origin);
      if (parsedUrl.pathname.startsWith("/app/topic/game/")) {
        return "game";
      }
      if (parsedUrl.pathname.startsWith("/app/user/profile/")) {
        return "user";
      }
    } catch {
      return "";
    }

    return "";
  }

  function renderCommentLink(node) {
    const href = node.getAttribute("href") || "";
    const linkType = node.getAttribute("data-link-type") || "";
    if (!href || !isSafeCommentLink(href)) {
      return renderPlainCommentText(node.textContent || "");
    }

    const normalizedHref = normalizeCommentLinkHref(href);
    const renderType = getCommentLinkRenderType(normalizedHref);
    const originalLinkTypeAttr = linkType && !renderType ? ` data-link-type="${escapeHtml(linkType)}"` : "";
    const renderTypeAttr = renderType ? ` data-better-link-type="${escapeHtml(renderType)}"` : "";
    return `<a href="${escapeHtml(normalizedHref)}" target="_blank" rel="noopener noreferrer"${originalLinkTypeAttr}${renderTypeAttr}>${renderPlainCommentText(node.textContent || "")}</a>`;
  }

  function renderCommentNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return renderPlainCommentText(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    if (node.tagName.toLowerCase() === "a") {
      return renderCommentLink(node);
    }

    return renderPlainCommentText(node.textContent || "");
  }

  function renderCommentText(text) {
    const template = document.createElement("template");
    template.innerHTML = String(text || "");
    return Array.from(template.content.childNodes).map(renderCommentNode).join("");
  }

  function getCommentImages(comment) {
    return Array.isArray(comment?.imgs) ? comment.imgs : [];
  }

  function renderCommentImages(comment) {
    const images = getCommentImages(comment).filter((image) => {
      const src = image?.thumb || image?.url || "";
      const url = image?.url || image?.thumb || "";
      return src && url && isSafeCommentImageUrl(src) && isSafeCommentImageUrl(url);
    });

    if (!images.length) {
      return "";
    }

    return `
      <div class="better-comment-preview__images">
        ${images.map((image, index) => {
          const src = image.thumb || image.url;
          const url = image.url || image.thumb;
          const width = Number(image.width) || "";
          const height = Number(image.height) || "";
          const sizeAttrs = width && height
            ? ` width="${escapeHtml(width)}" height="${escapeHtml(height)}"`
            : "";
          return `
            <a class="better-comment-preview__image-link" href="${escapeHtml(url)}" data-preview-src="${escapeHtml(url)}">
              <img class="better-comment-preview__image" src="${escapeHtml(src)}" alt="评论图片 ${escapeHtml(index + 1)}" loading="lazy"${sizeAttrs}>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }

  function formatCommentTime(timestamp) {
    if (!timestamp) {
      return "";
    }

    const diff = Math.max(0, Date.now() - Number(timestamp) * 1000);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < hour) {
      return `${Math.max(1, Math.floor(diff / minute))}分钟前`;
    }
    if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    }
    return `${Math.floor(diff / day)}天前`;
  }

  function getLinkCreateTime(link) {
    return link?.create_at || link?.created_at || link?.publish_at || link?.time || "";
  }

  function getCommentCreateTime(comment) {
    return pickFirstNumber(
      comment?.create_at,
      comment?.created_at,
      comment?.publish_at,
      comment?.time,
      comment?.timestamp
    );
  }

  function isOwnerComment(comment) {
    return comment?.is_link_owner === 1
      || comment?.is_link_owner === true
      || comment?.is_owner === 1
      || comment?.is_owner === true;
  }

  function pickFirstNumber(...values) {
    const value = values.find((item) => item !== undefined && item !== null && item !== "");
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function getRootReplyCount(root, group) {
    return pickFirstNumber(
      root?.sub_comment_num,
      root?.sub_comments_count,
      root?.reply_num,
      root?.reply_count,
      root?.reply_cnt,
      root?.child_num,
      root?.child_comment_num,
      group?.sub_comment_num,
      group?.sub_comments_count,
      group?.reply_num,
      group?.reply_count,
      group?.reply_cnt,
      group?.child_num
    );
  }

  function normalizeCommentGroups(data) {
    const groups = Array.isArray(data?.result?.comments) ? data.result.comments : [];
    return groups.map((group, index) => {
      const list = Array.isArray(group.comment) ? group.comment : [];
      list.forEach(rememberCommentUserLevels);
      const root = list[0];
      const replies = list.slice(1, 2);
      return {
        root,
        replies,
        originalIndex: index,
        replyCount: getRootReplyCount(root, group),
        repliesHasMore: root?.has_more === 1 || root?.has_more === true || getRootReplyCount(root, group) > replies.length,
        repliesLoading: false,
        repliesFailed: false
      };
    }).filter((group) => group.root);
  }

  function normalizeSubComments(data, rootCommentId) {
    const result = data?.result || {};
    const candidates = [
      result.comments,
      result.comment,
      result.sub_comments,
      result.subComments,
      result.list,
      result.items,
      data?.comments
    ];
    const comments = candidates.find(Array.isArray) || [];
    const normalizedComments = comments
      .flatMap((item) => Array.isArray(item?.comment) ? item.comment : [item])
      .filter((comment) => comment && String(getCommentId(comment)) !== String(rootCommentId));
    normalizedComments.forEach(rememberCommentUserLevels);
    return normalizedComments;
  }

  function normalizeUserLevel(level) {
    const match = String(level ?? "").match(/\d+/);
    if (!match) {
      return "";
    }

    const value = Number.parseInt(match[0], 10);
    if (!Number.isFinite(value) || value <= 0) {
      return "";
    }

    return String(value);
  }

  function renderUserLevel(level) {
    const normalizedLevel = normalizeUserLevel(level);
    if (!normalizedLevel) {
      return "";
    }

    return `
      <div class="hb-level-tag hb-level-${escapeHtml(normalizedLevel)} list-content__level better-comment-preview__level">
        <div class="hb-level-tag__inner">
          <div class="hb-level-tag__inner__text"> Lv.${escapeHtml(normalizedLevel)}</div>
        </div>
      </div>
    `;
  }

  function getRawUserLevel(user) {
    return user?.level_info?.level
      ?? user?.level
      ?? user?.user_level
      ?? user?.levelInfo?.level
      ?? "";
  }

  function rememberUserLevel(user) {
    const profileId = getUserProfileId(user || {});
    const normalizedLevel = normalizeUserLevel(getRawUserLevel(user || {}));
    if (profileId && normalizedLevel) {
      userLevelCache.set(String(profileId), normalizedLevel);
    }
  }

  function rememberCommentUserLevels(comment) {
    rememberUserLevel(comment?.user);
    rememberUserLevel(comment?.replyuser);
  }

  function getUserDisplayLevel(user) {
    const normalizedLevel = normalizeUserLevel(getRawUserLevel(user || {}));
    if (normalizedLevel) {
      return normalizedLevel;
    }

    const profileId = getUserProfileId(user || {});
    return profileId ? userLevelCache.get(String(profileId)) || "" : "";
  }

  function parseUserLevelValue(level) {
    if (level === null || level === undefined || level === "") {
      return DEFAULT_USER_LEVEL;
    }

    const match = String(level).match(/\d+/);
    if (!match) {
      return DEFAULT_USER_LEVEL;
    }

    const value = Number.parseInt(match[0], 10);
    if (!Number.isFinite(value) || value < 0) {
      return DEFAULT_USER_LEVEL;
    }

    return Math.min(LEVEL_FILTER_MAX, value);
  }

  function getCommentUserLevel(comment) {
    const user = comment?.user || {};
    return parseUserLevelValue(
      getRawUserLevel(user)
      || comment?.level
      || comment?.user_level
    );
  }

  function shouldHideByLevel(level, scope) {
    const filter = levelFilters[normalizeBlockedKeywordScope(scope)];
    const normalizedLevel = parseUserLevelValue(level);
    return Boolean(filter?.enabled && normalizedLevel < filter.maxLevel);
  }

  function getLevelFilterLabel(maxLevel) {
    return `Lv.${Math.min(LEVEL_FILTER_MAX, Math.max(LEVEL_FILTER_MIN, Number.parseInt(maxLevel, 10) || LEVEL_FILTER_MIN))}`;
  }

  function getUserProfileId(user) {
    return user.heybox_id || user.user_heybox_id || user.userid || user.user_id || user.uid || user.id || "";
  }

  function renderUserAvatar(user) {
    const avatar = user.avatar || user.avartar || "";
    return `
      <div class="hb-cpt-avatar list-content__avatar better-comment-preview__user-avatar" style="--hb-avatar-size: 18px; --hb-avatar-deraction-size: 32px;">
        <img class="hb-avatar__image" src="${escapeHtml(avatar)}" alt="">
      </div>
    `;
  }

  function renderCommentUser(user, isOwner) {
    const profileId = getUserProfileId(user);
    const tagName = profileId ? "a" : "div";
    const href = profileId ? ` href="/app/user/profile/${escapeHtml(profileId)}"` : "";

    const owner = isOwner ? '<span class="better-comment-preview__owner">作者</span>' : "";
    return `
      <div class="bbs-list-content__header better-comment-preview__user-header">
      <${tagName}${href} class="header__user better-comment-preview__user">
        ${renderUserAvatar(user)}
        <p class="list-content__username better-comment-preview__name">${escapeHtml(user.username || "匿名用户")}</p>
        ${renderUserLevel(getUserDisplayLevel(user))}
      </${tagName}>
        ${owner}
      </div>
    `;
  }

  function renderCommentMeta(comment) {
    return `
      <span>${escapeHtml(formatCommentTime(comment.create_at))}</span>
      ${comment.ip_location ? `<span class="better-comment-preview__ip">${escapeHtml(comment.ip_location)}</span>` : ""}
    `;
  }

  function getCommentId(comment) {
    return comment.comment_id
      || comment.commentid
      || comment.commentId
      || comment.id
      || comment.cid
      || "";
  }

  function getCommentUserName(comment) {
    return comment?.user?.username || comment?.user?.nickname || "匿名用户";
  }

  function renderCommentReplyDataset(comment, rootCommentId) {
    const commentId = getCommentId(comment);
    return [
      `data-comment-id="${escapeHtml(commentId)}"`,
      `data-root-comment-id="${escapeHtml(rootCommentId || commentId)}"`,
      `data-comment-username="${escapeHtml(getCommentUserName(comment))}"`
    ].join(" ");
  }

  function isActivePreviewReplyTarget(activeReplyTarget, commentId) {
    return Boolean(activeReplyTarget?.commentId)
      && String(activeReplyTarget.commentId) === String(commentId);
  }

  function renderCommentReplyAction(commentId, rootCommentId) {
    if (!commentId) {
      return "";
    }

    return `
      <button class="better-comment-preview__reply-action" type="button" data-comment-id="${escapeHtml(commentId)}" data-root-comment-id="${escapeHtml(rootCommentId || commentId)}">
        回复
      </button>
    `;
  }

  function renderPreviewReplyForm(commentId, rootCommentId, placeholder) {
    return `
      <form class="better-comment-preview__reply-form" data-comment-id="${escapeHtml(commentId)}" data-root-comment-id="${escapeHtml(rootCommentId || commentId)}">
        <div class="better-comment-preview__reply-input" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="${escapeHtml(placeholder || "写下回复")}"></div>
        <div class="better-comment-preview__reply-attachments" hidden></div>
        <input class="better-comment-preview__reply-file-input" type="file" accept="image/*" multiple>
        <div class="better-comment-preview__reply-form-footer">
          <div class="better-comment-preview__reply-tools">
            <button class="better-comment-preview__emoji-toggle" type="button" aria-expanded="false" aria-label="表情" title="表情">
              <i class="hb-icon heybox-bbs_emoji_filled_24x24 better-comment-preview__emoji-toggle-icon" aria-hidden="true"></i>
            </button>
            <button class="better-comment-preview__image-upload" type="button" aria-label="上传图片" title="上传图片">
              <i class="hb-icon heybox-bbs_pic_filled_24x24 better-comment-preview__image-upload-icon" aria-hidden="true"></i>
            </button>
            <div class="better-comment-preview__reply-status"></div>
            <div class="better-comment-preview__emoji-panel" hidden>
              <div class="better-comment-preview__emoji-panel-state">表情加载中</div>
            </div>
          </div>
          <div class="better-comment-preview__reply-actions">
            <button class="better-comment-preview__reply-cancel" type="button">取消</button>
            <button class="better-comment-preview__reply-submit" type="submit">发送</button>
          </div>
        </div>
      </form>
    `;
  }

  function renderCommentReplyForm(comment, rootCommentId, activeReplyTarget) {
    const commentId = getCommentId(comment);
    if (!isActivePreviewReplyTarget(activeReplyTarget, commentId)) {
      return "";
    }

    const username = activeReplyTarget.username || getCommentUserName(comment);
    return renderPreviewReplyForm(commentId, rootCommentId || commentId, username ? `回复 ${username}` : "写下回复");
  }

  function getCommentUpCount(comment) {
    return pickFirstNumber(
      comment?.up,
      comment?.up_num,
      comment?.up_count,
      comment?.upCount,
      comment?.support_num,
      comment?.support_count,
      comment?.supportCount,
      comment?.like_num,
      comment?.like_count,
      comment?.likeCount,
      comment?.liked_num,
      comment?.liked_count,
      comment?.likedCount
    );
  }

  function isCommentSupported(comment) {
    return comment.is_support === 1
      || comment.is_supported === 1
      || comment.supported === true
      || comment.is_support === true
      || comment.is_supported === true
      || comment.better_supported === true;
  }

  function renderCommentSupportButton(comment) {
    const commentId = getCommentId(comment);
    const supported = isCommentSupported(comment);
    return `
      <button class="better-comment-preview__up${supported ? " better-comment-preview__up--active" : ""}" type="button" data-comment-id="${escapeHtml(commentId)}"${commentId ? "" : " disabled"}>
        <i class="hb-icon heybox-thumbs-up better-comment-preview__up-icon"></i>
        <span>${escapeHtml(getCommentUpCount(comment))}</span>
      </button>
    `;
  }

  function getCommentContentClass(comment, previewClass) {
    return `${previewClass} comment-item__content${isCyComment(comment) ? " cy" : ""}`;
  }

  function renderRootComment(comment, activeReplyTarget) {
    const user = comment.user || {};
    const commentId = getCommentId(comment);
    return `
      <div class="better-comment-preview__item" ${renderCommentReplyDataset(comment, commentId)} title="点击回复">
        <div class="better-comment-preview__body">
          <div>${renderCommentUser(user, comment.is_link_owner === 1)}</div>
          <div class="better-comment-preview__text-row">
            <div class="better-comment-preview__text-wrapper">
              <div class="${getCommentContentClass(comment, "better-comment-preview__text")}" data-expanded="false">${renderCommentText(comment.text)}</div>
              <button class="better-comment-preview__expand-button" style="display: none;">展开</button>
            </div>
            ${renderCommentSupportButton(comment)}
          </div>
          ${renderCommentImages(comment)}
          <div class="better-comment-preview__time">
            ${renderCommentMeta(comment)}
            ${renderCommentReplyAction(commentId, commentId)}
          </div>
        </div>
      </div>
      ${renderCommentReplyForm(comment, commentId, activeReplyTarget)}
    `;
  }

  function renderReplyComment(comment, rootCommentId, activeReplyTarget) {
    const user = comment.user || {};
    const replyUser = comment.replyuser || {};
    const commentId = getCommentId(comment);
    const replyTo = replyUser.username ? `回复 ${replyUser.username}` : "";
    return `
      <div class="better-comment-preview__reply" ${renderCommentReplyDataset(comment, rootCommentId)} title="点击回复">
        <div>
          ${renderCommentUser(user, comment.is_link_owner === 1)}
          ${replyTo ? `<span class="better-comment-preview__reply-meta">${escapeHtml(replyTo)}</span>` : ""}
        </div>
        <div class="better-comment-preview__reply-text-row">
          <div class="better-comment-preview__text-wrapper">
            <div class="${getCommentContentClass(comment, "better-comment-preview__reply-text")}" data-expanded="false">${renderCommentText(comment.text)}</div>
            <button class="better-comment-preview__expand-button" style="display: none;">展开</button>
          </div>
          ${renderCommentSupportButton(comment)}
        </div>
        ${renderCommentImages(comment)}
        <div class="better-comment-preview__reply-footer">
          <div class="better-comment-preview__reply-meta">${renderCommentMeta(comment)}</div>
          ${renderCommentReplyAction(commentId, rootCommentId)}
        </div>
      </div>
      ${renderCommentReplyForm(comment, rootCommentId, activeReplyTarget)}
    `;
  }

  function renderReplyMoreButton(group) {
    const rootCommentId = getCommentId(group.root);
    const loadedCount = group.replies?.length || 0;
    const replyCount = Math.max(Number(group.replyCount) || 0, loadedCount);
    const hasMore = Boolean(group.repliesHasMore);

    if (!rootCommentId || (!hasMore && !group.repliesFailed && !group.repliesLoading)) {
      return "";
    }

    let label = replyCount > 0 ? `全部 ${replyCount} 条回复` : "更多回复";
    if (group.repliesLoading) {
      label = "回复加载中";
    } else if (group.repliesFailed) {
      label = "回复加载失败，点击重试";
    }

    return `
      <button class="better-comment-preview__reply-more" type="button" data-root-comment-id="${escapeHtml(rootCommentId)}"${group.repliesLoading ? " disabled" : ""}>
        ${escapeHtml(label)}
      </button>
    `;
  }

  function renderCommentGroup(group, activeReplyTarget) {
    const rootCommentId = getCommentId(group.root);
    return `
      <div class="better-comment-preview__group">
        ${renderRootComment(group.root, activeReplyTarget)}
        ${group.replies.map((reply) => renderReplyComment(reply, rootCommentId, activeReplyTarget)).join("")}
        ${renderReplyMoreButton(group)}
      </div>
    `;
  }

  function isCyComment(comment) {
    return comment?.is_cy === 1 || comment?.is_cy === true || comment?.is_cy === "1";
  }

  function getBlockedKeywordHitKey(keywordItem, targetKey) {
    return `${normalizeBlockedKeywordScope(keywordItem.scope)}:${keywordItem.keyword.toLowerCase()}:${targetKey}`;
  }

  function getCommentBlockedKeywordTargetKey(comment) {
    const commentKey = getCommentId(comment)
      || `${comment?.userid || ""}:${comment?.create_at || ""}:${normalizeCommentText(comment?.text)}`;
    return `comment:${commentKey}`;
  }

  function recordBlockedKeywordHit(keywordItem, targetKey) {
    const hitKey = getBlockedKeywordHitKey(keywordItem, targetKey);
    if (blockedKeywordHitKeys.has(hitKey)) {
      return;
    }

    blockedKeywordHitKeys.add(hitKey);
    keywordItem.count = Math.max(0, Number.parseInt(keywordItem.count, 10) || 0) + 1;
    persistBlockedKeywordsState();
    renderSettingsPanel();
  }

  function getBlockedKeywordsByScope(scope) {
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    return blockedKeywords.filter((item) => normalizeBlockedKeywordScope(item.scope) === normalizedScope);
  }

  function isBlockedTextByKeyword(text, scope, targetKey) {
    const scopedKeywords = getBlockedKeywordsByScope(scope);
    if (!scopedKeywords.length) {
      return false;
    }

    const normalizedText = normalizeCommentText(text).toLowerCase();
    const matchedKeywords = scopedKeywords.filter((item) => normalizedText.includes(item.keyword.toLowerCase()));
    matchedKeywords.forEach((item) => recordBlockedKeywordHit(item, targetKey));
    return matchedKeywords.length > 0;
  }

  function isBlockedByKeyword(comment) {
    return isBlockedTextByKeyword(
      comment?.text,
      BLOCKED_KEYWORD_SCOPES.COMMENT,
      getCommentBlockedKeywordTargetKey(comment)
    );
  }

  function countCommentGroupItems(groups) {
    return groups.reduce((sum, group) => sum + 1 + (group.replies?.length || 0), 0);
  }

  function countCyCommentGroupItems(groups) {
    return groups.reduce((sum, group) => {
      const rootCount = isCyComment(group.root) ? 1 : 0;
      const replyCount = (group.replies || []).filter(isCyComment).length;
      return sum + rootCount + replyCount;
    }, 0);
  }

  function shouldHideComment(comment) {
    return (hideCyComments && isCyComment(comment))
      || isBlockedByKeyword(comment)
      || shouldHideByLevel(getCommentUserLevel(comment), BLOCKED_KEYWORD_SCOPES.COMMENT);
  }

  function getVisibleCommentGroups(commentGroups) {
    return commentGroups
      .filter((group) => !shouldHideComment(group.root))
      .map((group) => {
        const replies = group.replies || [];
        const visibleReplies = replies.filter((reply) => !shouldHideComment(reply));
        const hiddenLoadedReplyCount = replies.length - visibleReplies.length;
        const originalReplyCount = Math.max(Number(group.replyCount) || 0, replies.length);
        const visibleReplyCount = Math.max(0, originalReplyCount - hiddenLoadedReplyCount);

        return {
          ...group,
          replies: visibleReplies,
          replyCount: visibleReplyCount,
          repliesHasMore: Boolean(group.repliesHasMore && visibleReplyCount > visibleReplies.length)
        };
      });
  }

  function getCommentGroupOriginalIndex(group) {
    return Number.isFinite(group?.originalIndex) ? group.originalIndex : 0;
  }

  function compareCommentGroups(left, right) {
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.NEWEST) {
      const timeDiff = getCommentCreateTime(right.root) - getCommentCreateTime(left.root);
      return timeDiff || getCommentGroupOriginalIndex(left) - getCommentGroupOriginalIndex(right);
    }

    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.AUTHOR) {
      const ownerDiff = Number(isOwnerComment(right.root)) - Number(isOwnerComment(left.root));
      return ownerDiff || getCommentGroupOriginalIndex(left) - getCommentGroupOriginalIndex(right);
    }

    return getCommentGroupOriginalIndex(left) - getCommentGroupOriginalIndex(right);
  }

  function sortCommentGroups(commentGroups) {
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.DEFAULT) {
      return commentGroups;
    }

    return [...commentGroups].sort(compareCommentGroups);
  }

  function renderCommentSortControls() {
    const options = Object.values(COMMENT_PREVIEW_SORTS).map((sort) => `
      <button class="better-comment-preview__sort-option" type="button" data-sort="${escapeHtml(sort)}" aria-pressed="${commentPreviewSort === sort ? "true" : "false"}">${escapeHtml(COMMENT_PREVIEW_SORT_LABELS[sort])}</button>
    `).join("");
    return `
      <div class="better-comment-preview__sort-group" role="group" aria-label="评论排序">
        ${options}
      </div>
    `;
  }

  function renderCyToggle(hiddenCount) {
    return `
      <div class="better-comment-preview__toolbar">
        ${renderCommentSortControls()}
        <button class="better-comment-preview__cy-toggle" type="button" aria-pressed="${hideCyComments ? "true" : "false"}" title="${hideCyComments ? "显示插眼评论" : "屏蔽插眼评论"}">
          <span class="better-comment-preview__cy-toggle-switch" aria-hidden="true"></span>
          <span>屏蔽CY</span>
        </button>
        ${hiddenCount ? `<span class="better-comment-preview__filtered-count" title="屏蔽CY的数量">${escapeHtml(hiddenCount)}</span>` : ""}
      </div>
    `;
  }

  function syncCyToggleControls() {
    document.querySelectorAll(".better-comment-preview__cy-toggle").forEach((toggle) => {
      toggle.setAttribute("aria-pressed", hideCyComments ? "true" : "false");
      toggle.setAttribute("title", hideCyComments ? "显示插眼评论" : "屏蔽插眼评论");
    });
  }

  function syncCommentSortControls() {
    document.querySelectorAll(".better-comment-preview__sort-option").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.sort === commentPreviewSort ? "true" : "false");
    });
  }

  function bindLinkPageSortControls(toolbar) {
    toolbar.querySelectorAll(".better-comment-preview__sort-option").forEach((button) => {
      if (button.dataset.sortBound === "1") {
        return;
      }

      button.dataset.sortBound = "1";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setCommentPreviewSort(button.dataset.sort);
      });
    });
  }

  function renderCommentListFooter(state) {
    if (state.loadingMore) {
      return '<div class="better-comment-preview__loading-more">评论加载中</div>';
    }
    if (state.loadMoreFailed) {
      return '<div class="better-comment-preview__load-failed">更多评论加载失败</div>';
    }
    if (state.commentGroups?.length && !state.hasMore) {
      return '<div class="better-comment-preview__end">没有更多评论了</div>';
    }
    return "";
  }

  function renderCommentListContent(state, commentGroups, hiddenCount) {
    if (!commentGroups.length && state.loadingMore) {
      return '<div class="better-comment-preview__loading-more">评论加载中</div>';
    }
    if (!commentGroups.length && hiddenCount) {
      return '<div class="better-comment-preview__empty">评论已屏蔽</div>';
    }
    if (!commentGroups.length) {
      return '<div class="better-comment-preview__empty">暂无评论</div>';
    }
    return `${commentGroups.map((group) => renderCommentGroup(group, state?.activeReplyTarget)).join("")}${renderCommentListFooter(state)}`;
  }

  function isActivePostCommentTarget(state) {
    return state?.activeReplyTarget?.commentId === POST_COMMENT_TARGET_ID;
  }

  function renderPostCommentForm(state) {
    return isActivePostCommentTarget(state)
      ? renderPreviewReplyForm(POST_COMMENT_TARGET_ID, POST_COMMENT_TARGET_ID, "评论帖子正文")
      : "";
  }

  function renderPreviewFooter(linkId, count) {
    return `
      <div class="better-comment-preview__footer">
        <button class="better-comment-preview__post-comment" type="button">
          <span class="better-comment-preview__post-comment-icon" aria-hidden="true">✎</span>
          <span>评论</span>
        </button>
        <a class="better-comment-preview__open" href="/app/bbs/link/${escapeHtml(linkId)}">查看全部 ${escapeHtml(count)} 条评论 ›</a>
      </div>
    `;
  }

  function renderPreview(preview, state) {
    const linkId = preview.dataset.linkId || "";
    const count = state?.commentCount || preview.dataset.commentCount || "0";
    const allCommentGroups = state?.commentGroups || [];
    const commentGroups = sortCommentGroups(getVisibleCommentGroups(allCommentGroups));
    const totalHiddenCount = countCommentGroupItems(allCommentGroups) - countCommentGroupItems(commentGroups);
    const cyHiddenCount = hideCyComments ? countCyCommentGroupItems(allCommentGroups) : 0;
    const failed = state?.failed;
    const wasWaitingForFirstPage = Boolean(
      preview.querySelector(".better-comment-preview__loading, .better-comment-preview__loading-more")
      && !preview.querySelector(".better-comment-preview__group")
    );

    if (!state) {
      preview.innerHTML = '<div class="better-comment-preview__loading">评论加载中</div>';
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
      return;
    }

    if (failed) {
      preview.innerHTML = `
        <div class="better-comment-preview__empty">
          <div>评论暂时加载失败</div>
          <button class="better-comment-preview__reload" type="button">重新加载</button>
        </div>
      `;
      bindPreviewActions(preview);
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
      return;
    }

    preview.innerHTML = `
      <div class="better-comment-preview__header">
        <span>评论 ${escapeHtml(count)}</span>
        ${renderCyToggle(cyHiddenCount)}
      </div>
      <div class="better-comment-preview__list">
        ${renderCommentListContent(state, commentGroups, totalHiddenCount)}
      </div>
      ${renderPreviewFooter(linkId, count)}
      ${renderPostCommentForm(state)}
    `;
    preview.querySelectorAll(".better-comment-preview__text, .better-comment-preview__reply-text").forEach(updateExpandButton);
    const refreshedList = preview.querySelector(".better-comment-preview__list");
    if (wasWaitingForFirstPage && refreshedList && !state.loadingMore) {
      refreshedList.classList.add("better-comment-preview__list--refreshed");
      refreshedList.addEventListener("animationend", () => {
        refreshedList.classList.remove("better-comment-preview__list--refreshed");
      }, { once: true });
    }
    syncCyToggleControls();
    bindPreviewActions(preview);
    bindPreviewListScroll(preview);
    scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
  }

