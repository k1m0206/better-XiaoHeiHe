// AI Bot 小黑盒接口请求和 emoji 缓存。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  async function fetchAiBotJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      referrer: WEB_ORIGIN + "/",
      headers: {
        "accept": "application/json",
        "accept-language": "zh,zh-CN;q=0.9",
        ...(options.headers || {})
      }
    });
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(`请求失败：${response.status}`);
    }
    return data;
  }

  function getAiBotApiErrorMessage(data, fallback) {
    return [
      data?.message,
      data?.msg,
      data?.error,
      data?.status && data.status !== "ok" ? `status=${data.status}` : "",
      fallback
    ].filter(Boolean).map((item) => String(item)).join("；") || fallback;
  }

  function sanitizeAiBotLogUrl(url) {
    try {
      const parsed = new URL(url);
      ["hkey", "nonce", "_time"].forEach((key) => {
        if (parsed.searchParams.has(key)) {
          parsed.searchParams.set(key, "***");
        }
      });
      return parsed.toString();
    } catch (_) {
      return String(url || "");
    }
  }

  function maskAiBotCommentBody(body) {
    const params = new URLSearchParams(body);
    const text = params.get("text") || "";
    if (text) {
      params.set("text", `${text.slice(0, 80)}${text.length > 80 ? "..." : ""}`);
    }
    return params.toString();
  }

  function buildMessageListUrl(heyboxId, options = {}) {
    const params = {
      list_type: "0",
      offset: "0",
      limit: String(AI_BOT_MESSAGE_LIMIT),
      heybox_id: heyboxId
    };
    if (options.messageType) {
      params.message_type = String(options.messageType);
    } else {
      params.no_more = "false";
    }
    return buildApiUrl(MESSAGE_API_PATH, params);
  }

  function buildFeedsUrl(heyboxId) {
    return buildApiUrl(FEEDS_API_PATH, {
      pull: "0",
      offset: "0",
      heybox_id: heyboxId
    });
  }

  function buildLinkTreeUrl(linkId, heyboxId) {
    return buildApiUrl(LINK_TREE_API_PATH, {
      h_src: "",
      link_id: linkId,
      is_first: "1",
      page: "1",
      index: "1",
      limit: "20",
      owner_only: "0",
      heybox_id: heyboxId
    });
  }

  function buildCommentCreateUrl(heyboxId) {
    return buildApiUrl(COMMENT_CREATE_API_PATH, {
      heybox_id: heyboxId
    });
  }

  function buildEmojiListUrl(heyboxId) {
    return buildApiUrl(EMOJI_API_PATH, {
      heybox_id: heyboxId
    });
  }

  function isLoginExpiredResponse(data) {
    const text = `${data?.status || ""} ${data?.msg || ""} ${data?.message || ""} ${data?.error || ""}`;
    return data?.status === "unauthorized"
      || data?.status === "login_required"
      || /登录|login|unauthorized|401/i.test(text);
  }

  async function fetchMentionMessages(heyboxId) {
    const data = await fetchAiBotJson(buildMessageListUrl(heyboxId, { messageType: "16" }));
    if (data?.status !== "ok") {
      if (isLoginExpiredResponse(data)) {
        await stopAiBotForLoginExpired(data?.message || data?.msg || data?.status);
        return [];
      }
      throw new Error(getAiBotApiErrorMessage(data, "消息查询失败"));
    }
    return Array.isArray(data?.result?.messages) ? data.result.messages : [];
  }

  async function fetchCommentMessages(heyboxId) {
    const data = await fetchAiBotJson(buildMessageListUrl(heyboxId));
    if (data?.status !== "ok") {
      if (isLoginExpiredResponse(data)) {
        await stopAiBotForLoginExpired(data?.message || data?.msg || data?.status);
        return [];
      }
      throw new Error(getAiBotApiErrorMessage(data, "评论消息查询失败"));
    }
    return (Array.isArray(data?.result?.messages) ? data.result.messages : [])
      .filter((message) => ["1", "2"].includes(String(message?.message_type || "")))
      .filter((message) => getLinkIdFromMessage(message) && getReplyCommentIdFromMessage(message));
  }

  async function fetchHomeFeedLinks(heyboxId) {
    const data = await fetchAiBotJson(buildFeedsUrl(heyboxId));
    if (data?.status !== "ok") {
      if (isLoginExpiredResponse(data)) {
        await stopAiBotForLoginExpired(data?.message || data?.msg || data?.status);
        return [];
      }
      throw new Error(getAiBotApiErrorMessage(data, "首页推荐帖子查询失败"));
    }
    return Array.isArray(data?.result?.links) ? data.result.links : [];
  }

  async function fetchLinkContext(linkId, heyboxId) {
    const data = await fetchAiBotJson(buildLinkTreeUrl(linkId, heyboxId));
    if (data?.status !== "ok") {
      if (isLoginExpiredResponse(data)) {
        await stopAiBotForLoginExpired(data?.message || data?.msg || data?.status);
        return null;
      }
      throw new Error(getAiBotApiErrorMessage(data, "帖子详情查询失败"));
    }
    const groups = normalizeCommentGroups(data);
    return {
      detail: getLinkDetail(data),
      groups
    };
  }

  function normalizeAiBotEmojiCodes(data) {
    const groups = Array.isArray(data?.result?.emoji_groups) ? data.result.emoji_groups : [];
    const codes = [];
    groups.forEach((group) => {
      const groupCode = String(group.group_code || group.group_name || "").trim();
      const emojis = Array.isArray(group.emojis) ? group.emojis : [];
      emojis.forEach((emoji) => {
        const code = String(emoji?.code || emoji?.name || "").trim();
        if (!code) {
          return;
        }
        codes.push(groupCode ? `[${groupCode}_${code.replace(/^cube_/, "")}]` : `[${code}]`);
      });
    });
    return [...new Set(codes)].filter((code) => /^\[[^\]\r\n]{1,40}\]$/.test(code));
  }

  async function loadAiBotEmojiCodes(heyboxId) {
    if (aiBotEmojiCodes.length) {
      return aiBotEmojiCodes;
    }
    if (aiBotEmojiPromise) {
      return aiBotEmojiPromise;
    }
    aiBotEmojiPromise = storageGet(AI_BOT_EMOJI_CODES_STORAGE_KEY)
      .then((result) => {
        const cache = result[AI_BOT_EMOJI_CODES_STORAGE_KEY];
        const codes = Array.isArray(cache?.codes) ? cache.codes.filter((code) => /^\[[^\]\r\n]{1,40}\]$/.test(String(code || ""))) : [];
        const updatedAt = Number(cache?.updatedAt || 0);
        if (codes.length) {
          aiBotEmojiCodes = codes;
        }
        if (codes.length && updatedAt >= Date.now() - AI_BOT_EMOJI_CACHE_TTL_MS) {
          return codes;
        }
        return fetchAiBotJson(buildEmojiListUrl(heyboxId)).then((data) => {
          if (data?.status === "ok") {
            aiBotEmojiCodes = normalizeAiBotEmojiCodes(data);
            storageSet({
              [AI_BOT_EMOJI_CODES_STORAGE_KEY]: {
                codes: aiBotEmojiCodes,
                updatedAt: Date.now()
              }
            });
          }
          return aiBotEmojiCodes;
        });
      })
      .then((data) => {
        aiBotEmojiCodes = Array.isArray(data) ? data : aiBotEmojiCodes;
        return aiBotEmojiCodes;
      })
      .catch(() => aiBotEmojiCodes)
      .finally(() => {
        aiBotEmojiPromise = null;
      });
    return aiBotEmojiPromise;
  }

