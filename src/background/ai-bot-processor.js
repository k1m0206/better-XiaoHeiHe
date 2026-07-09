// AI Bot 消息预检、处理流程和轮询执行。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function getAiBotMessagePrecheckSkipReason(settings, message, records) {
    const messageId = String(message?.message_id || "");
    if (!messageId) {
      return {
        reason: "missing_message_id",
        label: "缺少消息ID"
      };
    }
    if (records[messageId]) {
      return {
        reason: "already_processed",
        label: "消息已处理",
        record: records[messageId]
      };
    }

    const whitelist = new Set(settings.whitelistUserIds.map((id) => String(id)));
    if (!whitelist.size) {
      return null;
    }

    const senderId = getUserId(message?.user_a || {});
    if (senderId && whitelist.has(senderId)) {
      return null;
    }
    return {
      reason: "whitelist_miss",
      label: "白名单不匹配",
      senderId,
      whitelistUserIds: settings.whitelistUserIds
    };
  }

  function getAiBotMessageDebugInfo(message) {
    const sender = message?.user_a || {};
    const notificationText = stripHtml(String(message?.text || "")).trim();
    const commentText = stripHtml(String(
      message?.comment_a_text
      || message?.comment_text
      || message?.content
      || ""
    )).trim();
    const repliedText = stripHtml(String(message?.comment_b_text || "")).trim();
    return {
      messageId: String(message?.message_id || ""),
      messageType: String(message?.message_type || ""),
      messageText: (commentText || notificationText).slice(0, 500),
      notificationText: notificationText.slice(0, 200),
      repliedText: repliedText.slice(0, 500),
      linkId: getLinkIdFromMessage(message),
      replyCommentId: getReplyCommentIdFromMessage(message),
      rootCommentId: getRootCommentIdFromMessage(message),
      senderId: getUserId(sender),
      senderName: getUserDisplayName(sender),
      linkTitle: String(message?.link?.title || "").slice(0, 120),
      linkTag: String(message?.link_tag || message?.link?.link_tag || "")
    };
  }

  function getAiBotIncomingMessageText(message) {
    return stripHtml(String(
      message?.comment_a_text
      || message?.comment_text
      || message?.content
      || message?.text
      || ""
    )).trim();
  }

  function getRejectedReplyKeywordMatch(settings, message) {
    const messageText = getAiBotIncomingMessageText(message).toLocaleLowerCase();
    if (!messageText) {
      return "";
    }
    return (settings.rejectedReplyKeywords || []).find((keyword) => (
      messageText.includes(String(keyword || "").toLocaleLowerCase())
    )) || "";
  }

  async function skipRejectedKeywordAiBotMessage(settings, message, records, messageSource, options = {}) {
    const messageId = String(message?.message_id || "");
    const matchedKeyword = getRejectedReplyKeywordMatch(settings, message);
    if (!messageId || records[messageId] || !matchedKeyword) {
      return false;
    }

    const skippedAt = Date.now();
    await markMessageReplied(messageId, {
      skippedAt,
      skipReason: "rejected_keyword",
      matchedKeyword,
      messageSource
    });
    records[messageId] = {
      skippedAt,
      skipReason: "rejected_keyword",
      matchedKeyword
    };
    const detail = {
      ...getAiBotMessageDebugInfo(message),
      messageSource,
      typeLabel: getAiBotMessageTypeLabel(messageSource),
      skipReason: "rejected_keyword",
      matchedKeyword
    };
    if (!options.collectOnly) {
      await appendAiBotLog("info", `命中拒绝回复关键词「${matchedKeyword}」，已跳过`, detail);
    }
    return detail;
  }

  function getMessageTimestampMs(message) {
    const value = Number(message?.timestamp || message?.time || 0);
    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }
    return value > 100000000000 ? value : Math.floor(value * 1000);
  }

  async function appendAiBotPollDecisionLog(level, action, message, messageSource, detail = {}) {
    await appendAiBotLog(level, `轮询消息处理：${action}`, {
      ...getAiBotMessageDebugInfo(message),
      messageSource,
      action,
      ...detail
    });
  }

  function createAiBotPollResultItem(message, messageSource, result = {}) {
    const timestampMs = getMessageTimestampMs(message);
    return {
      ...getAiBotMessageDebugInfo(message),
      messageSource,
      typeLabel: getAiBotMessageTypeLabel(messageSource),
      messageTime: timestampMs ? formatLogTime(timestampMs) : "",
      actionResult: result.actionResult || "unknown",
      actionLabel: result.actionLabel || "",
      skipReason: result.skipReason || "",
      error: result.error || ""
    };
  }

  async function appendAiBotQuerySummaryLog(messageSource, enabled, messages, results, detail = {}) {
    const typeLabel = messageSource === AI_BOT_MESSAGE_TYPES.COMMENT ? "评论信息" : "@ 信息";
    const resultsByMessageId = new Map(results.map((result) => [String(result?.messageId || ""), result]));
    const messageDetails = messages
      .map((message) => {
        const timestampMs = getMessageTimestampMs(message);
        const debugInfo = getAiBotMessageDebugInfo(message);
        const result = resultsByMessageId.get(debugInfo.messageId) || {};
        return {
          messageTimestamp: timestampMs,
          typeLabel: getAiBotMessageTypeLabel(messageSource),
          senderName: debugInfo.senderName || "",
          senderId: debugInfo.senderId || "",
          messageTime: timestampMs ? formatLogTime(timestampMs) : "",
          messageText: debugInfo.messageText || "",
          notificationText: debugInfo.notificationText || "",
          repliedText: debugInfo.repliedText || "",
          linkTitle: debugInfo.linkTitle || "",
          messageId: debugInfo.messageId || "",
          linkId: debugInfo.linkId || "",
          replyCommentId: debugInfo.replyCommentId || "",
          rootCommentId: debugInfo.rootCommentId || "",
          actionResult: result.actionResult || "",
          actionLabel: result.actionLabel || "",
          skipReason: result.skipReason || "",
          error: result.error || ""
        };
      })
      .sort((a, b) => Number(b.messageTimestamp || 0) - Number(a.messageTimestamp || 0))
      .map(({ messageTimestamp, ...item }) => item);
    await appendAiBotLog("info", `查询${typeLabel}`, {
      enabled,
      count: messages.length,
      processedCount: results.length,
      ...detail,
      messages: messageDetails
    });
  }

  async function skipStaleAiBotMessage(settings, message, records, messageSource, messageDebug, options = {}) {
    const messageId = String(message?.message_id || "");
    if (!messageId) {
      return false;
    }
    const timestampMs = getMessageTimestampMs(message);
    if (!timestampMs) {
      return false;
    }
    const freshMs = Math.max(1, Number(settings.messageFreshMinutes || 5)) * 60 * 1000;
    const ageMs = Date.now() - timestampMs;
    if (ageMs <= freshMs) {
      return false;
    }

    await markMessageReplied(messageId, {
      skippedAt: Date.now(),
      skipReason: "stale",
      messageSource,
      messageTimestamp: timestampMs
    });
    records[messageId] = {
      skippedAt: Date.now(),
      skipReason: "stale"
    };
    const staleDetail = {
      ...messageDebug,
      messageSource,
      typeLabel: getAiBotMessageTypeLabel(messageSource),
      messageTimestamp: timestampMs,
      messageTime: formatLogTime(timestampMs),
      ageMinutes: Math.floor(ageMs / 60000),
      freshMinutes: settings.messageFreshMinutes,
      skipReason: "超过时间窗口，已跳过"
    };
    if (!options.collectOnly) {
      await appendAiBotLog("info", "跳过过期 AI Bot 消息", staleDetail);
    }
    return staleDetail;
  }

  function createAiBotStageError(stage, error, detail = {}) {
    const nextError = error instanceof Error ? error : new Error(String(error || "未知错误"));
    nextError.aiBotStage = stage;
    nextError.aiBotDetail = {
      ...(nextError.aiBotDetail || {}),
      ...detail,
      errorName: nextError.name || "",
      errorMessage: nextError.message || "未知错误",
      errorStack: String(nextError.stack || "").split("\n").slice(0, 4).join("\n")
    };
    return nextError;
  }

  async function processAiBotMessage(settings, heyboxId, message, records, messageSource = AI_BOT_MESSAGE_TYPES.MENTION) {
    const messageId = String(message?.message_id || "");
    const typeLabel = getAiBotMessageTypeLabel(messageSource);
    if (!isAiBotMessageSourceEnabled(settings, messageSource)) {
      await appendAiBotPollDecisionLog("info", `${typeLabel}开关关闭，跳过`, message, messageSource, {
        skipReason: "source_disabled",
        replyMentions: settings.replyMentions,
        replyComments: settings.replyComments
      });
      return {
        actionResult: "skipped",
        actionLabel: "开关关闭，已跳过",
        skipReason: "source_disabled"
      };
    }
    const staleMessageDebug = {
      ...getAiBotMessageDebugInfo(message),
      messageSource
    };
    if (await skipStaleAiBotMessage(settings, message, records, messageSource, staleMessageDebug)) {
      return {
        actionResult: "skipped",
        actionLabel: "超过时间窗口，已跳过",
        skipReason: "stale"
      };
    }
    const rejectedKeywordDetail = await skipRejectedKeywordAiBotMessage(settings, message, records, messageSource);
    if (rejectedKeywordDetail) {
      return {
        actionResult: "skipped",
        actionLabel: `命中拒绝回复关键词「${rejectedKeywordDetail.matchedKeyword}」，已跳过`,
        skipReason: "rejected_keyword"
      };
    }
    const precheckSkip = getAiBotMessagePrecheckSkipReason(settings, message, records);
    if (precheckSkip) {
      await appendAiBotPollDecisionLog("info", `${precheckSkip.label}，跳过`, message, messageSource, {
        skipReason: precheckSkip.reason,
        senderId: precheckSkip.senderId || "",
        record: precheckSkip.record || "",
        whitelistUserIds: precheckSkip.whitelistUserIds || ""
      });
      return {
        actionResult: "skipped",
        actionLabel: `${precheckSkip.label}，已跳过`,
        skipReason: precheckSkip.reason
      };
    }

    const linkId = getLinkIdFromMessage(message);
    const directReplyCommentId = getReplyCommentIdFromMessage(message);
    const rootCommentId = getRootCommentIdFromMessage(message);
    const replyCommentId = directReplyCommentId || rootCommentId;
    const targetId = getAiBotReplyTargetId(message?.user_a || {});
    const messageDebug = {
      ...getAiBotMessageDebugInfo(message),
      messageSource,
      targetId,
      effectiveReplyCommentId: replyCommentId,
      replyTargetSource: directReplyCommentId ? "reply_comment_id" : (rootCommentId ? "root_comment_id" : "")
    };
    if (!linkId || !replyCommentId) {
      await appendAiBotLog("warn", `跳过${typeLabel}：缺少帖子ID或评论ID`, {
        ...messageDebug,
        skipReason: "missing_target"
      });
      return {
        actionResult: "skipped",
        actionLabel: "缺少帖子ID或评论ID，已跳过",
        skipReason: "missing_target"
      };
    }

    if (targetId) {
      const targetUsage = await getReplyTargetUsage(linkId, targetId, settings.replyLimitPerLinkUser);
      if (targetUsage.totalCount >= targetUsage.limit) {
        await markMessageReplied(messageId, {
          skippedAt: Date.now(),
          skipReason: "reply_target_limit",
          messageSource,
          linkId,
          targetId,
          sentCount: targetUsage.sentCount,
          queuedCount: targetUsage.queuedCount,
          limit: targetUsage.limit
        });
        records[messageId] = {
          skippedAt: Date.now(),
          skipReason: "reply_target_limit"
        };
        await appendAiBotPollDecisionLog("info", `同帖同人回复已达到 ${targetUsage.limit} 次，跳过`, message, messageSource, {
          ...messageDebug,
          skipReason: "reply_target_limit",
          sentCount: targetUsage.sentCount,
          queuedCount: targetUsage.queuedCount,
          limit: targetUsage.limit,
          record: targetUsage.record || ""
        });
        return {
          actionResult: "skipped",
          actionLabel: `同帖同人回复已达到 ${targetUsage.limit} 次，已跳过`,
          skipReason: "reply_target_limit"
        };
      }
    }

    const replyCommentUsage = await getReplyCommentUsage(linkId, replyCommentId);
    if (replyCommentUsage.sentLog || replyCommentUsage.queuedItem) {
      const duplicateSource = replyCommentUsage.sentLog ? "sent" : "queued";
      await markMessageReplied(messageId, {
        skippedAt: Date.now(),
        skipReason: "reply_comment_duplicate",
        messageSource,
        linkId,
        replyCommentId,
        duplicateSource,
        duplicateMessageId: replyCommentUsage.sentLog?.messageId || replyCommentUsage.queuedItem?.messageId || ""
      });
      records[messageId] = {
        skippedAt: Date.now(),
        skipReason: "reply_comment_duplicate"
      };
      await appendAiBotPollDecisionLog("info", "同一条评论已处理或正在队列中，跳过重复回复", message, messageSource, {
        ...messageDebug,
        skipReason: "reply_comment_duplicate",
        duplicateSource,
        duplicateMessageId: replyCommentUsage.sentLog?.messageId || replyCommentUsage.queuedItem?.messageId || ""
      });
      return {
        actionResult: "skipped",
        actionLabel: "同一条评论已处理或正在队列中，已跳过",
        skipReason: "reply_comment_duplicate"
      };
    }

    await appendAiBotLog("info", `开始处理${typeLabel}，获取帖子详情`, messageDebug);
    let context;
    try {
      context = await fetchLinkContext(linkId, heyboxId);
    } catch (error) {
      throw createAiBotStageError("查询帖子详情和评论区", error, messageDebug);
    }
    if (!context) {
      return {
        actionResult: "skipped",
        actionLabel: "帖子详情为空，已跳过",
        skipReason: "empty_context"
      };
    }
    const emojiCodes = await loadAiBotEmojiCodes(heyboxId);

    const enqueued = await enqueueReplyMessage(message, context, replyCommentId, messageSource, emojiCodes);
    if (enqueued) {
      await markMessageReplied(messageId, {
        queuedAt: Date.now(),
        messageSource
      });
      records[messageId] = { queuedAt: Date.now() };
      await appendAiBotPollDecisionLog("info", `${typeLabel}已入队等待回复`, message, messageSource, {
        ...messageDebug,
        actionResult: "enqueued"
      });
      return {
        actionResult: "enqueued",
        actionLabel: "已入队等待回复",
        skipReason: ""
      };
    }
    await appendAiBotPollDecisionLog("info", `${typeLabel}已在等待队列中，跳过重复入队`, message, messageSource, {
      actionResult: "already_queued"
    });
    return {
      actionResult: "already_queued",
      actionLabel: "已在等待队列中，跳过重复入队",
      skipReason: "already_queued"
    };
  }

  async function processAiBotHomeFeedComment(settings, heyboxId, reason = "alarm") {
    if (!settings.commentHomeFeed) {
      await appendAiBotLog("info", "查询首页推荐帖", {
        enabled: false,
        reason,
        actionResult: "disabled"
      });
      return {
        actionResult: "disabled",
        actionLabel: "评论首页推荐帖开关关闭"
      };
    }

    const strategy = settings.feedSelectStrategy || "first";
    await appendAiBotLog("info", "开始查询首页推荐帖", { reason, strategy });
    const feedLinks = await fetchHomeFeedLinks(heyboxId);
    const selected = selectFeedItemByStrategy(feedLinks, strategy);
    if (!selected) {
      await appendAiBotLog("warn", "首页推荐帖查询无有效帖子", {
        reason,
        count: feedLinks.length,
        strategy
      });
      return {
        actionResult: "skipped",
        actionLabel: "无有效首页推荐帖",
        skipReason: "empty_feed"
      };
    }

    const linkId = getLinkIdFromFeedItem(selected);
    const feedDetail = getFeedItemDetail(selected);
    const linkUrl = getFeedItemUrl(selected);
    const feedRecords = await readFeedCommentRecords();
    if (feedRecords[linkId]) {
      await appendAiBotLog("info", "跳过首页推荐帖：已评论过", {
        reason,
        linkId,
        linkTitle: feedDetail.title,
        linkUrl,
        record: feedRecords[linkId],
        actionResult: "skipped",
        skipReason: "already_commented"
      });
      return {
        actionResult: "skipped",
        actionLabel: "已评论过，已跳过",
        skipReason: "already_commented",
        linkId
      };
    }

    const debugInfo = {
      reason,
      strategy,
      linkId,
      linkTitle: feedDetail.title,
      linkUrl,
      linkAuthor: feedDetail.author,
      feedCommentNum: feedDetail.commentNum,
      feedUp: feedDetail.up
    };
    await appendAiBotLog("info", "选中首页推荐帖，获取帖子详情", debugInfo);

    let context;
    try {
      context = await fetchLinkContext(linkId, heyboxId);
    } catch (error) {
      throw createAiBotStageError("查询首页推荐帖详情和评论区", error, debugInfo);
    }
    if (!context) {
      await appendAiBotLog("warn", "跳过首页推荐帖：帖子详情为空", debugInfo);
      return {
        actionResult: "skipped",
        actionLabel: "帖子详情为空，已跳过",
        skipReason: "empty_context",
        linkId
      };
    }
    const authorId = context.detail?.authorId || feedDetail.authorId || "";
    const authorName = context.detail?.author || feedDetail.author || "";

    const emojiCodes = await loadAiBotEmojiCodes(heyboxId);
    let replyResult;
    try {
      replyResult = await createAiBotFeedComment(settings, selected, context, emojiCodes);
    } catch (error) {
      throw createAiBotStageError("生成首页推荐帖评论", error, debugInfo);
    }
    const reply = replyResult?.reply || "";
    if (!reply) {
      await appendAiBotLog("info", "跳过首页推荐帖：内容审查未通过", {
        ...debugInfo,
        moderationReason: replyResult?.moderationReason || "unknown_empty_reply",
        moderationReasonDetail: replyResult?.moderationReasonDetail || "AI 回复为空，但未识别到具体原因",
        modelResponsePreview: replyResult?.modelResponsePreview || ""
      });
      return {
        actionResult: "skipped",
        actionLabel: "内容审查未通过，已跳过",
        skipReason: "content_moderation",
        linkId
      };
    }

    await appendAiBotLog("info", "首页推荐帖评论生成完成，准备发送主评论", {
      ...debugInfo,
      replyPreview: String(reply || "").slice(0, 200),
      replyLength: String(reply || "").length
    });

    let result;
    try {
      result = await submitAiBotComment(heyboxId, linkId, "-1", "-1", reply);
    } catch (error) {
      throw createAiBotStageError("发送首页推荐帖主评论", error, {
        ...debugInfo,
        replyPreview: String(reply || "").slice(0, 200)
      });
    }

    const commentId = result?.commentid || result?.result?.commentid || "";
    const sentTimestamp = Date.now();
    await markFeedCommented(linkId, {
      linkId,
      linkTitle: context.detail?.title || feedDetail.title || "",
      authorId,
      authorName,
      commentId,
      replyPreview: String(reply || "").slice(0, 200),
      reason,
      sentAt: sentTimestamp
    });
    await appendAiBotMessageLog({
      messageId: `feed-${linkId}-${sentTimestamp}`,
      messageSource: AI_BOT_MESSAGE_TYPES.FEED,
      typeLabel: getAiBotMessageTypeLabel(AI_BOT_MESSAGE_TYPES.FEED),
      linkId,
      linkTitle: context.detail?.title || feedDetail.title || "",
      linkUrl,
      commentId,
      accountId: String(heyboxId),
      targetId: authorId ? `id:${authorId}` : "",
      senderId: authorId,
      senderName: authorName,
      messageTimestamp: getFeedItemTimestampMs(selected) || sentTimestamp,
      sentTimestamp,
      sentTimeText: formatLogTime(sentTimestamp),
      messageText: "首页推荐帖主评论",
      triggerText: "首页推荐帖主评论",
      replyText: reply
    });
    await appendAiBotLog("success", "首页推荐帖主评论已发送", {
      ...debugInfo,
      commentId,
      replyPreview: String(reply || "").slice(0, 200)
    });
    return {
      actionResult: "sent",
      actionLabel: "首页推荐帖主评论已发送",
      linkId,
      commentId
    };
  }

  async function processQueueItem(item) {
    const settings = await readAiBotSettings();
    const heyboxId = await getCurrentHeyboxId();
    if (!heyboxId) {
      throw new Error("未登录");
    }

    const typeLabel = getAiBotMessageTypeLabel(item.messageSource);
    if (!isAiBotMessageSourceEnabled(settings, item.messageSource)) {
      await markMessageReplied(item.messageId, {
        skippedAt: Date.now(),
        skipReason: "source_disabled",
        messageSource: item.messageSource
      });
      await appendAiBotLog("info", `队列消息跳过：${typeLabel}回复开关已关闭`, {
        messageId: item.messageId,
        messageSource: item.messageSource,
        linkId: item.linkId,
        replyMentions: settings.replyMentions,
        replyComments: settings.replyComments
      });
      return;
    }
    const message = item.message;
    const context = item.context;
    const replyCommentId = item.replyCommentId;
    const rootCommentId = item.rootCommentId;
    const emojiCodes = item.emojiCodes || [];
    const targetId = item.targetId || getAiBotReplyTargetId(message?.user_a || {});
    const messageDebug = {
      messageId: item.messageId,
      messageSource: item.messageSource,
      linkId: item.linkId,
      targetId,
      senderId: item.senderId,
      senderName: item.senderName,
      queuedAt: item.queuedAt,
      queuedAtText: item.queuedAt ? formatLogTime(item.queuedAt) : "",
      queueAge: Math.floor((Date.now() - item.queuedAt) / 1000),
      replyCommentId,
      rootCommentId: rootCommentId || replyCommentId,
      messageText: item.messageText || ""
    };

    const matchedKeyword = getRejectedReplyKeywordMatch(settings, message);
    if (matchedKeyword) {
      await markMessageReplied(item.messageId, {
        skippedAt: Date.now(),
        skipReason: "rejected_keyword",
        matchedKeyword,
        messageSource: item.messageSource
      });
      await appendAiBotMessageLog({
        skipped: true,
        skipReason: "rejected_keyword",
        matchedKeyword,
        messageId: item.messageId,
        messageSource: item.messageSource,
        typeLabel,
        linkId: item.linkId,
        linkTitle: context.detail?.title || "",
        linkUrl: getLinkUrl(item.linkId),
        replyCommentId,
        rootCommentId: rootCommentId || replyCommentId,
        targetId,
        senderId: item.senderId,
        senderName: item.senderName,
        messageText: item.messageText || "",
        messageTimestamp: getMessageTimestampMs(message),
        triggerText: item.messageText || "",
        replyText: `命中拒绝回复关键词「${matchedKeyword}」`
      });
      await appendAiBotLog("info", `队列消息命中拒绝回复关键词「${matchedKeyword}」，已跳过`, {
        ...messageDebug,
        skipReason: "rejected_keyword",
        matchedKeyword
      });
      return;
    }

    if (targetId) {
      const targetUsage = await getReplyTargetUsage(item.linkId, targetId, settings.replyLimitPerLinkUser);
      if (targetUsage.sentCount >= targetUsage.limit) {
        await markMessageReplied(item.messageId, {
          skippedAt: Date.now(),
          skipReason: "reply_target_limit",
          messageSource: item.messageSource,
          linkId: item.linkId,
          targetId,
          sentCount: targetUsage.sentCount,
          queuedCount: targetUsage.queuedCount,
          limit: targetUsage.limit
        });
        await appendAiBotMessageLog({
          skipped: true,
          skipReason: "reply_target_limit",
          messageId: item.messageId,
          messageSource: item.messageSource,
          typeLabel,
          linkId: item.linkId,
          linkTitle: context.detail?.title || "",
          linkUrl: getLinkUrl(item.linkId),
          replyCommentId,
          rootCommentId: rootCommentId || replyCommentId,
          targetId,
          senderId: item.senderId,
          senderName: item.senderName,
          messageText: item.messageText || "",
          messageTimestamp: getMessageTimestampMs(message),
          triggerText: item.messageText || "",
          replyText: `同一个帖子下同一个人最多回复 ${targetUsage.limit} 次`
        });
        await appendAiBotLog("info", `队列消息跳过：同帖同人回复已达到 ${targetUsage.limit} 次`, {
          ...messageDebug,
          skipReason: "reply_target_limit",
          sentCount: targetUsage.sentCount,
          queuedCount: targetUsage.queuedCount,
          limit: targetUsage.limit,
          record: targetUsage.record || ""
        });
        return;
      }
    }

    const duplicateSentLog = await findSentReplyCommentMessageLog(item.linkId, replyCommentId);
    if (duplicateSentLog) {
      await markMessageReplied(item.messageId, {
        skippedAt: Date.now(),
        skipReason: "reply_comment_duplicate",
        messageSource: item.messageSource,
        linkId: item.linkId,
        replyCommentId,
        duplicateSource: "sent",
        duplicateMessageId: duplicateSentLog.messageId || ""
      });
      await appendAiBotMessageLog({
        skipped: true,
        skipReason: "reply_comment_duplicate",
        messageId: item.messageId,
        messageSource: item.messageSource,
        typeLabel,
        linkId: item.linkId,
        linkTitle: context.detail?.title || "",
        linkUrl: getLinkUrl(item.linkId),
        replyCommentId,
        rootCommentId: rootCommentId || replyCommentId,
        targetId,
        senderId: item.senderId,
        senderName: item.senderName,
        messageText: item.messageText || "",
        messageTimestamp: getMessageTimestampMs(message),
        triggerText: item.messageText || "",
        replyText: "同一条评论已由另一条消息回复"
      });
      await appendAiBotLog("info", "队列消息跳过：同一条评论已回复过", {
        ...messageDebug,
        skipReason: "reply_comment_duplicate",
        duplicateMessageId: duplicateSentLog.messageId || ""
      });
      return;
    }

    await appendAiBotLog("info", `队列消息开始处理：${typeLabel}`, messageDebug);
    let replyResult;
    try {
      replyResult = await createAiBotReply(settings, heyboxId, message, context, replyCommentId, item.messageSource, emojiCodes);
    } catch (error) {
      throw createAiBotStageError("生成AI回复", error, messageDebug);
    }
    const reply = replyResult?.reply || "";
    if (!reply) {
      await markMessageReplied(item.messageId, {
        skippedAt: Date.now(),
        skipReason: "content_moderation",
        messageSource: item.messageSource,
        moderationReason: replyResult?.moderationReason || "unknown_empty_reply"
      });
      await appendAiBotLog("info", `队列消息跳过：内容审查未通过`, {
        ...messageDebug,
        moderationReason: replyResult?.moderationReason || "unknown_empty_reply",
        moderationReasonDetail: replyResult?.moderationReasonDetail || "AI 回复为空，但未识别到具体原因",
        modelResponsePreview: replyResult?.modelResponsePreview || ""
      });
      return;
    }
    await appendAiBotLog("info", "队列消息生成回复完成，准备发送", {
      ...messageDebug,
      replyPreview: String(reply || "").slice(0, 200),
      replyLength: String(reply || "").length
    });

    let result;
    try {
      result = await submitAiBotComment(heyboxId, item.linkId, replyCommentId, rootCommentId || replyCommentId, reply);
    } catch (error) {
      throw createAiBotStageError("发送评论回复", error, {
        ...messageDebug,
        rootCommentId,
        replyPreview: String(reply || "").slice(0, 200)
      });
    }
    await markMessageReplied(item.messageId, {
      linkId: item.linkId,
      replyCommentId,
      targetId,
      commentId: result?.commentid || result?.result?.commentid || ""
    });
    await markReplyTargetSent(item.linkId, targetId, {
      messageId: item.messageId,
      messageSource: item.messageSource,
      replyCommentId,
      rootCommentId: rootCommentId || replyCommentId,
      senderId: item.senderId,
      senderName: item.senderName,
      commentId: result?.commentid || result?.result?.commentid || ""
    });
    const messageTimestamp = getMessageTimestampMs(message);
    const sentTimestamp = Date.now();
    await appendAiBotMessageLog({
      messageId: item.messageId,
      messageSource: item.messageSource,
      typeLabel,
      linkId: item.linkId,
      linkTitle: context.detail?.title || "",
      linkUrl: getLinkUrl(item.linkId),
      replyCommentId,
      rootCommentId: rootCommentId || replyCommentId,
      commentId: result?.commentid || result?.result?.commentid || "",
      accountId: String(heyboxId),
      targetId,
      senderId: item.senderId,
      senderName: item.senderName,
      messageText: item.messageText || "",
      messageTimestamp,
      messageTimeText: messageTimestamp ? formatLogTime(messageTimestamp) : "",
      sentTimestamp,
      sentTimeText: formatLogTime(sentTimestamp),
      triggerText: item.messageText || "",
      replyText: reply
    });
    await appendAiBotLog("success", `队列消息已回复${typeLabel}`, {
      ...messageDebug,
      commentId: result?.commentid || result?.result?.commentid || "",
      replyPreview: String(reply || "").slice(0, 200)
    });
  }

  async function runAiBotQueueConsumer() {
    if (aiBotQueueProcessing) {
      return;
    }
    aiBotQueueProcessing = true;
    try {
      if (!await hasAiBotConsent()) {
        return;
      }
      const settings = await readAiBotSettings();
      if (!settings.enabled) {
        return;
      }

      const queueStatus = await getQueueStatus();
      if (queueStatus.count === 0) {
        return;
      }

      await appendAiBotLog("info", "开始处理队列消息", { queueCount: queueStatus.count });

      while (true) {
        const queue = await readReplyQueue();
        if (!queue.length) {
          break;
        }

        const settings = await readAiBotSettings();
        if (!settings.enabled) {
          break;
        }

        const item = await dequeueReplyMessage();
        if (!item) {
          break;
        }
        await appendAiBotLog("info", "队列消息已取出", {
          messageId: item.messageId,
          messageSource: item.messageSource,
          linkId: item.linkId,
          senderId: item.senderId,
          senderName: item.senderName,
          queuedAt: item.queuedAt ? formatLogTime(item.queuedAt) : "",
          queueAgeSeconds: Math.floor((Date.now() - Number(item.queuedAt || 0)) / 1000)
        });

        const itemAge = Date.now() - item.queuedAt;
        const itemMessageAge = item.messageTimestamp ? Date.now() - item.messageTimestamp : 0;
        const freshMs = Math.max(1, Number(settings.messageFreshMinutes || 5)) * 60 * 1000;
        if (itemAge >= freshMs || (itemMessageAge && itemMessageAge > freshMs)) {
          await markMessageReplied(item.messageId, {
            skippedAt: Date.now(),
            skipReason: "queue_expired",
            messageSource: item.messageSource,
            queueAge: Math.floor(itemAge / 1000)
          });
          await appendAiBotLog("info", "跳过过期队列消息", {
            messageId: item.messageId,
            queueAgeMinutes: Math.floor(itemAge / 60000),
            messageAgeMinutes: itemMessageAge ? Math.floor(itemMessageAge / 60000) : "",
            freshMinutes: settings.messageFreshMinutes
          });
          continue;
        }

        try {
          await processQueueItem(item);
        } catch (error) {
          await appendAiBotLog("error", "处理队列消息失败", {
            messageId: item.messageId,
            stage: error?.aiBotStage || "处理队列消息",
            error: error?.message || "未知错误",
            ...(error?.aiBotDetail || {})
          });
        }

        const remaining = await readReplyQueue();
        if (remaining.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, AI_BOT_COMMENT_COOLDOWN_MS));
        }
      }

      const finalStatus = await getQueueStatus();
      await appendAiBotLog("info", "队列处理完成", { remainingCount: finalStatus.count });
    } catch (error) {
      await appendAiBotLog("error", "队列消费任务失败", {
        error: error?.message || "未知错误"
      });
    } finally {
      aiBotQueueProcessing = false;
    }
  }

  let aiBotFeedRunning = false;

  async function runAiBotFeedComment() {
    if (aiBotFeedRunning) {
      return { ok: true, skipped: true };
    }

    aiBotFeedRunning = true;
    try {
      if (!await hasAiBotConsent()) {
        return { ok: false, error: "尚未确认 AI Bot 风险授权" };
      }
      const settings = await readAiBotSettings();
      if (!settings.enabled || !settings.commentHomeFeed) {
        return { ok: true, disabled: true };
      }
      if (!settings.baseUrl || !settings.model) {
        return { ok: false, error: "AI 参数未配置完整" };
      }

      const heyboxId = await getCurrentHeyboxId();
      if (!heyboxId) {
        return { ok: false, error: "未登录" };
      }

      const cooldown = await getAiBotFeedCommentCooldown(settings);
      if (cooldown.waitMs > 0) {
        await appendAiBotLog("info", "跳过首页推荐帖：未到自动暖贴间隔", {
          waitSeconds: Math.ceil(cooldown.waitMs / 1000),
          intervalMinutes: Math.floor(cooldown.intervalMs / 60000),
          lastFeedTime: cooldown.lastFeedAt ? formatLogTime(cooldown.lastFeedAt) : ""
        });
        return {
          ok: true,
          skipped: true,
          reason: "feed_cooldown",
          waitMs: cooldown.waitMs
        };
      }
      await markAiBotFeedCommentAttempt();

      const result = await processAiBotHomeFeedComment(settings, heyboxId, "feed-alarm");
      if (result?.actionResult === "sent") {
        await markAiBotFeedCommentSent();
      }
      return { ok: true, result };
    } catch (error) {
      await appendAiBotLog("error", "首页推荐帖评论定时任务失败", {
        error: error?.message || "未知错误"
      });
      return { ok: false, error: error?.message || "首页推荐帖评论失败" };
    } finally {
      aiBotFeedRunning = false;
    }
  }

  async function runAiBotPoll(reason = "alarm") {
    if (aiBotRunning) {
      return { ok: true, skipped: true };
    }

    aiBotRunning = true;
    try {
      if (!await hasAiBotConsent()) {
        return { ok: false, error: "尚未确认 AI Bot 风险授权" };
      }
      const settings = await readAiBotSettings();
      if (!settings.enabled) {
        return { ok: true, disabled: true };
      }
      if (!settings.baseUrl || !settings.model) {
        await appendAiBotLog("warn", "AI Bot 已开启，但 AI 参数未配置完整");
        return { ok: false, error: "AI 参数未配置完整" };
      }
      if (!settings.replyMentions && !settings.replyComments) {
        await appendAiBotLog("warn", "回复 @ 和回复评论两个开关均未开启");
        return { ok: true, disabledSources: true };
      }

      const apiParams = await refreshCachedApiParams();
      if (!apiParams.device_id) {
        await appendAiBotLog("warn", "未捕获到小黑盒真实 device_id，将使用默认网页参数请求；打开一次小黑盒页面后会自动缓存真实参数");
      }

      const heyboxId = await getCurrentHeyboxId();
      if (!heyboxId) {
        await stopAiBotForLoginExpired("无法读取 heybox_id Cookie");
        return { ok: false, error: "未登录" };
      }

      const mentionMessages = settings.replyMentions ? await fetchMentionMessages(heyboxId) : [];
      const commentMessages = settings.replyComments ? await fetchCommentMessages(heyboxId) : [];
      const messages = [
        ...mentionMessages.map((message) => ({ message, source: AI_BOT_MESSAGE_TYPES.MENTION })),
        ...commentMessages.map((message) => ({ message, source: AI_BOT_MESSAGE_TYPES.COMMENT }))
      ];
      const records = await readRepliedRecords();
      const enqueuedMessages = [];
      const mentionResults = [];
      const commentResults = [];
      for (const item of messages) {
        const sourceResults = item.source === AI_BOT_MESSAGE_TYPES.COMMENT ? commentResults : mentionResults;
        try {
          const latestSettings = await readAiBotSettings();
          if (!latestSettings.enabled) {
            await appendAiBotLog("info", "回复开关已全部关闭，停止处理本次轮询消息");
            sourceResults.push(createAiBotPollResultItem(item.message, item.source, {
              actionResult: "stopped",
              actionLabel: "回复开关已全部关闭，停止处理",
              skipReason: "bot_disabled"
            }));
            break;
          }
          const staleDetail = await skipStaleAiBotMessage(latestSettings, item.message, records, item.source, {
            ...getAiBotMessageDebugInfo(item.message),
            messageSource: item.source
          }, { collectOnly: true });
          if (staleDetail) {
            sourceResults.push(createAiBotPollResultItem(item.message, item.source, {
              actionResult: "skipped",
              actionLabel: "超过时间窗口，已跳过",
              skipReason: "stale"
            }));
            continue;
          }
          const rejectedKeywordDetail = await skipRejectedKeywordAiBotMessage(
            latestSettings,
            item.message,
            records,
            item.source,
            { collectOnly: true }
          );
          if (rejectedKeywordDetail) {
            sourceResults.push(createAiBotPollResultItem(item.message, item.source, {
              actionResult: "skipped",
              actionLabel: `命中拒绝回复关键词「${rejectedKeywordDetail.matchedKeyword}」，已跳过`,
              skipReason: "rejected_keyword"
            }));
            continue;
          }
          if (!isAiBotMessageSourceEnabled(latestSettings, item.source)) {
            await appendAiBotLog("info", `轮询消息跳过：${getAiBotMessageTypeLabel(item.source)}回复开关已关闭`, {
              ...getAiBotMessageDebugInfo(item.message),
              messageSource: item.source,
              replyMentions: latestSettings.replyMentions,
              replyComments: latestSettings.replyComments
            });
            sourceResults.push(createAiBotPollResultItem(item.message, item.source, {
              actionResult: "skipped",
              actionLabel: "对应回复开关已关闭，已跳过",
              skipReason: "source_disabled"
            }));
            continue;
          }
          const result = await processAiBotMessage(latestSettings, heyboxId, item.message, records, item.source);
          sourceResults.push(createAiBotPollResultItem(item.message, item.source, result));
          if (result?.actionResult === "enqueued") {
            enqueuedMessages.push(getAiBotMessageDebugInfo(item.message));
          }
        } catch (error) {
          sourceResults.push(createAiBotPollResultItem(item.message, item.source, {
            actionResult: "error",
            actionLabel: "处理失败",
            error: error?.message || "未知错误"
          }));
          await appendAiBotLog("error", "处理 AI Bot 消息失败", {
            ...getAiBotMessageDebugInfo(item.message),
            messageSource: item.source,
            stage: error?.aiBotStage || "处理 AI Bot 消息",
            error: error?.message || "未知错误",
            ...(error?.aiBotDetail || {})
          });
        }
      }
      await appendAiBotQuerySummaryLog(AI_BOT_MESSAGE_TYPES.MENTION, settings.replyMentions, mentionMessages, mentionResults, {
        reason,
        replyMentions: settings.replyMentions
      });
      await appendAiBotQuerySummaryLog(AI_BOT_MESSAGE_TYPES.COMMENT, settings.replyComments, commentMessages, commentResults, {
        reason,
        replyComments: settings.replyComments
      });
      if (enqueuedMessages.length) {
        await appendAiBotLog("info", `本次查询新增入队消息：${enqueuedMessages.length} 条`, {
          messages: enqueuedMessages.slice(0, 20)
        });
      }

      const queueStatus = await getQueueStatus();
      if (queueStatus.count > 0) {
        runAiBotQueueConsumer().catch(() => {});
      }

      return { ok: true, count: messages.length, queued: queueStatus.count };
    } catch (error) {
      await appendAiBotLog("error", "AI Bot 轮询失败", {
        stage: "轮询入口",
        error: error?.message || "未知错误",
        errorStack: String(error?.stack || "").split("\n").slice(0, 4).join("\n")
      });
      return { ok: false, error: error?.message || "AI Bot 轮询失败" };
    } finally {
      aiBotRunning = false;
    }
  }

