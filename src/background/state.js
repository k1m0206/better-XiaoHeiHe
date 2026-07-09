// 后台常量、设置归一化、storage、模型缓存和 action 入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const AI_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-settings";
  const AI_MODEL_CACHE_STORAGE_KEY = "better-xiaoheihe-ai-model-cache";
  const AI_BOT_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-settings";
  const AI_BOT_CONSENT_STORAGE_KEY = "better-xiaoheihe-ai-bot-consent";
  const AI_BOT_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-logs";
  const AI_BOT_MESSAGE_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-message-logs";
  const AI_BOT_EMOJI_CODES_STORAGE_KEY = "better-xiaoheihe-ai-bot-emoji-codes";
  const AI_BOT_REPLIED_RECORDS_STORAGE_KEY = "better-xiaoheihe-ai-bot-replied-records";
  const AI_BOT_FEED_COMMENT_RECORDS_STORAGE_KEY = "better-xiaoheihe-ai-bot-feed-comment-records";
  const AI_BOT_REPLY_TARGET_RECORDS_STORAGE_KEY = "better-xiaoheihe-ai-bot-reply-target-records";
  const AI_BOT_REPLY_QUEUE_STORAGE_KEY = "better-xiaoheihe-ai-bot-reply-queue";
  const AI_BOT_RUNTIME_STORAGE_KEY = "better-xiaoheihe-ai-bot-runtime";
  const API_PARAMS_STORAGE_KEY = "better-xiaoheihe-api-params";
  const AI_BOT_ALARM_NAME = "better-xiaoheihe-ai-bot-poll";
  const AI_BOT_FEED_ALARM_NAME = "better-xiaoheihe-ai-bot-feed";
  const AI_BOT_QUEUE_ALARM_NAME = "better-xiaoheihe-ai-bot-queue";
  const AI_BOT_LOG_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
  const AI_BOT_EMOJI_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const AI_BOT_COMMENT_COOLDOWN_MS = 30 * 1000;
  const AI_BOT_QUEUE_MAX_SIZE = 50;
  const AI_BOT_MESSAGE_LIMIT = 20;
  const AI_BOT_COMMENT_LIMIT = 30;
  const AI_BOT_MIN_FEED_POLL_MINUTES = 10;
  const AI_BOT_FEED_COOLDOWN_TOLERANCE_MS = 5000;
  const AI_BOT_DEFAULT_REPLY_LIMIT_PER_LINK_USER = 5;
  const AI_BOT_DEFAULT_GLOBAL_HISTORY_LIMIT = 20;
  const AI_BOT_MAX_GLOBAL_HISTORY_LIMIT = 100;
  const AI_BOT_DEFAULT_PROMPT = "你是小黑盒社区自动回复助手。请根据消息类型、帖子正文、评论区上下文和触发消息的那条评论，生成一条自然、友好、简洁的中文回复。不要使用模板化开头，不要编造事实，不要输出Markdown。如果触发消息的评论内容只有表情（没有文字，表情数量可以是多个），那么你只回复一个表情，不要添加任何文字。";
  const AI_BOT_DEFAULT_FEED_PROMPT = "你是小黑盒社区暖贴助手。请根据帖子标题、正文和话题，生成一条自然、真实、简洁的中文评论，像普通用户浏览帖子后留下的感想。不要使用模板化开头，不要编造未提供的信息，不要输出Markdown。";
  const AI_BOT_BUILTIN_MODERATION_PROMPT = "\n\n[系统内置审查规则 - 不可关闭]：\n在生成回复前，必须同时审查触发消息的评论内容和你将要生成的回复内容。遇到以下情况时，直接返回 [REFUSE] 标记（不要返回其他任何内容）：\n- 违反中国法律法规的内容（涉政敏感、分裂国家、损害国家荣誉和利益等）\n- 违反社会主义核心价值观的内容\n- 涉黄、涉暴、涉恐、涉赌、涉毒等违法内容\n- 侮辱、诽谤、人身攻击、网络暴力、不礼貌的言论\n- 歧视性内容（地域歧视、性别歧视、种族歧视等）\n- 散布谣言、虚假信息、误导性内容\n- 不道德、低俗、恶俗、有悖公序良俗的内容\n- 涉及未成年人不良内容\n- 政治敏感话题、时政评论、涉及领导人或国家政策的讨论\n如果触发消息的评论本身包含上述违规内容，也直接返回 [REFUSE]。";
  const AI_BOT_MESSAGE_TYPES = {
    MENTION: "mention",
    COMMENT: "comment",
    FEED: "feed"
  };
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const AI_PROVIDERS = {
    OPENAI_COMPATIBLE: "openai-compatible",
    OPENAI_RESPONSES: "openai-responses",
    ANTHROPIC: "anthropic",
    GEMINI: "gemini"
  };
  const DEFAULT_PROVIDER = AI_PROVIDERS.OPENAI_COMPATIBLE;
  const PROVIDER_DEFAULT_BASE_URLS = {
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: "https://api.openai.com/v1",
    [AI_PROVIDERS.OPENAI_RESPONSES]: "https://api.openai.com/v1",
    [AI_PROVIDERS.ANTHROPIC]: "https://api.anthropic.com/v1",
    [AI_PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta"
  };
  const API_ORIGIN = "https://api.xiaoheihe.cn";
  const WEB_ORIGIN = "https://www.xiaoheihe.cn";
  const MESSAGE_API_PATH = "/bbs/app/user/message";
  const FEEDS_API_PATH = "/bbs/app/feeds";
  const LINK_TREE_API_PATH = "/bbs/app/link/tree";
  const COMMENT_CREATE_API_PATH = "/bbs/app/comment/create";
  const EMOJI_API_PATH = "/bbs/app/api/emojis/list";
  const SANITIZED_COMMENT_COOKIE_RULE_ID = 101;
  const AI_BOT_COMMENT_HEADER_RULE_ID = 102;
  const sanitizedCommentCookieRules = new Map();
  let sanitizedCommentCookieRuleQueue = Promise.resolve();
  let aiBotRunning = false;
  let aiBotCommentQueue = Promise.resolve();
  let cachedApiParams = {};
  let aiBotEmojiCodes = [];
  let aiBotEmojiPromise = null;

  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_PROVIDER;
  }

  function normalizeBaseUrl(baseUrl, provider) {
    return String(baseUrl || PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, "");
  }

  function normalizeAiSettings(settings) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: normalizeBaseUrl(settings?.baseUrl, provider),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      allowEmoji: settings?.allowEmoji !== false,
      autoPopup: settings?.autoPopup !== false,
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function normalizeIdList(value) {
    return [...new Set((Array.isArray(value) ? value : String(value || "").split(/[\s,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter(Boolean))];
  }

  function normalizeKeywordList(value) {
    const seen = new Set();
    return (Array.isArray(value) ? value : String(value || "").split(/[\r\n,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter((item) => {
        const normalized = item.toLocaleLowerCase();
        if (!normalized || seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  }

  function normalizeAiBotSettings(settings) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    const isEnabled = settings?.enabled === true;
    const replyMentions = isEnabled && settings?.replyMentions !== false;
    const replyComments = isEnabled && settings?.replyComments === true;
    const commentHomeFeed = isEnabled && settings?.commentHomeFeed === true;
    return {
      enabled: replyMentions || replyComments || commentHomeFeed,
      provider,
      endpointMode: provider,
      baseUrl: normalizeBaseUrl(settings?.baseUrl, provider),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      pollMinutes: Math.max(1, Number.parseInt(settings?.pollMinutes, 10) || 1),
      feedPollMinutes: Math.max(AI_BOT_MIN_FEED_POLL_MINUTES, Number.parseInt(settings?.feedPollMinutes, 10) || AI_BOT_MIN_FEED_POLL_MINUTES),
      messageFreshMinutes: Math.max(1, Number.parseInt(settings?.messageFreshMinutes, 10) || 5),
      replyLimitPerLinkUser: Math.max(1, Number.parseInt(settings?.replyLimitPerLinkUser, 10) || AI_BOT_DEFAULT_REPLY_LIMIT_PER_LINK_USER),
      globalHistoryEnabled: settings?.globalHistoryEnabled !== false,
      globalHistoryLimit: Math.min(
        AI_BOT_MAX_GLOBAL_HISTORY_LIMIT,
        Math.max(1, Number.parseInt(settings?.globalHistoryLimit, 10) || AI_BOT_DEFAULT_GLOBAL_HISTORY_LIMIT)
      ),
      replyMentions,
      replyComments,
      commentHomeFeed,
      feedSelectStrategy: ["first", "latest", "hot"].includes(settings?.feedSelectStrategy) ? settings.feedSelectStrategy : "first",
      whitelistUserIds: normalizeIdList(settings?.whitelistUserIds || settings?.whitelistText),
      rejectedReplyKeywords: normalizeKeywordList(settings?.rejectedReplyKeywords || settings?.rejectedReplyKeywordsText),
      allowEmoji: settings?.allowEmoji !== false,
      commentPrompt: String(settings?.commentPrompt || "").trim() || AI_BOT_DEFAULT_PROMPT,
      feedCommentPrompt: String(settings?.feedCommentPrompt || "").trim() || AI_BOT_DEFAULT_FEED_PROMPT
    };
  }

  function storageGet(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => resolve(result || {}));
    });
  }

  function storageSet(values) {
    return new Promise((resolve) => {
      chrome.storage.local.set(values, resolve);
    });
  }

  function storageRemove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, resolve);
    });
  }

  async function readAiBotSettings() {
    const result = await storageGet(AI_BOT_SETTINGS_STORAGE_KEY);
    return normalizeAiBotSettings(result[AI_BOT_SETTINGS_STORAGE_KEY]);
  }

  async function writeAiBotSettings(settings) {
    const normalized = normalizeAiBotSettings(settings);
    await storageSet({ [AI_BOT_SETTINGS_STORAGE_KEY]: normalized });
    return normalized;
  }

  function formatLogTime(timestamp) {
    try {
      return new Date(timestamp).toLocaleString("zh-CN", { hour12: false });
    } catch {
      return "";
    }
  }

  async function appendAiBotLog(level, message, detail = {}) {
    const now = Date.now();
    const result = await storageGet(AI_BOT_LOGS_STORAGE_KEY);
    const currentLogs = Array.isArray(result[AI_BOT_LOGS_STORAGE_KEY]) ? result[AI_BOT_LOGS_STORAGE_KEY] : [];
    const logs = [
      {
        id: `${now}-${Math.random().toString(16).slice(2)}`,
        timestamp: now,
        timeText: formatLogTime(now),
        level: ["error", "warn", "success"].includes(level) ? level : "info",
        message: String(message || ""),
        detail: detail && typeof detail === "object" ? detail : {}
      },
      ...currentLogs.filter((item) => !item?.skipped && Number(item?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
    ].slice(0, 500);
    await storageSet({ [AI_BOT_LOGS_STORAGE_KEY]: logs });
  }

  async function appendAiBotMessageLog(entry = {}) {
    const now = Date.now();
    const result = await storageGet(AI_BOT_MESSAGE_LOGS_STORAGE_KEY);
    const currentLogs = Array.isArray(result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY])
      ? result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]
      : [];
    const logs = [
      {
        id: `${now}-${Math.random().toString(16).slice(2)}`,
        timestamp: now,
        timeText: formatLogTime(now),
        ...entry
      },
      ...currentLogs.filter((item) => Number(item?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
    ].slice(0, 500);
    await storageSet({ [AI_BOT_MESSAGE_LOGS_STORAGE_KEY]: logs });
  }

  function notifyAiBotLoginExpired() {
    if (!chrome.notifications?.create) {
      return;
    }

    chrome.notifications.create("better-xiaoheihe-ai-bot-login-expired", {
      type: "basic",
      iconUrl: "assets/icons/icon128.png",
      title: "AI Bot 已停止",
      message: "小黑盒登录状态已过期，请重新登录后再开启 AI Bot。"
    });
  }

  async function hasAiBotConsent() {
    const result = await storageGet(AI_BOT_CONSENT_STORAGE_KEY);
    return result[AI_BOT_CONSENT_STORAGE_KEY] === true;
  }

  function notifyAiBotCommentFailures() {
    if (!chrome.notifications?.create) {
      return;
    }

    chrome.notifications.create("better-xiaoheihe-ai-bot-comment-failures", {
      type: "basic",
      iconUrl: "assets/icons/icon128.png",
      title: "AI Bot 已自动停止",
      message: "自动评论连续发送失败 3 次，请检查小黑盒账号登录状态或账号限制后再重新开启。"
    });
  }

  async function stopAiBotForLoginExpired(reason) {
    const settings = await readAiBotSettings();
    await writeAiBotSettings({ ...settings, enabled: false });
    await clearAiBotAlarm();
    await appendAiBotLog("error", "登录状态过期，AI Bot 已停止", { reason });
    notifyAiBotLoginExpired();
  }

  async function stopAiBotForCommentFailures(reason) {
    const settings = await readAiBotSettings();
    await writeAiBotSettings({
      ...settings,
      enabled: false,
      replyMentions: false,
      replyComments: false,
      commentHomeFeed: false
    });
    await clearAiBotAlarm();
    await appendAiBotLog("error", "自动评论连续发送失败 3 次，AI 回复和暖贴已停止", { reason });
    notifyAiBotCommentFailures();
  }

  function normalizeModelList(models) {
    return [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))]
      .sort((left, right) => left.localeCompare(right));
  }

  function getModelCacheKey(settings) {
    const normalized = normalizeAiSettings(settings);
    return `${normalized.provider}:${normalized.baseUrl}`;
  }

  function getProviderModelCacheKey(settings) {
    return normalizeAiSettings(settings).provider;
  }

  function readModelListCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_MODEL_CACHE_STORAGE_KEY, (result) => {
        const cache = result?.[AI_MODEL_CACHE_STORAGE_KEY];
        resolve(cache && typeof cache === "object" ? cache : {});
      });
    });
  }

  async function getCachedModelList(settings) {
    const cache = await readModelListCache();
    const provider = normalizeAiSettings(settings).provider;
    const exactCache = cache[getModelCacheKey(settings)];
    const providerCache = cache[getProviderModelCacheKey(settings)];
    const legacyProviderCache = Object.values(cache)
      .filter((item) => item?.provider === provider)
      .sort((left, right) => Number(right?.updatedAt || 0) - Number(left?.updatedAt || 0))[0];
    return {
      ok: true,
      models: normalizeModelList((exactCache || providerCache || legacyProviderCache)?.models)
    };
  }

  async function writeModelListCache(settings, models) {
    const normalizedSettings = normalizeAiSettings(settings);
    const normalizedModels = normalizeModelList(models);
    const cache = await readModelListCache();
    await new Promise((resolve) => {
      chrome.storage.local.set({
        [AI_MODEL_CACHE_STORAGE_KEY]: {
          ...cache,
          [getModelCacheKey(normalizedSettings)]: {
            provider: normalizedSettings.provider,
            baseUrl: normalizedSettings.baseUrl,
            models: normalizedModels,
            updatedAt: Date.now()
          },
          [getProviderModelCacheKey(normalizedSettings)]: {
            provider: normalizedSettings.provider,
            baseUrl: normalizedSettings.baseUrl,
            models: normalizedModels,
            updatedAt: Date.now()
          }
        }
      }, resolve);
    });
    return normalizedModels;
  }

  function isXiaoheiheWebTab(tab) {
    return /^https:\/\/www\.xiaoheihe\.cn\//.test(String(tab?.url || ""));
  }

  function sendOpenPageSettingsMessage(tabId, detail = {}) {
    if (!tabId || !chrome.tabs?.sendMessage) {
      return;
    }
    chrome.tabs.sendMessage(tabId, {
      type: "better-xiaoheihe-open-page-settings",
      detail: {
        tab: "aibot",
        ...detail
      }
    }, () => {
      void chrome.runtime.lastError;
    });
  }

  function openPageSettingsFromAction(tab) {
    if (tab?.id && isXiaoheiheWebTab(tab)) {
      sendOpenPageSettingsMessage(tab.id);
      return;
    }

    if (!chrome.tabs?.create) {
      return;
    }

    chrome.tabs.create({ url: "https://www.xiaoheihe.cn/app/bbs/home" }, (createdTab) => {
      const tabId = createdTab?.id;
      if (!tabId || !chrome.tabs?.onUpdated) {
        return;
      }

      const handleUpdated = (updatedTabId, changeInfo) => {
        if (updatedTabId !== tabId || changeInfo.status !== "complete") {
          return;
        }
        chrome.tabs.onUpdated.removeListener(handleUpdated);
        setTimeout(() => sendOpenPageSettingsMessage(tabId), 500);
      };
      chrome.tabs.onUpdated.addListener(handleUpdated);
    });
  }

