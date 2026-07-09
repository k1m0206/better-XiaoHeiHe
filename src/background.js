(function () {
  // 此文件由 scripts/build-source-bundles.ps1 根据模块源码生成。
  // 禁止直接修改本入口文件，改动会在下次生成时被覆盖。
  // 请优先修改 src/background 下的模块源文件。
  // BEGIN src\shared\constants.js
// 跨 content、background、ai-bridge 共享的协议常量。
// 本文件会被 scripts/build-source-bundles.ps1 拼入各入口文件，请勿放入依赖具体运行环境的逻辑。
  const HIDE_CY_COMMENTS_STORAGE_KEY = "better-xiaoheihe-hide-cy-comments";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
  const COMMENT_PREVIEW_SORT_STORAGE_KEY = "better-xiaoheihe-comment-preview-sort";
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
  const UI_STATE_STORAGE_KEY = "better-xiaoheihe-ui-state";
  const COMMENT_EMOJI_USAGE_STORAGE_KEY = "better-xiaoheihe-comment-emoji-usage";

  const LOCAL_SETTINGS_STORAGE_KEYS = [
    HIDE_CY_COMMENTS_STORAGE_KEY,
    BLOCKED_KEYWORDS_STORAGE_KEY,
    LEVEL_FILTERS_STORAGE_KEY,
    COMMENT_PREVIEW_SORT_STORAGE_KEY,
    AI_BOT_SETTINGS_STORAGE_KEY,
    AI_BOT_LOGS_STORAGE_KEY,
    AI_BOT_MESSAGE_LOGS_STORAGE_KEY,
    AI_BOT_REPLY_QUEUE_STORAGE_KEY,
    AI_BOT_CONSENT_STORAGE_KEY,
    API_PARAMS_STORAGE_KEY,
    UI_STATE_STORAGE_KEY,
    COMMENT_EMOJI_USAGE_STORAGE_KEY
  ];

  const LOCAL_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-local-settings-request";
  const LOCAL_SETTINGS_RESPONSE_EVENT = "better-xiaoheihe-local-settings-response";
  const LOCAL_SETTINGS_SAVE_EVENT = "better-xiaoheihe-local-settings-save";
  const LOCAL_SETTINGS_CHANGED_EVENT = "better-xiaoheihe-local-settings-changed";
  const AI_BOT_RUNTIME_REQUEST_EVENT = "better-xiaoheihe-ai-bot-runtime-request";
  const AI_BOT_RUNTIME_RESPONSE_EVENT = "better-xiaoheihe-ai-bot-runtime-response";
  const OPEN_PAGE_SETTINGS_EVENT = "better-xiaoheihe-open-page-settings";
  const AI_SETTINGS_EVENT = "better-xiaoheihe-ai-settings";
  const AI_SETTINGS_REQUEST_EVENT = "better-xiaoheihe-ai-settings-request";
  const AI_SETTINGS_SAVE_EVENT = "better-xiaoheihe-ai-settings-save";
  const AI_CHAT_REQUEST_EVENT = "better-xiaoheihe-ai-chat-request";
  const AI_CHAT_RESPONSE_EVENT = "better-xiaoheihe-ai-chat-response";
  const AI_MODEL_LIST_REQUEST_EVENT = "better-xiaoheihe-ai-model-list-request";
  const AI_MODEL_LIST_RESPONSE_EVENT = "better-xiaoheihe-ai-model-list-response";
  const SANITIZED_COOKIE_RULE_REQUEST_EVENT = "better-xiaoheihe-sanitized-cookie-rule-request";
  const SANITIZED_COOKIE_RULE_RESPONSE_EVENT = "better-xiaoheihe-sanitized-cookie-rule-response";

  const AI_BOT_LOG_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
  const AI_BOT_MIN_FEED_POLL_MINUTES = 10;
  const AI_BOT_DEFAULT_REPLY_LIMIT_PER_LINK_USER = 5;
  const AI_BOT_DEFAULT_GLOBAL_HISTORY_LIMIT = 20;
  const AI_BOT_MAX_GLOBAL_HISTORY_LIMIT = 100;
  const DEFAULT_SUMMARY_PROMPT = "你是社区帖子总结助手，请用中文简洁输出：\n帖子总结\n一句话概括帖子核心内容。\n评论区信息\n提取评论区里有价值的观点、经验、补充或避坑信息，没有则跳过。\nAI简评\n像真实网友一样补充观点，避免AI味。\n返回md格式。";
  const AI_BOT_DEFAULT_PROMPT = "你是小黑盒社区自动回复助手。请根据消息类型、帖子正文、评论区上下文和触发消息的那条评论，生成一条自然、友好、简洁的中文回复。不要使用模板化开头，不要编造事实，不要输出Markdown。如果触发消息的评论内容只有表情（没有文字，表情数量可以是多个），那么你只回复一个表情，不要添加任何文字。";
  const AI_BOT_DEFAULT_FEED_PROMPT = "你是小黑盒社区暖贴助手。请根据帖子标题、正文和话题，生成一条自然、真实、简洁的中文评论，像普通用户浏览帖子后留下的感想。不要使用模板化开头，不要编造未提供的信息，不要输出Markdown。";

  const AI_PROVIDERS = {
    OPENAI_COMPATIBLE: "openai-compatible",
    OPENAI_RESPONSES: "openai-responses",
    ANTHROPIC: "anthropic",
    GEMINI: "gemini"
  };
  const DEFAULT_AI_PROVIDER = AI_PROVIDERS.OPENAI_COMPATIBLE;
  const AI_PROVIDER_DEFAULT_BASE_URLS = {
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: "https://api.openai.com/v1",
    [AI_PROVIDERS.OPENAI_RESPONSES]: "https://api.openai.com/v1",
    [AI_PROVIDERS.ANTHROPIC]: "https://api.anthropic.com/v1",
    [AI_PROVIDERS.GEMINI]: "https://generativelanguage.googleapis.com/v1beta"
  };
  // END src\shared\constants.js
  // BEGIN src\shared\normalizers.js
// 跨入口复用的配置归一化逻辑。
// 依赖 src/shared/constants.js，生成入口时必须在 constants.js 之后拼入。
  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_AI_PROVIDER;
  }

  function normalizeBaseUrl(baseUrl, provider) {
    return String(baseUrl || AI_PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, "");
  }

  function normalizeAiSettings(settings = {}) {
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

  function normalizeAiBotSettings(settings = {}) {
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
  // END src\shared\normalizers.js
  // BEGIN src\background\state.js
// 后台常量、设置归一化、storage、模型缓存和 action 入口。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const AI_BOT_ALARM_NAME = "better-xiaoheihe-ai-bot-poll";
  const AI_BOT_FEED_ALARM_NAME = "better-xiaoheihe-ai-bot-feed";
  const AI_BOT_QUEUE_ALARM_NAME = "better-xiaoheihe-ai-bot-queue";
  const AI_BOT_EMOJI_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const AI_BOT_COMMENT_COOLDOWN_MS = 30 * 1000;
  const AI_BOT_QUEUE_MAX_SIZE = 50;
  const AI_BOT_MESSAGE_LIMIT = 20;
  const AI_BOT_COMMENT_LIMIT = 30;
  const AI_BOT_FEED_COOLDOWN_TOLERANCE_MS = 5000;
  const AI_BOT_BUILTIN_MODERATION_PROMPT = "\n\n[系统内置审查规则 - 不可关闭]：\n在生成回复前，必须同时审查触发消息的评论内容和你将要生成的回复内容。遇到以下情况时，直接返回 [REFUSE] 标记（不要返回其他任何内容）：\n- 违反中国法律法规的内容（涉政敏感、分裂国家、损害国家荣誉和利益等）\n- 违反社会主义核心价值观的内容\n- 涉黄、涉暴、涉恐、涉赌、涉毒等违法内容\n- 侮辱、诽谤、人身攻击、网络暴力、不礼貌的言论\n- 歧视性内容（地域歧视、性别歧视、种族歧视等）\n- 散布谣言、虚假信息、误导性内容\n- 不道德、低俗、恶俗、有悖公序良俗的内容\n- 涉及未成年人不良内容\n- 政治敏感话题、时政评论、涉及领导人或国家政策的讨论\n如果触发消息的评论本身包含上述违规内容，也直接返回 [REFUSE]。";
  const AI_BOT_MESSAGE_TYPES = {
    MENTION: "mention",
    COMMENT: "comment",
    FEED: "feed"
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

  // END src\background\state.js
  // BEGIN src\background\xiaoheihe-api.js
// 小黑盒签名、参数缓存和 API URL 构造。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function md5(input) {
    function safeAdd(x, y) {
      const lsw = (x & 0xffff) + (y & 0xffff);
      const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }

    function rotateLeft(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }

    function md5cmn(q, a, b, x, s, t) {
      return safeAdd(rotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
    }

    function md5ff(a, b, c, d, x, s, t) {
      return md5cmn((b & c) | (~b & d), a, b, x, s, t);
    }

    function md5gg(a, b, c, d, x, s, t) {
      return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
    }

    function md5hh(a, b, c, d, x, s, t) {
      return md5cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5ii(a, b, c, d, x, s, t) {
      return md5cmn(c ^ (b | ~d), a, b, x, s, t);
    }

    function binlMD5(x, len) {
      x[len >> 5] |= 0x80 << (len % 32);
      x[(((len + 64) >>> 9) << 4) + 14] = len;

      let a = 1732584193;
      let b = -271733879;
      let c = -1732584194;
      let d = 271733878;

      for (let i = 0; i < x.length; i += 16) {
        const olda = a;
        const oldb = b;
        const oldc = c;
        const oldd = d;

        a = md5ff(a, b, c, d, x[i], 7, -680876936);
        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = md5gg(b, c, d, a, x[i], 20, -373897302);
        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = md5hh(d, a, b, c, x[i], 11, -358537222);
        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

        a = md5ii(a, b, c, d, x[i], 6, -198630844);
        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = safeAdd(a, olda);
        b = safeAdd(b, oldb);
        c = safeAdd(c, oldc);
        d = safeAdd(d, oldd);
      }

      return [a, b, c, d];
    }

    function rawStringToWords(inputString) {
      const output = [];
      output[(inputString.length >> 2) - 1] = undefined;
      for (let i = 0; i < output.length; i++) {
        output[i] = 0;
      }
      for (let i = 0; i < inputString.length * 8; i += 8) {
        output[i >> 5] |= (inputString.charCodeAt(i / 8) & 0xff) << (i % 32);
      }
      return output;
    }

    function wordsToRawString(inputWords) {
      let output = "";
      for (let i = 0; i < inputWords.length * 32; i += 8) {
        output += String.fromCharCode((inputWords[i >> 5] >>> (i % 32)) & 0xff);
      }
      return output;
    }

    function rawStringToHex(inputString) {
      const hexTab = "0123456789abcdef";
      let output = "";
      for (let i = 0; i < inputString.length; i++) {
        const x = inputString.charCodeAt(i);
        output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
      }
      return output;
    }

    const raw = unescape(encodeURIComponent(String(input)));
    return rawStringToHex(wordsToRawString(binlMD5(rawStringToWords(raw), raw.length * 8)));
  }

  function mixColumns(values) {
    function xtime(value) {
      return value & 128 ? ((value << 1) ^ 27) & 255 : value << 1;
    }

    function q(value) {
      return xtime(value) ^ value;
    }

    function r(value) {
      return q(xtime(value));
    }

    function y(value) {
      return r(q(xtime(value)));
    }

    function g(value) {
      return y(value) ^ r(value) ^ q(value);
    }

    const result = [0, 0, 0, 0];
    result[0] = g(values[0]) ^ y(values[1]) ^ r(values[2]) ^ q(values[3]);
    result[1] = q(values[0]) ^ g(values[1]) ^ y(values[2]) ^ r(values[3]);
    result[2] = r(values[0]) ^ q(values[1]) ^ g(values[2]) ^ y(values[3]);
    result[3] = y(values[0]) ^ r(values[1]) ^ q(values[2]) ^ g(values[3]);
    values[0] = result[0];
    values[1] = result[1];
    values[2] = result[2];
    values[3] = result[3];
    return values;
  }

  function mapByAlphabet(value, alphabet, end) {
    let result = "";
    const source = alphabet.slice(0, end);
    for (let i = 0; i < value.length; i++) {
      result += source[value.charCodeAt(i) % source.length];
    }
    return result;
  }

  function pathToAlphabet(value, alphabet) {
    let result = "";
    for (let i = 0; i < value.length; i++) {
      result += alphabet[value.charCodeAt(i) % alphabet.length];
    }
    return result;
  }

  function interleave(values) {
    let result = "";
    const maxLength = Math.max(...values.map((value) => value.length));
    for (let i = 0; i < maxLength; i++) {
      values.forEach((value) => {
        if (i < value.length) {
          result += value[i];
        }
      });
    }
    return result;
  }

  function createSignedParams(path) {
    const time = Math.floor(Date.now() / 1000);
    const nonce = md5(`${time}${Math.random(Date.now())}`).toUpperCase();
    const normalizedPath = `/${path.split("/").filter(Boolean).join("/")}/`;
    const alphabet = "AB45STUVWZEFGJ6CH01D237IXYPQRKLMN89";
    const seed = interleave([
      mapByAlphabet(String(time + 1), alphabet, -2),
      pathToAlphabet(normalizedPath, alphabet),
      pathToAlphabet(nonce, alphabet)
    ]).slice(0, 20);
    const hash = md5(seed);
    const checksum = String(
      mixColumns(hash.slice(-6).split("").map((char) => char.charCodeAt(0)))
        .reduce((sum, value) => sum + value, 0) % 100
    ).padStart(2, "0");

    return {
      hkey: `${mapByAlphabet(hash.substring(0, 5), alphabet, -4)}${checksum}`,
      _time: time,
      nonce
    };
  }

  function normalizeCachedApiParams(value) {
    const source = value?.params && typeof value.params === "object" ? value.params : value;
    if (!source || typeof source !== "object") {
      return {};
    }
    const allowedKeys = [
      "os_type",
      "app",
      "client_type",
      "version",
      "web_version",
      "x_client_type",
      "x_app",
      "heybox_id",
      "x_os_type",
      "device_info",
      "device_id"
    ];
    return allowedKeys.reduce((result, key) => {
      const text = String(source[key] || "").trim();
      if (text) {
        result[key] = text;
      }
      return result;
    }, {});
  }

  async function refreshCachedApiParams() {
    const result = await storageGet(API_PARAMS_STORAGE_KEY);
    cachedApiParams = normalizeCachedApiParams(result[API_PARAMS_STORAGE_KEY]);
    return cachedApiParams;
  }

  function buildApiUrl(path, params = {}) {
    const reusedParams = normalizeCachedApiParams(cachedApiParams);
    const query = new URLSearchParams({
      os_type: "web",
      app: "heybox",
      client_type: "web",
      version: "999.0.4",
      web_version: "2.5",
      x_client_type: "web",
      x_app: "heybox_website",
      x_os_type: "Windows",
      device_info: "Chrome",
      ...reusedParams,
      ...params,
      ...createSignedParams(path)
    });
    return `${API_ORIGIN}${path}?${query.toString()}`;
  }

  // END src\background\xiaoheihe-api.js
  // BEGIN src\background\ai-service.js
// AI provider 请求、模型列表和响应解析。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function buildProviderUrl(baseUrl, path) {
    const normalizedBaseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    return normalizedPath ? `${normalizedBaseUrl}/${normalizedPath}` : normalizedBaseUrl;
  }

  function buildOpenAiChatUrl(baseUrl) {
    return /\/chat\/completions$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "chat/completions");
  }

  function buildOpenAiResponsesUrl(baseUrl) {
    return /\/responses$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "responses");
  }

  function buildModelsUrl(baseUrl) {
    return /\/models$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "models");
  }

  function readAiSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
        resolve(normalizeAiSettings(result?.[AI_SETTINGS_STORAGE_KEY]));
      });
    });
  }

  function createJsonHeaders(settings) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json"
    };
    if (settings.apiKey) {
      headers.authorization = `Bearer ${settings.apiKey}`;
    }
    return headers;
  }

  async function readJsonResponse(response) {
    const text = await response.text().catch(() => "");
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  function getProviderError(data, response) {
    return data?.error?.message || data?.error || data?.message || data?.text || `请求失败：${response.status}`;
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(String(getProviderError(data, response)));
    }
    return data;
  }

  function getTemperature(detail) {
    return Number.isFinite(detail?.temperature) ? detail.temperature : 0.2;
  }

  function splitSystemMessages(messages) {
    const system = [];
    const rest = [];
    (Array.isArray(messages) ? messages : []).forEach((message) => {
      const role = String(message?.role || "user");
      const content = String(message?.content || "");
      if (!content) {
        return;
      }
      if (role === "system") {
        system.push(content);
        return;
      }
      rest.push({ role, content });
    });
    return { system: system.join("\n\n"), messages: rest };
  }

  function parseOpenAiContent(data) {
    return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
  }

  function parseResponsesContent(data) {
    if (data?.output_text) {
      return data.output_text;
    }

    const parts = [];
    (data?.output || []).forEach((item) => {
      (item?.content || []).forEach((content) => {
        if (content?.text) {
          parts.push(content.text);
        }
      });
    });
    return parts.join("\n");
  }

  function parseAnthropicContent(data) {
    return (data?.content || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  function parseGeminiContent(data) {
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  async function requestOpenAiCompatibleChat(settings, detail) {
    const data = await fetchJson(buildOpenAiChatUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseOpenAiContent(data);
  }

  async function requestOpenAiResponses(settings, detail) {
    const data = await fetchJson(buildOpenAiResponsesUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        input: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseResponsesContent(data);
  }

  async function requestAnthropicChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }

    const body = {
      model: settings.model,
      messages: messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      })),
      max_tokens: 2048,
      temperature: getTemperature(detail)
    };
    if (system) {
      body.system = system;
    }

    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "messages"), {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return parseAnthropicContent(data);
  }

  function appendGeminiApiKey(url, apiKey) {
    if (!apiKey) {
      return url;
    }

    const nextUrl = new URL(url);
    nextUrl.searchParams.set("key", apiKey);
    return nextUrl.toString();
  }

  async function requestGeminiChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const geminiMessages = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));
    if (system) {
      const firstUserMessage = geminiMessages.find((message) => message.role === "user");
      if (firstUserMessage) {
        firstUserMessage.parts[0].text = `${system}\n\n${firstUserMessage.parts[0].text}`;
      } else {
        geminiMessages.unshift({
          role: "user",
          parts: [{ text: system }]
        });
      }
    }

    const body = {
      contents: geminiMessages,
      generationConfig: {
        temperature: getTemperature(detail)
      }
    };

    const url = appendGeminiApiKey(buildProviderUrl(settings.baseUrl, `models/${encodeURIComponent(settings.model)}:generateContent`), settings.apiKey);
    const data = await fetchJson(url, {
      method: "POST",
      headers: createJsonHeaders({ ...settings, apiKey: "" }),
      body: JSON.stringify(body)
    });
    return parseGeminiContent(data);
  }

  async function requestChat(detail, overrideSettings = null) {
    const settings = overrideSettings ? normalizeAiSettings(overrideSettings) : await readAiSettings();
    if (!settings.enabled || !settings.baseUrl || !settings.model) {
      return { ok: false, error: "请先开启 AI，并填写 Base URL 和模型" };
    }

    try {
      const requesters = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: requestOpenAiCompatibleChat,
        [AI_PROVIDERS.OPENAI_RESPONSES]: requestOpenAiResponses,
        [AI_PROVIDERS.ANTHROPIC]: requestAnthropicChat,
        [AI_PROVIDERS.GEMINI]: requestGeminiChat
      };
      const content = await requesters[settings.provider](settings, detail);
      return {
        ok: true,
        content: String(content || "").trim() || "模型没有返回内容"
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "AI 请求失败"
      };
    }
  }

  function parseOpenAiModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseAnthropicModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseGeminiModels(data) {
    return (data?.models || [])
      .filter((model) => !Array.isArray(model?.supportedGenerationMethods) || model.supportedGenerationMethods.includes("generateContent"))
      .map((model) => String(model?.name || "").replace(/^models\//, ""))
      .filter(Boolean);
  }

  async function listOpenAiModels(settings) {
    const data = await fetchJson(buildModelsUrl(settings.baseUrl), {
      method: "GET",
      headers: createJsonHeaders(settings)
    });
    return parseOpenAiModels(data);
  }

  async function listAnthropicModels(settings) {
    const headers = {
      accept: "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }
    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "models"), {
      method: "GET",
      headers
    });
    return parseAnthropicModels(data);
  }

  async function listGeminiModels(settings) {
    const data = await fetchJson(appendGeminiApiKey(buildProviderUrl(settings.baseUrl, "models"), settings.apiKey), {
      method: "GET",
      headers: { accept: "application/json" }
    });
    return parseGeminiModels(data);
  }

  async function listModels(overrideSettings = null) {
    const settings = normalizeAiSettings(overrideSettings || await readAiSettings());
    if (!settings.baseUrl) {
      return { ok: false, error: "请先填写 Base URL" };
    }

    try {
      const listers = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: listOpenAiModels,
        [AI_PROVIDERS.OPENAI_RESPONSES]: listOpenAiModels,
        [AI_PROVIDERS.ANTHROPIC]: listAnthropicModels,
        [AI_PROVIDERS.GEMINI]: listGeminiModels
      };
      const models = await listers[settings.provider](settings);
      const cachedModels = await writeModelListCache(settings, models);
      return {
        ok: true,
        models: cachedModels
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "模型列表拉取失败"
      };
    }
  }
  // END src\background\ai-service.js
  // BEGIN src\background\ai-bot-data.js
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

  // END src\background\ai-bot-data.js
  // BEGIN src\background\ai-bot-api.js
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

  // END src\background\ai-bot-api.js
  // BEGIN src\background\ai-bot-compose.js
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
    await waitForAiBotCommentCooldown();
    await markAiBotCommentAttempt();
    const commentUrl = buildCommentCreateUrl(heyboxId);
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
  // END src\background\ai-bot-compose.js
  // BEGIN src\background\ai-bot-queue.js
// AI Bot 队列、已回复记录和目标频控。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  async function readReplyQueue() {
    const result = await storageGet(AI_BOT_REPLY_QUEUE_STORAGE_KEY);
    const queue = result[AI_BOT_REPLY_QUEUE_STORAGE_KEY];
    return Array.isArray(queue) ? queue : [];
  }

  async function writeReplyQueue(queue) {
    await storageSet({ [AI_BOT_REPLY_QUEUE_STORAGE_KEY]: queue });
  }

  async function cleanupReplyQueue() {
    const settings = await readAiBotSettings();
    const queue = await readReplyQueue();
    const now = Date.now();
    const freshMs = Math.max(1, Number(settings.messageFreshMinutes || 5)) * 60 * 1000;
    const droppedItems = [];
    const validItems = queue.filter((item) => {
      const queuedAt = Number(item?.queuedAt || 0);
      const messageTimestamp = Number(item?.messageTimestamp || getMessageTimestampMs(item?.message) || 0);
      const queueAge = now - queuedAt;
      const messageAge = messageTimestamp ? now - messageTimestamp : 0;
      const expired = queueAge >= freshMs || (messageTimestamp && messageAge > freshMs);
      if (expired) {
        droppedItems.push({
          messageId: item?.messageId || "",
          messageSource: item?.messageSource || "",
          linkId: item?.linkId || "",
          senderId: item?.senderId || "",
          queuedSeconds: Math.max(0, Math.floor(queueAge / 1000)),
          messageAgeMinutes: messageTimestamp ? Math.max(0, Math.floor(messageAge / 60000)) : "",
          freshMinutes: settings.messageFreshMinutes
        });
      }
      return !expired;
    });
    if (validItems.length !== queue.length) {
      await writeReplyQueue(validItems);
      const droppedCount = queue.length - validItems.length;
      if (droppedCount > 0) {
        await appendAiBotLog("info", `清理超过当前时间窗口的队列消息：${droppedCount} 条`, {
          freshMinutes: settings.messageFreshMinutes,
          remainingCount: validItems.length,
          droppedMessages: droppedItems.slice(0, 20)
        });
      }
    }
    return validItems;
  }

  async function enqueueReplyMessage(message, context, replyCommentId, messageSource, emojiCodes) {
    const queue = await cleanupReplyQueue();
    const messageId = String(message?.message_id || "");
    const exists = queue.some((item) => item.messageId === messageId);
    if (exists) {
      return false;
    }
    const now = Date.now();
    const queueItem = {
      messageId,
      queuedAt: now,
      message,
      context: {
        detail: context.detail,
        groups: context.groups
      },
      replyCommentId,
      messageSource,
      emojiCodes,
      linkId: getLinkIdFromMessage(message),
      rootCommentId: getRootCommentIdFromMessage(message),
      targetId: getAiBotReplyTargetId(message?.user_a || {}),
      senderId: getUserId(message?.user_a || {}),
      senderName: getUserDisplayName(message?.user_a || {}),
      messageText: stripHtml(String(message?.comment_a_text || message?.text || "")).slice(0, 500),
      messageTimestamp: getMessageTimestampMs(message)
    };
    const newQueue = [...queue, queueItem];
    newQueue.sort((a, b) => Number(b.messageTimestamp || b.queuedAt) - Number(a.messageTimestamp || a.queuedAt));
    const trimmedQueue = newQueue.slice(0, AI_BOT_QUEUE_MAX_SIZE);
    await writeReplyQueue(trimmedQueue);
    await appendAiBotLog("info", "新增待处理队列消息", {
      messageId,
      messageSource,
      linkId: queueItem.linkId,
      replyCommentId,
      rootCommentId: queueItem.rootCommentId,
      senderId: queueItem.senderId,
      senderName: queueItem.senderName,
      messageTime: queueItem.messageTimestamp ? formatLogTime(queueItem.messageTimestamp) : "",
      messageText: queueItem.messageText,
      queuedAt: formatLogTime(queueItem.queuedAt),
      queueCount: trimmedQueue.length,
      trimmed: trimmedQueue.length < newQueue.length
    });
    return true;
  }

  async function dequeueReplyMessage() {
    const queue = await cleanupReplyQueue();
    if (!queue.length) {
      return null;
    }
    const item = queue[0];
    const remainingQueue = queue.slice(1);
    await writeReplyQueue(remainingQueue);
    return item;
  }

  async function getQueueStatus() {
    const queue = await cleanupReplyQueue();
    return {
      count: queue.length,
      oldestAge: queue.length ? Date.now() - Number(queue[0]?.queuedAt || 0) : 0
    };
  }

  let aiBotQueueProcessing = false;

  async function readRepliedRecords() {
    const result = await storageGet(AI_BOT_REPLIED_RECORDS_STORAGE_KEY);
    return result[AI_BOT_REPLIED_RECORDS_STORAGE_KEY] && typeof result[AI_BOT_REPLIED_RECORDS_STORAGE_KEY] === "object"
      ? result[AI_BOT_REPLIED_RECORDS_STORAGE_KEY]
      : {};
  }

  async function markMessageReplied(messageId, data = {}) {
    const records = await readRepliedRecords();
    const now = Date.now();
    const nextRecords = Object.fromEntries(Object.entries(records)
      .filter(([, item]) => Number(item?.repliedAt || 0) >= now - 30 * AI_BOT_LOG_RETENTION_MS));
    nextRecords[String(messageId)] = {
      repliedAt: now,
      ...data
    };
    await storageSet({ [AI_BOT_REPLIED_RECORDS_STORAGE_KEY]: nextRecords });
  }

  async function readFeedCommentRecords() {
    const result = await storageGet(AI_BOT_FEED_COMMENT_RECORDS_STORAGE_KEY);
    const records = result[AI_BOT_FEED_COMMENT_RECORDS_STORAGE_KEY];
    return records && typeof records === "object" && !Array.isArray(records) ? records : {};
  }

  async function markFeedCommented(linkId, data = {}) {
    const records = await readFeedCommentRecords();
    const now = Date.now();
    await storageSet({
      [AI_BOT_FEED_COMMENT_RECORDS_STORAGE_KEY]: {
        ...records,
        [String(linkId)]: {
          commentedAt: now,
          ...data
        }
      }
    });
  }

  async function readReplyTargetRecords() {
    const result = await storageGet(AI_BOT_REPLY_TARGET_RECORDS_STORAGE_KEY);
    const records = result[AI_BOT_REPLY_TARGET_RECORDS_STORAGE_KEY];
    return records && typeof records === "object" && !Array.isArray(records) ? records : {};
  }

  async function countSentReplyTargetMessageLogs(linkId, targetId) {
    const recordKey = getAiBotReplyTargetRecordKey(linkId, targetId);
    if (!recordKey) {
      return 0;
    }
    const result = await storageGet(AI_BOT_MESSAGE_LOGS_STORAGE_KEY);
    const logs = Array.isArray(result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]) ? result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY] : [];
    return logs.filter((log) => {
      if (log?.skipped || log?.messageSource === AI_BOT_MESSAGE_TYPES.FEED) {
        return false;
      }
      const logTargetId = log?.targetId || (log?.senderId ? `id:${log.senderId}` : (log?.senderName ? `name:${log.senderName}` : ""));
      return getAiBotReplyTargetRecordKey(log?.linkId, logTargetId) === recordKey;
    }).length;
  }

  async function findSentReplyCommentMessageLog(linkId, replyCommentId) {
    const recordKey = getAiBotReplyCommentRecordKey(linkId, replyCommentId);
    if (!recordKey) {
      return null;
    }
    const result = await storageGet(AI_BOT_MESSAGE_LOGS_STORAGE_KEY);
    const logs = Array.isArray(result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]) ? result[AI_BOT_MESSAGE_LOGS_STORAGE_KEY] : [];
    return logs.find((log) => {
      if (log?.skipped || log?.messageSource === AI_BOT_MESSAGE_TYPES.FEED) {
        return false;
      }
      return getAiBotReplyCommentRecordKey(log?.linkId, log?.replyCommentId) === recordKey;
    }) || null;
  }

  async function findQueuedReplyCommentItem(linkId, replyCommentId) {
    const recordKey = getAiBotReplyCommentRecordKey(linkId, replyCommentId);
    if (!recordKey) {
      return null;
    }
    const queue = await cleanupReplyQueue();
    return queue.find((item) => getAiBotReplyCommentRecordKey(item?.linkId, item?.replyCommentId) === recordKey) || null;
  }

  async function getReplyCommentUsage(linkId, replyCommentId) {
    return {
      sentLog: await findSentReplyCommentMessageLog(linkId, replyCommentId),
      queuedItem: await findQueuedReplyCommentItem(linkId, replyCommentId)
    };
  }

  async function markReplyTargetSent(linkId, targetId, data = {}) {
    const recordKey = getAiBotReplyTargetRecordKey(linkId, targetId);
    if (!recordKey) {
      return;
    }
    const records = await readReplyTargetRecords();
    const now = Date.now();
    const current = records[recordKey] && typeof records[recordKey] === "object" ? records[recordKey] : {};
    const count = Math.max(
      Math.max(0, Number.parseInt(current.count, 10) || 0),
      await countSentReplyTargetMessageLogs(linkId, targetId)
    ) + 1;
    await storageSet({
      [AI_BOT_REPLY_TARGET_RECORDS_STORAGE_KEY]: {
        ...records,
        [recordKey]: {
          ...current,
          ...data,
          linkId: String(linkId),
          targetId: String(targetId),
          count,
          lastRepliedAt: now
        }
      }
    });
  }

  async function getQueuedReplyTargetCount(linkId, targetId) {
    const recordKey = getAiBotReplyTargetRecordKey(linkId, targetId);
    if (!recordKey) {
      return 0;
    }
    const queue = await cleanupReplyQueue();
    return queue.filter((item) => getAiBotReplyTargetRecordKey(item?.linkId, item?.targetId) === recordKey).length;
  }

  async function getReplyTargetUsage(linkId, targetId, limit = AI_BOT_DEFAULT_REPLY_LIMIT_PER_LINK_USER) {
    const normalizedLimit = Math.max(1, Number.parseInt(limit, 10) || AI_BOT_DEFAULT_REPLY_LIMIT_PER_LINK_USER);
    const recordKey = getAiBotReplyTargetRecordKey(linkId, targetId);
    if (!recordKey) {
      return {
        sentCount: 0,
        queuedCount: 0,
        totalCount: 0,
        limit: normalizedLimit,
        record: null
      };
    }
    const records = await readReplyTargetRecords();
    const record = records[recordKey] && typeof records[recordKey] === "object" ? records[recordKey] : null;
    const sentCount = Math.max(
      Math.max(0, Number.parseInt(record?.count, 10) || 0),
      await countSentReplyTargetMessageLogs(linkId, targetId)
    );
    const queuedCount = await getQueuedReplyTargetCount(linkId, targetId);
    return {
      sentCount,
      queuedCount,
      totalCount: sentCount + queuedCount,
      limit: normalizedLimit,
      record
    };
  }

  // END src\background\ai-bot-queue.js
  // BEGIN src\background\ai-bot-processor.js
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

  // END src\background\ai-bot-processor.js
  // BEGIN src\background\ai-bot-runtime.js
// AI Bot alarm 同步和运行状态读取。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function clearAiBotAlarm() {
    return new Promise((resolve) => {
      if (!chrome.alarms?.clear) {
        resolve(false);
        return;
      }
      chrome.alarms.clear(AI_BOT_ALARM_NAME, () => {
        chrome.alarms.clear(AI_BOT_FEED_ALARM_NAME, () => {
          chrome.alarms.clear(AI_BOT_QUEUE_ALARM_NAME, resolve);
        });
      });
    });
  }

  function getAiBotAlarm(name) {
    return new Promise((resolve) => {
      if (!chrome.alarms?.get) {
        resolve(null);
        return;
      }
      chrome.alarms.get(name, (alarm) => resolve(alarm || null));
    });
  }

  async function createAiBotAlarm(name, alarmInfo, reset) {
    if (!chrome.alarms?.create) {
      return;
    }
    if (!reset && await getAiBotAlarm(name)) {
      return;
    }
    chrome.alarms.create(name, alarmInfo);
  }

  async function syncAiBotAlarm(options = {}) {
    const reset = options.reset === true;
    const settings = await readAiBotSettings();
    const consentAccepted = await hasAiBotConsent();
    if (reset) {
      await clearAiBotAlarm();
    }
    if (!consentAccepted || !settings.enabled || !chrome.alarms?.create) {
      await clearAiBotAlarm();
      return;
    }
    await createAiBotAlarm(AI_BOT_ALARM_NAME, {
      delayInMinutes: 0.1,
      periodInMinutes: Math.max(1, settings.pollMinutes)
    }, reset);
    if (settings.commentHomeFeed) {
      await createAiBotAlarm(AI_BOT_FEED_ALARM_NAME, {
        delayInMinutes: 0.15,
        periodInMinutes: Math.max(AI_BOT_MIN_FEED_POLL_MINUTES, settings.feedPollMinutes)
      }, reset);
    } else if (chrome.alarms?.clear) {
      chrome.alarms.clear(AI_BOT_FEED_ALARM_NAME);
    }
    await createAiBotAlarm(AI_BOT_QUEUE_ALARM_NAME, {
      delayInMinutes: 0.2,
      periodInMinutes: 0.5
    }, reset);
  }

  async function getAiBotStatus() {
    const settings = await readAiBotSettings();
    const apiParams = await refreshCachedApiParams();
    const queueStatus = await getQueueStatus();
    const feedCommentRecords = await readFeedCommentRecords();
    return {
      ok: true,
      enabled: settings.enabled,
      commentHomeFeed: settings.commentHomeFeed,
      running: aiBotRunning,
      queueProcessing: aiBotQueueProcessing,
      queueCount: queueStatus.count,
      feedCommentRecordsCount: Object.keys(feedCommentRecords).length,
      alarmName: AI_BOT_ALARM_NAME,
      queueAlarmName: AI_BOT_QUEUE_ALARM_NAME,
      hasCapturedApiParams: Object.keys(apiParams).length > 0,
      hasCapturedDeviceId: Boolean(apiParams.device_id),
      capturedApiParamKeys: Object.keys(apiParams)
    };
  }

  // END src\background\ai-bot-runtime.js
  // BEGIN src\background\dnr-rules.js
// DNR cookie/header 规则管理。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function updateSanitizedCommentCookieRule(cookieHeader) {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({
          ok: false,
          error: "当前浏览器不支持请求头规则"
        });
        return;
      }

      const requestHeaderRule = cookieHeader
        ? { header: "cookie", operation: "set", value: cookieHeader }
        : { header: "cookie", operation: "remove" };
      const addRules = [{
        id: SANITIZED_COMMENT_COOKIE_RULE_ID,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [requestHeaderRule]
        },
        condition: {
          regexFilter: "^https://api\\.xiaoheihe\\.cn/bbs/app/(link/tree|comment/sub/comments)(\\?|$)",
          initiatorDomains: ["xiaoheihe.cn"],
          requestMethods: ["get"],
          resourceTypes: ["xmlhttprequest"]
        }
      }];

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [SANITIZED_COMMENT_COOKIE_RULE_ID],
        addRules
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "请求头规则更新失败"
        } : { ok: true });
      });
    });
  }

  function activateAiBotCommentRequestHeaderRule() {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({
          ok: false,
          error: "当前浏览器不支持请求头规则"
        });
        return;
      }

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [AI_BOT_COMMENT_HEADER_RULE_ID],
        addRules: [{
          id: AI_BOT_COMMENT_HEADER_RULE_ID,
          priority: 2,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              { header: "origin", operation: "set", value: WEB_ORIGIN },
              { header: "referer", operation: "set", value: `${WEB_ORIGIN}/` }
            ]
          },
          condition: {
            regexFilter: "^https://api\\.xiaoheihe\\.cn/bbs/app/comment/create(\\?|$)",
            requestMethods: ["post"],
            resourceTypes: ["xmlhttprequest"]
          }
        }]
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "AI Bot 评论请求头规则更新失败"
        } : { ok: true });
      });
    });
  }

  function clearAiBotCommentRequestHeaderRule() {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({ ok: true });
        return;
      }

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [AI_BOT_COMMENT_HEADER_RULE_ID]
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "AI Bot 评论请求头规则清理失败"
        } : { ok: true });
      });
    });
  }

  function clearSanitizedCommentCookieRule() {
    return new Promise((resolve) => {
      if (!chrome.declarativeNetRequest?.updateSessionRules) {
        resolve({ ok: true });
        return;
      }

      chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [SANITIZED_COMMENT_COOKIE_RULE_ID]
      }, () => {
        const error = chrome.runtime.lastError;
        resolve(error ? {
          ok: false,
          error: error.message || "请求头规则清理失败"
        } : { ok: true });
      });
    });
  }

  function getLastSanitizedCookieHeader() {
    let lastCookieHeader = "";
    sanitizedCommentCookieRules.forEach((cookieHeader) => {
      lastCookieHeader = cookieHeader;
    });
    return lastCookieHeader;
  }

  function queueSanitizedCommentCookieRuleUpdate(task) {
    const next = sanitizedCommentCookieRuleQueue.then(task, task);
    sanitizedCommentCookieRuleQueue = next.catch(() => {});
    return next;
  }

  function activateSanitizedCommentCookieRule(detail = {}) {
    return queueSanitizedCommentCookieRuleUpdate(async () => {
      const id = String(detail.id || "");
      if (!id) {
        return { ok: false, error: "缺少请求头规则 ID" };
      }

      const cookieHeader = String(detail.cookieHeader || "");
      sanitizedCommentCookieRules.set(id, cookieHeader);
      const result = await updateSanitizedCommentCookieRule(cookieHeader);
      if (!result.ok) {
        sanitizedCommentCookieRules.delete(id);
      }
      return { id, ...result };
    });
  }

  function releaseSanitizedCommentCookieRule(detail = {}) {
    return queueSanitizedCommentCookieRuleUpdate(async () => {
      const id = String(detail.id || "");
      if (id) {
        sanitizedCommentCookieRules.delete(id);
      }

      const result = sanitizedCommentCookieRules.size
        ? await updateSanitizedCommentCookieRule(getLastSanitizedCookieHeader())
        : await clearSanitizedCommentCookieRule();
      return { id, ...result };
    });
  }

  chrome.action?.onClicked?.addListener((tab) => {
    openPageSettingsFromAction(tab);
  });

  // END src\background\dnr-rules.js
  // BEGIN src\background\runtime.js
// 后台安装、启动、storage、message 和 alarm 监听。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  chrome.runtime.onInstalled?.addListener(() => {
    syncAiBotAlarm({ reset: true });
  });

  chrome.runtime.onStartup?.addListener(() => {
    syncAiBotAlarm();
  });

  chrome.alarms?.onAlarm?.addListener((alarm) => {
    if (alarm?.name === AI_BOT_ALARM_NAME) {
      runAiBotPoll("alarm");
    }
    if (alarm?.name === AI_BOT_FEED_ALARM_NAME) {
      runAiBotFeedComment().catch(() => {});
    }
    if (alarm?.name === AI_BOT_QUEUE_ALARM_NAME) {
      runAiBotQueueConsumer().catch(() => {});
    }
  });

  chrome.storage.onChanged?.addListener((changes, areaName) => {
    if (areaName === "local" && changes[AI_BOT_SETTINGS_STORAGE_KEY]) {
      const wasEnabled = normalizeAiBotSettings(changes[AI_BOT_SETTINGS_STORAGE_KEY].oldValue).enabled;
      const isEnabled = normalizeAiBotSettings(changes[AI_BOT_SETTINGS_STORAGE_KEY].newValue).enabled;
      if (!wasEnabled && isEnabled) {
        resetAiBotCommentFailures();
      }
      syncAiBotAlarm({ reset: true });
    }
    if (areaName === "local" && changes[AI_BOT_CONSENT_STORAGE_KEY]) {
      syncAiBotAlarm({ reset: true });
    }
    if (areaName === "local" && changes[API_PARAMS_STORAGE_KEY]) {
      cachedApiParams = normalizeCachedApiParams(changes[API_PARAMS_STORAGE_KEY].newValue);
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "better-xiaoheihe-ai-test") {
      requestChat({
        messages: [{ role: "user", content: "请回复 OK" }],
        temperature: 0
      }, message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-list-models") {
      listModels(message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-get-model-cache") {
      getCachedModelList(message.detail?.settings).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-test") {
      requestChat({
        messages: [{ role: "user", content: "请回复 OK" }],
        temperature: 0
      }, {
        ...message.detail?.settings,
        enabled: true
      }).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-status") {
      getAiBotStatus().then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-run-now") {
      runAiBotPoll("manual").then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-ai-bot-clear-logs") {
      storageSet({
        [AI_BOT_LOGS_STORAGE_KEY]: [],
        [AI_BOT_MESSAGE_LOGS_STORAGE_KEY]: []
      }).then(() => sendResponse({ ok: true }));
      return true;
    }

    if (message?.type === "better-xiaoheihe-activate-sanitized-comment-cookie") {
      activateSanitizedCommentCookieRule(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type === "better-xiaoheihe-release-sanitized-comment-cookie") {
      releaseSanitizedCommentCookieRule(message.detail).then(sendResponse);
      return true;
    }

    if (message?.type !== "better-xiaoheihe-ai-chat") {
      return false;
    }

    requestChat(message.detail).then(sendResponse);
    return true;
  });

  syncAiBotAlarm();
  // END src\background\runtime.js
})();
