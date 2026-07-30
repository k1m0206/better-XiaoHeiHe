// AI Bot 提示词构造、回复清洗和评论提交。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function getAiBotMessageTypeLabel(messageSource) {
    if (messageSource === AI_BOT_MESSAGE_TYPES.FEED) {
      return "首页推荐帖";
    }
    return messageSource === AI_BOT_MESSAGE_TYPES.COMMENT ? "评论/回复我的消息" : "@我的消息";
  }

  function isAiBotMessageSourceEnabled(settings, messageSource) {
    if (messageSource === AI_BOT_MESSAGE_TYPES.FEED) {
      return settings.commentHomeFeed === true;
    }
    return messageSource === AI_BOT_MESSAGE_TYPES.COMMENT
      ? settings.replyComments === true
      : settings.replyMentions !== false;
  }

  function buildAiBotHistoryLines(history) {
    return (Array.isArray(history) ? history : []).map((item, index) => {
      const header = `${index + 1}. 时间：${item.timeText || "未知"}；帖子：${item.linkTitle || `帖子 ${item.linkId || "未知"}`}；互动类型：${item.typeLabel || "评论互动"}`;
      if (item.messageSource === AI_BOT_MESSAGE_TYPES.FEED) {
        return [header, `我方主动暖贴：${item.replyText || "无文本"}`].join("\n");
      }
      return [
        header,
        `对方：${item.messageText || "无文本"}`,
        `我方：${item.replyText || "无文本"}`
      ].join("\n");
    });
  }

  async function readAiBotGlobalHistory(settings, accountId, senderId) {
    if (!settings.globalHistoryEnabled || !accountId || !senderId) {
      return [];
    }
    const result = await storageGet(AI_BOT_MESSAGE_LOGS_STORAGE_KEY);
    const now = Date.now();
    const logs = Array.isArray(result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY])
      ? result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]
      : [];
    return logs
      .filter((item) => {
        if (item?.skipped || ![AI_BOT_MESSAGE_TYPES.MENTION, AI_BOT_MESSAGE_TYPES.COMMENT, AI_BOT_MESSAGE_TYPES.FEED].includes(item?.messageSource)) {
          return false;
        }
        return String(item?.accountId || "") === String(accountId)
          && String(item?.senderId || "") === String(senderId)
          && String(item?.replyText || "").trim();
      })
      .filter((item) => Number(item?.sentTimestamp || item?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
      .sort((left, right) => Number(right?.sentTimestamp || right?.timestamp || 0) - Number(left?.sentTimestamp || left?.timestamp || 0))
      .slice(0, settings.globalHistoryLimit)
      .reverse()
      .map((item) => ({
        timeText: item.sentTimeText || item.timeText || formatLogTime(item.sentTimestamp || item.timestamp),
        messageSource: item.messageSource,
        typeLabel: item.typeLabel || getAiBotMessageTypeLabel(item.messageSource),
        linkId: String(item.linkId || ""),
        linkTitle: String(item.linkTitle || ""),
        messageText: String(item.messageText || item.triggerText || "").trim(),
        replyText: String(item.replyText || "").trim()
      }));
  }

  function buildAiBotPromptPayload(message, context, replyCommentId, messageSource, emojiCodes = [], allowEmoji = true, history = []) {
    const triggerComment = findCommentById(context.groups, replyCommentId);
    const user = message?.user_a || {};
    const detail = context.detail || {};
    const typeLabel = getAiBotMessageTypeLabel(messageSource);
    const historyLines = buildAiBotHistoryLines(history);
    return [
      `当前登录账号收到了一条${typeLabel}，消息ID：${message?.message_id || ""}`,
      `消息发起用户：${user.username || user.nickname || "未知用户"}（ID：${getUserId(user) || "未知"}）`,
      `帖子标题：${detail.title || "无标题"}`,
      detail.author ? `帖子作者：${detail.author}` : "",
      detail.content ? `帖子正文：${detail.content}` : "",
      detail.topic ? `话题：${detail.topic}` : "",
      message?.comment_b_text ? `被回复的上一条评论：${stripHtml(String(message.comment_b_text || ""))}` : "",
      message?.comment_a_text ? `触发消息的评论文本：${stripHtml(String(message.comment_a_text || ""))}` : "",
      triggerComment ? `触发消息的评论：${getCommentLine(triggerComment)}` : `触发消息的评论ID：${replyCommentId}`,
      historyLines.length
        ? `与该用户最近的跨帖子历史对话（共${historyLines.length}组，按时间从早到晚；仅作为背景，不要逐条复述）：\n${historyLines.join("\n\n")}`
        : "",
      `评论区上下文（最多${AI_BOT_COMMENT_LIMIT}条）：\n${getAiBotCommentLines(context.groups).join("\n") || "暂无评论上下文"}`,
      allowEmoji
        ? (emojiCodes.length ? `完整可用小黑盒表情短码列表：${emojiCodes.join(" ")}\n可以自然使用 Unicode emoji 表情，也可以使用 0-2 个列表内短码；不要编造列表外的短码，不要输出任何不在这个列表里的方括号表情，例如[摊手]、[笑哭]。` : "可以自然使用 Unicode emoji 表情；没有可用小黑盒表情短码时，不要输出任何方括号表情。")
        : "不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。"
    ].filter(Boolean).join("\n\n");
  }

  function buildAiBotFeedPromptPayload(feedItem, context, emojiCodes = [], allowEmoji = true) {
    const feedDetail = getFeedItemDetail(feedItem);
    const contextDetail = context.detail || {};
    const detail = {
      title: contextDetail.title || feedDetail.title,
      author: contextDetail.author || feedDetail.author,
      content: contextDetail.content || feedDetail.content,
      topic: contextDetail.topic || feedDetail.topic,
      imageUrls: uniqueStrings([...(contextDetail.imageUrls || []), ...(feedDetail.imageUrls || [])])
    };
    return [
      "当前任务：对小黑盒首页推荐帖发表一条普通主评论，不是回复其他用户。",
      `帖子标题：${detail.title || "无标题"}`,
      detail.author ? `帖子作者：${detail.author}` : "",
      detail.content ? `帖子正文：${detail.content}` : "",
      detail.imageUrls.length ? `帖子图片链接：\n${detail.imageUrls.join("\n")}` : "",
      detail.topic ? `话题：${detail.topic}` : "",
      feedDetail.commentNum ? `首页列表显示评论数：${feedDetail.commentNum}` : "",
      feedDetail.up ? `首页列表显示点赞数：${feedDetail.up}` : "",
      `评论区上下文（最多${AI_BOT_COMMENT_LIMIT}条）：\n${getAiBotCommentLines(context.groups).join("\n") || "暂无评论上下文"}`,
      "请生成一条像真实用户看到该帖子后自然留下的中文主评论。不要声称自己已体验未提供的信息，不要输出 Markdown。",
      allowEmoji
        ? (emojiCodes.length ? `完整可用小黑盒表情短码列表：${emojiCodes.join(" ")}\n可以自然使用 Unicode emoji 表情，也可以使用 0-2 个列表内短码；不要编造列表外的短码，不要输出任何不在这个列表里的方括号表情，例如[摊手]、[笑哭]。` : "可以自然使用 Unicode emoji 表情；没有可用小黑盒表情短码时，不要输出任何方括号表情。")
        : "不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。"
    ].filter(Boolean).join("\n\n");
  }

  const AI_BOT_REFUSE_TAG = "[REFUSE]";

  function cleanAiBotReply(content, emojiCodes = [], allowEmoji = true) {
    const raw = String(content || "").trim();
    if (!raw) {
      return {
        reply: "",
        moderationReason: "empty_model_response",
        moderationReasonDetail: "AI 接口返回内容为空"
      };
    }
    if (raw === AI_BOT_REFUSE_TAG || raw.startsWith(AI_BOT_REFUSE_TAG)) {
      return {
        reply: "",
        moderationReason: "model_refused",
        moderationReasonDetail: "模型根据内置审查规则返回了 [REFUSE]",
        modelResponsePreview: raw.slice(0, 200)
      };
    }
    if (raw === "模型没有返回内容") {
      return {
        reply: "",
        moderationReason: "empty_model_content",
        moderationReasonDetail: "AI 接口响应成功，但模型没有返回可用内容",
        modelResponsePreview: raw
      };
    }
    let reply;
    if (!allowEmoji) {
      reply = raw
        .replace(/^```(?:\w+)?\s*/i, "")
        .replace(/```$/i, "")
        .replace(/^["“”]+|["“”]+$/g, "")
        .replace(/\[[^\]\r\n]{1,40}\]/g, "")
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
        .trim()
        .slice(0, 1000);
    } else {
      const allowedEmojiCodes = new Set(emojiCodes);
      reply = raw
        .replace(/^```(?:\w+)?\s*/i, "")
        .replace(/```$/i, "")
        .replace(/^["“”]+|["“”]+$/g, "")
        .replace(/\[([^\]\r\n]{1,40})\]/g, (matched) => allowedEmojiCodes.has(matched) ? matched : "")
        .trim()
        .slice(0, 1000);
    }
    if (!reply) {
      return {
        reply: "",
        moderationReason: "reply_removed_by_cleanup",
        moderationReasonDetail: allowEmoji
          ? "模型回复经格式和无效表情短码清理后为空"
          : "模型回复仅包含已禁用的表情或方括号短码，清理后为空",
        modelResponsePreview: raw.slice(0, 200)
      };
    }
    return { reply };
  }

  async function createAiBotReply(settings, accountId, message, context, replyCommentId, messageSource, emojiCodes = []) {
    const allowedEmojiCodes = settings.allowEmoji ? emojiCodes : [];
    const senderId = getUserId(message?.user_a || {});
    const history = await readAiBotGlobalHistory(settings, accountId, senderId);
    const payload = buildAiBotPromptPayload(message, context, replyCommentId, messageSource, allowedEmojiCodes, settings.allowEmoji, history);
    const emojiInstruction = settings.allowEmoji
      ? ""
      : "\n\n不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。";
    const systemPrompt = settings.commentPrompt + emojiInstruction + AI_BOT_BUILTIN_MODERATION_PROMPT;
    const response = await requestChat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: payload }
      ],
      temperature: 0.6
    }, {
      enabled: true,
      provider: settings.provider,
      baseUrl: settings.baseUrl,
      model: settings.model,
      apiKey: settings.apiKey
    });
    if (!response.ok) {
      throw new Error(response.error || "AI 回复生成失败");
    }
    return cleanAiBotReply(response.content, allowedEmojiCodes, settings.allowEmoji);
  }

  async function createAiBotFeedComment(settings, feedItem, context, emojiCodes = []) {
    const allowedEmojiCodes = settings.allowEmoji ? emojiCodes : [];
    const payload = buildAiBotFeedPromptPayload(feedItem, context, allowedEmojiCodes, settings.allowEmoji);
    const emojiInstruction = settings.allowEmoji
      ? ""
      : "\n\n不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。";
    const systemPrompt = (settings.feedCommentPrompt || AI_BOT_DEFAULT_FEED_PROMPT) + emojiInstruction + AI_BOT_BUILTIN_MODERATION_PROMPT;
    const response = await requestChat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: payload }
      ],
      temperature: 0.6
    }, {
      enabled: true,
      provider: settings.provider,
      baseUrl: settings.baseUrl,
      model: settings.model,
      apiKey: settings.apiKey
    });
    if (!response.ok) {
      throw new Error(response.error || "AI 首页评论生成失败");
    }
    return cleanAiBotReply(response.content, allowedEmojiCodes, settings.allowEmoji);
  }

  async function waitForAiBotCommentCooldown() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    const runtime = result[AI_BOT_RUNTIME_STORAGE_KEY] || {};
    const lastCommentAt = Math.max(
      Number(runtime.lastCommentAt || 0),
      Number(runtime.lastCommentAttemptAt || 0)
    );
    const waitMs = Math.max(0, AI_BOT_COMMENT_COOLDOWN_MS - (Date.now() - lastCommentAt));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  async function markAiBotCommentAttempt() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...(result[AI_BOT_RUNTIME_STORAGE_KEY] || {}),
        lastCommentAttemptAt: Date.now()
      }
    });
  }

  async function markAiBotCommentSent() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...(result[AI_BOT_RUNTIME_STORAGE_KEY] || {}),
        lastCommentAt: Date.now(),
        consecutiveCommentFailures: 0
      }
    });
  }

  async function markAiBotCommentFailed(error) {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    const runtime = result[AI_BOT_RUNTIME_STORAGE_KEY] || {};
    const consecutiveCommentFailures = Number(runtime.consecutiveCommentFailures || 0) + 1;
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...runtime,
        consecutiveCommentFailures,
        lastCommentFailureAt: Date.now()
      }
    });
    await appendAiBotLog("error", `自动评论发送失败（连续 ${consecutiveCommentFailures}/3 次）`, {
      error: error?.message || "未知错误",
      ...(error?.aiBotDetail || {})
    });
    if (consecutiveCommentFailures === 3) {
      await stopAiBotForCommentFailures(error?.message || "评论发送失败");
    }
  }

  async function resetAiBotCommentFailures() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    const runtime = result[AI_BOT_RUNTIME_STORAGE_KEY] || {};
    if (!runtime.consecutiveCommentFailures) {
      return;
    }
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...runtime,
        consecutiveCommentFailures: 0
      }
    });
  }

  function getAiBotFeedCommentIntervalMs(settings) {
    return Math.max(AI_BOT_MIN_FEED_POLL_MINUTES, Number(settings?.feedPollMinutes || AI_BOT_MIN_FEED_POLL_MINUTES)) * 60 * 1000;
  }

  async function getAiBotFeedCommentCooldown(settings) {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    const runtime = result[AI_BOT_RUNTIME_STORAGE_KEY] || {};
    const lastFeedAt = Number(runtime.lastFeedCommentAttemptAt || runtime.lastFeedCommentAt || 0);
    const intervalMs = getAiBotFeedCommentIntervalMs(settings);
    const remainingMs = intervalMs - (Date.now() - lastFeedAt);
    return {
      lastFeedAt,
      intervalMs,
      waitMs: remainingMs > AI_BOT_FEED_COOLDOWN_TOLERANCE_MS ? remainingMs : 0
    };
  }

  async function markAiBotFeedCommentAttempt() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...(result[AI_BOT_RUNTIME_STORAGE_KEY] || {}),
        lastFeedCommentAttemptAt: Date.now()
      }
    });
  }

  async function markAiBotFeedCommentSent() {
    const result = await storageGet(AI_BOT_RUNTIME_STORAGE_KEY);
    await storageSet({
      [AI_BOT_RUNTIME_STORAGE_KEY]: {
        ...(result[AI_BOT_RUNTIME_STORAGE_KEY] || {}),
        lastFeedCommentAt: Date.now()
      }
    });
  }

  function queueAiBotCommentSubmission(task) {
    const next = aiBotCommentQueue.then(task, task);
    aiBotCommentQueue = next.catch(() => {});
    return next;
  }

  async function submitAiBotCommentNow(heyboxId, linkId, replyCommentId, rootCommentId, text) {
    if (!AI_BOT_FEATURE_ENABLED) {
      throw new Error("AI Bot 功能已停用");
    }
    const latestSettings = await readAiBotSettings();
    if (!latestSettings.enabled) {
      throw new Error("AI Bot 已关闭");
    }
    await waitForAiBotCommentCooldown();
    await markAiBotCommentAttempt();
    const commentUrl = await buildCommentCreateUrl(heyboxId);
    const body = new URLSearchParams({
      is_cy: "0",
      link_id: String(linkId),
      reply_id: String(replyCommentId),
      root_id: String(rootCommentId || replyCommentId),
      text,
    });
    const headerRuleResult = await activateAiBotCommentRequestHeaderRule();
    let data;
    try {
      data = await fetchAiBotJson(commentUrl, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: body.toString()
      });
    } finally {
      await clearAiBotCommentRequestHeaderRule();
    }
    if (data?.status !== "ok") {
      if (isLoginExpiredResponse(data)) {
        await stopAiBotForLoginExpired(data?.message || data?.msg || data?.status);
      }
      const error = new Error(getAiBotApiErrorMessage(data, "评论发送失败"));
      error.aiBotDetail = {
        responseStatus: data?.status || "",
        responseMessage: data?.message || data?.msg || data?.error || "",
        responseCode: data?.code || data?.errno || "",
        requestUrl: sanitizeAiBotLogUrl(commentUrl),
        requestBody: maskAiBotCommentBody(body),
        requestHeaderRule: headerRuleResult
      };
      throw error;
    }
    await markAiBotCommentSent();
    return data;
  }

  async function submitAiBotComment(heyboxId, linkId, replyCommentId, rootCommentId, text) {
    return queueAiBotCommentSubmission(async () => {
      try {
        return await submitAiBotCommentNow(heyboxId, linkId, replyCommentId, rootCommentId, text);
      } catch (error) {
        await markAiBotCommentFailed(error);
        throw error;
      }
    });
  }
