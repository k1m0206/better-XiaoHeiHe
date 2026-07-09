(function () {
  const ENHANCED_PATH_PREFIXES = ["/app/bbs", "/app/topic/link", "/app/user/profile", "/app/user/favour", "/app/search"];
  const LINK_PATH_REGEXP = /^\/app\/bbs\/link\/(\d+)/;
  const RIGHT_CONTENT_SELECTOR = [
    ".hb-layout__content--right",
    ".cpt-right-side",
    ".bbs-community-hot-topic",
    ".hot-search",
    ".right-side-default.default-content"
  ].join(", ");
  const STYLE_ID = "better-xiaoheihe-bbs-layout-style";
  const HOME_LAYOUT_CLASS = "better-xiaoheihe-home-layout";
  const LINK_DETAIL_LAYOUT_CLASS = "better-xiaoheihe-link-detail-layout";
  const TOP_MENU_CLASS = "better-xiaoheihe-top-menu";
  const TOP_MENU_OPEN_CLASS = "better-xiaoheihe-top-menu--open";
  const TOP_MENU_TOGGLE_CLASS = "better-xiaoheihe-top-menu__toggle";
  const TOP_MENU_PANEL_CLASS = "better-xiaoheihe-top-menu__panel";
  const FAVORITE_ENTRY_CLASS = "better-xiaoheihe-favorite-entry";
  const HEADER_SEARCH_CLASS = "better-xiaoheihe-header-search";
  const HEADER_MESSAGE_CLASS = "better-xiaoheihe-header-message";
  const MESSAGE_POPOVER_CLASS = "better-xiaoheihe-message-popover";
  const SETTINGS_ENTRY_CLASS = "better-xiaoheihe-settings-entry";
  const SETTINGS_PANEL_CLASS = "better-xiaoheihe-settings-panel";
  const AI_SUMMARY_MODAL_CLASS = "better-xiaoheihe-ai-summary-modal";
  const TOPIC_BLOCK_MENU_CLASS = "better-xiaoheihe-topic-block-menu";
  const HOT_SEARCH_SIDEBAR_CLASS = "better-xiaoheihe-hot-search-sidebar";
  const HOT_SEARCH_SIDEBAR_OPEN_CLASS = "better-xiaoheihe-hot-search-sidebar--open";
  const HOT_SEARCH_SIDEBAR_TOGGLE_CLASS = "better-xiaoheihe-hot-search-sidebar__toggle";
  const HOT_SEARCH_SIDEBAR_PANEL_CLASS = "better-xiaoheihe-hot-search-sidebar__panel";
  const HIDE_CY_COMMENTS_STORAGE_KEY = "better-xiaoheihe-hide-cy-comments";
  const BLOCKED_KEYWORDS_STORAGE_KEY = "better-xiaoheihe-blocked-keywords";
  const LEVEL_FILTERS_STORAGE_KEY = "better-xiaoheihe-level-filters";
  const COMMENT_PREVIEW_SORT_STORAGE_KEY = "better-xiaoheihe-comment-preview-sort";
  const AI_BOT_SETTINGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-settings";
  const AI_BOT_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-logs";
  const AI_BOT_MESSAGE_LOGS_STORAGE_KEY = "better-xiaoheihe-ai-bot-message-logs";
  const AI_BOT_REPLY_QUEUE_STORAGE_KEY = "better-xiaoheihe-ai-bot-reply-queue";
  const AI_BOT_CONSENT_STORAGE_KEY = "better-xiaoheihe-ai-bot-consent";
  const API_PARAMS_STORAGE_KEY = "better-xiaoheihe-api-params";
  const UI_STATE_STORAGE_KEY = "better-xiaoheihe-ui-state";
  const COMMENT_EMOJI_USAGE_STORAGE_KEY = "better-xiaoheihe-comment-emoji-usage";
  const AI_BOT_LOG_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
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
  const AI_BOT_MIN_FEED_POLL_MINUTES = 10;
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
  const DEFAULT_USER_LEVEL = 6;
  const LEVEL_FILTER_MIN = 7;
  const LEVEL_FILTER_MAX = 25;
  const BLOCKED_KEYWORD_SCOPES = {
    COMMENT: "comment",
    FEED: "feed"
  };
  const SETTINGS_TABS = {
    FEED: "feed",
    COMMENT: "comment",
    AI: "ai",
    AIBOT: "aibot",
    AIBOT_LOGS: "aibot-logs"
  };
  const COMMENT_PREVIEW_SORTS = {
    DEFAULT: "default",
    HOT: "hot",
    NEWEST: "newest",
    AUTHOR: "author"
  };
  const COMMENT_PREVIEW_SORT_LABELS = {
    [COMMENT_PREVIEW_SORTS.DEFAULT]: "默认",
    [COMMENT_PREVIEW_SORTS.HOT]: "热度",
    [COMMENT_PREVIEW_SORTS.NEWEST]: "最新",
    [COMMENT_PREVIEW_SORTS.AUTHOR]: "作者优先"
  };
  const BLOCKED_KEYWORD_SCOPE_LABELS = {
    [BLOCKED_KEYWORD_SCOPES.COMMENT]: "评论",
    [BLOCKED_KEYWORD_SCOPES.FEED]: "帖子"
  };
  const ROW_CLASS = "better-xiaoheihe-feed-row";
  const PREVIEW_CLASS = "better-xiaoheihe-comment-preview";
  const IMAGE_VIEWER_CLASS = "better-xiaoheihe-image-viewer";
  const FEED_ITEM_SELECTOR = 'a.hb-cpt__bbs-list-content[href*="/app/bbs/link/"], a.hb-cpt__bbs-content[href*="/app/bbs/link/"]';
  const API_PATH = "/bbs/app/link/tree";
  const SUB_COMMENT_API_PATH = "/bbs/app/comment/sub/comments";
  const COMMENT_SUPPORT_API_PATH = "/bbs/app/comment/support";
  const COMMENT_CREATE_API_PATH = "/bbs/app/comment/create";
  const COMMENT_UPLOAD_INFO_API_PATH = "/bbs/app/api/qcloud/cos/upload/info/v2";
  const COMMENT_UPLOAD_TOKEN_API_PATH = "/bbs/app/api/qcloud/cos/upload/token/v2";
  const COMMENT_UPLOAD_CALLBACK_API_PATH = "/bbs/app/api/qcloud/cos/upload/callback/v2";
  const LINK_AWARD_API_PATH = "/bbs/app/profile/award/link";
  const MESSAGE_API_PATH = "/bbs/app/user/message";
  const EMOJI_API_PATH = "/bbs/app/api/emojis/list";
  const FEEDS_API_PATH = "/bbs/app/feeds";
  const SEARCH_WELCOME_API_PATH = "/bbs/app/api/search/welcome_page/v2";
  const API_ORIGIN = "https://api.xiaoheihe.cn";
  const COMMENT_PAGE_LIMIT = 20;
  const SUB_COMMENT_PAGE_LIMIT = 20;
  const COMMENT_REPLY_TEXT_MAX_LENGTH = 1000;
  const COMMENT_REPLY_IMAGE_MAX_COUNT = 9;
  const POST_COMMENT_TARGET_ID = "__post__";
  const COMMENT_IDENTITY_RETRY_DELAY = 1000;
  const SUMMARY_COMMENT_LIMIT = 10;
  const IDENTITY_COOKIE_NAMES = ["heybox_id", "user_heybox_id"];
  const CAPTURED_API_PARAM_KEYS = [
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

  const commentCache = new Map();
  const emojiCache = new Map();
  const userLevelCache = new Map();
  const aiSummaryCache = new Map();
  const aiSummaryChatSending = new Set();
  const blockedKeywordHitKeys = new Set();
  const linkPageCommentTimeCache = new WeakMap();
  const capturedApiParams = {};
  let lastSavedApiParamsText = "";
  let hideCyComments = false;
  let commentPreviewSort = COMMENT_PREVIEW_SORTS.DEFAULT;
  let blockedKeywords = [];
  let levelFilters = normalizeLevelFilters({});
  let aiSettings = normalizeAiSettings();
  let aiBotSettings = normalizeAiBotSettings();
  let uiState = normalizeUiState();
  let aiBotLogs = [];
  let aiBotMessageLogs = [];
  let aiBotReplyQueue = [];
  let aiBotConsentAccepted = false;
  let emojiUsageStats = normalizeEmojiUsageStats();
  let aiBotLogRefreshTimer = null;
  let aiBotLogRefreshRunning = false;
  let activeAiBotLogView = "runtime";
  let activeAiBotMessageLogFilter = "all";
  const expandedAiBotLogIds = new Set();
  const aiConnectionStatus = {
    ai: { state: "idle", fingerprint: "" },
    aiBot: { state: "idle", fingerprint: "" }
  };
  let useLegacyLocalSettingsSync = true;
  const aiPendingRequests = new Map();
  let activeBlockedKeywordScope = BLOCKED_KEYWORD_SCOPES.FEED;
  let activeSettingsTab = SETTINGS_TABS.FEED;
  let hotSearchPromise = null;
  let leftMenuOriginalPosition = null;
  let emojiPromise = null;
  let scheduled = false;
  let handlingPage = false;
  let savedScrollY = null;
  let linkPageFilterRefreshTimer = null;
  let previewObserver = null;
  let rowResizeObserver = null;
  let topMenuOutsideClickBound = false;
  let settingsPanelOutsideClickBound = false;
  let messagePopoverOutsideClickBound = false;
  let headerMessageClickBound = false;
  let feedAiCaptureBound = false;
  let feedAwardCaptureBound = false;
  let feedImageCaptureBound = false;
  let heyboxWebLinkCaptureBound = false;
  let topicBlockContextMenuBound = false;
  let imageViewerKeydownBound = false;
  let replyEmojiOutsideClickBound = false;
  let activeReplyEmojiForm = null;
  const messagePopoverState = {
    activeTab: "reply",
    tabs: {
      reply: { messages: [], offset: 0, hasMore: true, loading: false },
      award: { messages: [], offset: 0, hasMore: true, loading: false }
    }
  };
  let aiSummaryScrollLocked = false;
  let aiSummaryPreviousBodyOverflow = "";
  let aiSummaryPreviousDocumentOverflow = "";
  let activeImageViewerImages = [];
  let activeImageViewerIndex = 0;
  let documentOverflowBeforeImageViewer = "";

  function isEnhancedPage() {
    return window.location.hostname === "www.xiaoheihe.cn"
      && ENHANCED_PATH_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
  }

  function isLinkPage() {
    return LINK_PATH_REGEXP.test(window.location.pathname);
  }

  function getCurrentLinkId() {
    return window.location.pathname.match(LINK_PATH_REGEXP)?.[1] || "";
  }

  function isSearchPage() {
    return window.location.pathname.startsWith("/app/search");
  }

  function parseEventDetail(detail) {
    if (typeof detail !== "string") {
      return detail || {};
    }

    try {
      return JSON.parse(detail) || {};
    } catch {
      return {};
    }
  }

  function stringifyEventDetail(detail) {
    return JSON.stringify(detail || {});
  }

  function readLegacyHideCyCommentsState() {
    try {
      const savedValue = localStorage.getItem(HIDE_CY_COMMENTS_STORAGE_KEY);
      return savedValue === "1" || savedValue === "true";
    } catch {
      return false;
    }
  }

  function hasLegacyLocalStorageValue(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  function writeHideCyCommentsState(isHidden) {
    saveLocalSettings({
      [HIDE_CY_COMMENTS_STORAGE_KEY]: isHidden
    });
  }

  function syncHideCyCommentsState(savedState) {
    const normalizedState = savedState === true || savedState === "1" || savedState === "true";
    if (normalizedState === hideCyComments) {
      syncCyToggleControls();
      return;
    }

    hideCyComments = normalizedState;
    syncCyToggleControls();
    refreshAllCommentFilters();
  }

  function syncLegacyHideCyCommentsState() {
    const savedState = readLegacyHideCyCommentsState();
    if (savedState === hideCyComments) {
      syncCyToggleControls();
      return;
    }

    hideCyComments = savedState;
    syncCyToggleControls();
    refreshAllCommentFilters();
  }

  function normalizeCommentPreviewSort(sort) {
    return Object.values(COMMENT_PREVIEW_SORTS).includes(sort)
      ? sort
      : COMMENT_PREVIEW_SORTS.DEFAULT;
  }

  function writeCommentPreviewSortState(sort) {
    saveLocalSettings({
      [COMMENT_PREVIEW_SORT_STORAGE_KEY]: normalizeCommentPreviewSort(sort)
    });
  }

  function syncCommentPreviewSortState(savedState) {
    const normalizedSort = normalizeCommentPreviewSort(savedState);
    if (normalizedSort === commentPreviewSort) {
      syncCommentSortControls();
      return;
    }

    commentPreviewSort = normalizedSort;
    syncCommentSortControls();
    refreshAllCommentFilters();
  }

  function normalizeEmojiUsageStats(value) {
    if (!value || typeof value !== "object") {
      return {};
    }

    return Object.entries(value).reduce((result, [token, count]) => {
      const normalizedToken = String(token || "").trim();
      const normalizedCount = Math.max(0, Number.parseInt(count, 10) || 0);
      if (normalizedToken && normalizedCount) {
        result[normalizedToken] = normalizedCount;
      }
      return result;
    }, {});
  }

  function persistEmojiUsageStats() {
    saveLocalSettings({
      [COMMENT_EMOJI_USAGE_STORAGE_KEY]: normalizeEmojiUsageStats(emojiUsageStats)
    });
  }

  function syncEmojiUsageStats(savedStats) {
    emojiUsageStats = normalizeEmojiUsageStats(savedStats);
  }

  function normalizeBlockedKeyword(keyword) {
    return String(keyword || "").trim();
  }

  function normalizeBlockedKeywordScope(scope) {
    if (scope === "content" || scope === "topic") {
      return BLOCKED_KEYWORD_SCOPES.FEED;
    }

    return Object.values(BLOCKED_KEYWORD_SCOPES).includes(scope)
      ? scope
      : BLOCKED_KEYWORD_SCOPES.COMMENT;
  }

  function normalizeBlockedKeywords(keywords) {
    const seen = new Set();
    return (Array.isArray(keywords) ? keywords : [])
      .map((item) => {
        const keyword = normalizeBlockedKeyword(typeof item === "string" ? item : item?.keyword);
        const count = Math.max(0, Number.parseInt(typeof item === "object" && item ? item.count : 0, 10) || 0);
        const scope = normalizeBlockedKeywordScope(typeof item === "object" && item ? item.scope : null);
        return { keyword, count, scope };
      })
      .filter((item) => {
        const key = `${item.scope}:${item.keyword.toLowerCase()}`;
        if (!item.keyword || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  function serializeBlockedKeywordsState() {
    return blockedKeywords.map((item) => ({
      keyword: item.keyword,
      count: Math.max(0, Number.parseInt(item.count, 10) || 0),
      scope: normalizeBlockedKeywordScope(item.scope)
    }));
  }

  function persistBlockedKeywordsState() {
    saveLocalSettings({
      [BLOCKED_KEYWORDS_STORAGE_KEY]: serializeBlockedKeywordsState()
    });
  }

  function readLegacyBlockedKeywordsState() {
    try {
      return normalizeBlockedKeywords(JSON.parse(localStorage.getItem(BLOCKED_KEYWORDS_STORAGE_KEY) || "[]"));
    } catch {
      return [];
    }
  }

  function writeBlockedKeywordsState(keywords) {
    blockedKeywords = normalizeBlockedKeywords(keywords);
    persistBlockedKeywordsState();
  }

  function createDefaultLevelFilter() {
    return {
      enabled: false,
      maxLevel: LEVEL_FILTER_MIN
    };
  }

  function normalizeLevelFilter(filter) {
    const normalized = createDefaultLevelFilter();
    if (!filter || typeof filter !== "object") {
      return normalized;
    }

    const maxLevel = Number.parseInt(filter.maxLevel, 10);
    normalized.enabled = filter.enabled === true || filter.enabled === "1" || filter.enabled === "true";
    normalized.maxLevel = Math.min(LEVEL_FILTER_MAX, Math.max(LEVEL_FILTER_MIN, Number.isFinite(maxLevel) ? maxLevel : LEVEL_FILTER_MIN));
    return normalized;
  }

  function normalizeLevelFilters(filters) {
    return Object.values(BLOCKED_KEYWORD_SCOPES).reduce((result, scope) => {
      result[scope] = normalizeLevelFilter(filters?.[scope]);
      return result;
    }, {});
  }

  function normalizeUiState(state) {
    return {
      aiConnectionConfigOpen: state?.aiConnectionConfigOpen !== false,
      aiBotConnectionConfigOpen: state?.aiBotConnectionConfigOpen !== false,
      aiBotAutoReplyOpen: state?.aiBotAutoReplyOpen === true,
      aiBotAutoFeedOpen: state?.aiBotAutoFeedOpen === true,
      aiBotMessageLogFilter: ["all", "mention", "comment", "feed"].includes(state?.aiBotMessageLogFilter)
        ? state.aiBotMessageLogFilter
        : "all",
      aiSummaryWindowLeft: state?.aiSummaryWindowLeft !== null
        && state?.aiSummaryWindowLeft !== undefined
        && Number.isFinite(Number(state.aiSummaryWindowLeft))
        ? Math.max(0, Number(state.aiSummaryWindowLeft))
        : null,
      aiSummaryWindowTop: state?.aiSummaryWindowTop !== null
        && state?.aiSummaryWindowTop !== undefined
        && Number.isFinite(Number(state.aiSummaryWindowTop))
        ? Math.max(0, Number(state.aiSummaryWindowTop))
        : null
    };
  }

  function getConnectionConfigStateKey(scope) {
    return scope === "aiBot" ? "aiBotConnectionConfigOpen" : "aiConnectionConfigOpen";
  }

  function persistUiState() {
    saveLocalSettings({
      [UI_STATE_STORAGE_KEY]: uiState
    });
  }

  function setConnectionConfigOpen(scope, isOpen) {
    uiState = normalizeUiState({
      ...uiState,
      [getConnectionConfigStateKey(scope)]: Boolean(isOpen)
    });
    persistUiState();
  }

  function syncUiState(savedState) {
    const normalizedState = normalizeUiState(savedState);
    if (JSON.stringify(normalizedState) === JSON.stringify(uiState)) {
      return;
    }
    uiState = normalizedState;
    activeAiBotMessageLogFilter = normalizedState.aiBotMessageLogFilter;
    renderSettingsPanel();
  }

  function readLegacyLevelFiltersState() {
    try {
      return normalizeLevelFilters(JSON.parse(localStorage.getItem(LEVEL_FILTERS_STORAGE_KEY) || "{}"));
    } catch {
      return normalizeLevelFilters({});
    }
  }

  function normalizeAiSettings(settings = {}) {
    const provider = Object.values(AI_PROVIDERS).includes(settings?.provider || settings?.endpointMode)
      ? (settings?.provider || settings?.endpointMode)
      : DEFAULT_AI_PROVIDER;
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: String(settings?.baseUrl || AI_PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, ""),
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
    const provider = Object.values(AI_PROVIDERS).includes(settings?.provider || settings?.endpointMode)
      ? (settings?.provider || settings?.endpointMode)
      : DEFAULT_AI_PROVIDER;
    const isEnabled = settings?.enabled === true;
    const replyMentions = isEnabled && settings?.replyMentions !== false;
    const replyComments = isEnabled && settings?.replyComments === true;
    const commentHomeFeed = isEnabled && settings?.commentHomeFeed === true;
    return {
      enabled: replyMentions || replyComments || commentHomeFeed,
      provider,
      endpointMode: provider,
      baseUrl: String(settings?.baseUrl || AI_PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, ""),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      pollMinutes: Math.max(1, Number.parseInt(settings?.pollMinutes, 10) || 1),
      feedPollMinutes: Math.max(AI_BOT_MIN_FEED_POLL_MINUTES, Number.parseInt(settings?.feedPollMinutes, 10) || AI_BOT_MIN_FEED_POLL_MINUTES),
      feedSelectStrategy: ["first", "latest", "hot"].includes(settings?.feedSelectStrategy) ? settings.feedSelectStrategy : "first",
      messageFreshMinutes: Math.max(1, Number.parseInt(settings?.messageFreshMinutes, 10) || 5),
      replyLimitPerLinkUser: Math.max(1, Number.parseInt(settings?.replyLimitPerLinkUser, 10) || 5),
      globalHistoryEnabled: settings?.globalHistoryEnabled !== false,
      globalHistoryLimit: Math.min(
        AI_BOT_MAX_GLOBAL_HISTORY_LIMIT,
        Math.max(1, Number.parseInt(settings?.globalHistoryLimit, 10) || AI_BOT_DEFAULT_GLOBAL_HISTORY_LIMIT)
      ),
      replyMentions,
      replyComments,
      commentHomeFeed,
      whitelistUserIds: normalizeIdList(settings?.whitelistUserIds || settings?.whitelistText),
      rejectedReplyKeywords: normalizeKeywordList(settings?.rejectedReplyKeywords || settings?.rejectedReplyKeywordsText),
      allowEmoji: settings?.allowEmoji !== false,
      commentPrompt: String(settings?.commentPrompt || "").trim() || AI_BOT_DEFAULT_PROMPT,
      feedCommentPrompt: String(settings?.feedCommentPrompt || "").trim() || AI_BOT_DEFAULT_FEED_PROMPT
    };
  }

  function normalizeAiBotLogs(logs) {
    const now = Date.now();
    return (Array.isArray(logs) ? logs : [])
      .filter((log) => Number(log?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
      .sort((left, right) => Number(right?.timestamp || 0) - Number(left?.timestamp || 0));
  }

  function normalizeAiBotMessageLogs(logs) {
    const now = Date.now();
    return (Array.isArray(logs) ? logs : [])
      .filter((log) => !log?.skipped && Number(log?.timestamp || 0) >= now - AI_BOT_LOG_RETENTION_MS)
      .sort((left, right) => Number(right?.sentTimestamp || right?.timestamp || 0) - Number(left?.sentTimestamp || left?.timestamp || 0));
  }

  function normalizeAiBotReplyQueue(queue) {
    return (Array.isArray(queue) ? queue : [])
      .map((item) => ({
        ...item,
        queuedAt: Number(item?.queuedAt || 0),
        messageTimestamp: Number(item?.messageTimestamp || 0)
      }))
      .filter((item) => item.messageId && item.queuedAt)
      .sort((left, right) => Number(right.messageTimestamp || right.queuedAt) - Number(left.messageTimestamp || left.queuedAt));
  }

  function getTodayStartTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }

  function getAiBotTodayStats() {
    const todayStart = getTodayStartTimestamp();
    const feedLinkIds = new Set();
    let commentReplies = 0;
    let mentionReplies = 0;

    aiBotMessageLogs.forEach((log) => {
      const sentTimestamp = Number(log?.sentTimestamp || log?.timestamp || 0);
      if (!sentTimestamp || sentTimestamp < todayStart || log?.skipped) {
        return;
      }
      if (log.messageSource === "feed") {
        feedLinkIds.add(String(log.linkId || log.messageId || sentTimestamp));
      } else if (log.messageSource === "comment") {
        commentReplies += 1;
      } else if (log.messageSource === "mention") {
        mentionReplies += 1;
      }
    });

    return {
      feedComments: feedLinkIds.size,
      commentReplies,
      mentionReplies
    };
  }

  function persistAiBotSettingsState() {
    saveLocalSettings({
      [AI_BOT_SETTINGS_STORAGE_KEY]: aiBotSettings
    });
  }

  function writeAiBotSettingsState(settings) {
    aiBotSettings = normalizeAiBotSettings(settings);
    persistAiBotSettingsState();
  }

  function isAiFeatureEnabled() {
    return aiSettings.enabled;
  }

  function isAiConfigured() {
    return Boolean(aiSettings.baseUrl && aiSettings.model);
  }

  function persistLevelFiltersState() {
    saveLocalSettings({
      [LEVEL_FILTERS_STORAGE_KEY]: levelFilters
    });
  }

  function writeLevelFilterState(scope, nextFilter, options = {}) {
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    levelFilters = normalizeLevelFilters({
      ...levelFilters,
      [normalizedScope]: {
        ...levelFilters[normalizedScope],
        ...nextFilter
      }
    });
    if (options.persist !== false) {
      persistLevelFiltersState();
    }
  }

  function syncLevelFiltersState(savedFilters) {
    const normalizedFilters = normalizeLevelFilters(savedFilters);
    if (JSON.stringify(normalizedFilters) === JSON.stringify(levelFilters)) {
      renderSettingsPanel();
      return;
    }

    levelFilters = normalizedFilters;
    renderSettingsPanel();
    refreshAllKeywordFilters();
  }

  function syncLegacyLevelFiltersState() {
    const savedFilters = readLegacyLevelFiltersState();
    if (JSON.stringify(savedFilters) === JSON.stringify(levelFilters)) {
      renderSettingsPanel();
      return;
    }

    levelFilters = savedFilters;
    renderSettingsPanel();
    refreshAllKeywordFilters();
  }

  function syncBlockedKeywordsState(savedKeywords) {
    const normalizedKeywords = normalizeBlockedKeywords(savedKeywords);
    if (JSON.stringify(normalizedKeywords) === JSON.stringify(blockedKeywords)) {
      return;
    }

    blockedKeywords = normalizedKeywords;
    renderSettingsPanel();
    refreshAllKeywordFilters();
  }

  function syncLegacyBlockedKeywordsState() {
    const savedKeywords = readLegacyBlockedKeywordsState();
    if (JSON.stringify(savedKeywords) === JSON.stringify(blockedKeywords)) {
      return;
    }

    blockedKeywords = savedKeywords;
    renderSettingsPanel();
    refreshAllKeywordFilters();
  }

  function saveLocalSettings(values) {
    window.dispatchEvent(new CustomEvent(LOCAL_SETTINGS_SAVE_EVENT, {
      detail: stringifyEventDetail({
        values
      })
    }));
  }

  function requestLocalSettingsState(timeout = 1200) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        window.removeEventListener(LOCAL_SETTINGS_RESPONSE_EVENT, handleResponse);
        resolve({
          ok: false,
          values: {},
          keysPresent: {}
        });
      }, timeout);

      function handleResponse(event) {
        const detail = parseEventDetail(event.detail);
        if (detail.id !== id) {
          return;
        }

        window.clearTimeout(timer);
        window.removeEventListener(LOCAL_SETTINGS_RESPONSE_EVENT, handleResponse);
        resolve(detail);
      }

      window.addEventListener(LOCAL_SETTINGS_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(LOCAL_SETTINGS_REQUEST_EVENT, {
        detail: stringifyEventDetail({
          id,
          keys: LOCAL_SETTINGS_STORAGE_KEYS
        })
      }));
    });
  }

  function applyLocalSettingsValues(values = {}) {
    hideCyComments = values[HIDE_CY_COMMENTS_STORAGE_KEY] === true
      || values[HIDE_CY_COMMENTS_STORAGE_KEY] === "1"
      || values[HIDE_CY_COMMENTS_STORAGE_KEY] === "true";
    blockedKeywords = normalizeBlockedKeywords(values[BLOCKED_KEYWORDS_STORAGE_KEY]);
    levelFilters = normalizeLevelFilters(values[LEVEL_FILTERS_STORAGE_KEY]);
    commentPreviewSort = normalizeCommentPreviewSort(values[COMMENT_PREVIEW_SORT_STORAGE_KEY]);
    aiBotSettings = normalizeAiBotSettings(values[AI_BOT_SETTINGS_STORAGE_KEY]);
    uiState = normalizeUiState(values[UI_STATE_STORAGE_KEY]);
    activeAiBotMessageLogFilter = uiState.aiBotMessageLogFilter;
    aiBotLogs = normalizeAiBotLogs(values[AI_BOT_LOGS_STORAGE_KEY]);
    aiBotMessageLogs = normalizeAiBotMessageLogs(values[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
    aiBotReplyQueue = normalizeAiBotReplyQueue(values[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
    aiBotConsentAccepted = values[AI_BOT_CONSENT_STORAGE_KEY] === true;
    emojiUsageStats = normalizeEmojiUsageStats(values[COMMENT_EMOJI_USAGE_STORAGE_KEY]);
  }

  async function loadLocalSettingsState() {
    let response = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await requestLocalSettingsState(1200 + attempt * 800);
      if (response?.ok) {
        break;
      }
    }

    const values = response?.ok ? (response.values || {}) : {};
    const keysPresent = response?.ok ? (response.keysPresent || {}) : {};
    const nextValues = {};
    const migrationValues = {};
    useLegacyLocalSettingsSync = !response?.ok;

    if (keysPresent[HIDE_CY_COMMENTS_STORAGE_KEY]) {
      nextValues[HIDE_CY_COMMENTS_STORAGE_KEY] = values[HIDE_CY_COMMENTS_STORAGE_KEY];
    } else if (hasLegacyLocalStorageValue(HIDE_CY_COMMENTS_STORAGE_KEY)) {
      nextValues[HIDE_CY_COMMENTS_STORAGE_KEY] = readLegacyHideCyCommentsState();
      migrationValues[HIDE_CY_COMMENTS_STORAGE_KEY] = nextValues[HIDE_CY_COMMENTS_STORAGE_KEY];
    } else {
      nextValues[HIDE_CY_COMMENTS_STORAGE_KEY] = false;
    }

    if (keysPresent[BLOCKED_KEYWORDS_STORAGE_KEY]) {
      nextValues[BLOCKED_KEYWORDS_STORAGE_KEY] = normalizeBlockedKeywords(values[BLOCKED_KEYWORDS_STORAGE_KEY]);
    } else if (hasLegacyLocalStorageValue(BLOCKED_KEYWORDS_STORAGE_KEY)) {
      nextValues[BLOCKED_KEYWORDS_STORAGE_KEY] = readLegacyBlockedKeywordsState();
      migrationValues[BLOCKED_KEYWORDS_STORAGE_KEY] = nextValues[BLOCKED_KEYWORDS_STORAGE_KEY];
    } else {
      nextValues[BLOCKED_KEYWORDS_STORAGE_KEY] = [];
    }

    if (keysPresent[LEVEL_FILTERS_STORAGE_KEY]) {
      nextValues[LEVEL_FILTERS_STORAGE_KEY] = normalizeLevelFilters(values[LEVEL_FILTERS_STORAGE_KEY]);
    } else if (hasLegacyLocalStorageValue(LEVEL_FILTERS_STORAGE_KEY)) {
      nextValues[LEVEL_FILTERS_STORAGE_KEY] = readLegacyLevelFiltersState();
      migrationValues[LEVEL_FILTERS_STORAGE_KEY] = nextValues[LEVEL_FILTERS_STORAGE_KEY];
    } else {
      nextValues[LEVEL_FILTERS_STORAGE_KEY] = normalizeLevelFilters({});
    }

    if (keysPresent[COMMENT_PREVIEW_SORT_STORAGE_KEY]) {
      nextValues[COMMENT_PREVIEW_SORT_STORAGE_KEY] = normalizeCommentPreviewSort(values[COMMENT_PREVIEW_SORT_STORAGE_KEY]);
    } else {
      nextValues[COMMENT_PREVIEW_SORT_STORAGE_KEY] = COMMENT_PREVIEW_SORTS.DEFAULT;
    }

    nextValues[AI_BOT_SETTINGS_STORAGE_KEY] = keysPresent[AI_BOT_SETTINGS_STORAGE_KEY]
      ? normalizeAiBotSettings(values[AI_BOT_SETTINGS_STORAGE_KEY])
      : normalizeAiBotSettings();
    nextValues[AI_BOT_LOGS_STORAGE_KEY] = keysPresent[AI_BOT_LOGS_STORAGE_KEY]
      ? normalizeAiBotLogs(values[AI_BOT_LOGS_STORAGE_KEY])
      : [];
    nextValues[AI_BOT_MESSAGE_LOGS_STORAGE_KEY] = keysPresent[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]
      ? normalizeAiBotMessageLogs(values[AI_BOT_MESSAGE_LOGS_STORAGE_KEY])
      : [];
    nextValues[AI_BOT_REPLY_QUEUE_STORAGE_KEY] = keysPresent[AI_BOT_REPLY_QUEUE_STORAGE_KEY]
      ? normalizeAiBotReplyQueue(values[AI_BOT_REPLY_QUEUE_STORAGE_KEY])
      : [];
    nextValues[AI_BOT_CONSENT_STORAGE_KEY] = keysPresent[AI_BOT_CONSENT_STORAGE_KEY]
      ? values[AI_BOT_CONSENT_STORAGE_KEY] === true
      : false;
    nextValues[UI_STATE_STORAGE_KEY] = keysPresent[UI_STATE_STORAGE_KEY]
      ? normalizeUiState(values[UI_STATE_STORAGE_KEY])
      : normalizeUiState();
    nextValues[COMMENT_EMOJI_USAGE_STORAGE_KEY] = keysPresent[COMMENT_EMOJI_USAGE_STORAGE_KEY]
      ? normalizeEmojiUsageStats(values[COMMENT_EMOJI_USAGE_STORAGE_KEY])
      : {};

    applyLocalSettingsValues(nextValues);

    if (Object.keys(migrationValues).length) {
      saveLocalSettings(migrationValues);
    }
  }

  function injectLayoutStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content {
        align-items: flex-start !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-website__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__main,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content {
        box-sizing: border-box !important;
        min-width: 0 !important;
        max-width: none !important;
        width: min(1280px, calc(100vw - 192px)) !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-website__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__main,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content {
        margin-right: auto !important;
        margin-left: auto !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content--left {
        flex: 1 1 0 !important;
        max-width: none !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .content,
      .${HOME_LAYOUT_CLASS} .hb-page__app .content > .list,
      .${HOME_LAYOUT_CLASS} .hb-page__app main.list,
      .${HOME_LAYOUT_CLASS} #page-topic-link,
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__content,
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__main,
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__panel {
        box-sizing: border-box !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container--main,
      .${HOME_LAYOUT_CLASS} .hb-view-header .hb-layout-main__container--main,
      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list,
      .${HOME_LAYOUT_CLASS} .hb-bbs-home,
      .${HOME_LAYOUT_CLASS} .bbs-home__content-item,
      .${HOME_LAYOUT_CLASS} .bbs-home__content-list,
      .${HOME_LAYOUT_CLASS} .topic-link__item,
      .${HOME_LAYOUT_CLASS} .topic-link__list {
        box-sizing: border-box !important;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        max-width: none !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .content > .list,
      .${HOME_LAYOUT_CLASS} .hb-page__app main.list,
      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home {
        position: relative !important;
        left: 50% !important;
        width: min(1280px, calc(100vw - 192px)) !important;
        max-width: none !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__list {
        position: relative !important;
        left: 50% !important;
        width: min(1280px, calc(100vw - 192px)) !important;
        max-width: none !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__header,
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__filter-row {
        box-sizing: border-box !important;
        width: min(1280px, calc(100vw - 192px)) !important;
        max-width: none !important;
        margin-right: auto !important;
        margin-left: auto !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home > .bbs-home__topic-list-wrapper,
      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home > .bbs-home__content-list {
        width: 100% !important;
        max-width: none !important;
      }

      .${HOME_LAYOUT_CLASS} .bbs-home__topic-list-wrapper,
      .${HOME_LAYOUT_CLASS} .bbs-home__topic-list,
      .${HOME_LAYOUT_CLASS} .bbs-home__topic-list .hb-cpt__pagination-outer {
        min-width: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .bbs-home__topic-list .hb-cpt__pagination-inner {
        display: flex !important;
        min-width: 0 !important;
        overflow-x: auto !important;
        overflow-y: hidden !important;
        scrollbar-width: none;
      }

      .${HOME_LAYOUT_CLASS} .bbs-home__topic-list .hb-cpt__pagination-inner::-webkit-scrollbar {
        display: none;
      }

      .${HOME_LAYOUT_CLASS} .bbs-community__search-module {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-bbs-community::before {
        content: none !important;
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-bbs-community .list::before {
        content: none !important;
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} .bbs-home__topic-item {
        flex: 0 0 auto !important;
      }

      .hb-layout__content--right,
      .cpt-right-side,
      .bbs-community-hot-topic,
      .hot-search,
      .right-side-default.default-content {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-website__container > .hb-layout-main__container--left,
      .${HOME_LAYOUT_CLASS} .hb-layout__main > .hb-layout-main__container--left:has(.hb-websit__left-section),
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container--left:has(.hb-websit__left-section) {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS} {
        box-sizing: border-box;
        display: flex;
        position: relative;
        flex: 0 0 auto;
        min-width: 0;
        margin: 0 10px 0 0;
        order: -1;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_TOGGLE_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 8px;
        background: #f3f4f5;
        color: #14191e;
        cursor: pointer;
        font-size: 20px;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_TOGGLE_CLASS}:hover {
        background: #eceff2;
      }

      .${FAVORITE_ENTRY_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        min-width: 0;
        height: 36px;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-left: 8px;
        padding: 0 12px;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #14191e;
        font-size: 13px;
        font-weight: 600;
        line-height: 36px;
        text-decoration: none;
        white-space: nowrap;
        transition: background 0.16s ease, color 0.16s ease;
      }

      .${FAVORITE_ENTRY_CLASS}:hover {
        background: #eceff2;
        color: #000;
      }

      .${FAVORITE_ENTRY_CLASS} .better-xiaoheihe-favorite-entry__icon {
        font-size: 16px;
        line-height: 1;
      }

      .${HEADER_SEARCH_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        width: clamp(180px, 24vw, 320px);
        height: 36px;
        min-width: 0;
        align-items: center;
        gap: 6px;
        margin-left: 8px;
        padding: 0 8px 0 12px;
        border: 1px solid #e2e6ea;
        border-radius: 8px;
        background: #f7f8f9;
        color: #14191e;
        transition: border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease;
      }

      .${HEADER_SEARCH_CLASS}:focus-within {
        border-color: #9dbde0;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(39, 117, 209, 0.12);
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__input {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        height: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: #14191e;
        font-size: 13px;
        line-height: 36px;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__input::placeholder {
        color: #8a9299;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__submit {
        display: inline-flex;
        width: 24px;
        height: 24px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #59636e;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__submit:hover {
        background: #e9edf1;
        color: #14191e;
      }

      .${HEADER_MESSAGE_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        position: relative;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        margin-left: 6px;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #14191e;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        transition: background 0.16s ease, color 0.16s ease;
      }

      .${HEADER_MESSAGE_CLASS}:hover,
      .${HEADER_MESSAGE_CLASS}[aria-expanded="true"] {
        background: #eceff2;
        color: #000;
      }

      .${HEADER_MESSAGE_CLASS} i {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-style: normal;
        font-weight: 700;
        line-height: 1;
      }

      .${HEADER_MESSAGE_CLASS} .better-header-message__icon {
        width: 19px;
        height: 19px;
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
      }

      .${HEADER_MESSAGE_CLASS}.is-loading::after {
        position: absolute;
        right: 6px;
        bottom: 6px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2775d1;
        content: "";
      }

      .${MESSAGE_POPOVER_CLASS} {
        box-sizing: border-box;
        position: fixed;
        z-index: 2147483647;
        width: min(420px, calc(100vw - 24px));
        max-height: min(620px, calc(100vh - 24px));
        overflow: hidden;
        border: 1px solid #e5eaf0;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 18px 45px rgba(20, 25, 30, 0.18);
        color: #14191e;
      }

      .${MESSAGE_POPOVER_CLASS}[hidden] {
        display: none !important;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 12px 10px;
        border-bottom: 1px solid #eef1f4;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__title {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 2px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__title strong {
        overflow: hidden;
        color: #14191e;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__body {
        max-height: min(540px, calc(100vh - 112px));
        overflow-y: auto;
        padding: 10px;
        background: #f6f8fa;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__tabs {
        display: inline-flex;
        flex: 0 0 auto;
        gap: 4px;
        padding: 3px;
        border-radius: 8px;
        background: #f1f4f7;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__tab {
        height: 26px;
        padding: 0 10px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #6f7b87;
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__tab[aria-selected="true"] {
        background: #fff;
        color: #2775d1;
        box-shadow: 0 1px 2px rgba(20, 25, 30, 0.08);
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__state {
        padding: 28px 16px;
        color: #8a9299;
        font-size: 13px;
        line-height: 20px;
        text-align: center;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 8px;
        padding: 11px;
        border: 1px solid #e5eaf0;
        border-radius: 9px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(20, 25, 30, 0.04);
        color: inherit;
        text-decoration: none;
        transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item + .better-message-popover__item {
        margin-top: 8px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item:hover {
        border-color: #cfe0f4;
        box-shadow: 0 6px 18px rgba(39, 117, 209, 0.1);
        transform: translateY(-1px);
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item--award-post {
        border-color: #d9e9fb;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item--award-comment {
        border-color: #dbeee5;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__actor {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 8px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__avatar {
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: linear-gradient(135deg, #e9f2ff, #f2f5f8);
        color: #2775d1;
        font-size: 12px;
        font-weight: 800;
        line-height: 28px;
        text-align: center;
        object-fit: cover;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__likers {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        padding-left: 4px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__liker-avatar {
        width: 28px;
        height: 28px;
        margin-left: -4px;
        border: 2px solid #fff;
        border-radius: 50%;
        background: linear-gradient(135deg, #e9f2ff, #f2f5f8);
        color: #2775d1;
        font-size: 11px;
        font-weight: 800;
        line-height: 24px;
        text-align: center;
        object-fit: cover;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__liker-more {
        display: inline-flex;
        min-width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        margin-left: -4px;
        padding: 0 6px;
        border: 2px solid #fff;
        border-radius: 999px;
        background: #edf4fb;
        color: #607083;
        font-size: 10px;
        font-weight: 800;
        line-height: 24px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__actor-main {
        display: flex;
        min-width: 0;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 2px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__actor-line {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        line-height: 16px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__user {
        min-width: 0;
        overflow: hidden;
        color: #2775d1;
        font-weight: 800;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__action {
        flex: 0 0 auto;
        color: #6f7b87;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__time {
        color: #9aa3ad;
        font-size: 12px;
        line-height: 16px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__type {
        flex: 0 0 auto;
        margin-left: auto;
        padding: 1px 6px;
        border-radius: 999px;
        background: #eef5ff;
        color: #2775d1;
        font-size: 11px;
        font-weight: 800;
        line-height: 16px;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-title {
        display: -webkit-box;
        overflow: hidden;
        color: #6f7b87;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-desc {
        display: -webkit-box;
        overflow: hidden;
        color: #26313b;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__content {
        display: -webkit-box;
        overflow: hidden;
        padding: 8px 10px;
        border-radius: 8px;
        background: #f4f7fa;
        color: #26313b;
        font-size: 13px;
        font-weight: 600;
        line-height: 20px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__content .better-comment-preview__emoji {
        display: inline-block;
        width: 1.45em;
        height: 1.45em;
        margin: 0 1px;
        object-fit: contain;
        vertical-align: -0.32em;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__content .better-comment-preview__emoji--big {
        width: 2.2em;
        height: 2.2em;
        vertical-align: -0.58em;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-title .better-comment-preview__emoji,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-desc .better-comment-preview__emoji {
        display: inline-block;
        width: 1.35em;
        height: 1.35em;
        margin: 0 1px;
        object-fit: contain;
        vertical-align: -0.28em;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-title .better-comment-preview__emoji--big,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-desc .better-comment-preview__emoji--big {
        width: 1.7em;
        height: 1.7em;
        vertical-align: -0.42em;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__comment-target {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 7px;
        padding: 8px 10px;
        border-radius: 8px;
        background: #f3faf6;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__comment-target-label {
        color: #5a8a70;
        font-size: 11px;
        font-weight: 800;
        line-height: 15px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__target-images {
        display: flex;
        min-width: 0;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__target-images::-webkit-scrollbar {
        display: none;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__target-image {
        width: 52px;
        height: 52px;
        flex: 0 0 auto;
        border-radius: 7px;
        background: #eef1f4;
        object-fit: cover;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__context {
        display: flex;
        min-width: 0;
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        padding: 8px 9px;
        border-radius: 8px;
        background: #fafbfc;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-author {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 6px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-author-avatar {
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        border-radius: 50%;
        background: #eef1f4;
        color: #8a9299;
        font-size: 10px;
        font-weight: 800;
        line-height: 18px;
        text-align: center;
        object-fit: cover;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-author-name {
        min-width: 0;
        overflow: hidden;
        color: #4f5965;
        font-size: 12px;
        font-weight: 800;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-author-level {
        flex: 0 0 auto;
        padding: 0 5px;
        border-radius: 999px;
        background: #eef3f8;
        color: #607083;
        font-size: 10px;
        font-weight: 800;
        line-height: 15px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 7px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__thumbs {
        display: flex;
        min-width: 0;
        max-width: calc(100% - 96px);
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 1px;
        scrollbar-width: none;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__media-row {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 8px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__thumbs::-webkit-scrollbar {
        display: none;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__thumb {
        width: 56px;
        height: 56px;
        flex: 0 0 auto;
        border-radius: 7px;
        background: #eef1f4;
        object-fit: cover;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__topic {
        flex: 0 0 auto;
        max-width: 130px;
        overflow: hidden;
        padding: 1px 6px;
        border-radius: 999px;
        background: #f1f3f5;
        color: #9aa3ad;
        font-size: 11px;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__author {
        display: none;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-meta {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__footer-state {
        padding: 10px 8px 4px;
        color: #9aa3ad;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
      }

      .${SETTINGS_ENTRY_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        margin-left: 6px;
        margin-right: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #14191e;
        cursor: pointer;
        font-size: 20px;
        font-weight: 600;
        line-height: 1;
        transition: background 0.16s ease, color 0.16s ease;
      }

      .nav-actions > .${SETTINGS_ENTRY_CLASS}:has(+ .publish-btn),
      .nav-actions > .${SETTINGS_ENTRY_CLASS}.better-xiaoheihe-settings-entry--before-publish {
        margin-right: 8px;
        margin-left: 0;
      }

      .${SETTINGS_ENTRY_CLASS}:hover,
      .${SETTINGS_ENTRY_CLASS}[aria-expanded="true"] {
        background: #eceff2;
        color: #000;
      }

      .${SETTINGS_ENTRY_CLASS} i {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #000;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 1;
      }

      .${SETTINGS_PANEL_CLASS} {
        box-sizing: border-box;
        position: fixed;
        z-index: 10000;
        width: min(520px, calc(100vw - 24px));
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 12px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 10px 30px rgba(20, 25, 30, 0.14);
        color: #14191e;
        font-size: 13px;
        scrollbar-gutter: stable;
      }

      .${SETTINGS_PANEL_CLASS}[hidden] {
        display: none !important;
      }

      .${TOPIC_BLOCK_MENU_CLASS} {
        box-sizing: border-box;
        position: fixed;
        z-index: 10001;
        width: max-content;
        min-width: 0;
        max-width: calc(100vw - 16px);
        padding: 6px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 10px 30px rgba(20, 25, 30, 0.16);
        color: #14191e;
        font-size: 13px;
      }

      .${TOPIC_BLOCK_MENU_CLASS}[hidden] {
        display: none !important;
      }

      .${TOPIC_BLOCK_MENU_CLASS} .better-topic-block-menu__button {
        box-sizing: border-box;
        display: inline-flex;
        width: auto;
        max-width: calc(100vw - 28px);
        min-width: 0;
        align-items: center;
        gap: 6px;
        justify-content: flex-start;
        padding: 8px 10px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #14191e;
        cursor: pointer;
        font-size: 13px;
        line-height: 18px;
        text-align: left;
        white-space: nowrap;
      }

      .${TOPIC_BLOCK_MENU_CLASS} .better-topic-block-menu__button:hover {
        background: #f3f4f5;
      }

      .${TOPIC_BLOCK_MENU_CLASS} .better-topic-block-menu__icon {
        width: 15px;
        height: 15px;
        flex: 0 0 auto;
        color: #f04f5f;
      }

      .${TOPIC_BLOCK_MENU_CLASS} .better-topic-block-menu__label {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__title {
        margin-bottom: 10px;
        color: #14191e;
        font-weight: 600;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__desc {
        margin: -4px 0 10px;
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__form {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__section {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__section:last-child {
        margin-bottom: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__section-title {
        margin-bottom: 8px;
        color: #14191e;
        font-weight: 600;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section {
        overflow: hidden;
        margin-bottom: 12px;
        padding: 0;
        border: 1px solid #dfe7ef;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(20, 32, 44, 0.04);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section.is-model-menu-open {
        position: relative;
        z-index: 3;
        overflow: visible;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 40px;
        padding: 0 12px;
        border-bottom: 1px solid transparent;
        background: linear-gradient(180deg, #fbfdff, #f5f8fb);
        color: #14191e;
        cursor: pointer;
        font-weight: 600;
        line-height: 18px;
        list-style: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-summary::-webkit-details-marker {
        display: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-summary:hover {
        background: #eef5ff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-title {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-dot {
        width: 8px;
        height: 8px;
        flex: 0 0 auto;
        border: 1px solid #c9d2dc;
        border-radius: 50%;
        background: #b8c1ca;
        box-shadow: 0 0 0 3px rgba(184, 193, 202, 0.12);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-dot.is-ok {
        border-color: #1f9d7a;
        background: #13a97c;
        box-shadow: 0 0 0 3px rgba(19, 169, 124, 0.15);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-dot.is-error {
        border-color: #d33b4a;
        background: #e54858;
        box-shadow: 0 0 0 3px rgba(229, 72, 88, 0.14);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-indicator {
        width: 24px;
        height: 24px;
        flex: 0 0 auto;
        border-radius: 6px;
        background: #edf3f8;
        color: #59636e;
        transition: background-color 0.16s ease, color 0.16s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-indicator::before {
        content: "";
        display: block;
        width: 7px;
        height: 7px;
        margin: 7px auto 0;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(45deg);
        transition: transform 0.16s ease, margin-top 0.16s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-summary:hover .better-settings__collapsible-indicator {
        background: #dcecff;
        color: #1f66b8;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section[open] .better-settings__collapsible-indicator {
        background: #e7f5ee;
        color: #0b806f;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section[open] .better-settings__collapsible-indicator::before {
        margin-top: 9px;
        transform: rotate(225deg);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section[open] .better-settings__collapsible-summary {
        border-bottom-color: #e8eef4;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section > .better-settings__field {
        margin: 12px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__collapsible-section > .better-settings__field + .better-settings__field {
        margin-top: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__feed-poll-section {
        margin-top: 8px;
        margin-bottom: 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__feed-poll-section .better-settings__compact-number-grid {
        grid-template-columns: minmax(112px, 0.45fr) minmax(168px, 1fr);
        padding: 12px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__config-actions {
        display: block;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        padding: 10px 12px;
        border-top: 1px solid #e8eef4;
        background: #f7fafc;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-value {
        color: #59636e;
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-toggle {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-enabled {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-switch {
        box-sizing: border-box;
        display: inline-flex;
        position: relative;
        width: 42px;
        height: 22px;
        align-items: center;
        border-radius: 999px;
        background: #d7dce1;
        transition: background 0.18s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-switch::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(20, 25, 30, 0.2);
        transition: transform 0.18s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-enabled:checked + .better-settings__level-switch {
        background: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-enabled:checked + .better-settings__level-switch::after {
        transform: translateX(20px);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-enabled:focus-visible + .better-settings__level-switch {
        outline: 2px solid rgba(39, 117, 209, 0.35);
        outline-offset: 2px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-range {
        box-sizing: border-box;
        width: 100%;
        accent-color: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__level-range:disabled {
        opacity: 0.45;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 4px;
        margin-bottom: 10px;
        padding: 3px;
        border-radius: 8px;
        background: #f3f4f5;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__tab {
        box-sizing: border-box;
        height: 28px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #59636e;
        cursor: pointer;
        font-size: 13px;
        line-height: 28px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__tab[aria-selected="true"] {
        background: #fff;
        color: #14191e;
        font-weight: 600;
        box-shadow: 0 1px 4px rgba(20, 25, 30, 0.08);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__input {
        box-sizing: border-box;
        min-width: 0;
        height: 32px;
        flex: 1 1 auto;
        padding: 0 10px;
        border: 1px solid #dde2e7;
        border-radius: 6px;
        outline: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__input:focus {
        border-color: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-section {
        overflow: hidden;
        padding: 0;
        background: #fbfcfd;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #eef0f2;
        background: #fff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-title {
        color: #14191e;
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-subtitle {
        margin-top: 2px;
        color: #8a9299;
        font-size: 12px;
        line-height: 17px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-status {
        display: inline-flex;
        height: 24px;
        flex: 0 0 auto;
        align-items: center;
        padding: 0 9px;
        border-radius: 999px;
        background: #f0f3f6;
        color: #68727d;
        font-size: 12px;
        font-weight: 600;
        line-height: 24px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-status.is-on {
        background: #e7f5ee;
        color: #0b806f;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-body {
        padding: 12px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field {
        display: block;
        margin-bottom: 12px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 7px;
        color: #3c4651;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field-title-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__prompt-toggle {
        display: inline-flex;
        height: 24px;
        flex: 0 0 auto;
        align-items: center;
        gap: 5px;
        margin-left: auto;
        color: #52606d;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        line-height: 24px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__prompt-toggle input {
        width: 14px;
        height: 14px;
        margin: 0;
        accent-color: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__compact-number-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        align-items: end;
        margin-bottom: 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field--compact-number {
        margin-bottom: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field--compact-number .better-settings__text-input {
        width: 88px;
        max-width: 100%;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field--compact-number .better-settings__select {
        width: 100%;
        min-width: 168px;
        max-width: 100%;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__secret-input {
        position: relative;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-input {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__secret-input .better-settings__text-input {
        padding-right: 58px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__secret-toggle {
        position: absolute;
        top: 4px;
        right: 4px;
        height: 28px;
        padding: 0 9px;
        border: 0;
        border-radius: 6px;
        background: #edf5ff;
        color: #1f66b8;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__secret-toggle:hover {
        background: #dcecff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__secret-toggle[aria-pressed="true"] {
        background: #e7f5ee;
        color: #0b806f;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 40px;
        margin-bottom: 8px;
        padding: 8px 10px;
        border: 1px solid #e1e8ef;
        border-radius: 8px;
        background: #fbfcfd;
        color: #26323c;
        cursor: pointer;
        font-size: 13px;
        font-weight: 700;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle:hover {
        border-color: #cbd9e6;
        background: #f5f9fc;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle input {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle-switch {
        position: relative;
        width: 42px;
        height: 22px;
        flex: 0 0 auto;
        border-radius: 999px;
        background: #cfd6dd;
        transition: background 0.18s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle-switch::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 4px rgba(20, 25, 30, 0.22);
        transition: transform 0.18s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle input:checked + .better-settings__rule-toggle-switch {
        background: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle input:checked + .better-settings__rule-toggle-switch::after {
        transform: translateX(20px);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle input:focus-visible + .better-settings__rule-toggle-switch {
        outline: 2px solid rgba(39, 117, 209, 0.35);
        outline-offset: 2px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__rule-toggle-text {
        min-width: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-input,
      .${SETTINGS_PANEL_CLASS} .better-settings__select,
      .${SETTINGS_PANEL_CLASS} .better-settings__textarea {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #dde2e7;
        border-radius: 7px;
        outline: none;
        background: #fbfcfd;
        color: #14191e;
        font-size: 13px;
        transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-input,
      .${SETTINGS_PANEL_CLASS} .better-settings__select {
        height: 36px;
        padding: 0 11px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__select {
        appearance: none;
        padding-right: 34px;
        background-color: #fff;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23505b66' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        background-size: 14px;
        cursor: pointer;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-combobox {
        position: relative;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__field.is-model-menu-open,
      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-combobox.is-open {
        position: relative;
        z-index: 4;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model {
        border-color: #d3dbe3;
        background: #fff;
        padding-right: 42px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-dropdown {
        position: absolute;
        top: 0;
        right: 0;
        display: inline-flex;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid #d3dbe3;
        border-left-color: #e7ebef;
        border-radius: 0 7px 7px 0;
        background: linear-gradient(180deg, #ffffff 0%, #f1f5f8 100%);
        color: #3c4651;
        cursor: pointer;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-dropdown::before {
        width: 0;
        height: 0;
        border-top: 5px solid #505b66;
        border-right: 4px solid transparent;
        border-left: 4px solid transparent;
        content: "";
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-dropdown:hover {
        border-color: #b9c7d5;
        background: #eef5ff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-dropdown:disabled,
      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-dropdown:disabled:hover {
        border-color: #dde2e7;
        background: #f3f6f8;
        cursor: default;
        opacity: 0.55;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-combobox:focus-within .better-settings__ai-model,
      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-combobox:focus-within .better-settings__ai-model-dropdown {
        border-color: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-menu {
        position: absolute;
        z-index: 2;
        top: 41px;
        left: 0;
        right: 0;
        max-height: 168px;
        overflow-y: auto;
        border: 1px solid #cfd9e3;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 14px 28px rgba(23, 31, 39, 0.18);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-option {
        display: block;
        width: 100%;
        height: auto;
        padding: 8px 11px;
        border: 0;
        border-radius: 0;
        background: #fff;
        color: #1d2730;
        cursor: pointer;
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-option[hidden] {
        display: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-option:hover,
      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-option.is-selected {
        background: #eef5ff;
        color: #1f66b8;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-model-empty {
        padding: 10px 11px;
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__textarea {
        min-height: 72px;
        max-height: 240px;
        overflow-y: hidden;
        padding: 10px 11px;
        resize: none;
        line-height: 20px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-input::placeholder,
      .${SETTINGS_PANEL_CLASS} .better-settings__textarea::placeholder {
        color: #a1aab3;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-input:focus,
      .${SETTINGS_PANEL_CLASS} .better-settings__select:focus,
      .${SETTINGS_PANEL_CLASS} .better-settings__textarea:focus {
        border-color: #2775d1;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(39, 117, 209, 0.12);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__add {
        height: 32px;
        flex: 0 0 auto;
        padding: 0 10px;
        border: 0;
        border-radius: 6px;
        background: #2775d1;
        color: #fff;
        cursor: pointer;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-button {
        height: auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__text-button:hover {
        text-decoration: underline;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 12px -12px -12px;
        padding: 12px;
        border-top: 1px solid #eef0f2;
        background: #fff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__primary {
        height: 34px;
        flex: 0 0 auto;
        padding: 0 14px;
        border: 0;
        border-radius: 7px;
        background: #2775d1;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__primary:hover {
        background: #1f66b8;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__primary:disabled {
        cursor: default;
        opacity: 0.65;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-test {
        width: 78px;
        padding: 0 10px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-test.is-ok {
        background: #13a97c;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-test.is-ok:hover {
        background: #0b806f;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-test.is-error {
        background: #e54858;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__connection-test.is-error:hover {
        background: #d33b4a;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__message {
        min-width: 0;
        overflow: hidden;
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 12px 0 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__log-switch {
        display: inline-flex;
        gap: 4px;
        padding: 3px;
        margin: 10px 0;
        border: 1px solid #e2e8ef;
        border-radius: 8px;
        background: #f4f7fa;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__log-switch-button {
        min-width: 78px;
        height: 28px;
        padding: 0 10px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #68727d;
        cursor: pointer;
        font-size: 12px;
        font-weight: 700;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__log-switch-button.is-active {
        background: #fff;
        color: #1f66b8;
        box-shadow: 0 1px 3px rgba(20, 32, 44, 0.1);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-filter {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin: 0 0 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-filter-button {
        height: 26px;
        padding: 0 10px;
        border: 1px solid #dce3ea;
        border-radius: 13px;
        background: #fff;
        color: #68727d;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-filter-button.is-active {
        border-color: #9fc4ef;
        background: #edf5ff;
        color: #1f66b8;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 2px 0 10px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-stat {
        min-width: 0;
        padding: 8px 10px;
        border: 1px solid #e2e8ef;
        border-radius: 8px;
        background: #fbfcfd;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-stat-label {
        display: block;
        overflow: hidden;
        color: #68727d;
        font-size: 11px;
        line-height: 16px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-stat-value {
        display: block;
        margin-top: 2px;
        color: #18222c;
        font-size: 18px;
        font-weight: 800;
        line-height: 24px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs {
        height: min(520px, calc(100vh - 250px));
        min-height: 360px;
        max-height: 620px;
        overflow-y: auto;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fbfcfd;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs {
        height: min(520px, calc(100vh - 250px));
        min-height: 360px;
        max-height: 620px;
        overflow-y: auto;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fbfcfd;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log {
        padding: 9px 10px;
        border-bottom: 1px solid #eef0f2;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log:last-child,
      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-log:last-child {
        border-bottom: 0;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-log {
        display: grid;
        gap: 6px;
        padding: 9px 10px;
        border-bottom: 1px solid #eef0f2;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-title {
        color: #26313b;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-title a {
        color: #1a73e8;
        text-decoration: none;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-title a:hover {
        text-decoration: underline;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-post-time {
        color: #68727d;
        font-size: 11px;
        font-weight: 400;
        margin-left: 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-target {
        color: #68727d;
        font-size: 11px;
        line-height: 16px;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-source {
        color: #3c4651;
        font-size: 12px;
        line-height: 18px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-reply {
        color: #18222c;
        font-size: 12px;
        line-height: 18px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-comment-preview__emoji {
        display: inline-block;
        width: 20px;
        height: 20px;
        vertical-align: middle;
        margin: 0 1px;
      }

      .${SETTINGS_PANEL_CLASS} .better-comment-preview__emoji--big {
        width: 40px;
        height: 40px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: #8a9299;
        font-size: 11px;
        line-height: 16px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-level {
        font-weight: 700;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-level--success {
        color: #0b806f;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-level--warn {
        color: #a46300;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-level--error {
        color: #d33b4a;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-message {
        margin-top: 4px;
        color: #26313b;
        font-size: 12px;
        line-height: 18px;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-wrap {
        position: relative;
        margin-top: 5px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-summary {
        cursor: pointer;
        color: #2775d1;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-copy {
        position: absolute;
        top: 0;
        right: 0;
        height: 24px;
        padding: 0 8px;
        border: 0;
        border-radius: 6px;
        background: #edf5ff;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-copy:hover {
        background: #dcecff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 5px 0 0;
        padding: 10px;
        border-radius: 6px;
        background: #f1f4f7;
        color: #3c4651;
        font-size: 12px;
        line-height: 18px;
        word-break: break-word;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-row {
        display: grid;
        grid-template-columns: minmax(88px, 128px) minmax(0, 1fr);
        gap: 8px;
        align-items: start;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-label {
        color: #78838f;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-value {
        min-width: 0;
        color: #26313b;
        white-space: pre-wrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-value--empty {
        color: #9aa3ad;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-value--success {
        color: #0b806f;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-value--warn {
        color: #a46300;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-group-title {
        color: #56616d;
        font-weight: 700;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-card {
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 8px;
        border: 1px solid #dce3ea;
        border-radius: 6px;
        background: #fff;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-card-title {
        color: #2775d1;
        font-size: 11px;
        font-weight: 700;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-log-detail-code {
        font-family: Consolas, "Microsoft YaHei UI", monospace;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__list {
        display: flex;
        max-height: var(--better-settings-list-max-height, 190px);
        overflow-y: auto;
        flex-direction: column;
        gap: 6px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__keyword {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 6px;
        background: #f7f8f9;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__keyword-text {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__keyword-scope {
        flex: 0 0 auto;
        padding: 1px 6px;
        border-radius: 999px;
        background: #e9f2ff;
        color: #2775d1;
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__keyword-actions {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 6px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__keyword-count {
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__remove {
        flex: 0 0 auto;
        border: 0;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 14px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__empty {
        color: #a8afb7;
        line-height: 18px;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_PANEL_CLASS} {
        box-sizing: border-box;
        display: none;
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        z-index: 9999;
        min-width: 220px;
        padding: 10px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 10px 30px rgba(20, 25, 30, 0.12);
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS}.${TOP_MENU_OPEN_CLASS} .${TOP_MENU_PANEL_CLASS} {
        display: block;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS} .hb-websit__left-section {
        box-sizing: border-box;
        display: flex !important;
        width: 100%;
        min-height: 0 !important;
        height: auto !important;
        max-height: none !important;
        align-items: stretch;
        flex-direction: column;
        gap: 10px;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS} .hb-website__catalog {
        box-sizing: border-box;
        display: flex !important;
        min-width: 0;
        flex: 0 0 auto !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        flex-direction: column;
        gap: 6px;
        padding: 0;
        overflow: hidden;
        background: transparent;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS} .hb-view-catalog__button {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        height: 40px;
        margin: 0 !important;
        padding: 0 12px !important;
        justify-content: flex-start;
        border-radius: 6px;
      }

      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-1,
      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-2,
      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-3,
      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-4,
      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-5,
      .${HOME_LAYOUT_CLASS} .level-tag__wrapper.level-6,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-1,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-2,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-3,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-4,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-5,
      .${HOME_LAYOUT_CLASS} .hb-level-tag.hb-level-6 {
        border-radius: 3px;
        background: #eef0f2 !important;
        color: #59636e !important;
      }

      .${HOME_LAYOUT_CLASS} .better-default-level-tag {
        display: inline-flex !important;
        vertical-align: middle;
        flex: 0 0 auto;
        align-items: center;
        width: auto !important;
        min-width: 0;
        margin: 0 5px;
      }

      .${HOME_LAYOUT_CLASS} .comment-children-item > .better-default-level-tag {
        position: relative;
        top: -1px;
      }

      .${HOME_LAYOUT_CLASS} .better-default-level-tag .level-tag__wrapper,
      .${HOME_LAYOUT_CLASS} .better-default-level-tag .hb-level-tag__inner {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        min-width: 28px;
        height: 17px;
        padding: 0 6px;
        border: 1px solid rgba(96, 117, 139, 0.2);
        border-radius: 999px !important;
        background: linear-gradient(180deg, #ffffff 0%, #eef3f8 100%) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 1px 2px rgba(31, 41, 55, 0.08);
        color: #4f6477 !important;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0;
        line-height: 15px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${TOP_MENU_CLASS} .hb-website__post-btn {
        display: inline-flex !important;
        width: 100% !important;
        height: 40px !important;
        min-width: 0;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 !important;
        padding: 0 14px !important;
        border-radius: 6px !important;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS} {
        box-sizing: border-box;
        position: fixed;
        top: 96px;
        bottom: 24px;
        left: 0;
        z-index: 9998;
        width: 40px;
        max-width: calc(100vw - 16px);
        overflow: hidden;
        transition: width 0.18s ease;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS} {
        width: min(280px, calc(100vw - 16px));
      }

      .${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS} {
        box-sizing: border-box;
        position: absolute;
        top: 12px;
        left: 0;
        width: 40px;
        min-height: 96px;
        border: 1px solid #eef0f2;
        border-left: 0;
        border-radius: 0 8px 8px 0;
        background: #fff;
        color: #14191e;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(20, 25, 30, 0.1);
        writing-mode: vertical-rl;
        letter-spacing: 0;
        font-size: 13px;
        transition: left 0.18s ease;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS} .${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS} {
        left: 240px;
      }

      .${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS}:hover {
        background: #f7f8f9;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 240px;
        max-width: calc(100vw - 56px);
        overflow: auto;
        padding: 12px;
        border: 1px solid #eef0f2;
        border-left: 0;
        border-radius: 0 8px 8px 0;
        background: #fff;
        box-shadow: 0 12px 32px rgba(20, 25, 30, 0.12);
        transform: translateX(-240px);
        transition: transform 0.18s ease;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS} .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} {
        transform: translateX(0);
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .game-rank__aside-hot-game {
        margin: 0 !important;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .aside-hot-gmae__header {
        margin-top: 0 !important;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__loading,
      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__empty,
      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__error {
        padding: 18px 8px;
        color: #8a9299;
        font-size: 13px;
        line-height: 20px;
        text-align: center;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        overflow-x: auto;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__tab {
        flex: 0 0 auto;
        padding: 0 0 6px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 13px;
        line-height: 18px;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__tab--active {
        border-bottom-color: #2775d1;
        color: #14191e;
        font-weight: 600;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__item {
        display: grid;
        grid-template-columns: 22px minmax(0, 1fr);
        gap: 8px;
        align-items: start;
        color: inherit;
        text-decoration: none;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__index {
        display: inline-flex;
        width: 22px;
        height: 22px;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: #f3f4f5;
        color: #59636e;
        font-size: 12px;
        font-weight: 600;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__name {
        overflow: hidden;
        color: #14191e;
        font-size: 13px;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__desc {
        display: -webkit-box;
        overflow: hidden;
        margin-top: 2px;
        color: #8a9299;
        font-size: 12px;
        line-height: 17px;
        -webkit-box-orient: vertical;

      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} {
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(360px, 34vw, 520px);
        gap: 0;
        align-items: start;
        margin: 0 0 14px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(20, 25, 30, 0.04);
        overflow: hidden;
      }

      .${HOME_LAYOUT_CLASS} .search-result__link.${ROW_CLASS} {
        border-bottom: 1px solid #eef0f2;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content {
        box-sizing: border-box !important;
        min-width: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
        border-bottom: 0 !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content *,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content * {
        min-width: 0 !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content img,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content video,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content canvas,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content img,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content video,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content canvas {
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="image"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="img"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="media"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="picture"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content [class*="image"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content [class*="img"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content [class*="media"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-content [class*="picture"] {
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--row {
        display: grid !important;
        height: auto !important;
        grid-template-columns: repeat(var(--better-native-image-count), minmax(0, 1fr));
        gap: 4px;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--row > .bbs-content__image {
        width: auto !important;
        height: auto !important;
        aspect-ratio: 1;
        position: relative !important;
        top: auto !important;
        left: auto !important;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--row > .bbs-content__image > .hb-cpt__image-elem {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--row > .bbs-content__image > .hb-cpt__image--default {
        height: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature {
        display: grid !important;
        height: 240px !important;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        grid-template-rows: repeat(2, minmax(0, 1fr));
        gap: 4px;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature > .bbs-content__image {
        width: auto !important;
        height: auto !important;
        position: relative !important;
        top: auto !important;
        left: auto !important;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature > .bbs-content__image:first-child {
        grid-row: 1 / -1;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature > .bbs-content__image > .hb-cpt__image-elem {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature > .bbs-content__image > .hb-cpt__image--default {
        height: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .better-native-feed-images--feature > .bbs-content__image-cnt {
        right: 0 !important;
        bottom: 0 !important;
        top: auto !important;
        left: auto !important;
        z-index: 1;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-images {
        display: grid;
        height: 240px;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        grid-template-rows: repeat(2, minmax(0, 1fr));
        gap: 4px;
        margin-top: 10px;
        overflow: hidden;
        border-radius: 6px;
        background: #f3f4f5;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-images[data-visible-count="1"] {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-images[data-visible-count="2"] {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: minmax(0, 1fr);
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-image-wrap:first-child {
        grid-row: 1 / -1;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-images[data-visible-count="1"] .better-feed-fallback-image-wrap:first-child,
      .${HOME_LAYOUT_CLASS} .better-feed-fallback-images[data-visible-count="2"] .better-feed-fallback-image-wrap:first-child {
        grid-row: auto;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-image {
        display: block;
        width: 100%;
        height: 100%;
        min-height: 0;
        object-fit: cover;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-image-wrap {
        min-width: 0;
        min-height: 0;
        position: relative;
        overflow: hidden;
        background: #f3f4f5;
      }

      .${HOME_LAYOUT_CLASS} .better-feed-fallback-more {
        display: flex;
        position: absolute;
        inset: 0;
        align-items: center;
        justify-content: center;
        background: rgba(20, 25, 30, 0.52);
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like {
        cursor: pointer;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--active {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--loading {
        opacity: 0.75;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button {
        display: inline-flex;
        width: 26px;
        height: 26px;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        margin-right: 0;
        border: 1px solid #d8dfe6;
        border-radius: 50%;
        background: transparent;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button:hover,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button:hover,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button:hover {
        background: #e9f2ff;
        border-color: #9ec6f2;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-list-content__header.better-ai-summary-header .list-cotent__operation-btn,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-list-content__header.better-ai-summary-header .list-content__operation-btn {
        margin-left: 4px !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button.is-loading,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button.is-loading,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button.is-loading {
        position: relative;
        color: transparent;
        pointer-events: none;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button.is-loading::after,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button.is-loading::after,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button.is-loading::after {
        content: "";
        box-sizing: border-box;
        position: absolute;
        width: 17px;
        height: 17px;
        border: 2px solid rgba(39, 117, 209, 0.22);
        border-top-color: #2775d1;
        border-radius: 50%;
        animation: better-ai-summary-spin 0.8s linear infinite;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button.is-complete,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button.is-complete,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button.is-complete {
        border-color: #78c7a5;
        background: #eaf8f1;
        color: #0b806f;
        font-size: 0;
        animation: better-ai-summary-complete-pop 0.52s cubic-bezier(0.22, 1.35, 0.36, 1) both;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-ai-summary-button.is-complete::after,
      .${HOME_LAYOUT_CLASS} .link-comment .better-ai-summary-button.is-complete::after,
      .${HOME_LAYOUT_CLASS} .hb-bbs-link__header .better-ai-summary-button.is-complete::after {
        content: "✓";
        font-size: 16px;
        font-weight: 800;
        line-height: 1;
        animation: better-ai-summary-check-in 0.42s 0.08s cubic-bezier(0.22, 1.35, 0.36, 1) both;
      }

      @keyframes better-ai-summary-complete-pop {
        0% {
          box-shadow: 0 0 0 0 rgba(11, 128, 111, 0);
          transform: scale(0.82);
        }
        55% {
          box-shadow: 0 0 0 7px rgba(11, 128, 111, 0.13);
          transform: scale(1.12);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(11, 128, 111, 0);
          transform: scale(1);
        }
      }

      @keyframes better-ai-summary-check-in {
        0% {
          opacity: 0;
          transform: scale(0.35) rotate(-22deg);
        }
        70% {
          opacity: 1;
          transform: scale(1.18) rotate(4deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .${HOME_LAYOUT_CLASS} .better-ai-summary-button.is-complete,
        .${HOME_LAYOUT_CLASS} .better-ai-summary-button.is-complete::after {
          animation: none;
        }
      }

      @keyframes better-ai-summary-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .better-link-publish-time {
        flex: 0 0 auto;
        margin-right: 8px;
        color: #a8afb7;
        font-size: 12px;
        line-height: 20px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} {
        box-sizing: border-box;
        display: flex;
        align-self: start;
        height: var(--better-row-height, auto);
        max-height: var(--better-row-height, none);
        min-height: 0;
        overflow: hidden;
        padding: 14px 16px;
        border-left: 1px solid #f1f2f4;
        background: #fff;
        color: #14191e;
        flex-direction: column;
        font-size: 13px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
        color: #59636e;
        font-size: 13px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__toolbar,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__toolbar {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__filtered-count,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__filtered-count {
        color: #8a9299;
        font-size: 12px;
        line-height: 16px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__sort-group,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__sort-group {
        display: inline-flex;
        overflow: hidden;
        border: 1px solid #dde2e7;
        border-radius: 6px;
        background: #fff;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__sort-option,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__sort-option {
        height: 22px;
        padding: 0 6px;
        border: 0;
        border-right: 1px solid #eef0f2;
        background: transparent;
        color: #59636e;
        cursor: pointer;
        font-size: 12px;
        line-height: 22px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__sort-option:last-child,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__sort-option:last-child {
        border-right: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__sort-option:hover,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__sort-option:hover {
        background: #f5f8fb;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__sort-option[aria-pressed="true"],
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__sort-option[aria-pressed="true"] {
        background: #2775d1;
        color: #fff;
        font-weight: 600;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle-switch,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle-switch {
        position: relative;
        width: 28px;
        height: 16px;
        flex: 0 0 auto;
        border-radius: 999px;
        background: #d8dde2;
        transition: background 0.16s ease;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle-switch::after,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle-switch::after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 1px 3px rgba(20, 25, 30, 0.18);
        transition: transform 0.16s ease;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"],
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle[aria-pressed="true"] {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch {
        background: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch::after,
      .${HOME_LAYOUT_CLASS} .link-comment .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch::after {
        transform: translateX(12px);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__list {
        display: flex;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 10px;
        padding-right: 4px;
        overscroll-behavior: contain;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__list::-webkit-scrollbar {
        width: 4px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__list::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: #d8dde2;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__list::-webkit-scrollbar-track {
        background: transparent;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__group {
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__item {
        min-width: 0;
        cursor: pointer;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text-row .better-comment-preview__text {
        flex: 1 1 auto;
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text-row .better-comment-preview__up {
        flex: 0 0 auto;
        margin-top: 4px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text-wrapper {
        position: relative;
        flex: 1 1 auto;
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__expand-button {
        position: absolute;
        bottom: 0;
        right: 0;
        display: none;
        padding: 0 2px 0 8px;
        border: 0;
        background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff 25%, #fff);
        color: #2775d1;
        cursor: pointer;
        font-size: 13px;
        line-height: 1.45;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__expand-button.is-expanded {
        position: static;
        display: block;
        margin-top: 4px;
        padding: 0;
        background: transparent;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__expand-button:hover {
        text-decoration: underline;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__user-header {
        display: flex;
        min-width: 0;
        height: auto;
        align-items: center;
        justify-content: flex-start;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__user {
        display: inline-flex;
        min-width: 0;
        max-width: 100%;
        align-items: center;
        color: inherit;
        text-decoration: none;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__user-avatar {
        flex: 0 0 auto;
        margin-right: 4px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__body {
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__name {
        display: block;
        max-width: 130px;
        overflow: hidden;
        margin: 0;
        color: #14191e;
        font-weight: 600;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__owner {
        display: inline-block;
        margin-left: 4px;
        padding: 0 3px;
        border-radius: 2px;
        background: #eef5ff;
        color: #2775d1;
        font-size: 10px;
        line-height: 14px;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__level {
        display: inline-flex;
        flex: 0 0 auto;
        margin-left: 4px;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text {
        display: -webkit-box;
        overflow: hidden;
        margin-top: 4px;
        position: relative;
        color: #333a42;
        line-height: 1.45;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .comment-item__content.cy {
        min-height: 22px;
        text-indent: 20px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .comment-item__content.cy::before {
        content: "";
        position: absolute;
        top: 3px;
        left: 0;
        width: 16px;
        height: 16px;
        background: 0 0 / 100% 100% url(https://imgheybox.max-c.com/oa/2024/10/31/ce360d2affd7976e27e5c68a3de676c7.png);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a {
        color: #2775d1;
        text-decoration: none;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a:hover,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a:hover {
        text-decoration: underline;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type],
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type] {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin: 0 1px;
        padding: 0 4px;
        border-radius: 4px;
        line-height: 1.35;
        vertical-align: -1px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type]::before,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type]::before {
        flex: 0 0 auto;
        font-size: 12px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type="game"],
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type="game"] {
        background: #eef6ff;
        color: #1f6fc7;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type="game"]::before,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type="game"]::before {
        content: "\\1F3AE";
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type="user"],
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type="user"] {
        background: #f3f6f8;
        color: #59636e;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text a[data-better-link-type="user"]::before,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text a[data-better-link-type="user"]::before {
        content: "\\1F464";
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__time {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
        color: #a8afb7;
        font-size: 12px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__images {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 6px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image-link {
        display: block;
        overflow: hidden;
        max-width: min(160px, 100%);
        border-radius: 6px;
        background: #f3f4f5;
        cursor: zoom-in;
        line-height: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply .better-comment-preview__image-link {
        max-width: min(132px, 100%);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image {
        display: block;
        width: 100%;
        max-height: 150px;
        object-fit: cover;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply .better-comment-preview__image {
        max-height: 120px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__ip::before {
        content: "·";
        margin: 0 2px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply {
        margin: 7px 0 0 32px;
        padding: 7px 8px;
        border-radius: 6px;
        background: #f7f8f9;
        color: #59636e;
        cursor: pointer;
        font-size: 12px;
        line-height: 1.45;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text {
        display: -webkit-box;
        overflow: hidden;
        margin-top: 3px;
        position: relative;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text.comment-item__content.cy::before {
        top: 1px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text-row .better-comment-preview__reply-text {
        flex: 1 1 auto;
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text-row .better-comment-preview__up {
        flex: 0 0 auto;
        margin-top: 3px;
        font-size: 12px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-meta {
        margin-top: 3px;
        color: #a8afb7;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-footer {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 4px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-footer .better-comment-preview__reply-meta {
        min-width: 0;
        margin-top: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-action {
        padding: 0;
        border: 0;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 12px;
        line-height: 18px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-action:hover {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-form {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin: 8px 0 0 32px;
        padding: 8px 16px;
        border: 1px solid #eef0f2;
        border-radius: 0 0 8px 8px;
        background: var(--color-background-2, #fff);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} > .better-comment-preview__reply-form {
        margin: 8px 0 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-form[data-submitting="true"] {
        opacity: 0.82;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-form:focus-within {
        border-color: #dce2e8;
        box-shadow: 0 6px 18px rgba(20, 25, 30, 0.06);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-input {
        box-sizing: border-box;
        width: 100%;
        min-height: 40px;
        max-height: 96px;
        overflow-y: auto;
        padding: 4px 0 8px;
        border: 0;
        border-radius: 0;
        outline: none;
        background: transparent;
        color: var(--color-font-1, #14191e);
        cursor: text;
        font: inherit;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-input:focus {
        border-color: transparent;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-input:empty::before {
        content: attr(data-placeholder);
        color: #a8afb7;
        pointer-events: none;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-attachments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-attachment {
        position: relative;
        width: 54px;
        height: 54px;
        overflow: hidden;
        border-radius: 6px;
        background: var(--color-background-1, #f3f4f5);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-attachment-image {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-attachment-remove {
        display: inline-flex;
        position: absolute;
        top: 2px;
        right: 2px;
        width: 18px;
        height: 18px;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: rgba(20, 25, 30, 0.66);
        color: #fff;
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-file-input {
        display: none;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-input-emoji {
        display: inline-block;
        width: 1.55em;
        height: 1.55em;
        margin: 0 1px;
        object-fit: contain;
        vertical-align: -0.34em;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-tools {
        position: relative;
        z-index: 2147483646;
        display: flex;
        align-items: center;
        flex: 1 1 auto;
        min-width: 0;
        gap: 8px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji-toggle,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image-upload {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: transparent;
        color: var(--color-font-3, #8c9199);
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji-toggle-icon,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image-upload-icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: currentColor;
        font-size: 20px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji-toggle-icon {
        -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 14h8c-.5 2-1.9 3-4 3s-3.5-1-4-3Z'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM8 14h8c-.5 2-1.9 3-4 3s-3.5-1-4-3Z'/%3E%3C/svg%3E") center / contain no-repeat;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image-upload-icon {
        -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM5 5h14v9.6l-3.5-3.5a1 1 0 0 0-1.4 0L11 14.2l-1.6-1.6a1 1 0 0 0-1.4 0L5 15.6V5Zm0 14v-.6l3.7-3.7 1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1L19 17.4V19H5Zm4.5-8A2.5 2.5 0 1 1 9.5 6a2.5 2.5 0 0 1 0 5Z'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM5 5h14v9.6l-3.5-3.5a1 1 0 0 0-1.4 0L11 14.2l-1.6-1.6a1 1 0 0 0-1.4 0L5 15.6V5Zm0 14v-.6l3.7-3.7 1.6 1.6a1 1 0 0 0 1.4 0l3.1-3.1L19 17.4V19H5Zm4.5-8A2.5 2.5 0 1 1 9.5 6a2.5 2.5 0 0 1 0 5Z'/%3E%3C/svg%3E") center / contain no-repeat;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji-toggle:hover,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji-toggle[aria-expanded="true"],
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__image-upload:hover {
        background: var(--color-background-hover, rgba(20, 25, 30, 0.04));
        color: var(--color-font-2, #64696e);
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-panel {
        position: fixed;
        left: var(--better-emoji-panel-left, 12px);
        top: var(--better-emoji-panel-top, 12px);
        z-index: 2147483647 !important;
        width: min(280px, calc(100vw - 48px));
        max-height: var(--better-emoji-panel-max-height, 220px);
        overflow: auto;
        padding: 8px;
        border: 1px solid #dfe5eb;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 10px 24px rgba(20, 25, 30, 0.12);
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-panel[hidden] {
        display: none;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(30px, 1fr));
        gap: 4px;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-section + .better-comment-preview__emoji-section {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #eef1f4;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-section-title {
        margin-bottom: 5px;
        color: #8a9299;
        font-size: 12px;
        line-height: 16px;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-common-row {
        display: flex;
        flex-wrap: nowrap;
        gap: 4px;
        overflow-x: auto;
        padding-bottom: 2px;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-option {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-option:hover {
        background: #f0f4f8;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-option-image {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .${HOME_LAYOUT_CLASS} .better-comment-preview__emoji-panel-state {
        color: #a8afb7;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-form-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 28px;
        gap: 12px;
        padding-top: 4px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-status {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        color: #a8afb7;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-status.is-error {
        color: #d64242;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-actions {
        display: inline-flex;
        flex: 0 0 auto;
        gap: 10px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-cancel,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-submit {
        min-width: 52px;
        height: 28px;
        padding: 0 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        line-height: 28px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-cancel {
        border: 0;
        background: transparent;
        color: var(--color-font-3, #8c9199);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-submit {
        border: 0;
        background: var(--color-primary-blue, #006ef4);
        color: var(--color-primary-white, #fff);
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-submit:disabled {
        cursor: default;
        opacity: 0.62;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-more {
        display: inline-flex;
        align-items: center;
        margin: 7px 0 0 32px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        line-height: 18px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-more:hover {
        text-decoration: underline;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-more:disabled {
        color: #a8afb7;
        cursor: default;
        text-decoration: none;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__loading-more,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__end,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__load-failed {
        color: #a8afb7;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji {
        display: inline-block;
        width: 1.45em;
        height: 1.45em;
        margin: 0 1px;
        object-fit: contain;
        vertical-align: -0.32em;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__emoji--big {
        width: 2.6em;
        height: 2.6em;
        vertical-align: -0.9em;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #c3c8ce;
        cursor: pointer;
        font-size: 12px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up:hover,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up--active {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up:disabled {
        cursor: default;
        opacity: 0.75;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up-icon {
        display: inline-block;
        width: 14px;
        height: 14px;
        background: currentColor;
        font-size: 13px;
        line-height: 1;
        -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M2 21h4V9H2v12Zm19.5-11.8c-.2-.7-.8-1.2-1.6-1.2h-5.7l.9-4.1v-.3c0-.4-.2-.8-.5-1.1L13.6 1 7 7.6V19c0 1.1.9 2 2 2h8.4c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.1-.5.1-.7v-1.1c0-.6-.3-1.2-.8-1.7Z'/%3E%3C/svg%3E") center / contain no-repeat;
        mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='black' d='M2 21h4V9H2v12Zm19.5-11.8c-.2-.7-.8-1.2-1.6-1.2h-5.7l.9-4.1v-.3c0-.4-.2-.8-.5-1.1L13.6 1 7 7.6V19c0 1.1.9 2 2 2h8.4c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.1-.5.1-.7v-1.1c0-.6-.3-1.2-.8-1.7Z'/%3E%3C/svg%3E") center / contain no-repeat;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__footer {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 12px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__post-comment {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 26px;
        padding: 0 10px;
        border: 1px solid #d9e5f2;
        border-radius: 6px;
        background: #f7fbff;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        line-height: 24px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__post-comment:hover {
        border-color: #2775d1;
        background: #eef6ff;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__post-comment-icon {
        font-size: 13px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__open {
        display: block;
        color: #8a9299;
        text-align: center;
        text-decoration: none;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__empty,
      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__loading {
        margin: auto;
        color: #a8afb7;
        text-align: center;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reload {
        display: block;
        margin: 8px auto 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: #2775d1;
        cursor: pointer;
        font-size: 12px;
        line-height: 18px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reload:hover {
        text-decoration: underline;
      }

      .${IMAGE_VIEWER_CLASS} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.82);
      }

      .${IMAGE_VIEWER_CLASS}[hidden] {
        display: none !important;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__image {
        display: block;
        max-width: min(92vw, 1280px);
        max-height: 88vh;
        object-fit: contain;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__close,
      .${IMAGE_VIEWER_CLASS} .better-image-viewer__prev,
      .${IMAGE_VIEWER_CLASS} .better-image-viewer__next {
        position: absolute;
        display: inline-flex;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
        cursor: pointer;
        font-size: 24px;
        line-height: 1;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__close:hover,
      .${IMAGE_VIEWER_CLASS} .better-image-viewer__prev:hover,
      .${IMAGE_VIEWER_CLASS} .better-image-viewer__next:hover {
        background: rgba(255, 255, 255, 0.24);
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__close {
        top: 24px;
        right: 28px;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__prev {
        left: 28px;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__next {
        right: 28px;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__counter {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.36);
        color: #fff;
        font-size: 13px;
        line-height: 20px;
      }

      .${AI_SUMMARY_MODAL_CLASS} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
      }

      .${AI_SUMMARY_MODAL_CLASS}[hidden] {
        display: none !important;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__dialog {
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 50%;
        width: min(680px, calc(100vw - 32px));
        max-height: min(78vh, 720px);
        display: flex;
        overflow: hidden;
        flex-direction: column;
        pointer-events: auto;
        border: 1px solid rgba(20, 25, 30, 0.12);
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 20px 60px rgba(20, 25, 30, 0.24);
        transform: translate(-50%, -50%);
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 16px 18px;
        border-bottom: 1px solid #eef0f2;
        cursor: move;
        user-select: none;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__actions {
        cursor: default;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__auto-popup {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #68727d;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__auto-popup input {
        margin: 0;
        accent-color: #2775d1;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__title {
        min-width: 0;
        overflow: hidden;
        color: #14191e;
        font-size: 16px;
        font-weight: 600;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__meta {
        flex: 0 0 auto;
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
        white-space: nowrap;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__meta:empty {
        display: none;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__actions {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 8px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__regenerate {
        height: 30px;
        padding: 0 10px;
        border: 1px solid #d8dfe6;
        border-radius: 6px;
        background: #fff;
        color: #2775d1;
        cursor: pointer;
        font-size: 13px;
        line-height: 28px;
        white-space: nowrap;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__regenerate:hover {
        background: #e9f2ff;
        border-color: #9ec6f2;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__close {
        width: 30px;
        height: 30px;
        flex: 0 0 auto;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #68727d;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__close:hover {
        background: #f3f4f5;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body {
        flex: 1 1 auto;
        min-width: 0;
        min-height: 120px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 18px;
        color: #2f3842;
        font-size: 14px;
        line-height: 1.75;
        overscroll-behavior: contain;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body.is-muted {
        color: #8a9299;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h1,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h2,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h3 {
        margin: 14px 0 8px;
        color: #14191e;
        font-size: 16px;
        line-height: 24px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h1:first-child,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h2:first-child,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body h3:first-child,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body p:first-child {
        margin-top: 0;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body p {
        margin: 8px 0;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body ul,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body ol {
        margin: 8px 0;
        padding-left: 22px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body li {
        margin: 4px 0;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body blockquote {
        margin: 10px 0;
        padding: 2px 0 2px 12px;
        border-left: 3px solid #d8dfe6;
        color: #68727d;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body pre {
        overflow-x: auto;
        margin: 10px 0;
        padding: 10px;
        border-radius: 6px;
        background: #f5f7fa;
        line-height: 1.6;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body code {
        padding: 2px 5px;
        border-radius: 4px;
        background: #f0f3f6;
        font-family: Consolas, "SFMono-Regular", monospace;
        font-size: 13px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body pre code {
        padding: 0;
        background: transparent;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body a {
        color: #2775d1;
        text-decoration: none;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body a:hover {
        text-decoration: underline;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-comment-preview__emoji {
        display: inline-block;
        width: 1.45em;
        height: 1.45em;
        margin: 0 2px;
        object-fit: contain;
        vertical-align: -0.35em;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-comment-preview__emoji--big {
        width: 2.25em;
        height: 2.25em;
        vertical-align: -0.78em;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__summary-content {
        width: 100%;
        min-width: 0;
        min-height: 0;
        white-space: normal;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__summary-content > *,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message > * {
        max-width: 100%;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__body.is-muted .better-ai-summary__summary-content {
        white-space: pre-wrap;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat {
        flex: 0 0 auto;
        border-top: 1px solid #eef0f2;
        background: #fbfcfd;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-messages {
        box-sizing: border-box;
        padding: 14px 0 0;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-messages:empty {
        display: none;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message {
        box-sizing: border-box;
        width: fit-content;
        max-width: 88%;
        margin: 0 0 8px;
        padding: 8px 10px;
        border-radius: 8px;
        color: #2f3842;
        font-size: 13px;
        line-height: 1.65;
        overflow-wrap: anywhere;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message--user {
        margin-left: auto;
        background: #e9f2ff;
        color: #1f5f9f;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message--assistant {
        margin-right: auto;
        background: #fff;
        border: 1px solid #e6ebf0;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message--muted {
        color: #8a9299;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-message-meta {
        margin-top: 4px;
        color: #8a9299;
        font-size: 12px;
        line-height: 1.4;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-form {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 10px 18px 14px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-input {
        box-sizing: border-box;
        width: 100%;
        min-height: 36px;
        max-height: 96px;
        flex: 1 1 auto;
        resize: vertical;
        padding: 8px 10px;
        border: 1px solid #d8dfe6;
        border-radius: 6px;
        outline: none;
        color: #2f3842;
        font-size: 13px;
        line-height: 18px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-input:focus {
        border-color: #2775d1;
        box-shadow: 0 0 0 3px rgba(39, 117, 209, 0.12);
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-send {
        height: 36px;
        flex: 0 0 auto;
        padding: 0 14px;
        border: 0;
        border-radius: 6px;
        background: #2775d1;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        line-height: 36px;
      }

      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-send:disabled,
      .${AI_SUMMARY_MODAL_CLASS} .better-ai-summary__chat-input:disabled {
        cursor: default;
        opacity: 0.65;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout-main__container--main {
        box-sizing: border-box;
        width: min(1280px, calc(100vw - 192px)) !important;
        max-width: none !important;
        margin-right: auto !important;
        margin-left: auto !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} #page-bbs-link,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} #page-bbs-link > .content,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} #page-bbs-link > .content > .list {
        box-sizing: border-box !important;
        min-width: 0 !important;
        width: min(1280px, calc(100vw - 192px)) !important;
        max-width: none !important;
        margin-right: auto !important;
        margin-left: auto !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} #page-bbs-link {
        position: relative;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} #page-bbs-link [data-mask-frame] {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout__fake-frame {
        overflow: visible !important;
        width: 100% !important;
        max-width: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout__fake-frame-left--top,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout__fake-frame-left--bottom {
        width: 100% !important;
        max-width: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout__fake-frame-left--bottom {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout__fake-frame-container {
        overflow: visible !important;
        width: 100% !important;
        max-width: none !important;
        max-height: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link {
        overflow: visible !important;
        width: 100% !important;
        max-width: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link {
        box-sizing: border-box;
        display: grid !important;
        grid-template-columns: minmax(0, 3fr) minmax(360px, 2fr);
        align-items: start;
        gap: 16px;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__header {
        grid-column: 1;
        min-width: 0;
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__header .page-header__container {
        box-sizing: border-box;
        position: relative !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__header .page-header__other-trans {
        overflow: visible;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__header .page-header--right {
        overflow: visible;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__header .better-link-page-ai-summary {
        position: absolute !important;
        top: 50% !important;
        right: 44px !important;
        z-index: 2;
        flex: 0 0 auto;
        margin: 0;
        transform: translateY(-50%);
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__container {
        display: contents !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-image-text,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs__video {
        grid-column: 1;
        min-width: 0;
        min-height: 0 !important;
        height: auto !important;
        width: 100% !important;
        max-width: none !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs__video .bbs-video__video-container {
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .post__container,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .post__content,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .com-img,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .com-img-item {
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .post__container {
        box-sizing: border-box;
        width: min(100%, 960px) !important;
        margin-right: auto !important;
        margin-left: auto !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-post .com-img-item {
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-image-text .image-text__header-image,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-image-text .image-text__container {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        margin-bottom: 0 !important;
        padding-bottom: 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-image-text .header-image__container {
        width: 100% !important;
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        grid-column: 2;
        position: fixed !important;
        top: 76px !important;
        right: max(96px, calc((100vw - 1280px) * 0.5)) !important;
        z-index: 30;
        height: calc(100vh - 168px);
        max-height: calc(100vh - 168px);
        min-height: 0;
        overflow-x: hidden;
        overflow-y: auto;
        width: clamp(360px, 34vw, 520px) !important;
        max-width: calc(100vw - 192px) !important;
        padding: 0 0 12px 16px;
        border-left: 1px solid #eef0f2;
        background: #fff;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment__comment-header,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination-outer,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination-inner {
        position: static !important;
        top: auto !important;
        right: auto !important;
        bottom: auto !important;
        left: auto !important;
        z-index: auto !important;
        transform: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment__comment-header {
        box-sizing: border-box;
        flex: 0 0 auto;
        display: block !important;
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 0 10px !important;
        border-bottom: 1px solid #eef0f2;
        background: #fff;
        opacity: 1 !important;
        overflow: visible !important;
        pointer-events: auto !important;
        transform: none !important;
        visibility: visible !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination-outer,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination-inner {
        box-sizing: border-box;
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .hb-cpt__pagination-inner {
        display: flex !important;
        align-items: center;
        flex-wrap: nowrap;
        gap: 8px;
        min-height: 32px !important;
        overflow: visible !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .slide-tab__tab-item {
        flex: 0 0 auto;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .slide-tab-tab__bar {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .better-link-page-ai-summary {
        flex: 0 0 auto;
        margin-left: 0;
        margin-right: 4px;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .better-comment-preview__toolbar {
        flex: 0 1 auto;
        justify-content: flex-end;
        margin-left: auto !important;
        overflow: visible;
        width: auto;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .better-link-page-ai-summary + .better-comment-preview__toolbar {
        margin-left: 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .link-comment__list {
        display: flex !important;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: visible;
        width: 100% !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        overscroll-behavior: contain;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .link-comment__comment-item,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment-item__content-container,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment-item__image-box,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .link-comment__comment-children {
        box-sizing: border-box;
        width: 100% !important;
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment-item__image-wrapper {
        max-width: 100%;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment-item__image {
        max-width: 100%;
        height: auto;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment > .hb-cpt__empty {
        padding: 88px 0 !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment::-webkit-scrollbar {
        width: 6px;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: #d7dce1;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment::-webkit-scrollbar-track {
        background: transparent;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-reply {
        box-sizing: border-box;
        grid-column: 2;
        position: fixed !important;
        right: max(96px, calc((100vw - 1280px) * 0.5)) !important;
        bottom: 12px !important;
        left: auto !important;
        z-index: 31;
        width: clamp(360px, 34vw, 520px) !important;
        max-width: calc(100vw - 192px) !important;
        margin-top: -8px;
        border-left: 1px solid #eef0f2;
        background: #fff;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-reply__main-box {
        box-sizing: border-box;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-cpt__empty,
      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .scroll-list__button-group {
        grid-column: 2;
      }

      @media (max-width: 1040px) {
        .${HOME_LAYOUT_CLASS} .${ROW_CLASS} {
          grid-template-columns: minmax(0, 1fr);
        }

        .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} {
          display: none;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-layout-main__container--main {
          width: 100% !important;
          max-width: 100% !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link {
          display: block !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__container {
          display: block !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment {
          position: static !important;
          right: auto !important;
          bottom: auto !important;
          left: auto !important;
          height: auto !important;
          max-height: none !important;
          width: 100% !important;
          max-width: 100% !important;
          overflow: visible !important;
          padding-left: 0 !important;
          border-left: 0 !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .comment__comment-header {
          position: static !important;
          top: auto !important;
          right: auto !important;
          bottom: auto !important;
          left: auto !important;
          height: auto !important;
          min-height: 0 !important;
          width: auto !important;
          max-width: none !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-comment .link-comment__list {
          position: static !important;
          top: auto !important;
          right: auto !important;
          bottom: auto !important;
          left: auto !important;
          overflow: visible;
          width: 100% !important;
        }

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .link-reply {
          position: sticky !important;
          bottom: 0 !important;
          right: auto !important;
          left: auto !important;
          width: 100% !important;
          max-width: 100% !important;
          margin-top: 0;
          border-left: 0;
        }
      }
    `;
    document.documentElement.appendChild(style);
  }

  function removeRightContent() {
    document.querySelectorAll(RIGHT_CONTENT_SELECTOR).forEach((node) => {
      node.style.display = "none";
    });
  }

  function setHotSearchSidebarOpen(sidebar, isOpen) {
    sidebar.classList.toggle(HOT_SEARCH_SIDEBAR_OPEN_CLASS, isOpen);
    const toggle = sidebar.querySelector(`.${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS}`);
    toggle?.setAttribute("aria-expanded", String(isOpen));
    toggle?.setAttribute("aria-label", isOpen ? "收起黑盒热搜" : "展开黑盒热搜");
    toggle?.setAttribute("title", isOpen ? "收起黑盒热搜" : "展开黑盒热搜");
  }

  function removeHotSearchSidebar() {
    document.querySelectorAll(`.${HOT_SEARCH_SIDEBAR_CLASS}`).forEach((node) => {
      node.style.display = "none";
    });
  }

  function ensureHotSearchSidebar() {
    let sidebar = document.querySelector(`.${HOT_SEARCH_SIDEBAR_CLASS}`);
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = HOT_SEARCH_SIDEBAR_CLASS;

      const panel = document.createElement("div");
      panel.className = HOT_SEARCH_SIDEBAR_PANEL_CLASS;
      sidebar.appendChild(panel);

      const toggle = document.createElement("button");
      toggle.className = HOT_SEARCH_SIDEBAR_TOGGLE_CLASS;
      toggle.type = "button";
      toggle.textContent = "黑盒热搜";
      toggle.title = "展开黑盒热搜";
      toggle.setAttribute("aria-label", "展开黑盒热搜");
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        setHotSearchSidebarOpen(sidebar, !sidebar.classList.contains(HOT_SEARCH_SIDEBAR_OPEN_CLASS));
      });
      sidebar.appendChild(toggle);

      document.body.appendChild(sidebar);
    }

    return sidebar;
  }

  function findSearchHotList() {
    return document.querySelector(".game-rank__aside-hot-game")
      || document.querySelector(".search__hot-rank")
      || null;
  }

  function buildSearchWelcomeApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(SEARCH_WELCOME_API_PATH)
    });

    return `https://api.xiaoheihe.cn${SEARCH_WELCOME_API_PATH}?${params.toString()}`;
  }

  function fetchSearchWelcomeData() {
    if (!hotSearchPromise) {
      hotSearchPromise = fetch(buildSearchWelcomeApiUrl(), {
        credentials: "include",
        headers: {
          accept: "application/json, text/plain, */*"
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.status !== "ok") {
            throw new Error(data?.msg || "黑盒热搜加载失败");
          }

          return Array.isArray(data?.result?.Lists) ? data.result.Lists : [];
        })
        .catch((error) => {
          hotSearchPromise = null;
          throw error;
        });
    }

    return hotSearchPromise;
  }

  function getHotSearchItemHref(item) {
    const text = item?.text || "";
    if (!text) {
      return "/app/search";
    }

    return `/app/search?q=${encodeURIComponent(text)}`;
  }

  function renderHotSearchRank(panel, ranks, activeTabType) {
    panel.replaceChildren();

    if (!ranks.length) {
      const empty = document.createElement("div");
      empty.className = "better-hot-search__empty";
      empty.textContent = "暂无热搜";
      panel.appendChild(empty);
      return;
    }

    const activeRank = ranks.find((rank) => rank.tab_type === activeTabType) || ranks[0];
    const tabs = document.createElement("div");
    tabs.className = "better-hot-search__tabs";
    ranks.forEach((rank) => {
      const tab = document.createElement("button");
      tab.className = "better-hot-search__tab";
      if (rank === activeRank) {
        tab.classList.add("better-hot-search__tab--active");
      }
      tab.type = "button";
      tab.textContent = rank.is_hot ? "热搜" : (rank.head_text || "榜单");
      tab.addEventListener("click", () => {
        renderHotSearchRank(panel, ranks, rank.tab_type);
      });
      tabs.appendChild(tab);
    });
    panel.appendChild(tabs);

    const list = document.createElement("div");
    list.className = "better-hot-search__list";
    (activeRank.items || []).forEach((item, index) => {
      const link = document.createElement("a");
      link.className = "better-hot-search__item";
      link.href = getHotSearchItemHref(item);

      const rankIndex = document.createElement("span");
      rankIndex.className = "better-hot-search__index";
      rankIndex.textContent = String(index + 1);
      link.appendChild(rankIndex);

      const content = document.createElement("span");
      const name = document.createElement("span");
      name.className = "better-hot-search__name";
      name.textContent = item?.text || "";
      content.appendChild(name);

      if (item?.desc) {
        const desc = document.createElement("span");
        desc.className = "better-hot-search__desc";
        desc.textContent = item.desc;
        content.appendChild(desc);
      }

      link.appendChild(content);
      list.appendChild(link);
    });
    panel.appendChild(list);
  }

  function renderHotSearchFallback(panel) {
    if (panel.dataset.betterHotSearchFallback === "loaded" || panel.dataset.betterHotSearchFallback === "loading") {
      return;
    }

    panel.dataset.betterHotSearchFallback = "loading";
    const loading = document.createElement("div");
    loading.className = "better-hot-search__loading";
    loading.textContent = "热搜加载中";
    panel.replaceChildren(loading);

    fetchSearchWelcomeData()
      .then((ranks) => {
        panel.dataset.betterHotSearchFallback = "loaded";
        renderHotSearchRank(panel, ranks);
      })
      .catch(() => {
        panel.dataset.betterHotSearchFallback = "failed";
        const error = document.createElement("div");
        error.className = "better-hot-search__error";
        error.textContent = "热搜加载失败";
        panel.replaceChildren(error);
      });
  }

  function moveSearchHotListToLeftSidebar() {
    if (!isSearchPage()) {
      removeHotSearchSidebar();
      return;
    }

    const sidebar = ensureHotSearchSidebar();
    const panel = sidebar.querySelector(`.${HOT_SEARCH_SIDEBAR_PANEL_CLASS}`);
    if (!panel) {
      return;
    }

    const hotSearch = findSearchHotList();
    if (hotSearch && panel.contains(hotSearch)) {
      return;
    }

    if (hotSearch && hotSearch.parentElement !== panel) {
      panel.dataset.betterHotSearchFallback = "";
      panel.replaceChildren();
      panel.appendChild(hotSearch);
      return;
    }

    renderHotSearchFallback(panel);
  }

  function getCookie(name) {
    return document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${name}=`))
      ?.slice(name.length + 1) || "";
  }

  function getSanitizedCookieHeader() {
    return document.cookie
      .split(";")
      .map((item) => item.trim())
      .filter((item) => {
        const name = item.split("=")[0]?.trim();
        return name && !IDENTITY_COOKIE_NAMES.includes(name);
      })
      .join("; ");
  }

  function requestSanitizedCookieRuleChange(action, id, cookieHeader = "", timeout = 5000) {
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        window.removeEventListener(SANITIZED_COOKIE_RULE_RESPONSE_EVENT, handleResponse);
        resolve({ ok: false, error: "请求头规则处理超时" });
      }, timeout);

      function handleResponse(event) {
        const detail = parseEventDetail(event.detail);
        if (detail.id !== id) {
          return;
        }

        window.clearTimeout(timer);
        window.removeEventListener(SANITIZED_COOKIE_RULE_RESPONSE_EVENT, handleResponse);
        resolve(detail);
      }

      window.addEventListener(SANITIZED_COOKIE_RULE_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(SANITIZED_COOKIE_RULE_REQUEST_EVENT, {
        detail: stringifyEventDetail({
          id,
          action,
          cookieHeader
        })
      }));
    });
  }

  function runWithSanitizedCommentCookie(task) {
    const id = `better-comment-cookie-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const cookieHeader = getSanitizedCookieHeader();
    return requestSanitizedCookieRuleChange("activate", id, cookieHeader)
      .then((result) => {
        if (!result.ok) {
          throw new Error(result.error || "请求头规则处理失败");
        }

        return Promise.resolve()
          .then(task)
          .finally(() => requestSanitizedCookieRuleChange("release", id));
      });
  }

  function runWithoutIdentityCookies(task) {
    return Promise.resolve().then(task);
  }

  function runAfterIdentityCookiesRestored(task) {
    return Promise.resolve().then(task);
  }

  function captureApiParams(url) {
    let parsed;

    try {
      parsed = new URL(url, window.location.href);
    } catch {
      return;
    }

    if (parsed.origin !== API_ORIGIN) {
      return;
    }

    let changed = false;
    CAPTURED_API_PARAM_KEYS.forEach((key) => {
      const value = parsed.searchParams.get(key);
      if (value && capturedApiParams[key] !== value) {
        capturedApiParams[key] = value;
        changed = true;
      }
    });
    if (changed) {
      persistCapturedApiParams();
    }
  }

  function persistCapturedApiParams() {
    const values = CAPTURED_API_PARAM_KEYS.reduce((result, key) => {
      if (capturedApiParams[key]) {
        result[key] = capturedApiParams[key];
      }
      return result;
    }, {});
    const text = JSON.stringify(values);
    if (!Object.keys(values).length || text === lastSavedApiParamsText) {
      return;
    }
    lastSavedApiParamsText = text;
    window.dispatchEvent(new CustomEvent(LOCAL_SETTINGS_SAVE_EVENT, {
      detail: stringifyEventDetail({
        values: {
          [API_PARAMS_STORAGE_KEY]: {
            params: values,
            capturedAt: Date.now(),
            source: "xiaoheihe-page"
          }
        }
      })
    }));
  }

  function getRequestUrl(input) {
    if (typeof input === "string") {
      return input;
    }

    if (input instanceof URL) {
      return input.href;
    }

    if (input instanceof Request) {
      return input.url;
    }

    return "";
  }

  function isFeedApiUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return parsed.origin === API_ORIGIN && parsed.pathname === FEEDS_API_PATH;
    } catch {
      return false;
    }
  }

  function cacheFeedApiData(data) {
    const links = Array.isArray(data?.result?.links) ? data.result.links : [];
    links.forEach((link) => {
      const linkId = String(link?.linkid || link?.link_id || "");
      if (linkId) {
        cacheLinkDetailFromApiData(linkId, { result: { link } });
      }
    });
  }

  function cacheFeedApiResponseText(text) {
    try {
      cacheFeedApiData(JSON.parse(text));
    } catch {
      // Ignore non-JSON or incomplete responses.
    }
  }

  function installApiParamCapture() {
    if (window.__betterXiaoHeiHeApiCaptureInstalled) {
      return;
    }

    window.__betterXiaoHeiHeApiCaptureInstalled = true;
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const url = getRequestUrl(args[0]);
      captureApiParams(url);
      const request = originalFetch.apply(this, args);
      if (isFeedApiUrl(url)) {
        request.then((response) => response.clone().json())
          .then(cacheFeedApiData)
          .catch(() => {});
      }
      return request;
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      const requestUrl = getRequestUrl(url);
      captureApiParams(requestUrl);
      if (isFeedApiUrl(requestUrl)) {
        this.addEventListener("load", () => {
          if (this.responseType === "json") {
            cacheFeedApiData(this.response);
            return;
          }
          cacheFeedApiResponseText(this.responseText);
        }, { once: true });
      }
      return originalXhrOpen.call(this, method, url, ...args);
    };

    if (!window.PerformanceObserver) {
      return;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          captureApiParams(entry.name);
        });
      });
      observer.observe({ type: "resource", buffered: true });
    } catch {
      // Older browsers may not support buffered resource observers.
    }
  }

  function captureExistingApiEntries() {
    if (!window.performance?.getEntriesByType) {
      return;
    }

    window.performance.getEntriesByType("resource").forEach((entry) => {
      captureApiParams(entry.name);
    });
  }

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

      let olda;
      let oldb;
      let oldc;
      let oldd;
      let a = 1732584193;
      let b = -271733879;
      let c = -1732584194;
      let d = 271733878;

      for (let i = 0; i < x.length; i += 16) {
        olda = a;
        oldb = b;
        oldc = c;
        oldd = d;

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

  function getBaseApiParams(options = {}) {
    const { includeHeyboxId = true } = options;
    captureExistingApiEntries();

    const params = {
      os_type: "web",
      app: "heybox",
      client_type: "web",
      version: "999.0.4",
      web_version: "2.5",
      x_client_type: "web",
      x_app: "heybox_website",
      heybox_id: getCookie("heybox_id") || getCookie("user_heybox_id") || "",
      x_os_type: "Windows",
      device_info: "Chrome"
    };

    CAPTURED_API_PARAM_KEYS.forEach((key) => {
      if (capturedApiParams[key]) {
        params[key] = capturedApiParams[key];
      }
    });

    if (!includeHeyboxId) {
      delete params.heybox_id;
    }

    return params;
  }

  function buildCommentApiUrl(linkId, page, options = {}) {
    const params = new URLSearchParams({
      ...getBaseApiParams({ includeHeyboxId: options.includeHeyboxId === true }),
      ...createSignedParams(API_PATH),
      link_id: linkId,
      is_first: page === 1 ? "1" : "0",
      page: String(page),
      index: "1",
      limit: String(COMMENT_PAGE_LIMIT),
      owner_only: "0"
    });

    return `https://api.xiaoheihe.cn${API_PATH}?${params.toString().replace("&link_id=", "&h_src&link_id=")}`;
  }

  function buildSubCommentApiUrl(rootCommentId, lastval, options = {}) {
    const params = new URLSearchParams({
      ...getBaseApiParams({ includeHeyboxId: options.includeHeyboxId === true }),
      ...createSignedParams(SUB_COMMENT_API_PATH),
      root_comment_id: rootCommentId,
      lastval: lastval || rootCommentId,
      limit: String(SUB_COMMENT_PAGE_LIMIT)
    });

    return `https://api.xiaoheihe.cn${SUB_COMMENT_API_PATH}?${params.toString()}`;
  }

  function buildEmojiApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(EMOJI_API_PATH)
    });

    return `https://api.xiaoheihe.cn${EMOJI_API_PATH}?${params.toString()}`;
  }

  function buildCommentSupportApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(COMMENT_SUPPORT_API_PATH)
    });

    return `https://api.xiaoheihe.cn${COMMENT_SUPPORT_API_PATH}?${params.toString()}`;
  }

  function buildCommentCreateApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(COMMENT_CREATE_API_PATH)
    });

    return `https://api.xiaoheihe.cn${COMMENT_CREATE_API_PATH}?${params.toString()}`;
  }

  function buildCommentUploadInfoApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(COMMENT_UPLOAD_INFO_API_PATH)
    });

    return `https://api.xiaoheihe.cn${COMMENT_UPLOAD_INFO_API_PATH}?${params.toString()}`;
  }

  function buildCommentUploadTokenApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(COMMENT_UPLOAD_TOKEN_API_PATH)
    });

    return `https://api.xiaoheihe.cn${COMMENT_UPLOAD_TOKEN_API_PATH}?${params.toString()}`;
  }

  function buildCommentUploadCallbackApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(COMMENT_UPLOAD_CALLBACK_API_PATH),
      is_finished: "true"
    });

    return `https://api.xiaoheihe.cn${COMMENT_UPLOAD_CALLBACK_API_PATH}?${params.toString()}`;
  }

  function buildLinkAwardApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(LINK_AWARD_API_PATH)
    });

    return `https://api.xiaoheihe.cn${LINK_AWARD_API_PATH}?${params.toString()}`;
  }

  function buildMessageApiUrl(options = {}) {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(MESSAGE_API_PATH),
      list_type: String(options.listType ?? 0),
      offset: String(options.offset || 0),
      limit: String(options.limit || 20),
      no_more: "false"
    });

    return `https://api.xiaoheihe.cn${MESSAGE_API_PATH}?${params.toString()}`;
  }

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
    return String(message?.topic_name || message?.topic?.name || "").trim();
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
    return String(message?.link_user || message?.link_author || message?.author || message?.user_b?.username || "").trim();
  }

  function getReplyMessageLinkAuthorAvatar(message) {
    return String(message?.user_b?.avatar || message?.user_b?.avartar || message?.link_user_avatar || message?.author_avatar || "").trim();
  }

  function getReplyMessageLinkAuthorLevel(message) {
    const level = normalizeUserLevel(message?.user_b?.level_info?.level || message?.link_user_level || message?.author_level || "");
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
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.HOT) {
      const hotDiff = getCommentUpCount(right.root) - getCommentUpCount(left.root);
      return hotDiff || getCommentGroupOriginalIndex(left) - getCommentGroupOriginalIndex(right);
    }

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
    syncCyToggleControls();
    bindPreviewActions(preview);
    bindPreviewListScroll(preview);
    scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
  }

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
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function requestCommentApiJson(buildUrl, includeIdentity) {
    return fetch(buildUrl({ includeHeyboxId: includeIdentity }), {
      credentials: "include",
      headers: {
        accept: "*/*"
      }
    }).then((response) => response.json());
  }

  function fetchCommentApiJson(buildUrl) {
    return runWithSanitizedCommentCookie(() => requestCommentApiJson(buildUrl, false))
      .then((data) => (data?.status === "ok" ? data : requestCommentApiJson(buildUrl, true)))
      .catch(() => requestCommentApiJson(buildUrl, true));
  }

  function fetchCommentApiJsonWithIdentity(buildUrl) {
    return requestCommentApiJson(buildUrl, true);
  }

  function retryFirstCommentPageWithIdentity(linkId) {
    return delay(COMMENT_IDENTITY_RETRY_DELAY)
      .then(() => fetchCommentPageData(linkId, 1, { identityOnly: true }));
  }

  function markFirstCommentPageFailed(linkId) {
    const state = commentCache.get(linkId) || { commentGroups: [] };
    state.failed = true;
    state.loadingMore = false;
    state.loadMoreFailed = false;
    state.hasMore = false;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function retryFailedFirstCommentPage(linkId) {
    return retryFirstCommentPageWithIdentity(linkId).then((retryData) => {
      const retryState = commentCache.get(linkId) || { commentGroups: [] };
      if (retryData?.status !== "ok") {
        markFirstCommentPageFailed(linkId);
        return;
      }

      const nextState = cacheCommentPageFromApiData(linkId, 1, retryData) || retryState;
      updateFeedItemPublishTime(linkId, nextState.linkCreateAt);
      renderLinkedPreviews(linkId);
    }).catch(() => markFirstCommentPageFailed(linkId));
  }

  function fetchCommentPage(linkId, page) {
    fetchCommentPageData(linkId, page).then((data) => {
      const state = commentCache.get(linkId) || { commentGroups: [] };
      if (data?.status !== "ok") {
        if (page === 1) {
          retryFailedFirstCommentPage(linkId);
          return;
        }

        state.failed = page === 1;
        state.loadingMore = false;
        state.loadMoreFailed = page > 1;
        state.hasMore = false;
        commentCache.set(linkId, state);
        renderLinkedPreviews(linkId);
        return;
      }

      const nextState = cacheCommentPageFromApiData(linkId, page, data) || state;
      updateFeedItemPublishTime(linkId, nextState.linkCreateAt);
      renderLinkedPreviews(linkId);
    }).catch(() => {
      if (page === 1) {
        retryFailedFirstCommentPage(linkId);
        return;
      }

      const state = commentCache.get(linkId) || { commentGroups: [] };
      state.failed = page === 1;
      state.loadingMore = false;
      state.loadMoreFailed = page > 1;
      state.hasMore = false;
      commentCache.set(linkId, state);
      renderLinkedPreviews(linkId);
    });
  }

  function getLastReplyValue(group) {
    const lastReply = group.replies?.at(-1);
    return getCommentId(lastReply) || getCommentId(group.root);
  }

  function findCommentGroup(linkId, rootCommentId) {
    const state = commentCache.get(linkId);
    const group = state?.commentGroups?.find((item) => {
      return String(getCommentId(item.root)) === String(rootCommentId);
    });

    return { state, group };
  }

  function mergeReplyComments(group, replies) {
    const existingIds = new Set((group.replies || []).map((reply) => String(getCommentId(reply))));
    const nextReplies = replies.filter((reply) => {
      const replyId = String(getCommentId(reply));
      if (!replyId || existingIds.has(replyId)) {
        return false;
      }
      existingIds.add(replyId);
      return true;
    });

    group.replies = (group.replies || []).concat(nextReplies);
    group.replyCount = Math.max(Number(group.replyCount) || 0, group.replies.length);
    group.repliesHasMore = nextReplies.length > 0
      && (nextReplies.length >= SUB_COMMENT_PAGE_LIMIT || group.replies.length < group.replyCount);
  }

  function loadMoreReplyComments(preview, rootCommentId) {
    const linkId = preview.dataset.linkId;
    const { state, group } = findCommentGroup(linkId, rootCommentId);
    if (!linkId || !state || !group || group.repliesLoading) {
      return;
    }

    group.repliesLoading = true;
    group.repliesFailed = false;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);

    Promise.all([
      loadEmojis(),
      fetchCommentApiJson((options) => buildSubCommentApiUrl(rootCommentId, getLastReplyValue(group), options))
    ]).then(([, data]) => {
      const { state: nextState, group: nextGroup } = findCommentGroup(linkId, rootCommentId);
      if (!nextState || !nextGroup) {
        return;
      }

      nextGroup.repliesLoading = false;
      if (data?.status !== "ok") {
        nextGroup.repliesFailed = true;
        commentCache.set(linkId, nextState);
        renderLinkedPreviews(linkId);
        return;
      }

      mergeReplyComments(nextGroup, normalizeSubComments(data, rootCommentId));
      nextGroup.repliesFailed = false;
      commentCache.set(linkId, nextState);
      renderLinkedPreviews(linkId);
    }).catch(() => {
      const { state: nextState, group: nextGroup } = findCommentGroup(linkId, rootCommentId);
      if (!nextState || !nextGroup) {
        return;
      }

      nextGroup.repliesLoading = false;
      nextGroup.repliesFailed = true;
      commentCache.set(linkId, nextState);
      renderLinkedPreviews(linkId);
    });
  }

  function renderLinkedPreviews(linkId) {
    const state = commentCache.get(linkId);
    document.querySelectorAll(`.${PREVIEW_CLASS}`).forEach((node) => {
      if (node.dataset.linkId !== linkId) {
        return;
      }

      const list = node.querySelector(".better-comment-preview__list");
      const scrollTop = list?.scrollTop || 0;
      renderPreview(node, state);
      const nextList = node.querySelector(".better-comment-preview__list");
      if (nextList) {
        nextList.scrollTop = scrollTop;
      }
    });
    syncCyToggleControls();
  }

  function renderAllPreviews() {
    document.querySelectorAll(`.${PREVIEW_CLASS}`).forEach((node) => {
      const linkId = node.dataset.linkId || "";
      const state = commentCache.get(linkId);
      if (!state) {
        return;
      }

      const list = node.querySelector(".better-comment-preview__list");
      const scrollTop = list?.scrollTop || 0;
      renderPreview(node, state);
      const nextList = node.querySelector(".better-comment-preview__list");
      if (nextList) {
        nextList.scrollTop = scrollTop;
      }
    });
    syncCyToggleControls();
  }

  function setHideCyComments(isHidden) {
    hideCyComments = isHidden;
    writeHideCyCommentsState(isHidden);
    syncCyToggleControls();
    refreshAllCommentFilters();
  }

  function setCommentPreviewSort(sort) {
    commentPreviewSort = normalizeCommentPreviewSort(sort);
    writeCommentPreviewSortState(commentPreviewSort);
    syncCommentSortControls();
    refreshAllCommentFilters();
  }

  function updateCachedComment(commentId, updater) {
    let changedLinkId = "";
    commentCache.forEach((state, linkId) => {
      if (!state?.commentGroups?.length) {
        return;
      }

      const changed = state.commentGroups.some((group) => {
        const comments = [group.root, ...(group.replies || [])];
        const comment = comments.find((item) => String(getCommentId(item)) === String(commentId));
        if (!comment) {
          return false;
        }

        updater(comment);
        return true;
      });

      if (changed) {
        changedLinkId = linkId;
      }
    });

    if (changedLinkId) {
      renderLinkedPreviews(changedLinkId);
    }

    return Boolean(changedLinkId);
  }

  function updateSupportButton(button, count, supported) {
    const countElement = button.querySelector("span");
    if (countElement) {
      countElement.textContent = String(count);
    }
    button.classList.toggle("better-comment-preview__up--active", supported);
    button.disabled = false;
    delete button.dataset.loading;
  }

  function supportComment(commentId, button) {
    if (!commentId || button.dataset.loading === "1") {
      return;
    }

    button.dataset.loading = "1";
    button.disabled = true;

    runAfterIdentityCookiesRestored(() => fetch(buildCommentSupportApiUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams({
        comment_id: commentId,
        support_type: "1"
      }).toString()
    })).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        delete button.dataset.loading;
        button.disabled = false;
        return;
      }

      const changed = updateCachedComment(commentId, (comment) => {
        if (!isCommentSupported(comment)) {
          comment.up = getCommentUpCount(comment) + 1;
        }
        comment.is_support = 1;
        comment.better_supported = true;
      });

      if (!changed) {
        updateSupportButton(button, getCommentUpCount({ up: button.querySelector("span")?.textContent }) + 1, true);
      }
    }).catch(() => {
      delete button.dataset.loading;
      button.disabled = false;
    });
  }

  function getLinkAwardCountElement(linkAwardButton) {
    return linkAwardButton.querySelector(".content-list__like-cnt");
  }

  function getLinkAwardCount(linkAwardButton) {
    const count = Number(getLinkAwardCountElement(linkAwardButton)?.textContent?.trim() || 0);
    return Number.isFinite(count) ? count : 0;
  }

  function updateLinkAwardButtons(linkId, updater) {
    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      const item = getRowFeedItem(row);
      if (!item || getLinkIdFromItem(item) !== linkId) {
        return;
      }

      const linkAwardButton = item.querySelector(".content-list__like");
      if (linkAwardButton) {
        updater(linkAwardButton);
      }
    });
  }

  function awardLink(linkId, linkAwardButton) {
    if (!linkId || linkAwardButton.dataset.loading === "1") {
      return;
    }

    const state = commentCache.get(linkId) || { commentGroups: [] };
    if (state.linkAwarded) {
      return;
    }

    linkAwardButton.dataset.loading = "1";
    linkAwardButton.classList.add("better-link-award--loading");
    state.linkAwarding = true;
    commentCache.set(linkId, state);

    runAfterIdentityCookiesRestored(() => fetch(buildLinkAwardApiUrl(), {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams({
        link_id: linkId,
        award_type: "1"
      }).toString()
    })).then((response) => response.json()).then((data) => {
      const nextState = commentCache.get(linkId) || state;
      nextState.linkAwarding = false;
      if (data?.status === "ok") {
        nextState.linkAwarded = true;
        updateLinkAwardButtons(linkId, (button) => {
          delete button.dataset.loading;
          button.classList.remove("better-link-award--loading");
          button.classList.add("better-link-award--active");
          const countElement = getLinkAwardCountElement(button);
          if (countElement) {
            countElement.textContent = String(getLinkAwardCount(button) + 1);
          }
        });
      } else {
        updateLinkAwardButtons(linkId, (button) => {
          delete button.dataset.loading;
          button.classList.remove("better-link-award--loading");
        });
      }
      commentCache.set(linkId, nextState);
    }).catch(() => {
      const nextState = commentCache.get(linkId) || state;
      nextState.linkAwarding = false;
      commentCache.set(linkId, nextState);
      updateLinkAwardButtons(linkId, (button) => {
        delete button.dataset.loading;
        button.classList.remove("better-link-award--loading");
      });
    });
  }

  function ensureImageViewer() {
    let viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
    if (viewer) {
      return viewer;
    }

    viewer = document.createElement("div");
    viewer.className = IMAGE_VIEWER_CLASS;
    viewer.hidden = true;
    viewer.innerHTML = `
      <button class="better-image-viewer__close" type="button" aria-label="关闭图片预览">×</button>
      <button class="better-image-viewer__prev" type="button" aria-label="上一张">‹</button>
      <img class="better-image-viewer__image" alt="">
      <button class="better-image-viewer__next" type="button" aria-label="下一张">›</button>
      <div class="better-image-viewer__counter"></div>
    `;
    viewer.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target === viewer || event.target.closest(".better-image-viewer__close")) {
        closeImageViewer();
        return;
      }

      if (event.target.closest(".better-image-viewer__prev")) {
        showImageViewerAt(activeImageViewerIndex - 1);
        return;
      }

      if (event.target.closest(".better-image-viewer__next")) {
        showImageViewerAt(activeImageViewerIndex + 1);
      }
    });
    document.body.appendChild(viewer);
    bindImageViewerKeydown();
    return viewer;
  }

  function bindImageViewerKeydown() {
    if (imageViewerKeydownBound) {
      return;
    }

    imageViewerKeydownBound = true;
    document.addEventListener("keydown", (event) => {
      const viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
      if (!viewer || viewer.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeImageViewer();
      } else if (event.key === "ArrowLeft") {
        showImageViewerAt(activeImageViewerIndex - 1);
      } else if (event.key === "ArrowRight") {
        showImageViewerAt(activeImageViewerIndex + 1);
      }
    });
  }

  function showImageViewerAt(index) {
    if (!activeImageViewerImages.length) {
      return;
    }

    const viewer = ensureImageViewer();
    const image = viewer.querySelector(".better-image-viewer__image");
    const counter = viewer.querySelector(".better-image-viewer__counter");
    const prev = viewer.querySelector(".better-image-viewer__prev");
    const next = viewer.querySelector(".better-image-viewer__next");
    activeImageViewerIndex = (index + activeImageViewerImages.length) % activeImageViewerImages.length;
    image.src = activeImageViewerImages[activeImageViewerIndex];
    counter.textContent = activeImageViewerImages.length > 1
      ? `${activeImageViewerIndex + 1} / ${activeImageViewerImages.length}`
      : "";
    prev.hidden = activeImageViewerImages.length <= 1;
    next.hidden = activeImageViewerImages.length <= 1;
    if (viewer.hidden) {
      documentOverflowBeforeImageViewer = document.documentElement.style.overflow;
    }
    viewer.hidden = false;
    document.documentElement.style.overflow = "hidden";
  }

  function closeImageViewer() {
    const viewer = document.querySelector(`.${IMAGE_VIEWER_CLASS}`);
    if (!viewer) {
      return;
    }

    viewer.hidden = true;
    const image = viewer.querySelector(".better-image-viewer__image");
    if (image) {
      image.removeAttribute("src");
    }
    document.documentElement.style.overflow = documentOverflowBeforeImageViewer;
    documentOverflowBeforeImageViewer = "";
  }

  function updateExpandButton(textElement) {
    const expandButton = textElement.nextElementSibling;
    if (textElement.scrollHeight > textElement.clientHeight) {
      expandButton.style.display = "block";
    }
  }

  function toggleCommentExpansion(textElement) {
    const isExpanded = textElement.dataset.expanded === "true";
    const expandButton = textElement.nextElementSibling;
    if (isExpanded) {
      // collapse
      textElement.dataset.expanded = "false";
      textElement.style.webkitLineClamp = "3";
      expandButton.textContent = "展开";
      expandButton.classList.remove("is-expanded");
    } else {
      // expand
      textElement.dataset.expanded = "true";
      textElement.style.webkitLineClamp = "none";
      expandButton.textContent = "收起";
      expandButton.classList.add("is-expanded");
    }
  }

  function openCommentImageViewer(imageLink) {
    const imageGroup = imageLink.closest(".better-comment-preview__images");
    const links = Array.from(imageGroup?.querySelectorAll(".better-comment-preview__image-link") || [imageLink]);
    activeImageViewerImages = links.map((link) => link.dataset.previewSrc || link.href).filter(isSafeCommentImageUrl);
    const index = Math.max(0, links.indexOf(imageLink));
    showImageViewerAt(index);
  }

  function openFeedFallbackImageViewer(imageWrap) {
    const imageGroup = imageWrap.closest(".better-feed-fallback-images");
    const visibleWraps = Array.from(imageGroup?.querySelectorAll(".better-feed-fallback-image-wrap") || []);
    if (!imageGroup || !visibleWraps.length) {
      return;
    }

    let imageUrls = [];
    try {
      const signature = JSON.parse(imageGroup.dataset.signature || "[]");
      imageUrls = Array.isArray(signature?.[0]) ? signature[0].filter(isSafeCommentImageUrl) : [];
    } catch {
      imageUrls = [];
    }
    if (!imageUrls.length) {
      imageUrls = visibleWraps
        .map((wrap) => wrap.querySelector(".better-feed-fallback-image")?.src || "")
        .filter(isSafeCommentImageUrl);
    }
    if (!imageUrls.length) {
      return;
    }

    activeImageViewerImages = imageUrls;
    showImageViewerAt(Math.max(0, visibleWraps.indexOf(imageWrap)));
  }

  function findCachedComment(linkId, commentId) {
    const state = commentCache.get(linkId);
    if (!state?.commentGroups?.length || !commentId) {
      return { state, group: null, comment: null };
    }

    for (const group of state.commentGroups) {
      if (String(getCommentId(group.root)) === String(commentId)) {
        return { state, group, comment: group.root };
      }

      const reply = (group.replies || []).find((item) => String(getCommentId(item)) === String(commentId));
      if (reply) {
        return { state, group, comment: reply };
      }
    }

    return { state, group: null, comment: null };
  }

  function getPreviewReplyTargetFromElement(element) {
    if (!element) {
      return null;
    }

    const commentId = element.dataset.commentId || "";
    if (!commentId) {
      return null;
    }

    return {
      commentId,
      rootCommentId: element.dataset.rootCommentId || commentId,
      username: element.dataset.commentUsername || ""
    };
  }

  function openPreviewReplyForm(preview, target) {
    const linkId = preview.dataset.linkId || "";
    if (!linkId || !target?.commentId) {
      return;
    }

    const state = commentCache.get(linkId);
    if (!state) {
      return;
    }

    const { comment } = target.commentId === POST_COMMENT_TARGET_ID
      ? { comment: null }
      : findCachedComment(linkId, target.commentId);
    state.activeReplyTarget = {
      commentId: String(target.commentId),
      rootCommentId: String(target.rootCommentId || target.commentId),
      username: target.username || getCommentUserName(comment)
    };
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);

    window.requestAnimationFrame(() => {
      const form = preview.querySelector(".better-comment-preview__reply-form");
      form?.querySelector(".better-comment-preview__reply-input")?.focus();
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
    });
  }

  function closePreviewReplyForm(preview) {
    const linkId = preview.dataset.linkId || "";
    const state = commentCache.get(linkId);
    if (!state?.activeReplyTarget) {
      return;
    }

    delete state.activeReplyTarget;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function getPreviewReplyClickTarget(event, preview) {
    if (!(event.target instanceof Element)) {
      return null;
    }

    if (event.target.closest("a, button, input, textarea, select, label, .better-comment-preview__reply-form, .better-comment-preview__images")) {
      return null;
    }

    const targetElement = event.target.closest(".better-comment-preview__item[data-comment-id], .better-comment-preview__reply[data-comment-id]");
    if (!targetElement || !preview.contains(targetElement)) {
      return null;
    }

    return getPreviewReplyTargetFromElement(targetElement);
  }

  function getCreatedCommentFromResponse(data) {
    const candidates = [
      data?.result?.comment?.comment?.[0],
      data?.result?.comment?.[0],
      data?.result?.comment,
      data?.comment,
      data?.result
    ];

    return candidates.find((item) => item && typeof item === "object" && !Array.isArray(item)) || {};
  }

  function normalizeCreatedReplyComment(data, text, targetComment) {
    const created = { ...getCreatedCommentFromResponse(data) };
    if (!getCommentId(created)) {
      created.commentid = data?.commentid || data?.comment_id || Date.now();
    }
    if (!created.text) {
      created.text = text;
    }
    if (!created.create_at) {
      created.create_at = Math.floor(Date.now() / 1000);
    }
    if (!created.user || typeof created.user !== "object") {
      created.user = { username: "我" };
    }
    if ((!created.replyuser || typeof created.replyuser !== "object") && targetComment?.user) {
      created.replyuser = targetComment.user;
    }
    rememberCommentUserLevels(created);
    return created;
  }

  function prependCreatedPostComment(linkId, data, text) {
    const state = commentCache.get(linkId);
    if (!state) {
      return;
    }

    const createdComment = normalizeCreatedReplyComment(data, text, null);
    const createdCommentId = String(getCommentId(createdComment));
    const existingIds = new Set((state.commentGroups || []).map((group) => String(getCommentId(group.root))));
    if (!existingIds.has(createdCommentId)) {
      state.commentGroups = [{
        root: createdComment,
        replies: [],
        originalIndex: -1,
        replyCount: 0,
        repliesHasMore: false,
        repliesLoading: false,
        repliesFailed: false
      }].concat(state.commentGroups || []);
    }
    delete state.activeReplyTarget;
    state.commentCount = String((Number.parseInt(state.commentCount, 10) || 0) + 1);
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function appendCreatedReplyComment(linkId, rootCommentId, replyCommentId, data, text) {
    const { state, group } = findCommentGroup(linkId, rootCommentId);
    if (!state || !group) {
      return;
    }

    const targetComment = findCachedComment(linkId, replyCommentId).comment || group.root;
    const createdComment = normalizeCreatedReplyComment(data, text, targetComment);
    const createdCommentId = String(getCommentId(createdComment));
    const existingIds = new Set((group.replies || []).map((reply) => String(getCommentId(reply))));
    if (!existingIds.has(createdCommentId)) {
      group.replies = (group.replies || []).concat(createdComment);
    }
    group.replyCount = Math.max(Number(group.replyCount) || 0, group.replies.length);
    delete state.activeReplyTarget;
    state.commentCount = String((Number.parseInt(state.commentCount, 10) || 0) + 1);
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
  }

  function setReplyFormSending(form, isSending) {
    form.dataset.submitting = isSending ? "true" : "false";
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (editor) {
      editor.setAttribute("contenteditable", isSending ? "false" : "true");
    }
    form.querySelectorAll("button").forEach((element) => {
      element.disabled = isSending;
    });
  }

  function setReplyFormStatus(form, message, isError = false) {
    const status = form.querySelector(".better-comment-preview__reply-status");
    if (!status) {
      return;
    }

    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  function getEmojiShortcode(emoji) {
    const token = String(emoji?.token || emoji?.code || "").trim().replace(/^\[/, "").replace(/\]$/, "");
    return token ? `[${token}]` : "";
  }

  function getEmojiByShortcode(shortcode) {
    const token = String(shortcode || "").trim().replace(/^\[/, "").replace(/\]$/, "");
    return emojiCache.get(token) || emojiCache.get(normalizeEmojiToken(token)) || null;
  }

  function recordEmojiUsage(shortcode) {
    const token = String(shortcode || "").trim();
    if (!token) {
      return;
    }

    emojiUsageStats = normalizeEmojiUsageStats({
      ...emojiUsageStats,
      [token]: (Number.parseInt(emojiUsageStats[token], 10) || 0) + 1
    });
    persistEmojiUsageStats();
  }

  function getEmojiPickerItems() {
    const seen = new Set();
    return Array.from(emojiCache.values()).filter((emoji) => {
      const shortcode = getEmojiShortcode(emoji);
      const key = emoji?.img || shortcode;
      if (!shortcode || !emoji?.img || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  function getCommonEmojiPickerItems(allEmojis) {
    return [...allEmojis]
      .filter((emoji) => (emojiUsageStats[getEmojiShortcode(emoji)] || 0) > 0)
      .sort((left, right) => {
        const countDiff = (emojiUsageStats[getEmojiShortcode(right)] || 0) - (emojiUsageStats[getEmojiShortcode(left)] || 0);
        return countDiff || getEmojiShortcode(left).localeCompare(getEmojiShortcode(right), "zh-CN");
      })
      .slice(0, 12);
  }

  function renderEmojiOption(emoji) {
    const shortcode = getEmojiShortcode(emoji);
    return `
      <button class="better-comment-preview__emoji-option" type="button" data-emoji-text="${escapeHtml(shortcode)}" title="${escapeHtml(shortcode)}">
        <img class="better-comment-preview__emoji-option-image" src="${escapeHtml(emoji.img)}" alt="${escapeHtml(shortcode)}" loading="lazy">
      </button>
    `;
  }

  function renderReplyEmojiPanel(panel) {
    const emojis = getEmojiPickerItems();
    const commonEmojis = getCommonEmojiPickerItems(emojis);
    panel.dataset.loaded = "1";
    if (!emojis.length) {
      panel.innerHTML = '<div class="better-comment-preview__emoji-panel-state">暂无可用表情</div>';
      return;
    }

    panel.innerHTML = `
      ${commonEmojis.length ? `
        <div class="better-comment-preview__emoji-section">
          <div class="better-comment-preview__emoji-section-title">常用</div>
          <div class="better-comment-preview__emoji-common-row">
            ${commonEmojis.map(renderEmojiOption).join("")}
          </div>
        </div>
      ` : ""}
      <div class="better-comment-preview__emoji-section">
        <div class="better-comment-preview__emoji-section-title">全部</div>
        <div class="better-comment-preview__emoji-grid">
          ${emojis.map(renderEmojiOption).join("")}
        </div>
      </div>
    `;
  }

  function closeReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel) {
      return;
    }

    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    const tools = form.querySelector(".better-comment-preview__reply-tools");
    if (tools && panel.parentElement !== tools) {
      tools.appendChild(panel);
    }
    if (activeReplyEmojiForm === form) {
      activeReplyEmojiForm = null;
    }
  }

  function closeOtherReplyEmojiPanels(activeForm = null) {
    document.querySelectorAll(`.${PREVIEW_CLASS} .better-comment-preview__reply-form`).forEach((form) => {
      if (form !== activeForm) {
        closeReplyEmojiPanel(form);
      }
    });
  }

  function getOpenReplyEmojiForm() {
    if (activeReplyEmojiForm?._betterReplyEmojiPanel && !activeReplyEmojiForm._betterReplyEmojiPanel.hidden) {
      return activeReplyEmojiForm;
    }
    return Array.from(document.querySelectorAll(`.${PREVIEW_CLASS} .better-comment-preview__reply-form`))
      .find((form) => form.querySelector(".better-comment-preview__emoji-panel:not([hidden])")) || null;
  }

  function positionReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel || panel.hidden) {
      return;
    }

    const buttonRect = toggle.getBoundingClientRect();
    const panelWidth = Math.min(280, Math.max(180, window.innerWidth - 48));
    const left = Math.min(
      Math.max(12, buttonRect.left),
      Math.max(12, window.innerWidth - panelWidth - 12)
    );
    const top = buttonRect.bottom + 8;
    const maxHeight = Math.max(96, Math.min(220, window.innerHeight - top - 12));

    panel.style.setProperty("--better-emoji-panel-left", `${left}px`);
    panel.style.setProperty("--better-emoji-panel-top", `${top}px`);
    panel.style.setProperty("--better-emoji-panel-max-height", `${maxHeight}px`);
  }

  function toggleReplyEmojiPanel(form) {
    const toggle = form.querySelector(".better-comment-preview__emoji-toggle");
    const panel = form._betterReplyEmojiPanel || form.querySelector(".better-comment-preview__emoji-panel");
    if (!toggle || !panel) {
      return;
    }

    form._betterReplyEmojiPanel = panel;
    const shouldOpen = panel.hidden;
    closeOtherReplyEmojiPanels(form);
    if (shouldOpen && panel.parentElement !== document.body) {
      document.body.appendChild(panel);
    }
    panel.hidden = !shouldOpen;
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    activeReplyEmojiForm = shouldOpen ? form : null;
    positionReplyEmojiPanel(form);
    if (!shouldOpen) {
      return;
    }
    if (panel.dataset.loaded === "1") {
      renderReplyEmojiPanel(panel);
      positionReplyEmojiPanel(form);
      return;
    }

    panel.innerHTML = '<div class="better-comment-preview__emoji-panel-state">表情加载中</div>';
    loadEmojis().then(() => {
      renderReplyEmojiPanel(panel);
      positionReplyEmojiPanel(form);
    });
  }

  function saveReplyEditorSelection(form) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      form._betterReplyRange = range.cloneRange();
    }
  }

  function moveReplyEditorCaretToEnd(editor) {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function restoreReplyEditorSelection(form) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (!editor) {
      return;
    }

    editor.focus();
    const selection = window.getSelection();
    if (form._betterReplyRange && editor.contains(form._betterReplyRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(form._betterReplyRange);
      return;
    }

    moveReplyEditorCaretToEnd(editor);
  }

  function serializeReplyEditorNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node;
    if (element.matches(".better-comment-preview__reply-input-emoji")) {
      return element.dataset.emojiText || element.getAttribute("alt") || "";
    }
    if (element.tagName === "BR") {
      return "\n";
    }

    const text = Array.from(element.childNodes).map(serializeReplyEditorNode).join("");
    return /^(DIV|P)$/i.test(element.tagName) ? `${text}\n` : text;
  }

  function serializeReplyEditor(editor) {
    return Array.from(editor?.childNodes || [])
      .map(serializeReplyEditorNode)
      .join("")
      .replace(/\u00a0/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function insertEmojiIntoReplyForm(form, emojiText) {
    const editor = form.querySelector(".better-comment-preview__reply-input");
    if (!editor || !emojiText) {
      return;
    }

    const emoji = getEmojiByShortcode(emojiText);
    restoreReplyEditorSelection(form);

    const selection = window.getSelection();
    if (!selection?.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const insertedNode = emoji?.img
      ? document.createElement("img")
      : document.createTextNode(emojiText);
    if (insertedNode instanceof HTMLImageElement) {
      insertedNode.className = "better-comment-preview__reply-input-emoji";
      insertedNode.src = emoji.img;
      insertedNode.alt = emojiText;
      insertedNode.title = emojiText;
      insertedNode.dataset.emojiText = emojiText;
      insertedNode.contentEditable = "false";
      insertedNode.draggable = false;
    }

    range.insertNode(insertedNode);
    range.setStartAfter(insertedNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    saveReplyEditorSelection(form);
    recordEmojiUsage(emojiText);
  }

  function getReplyFormImages(form) {
    return Array.isArray(form._betterReplyImages) ? form._betterReplyImages : [];
  }

  function setReplyFormImages(form, images) {
    getReplyFormImages(form).forEach((image) => {
      if (!images.includes(image) && image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
    form._betterReplyImages = images;
    renderReplyFormImages(form);
  }

  function renderReplyFormImages(form) {
    const container = form.querySelector(".better-comment-preview__reply-attachments");
    if (!container) {
      return;
    }

    const images = getReplyFormImages(form);
    container.hidden = !images.length;
    container.innerHTML = images.map((image, index) => `
      <span class="better-comment-preview__reply-attachment">
        <img class="better-comment-preview__reply-attachment-image" src="${escapeHtml(image.previewUrl)}" alt="待上传图片 ${escapeHtml(index + 1)}">
        <button class="better-comment-preview__reply-attachment-remove" type="button" data-image-index="${escapeHtml(index)}" aria-label="移除图片" title="移除图片">×</button>
      </span>
    `).join("");
    scheduleRowHeightSync(form.closest(`.${ROW_CLASS}`));
  }

  function getImageFileSize(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const size = {
          width: image.naturalWidth || image.width || 0,
          height: image.naturalHeight || image.height || 0
        };
        URL.revokeObjectURL(url);
        resolve(size);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ width: 0, height: 0 });
      };
      image.src = url;
    });
  }

  function addReplyFormImageFiles(form, files) {
    const imageFiles = Array.from(files || []).filter((file) => file?.type?.startsWith("image/"));
    if (!imageFiles.length) {
      return;
    }

    const existingImages = getReplyFormImages(form);
    const availableCount = Math.max(0, COMMENT_REPLY_IMAGE_MAX_COUNT - existingImages.length);
    const nextFiles = imageFiles.slice(0, availableCount);
    if (!nextFiles.length) {
      setReplyFormStatus(form, `最多上传 ${COMMENT_REPLY_IMAGE_MAX_COUNT} 张图片`, true);
      return;
    }

    Promise.all(nextFiles.map(async (file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      ...(await getImageFileSize(file))
    }))).then((items) => {
      setReplyFormImages(form, existingImages.concat(items));
      setReplyFormStatus(form, imageFiles.length > availableCount ? `最多上传 ${COMMENT_REPLY_IMAGE_MAX_COUNT} 张图片` : "");
    });
  }

  function removeReplyFormImage(form, index) {
    const images = getReplyFormImages(form);
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);
    setReplyFormImages(form, nextImages);
    setReplyFormStatus(form, "");
  }

  function encodeCosComponent(value) {
    return encodeURIComponent(String(value))
      .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  function encodeCosPath(path) {
    return `/${String(path || "").replace(/^\/+/, "").split("/").map(encodeCosComponent).join("/")}`;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function sha1Hex(input) {
    return crypto.subtle.digest("SHA-1", new TextEncoder().encode(input))
      .then((buffer) => bytesToHex(new Uint8Array(buffer)));
  }

  function hmacSha1Hex(key, input) {
    return crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"]
    ).then((cryptoKey) => crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(input)))
      .then((buffer) => bytesToHex(new Uint8Array(buffer)));
  }

  async function buildCosPutAuthorization({ key, host, credentials, startTime, expiredTime }) {
    const signTime = `${startTime};${expiredTime}`;
    const method = "put";
    const canonicalUri = encodeCosPath(key);
    const httpString = `${method}\n${canonicalUri}\n\nhost=${encodeCosComponent(host).toLowerCase()}\n`;
    const stringToSign = `sha1\n${signTime}\n${await sha1Hex(httpString)}\n`;
    const signKey = await hmacSha1Hex(credentials.tmpSecretKey, signTime);
    const signature = await hmacSha1Hex(signKey, stringToSign);

    return [
      "q-sign-algorithm=sha1",
      `q-ak=${credentials.tmpSecretId}`,
      `q-sign-time=${signTime}`,
      `q-key-time=${signTime}`,
      "q-header-list=host",
      "q-url-param-list=",
      `q-signature=${signature}`
    ].join("&");
  }

  function postCommentApiForm(url, body) {
    return fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      body: new URLSearchParams(body).toString()
    }).then((response) => response.json());
  }

  function requestCommentUploadInfo(images) {
    return postCommentApiForm(buildCommentUploadInfoApiUrl(), {
      file_infos: JSON.stringify(images.map((image) => ({
        name: image.file.name || "image.png",
        mimetype: image.file.type || "image/png",
        fsize: image.file.size || 0,
        width: image.width || 0,
        height: image.height || 0
      }))),
      scope: "bbs",
      need_cache: "0"
    });
  }

  function requestCommentUploadToken(bucket, keys, images) {
    return postCommentApiForm(buildCommentUploadTokenApiUrl(), {
      bucket,
      keys: JSON.stringify(keys),
      mimetypes: JSON.stringify(images.map((image) => image.file.type || "image/png")),
      is_multipart_upload: "0"
    });
  }

  function requestCommentUploadCallback(keys) {
    return postCommentApiForm(buildCommentUploadCallbackApiUrl(), {
      keys: JSON.stringify(keys)
    });
  }

  async function uploadCommentImageToCos(image, key, uploadInfo, tokenInfo) {
    const credentials = tokenInfo?.credentials;
    if (!credentials?.tmpSecretId || !credentials?.tmpSecretKey || !credentials?.sessionToken) {
      throw new Error("图片上传凭证无效");
    }

    const host = `${uploadInfo.bucket}.cos.${uploadInfo.region}.myqcloud.com`;
    const url = `https://${host}${encodeCosPath(key)}`;
    const authorization = await buildCosPutAuthorization({
      key,
      host,
      credentials,
      startTime: tokenInfo.startTime || Math.floor(Date.now() / 1000),
      expiredTime: tokenInfo.expiredTime || Math.floor(Date.now() / 1000) + 600
    });
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        authorization,
        "content-type": image.file.type || "application/octet-stream",
        "x-cos-security-token": credentials.sessionToken
      },
      body: image.file
    });
    if (!response.ok) {
      throw new Error("图片上传失败");
    }
  }

  async function uploadReplyFormImages(images) {
    if (!images.length) {
      return [];
    }

    const infoData = await requestCommentUploadInfo(images);
    const uploadInfo = infoData?.result;
    const keys = uploadInfo?.keys || [];
    if (infoData?.status !== "ok" || !uploadInfo?.bucket || !uploadInfo?.region || keys.length !== images.length) {
      throw new Error(infoData?.msg || "获取图片上传信息失败");
    }

    const tokenData = await requestCommentUploadToken(uploadInfo.bucket, keys, images);
    const tokenInfo = tokenData?.result;
    if (tokenData?.status !== "ok" || !tokenInfo?.credentials) {
      throw new Error(tokenData?.msg || "获取图片上传凭证失败");
    }

    await Promise.all(images.map((image, index) => uploadCommentImageToCos(image, keys[index], uploadInfo, tokenInfo)));

    const callbackData = await requestCommentUploadCallback(keys);
    const previewUrls = callbackData?.result?.preview_urls || callbackData?.result?.thumbs || [];
    if (callbackData?.status !== "ok" || previewUrls.length !== images.length) {
      throw new Error(callbackData?.msg || "图片上传回调失败");
    }
    return previewUrls;
  }

  async function submitPreviewReplyForm(preview, form) {
    const linkId = preview.dataset.linkId || "";
    const replyCommentId = form.dataset.commentId || "";
    const rootCommentId = form.dataset.rootCommentId || replyCommentId;
    const isPostComment = replyCommentId === POST_COMMENT_TARGET_ID;
    const submitReplyCommentId = isPostComment ? "-1" : replyCommentId;
    const submitRootCommentId = isPostComment ? "-1" : rootCommentId;
    const editor = form.querySelector(".better-comment-preview__reply-input");
    const text = serializeReplyEditor(editor);
    const images = getReplyFormImages(form);
    if (!linkId || !submitReplyCommentId || !submitRootCommentId) {
      setReplyFormStatus(form, "缺少评论目标", true);
      return;
    }
    if (!text && !images.length) {
      setReplyFormStatus(form, "先写点内容或上传图片吧", true);
      editor?.focus();
      return;
    }
    if (text.length > COMMENT_REPLY_TEXT_MAX_LENGTH) {
      setReplyFormStatus(form, `最多 ${COMMENT_REPLY_TEXT_MAX_LENGTH} 字`, true);
      editor?.focus();
      return;
    }

    setReplyFormSending(form, true);
    setReplyFormStatus(form, images.length ? "图片上传中" : "发送中");

    runAfterIdentityCookiesRestored(async () => {
      const imageUrls = await uploadReplyFormImages(images);
      setReplyFormStatus(form, "发送中");
      return postCommentApiForm(buildCommentCreateApiUrl(), {
        is_cy: "0",
        link_id: linkId,
        reply_id: submitReplyCommentId,
        root_id: submitRootCommentId,
        text,
        ...(imageUrls.length ? { imgs: imageUrls.join(",") } : {})
      });
    }).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "发送失败");
      }

      if (isPostComment) {
        prependCreatedPostComment(linkId, data, text);
      } else {
        appendCreatedReplyComment(linkId, rootCommentId, replyCommentId, data, text);
      }
    }).catch((error) => {
      setReplyFormSending(form, false);
      setReplyFormStatus(form, error?.message || "发送失败", true);
      editor?.focus();
    });
  }

  function bindPreviewActions(preview) {
    if (preview.dataset.actionsBound === "1") {
      return;
    }

    preview.dataset.actionsBound = "1";
    ["keyup", "mouseup", "input", "focusin"].forEach((eventName) => {
      preview.addEventListener(eventName, (event) => {
        const editor = event.target instanceof Element
          ? event.target.closest(".better-comment-preview__reply-input")
          : null;
        const form = editor?.closest(".better-comment-preview__reply-form");
        if (editor && form && preview.contains(editor)) {
          saveReplyEditorSelection(form);
        }
      });
    });

    preview.addEventListener("submit", (event) => {
      const form = event.target instanceof Element
        ? event.target.closest(".better-comment-preview__reply-form")
        : null;
      if (!form || !preview.contains(form)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      submitPreviewReplyForm(preview, form);
    });

    preview.addEventListener("change", (event) => {
      const input = event.target instanceof Element
        ? event.target.closest(".better-comment-preview__reply-file-input")
        : null;
      const form = input?.closest(".better-comment-preview__reply-form");
      if (!input || !form || !preview.contains(input)) {
        return;
      }

      addReplyFormImageFiles(form, input.files);
      input.value = "";
    });

    preview.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const cancelButton = event.target.closest(".better-comment-preview__reply-cancel");
      if (cancelButton && preview.contains(cancelButton)) {
        event.preventDefault();
        event.stopPropagation();
        closePreviewReplyForm(preview);
        return;
      }

      const emojiToggle = event.target.closest(".better-comment-preview__emoji-toggle");
      if (emojiToggle && preview.contains(emojiToggle)) {
        const form = emojiToggle.closest(".better-comment-preview__reply-form");
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          toggleReplyEmojiPanel(form);
          return;
        }
      }

      const emojiOption = event.target.closest(".better-comment-preview__emoji-option");
      if (emojiOption && (preview.contains(emojiOption) || activeReplyEmojiForm)) {
        const form = emojiOption.closest(".better-comment-preview__reply-form") || getOpenReplyEmojiForm();
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          insertEmojiIntoReplyForm(form, emojiOption.dataset.emojiText || "");
          return;
        }
      }

      const imageUploadButton = event.target.closest(".better-comment-preview__image-upload");
      if (imageUploadButton && preview.contains(imageUploadButton)) {
        const form = imageUploadButton.closest(".better-comment-preview__reply-form");
        const input = form?.querySelector(".better-comment-preview__reply-file-input");
        if (input) {
          event.preventDefault();
          event.stopPropagation();
          input.click();
          return;
        }
      }

      const imageRemoveButton = event.target.closest(".better-comment-preview__reply-attachment-remove");
      if (imageRemoveButton && preview.contains(imageRemoveButton)) {
        const form = imageRemoveButton.closest(".better-comment-preview__reply-form");
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          removeReplyFormImage(form, Number.parseInt(imageRemoveButton.dataset.imageIndex, 10));
          return;
        }
      }

      const imageLink = event.target.closest(".better-comment-preview__image-link");
      if (imageLink && preview.contains(imageLink)) {
        event.preventDefault();
        event.stopPropagation();
        openCommentImageViewer(imageLink);
        return;
      }

      const cyToggle = event.target.closest(".better-comment-preview__cy-toggle");
      if (cyToggle && preview.contains(cyToggle)) {
        event.preventDefault();
        event.stopPropagation();
        setHideCyComments(!hideCyComments);
        return;
      }

      const sortButton = event.target.closest(".better-comment-preview__sort-option");
      if (sortButton && preview.contains(sortButton)) {
        event.preventDefault();
        event.stopPropagation();
        setCommentPreviewSort(sortButton.dataset.sort);
        return;
      }

      const reloadButton = event.target.closest(".better-comment-preview__reload");
      if (reloadButton && preview.contains(reloadButton)) {
        event.preventDefault();
        event.stopPropagation();
        reloadPreviewComments(preview);
        return;
      }

      const replyMoreButton = event.target.closest(".better-comment-preview__reply-more");
      if (replyMoreButton && preview.contains(replyMoreButton)) {
        event.preventDefault();
        event.stopPropagation();
        loadMoreReplyComments(preview, replyMoreButton.dataset.rootCommentId);
        return;
      }

      const expandButton = event.target.closest(".better-comment-preview__expand-button");
      if (expandButton && preview.contains(expandButton)) {
        event.preventDefault();
        event.stopPropagation();
        toggleCommentExpansion(expandButton.previousElementSibling);
        return;
      }

      const commentLink = event.target.closest(".better-comment-preview__text a, .better-comment-preview__reply-text a");
      if (commentLink && preview.contains(commentLink)) {
        const webHref = getHeyboxWebHref(commentLink.getAttribute("href") || "");
        if (webHref) {
          event.preventDefault();
          event.stopPropagation();
          window.location.href = webHref;
          return;
        }
      }

      const supportButton = event.target.closest(".better-comment-preview__up");
      if (supportButton && preview.contains(supportButton)) {
        event.preventDefault();
        event.stopPropagation();
        supportComment(supportButton.dataset.commentId, supportButton);
        return;
      }

      const postCommentButton = event.target.closest(".better-comment-preview__post-comment");
      if (postCommentButton && preview.contains(postCommentButton)) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, {
          commentId: POST_COMMENT_TARGET_ID,
          rootCommentId: POST_COMMENT_TARGET_ID,
          username: "帖子正文"
        });
        return;
      }

      const replyButton = event.target.closest(".better-comment-preview__reply-action");
      if (replyButton && preview.contains(replyButton)) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, getPreviewReplyTargetFromElement(replyButton));
        return;
      }

      const replyTarget = getPreviewReplyClickTarget(event, preview);
      if (replyTarget) {
        event.preventDefault();
        event.stopPropagation();
        openPreviewReplyForm(preview, replyTarget);
      }
    });

  }

  function loadMorePreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    const state = commentCache.get(linkId);
    if (!linkId || !state || state.loadingMore || !state.hasMore) {
      return;
    }

    state.loadingMore = true;
    commentCache.set(linkId, state);
    renderLinkedPreviews(linkId);
    fetchCommentPage(linkId, (state.page || 1) + 1);
  }

  function reloadPreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    if (!linkId) {
      return;
    }

    const previousState = commentCache.get(linkId);
    const pending = {
      commentGroups: [],
      page: 0,
      hasMore: true,
      loadingMore: true,
      linkDetail: previousState?.linkDetail
    };
    commentCache.set(linkId, pending);
    renderLinkedPreviews(linkId);
    fetchCommentPage(linkId, 1);
  }

  function bindPreviewListScroll(preview) {
    const list = preview.querySelector(".better-comment-preview__list");
    if (!list) {
      return;
    }

    const loadMoreIfNearBottom = () => {
      const distanceToBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
      if (distanceToBottom <= 80) {
        loadMorePreviewComments(preview);
      }
    };

    list.addEventListener("scroll", loadMoreIfNearBottom);
    window.requestAnimationFrame(loadMoreIfNearBottom);
  }

  function loadPreviewComments(preview) {
    const linkId = preview.dataset.linkId;
    if (!linkId) {
      return;
    }

    const state = commentCache.get(linkId);
    const hasCommentLoadState = Boolean(
      state
      && (Number(state.page) > 0 || state.loadingMore || state.failed)
    );
    if (hasCommentLoadState) {
      renderPreview(preview, state);
      return;
    }

    reloadPreviewComments(preview);
  }

  function observePreview(preview) {
    if (!previewObserver) {
      previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadPreviewComments(entry.target);
            previewObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: "300px"
      });
    }

    previewObserver.observe(preview);
  }

  function getLinkIdFromItem(item) {
    const href = item.getAttribute("href") || "";
    return href.match(/\/app\/bbs\/link\/(\d+)/)?.[1] || "";
  }

  function getCommentCountFromItem(item) {
    return item.querySelector(".content-list__comment-cnt")?.textContent?.trim() || "0";
  }

  function getFeedItemContentText(item) {
    return [
      item.querySelector(".bbs-content__title")?.textContent,
      item.querySelector(".bbs-content__content")?.textContent
    ].filter(Boolean).join("\n");
  }

  function getFeedItemTopicText(item) {
    return Array.from(item.querySelectorAll(".content-tag-text, .bbs-new-style-bottom__rich-stack .bbs-new-style-bottom__rich-node"))
      .map((tag) => tag.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getFeedItemAuthorText(item) {
    return item.querySelector(".header__user .list-content__username, .header__user .name, .list-content__username")?.textContent?.trim() || "";
  }

  function normalizeSummaryImageUrl(url) {
    try {
      const parsedUrl = new URL(url, window.location.href);
      return /^https?:$/.test(parsedUrl.protocol) ? parsedUrl.href : "";
    } catch {
      return "";
    }
  }

  function getFeedItemImageUrls(item) {
    const ignoredContainers = ".header__user, .list-content__avatar, .hb-cpt-avatar, .better-comment-preview__images";
    return Array.from(item.querySelectorAll("img"))
      .filter((image) => !image.closest(ignoredContainers))
      .map((image) => normalizeSummaryImageUrl(image.currentSrc || image.src || image.getAttribute("data-src") || ""))
      .filter(Boolean)
      .filter((url, index, urls) => urls.indexOf(url) === index);
  }

  function getLevelFromElement(container) {
    const levelElement = container?.querySelector?.(
      '.hb-level-tag[class*="hb-level-"], .level-tag__wrapper[class*="level-"], .list-content__level .hb-level-tag, .list-content__level .level-tag__wrapper, .hb-cpt__level-tag .level-tag__wrapper'
    );
    if (!levelElement) {
      return null;
    }

    const classLevel = Array.from(levelElement.classList || [])
      .map((className) => className.match(/(?:hb-)?level-(\d+)/)?.[1])
      .find(Boolean);
    return parseUserLevelValue(classLevel || levelElement.textContent);
  }

  function getFeedItemUserLevel(item) {
    return getLevelFromElement(item);
  }

  function createDefaultLevelTagElement() {
    const normalizedLevel = String(DEFAULT_USER_LEVEL);
    const tag = document.createElement("div");
    tag.className = `hb-level-tag hb-level-${normalizedLevel} list-content__level better-default-level-tag`;

    const inner = document.createElement("div");
    inner.className = "hb-level-tag__inner";

    const text = document.createElement("div");
    text.className = "hb-level-tag__inner__text";
    text.textContent = ` Lv.${normalizedLevel}`;
    inner.appendChild(text);
    tag.appendChild(inner);
    return tag;
  }

  function ensureDefaultUserLevelTag(userContainer) {
    if (!userContainer) {
      return;
    }

    const nativeLevelTag = userContainer.querySelector(".hb-cpt__level-tag:not(.better-default-level-tag), .hb-level-tag");
    if (nativeLevelTag) {
      userContainer.querySelectorAll(".better-default-level-tag").forEach((tag) => tag.remove());
      return;
    }

    if (userContainer.querySelector(".better-default-level-tag, .hb-cpt__level-tag, .hb-level-tag, .level-tag__wrapper")) {
      return;
    }

    const nameElement = userContainer.matches?.(".list-content__username, .name, .info-box__username, .children-item__comment-creator")
      ? userContainer
      : userContainer.querySelector(".list-content__username, .name, .info-box__username, .children-item__comment-creator");
    if (!nameElement) {
      return;
    }

    nameElement.insertAdjacentElement("afterend", createDefaultLevelTagElement());
  }

  function ensureFeedItemUserLevel(item) {
    ensureDefaultUserLevelTag(item?.querySelector?.(".header__user"));
  }

  function ensureLinkPageCommentUserLevels() {
    if (!isLinkPage()) {
      return;
    }

    document.querySelectorAll(".link-comment .better-default-level-tag").forEach((tag) => {
      tag.remove();
    });
  }

  function moveLinkPageEmptyStateIntoCommentPanel() {
    if (!isLinkPage()) {
      return;
    }

    const commentPanel = document.querySelector(".hb-bbs-link .link-comment");
    const emptyState = document.querySelector(".hb-bbs-link__container > .hb-cpt__empty");
    if (!commentPanel) {
      return;
    }

    if (emptyState) {
      commentPanel.appendChild(emptyState);
    }

    document.querySelectorAll(".hb-bbs-link .scroll-list__no-more-desc").forEach((noMoreDesc) => {
      noMoreDesc.remove();
    });
  }

  function getTopicTextFromContextTarget(target) {
    const tag = target?.closest?.(
      ".content-list__tag-item, .hb-cpt__content-tag, .content-tag-text, .hb-view-catalog__button, .bbs-new-style-bottom__rich-stack, .bbs-new-style-bottom__rich-node"
    );
    if (!tag) {
      return "";
    }

    const textNode = tag.querySelector?.(".content-tag-text, .bbs-new-style-bottom__rich-node") || tag;
    return normalizeBlockedKeyword(textNode.textContent);
  }

  function getFeedItemBlockedTargetKey(item, scope) {
    return `${normalizeBlockedKeywordScope(scope)}:${getLinkIdFromItem(item) || item.getAttribute("href") || getFeedItemContentText(item)}`;
  }

  function shouldHideFeedItem(item) {
    const feedText = [
      getFeedItemContentText(item),
      getFeedItemTopicText(item)
    ].filter(Boolean).join("\n");

    return isBlockedTextByKeyword(
      feedText,
      BLOCKED_KEYWORD_SCOPES.FEED,
      getFeedItemBlockedTargetKey(item, BLOCKED_KEYWORD_SCOPES.FEED)
    ) || shouldHideByLevel(getFeedItemUserLevel(item), BLOCKED_KEYWORD_SCOPES.FEED);
  }

  function getTopicEntryText(entry) {
    return normalizeBlockedKeyword(entry?.textContent);
  }

  function shouldHideTopicEntry(entry) {
    const topicText = getTopicEntryText(entry);
    if (!topicText) {
      return false;
    }

    return isBlockedTextByKeyword(
      topicText,
      BLOCKED_KEYWORD_SCOPES.FEED,
      `topic-entry:${topicText}`
    );
  }

  function applyFeedItemKeywordFilter(row, item) {
    if (!row || !item) {
      return;
    }

    const shouldHide = shouldHideFeedItem(item);
    row.hidden = shouldHide;
    row.style.display = shouldHide ? "none" : "";
  }

  function refreshTopicEntryFilters() {
    document.querySelectorAll(".hb-view-catalog__button").forEach((entry) => {
      const shouldHide = shouldHideTopicEntry(entry);
      entry.hidden = shouldHide;
      entry.style.display = shouldHide ? "none" : "";
    });
  }

  function ensureFeedItemPublishTime(item) {
    const bottomRight = item.querySelector(".content-list__bottom--right");
    if (!bottomRight) {
      return null;
    }

    let timeElement = bottomRight.querySelector(".better-link-publish-time");
    if (!timeElement) {
      timeElement = document.createElement("span");
      timeElement.className = "better-link-publish-time";
      bottomRight.insertBefore(timeElement, bottomRight.firstChild);
    }

    return timeElement;
  }

  function setFeedItemPublishTime(item, timestamp) {
    const timeElement = ensureFeedItemPublishTime(item);
    if (!timeElement) {
      return;
    }

    timeElement.textContent = timestamp ? formatCommentTime(timestamp) : "";
    timeElement.hidden = !timestamp;
  }

  function updateFeedItemPublishTime(linkId, timestamp) {
    if (!timestamp) {
      return;
    }

    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      const item = getRowFeedItem(row);
      if (item && getLinkIdFromItem(item) === linkId) {
        setFeedItemPublishTime(item, timestamp);
      }
    });
  }

  function ensureAiSummaryButton(item) {
    const header = item.querySelector(".bbs-list-content__header");
    const operationButton = header?.querySelector(".list-cotent__operation-btn, .list-content__operation-btn");
    if (!header || !operationButton) {
      return;
    }

    header.classList.toggle("better-ai-summary-header", isAiFeatureEnabled());
    let button = header.querySelector(".better-ai-summary-button");
    if (!isAiFeatureEnabled()) {
      button?.remove();
      return;
    }

    if (!button) {
      button = document.createElement("button");
      button.className = "better-ai-summary-button";
      button.type = "button";
      button.title = "AI 总结";
      button.setAttribute("aria-label", "AI 总结");
      button.textContent = "AI";
      operationButton.insertAdjacentElement("beforebegin", button);
    }
    const linkId = getLinkIdFromItem(item);
    setAiButtonComplete(button, Boolean(linkId && aiSummaryCache.has(linkId)));
  }

  function syncAiSummaryButtons() {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach(ensureAiSummaryButton);
    ensureLinkPageAiSummaryButton();
  }

  function positionAiSummaryDialog(dialog) {
    if (!dialog) {
      return;
    }
    const savedLeft = uiState.aiSummaryWindowLeft;
    const savedTop = uiState.aiSummaryWindowTop;
    if (!Number.isFinite(savedLeft) || !Number.isFinite(savedTop)) {
      dialog.style.left = "50%";
      dialog.style.top = "50%";
      dialog.style.right = "auto";
      dialog.style.transform = "translate(-50%, -50%)";
      return;
    }
    dialog.style.transform = "none";
    dialog.style.right = "auto";
    const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);
    dialog.style.left = `${Math.min(maxLeft, Math.max(0, savedLeft))}px`;
    dialog.style.top = `${Math.min(maxTop, Math.max(0, savedTop))}px`;
  }

  function persistAiSummaryDialogPosition(dialog) {
    if (!dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    uiState = normalizeUiState({
      ...uiState,
      aiSummaryWindowLeft: Math.round(rect.left),
      aiSummaryWindowTop: Math.round(rect.top)
    });
    persistUiState();
  }

  function ensureAiSummaryModal() {
    let modal = document.querySelector(`.${AI_SUMMARY_MODAL_CLASS}`);
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = AI_SUMMARY_MODAL_CLASS;
    modal.hidden = true;
    modal.innerHTML = `
      <div class="better-ai-summary__dialog" role="dialog" aria-modal="false" aria-labelledby="better-ai-summary-title">
        <div class="better-ai-summary__header">
          <div class="better-ai-summary__title" id="better-ai-summary-title">AI 总结</div>
          <div class="better-ai-summary__meta"></div>
          <div class="better-ai-summary__actions">
            <label class="better-ai-summary__auto-popup" title="总结完成后自动打开总结窗口">
              <input type="checkbox"${aiSettings.autoPopup ? " checked" : ""}>
              <span>自动弹出</span>
            </label>
            <button class="better-ai-summary__regenerate" type="button">重新总结</button>
            <button class="better-ai-summary__close" type="button" aria-label="关闭">×</button>
          </div>
        </div>
        <div class="better-ai-summary__body is-muted">
          <div class="better-ai-summary__summary-content">准备中...</div>
          <div class="better-ai-summary__chat-messages" aria-live="polite"></div>
        </div>
        <div class="better-ai-summary__chat">
          <form class="better-ai-summary__chat-form">
            <textarea class="better-ai-summary__chat-input" rows="1" placeholder="继续问 AI 一个问题"></textarea>
            <button class="better-ai-summary__chat-send" type="submit">发送</button>
          </form>
        </div>
      </div>
    `;
    modal.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target === modal || event.target.closest(".better-ai-summary__close")) {
        closeAiSummaryModal();
        return;
      }

      if (event.target.closest(".better-ai-summary__regenerate")) {
        const linkId = modal.dataset.linkId || "";
        closeAiSummaryModal();
        if (linkId) {
          aiSummaryCache.delete(linkId);
          const item = findFeedItemByLinkId(linkId);
          const button = item?.querySelector(".better-ai-summary-button");
          if (item) {
            summarizeFeedItem(item, linkId, button, { force: true });
          } else if (isLinkPage() && getCurrentLinkId() === linkId) {
            summarizeLinkPage(getLinkPageAiSummaryButton(), { force: true });
          }
        }
      }
    });
    modal.addEventListener("submit", (event) => {
      const form = event.target instanceof Element ? event.target.closest(".better-ai-summary__chat-form") : null;
      if (!form || !modal.contains(form)) {
        return;
      }

      event.preventDefault();
      submitAiSummaryChatQuestion(modal);
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      const input = event.target instanceof Element ? event.target.closest(".better-ai-summary__chat-input") : null;
      if (!input || !modal.contains(input)) {
        return;
      }

      event.preventDefault();
      submitAiSummaryChatQuestion(modal);
    });
    modal.addEventListener("change", (event) => {
      const input = event.target instanceof Element ? event.target.closest(".better-ai-summary__auto-popup input") : null;
      if (!input) {
        return;
      }
      aiSettings = normalizeAiSettings({
        ...aiSettings,
        autoPopup: input.checked
      });
      window.dispatchEvent(new CustomEvent(AI_SETTINGS_SAVE_EVENT, {
        detail: JSON.stringify(aiSettings)
      }));
    });
    const dialog = modal.querySelector(".better-ai-summary__dialog");
    const header = modal.querySelector(".better-ai-summary__header");
    header?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".better-ai-summary__actions")) {
        return;
      }
      const rect = dialog.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      dialog.style.left = `${rect.left}px`;
      dialog.style.top = `${rect.top}px`;
      dialog.style.right = "auto";
      dialog.style.transform = "none";
      header.setPointerCapture?.(event.pointerId);

      const moveDialog = (moveEvent) => {
        const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));
        dialog.style.left = `${left}px`;
        dialog.style.top = `${top}px`;
      };
      const stopDragging = () => {
        persistAiSummaryDialogPosition(dialog);
        header.removeEventListener("pointermove", moveDialog);
        header.removeEventListener("pointerup", stopDragging);
        header.removeEventListener("pointercancel", stopDragging);
      };
      header.addEventListener("pointermove", moveDialog);
      header.addEventListener("pointerup", stopDragging);
      header.addEventListener("pointercancel", stopDragging);
      event.preventDefault();
    });
    window.addEventListener("resize", () => {
      if (!modal.hidden) {
        positionAiSummaryDialog(dialog);
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function lockAiSummaryPageScroll() {
    if (aiSummaryScrollLocked) {
      return;
    }

    aiSummaryScrollLocked = true;
    aiSummaryPreviousBodyOverflow = document.body.style.overflow;
    aiSummaryPreviousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  }

  function unlockAiSummaryPageScroll() {
    if (!aiSummaryScrollLocked) {
      return;
    }

    aiSummaryScrollLocked = false;
    document.body.style.overflow = aiSummaryPreviousBodyOverflow;
    document.documentElement.style.overflow = aiSummaryPreviousDocumentOverflow;
    aiSummaryPreviousBodyOverflow = "";
    aiSummaryPreviousDocumentOverflow = "";
  }

  function closeAiSummaryModal() {
    const modal = document.querySelector(`.${AI_SUMMARY_MODAL_CLASS}`);
    if (modal) {
      modal.hidden = true;
    }
    unlockAiSummaryPageScroll();
  }

  function formatAiElapsedSeconds(elapsedMs) {
    const seconds = Number(elapsedMs) / 1000;
    return Number.isFinite(seconds) && seconds >= 0 ? seconds.toFixed(1) : "";
  }

  function normalizeAiSummaryCacheEntry(entry) {
    if (entry && typeof entry === "object") {
      return {
        content: cleanAiSummaryContent(entry.content, aiSettings.allowEmoji),
        elapsedMs: Number.isFinite(entry.elapsedMs) ? entry.elapsedMs : null,
        payload: String(entry.payload || ""),
        chatMessages: Array.isArray(entry.chatMessages)
          ? entry.chatMessages.map((message) => ({
            role: message?.role === "user" ? "user" : "assistant",
            content: message?.role === "user" ? String(message?.content || "") : cleanAiSummaryContent(message?.content, aiSettings.allowEmoji),
            muted: message?.muted === true,
            pending: message?.pending === true,
            elapsedMs: Number.isFinite(message?.elapsedMs) ? message.elapsedMs : null
          })).filter((message) => message.content)
          : []
      };
    }

    return {
      content: cleanAiSummaryContent(entry, aiSettings.allowEmoji),
      elapsedMs: null,
      payload: "",
      chatMessages: []
    };
  }

  function renderAiSummaryChatMessage(message) {
    const role = message?.role === "user" ? "user" : "assistant";
    const mutedClass = message?.muted ? " better-ai-summary__chat-message--muted" : "";
    const content = role === "assistant" ? renderMarkdown(message?.content || "") : escapeHtml(message?.content || "");
    const elapsedSeconds = role === "assistant" && !message?.pending ? formatAiElapsedSeconds(message?.elapsedMs) : "";
    const meta = elapsedSeconds ? `<div class="better-ai-summary__chat-message-meta">思考耗时 ${elapsedSeconds} 秒</div>` : "";
    return `<div class="better-ai-summary__chat-message better-ai-summary__chat-message--${role}${mutedClass}">${content}${meta}</div>`;
  }

  function renderAiSummaryChatMessages(messagesElement, messages) {
    if (!messagesElement) {
      return;
    }

    messagesElement.innerHTML = (messages || []).map(renderAiSummaryChatMessage).join("");
    const body = messagesElement.closest(".better-ai-summary__body");
    if (body && messages?.length) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function setAiSummaryChatControls(modal, enabled) {
    const input = modal.querySelector(".better-ai-summary__chat-input");
    const sendButton = modal.querySelector(".better-ai-summary__chat-send");
    if (input) {
      input.disabled = !enabled;
      input.placeholder = enabled ? "继续问 AI 一个问题" : "生成总结后可继续追问";
    }
    if (sendButton) {
      sendButton.disabled = !enabled;
    }
  }

  function syncAiSummaryChatPanel(modal, linkId) {
    const messagesElement = modal.querySelector(".better-ai-summary__chat-messages");
    const cacheEntry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    renderAiSummaryChatMessages(messagesElement, cacheEntry.chatMessages);
    setAiSummaryChatControls(modal, Boolean(linkId && cacheEntry.content && cacheEntry.payload && isAiConfigured() && !aiSummaryChatSending.has(linkId)));
  }

  function getAiSummaryChatContextMessage(entry) {
    return [
      "下面是同一篇社区帖子的上下文。请优先基于这些内容回答；如果用户的问题需要帖子外的信息，可以结合你的通用知识补充；如果当前 AI 服务支持联网搜索或检索工具，也允许进行网络搜索。请明确区分哪些是帖子内容、哪些是额外补充、推断或搜索信息；引用网络搜索结果时必须标注出处链接。",
      "",
      "帖子上下文：",
      entry.payload,
      "",
      "已有总结：",
      entry.content
    ].join("\n");
  }

  function buildAiSummaryChatMessages(entry, question) {
    return [
      {
        role: "system",
        content: buildAiSummarySystemPrompt("你现在要继续回答用户围绕同一篇帖子提出的问题。回答要简洁、直接，并延续已有上下文；需要时可以结合帖子外的通用知识进行补充；如果当前 AI 服务支持联网搜索或检索工具，也允许进行网络搜索。不要把补充或搜索得到的内容伪装成原帖信息；引用网络搜索结果时必须标注出处链接。")
      },
      {
        role: "user",
        content: getAiSummaryChatContextMessage(entry)
      },
      ...entry.chatMessages
        .filter((message) => !message.pending && !message.muted)
        .map((message) => ({
          role: message.role,
          content: message.content
        })),
      {
        role: "user",
        content: question
      }
    ];
  }

  function updateAiSummaryChatCache(linkId, updater) {
    const entry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    const nextEntry = updater(entry) || entry;
    aiSummaryCache.set(linkId, nextEntry);
    return nextEntry;
  }

  function submitAiSummaryChatQuestion(modal) {
    const linkId = modal.dataset.linkId || "";
    const input = modal.querySelector(".better-ai-summary__chat-input");
    const question = input?.value?.trim() || "";
    if (!linkId || !question || aiSummaryChatSending.has(linkId)) {
      return;
    }

    const entry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    if (!entry.content || !entry.payload || !isAiConfigured()) {
      syncAiSummaryChatPanel(modal, linkId);
      return;
    }

    if (input) {
      input.value = "";
    }

    const requestMessages = buildAiSummaryChatMessages(entry, question);
    aiSummaryChatSending.add(linkId);
    const chatStartTime = performance.now();
    const messagesElement = modal.querySelector(".better-ai-summary__chat-messages");
    const nextEntry = updateAiSummaryChatCache(linkId, (cacheEntry) => ({
      ...cacheEntry,
      chatMessages: [
        ...cacheEntry.chatMessages,
        { role: "user", content: question },
        { role: "assistant", content: "正在思考...", muted: true, pending: true }
      ]
    }));
    renderAiSummaryChatMessages(messagesElement, nextEntry.chatMessages);
    setAiSummaryChatControls(modal, false);

    requestAiChat(requestMessages).then((answer) => {
      const elapsedMs = performance.now() - chatStartTime;
      updateAiSummaryChatCache(linkId, (cacheEntry) => ({
        ...cacheEntry,
        chatMessages: [
          ...cacheEntry.chatMessages.filter((message) => !message.pending),
          { role: "assistant", content: cleanAiSummaryContent(answer, aiSettings.allowEmoji) || "模型没有返回内容", elapsedMs }
        ]
      }));
    }).catch((error) => {
      const elapsedMs = performance.now() - chatStartTime;
      updateAiSummaryChatCache(linkId, (cacheEntry) => ({
        ...cacheEntry,
        chatMessages: [
          ...cacheEntry.chatMessages.filter((message) => !message.pending),
          { role: "assistant", content: error?.message || "AI 请求失败", muted: true, elapsedMs }
        ]
      }));
    }).finally(() => {
      aiSummaryChatSending.delete(linkId);
      syncAiSummaryChatPanel(modal, linkId);
      input?.focus();
    });
  }

  function setAiSummaryModal(title, content, muted = false, linkId = "", elapsedMs = null) {
    const modal = ensureAiSummaryModal();
    const titleElement = modal.querySelector(".better-ai-summary__title");
    const metaElement = modal.querySelector(".better-ai-summary__meta");
    const body = modal.querySelector(".better-ai-summary__body");
    const contentElement = modal.querySelector(".better-ai-summary__summary-content");
    modal.dataset.linkId = linkId || "";
    if (titleElement) {
      titleElement.textContent = title || "AI 总结";
    }
    if (metaElement) {
      const elapsedSeconds = formatAiElapsedSeconds(elapsedMs);
      metaElement.textContent = elapsedSeconds ? `总结耗时 ${elapsedSeconds} 秒` : "";
    }
    if (contentElement) {
      contentElement.innerHTML = muted ? escapeHtml(content || "") : renderMarkdown(content || "");
    }
    if (body) {
      body.classList.toggle("is-muted", muted);
    }
    const autoPopupInput = modal.querySelector(".better-ai-summary__auto-popup input");
    if (autoPopupInput) {
      autoPopupInput.checked = aiSettings.autoPopup;
    }
    modal.hidden = false;
    positionAiSummaryDialog(modal.querySelector(".better-ai-summary__dialog"));
    syncAiSummaryChatPanel(modal, linkId);
  }

  function findFeedItemByLinkId(linkId) {
    return Array.from(document.querySelectorAll(FEED_ITEM_SELECTOR))
      .find((item) => getLinkIdFromItem(item) === String(linkId)) || null;
  }

  function renderInlineMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return renderEmojiTokensInHtml(html);
  }

  function renderMarkdownBlock(lines) {
    if (!lines.length) {
      return "";
    }

    const firstLine = lines[0] || "";
    const heading = firstLine.match(/^(#{1,3})\s*(.+)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      return `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
    }

    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
    }

    if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
    }

    if (lines.every((line) => /^\s*>\s?/.test(line))) {
      return `<blockquote>${lines.map((line) => `<p>${renderInlineMarkdown(line.replace(/^\s*>\s?/, ""))}</p>`).join("")}</blockquote>`;
    }

    return `<p>${lines.map(renderInlineMarkdown).join("<br>")}</p>`;
  }

  function unwrapMarkdownCodeFence(markdown) {
    const text = String(markdown || "").replace(/\r\n?/g, "\n").trim();
    const match = text.match(/^```(?:md|markdown)\s*\n([\s\S]*?)\n```$/i);
    return match ? match[1].trim() : text;
  }

  function renderMarkdown(markdown) {
    const lines = unwrapMarkdownCodeFence(markdown).split("\n");
    const blocks = [];
    let blockLines = [];
    let blockType = "";
    let codeLines = [];
    let inCodeBlock = false;

    const getLineType = (line) => {
      if (/^(#{1,3})\s*.+$/.test(line)) {
        return "heading";
      }

      if (/^\s*[-*]\s+/.test(line)) {
        return "unordered-list";
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        return "ordered-list";
      }

      if (/^\s*>\s?/.test(line)) {
        return "blockquote";
      }

      return "paragraph";
    };

    const flushBlock = () => {
      if (blockLines.length) {
        blocks.push(renderMarkdownBlock(blockLines));
        blockLines = [];
        blockType = "";
      }
    };

    lines.forEach((line) => {
      if (/^```/.test(line.trim())) {
        if (inCodeBlock) {
          blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushBlock();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (!line.trim()) {
        flushBlock();
        return;
      }

      const lineType = getLineType(line);
      if (lineType === "heading") {
        flushBlock();
        blocks.push(renderMarkdownBlock([line]));
        return;
      }

      if (blockType && blockType !== lineType) {
        flushBlock();
      }

      blockType = lineType;
      blockLines.push(line);
    });

    if (inCodeBlock) {
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }
    flushBlock();
    return blocks.join("");
  }

  function extractPlainCommentText(text) {
    const template = document.createElement("template");
    template.innerHTML = String(text || "");
    return normalizeCommentText(template.content.textContent || text);
  }

  function getCommentAuthor(comment) {
    return comment?.user?.username || comment?.user?.nickname || "匿名用户";
  }

  function getSummaryCommentEntries(groups) {
    let order = 0;
    return (groups || []).flatMap((group) => {
      const comments = [group.root, ...(group.replies || [])].filter(Boolean);
      return comments.map((comment) => {
        order += 1;
        return {
          line: `${getCommentAuthor(comment)}：${extractPlainCommentText(comment.text)}`.trim(),
          up: getCommentUpCount(comment),
          order
        };
      });
    }).filter((entry) => entry.line);
  }

  function selectSummaryCommentLines(entries) {
    const normalizedEntries = Array.isArray(entries) ? entries : [];
    const selectedEntries = normalizedEntries.length > SUMMARY_COMMENT_LIMIT
      ? normalizedEntries
        .slice()
        .sort((a, b) => (b.up - a.up) || (a.order - b.order))
        .slice(0, SUMMARY_COMMENT_LIMIT)
      : normalizedEntries;
    return selectedEntries
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.line);
  }

  function getSummaryCommentLines(groups) {
    return selectSummaryCommentLines(getSummaryCommentEntries(groups));
  }

  function getCachedSummaryCommentLines(linkId) {
    const state = commentCache.get(linkId);
    return getSummaryCommentLines(state?.commentGroups);
  }

  function getCachedLinkDetail(linkId) {
    return commentCache.get(linkId)?.linkDetail || null;
  }

  function ensureLinkDetail(linkId) {
    const cachedDetail = getCachedLinkDetail(linkId);
    if (cachedDetail?.content) {
      return Promise.resolve(cachedDetail);
    }

    return fetchCommentPageData(linkId, 1)
      .then((data) => {
        cacheCommentPageFromApiData(linkId, 1, data, { onlyIfEmpty: true });
        return getCachedLinkDetail(linkId);
      })
      .catch(() => getCachedLinkDetail(linkId));
  }

  function ensureSummaryContext(linkId) {
    return ensureLinkDetail(linkId).then((linkDetail) => {
      const cachedCommentLines = getCachedSummaryCommentLines(linkId);
      if (cachedCommentLines.length) {
        return { commentLines: cachedCommentLines, linkDetail };
      }

      return ensureSummaryComments(linkId).then((commentLines) => ({ commentLines, linkDetail: getCachedLinkDetail(linkId) || linkDetail }));
    });
  }

  function getFeedItemSummaryPayload(item, linkId, commentLines, linkDetail = null) {
    const title = linkDetail?.title || item.querySelector(".bbs-content__title")?.textContent?.trim() || "";
    const author = linkDetail?.author || getFeedItemAuthorText(item);
    const content = linkDetail?.content || item.querySelector(".bbs-content__content")?.textContent?.trim() || "";
    const topic = linkDetail?.topic || getFeedItemTopicText(item);
    const imageUrls = uniqueStrings([...(linkDetail?.imageUrls || []), ...getFeedItemImageUrls(item)]);
    return [
      `帖子 ID：${linkId}`,
      title ? `标题：${title}` : "",
      author ? `作者：${author}` : "",
      content ? `正文：${content}` : "",
      imageUrls.length ? `正文图片链接：\n${imageUrls.join("\n")}` : "",
      topic ? `话题：${topic}` : "",
      commentLines.length ? `评论区（${SUMMARY_COMMENT_LIMIT} 条以内，超过时优先点赞多的评论）：\n${commentLines.join("\n")}` : "评论区：暂无已加载评论"
    ].filter(Boolean).join("\n\n");
  }

  function getLinkPageTitle() {
    return document.querySelector(".hb-bbs-link .section-title__content")?.textContent?.trim() || "";
  }

  function getLinkPageAuthorText() {
    return document.querySelector(".hb-bbs-link .link-user__username")?.textContent?.trim() || "";
  }

  function getLinkPageContentText() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .post__content .com-text"))
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getLinkPageTopicText() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .link-section-tags .content-tag-text"))
      .map((tag) => tag.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getLinkPageImageUrls() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .post__content img.hb-cpt__image-elem"))
      .map((image) => image.src || image.getAttribute("src") || "")
      .filter(Boolean);
  }

  function getLinkPageSummaryPayload(linkId, commentLines, linkDetail = null) {
    const title = linkDetail?.title || getLinkPageTitle();
    const author = linkDetail?.author || getLinkPageAuthorText();
    const content = linkDetail?.content || getLinkPageContentText();
    const topic = linkDetail?.topic || getLinkPageTopicText();
    const imageUrls = uniqueStrings([...(linkDetail?.imageUrls || []), ...getLinkPageImageUrls()]);
    return [
      `帖子 ID：${linkId}`,
      title ? `标题：${title}` : "",
      author ? `作者：${author}` : "",
      content ? `正文：${content}` : "",
      imageUrls.length ? `正文图片链接：\n${imageUrls.join("\n")}` : "",
      topic ? `话题：${topic}` : "",
      commentLines.length ? `评论区（${SUMMARY_COMMENT_LIMIT} 条以内，超过时优先点赞多的评论）：\n${commentLines.join("\n")}` : "评论区：暂无已加载评论"
    ].filter(Boolean).join("\n\n");
  }

  function requestAiChat(messages, temperature = 0.2) {
    return new Promise((resolve, reject) => {
      const id = `better-ai-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const timeout = window.setTimeout(() => {
        aiPendingRequests.delete(id);
        setAiConnectionStatus("ai", "error");
        reject(new Error("AI 请求超时"));
      }, 60000);

      aiPendingRequests.set(id, { resolve, reject, timeout });
      window.dispatchEvent(new CustomEvent(AI_CHAT_REQUEST_EVENT, {
        detail: JSON.stringify({
          id,
          messages,
          temperature
        })
      }));
    });
  }

  function getAiSummaryEmojiCodes(limit = 120) {
    const codes = [...new Set(Array.from(emojiCache.values())
      .map((emoji) => normalizeEmojiToken(emoji?.code))
      .filter((code) => code && !/^\d+$/.test(code) && !/^https?:\/\//i.test(code))
      .map((code) => `[${code}]`)
      .filter((code) => /^\[[^\]\r\n]{1,40}\]$/.test(code)))];
    return codes.slice(0, limit);
  }

  function buildAiSummarySystemPrompt(extraInstruction = "") {
    const emojiCodes = getAiSummaryEmojiCodes();
    return [
      aiSettings.summaryPrompt,
      "",
      aiSettings.allowEmoji
        ? (emojiCodes.length
          ? `可以自然使用 Unicode emoji 表情，也可以使用 0-3 个列表内小黑盒表情短码：${emojiCodes.join(" ")}。不要编造列表外的方括号短码，不要输出纯数字方括号编号，例如 [34]、[64]。`
          : "可以自然使用 Unicode emoji 表情；没有可用小黑盒表情短码时，不要输出方括号表情短码。")
        : "不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。",
      extraInstruction
    ].filter((part) => String(part || "").trim()).join("\n\n");
  }

  function handleAiChatResponse(event) {
    let detail = {};
    try {
      detail = typeof event.detail === "string" ? JSON.parse(event.detail) : (event.detail || {});
    } catch {
      detail = {};
    }
    const pending = aiPendingRequests.get(detail.id);
    if (!pending) {
      return;
    }

    window.clearTimeout(pending.timeout);
    aiPendingRequests.delete(detail.id);
    if (detail.ok) {
      setAiConnectionStatus("ai", "ok");
      pending.resolve(detail.content || "");
    } else {
      setAiConnectionStatus("ai", "error");
      pending.reject(new Error(detail.error || "AI 请求失败"));
    }
  }

  function hasLoadedAllSummaryComments(state) {
    return Boolean(state) && state.hasMore === false;
  }

  function mergeSummaryCommentPageState(linkId, page, data) {
    const state = cacheCommentPageFromApiData(linkId, page, data) || commentCache.get(linkId) || { commentGroups: [] };
    renderLinkedPreviews(linkId);
    return state;
  }

  function fetchSummaryCommentPages(linkId, page = 1) {
    return fetchCommentPageData(linkId, page).then((data) => {
      if (data?.status !== "ok") {
        return commentCache.get(linkId);
      }

      const state = mergeSummaryCommentPageState(linkId, page, data);
      if (!state.hasMore) {
        return state;
      }

      return fetchSummaryCommentPages(linkId, page + 1);
    }).catch(() => commentCache.get(linkId));
  }

  function ensureSummaryComments(linkId) {
    const cachedState = commentCache.get(linkId);
    if (hasLoadedAllSummaryComments(cachedState)) {
      return Promise.resolve(getSummaryCommentLines(cachedState.commentGroups));
    }

    return fetchSummaryCommentPages(linkId, 1).then((state) => {
      return getSummaryCommentLines(state?.commentGroups);
    });
  }

  function setAiButtonLoading(button, isLoading) {
    if (!button) {
      return;
    }

    if (isLoading) {
      button.classList.remove("is-complete");
    }
    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
  }

  function setAiButtonComplete(button, isComplete) {
    if (!button) {
      return;
    }
    button.classList.toggle("is-complete", isComplete);
    button.textContent = isComplete ? "" : "AI";
    button.title = isComplete ? "查看 AI 总结" : "AI 总结";
    button.setAttribute("aria-label", button.title);
  }

  function summarizeFeedItem(item, linkId, button, options = {}) {
    if (button?.classList.contains("is-loading")) {
      return;
    }

    const title = item.querySelector(".bbs-content__title")?.textContent?.trim() || "AI 总结";
    if (!options.force && aiSummaryCache.has(linkId)) {
      const cachedSummary = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
      setAiButtonComplete(button, true);
      setAiSummaryModal(title, cachedSummary.content, false, linkId, cachedSummary.elapsedMs);
      return;
    }

    if (!isAiConfigured()) {
      openSettingsPanelTab(SETTINGS_TABS.AI);
      return;
    }

    setAiButtonLoading(button, true);
    const summaryStartTime = performance.now();
    Promise.all([ensureSummaryContext(linkId), aiSettings.allowEmoji ? loadEmojis() : Promise.resolve(emojiCache)]).then(([{ commentLines, linkDetail }]) => {
      const payload = getFeedItemSummaryPayload(item, linkId, commentLines, linkDetail);
      return requestAiChat([
        {
          role: "system",
          content: buildAiSummarySystemPrompt()
        },
        {
          role: "user",
          content: payload
        }
      ]).then((summary) => ({ summary, payload }));
    }).then(({ summary, payload }) => {
      const elapsedMs = performance.now() - summaryStartTime;
      const content = cleanAiSummaryContent(summary, aiSettings.allowEmoji) || "没有生成总结。";
      aiSummaryCache.set(linkId, { content, elapsedMs, payload, chatMessages: [] });
      setAiButtonComplete(button, true);
      if (aiSettings.autoPopup) {
        setAiSummaryModal(title, content, false, linkId, elapsedMs);
      }
    }).catch((error) => {
      setAiButtonComplete(button, false);
      setAiSummaryModal(title, error?.message || "AI 总结失败", true, linkId, performance.now() - summaryStartTime);
    }).finally(() => {
      setAiButtonLoading(button, false);
    });
  }

  function summarizeLinkPage(button, options = {}) {
    const linkId = getCurrentLinkId();
    if (!linkId || button?.classList.contains("is-loading")) {
      return;
    }

    const title = getLinkPageTitle() || "AI 总结";
    if (!options.force && aiSummaryCache.has(linkId)) {
      const cachedSummary = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
      setAiButtonComplete(button, true);
      setAiSummaryModal(title, cachedSummary.content, false, linkId, cachedSummary.elapsedMs);
      return;
    }

    if (!isAiConfigured()) {
      openSettingsPanelTab(SETTINGS_TABS.AI);
      return;
    }

    setAiButtonLoading(button, true);
    const summaryStartTime = performance.now();
    Promise.all([ensureSummaryContext(linkId), aiSettings.allowEmoji ? loadEmojis() : Promise.resolve(emojiCache)]).then(([{ commentLines, linkDetail }]) => {
      const payload = getLinkPageSummaryPayload(linkId, commentLines, linkDetail);
      return requestAiChat([
        {
          role: "system",
          content: buildAiSummarySystemPrompt()
        },
        {
          role: "user",
          content: payload
        }
      ]).then((summary) => ({ summary, payload }));
    }).then(({ summary, payload }) => {
      const elapsedMs = performance.now() - summaryStartTime;
      const content = cleanAiSummaryContent(summary, aiSettings.allowEmoji) || "没有生成总结。";
      aiSummaryCache.set(linkId, { content, elapsedMs, payload, chatMessages: [] });
      setAiButtonComplete(button, true);
      if (aiSettings.autoPopup) {
        setAiSummaryModal(title, content, false, linkId, elapsedMs);
      }
    }).catch((error) => {
      setAiButtonComplete(button, false);
      setAiSummaryModal(title, error?.message || "AI 总结失败", true, linkId, performance.now() - summaryStartTime);
    }).finally(() => {
      setAiButtonLoading(button, false);
    });
  }

  function bindFeedItemActions(item, linkId) {
    if (item.dataset.betterActionsBound === "1") {
      return;
    }

    item.dataset.betterActionsBound = "1";
    item.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const fallbackImageWrap = event.target.closest(".better-feed-fallback-image-wrap");
      if (fallbackImageWrap && item.contains(fallbackImageWrap)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openFeedFallbackImageViewer(fallbackImageWrap);
        return;
      }

      const aiButton = event.target.closest(".better-ai-summary-button");
      if (aiButton && item.contains(aiButton)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        summarizeFeedItem(item, linkId, aiButton);
        return;
      }

      const linkAwardButton = event.target.closest(".content-list__like");
      if (!linkAwardButton || !item.contains(linkAwardButton)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      awardLink(linkId, linkAwardButton);
    });
  }

  function bindFeedAwardCapture() {
    if (feedAwardCaptureBound) {
      return;
    }

    feedAwardCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const linkAwardButton = event.target.closest(".content-list__like");
      const item = linkAwardButton?.closest(FEED_ITEM_SELECTOR);
      if (!linkAwardButton || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const linkId = getLinkIdFromItem(item);
      if (!linkId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      awardLink(linkId, linkAwardButton);
    }, true);
  }

  function bindTopicBlockContextMenu() {
    if (topicBlockContextMenuBound) {
      return;
    }

    topicBlockContextMenuBound = true;
    document.addEventListener("contextmenu", (event) => {
      if (!(event.target instanceof Element) || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const topicText = getTopicTextFromContextTarget(event.target);
      if (!topicText) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      openTopicBlockMenu(topicText, event.clientX, event.clientY);
    }, true);
  }

  function closeTopicBlockMenu() {
    document.querySelector(`.${TOPIC_BLOCK_MENU_CLASS}`)?.remove();
  }

  function positionTopicBlockMenu(menu, x, y) {
    const margin = 8;
    const left = Math.min(window.innerWidth - menu.offsetWidth - margin, Math.max(margin, x));
    const top = Math.min(window.innerHeight - menu.offsetHeight - margin, Math.max(margin, y));
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function openTopicBlockMenu(topicText, x, y) {
    closeTopicBlockMenu();

    const menu = document.createElement("div");
    menu.className = TOPIC_BLOCK_MENU_CLASS;
    menu.innerHTML = `
      <button class="better-topic-block-menu__button" type="button">
        <svg class="better-topic-block-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M6.7 17.3 17.3 6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        <span class="better-topic-block-menu__label">屏蔽「${escapeHtml(topicText)}」</span>
      </button>
    `;
    menu.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!(event.target instanceof Element) || !event.target.closest(".better-topic-block-menu__button")) {
        return;
      }

      addFeedBlockedKeywordFromTopic(topicText);
      closeTopicBlockMenu();
    });
    document.body.appendChild(menu);
    positionTopicBlockMenu(menu, x, y);

    const closeOnOutsideClick = (event) => {
      if (event.target instanceof Element && event.target.closest(`.${TOPIC_BLOCK_MENU_CLASS}`)) {
        return;
      }
      closeTopicBlockMenu();
      document.removeEventListener("click", closeOnOutsideClick, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      closeTopicBlockMenu();
      document.removeEventListener("click", closeOnOutsideClick, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };

    window.setTimeout(() => {
      document.addEventListener("click", closeOnOutsideClick, true);
      document.addEventListener("keydown", closeOnEscape, true);
    }, 0);
  }

  function syncRowHeight(row) {
    if (!row) {
      return;
    }

    const item = getRowFeedItem(row);
    if (!item) {
      return;
    }

    const height = Math.ceil(item.getBoundingClientRect().height);
    if (height > 0) {
      row.style.setProperty("--better-row-height", `${height}px`);
    }
  }

  function scheduleRowHeightSync(row) {
    if (!row) {
      return;
    }

    window.requestAnimationFrame(() => {
      syncRowHeight(row);
    });
  }

  function observeRowHeight(row, item) {
    if (!row || !item) {
      return;
    }

    if (!rowResizeObserver && window.ResizeObserver) {
      rowResizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          syncRowHeight(entry.target.closest(`.${ROW_CLASS}`));
        });
      });
    }

    rowResizeObserver?.observe(item);
    item.querySelectorAll("img").forEach((image) => {
      if (image.complete) {
        return;
      }

      image.addEventListener("load", () => syncRowHeight(row), { once: true });
      image.addEventListener("error", () => syncRowHeight(row), { once: true });
    });
    scheduleRowHeightSync(row);
  }

  function getRowFeedItem(row) {
    return row?.querySelector(":scope > .hb-cpt__bbs-list-content")
      || row?.querySelector(":scope > .hb-cpt__bbs-content")
      || null;
  }

  function bindFeedImageCapture() {
    if (feedImageCaptureBound) {
      return;
    }

    feedImageCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const fallbackImageWrap = event.target.closest(".better-feed-fallback-image-wrap");
      const item = fallbackImageWrap?.closest(FEED_ITEM_SELECTOR);
      if (!fallbackImageWrap || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openFeedFallbackImageViewer(fallbackImageWrap);
    }, true);
  }

  function hasNativeFeedImages(item) {
    return Array.from(item?.querySelectorAll("img") || []).some((image) => (
      !image.closest(".better-feed-fallback-images")
      && !image.closest(".bbs-list-content__header")
      && !image.closest(".bbs-content__bottom-line")
    ));
  }

  function normalizeNativeFeedImageLayout(item) {
    const wrapper = item?.querySelector(".bbs-content__imgs-wrapper");
    const images = Array.from(wrapper?.querySelectorAll(":scope > .bbs-content__image") || []);
    if (!wrapper || images.length < 2) {
      wrapper?.classList.remove("better-native-feed-images--row");
      wrapper?.classList.remove("better-native-feed-images--feature");
      wrapper?.style.removeProperty("--better-native-image-count");
      return;
    }

    const topPositions = images.map((image) => Number.parseFloat(image.style.top || "0"));
    const isSingleRow = topPositions.every((top) => Number.isFinite(top) && Math.abs(top - topPositions[0]) < 1);
    const leftPositions = images.map((image) => Number.parseFloat(image.style.left || "0"));
    const isFeatureLayout = images.length === 3
      && Math.abs(topPositions[0]) < 1
      && Math.abs(topPositions[1]) < 1
      && topPositions[2] > topPositions[1]
      && leftPositions[1] > leftPositions[0]
      && Math.abs(leftPositions[2] - leftPositions[1]) < 1;
    wrapper.classList.toggle("better-native-feed-images--row", isSingleRow);
    wrapper.classList.toggle("better-native-feed-images--feature", isFeatureLayout);
    if (isSingleRow) {
      wrapper.style.setProperty("--better-native-image-count", String(images.length));
    } else {
      wrapper.style.removeProperty("--better-native-image-count");
    }
  }

  function ensureFeedItemFallbackImages(item, detail) {
    const existing = item?.querySelector(".better-feed-fallback-images");
    const imageUrls = Array.isArray(detail?.feedImageUrls) ? detail.feedImageUrls.filter(isSafeCommentImageUrl) : [];
    if (!item || hasNativeFeedImages(item) || !imageUrls.length) {
      existing?.remove();
      return;
    }

    const thumbnailUrls = Array.isArray(detail?.feedThumbnailUrls) ? detail.feedThumbnailUrls : [];
    const visibleImages = imageUrls.slice(0, 3);
    const signature = JSON.stringify([imageUrls, thumbnailUrls]);
    if (existing?.dataset.signature === signature) {
      return;
    }

    const container = existing || document.createElement("div");
    container.className = "better-feed-fallback-images";
    container.dataset.signature = signature;
    container.dataset.visibleCount = String(visibleImages.length);
    container.innerHTML = visibleImages.map((url, index) => {
      const thumbnailUrl = isSafeCommentImageUrl(thumbnailUrls[index]) ? thumbnailUrls[index] : url;
      const remainingCount = index === visibleImages.length - 1 && imageUrls.length > visibleImages.length
        ? imageUrls.length - visibleImages.length + 1
        : 0;
      return `
        <span class="better-feed-fallback-image-wrap">
          <img class="better-feed-fallback-image" src="${escapeHtml(thumbnailUrl)}" alt="帖子图片 ${escapeHtml(index + 1)}" loading="lazy">
          ${remainingCount > 0 ? `<span class="better-feed-fallback-more">+${escapeHtml(remainingCount)}</span>` : ""}
        </span>
      `;
    }).join("");

    if (!existing) {
      const bottomLine = item.querySelector(".bbs-content__bottom-line");
      if (bottomLine) {
        bottomLine.insertAdjacentElement("beforebegin", container);
      } else {
        item.appendChild(container);
      }
    }

    container.querySelectorAll("img").forEach((image) => {
      image.addEventListener("load", () => scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`)), { once: true });
      image.addEventListener("error", () => scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`)), { once: true });
    });
    scheduleRowHeightSync(item.closest(`.${ROW_CLASS}`));
  }

  function updateFeedItemFallbackImages(linkId, detail) {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach((item) => {
      if (getLinkIdFromItem(item) === String(linkId)) {
        ensureFeedItemFallbackImages(item, detail);
      }
    });
  }

  function enhanceFeedItem(item) {
    if (item.closest(`.${ROW_CLASS}`)) {
      ensureFeedItemUserLevel(item);
      normalizeNativeFeedImageLayout(item);
      ensureFeedItemFallbackImages(item, commentCache.get(getLinkIdFromItem(item))?.linkDetail);
      return;
    }

    const linkId = getLinkIdFromItem(item);
    if (!linkId) {
      return;
    }

    bindFeedItemActions(item, linkId);
    ensureAiSummaryButton(item);
    ensureFeedItemUserLevel(item);
    setFeedItemPublishTime(item, commentCache.get(linkId)?.linkCreateAt);

    const searchResultRow = item.parentElement?.classList.contains("search-result__link")
      ? item.parentElement
      : null;
    const row = searchResultRow || document.createElement("div");
    row.classList.add(ROW_CLASS);

    const preview = document.createElement("aside");
    preview.className = PREVIEW_CLASS;
    preview.dataset.linkId = linkId;
    preview.dataset.commentCount = getCommentCountFromItem(item);

    if (!searchResultRow) {
      item.parentNode.insertBefore(row, item);
      row.appendChild(item);
    }
    row.appendChild(preview);
    applyFeedItemKeywordFilter(row, item);
    renderPreview(preview, null);
    normalizeNativeFeedImageLayout(item);
    observeRowHeight(row, item);
    observePreview(preview);
    ensureFeedItemFallbackImages(item, commentCache.get(linkId)?.linkDetail);
  }

  function enhanceFeed() {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach(enhanceFeedItem);
    refreshFeedItemFilters();
  }

  function refreshFeedItemFilters() {
    document.querySelectorAll(`.${ROW_CLASS}`).forEach((row) => {
      applyFeedItemKeywordFilter(row, getRowFeedItem(row));
    });
    refreshTopicEntryFilters();
  }

  function getTopMenuMountPoint() {
    return document.querySelector(".hb-view-header .view-header__right")
      || document.querySelector(".hb-view-header .hb-layout-main__container--main")
      || null;
  }

  function setTopMenuOpen(topMenu, isOpen) {
    topMenu.classList.toggle(TOP_MENU_OPEN_CLASS, isOpen);
    topMenu.querySelector(`.${TOP_MENU_TOGGLE_CLASS}`)?.setAttribute("aria-expanded", String(isOpen));
  }

  function closeTopMenus() {
    document.querySelectorAll(`.${TOP_MENU_CLASS}.${TOP_MENU_OPEN_CLASS}`).forEach((topMenu) => {
      setTopMenuOpen(topMenu, false);
    });
  }

  function bindTopMenuOutsideClick() {
    if (topMenuOutsideClickBound) {
      return;
    }

    topMenuOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest(`.${TOP_MENU_CLASS}`)) {
        return;
      }

      if (event.target instanceof Element && (
        event.target.closest(`.${SETTINGS_ENTRY_CLASS}`)
        || event.target.closest(`.${SETTINGS_PANEL_CLASS}`)
      )) {
        return;
      }

      closeTopMenus();
      closeSettingsPanel();
    });
  }

  function ensureTopMenuParts(topMenu) {
    let toggle = topMenu.querySelector(`.${TOP_MENU_TOGGLE_CLASS}`);
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = TOP_MENU_TOGGLE_CLASS;
      toggle.type = "button";
      toggle.title = "展开菜单";
      toggle.setAttribute("aria-label", "展开菜单");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="hb-icon heybox-common_list2_line_24x24"></i>';
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setTopMenuOpen(topMenu, !topMenu.classList.contains(TOP_MENU_OPEN_CLASS));
      });
      topMenu.appendChild(toggle);
    }

    let panel = topMenu.querySelector(`.${TOP_MENU_PANEL_CLASS}`);
    if (!panel) {
      panel = document.createElement("div");
      panel.className = TOP_MENU_PANEL_CLASS;
      panel.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      topMenu.appendChild(panel);
    }

    bindTopMenuOutsideClick();
    return panel;
  }

  function removeDuplicateTopMenus(activeTopMenu) {
    document.querySelectorAll(`.${TOP_MENU_CLASS}`).forEach((topMenu) => {
      if (topMenu !== activeTopMenu) {
        topMenu.remove();
      }
    });
  }

  function findLeftMenu() {
    const menus = Array.from(document.querySelectorAll(".hb-websit__left-section"));
    return menus.find((menu) => !menu.closest(`.${TOP_MENU_CLASS}`)) || menus[0] || null;
  }

  function moveLeftMenuToTop() {
    const leftMenu = findLeftMenu();
    const mountPoint = getTopMenuMountPoint();

    if (!leftMenu || !mountPoint) {
      return;
    }

    if (!leftMenuOriginalPosition) {
      leftMenuOriginalPosition = {
        parent: leftMenu.parentElement,
        nextSibling: leftMenu.nextSibling
      };
    }

    let topMenu = mountPoint.querySelector(`.${TOP_MENU_CLASS}`);
    if (!topMenu) {
      topMenu = document.createElement("div");
      topMenu.className = TOP_MENU_CLASS;
      mountPoint.insertBefore(topMenu, mountPoint.firstChild);
    }

    const panel = ensureTopMenuParts(topMenu);
    if (leftMenu.parentElement !== panel) {
      panel.appendChild(leftMenu);
    }

    removeDuplicateTopMenus(topMenu);
  }

  function restoreLeftMenu() {
    const leftMenu = document.querySelector(`.${TOP_MENU_CLASS} .hb-websit__left-section`);

    closeTopMenus();

    if (leftMenu && leftMenuOriginalPosition?.parent?.isConnected) {
      leftMenuOriginalPosition.parent.insertBefore(
        leftMenu,
        leftMenuOriginalPosition.nextSibling?.isConnected ? leftMenuOriginalPosition.nextSibling : null
      );
    }

    removeDuplicateTopMenus(null);
  }

  function removeFavoriteEntry() {
    document.querySelectorAll(`.${FAVORITE_ENTRY_CLASS}`).forEach((entry) => {
      entry.remove();
    });
  }

  function removeHeaderSearch() {
    document.querySelectorAll(`.${HEADER_SEARCH_CLASS}`).forEach((entry) => {
      entry.remove();
    });
  }

  function removeSettingsEntry() {
    document.querySelectorAll(`.${SETTINGS_ENTRY_CLASS}`).forEach((entry) => {
      entry.remove();
    });
    removeHeaderSearch();
    removeHeaderMessage();
    document.querySelector(`.${SETTINGS_PANEL_CLASS}`)?.remove();
  }

  function hasBlockedKeyword(keyword, scope) {
    const normalized = normalizeBlockedKeyword(keyword).toLowerCase();
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    return blockedKeywords.some((item) => {
      return item.keyword.toLowerCase() === normalized && normalizeBlockedKeywordScope(item.scope) === normalizedScope;
    });
  }

  function setActiveBlockedKeywordScope(scope) {
    activeBlockedKeywordScope = normalizeBlockedKeywordScope(scope);
    activeSettingsTab = activeBlockedKeywordScope;
    renderSettingsPanel();
  }

  function setActiveSettingsTab(tab) {
    activeSettingsTab = tab === SETTINGS_TABS.AI || tab === SETTINGS_TABS.AIBOT || tab === SETTINGS_TABS.AIBOT_LOGS ? tab : normalizeBlockedKeywordScope(tab);
    if (activeSettingsTab !== SETTINGS_TABS.AI && activeSettingsTab !== SETTINGS_TABS.AIBOT && activeSettingsTab !== SETTINGS_TABS.AIBOT_LOGS) {
      activeBlockedKeywordScope = activeSettingsTab;
    }
    renderSettingsPanel();
    if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
      loadEmojis().then(() => {
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          refreshAiBotLogsPanel();
        }
      });
      startAiBotLogAutoRefresh();
    } else {
      stopAiBotLogAutoRefresh();
    }
  }

  function addBlockedKeyword(keyword, scope = BLOCKED_KEYWORD_SCOPES.COMMENT) {
    const normalized = normalizeBlockedKeyword(keyword);
    if (!normalized) {
      return;
    }

    writeBlockedKeywordsState([...blockedKeywords, {
      keyword: normalized,
      count: 0,
      scope: normalizeBlockedKeywordScope(scope)
    }]);
    renderSettingsPanel();
    scheduleKeywordFiltersRefresh();
  }

  function addFeedBlockedKeywordFromTopic(topicText) {
    const normalized = normalizeBlockedKeyword(topicText);
    if (!normalized) {
      return;
    }

    if (hasBlockedKeyword(normalized, BLOCKED_KEYWORD_SCOPES.FEED)) {
      scheduleKeywordFiltersRefresh();
      return;
    }

    addBlockedKeyword(normalized, BLOCKED_KEYWORD_SCOPES.FEED);
  }

  function removeBlockedKeyword(keyword, scope = BLOCKED_KEYWORD_SCOPES.COMMENT) {
    const normalized = normalizeBlockedKeyword(keyword).toLowerCase();
    const normalizedScope = normalizeBlockedKeywordScope(scope);
    writeBlockedKeywordsState(blockedKeywords.filter((item) => {
      return item.keyword.toLowerCase() !== normalized || normalizeBlockedKeywordScope(item.scope) !== normalizedScope;
    }));
    renderSettingsPanel();
    scheduleKeywordFiltersRefresh();
  }

  function updateLevelFilter(scope, nextFilter, options = {}) {
    const shouldRender = options.render !== false;
    const shouldRefresh = options.refresh !== false;
    writeLevelFilterState(scope, nextFilter, {
      persist: options.persist
    });
    if (shouldRender) {
      renderSettingsPanel();
    }
    if (shouldRefresh) {
      scheduleKeywordFiltersRefresh();
    }
  }

  function positionSettingsPanel(panel, button) {
    const rect = button.getBoundingClientRect();
    const margin = 8;
    const availableBelow = window.innerHeight - rect.bottom - margin * 2;
    const availableAbove = rect.top - margin * 2;
    const shouldOpenAbove = availableBelow < 320 && availableAbove > availableBelow;
    const maxPanelHeight = Math.max(240, shouldOpenAbove ? availableAbove : availableBelow);
    panel.style.maxHeight = `${maxPanelHeight}px`;
    const left = Math.min(window.innerWidth - panel.offsetWidth - margin, Math.max(margin, rect.right - panel.offsetWidth));
    const top = shouldOpenAbove
      ? Math.max(margin, rect.top - panel.offsetHeight - margin)
      : Math.min(rect.bottom + margin, window.innerHeight - panel.offsetHeight - margin);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    const list = panel.querySelector(".better-settings__list");
    if (!list) {
      return;
    }

    list.style.maxHeight = "";
    const listRect = list.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const availableListHeight = panelRect.bottom - listRect.top - margin;
    list.style.maxHeight = `${Math.max(120, availableListHeight)}px`;
  }

  function repositionSettingsPanelIfOpen() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!panel || panel.hidden || !button) {
      return;
    }

    positionSettingsPanel(panel, button);
  }

  function getAiSettingsFormValues(panel) {
    return normalizeAiSettings({
      enabled: panel.querySelector(".better-settings__ai-enabled")?.checked,
      provider: panel.querySelector(".better-settings__ai-provider")?.value,
      baseUrl: panel.querySelector(".better-settings__ai-base-url")?.value,
      model: panel.querySelector(".better-settings__ai-model")?.value,
      apiKey: panel.querySelector(".better-settings__ai-api-key")?.value,
      allowEmoji: panel.querySelector(".better-settings__ai-allow-emoji")?.checked !== false,
      autoPopup: panel.querySelector(".better-settings__ai-auto-popup")?.checked !== false,
      summaryPrompt: panel.querySelector(".better-settings__ai-summary-prompt")?.value
    });
  }

  function getAiConnectionFingerprint(settings) {
    return [
      settings?.provider || "",
      settings?.baseUrl || "",
      settings?.model || "",
      settings?.apiKey || ""
    ].join("\n");
  }

  function getAiConnectionState(scope, settings) {
    const fingerprint = getAiConnectionFingerprint(settings);
    const status = aiConnectionStatus[scope] || { state: "idle", fingerprint: "" };
    return status.fingerprint === fingerprint ? status.state : "idle";
  }

  function renderAiConnectionDot(scope, settings) {
    const state = getAiConnectionState(scope, settings);
    const className = state === "ok"
      ? "better-settings__connection-dot is-ok"
      : (state === "error" ? "better-settings__connection-dot is-error" : "better-settings__connection-dot");
    const title = state === "ok"
      ? "接入状态：连通"
      : (state === "error" ? "接入状态：失败" : "接入状态：未测试");
    return `<span class="${className}" data-ai-connection-status="${escapeHtml(scope)}" title="${escapeHtml(title)}"></span>`;
  }

  function syncAiConnectionDot(scope, settings) {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const dot = panel?.querySelector(`[data-ai-connection-status="${scope}"]`);
    const button = panel?.querySelector(scope === "aiBot"
      ? ".better-settings__ai-bot-test"
      : ".better-settings__ai-test");
    const state = getAiConnectionState(scope, settings || (scope === "aiBot" ? aiBotSettings : aiSettings));
    const title = state === "ok"
      ? "接入状态：连通"
      : (state === "error" ? "接入状态：失败" : "接入状态：未测试");

    if (dot) {
      dot.classList.toggle("is-ok", state === "ok");
      dot.classList.toggle("is-error", state === "error");
      dot.title = title;
    }
    if (button) {
      button.classList.toggle("is-ok", state === "ok");
      button.classList.toggle("is-error", state === "error");
      button.title = title;
    }
  }

  function setAiConnectionStatus(scope, state, settings) {
    const nextSettings = settings || (scope === "aiBot" ? aiBotSettings : aiSettings);
    aiConnectionStatus[scope] = {
      state,
      fingerprint: getAiConnectionFingerprint(nextSettings)
    };
    syncAiConnectionDot(scope, nextSettings);
  }

  function saveAiSettingsFromPanel(panel) {
    const nextSettings = getAiSettingsFormValues(panel);
    const shouldClearSummaryCache = [
      "enabled",
      "provider",
      "baseUrl",
      "model",
      "apiKey",
      "allowEmoji",
      "summaryPrompt"
    ].some((key) => nextSettings[key] !== aiSettings[key]);
    aiSettings = nextSettings;
    syncAiConnectionDot("ai", nextSettings);
    if (shouldClearSummaryCache) {
      aiSummaryCache.clear();
    }
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_SAVE_EVENT, {
      detail: JSON.stringify(nextSettings)
    }));
    syncAiSummaryButtons();
    const status = panel.querySelector(".better-settings__message");
    if (status) {
      status.textContent = "已保存";
      status.style.color = "#8a9299";
    }
    const statusPill = panel.querySelector(".better-settings__ai-status");
    if (statusPill) {
      statusPill.textContent = nextSettings.enabled ? "已开启" : "未开启";
      statusPill.classList.toggle("is-on", nextSettings.enabled);
    }
  }

  function syncAutoHeightTextarea(textarea) {
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 240 ? "auto" : "hidden";
  }

  function syncSettingsAutoHeightTextareas(panel) {
    panel?.querySelectorAll(".better-settings__textarea").forEach(syncAutoHeightTextarea);
  }

  function renderAiProviderOptions() {
    const options = [
      [AI_PROVIDERS.OPENAI_COMPATIBLE, "OpenAI Compatible · Chat Completions"],
      [AI_PROVIDERS.OPENAI_RESPONSES, "OpenAI · Responses"],
      [AI_PROVIDERS.ANTHROPIC, "Anthropic · Messages"],
      [AI_PROVIDERS.GEMINI, "Gemini · Generate Content"]
    ];
    return options.map(([value, label]) => `
      <option value="${escapeHtml(value)}"${aiSettings.provider === value ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
  }

  function renderAiSettingsPanelContent() {
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI 总结</div>
            <div class="better-settings__ai-subtitle">帖子和评论区摘要</div>
          </div>
          <span class="better-settings__ai-status${aiSettings.enabled ? " is-on" : ""}">${aiSettings.enabled ? "已开启" : "未开启"}</span>
          <label class="better-settings__level-toggle">
            <input class="better-settings__level-enabled better-settings__ai-enabled" type="checkbox"${aiSettings.enabled ? " checked" : ""}>
            <span class="better-settings__level-switch" aria-hidden="true"></span>
          </label>
        </div>
        <div class="better-settings__ai-body">
          <details class="better-settings__collapsible-section" data-connection-config="ai"${uiState.aiConnectionConfigOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__connection-title">接入配置 ${renderAiConnectionDot("ai", aiSettings)}</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__field">
              <span class="better-settings__field-title">服务商类型</span>
              <select class="better-settings__select better-settings__ai-provider">
                ${renderAiProviderOptions()}
              </select>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">Base URL</span>
              <input class="better-settings__text-input better-settings__ai-base-url" name="better-xiaoheihe-ai-base-url" type="url" value="${escapeHtml(aiSettings.baseUrl)}" autocomplete="section-better-xiaoheihe-ai username" placeholder="https://api.openai.com/v1">
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">
                模型
                <button class="better-settings__text-button better-settings__ai-fetch-models" type="button">拉取模型</button>
              </span>
              <div class="better-settings__ai-model-combobox">
                <input class="better-settings__text-input better-settings__ai-model" name="better-xiaoheihe-ai-model" type="text" value="${escapeHtml(aiSettings.model)}" autocomplete="off" placeholder="gpt-4.1-mini">
                <button class="better-settings__ai-model-dropdown" type="button" aria-label="选择已拉取模型" aria-expanded="false" disabled></button>
                <div class="better-settings__ai-model-menu" role="listbox" hidden></div>
              </div>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">API Key</span>
              <div class="better-settings__connection-input">
                <div class="better-settings__secret-input">
                  <input class="better-settings__text-input better-settings__ai-api-key" name="better-xiaoheihe-ai-api-key" type="password" value="${escapeHtml(aiSettings.apiKey)}" autocomplete="section-better-xiaoheihe-ai current-password" placeholder="sk-...">
                  <button class="better-settings__secret-toggle" type="button" data-secret-input=".better-settings__ai-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button>
                </div>
                <button class="better-settings__primary better-settings__connection-test better-settings__ai-test" type="button">测试连通</button>
              </div>
            </label>
            <div class="better-settings__config-actions">
              <span class="better-settings__message" role="status">${isAiConfigured() ? "已配置" : "请填写 Base URL 和模型"}</span>
            </div>
          </details>
          <label class="better-settings__field">
            <span class="better-settings__field-title">
              总结提示词
              <label class="better-settings__prompt-toggle">
                <input class="better-settings__ai-allow-emoji" type="checkbox"${aiSettings.allowEmoji ? " checked" : ""}>
                <span>允许表情</span>
              </label>
              <label class="better-settings__prompt-toggle">
                <input class="better-settings__ai-auto-popup" type="checkbox"${aiSettings.autoPopup ? " checked" : ""}>
                <span>自动弹出</span>
              </label>
              <button class="better-settings__text-button better-settings__ai-reset-prompt" type="button">恢复默认</button>
            </span>
            <textarea class="better-settings__textarea better-settings__ai-summary-prompt">${escapeHtml(aiSettings.summaryPrompt)}</textarea>
          </label>
        </div>
      </div>
    `;
  }

  function renderAiBotSettingsPanelContent() {
    if (!aiBotConsentAccepted) {
      return `
        <div class="better-settings__section better-settings__ai-section">
          <div class="better-settings__ai-header">
            <div>
              <div class="better-settings__ai-title">启用 AI Bot 前请确认</div>
              <div class="better-settings__ai-subtitle">该功能会代表当前登录账号自动发表评论</div>
            </div>
          </div>
          <div class="better-settings__ai-body">
            <div class="better-settings__desc">
              开启后，插件会读取相关帖子、评论、昵称或用户 ID，并把生成所需内容发送到你配置的第三方 AI 服务商。自动评论可能出现事实错误、不当表达、重复发送或触发平台风控，相关账号与内容责任由使用者承担。
            </div>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-consent-checkbox" type="checkbox">
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">我已阅读并理解上述风险，并明确授权插件按我的设置自动发表评论</span>
            </label>
            <div class="better-settings__actions">
              <button class="better-settings__primary better-settings__ai-bot-consent-confirm" type="button" disabled>确认并进入设置</button>
            </div>
          </div>
        </div>
      `;
    }
    const providerOptions = [
      [AI_PROVIDERS.OPENAI_COMPATIBLE, "OpenAI Compatible · Chat Completions"],
      [AI_PROVIDERS.OPENAI_RESPONSES, "OpenAI · Responses"],
      [AI_PROVIDERS.ANTHROPIC, "Anthropic · Messages"],
      [AI_PROVIDERS.GEMINI, "Gemini · Generate Content"]
    ].map(([value, label]) => `
      <option value="${escapeHtml(value)}"${aiBotSettings.provider === value ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI Bot</div>
            <div class="better-settings__ai-subtitle">自动回复 @、评论和首页推荐帖</div>
          </div>
        </div>
        <div class="better-settings__ai-body">
          <details class="better-settings__collapsible-section" data-connection-config="aiBot"${uiState.aiBotConnectionConfigOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__connection-title">接入配置 ${renderAiConnectionDot("aiBot", aiBotSettings)}</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__field">
              <span class="better-settings__field-title">服务商类型</span>
              <select class="better-settings__select better-settings__ai-bot-provider">
                ${providerOptions}
              </select>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">Base URL</span>
              <input class="better-settings__text-input better-settings__ai-bot-base-url" name="better-xiaoheihe-ai-bot-base-url" type="url" value="${escapeHtml(aiBotSettings.baseUrl)}" autocomplete="section-better-xiaoheihe-ai-bot username" placeholder="https://api.openai.com/v1">
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">
                模型
                <button class="better-settings__text-button better-settings__ai-bot-fetch-models" type="button">拉取模型</button>
              </span>
              <div class="better-settings__ai-model-combobox">
                <input class="better-settings__text-input better-settings__ai-bot-model" name="better-xiaoheihe-ai-bot-model" type="text" value="${escapeHtml(aiBotSettings.model)}" autocomplete="off" placeholder="gpt-4.1-mini">
                <button class="better-settings__ai-model-dropdown better-settings__ai-bot-model-dropdown" type="button" aria-label="选择已拉取模型" aria-expanded="false" disabled></button>
                <div class="better-settings__ai-model-menu better-settings__ai-bot-model-menu" role="listbox" hidden></div>
              </div>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">API Key</span>
              <div class="better-settings__connection-input">
                <div class="better-settings__secret-input">
                  <input class="better-settings__text-input better-settings__ai-bot-api-key" name="better-xiaoheihe-ai-bot-api-key" type="password" value="${escapeHtml(aiBotSettings.apiKey)}" autocomplete="section-better-xiaoheihe-ai-bot current-password" placeholder="sk-...">
                  <button class="better-settings__secret-toggle" type="button" data-secret-input=".better-settings__ai-bot-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button>
                </div>
                <button class="better-settings__primary better-settings__connection-test better-settings__ai-bot-test" type="button">测试连通</button>
              </div>
            </label>
            <div class="better-settings__config-actions">
              <span class="better-settings__message" role="status">${aiBotSettings.baseUrl && aiBotSettings.model ? "已配置" : "请填写 Base URL 和模型"}</span>
            </div>
          </details>
          <details class="better-settings__section better-settings__collapsible-section" data-ai-bot-section="auto-reply"${uiState.aiBotAutoReplyOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__section-title">自动回复设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <div class="better-settings__compact-number-grid">
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">轮询评论和@周期（分钟）</span>
                <input class="better-settings__text-input better-settings__ai-bot-poll-minutes" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.pollMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">只处理最近消息（分钟）</span>
                <input class="better-settings__text-input better-settings__ai-bot-fresh-minutes" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.messageFreshMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">每贴每人最多回复（次）</span>
                <input class="better-settings__text-input better-settings__ai-bot-reply-limit" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.replyLimitPerLinkUser)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">最多历史对话（组）</span>
                <input class="better-settings__text-input better-settings__ai-bot-history-limit" type="number" min="1" max="${AI_BOT_MAX_GLOBAL_HISTORY_LIMIT}" step="1" value="${escapeHtml(aiBotSettings.globalHistoryLimit)}">
              </label>
            </div>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-global-history" type="checkbox"${aiBotSettings.globalHistoryEnabled ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">启用跨帖子历史对话（保留 7 天）</span>
            </label>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-reply-mentions" type="checkbox"${aiBotSettings.replyMentions ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">回复 @ 我的消息</span>
            </label>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-reply-comments" type="checkbox"${aiBotSettings.replyComments ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">回复评论 / 回复我的消息</span>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">白名单用户 ID</span>
              <textarea class="better-settings__textarea better-settings__ai-bot-whitelist" placeholder="空白表示允许回复所有触发用户；多个 ID 可用逗号、空格或换行分隔">${escapeHtml(aiBotSettings.whitelistUserIds.join("\n"))}</textarea>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">拒绝回复关键词</span>
              <textarea class="better-settings__textarea better-settings__ai-bot-rejected-keywords" placeholder="评论或回复命中任一关键词时直接跳过；多个关键词可用逗号、分号或换行分隔">${escapeHtml(aiBotSettings.rejectedReplyKeywords.join("\n"))}</textarea>
            </label>
            <div class="better-settings__field">
              <div class="better-settings__field-title">
                <span>AI 评论提示词</span>
                <div class="better-settings__field-title-actions">
                  <label class="better-settings__prompt-toggle">
                    <input class="better-settings__ai-bot-allow-emoji" type="checkbox"${aiBotSettings.allowEmoji ? " checked" : ""}>
                    <span>允许表情</span>
                  </label>
                  <button class="better-settings__text-button better-settings__ai-bot-reset-prompt" type="button">恢复默认</button>
                </div>
              </div>
              <textarea class="better-settings__textarea better-settings__ai-bot-comment-prompt">${escapeHtml(aiBotSettings.commentPrompt)}</textarea>
            </div>
          </details>
          <details class="better-settings__section better-settings__collapsible-section better-settings__feed-poll-section" data-ai-bot-section="auto-feed"${uiState.aiBotAutoFeedOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__section-title">自动暖贴设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-comment-home-feed" type="checkbox"${aiBotSettings.commentHomeFeed ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">评论首页推荐帖</span>
            </label>
            <div class="better-settings__compact-number-grid">
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">评论周期（分钟，最低10）</span>
                <input class="better-settings__text-input better-settings__ai-bot-feed-poll-minutes" type="number" min="${AI_BOT_MIN_FEED_POLL_MINUTES}" step="1" value="${escapeHtml(aiBotSettings.feedPollMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number better-settings__field--feed-strategy">
                <span class="better-settings__field-title">帖子挑选策略</span>
                <select class="better-settings__select better-settings__ai-bot-feed-select-strategy">
                  <option value="first"${aiBotSettings.feedSelectStrategy === "first" ? " selected" : ""}>默认（第一条）</option>
                  <option value="latest"${aiBotSettings.feedSelectStrategy === "latest" ? " selected" : ""}>发布时间最新</option>
                  <option value="hot"${aiBotSettings.feedSelectStrategy === "hot" ? " selected" : ""}>热度最高</option>
                </select>
              </label>
            </div>
            <div class="better-settings__field">
              <div class="better-settings__field-title">
                <span>暖贴提示词</span>
                <button class="better-settings__text-button better-settings__ai-bot-reset-feed-prompt" type="button">恢复默认</button>
              </div>
              <textarea class="better-settings__textarea better-settings__ai-bot-feed-comment-prompt">${escapeHtml(aiBotSettings.feedCommentPrompt)}</textarea>
            </div>
          </details>
          <div class="better-settings__actions">
            <button class="better-settings__primary better-settings__ai-bot-view-logs" type="button">查看运行日志</button>
          </div>
        </div>
      </div>
    `;
  }

  const AI_BOT_LOG_DETAIL_LABELS = {
    enabled: "功能已启用",
    count: "消息数量",
    processedCount: "处理数量",
    queueCount: "队列数量",
    queuedCount: "排队中数量",
    queuedAt: "入队时间戳",
    queuedAtText: "入队时间",
    queuedSeconds: "已排队（秒）",
    queueAge: "队列等待时长",
    queueAgeSeconds: "队列等待（秒）",
    remainingCount: "剩余数量",
    droppedCount: "清理数量",
    droppedMessages: "已清理消息",
    trimmed: "因队列上限移除数量",
    reason: "触发原因",
    action: "处理动作",
    actionResult: "处理结果",
    actionLabel: "结果说明",
    skipReason: "跳过原因",
    matchedKeyword: "命中的拒绝回复关键词",
    moderationReason: "内容审查具体原因",
    moderationReasonDetail: "内容审查原因说明",
    modelResponsePreview: "模型返回内容预览",
    freshMinutes: "有效时间窗口（分钟）",
    ageMinutes: "消息已过去（分钟）",
    messageAgeMinutes: "消息已过去（分钟）",
    queueAgeMinutes: "队列等待（分钟）",
    pollMinutes: "轮询周期（分钟）",
    feedPollMinutes: "暖贴周期（分钟）",
    replyMentions: "回复 @",
    replyComments: "回复评论",
    commentHomeFeed: "首页暖贴",
    messageSource: "消息来源",
    typeLabel: "消息类型",
    messageId: "消息 ID",
    messageType: "消息类型代码",
    messageText: "消息内容",
    notificationText: "通知描述",
    repliedText: "被回复的内容",
    triggerText: "触发内容",
    replyText: "回复内容",
    messageTime: "发送时间",
    messageTimeText: "发送时间",
    messageTimestamp: "发送时间戳",
    senderName: "发送人",
    senderId: "发送人 ID",
    targetId: "回复目标",
    linkTitle: "帖子标题",
    linkId: "帖子 ID",
    linkTag: "帖子标签",
    linkUrl: "帖子链接",
    replyCommentId: "回复评论 ID",
    rootCommentId: "根评论 ID",
    effectiveReplyCommentId: "实际回复评论 ID",
    replyTargetSource: "回复目标来源",
    commentId: "发送评论 ID",
    skippedAt: "跳过时间戳",
    sentAt: "发送时间戳",
    sentTimeText: "发送时间",
    record: "处理记录",
    context: "上下文",
    detail: "附加详情",
    groups: "分组信息",
    messages: "消息明细",
    results: "处理结果明细",
    whitelistUserIds: "白名单用户 ID",
    replyLimit: "回复次数上限",
    limit: "次数上限",
    sentCount: "已发送数量",
    pendingCount: "待处理数量",
    totalCount: "合计数量",
    replyPreview: "回复内容预览",
    replyLength: "回复字数",
    strategy: "挑选策略",
    selectedIndex: "选中位置",
    candidateCount: "候选数量",
    error: "错误信息",
    errorName: "错误类型",
    errorMessage: "错误信息",
    errorStack: "错误堆栈",
    stage: "失败阶段",
    status: "状态",
    responseStatus: "响应状态码",
    responseText: "响应内容",
    apiUrl: "接口地址",
    endpoint: "接口地址",
    model: "AI 模型",
    linkAuthor: "帖子作者",
    feedCommentNum: "评论数量",
    feedUp: "点赞数量",
    waitSeconds: "还需等待（秒）",
    intervalMinutes: "间隔时间（分钟）",
    lastFeedTime: "上次暖贴时间",
    ok: "执行成功",
    skipped: "是否跳过"
  };

  const AI_BOT_LOG_VALUE_LABELS = {
    true: "是",
    false: "否",
    alarm: "定时轮询",
    manual: "手动触发",
    startup: "启动检查",
    mention: "@ 我的消息",
    comment: "评论/回复我的消息",
    feed: "首页推荐帖",
    stale: "超过时间窗口",
    source_disabled: "对应回复开关已关闭",
    bot_disabled: "AI Bot 已关闭",
    whitelist_miss: "发送人不在白名单",
    content_moderation: "内容审查未通过",
    empty_model_response: "AI 接口返回内容为空",
    model_refused: "模型返回 [REFUSE]",
    empty_model_content: "模型没有返回可用内容",
    reply_removed_by_cleanup: "回复清理后为空",
    unknown_empty_reply: "未识别的空回复",
    missing_target: "缺少回复目标",
    reply_target_limit: "同帖同人回复次数达到上限",
    reply_comment_duplicate: "同一条评论已处理",
    queue_expired: "队列等待超时",
    send_failed: "发送失败",
    skipped: "已跳过",
    stopped: "已停止",
    enqueued: "已加入队列",
    success: "成功",
    error: "失败",
    first: "默认第一条",
    latest: "发布时间最新",
    hot: "热度最高"
  };

  function getAiBotLogDetailLabel(key) {
    return AI_BOT_LOG_DETAIL_LABELS[key] || String(key || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, (value) => value.toUpperCase());
  }

  function formatAiBotLogScalar(key, value) {
    if (value === undefined || value === null || value === "") {
      return "无";
    }
    if (typeof value === "boolean") {
      return value ? "是" : "否";
    }
    const rawValue = String(value);
    if (Object.prototype.hasOwnProperty.call(AI_BOT_LOG_VALUE_LABELS, rawValue)) {
      return AI_BOT_LOG_VALUE_LABELS[rawValue];
    }
    if (key === "messageTimestamp" && Number.isFinite(Number(value))) {
      return new Date(Number(value)).toLocaleString("zh-CN", { hour12: false });
    }
    return rawValue;
  }

  function getAiBotLogValueClass(key, value) {
    if (value === undefined || value === null || value === "") {
      return " better-settings__ai-bot-log-detail-value--empty";
    }
    if (value === true || ["success", "enqueued"].includes(String(value))) {
      return " better-settings__ai-bot-log-detail-value--success";
    }
    if (value === false || key === "skipReason" || ["error", "skipped", "stopped"].includes(String(value))) {
      return " better-settings__ai-bot-log-detail-value--warn";
    }
    return "";
  }

  const AI_BOT_LOG_DETAIL_KEY_ORDER = [
    "senderName",
    "senderId",
    "messageText",
    "messageTime",
    "repliedText",
    "skipReason",
    "actionResult",
    "actionLabel"
  ];

  function getAiBotLogDetailEntries(detail) {
    const order = new Map(AI_BOT_LOG_DETAIL_KEY_ORDER.map((key, index) => [key, index]));
    return Object.entries(detail || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .sort(([leftKey], [rightKey]) => {
        const leftOrder = order.has(leftKey) ? order.get(leftKey) : AI_BOT_LOG_DETAIL_KEY_ORDER.length;
        const rightOrder = order.has(rightKey) ? order.get(rightKey) : AI_BOT_LOG_DETAIL_KEY_ORDER.length;
        return leftOrder - rightOrder;
      });
  }

  function renderAiBotLogDetailRowsHtml(detail) {
    return getAiBotLogDetailEntries(detail)
      .map(([key, value]) => {
        const label = getAiBotLogDetailLabel(key);
        if (Array.isArray(value)) {
          const itemsHtml = value.length
            ? value.map((item, index) => {
                if (item && typeof item === "object") {
                  return `
                    <div class="better-settings__ai-bot-log-detail-card">
                      <div class="better-settings__ai-bot-log-detail-card-title">第 ${index + 1} 条</div>
                      ${renderAiBotLogDetailRowsHtml(item)}
                    </div>
                  `;
                }
                return `<div class="better-settings__ai-bot-log-detail-card">${escapeHtml(formatAiBotLogScalar(key, item))}</div>`;
              }).join("")
            : `<div class="better-settings__ai-bot-log-detail-value better-settings__ai-bot-log-detail-value--empty">无</div>`;
          return `
            <div class="better-settings__ai-bot-log-detail-group">
              <div class="better-settings__ai-bot-log-detail-group-title">${escapeHtml(label)}（${value.length}）</div>
              ${itemsHtml}
            </div>
          `;
        }
        if (value && typeof value === "object") {
          return `
            <div class="better-settings__ai-bot-log-detail-group">
              <div class="better-settings__ai-bot-log-detail-group-title">${escapeHtml(label)}</div>
              <div class="better-settings__ai-bot-log-detail-card">${renderAiBotLogDetailRowsHtml(value)}</div>
            </div>
          `;
        }
        const codeClass = /(?:Id|Url|Stack|api|endpoint|model)/i.test(key)
          ? " better-settings__ai-bot-log-detail-code"
          : "";
        return `
          <div class="better-settings__ai-bot-log-detail-row">
            <div class="better-settings__ai-bot-log-detail-label">${escapeHtml(label)}</div>
            <div class="better-settings__ai-bot-log-detail-value${getAiBotLogValueClass(key, value)}${codeClass}">${escapeHtml(formatAiBotLogScalar(key, value))}</div>
          </div>
        `;
      }).join("");
  }

  function formatAiBotLogDetailText(detail, indent = "") {
    return getAiBotLogDetailEntries(detail)
      .map(([key, value]) => {
        const label = getAiBotLogDetailLabel(key);
        if (Array.isArray(value)) {
          if (!value.length) {
            return `${indent}${label}：无`;
          }
          return [
            `${indent}${label}（${value.length}）：`,
            ...value.map((item, index) => item && typeof item === "object"
              ? `${indent}  第 ${index + 1} 条：\n${formatAiBotLogDetailText(item, `${indent}    `)}`
              : `${indent}  ${index + 1}. ${formatAiBotLogScalar(key, item)}`)
          ].join("\n");
        }
        if (value && typeof value === "object") {
          return `${indent}${label}：\n${formatAiBotLogDetailText(value, `${indent}  `)}`;
        }
        return `${indent}${label}：${formatAiBotLogScalar(key, value)}`;
      }).join("\n");
  }

  function getAiBotLogId(log) {
    return String(log?.id || log?.timestamp || `${log?.level || ""}:${log?.message || ""}`);
  }

  function getAiBotLogById(logId) {
    return aiBotLogs.find((log) => getAiBotLogId(log) === String(logId || ""));
  }

  function getAiBotLogListSignature(logs) {
    const items = Array.isArray(logs) ? logs : [];
    return `${items.length}:${items.slice(0, 5).map((log) => getAiBotLogId(log)).join("|")}`;
  }

  function renderAiBotLogItemsHtml() {
    return aiBotLogs.length
      ? aiBotLogs.map((log) => `
            ${(() => {
              const logId = getAiBotLogId(log);
              const detailEntries = Object.entries(log.detail || {})
                .filter(([, value]) => value !== undefined && value !== null && value !== "");
              return `
            <div class="better-settings__ai-bot-log">
              <div class="better-settings__ai-bot-log-meta">
                <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--${escapeHtml(log.level || "info")}">${escapeHtml({
                  success: "成功",
                  warn: "提醒",
                  error: "错误",
                  info: "信息"
                }[log.level] || "信息")}</span>
                <span>${escapeHtml(log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false }))}</span>
              </div>
              <div class="better-settings__ai-bot-log-message">${escapeHtml(log.message || "")}</div>
              ${detailEntries.length ? (() => {
                const isExpanded = expandedAiBotLogIds.has(logId);
                const detailSummary = log.level === "error" ? "展开错误详情" : "展开日志详情";
                return `
                  <details class="better-settings__ai-bot-log-detail-wrap" data-log-id="${escapeHtml(logId)}"${isExpanded ? " open" : ""}>
                    <summary class="better-settings__ai-bot-log-detail-summary">${detailSummary}</summary>
                    <button class="better-settings__ai-bot-log-copy" type="button">复制</button>
                    <div class="better-settings__ai-bot-log-detail">${isExpanded ? renderAiBotLogDetailRowsHtml(log.detail || {}) : ""}</div>
                  </details>
                `;
              })() : ""}
            </div>
              `;
            })()}
          `).join("")
      : `<div class="better-settings__empty">暂无 AI Bot 运行日志</div>`;
  }

  function renderAiBotMessageLogItemsHtml() {
    const visibleLogs = activeAiBotMessageLogFilter === "all"
      ? aiBotMessageLogs
      : aiBotMessageLogs.filter((log) => String(log?.messageSource || "") === activeAiBotMessageLogFilter);
    return visibleLogs.length
      ? visibleLogs.map((log) => `
        <div class="better-settings__ai-bot-message-log${log.skipped ? " better-settings__ai-bot-message-log--skipped" : ""}">
          <div class="better-settings__ai-bot-log-meta">
            <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--${log.skipped ? "warn" : "success"}">${escapeHtml(log.skipped ? (log.skipReason === "content_moderation" ? "已跳过" : log.skipReason === "queue_expired" ? "队列超时" : log.skipReason === "send_failed" ? "发送失败" : log.skipReason === "source_disabled" ? "开关关闭" : log.skipReason === "stale" ? "已过期" : log.skipReason === "missing_target" ? "缺少目标" : log.skipReason === "reply_target_limit" ? "次数上限" : log.skipReason === "reply_comment_duplicate" ? "重复评论" : log.skipReason === "rejected_keyword" ? "关键词跳过" : "跳过") : (log.typeLabel || (log.messageSource === "feed" ? "首页推荐帖" : (log.messageSource === "comment" ? "评论" : "@"))))}</span>
            <span>${escapeHtml(log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false }))}</span>
          </div>
          <div class="better-settings__ai-bot-message-title">${log.linkUrl ? `<a href="${escapeHtml(log.linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(log.linkTitle || `帖子 ${log.linkId || ""}`)}</a>` : escapeHtml(log.linkTitle || `帖子 ${log.linkId || ""}`)}${log.messageSource === "feed" && log.messageTimestamp ? `<span class="better-settings__ai-bot-post-time">${escapeHtml(new Date(log.messageTimestamp).toLocaleString("zh-CN", { hour12: false }))}</span>` : ""}</div>
          <div class="better-settings__ai-bot-message-target">${escapeHtml([
            log.senderName ? `消息发送人：${log.senderName}${log.senderId ? `（${log.senderId}）` : ""}` : "",
            `消息时间：${log.messageTimeText || (log.messageTimestamp ? new Date(log.messageTimestamp).toLocaleString("zh-CN", { hour12: false }) : "未知")}`,
            `发送时间：${log.sentTimeText || log.timeText || new Date(log.sentTimestamp || log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false })}`,
            log.linkId ? `帖子ID：${log.linkId}` : "",
            log.replyCommentId ? `回复评论ID：${log.replyCommentId}` : "",
            log.commentId ? `发送评论ID：${log.commentId}` : ""
          ].filter(Boolean).join(" · "))}</div>
          <div class="better-settings__ai-bot-message-source">消息内容：${renderPlainCommentText(log.messageText || log.triggerText || "")}</div>
          <div class="better-settings__ai-bot-message-reply">回复内容：${renderPlainCommentText(log.replyText || "")}</div>
        </div>
      `).join("")
      : `<div class="better-settings__empty">${aiBotMessageLogs.length ? "当前类型暂无消息日志" : "暂无 AI 回复记录"}</div>`;
  }

  function getAiBotMessageLogSignature() {
    const visibleLogs = activeAiBotMessageLogFilter === "all"
      ? aiBotMessageLogs
      : aiBotMessageLogs.filter((log) => String(log?.messageSource || "") === activeAiBotMessageLogFilter);
    return `${activeAiBotMessageLogFilter}:${visibleLogs.length}:${visibleLogs.slice(0, 5).map((log) => String(log?.id || log?.timestamp || "")).join("|")}`;
  }

  function renderAiBotReplyQueueItemsHtml() {
    return aiBotReplyQueue.length
      ? aiBotReplyQueue.map((item) => {
        const queuedAt = Number(item.queuedAt || 0);
        const messageTimestamp = Number(item.messageTimestamp || 0);
        const queueAgeText = queuedAt ? `${Math.max(0, Math.floor((Date.now() - queuedAt) / 1000))} 秒` : "未知";
        const typeLabel = item.messageSource === "feed" ? "首页推荐帖" : (item.messageSource === "comment" ? "评论/回复我的消息" : "@我的消息");
        return `
        <div class="better-settings__ai-bot-message-log">
          <div class="better-settings__ai-bot-log-meta">
            <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--warn">待处理</span>
            <span>${escapeHtml(queuedAt ? new Date(queuedAt).toLocaleString("zh-CN", { hour12: false }) : "未知时间")}</span>
          </div>
          <div class="better-settings__ai-bot-message-title">${escapeHtml(item.context?.detail?.title || `帖子 ${item.linkId || ""}`)}</div>
          <div class="better-settings__ai-bot-message-target">${escapeHtml([
            `类型：${typeLabel}`,
            item.senderName ? `消息发送人：${item.senderName}${item.senderId ? `（${item.senderId}）` : ""}` : "",
            `等待：${queueAgeText}`,
            messageTimestamp ? `消息时间：${new Date(messageTimestamp).toLocaleString("zh-CN", { hour12: false })}` : "",
            item.linkId ? `帖子ID：${item.linkId}` : "",
            item.replyCommentId ? `回复评论ID：${item.replyCommentId}` : "",
            item.rootCommentId ? `根评论ID：${item.rootCommentId}` : ""
          ].filter(Boolean).join(" · "))}</div>
          <div class="better-settings__ai-bot-message-source">消息内容：${renderPlainCommentText(item.messageText || "")}</div>
        </div>
      `;
      }).join("")
      : `<div class="better-settings__empty">暂无待处理消息</div>`;
  }

  function renderAiBotTodayStatsHtml() {
    const stats = getAiBotTodayStats();
    return `
      <div class="better-settings__ai-bot-stats" data-ai-bot-today-stats>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天评论帖子</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.feedComments)}</span>
        </div>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天回复评论</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.commentReplies)}</span>
        </div>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天回复 @</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.mentionReplies)}</span>
        </div>
      </div>
    `;
  }

  function refreshAiBotTodayStatsPanel() {
    const statsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-today-stats]`);
    if (statsPanel) {
      statsPanel.outerHTML = renderAiBotTodayStatsHtml();
    }
  }

  function renderAiBotLogsPanelContent() {
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI Bot 运行日志</div>
            <div class="better-settings__ai-subtitle">动态读取本地运行记录</div>
          </div>
        </div>
        <div class="better-settings__ai-body">
          <div class="better-settings__field-title better-settings__ai-bot-log-title">
            <button class="better-settings__text-button better-settings__ai-bot-back-settings" type="button">返回设置</button>
            <button class="better-settings__text-button better-settings__ai-bot-clear-logs" type="button">清空日志</button>
          </div>
          ${renderAiBotTodayStatsHtml()}
          <div class="better-settings__log-switch" role="tablist" aria-label="AI Bot 日志类型">
            <button class="better-settings__log-switch-button${activeAiBotLogView === "runtime" ? " is-active" : ""}" type="button" data-ai-bot-log-view="runtime" role="tab" aria-selected="${activeAiBotLogView === "runtime" ? "true" : "false"}">运行日志</button>
            <button class="better-settings__log-switch-button${activeAiBotLogView === "message" ? " is-active" : ""}" type="button" data-ai-bot-log-view="message" role="tab" aria-selected="${activeAiBotLogView === "message" ? "true" : "false"}">消息日志</button>
            <button class="better-settings__log-switch-button${activeAiBotLogView === "pending" ? " is-active" : ""}" type="button" data-ai-bot-log-view="pending" role="tab" aria-selected="${activeAiBotLogView === "pending" ? "true" : "false"}">待处理消息</button>
          </div>
          <div class="better-settings__ai-bot-message-filter" data-ai-bot-message-filter${activeAiBotLogView === "message" ? "" : " hidden"}>
            ${[
              ["all", "全部"],
              ["mention", "@ 消息"],
              ["comment", "评论/回复"],
              ["feed", "首页推荐帖"]
            ].map(([value, label]) => `<button class="better-settings__ai-bot-message-filter-button${activeAiBotMessageLogFilter === value ? " is-active" : ""}" type="button" data-ai-bot-message-filter-value="${value}">${label}</button>`).join("")}
          </div>
          <div class="better-settings__ai-bot-logs" data-ai-bot-log-panel="runtime" data-signature="${escapeHtml(getAiBotLogListSignature(aiBotLogs))}"${activeAiBotLogView === "runtime" ? "" : " hidden"}>${renderAiBotLogItemsHtml()}</div>
          <div class="better-settings__ai-bot-message-logs" data-ai-bot-log-panel="message" data-signature="${escapeHtml(getAiBotMessageLogSignature())}"${activeAiBotLogView === "message" ? "" : " hidden"}>${renderAiBotMessageLogItemsHtml()}</div>
          <div class="better-settings__ai-bot-message-logs" data-ai-bot-log-panel="pending" data-signature="${escapeHtml(`${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`)}"${activeAiBotLogView === "pending" ? "" : " hidden"}>${renderAiBotReplyQueueItemsHtml()}</div>
          <div class="better-settings__actions">
            <button class="better-settings__primary better-settings__ai-bot-refresh-logs" type="button">刷新日志</button>
            <span class="better-settings__message" role="status">日志已加载</span>
          </div>
        </div>
      </div>
    `;
  }

  function setAiBotLogView(panel, view) {
    activeAiBotLogView = ["message", "pending"].includes(view) ? view : "runtime";
    panel.querySelectorAll("[data-ai-bot-log-view]").forEach((button) => {
      const active = button.dataset.aiBotLogView === activeAiBotLogView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    panel.querySelectorAll("[data-ai-bot-log-panel]").forEach((logPanel) => {
      logPanel.hidden = logPanel.dataset.aiBotLogPanel !== activeAiBotLogView;
    });
    const messageFilter = panel.querySelector("[data-ai-bot-message-filter]");
    if (messageFilter) {
      messageFilter.hidden = activeAiBotLogView !== "message";
    }
  }

  function setAiBotMessageLogFilter(panel, filter) {
    activeAiBotMessageLogFilter = ["mention", "comment", "feed"].includes(filter) ? filter : "all";
    uiState = normalizeUiState({
      ...uiState,
      aiBotMessageLogFilter: activeAiBotMessageLogFilter
    });
    persistUiState();
    panel.querySelectorAll("[data-ai-bot-message-filter-value]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.aiBotMessageFilterValue === activeAiBotMessageLogFilter);
    });
    const messageLogList = panel.querySelector('[data-ai-bot-log-panel="message"]');
    if (messageLogList) {
      messageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
      messageLogList.dataset.signature = getAiBotMessageLogSignature();
      messageLogList.scrollTop = 0;
    }
  }

  function renderBlockedSettingsPanelContent() {
    const activeScope = normalizeBlockedKeywordScope(activeBlockedKeywordScope);
    const visibleBlockedKeywords = blockedKeywords.filter((item) => normalizeBlockedKeywordScope(item.scope) === activeScope);
    const activeLevelFilter = levelFilters[activeScope] || createDefaultLevelFilter();
    const activeLevelLabel = getLevelFilterLabel(activeLevelFilter.maxLevel);
    const listHtml = visibleBlockedKeywords.length
      ? `<div class="better-settings__list">
          ${visibleBlockedKeywords.map((item) => `
            <div class="better-settings__keyword">
              <span class="better-settings__keyword-scope">${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[normalizeBlockedKeywordScope(item.scope)])}</span>
              <span class="better-settings__keyword-text" title="${escapeHtml(item.keyword)}">${escapeHtml(item.keyword)}</span>
              <span class="better-settings__keyword-actions">
                <span class="better-settings__keyword-count" title="屏蔽生效次数">${escapeHtml(item.count)} 次</span>
                <button class="better-settings__remove" type="button" data-keyword="${escapeHtml(item.keyword)}" data-scope="${escapeHtml(normalizeBlockedKeywordScope(item.scope))}" aria-label="删除关键词 ${escapeHtml(item.keyword)}">×</button>
              </span>
            </div>
          `).join("")}
        </div>`
      : `<div class="better-settings__empty">暂无${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}屏蔽关键词</div>`;

    return `
      <div class="better-settings__section">
        <div class="better-settings__level-row">
          <span class="better-settings__section-title">等级过滤</span>
          <label class="better-settings__level-toggle">
            <input class="better-settings__level-enabled" type="checkbox" data-scope="${escapeHtml(activeScope)}"${activeLevelFilter.enabled ? " checked" : ""}>
            <span class="better-settings__level-switch" aria-hidden="true"></span>
          </label>
        </div>
        <div class="better-settings__level-row">
          <span class="better-settings__level-value">展示 ${escapeHtml(activeLevelLabel)} 及以上${escapeHtml(BLOCKED_KEYWORD_SCOPE_LABELS[activeScope])}</span>
        </div>
        <input class="better-settings__level-range" type="range" min="${LEVEL_FILTER_MIN}" max="${LEVEL_FILTER_MAX}" step="1" value="${escapeHtml(activeLevelFilter.maxLevel)}" data-scope="${escapeHtml(activeScope)}">
      </div>
      <div class="better-settings__section">
        <div class="better-settings__section-title">屏蔽关键词</div>
        <div class="better-settings__desc">评论关键词隐藏评论；帖子关键词同时匹配标题、正文和分区/话题，命中后隐藏整条帖子。</div>
        <form class="better-settings__form">
          <input class="better-settings__input" type="text" placeholder="输入关键词">
          <button class="better-settings__add" type="submit">添加</button>
        </form>
        ${listHtml}
      </div>
    `;
  }

  function renderSettingsPanel() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    if (!panel) {
      return;
    }

    panel.innerHTML = `
      <div class="better-settings__tabs" role="tablist" aria-label="屏蔽范围">
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.FEED}" aria-selected="${activeSettingsTab === SETTINGS_TABS.FEED ? "true" : "false"}">帖子</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.COMMENT}" aria-selected="${activeSettingsTab === SETTINGS_TABS.COMMENT ? "true" : "false"}">评论</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AI}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AI ? "true" : "false"}">AI 总结</button>
        <button class="better-settings__tab" type="button" role="tab" data-settings-tab="${SETTINGS_TABS.AIBOT}" aria-selected="${activeSettingsTab === SETTINGS_TABS.AIBOT ? "true" : "false"}">AI Bot</button>
      </div>
      ${activeSettingsTab === SETTINGS_TABS.AI
        ? renderAiSettingsPanelContent()
        : (activeSettingsTab === SETTINGS_TABS.AIBOT
          ? renderAiBotSettingsPanelContent()
          : (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS ? renderAiBotLogsPanelContent() : renderBlockedSettingsPanelContent()))}
    `;
    syncSettingsAutoHeightTextareas(panel);
    if (activeSettingsTab === SETTINGS_TABS.AI) {
      syncAiConnectionDot("ai", aiSettings);
      loadCachedAiModelOptions(panel);
    }
    if (activeSettingsTab === SETTINGS_TABS.AIBOT) {
      syncAiConnectionDot("aiBot", aiBotSettings);
      loadCachedAiBotModelOptions(panel);
    }
    repositionSettingsPanelIfOpen();
  }

  function testAiSettingsFromPanel(panel, button) {
    saveAiSettingsFromPanel(panel);
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiSettingsFormValues(panel);
    if (!settings.baseUrl || !settings.model) {
      if (status) {
        status.textContent = "请先填写 Base URL 和模型";
        status.style.color = "#d33b4a";
      }
      setAiConnectionStatus("ai", "error", settings);
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "测试中...";
      status.style.color = "#8a9299";
    }

    window.setTimeout(() => {
      requestAiChat([{ role: "user", content: "请回复 OK" }], 0).then(() => {
        if (status) {
          status.textContent = "连接成功";
          status.style.color = "#0b806f";
        }
        setAiConnectionStatus("ai", "ok", aiSettings);
      }).catch((error) => {
        if (status) {
          status.textContent = error?.message || "连接失败";
          status.style.color = "#d33b4a";
        }
        setAiConnectionStatus("ai", "error", aiSettings);
      }).finally(() => {
        if (button) {
          button.disabled = false;
        }
      });
    }, 0);
  }

  function requestAiModelList(settings, options = {}) {
    const requestId = `models-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
        reject(new Error("模型列表拉取超时"));
      }, 30000);

      function handleResponse(event) {
        const detail = parseEventDetail(event.detail);
        if (detail.id !== requestId) {
          return;
        }

        window.clearTimeout(timeoutId);
        window.removeEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
        if (!detail.ok) {
          reject(new Error(detail.error || "模型列表拉取失败"));
          return;
        }
        resolve(Array.isArray(detail.models) ? detail.models : []);
      }

      window.addEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(AI_MODEL_LIST_REQUEST_EVENT, {
        detail: JSON.stringify({
          id: requestId,
          settings,
          cacheOnly: options.cacheOnly === true
        })
      }));
    });
  }

  function fillAiModelOptions(panel, models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (!modelMenu || !modelDropdown) {
      return;
    }

    modelDropdown.disabled = !normalizedModels.length;
    closeAiModelMenu(panel);
    modelMenu.innerHTML = normalizedModels.map((model) => `
      <button class="better-settings__ai-model-option" type="button" role="option" data-model="${escapeHtml(model)}" title="${escapeHtml(model)}">${escapeHtml(model)}</button>
    `).join("");
    syncAiModelSelect(panel);
  }

  function fillAiBotModelOptions(panel, models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (!modelMenu || !modelDropdown) {
      return;
    }

    modelDropdown.disabled = !normalizedModels.length;
    closeAiBotModelMenu(panel);
    modelMenu.innerHTML = normalizedModels.map((model) => `
      <button class="better-settings__ai-model-option better-settings__ai-bot-model-option" type="button" role="option" data-model="${escapeHtml(model)}" title="${escapeHtml(model)}">${escapeHtml(model)}</button>
    `).join("");
    syncAiBotModelSelect(panel);
  }

  function closeAiModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (modelMenu) {
      modelMenu.hidden = true;
      setAiModelMenuOpenState(modelMenu, false);
    }
    if (modelDropdown) {
      modelDropdown.setAttribute("aria-expanded", "false");
    }
  }

  function closeAiBotModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (modelMenu) {
      modelMenu.hidden = true;
      setAiModelMenuOpenState(modelMenu, false);
    }
    if (modelDropdown) {
      modelDropdown.setAttribute("aria-expanded", "false");
    }
  }

  function setAiModelMenuOpenState(modelMenu, isOpen) {
    const combobox = modelMenu?.closest(".better-settings__ai-model-combobox");
    combobox?.classList.toggle("is-open", isOpen);
    combobox?.closest(".better-settings__field")?.classList.toggle("is-model-menu-open", isOpen);
    combobox?.closest(".better-settings__collapsible-section")?.classList.toggle("is-model-menu-open", isOpen);
  }

  function filterAiModelMenu(modelMenu, keyword) {
    if (!modelMenu) {
      return 0;
    }

    const normalizedKeyword = String(keyword || "").trim().toLocaleLowerCase();
    let visibleCount = 0;
    modelMenu.querySelectorAll(".better-settings__ai-model-option").forEach((option) => {
      const matches = !normalizedKeyword || String(option.dataset.model || "").toLocaleLowerCase().includes(normalizedKeyword);
      option.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    });

    let emptyMessage = modelMenu.querySelector(".better-settings__ai-model-empty");
    if (!emptyMessage) {
      emptyMessage = document.createElement("div");
      emptyMessage.className = "better-settings__ai-model-empty";
      emptyMessage.textContent = "没有匹配的模型";
      modelMenu.appendChild(emptyMessage);
    }
    emptyMessage.hidden = visibleCount > 0;
    return visibleCount;
  }

  function openAiModelMenu(modelMenu, modelDropdown, keyword = "") {
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    filterAiModelMenu(modelMenu, keyword);
    modelMenu.hidden = false;
    modelDropdown.setAttribute("aria-expanded", "true");
    setAiModelMenuOpenState(modelMenu, true);
  }

  function toggleAiModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    const shouldOpen = modelMenu.hidden;
    if (shouldOpen) {
      openAiModelMenu(modelMenu, modelDropdown);
    } else {
      closeAiModelMenu(panel);
    }
  }

  function toggleAiBotModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    const shouldOpen = modelMenu.hidden;
    if (shouldOpen) {
      openAiModelMenu(modelMenu, modelDropdown);
      syncAiBotModelSelect(panel);
    } else {
      closeAiBotModelMenu(panel);
    }
  }

  function filterAiModelOptionsFromInput(panel, input, isAiBot = false) {
    const modelMenu = panel.querySelector(isAiBot ? ".better-settings__ai-bot-model-menu" : ".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(isAiBot ? ".better-settings__ai-bot-model-dropdown" : ".better-settings__ai-model-dropdown");
    openAiModelMenu(modelMenu, modelDropdown, input?.value);
  }

  function syncAiModelSelect(panel) {
    const value = panel.querySelector(".better-settings__ai-model")?.value?.trim() || "";
    panel.querySelectorAll(".better-settings__ai-model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function syncAiBotModelSelect(panel) {
    const value = panel.querySelector(".better-settings__ai-bot-model")?.value?.trim() || "";
    panel.querySelectorAll(".better-settings__ai-bot-model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function fetchAiModelsFromPanel(panel, button) {
    saveAiSettingsFromPanel(panel);
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiSettingsFormValues(panel);
    if (!settings.baseUrl) {
      if (status) {
        status.textContent = "请先填写 Base URL";
        status.style.color = "#d33b4a";
      }
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "正在拉取模型...";
      status.style.color = "#8a9299";
    }

    requestAiModelList(settings).then((models) => {
      fillAiModelOptions(panel, models);
      if (status) {
        status.textContent = models.length ? `已拉取 ${models.length} 个模型` : "未返回可用模型，可手动填写";
        status.style.color = "#0b806f";
      }
    }).catch((error) => {
      if (status) {
        status.textContent = error?.message || "模型列表拉取失败";
        status.style.color = "#d33b4a";
      }
    }).finally(() => {
      if (button) {
        button.disabled = false;
      }
    });
  }

  function loadCachedAiModelOptions(panel) {
    const settings = getAiSettingsFormValues(panel);
    requestAiModelList(settings, { cacheOnly: true }).then((models) => {
      fillAiModelOptions(panel, models);
    }).catch(() => {
      fillAiModelOptions(panel, []);
    });
  }

  function fetchAiBotModelsFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiBotSettingsFormValues(panel);
    if (!settings.baseUrl) {
      if (status) {
        status.textContent = "请先填写 Base URL";
        status.style.color = "#d33b4a";
      }
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "正在拉取模型...";
      status.style.color = "#8a9299";
    }

    requestAiModelList(settings).then((models) => {
      fillAiBotModelOptions(panel, models);
      if (status) {
        status.textContent = models.length ? `已拉取 ${models.length} 个模型` : "未返回可用模型，可手动填写";
        status.style.color = "#0b806f";
      }
    }).catch((error) => {
      if (status) {
        status.textContent = error?.message || "模型列表拉取失败";
        status.style.color = "#d33b4a";
      }
    }).finally(() => {
      if (button) {
        button.disabled = false;
      }
    });
  }

  function loadCachedAiBotModelOptions(panel) {
    const settings = getAiBotSettingsFormValues(panel);
    requestAiModelList(settings, { cacheOnly: true }).then((models) => {
      fillAiBotModelOptions(panel, models);
    }).catch(() => {
      fillAiBotModelOptions(panel, []);
    });
  }

  function syncAiProviderDefaultBaseUrl(panel) {
    const providerInput = panel.querySelector(".better-settings__ai-provider");
    const baseUrlInput = panel.querySelector(".better-settings__ai-base-url");
    if (!providerInput || !baseUrlInput) {
      return;
    }

    const nextProvider = Object.values(AI_PROVIDERS).includes(providerInput.value) ? providerInput.value : DEFAULT_AI_PROVIDER;
    const defaultBaseUrls = Object.values(AI_PROVIDER_DEFAULT_BASE_URLS);
    const currentBaseUrl = baseUrlInput.value.replace(/\/+$/, "");
    if (!currentBaseUrl || defaultBaseUrls.includes(currentBaseUrl)) {
      baseUrlInput.value = AI_PROVIDER_DEFAULT_BASE_URLS[nextProvider] || "";
    }
    fillAiModelOptions(panel, []);
    saveAiSettingsFromPanel(panel);
    loadCachedAiModelOptions(panel);
  }

  function getAiBotSettingsFormValues(panel) {
    const replyMentions = panel.querySelector(".better-settings__ai-bot-reply-mentions")?.checked === true;
    const replyComments = panel.querySelector(".better-settings__ai-bot-reply-comments")?.checked === true;
    const commentHomeFeed = panel.querySelector(".better-settings__ai-bot-comment-home-feed")?.checked === true;
    return normalizeAiBotSettings({
      enabled: replyMentions || replyComments || commentHomeFeed,
      provider: panel.querySelector(".better-settings__ai-bot-provider")?.value,
      baseUrl: panel.querySelector(".better-settings__ai-bot-base-url")?.value,
      model: panel.querySelector(".better-settings__ai-bot-model")?.value,
      apiKey: panel.querySelector(".better-settings__ai-bot-api-key")?.value,
      pollMinutes: panel.querySelector(".better-settings__ai-bot-poll-minutes")?.value,
      feedPollMinutes: panel.querySelector(".better-settings__ai-bot-feed-poll-minutes")?.value,
      feedSelectStrategy: panel.querySelector(".better-settings__ai-bot-feed-select-strategy")?.value,
      messageFreshMinutes: panel.querySelector(".better-settings__ai-bot-fresh-minutes")?.value,
      replyLimitPerLinkUser: panel.querySelector(".better-settings__ai-bot-reply-limit")?.value,
      globalHistoryEnabled: panel.querySelector(".better-settings__ai-bot-global-history")?.checked !== false,
      globalHistoryLimit: panel.querySelector(".better-settings__ai-bot-history-limit")?.value,
      replyMentions,
      replyComments,
      commentHomeFeed,
      whitelistText: panel.querySelector(".better-settings__ai-bot-whitelist")?.value,
      rejectedReplyKeywordsText: panel.querySelector(".better-settings__ai-bot-rejected-keywords")?.value,
      allowEmoji: panel.querySelector(".better-settings__ai-bot-allow-emoji")?.checked !== false,
      commentPrompt: panel.querySelector(".better-settings__ai-bot-comment-prompt")?.value,
      feedCommentPrompt: panel.querySelector(".better-settings__ai-bot-feed-comment-prompt")?.value
    });
  }

  function saveAiBotSettingsFromPanel(panel, options = {}) {
    aiBotSettings = getAiBotSettingsFormValues(panel);
    syncAiConnectionDot("aiBot", aiBotSettings);
    writeAiBotSettingsState(aiBotSettings);
    const status = panel.querySelector(".better-settings__message");
    if (status && !options.silentStatus) {
      status.textContent = aiBotSettings.baseUrl && aiBotSettings.model ? "已保存" : "请填写 Base URL 和模型";
      status.style.color = "#68727d";
    }
  }

  function syncAiBotProviderDefaultBaseUrl(panel) {
    const providerInput = panel.querySelector(".better-settings__ai-bot-provider");
    const baseUrlInput = panel.querySelector(".better-settings__ai-bot-base-url");
    if (!providerInput || !baseUrlInput) {
      return;
    }

    const nextProvider = Object.values(AI_PROVIDERS).includes(providerInput.value) ? providerInput.value : DEFAULT_AI_PROVIDER;
    const defaultBaseUrls = Object.values(AI_PROVIDER_DEFAULT_BASE_URLS);
    const currentBaseUrl = baseUrlInput.value.replace(/\/+$/, "");
    if (!currentBaseUrl || defaultBaseUrls.includes(currentBaseUrl)) {
      baseUrlInput.value = AI_PROVIDER_DEFAULT_BASE_URLS[nextProvider] || "";
    }
    fillAiBotModelOptions(panel, []);
    saveAiBotSettingsFromPanel(panel);
    loadCachedAiBotModelOptions(panel);
  }

  function sendAiBotRuntimeMessage(type, detail = {}) {
    return new Promise((resolve, reject) => {
      const id = `better-ai-bot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const timer = window.setTimeout(() => {
        window.removeEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
        reject(new Error("请求超时"));
      }, 60000);

      function handleResponse(event) {
        const response = parseEventDetail(event.detail);
        if (response.id !== id) {
          return;
        }

        window.clearTimeout(timer);
        window.removeEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
        resolve(response || {});
      }

      window.addEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(AI_BOT_RUNTIME_REQUEST_EVENT, {
        detail: stringifyEventDetail({
          id,
          type,
          detail
        })
      }));
    });
  }

  function setAiBotPanelStatus(panel, text, isError = false) {
    const status = panel.querySelector(".better-settings__message");
    if (status) {
      status.textContent = text;
      status.style.color = isError ? "#d33b4a" : "#68727d";
    }
  }

  function testAiBotSettingsFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    if (!aiBotSettings.baseUrl || !aiBotSettings.model) {
      setAiBotPanelStatus(panel, "请先填写 Base URL 和模型", true);
      setAiConnectionStatus("aiBot", "error", aiBotSettings);
      return;
    }

    button.disabled = true;
    setAiBotPanelStatus(panel, "测试中...");
    sendAiBotRuntimeMessage("better-xiaoheihe-ai-bot-test", { settings: aiBotSettings }).then((response) => {
      if (!response.ok) {
        setAiBotPanelStatus(panel, response.error || "连接失败", true);
        setAiConnectionStatus("aiBot", "error", aiBotSettings);
        return;
      }
      setAiBotPanelStatus(panel, "连接成功");
      setAiConnectionStatus("aiBot", "ok", aiBotSettings);
    }).catch((error) => {
      setAiBotPanelStatus(panel, error?.message || "连接失败", true);
      setAiConnectionStatus("aiBot", "error", aiBotSettings);
    }).finally(() => {
      button.disabled = false;
    });
  }

  function runAiBotFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    button.disabled = true;
    setAiBotPanelStatus(panel, "正在轮询...");
    sendAiBotRuntimeMessage("better-xiaoheihe-ai-bot-run-now").then((response) => {
      if (!response.ok) {
        setAiBotPanelStatus(panel, response.error || "轮询失败", true);
        return;
      }
      setAiBotPanelStatus(panel, `轮询完成：${response.count || 0} 条消息，首页推荐帖结果见日志`);
    }).catch((error) => {
      setAiBotPanelStatus(panel, error?.message || "轮询失败", true);
    }).finally(() => {
      button.disabled = false;
    });
  }

  function clearAiBotLogsFromPanel(panel, button) {
    button.disabled = true;
    saveLocalSettings({
      [AI_BOT_LOGS_STORAGE_KEY]: [],
      [AI_BOT_MESSAGE_LOGS_STORAGE_KEY]: []
    });
    aiBotLogs = [];
    aiBotMessageLogs = [];
    renderSettingsPanel();
    setAiBotPanelStatus(panel, "日志已清空");
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      textarea.remove();
    }
  }

  function toggleSecretInputFromPanel(panel, button) {
    const input = button?.dataset?.secretInput ? panel.querySelector(button.dataset.secretInput) : null;
    if (!input) {
      return;
    }
    input.type = input.type === "password" ? "text" : "password";
    const isVisible = input.type === "text";
    button.textContent = isVisible ? "隐藏" : "显示";
    button.setAttribute("aria-label", isVisible ? "隐藏 API Key" : "显示 API Key");
    button.setAttribute("aria-pressed", isVisible ? "true" : "false");
  }

  function copyAiBotLogFromPanel(button) {
    const detail = button?.closest(".better-settings__ai-bot-log-detail-wrap");
    const log = getAiBotLogById(detail?.dataset.logId || "");
    const text = log ? [
      `[${{
        success: "成功",
        warn: "提醒",
        error: "错误",
        info: "信息"
      }[log.level] || "信息"}] ${log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false })}`,
      log.message || "",
      formatAiBotLogDetailText(log.detail || {})
    ].filter(Boolean).join("\n") : "";
    if (!text) {
      return;
    }
    copyTextToClipboard(text).then(() => {
      const previousText = button.textContent;
      button.textContent = "已复制";
      window.setTimeout(() => {
        button.textContent = previousText || "复制";
      }, 1200);
    }).catch(() => {
      const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      if (panel) {
        setAiBotPanelStatus(panel, "复制失败，请手动选择文本复制", true);
      }
    });
  }

  function updateAiBotRuntimeLogList(options = {}) {
    const logList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
    if (!logList) {
      return;
    }
    const signature = getAiBotLogListSignature(aiBotLogs);
    if (!options.force && logList.dataset.signature === signature) {
      return;
    }
    const previousScrollTop = logList.scrollTop;
    const wasNearTop = previousScrollTop <= 4;
    logList.innerHTML = renderAiBotLogItemsHtml();
    logList.dataset.signature = signature;
    logList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, logList.scrollHeight);
  }

  function syncAiBotLogDetailState(detail) {
    const logId = detail?.dataset?.logId || "";
    if (!logId) {
      return;
    }
    if (detail.open) {
      expandedAiBotLogIds.add(logId);
      const detailContent = detail.querySelector(".better-settings__ai-bot-log-detail");
      if (detailContent && !detailContent.hasChildNodes()) {
        const log = getAiBotLogById(logId);
        if (log) {
          detailContent.innerHTML = renderAiBotLogDetailRowsHtml(log.detail || {});
        }
      }
    } else {
      expandedAiBotLogIds.delete(logId);
    }
  }

  function refreshAiBotLogsPanel() {
    if (aiBotLogRefreshRunning || activeSettingsTab !== SETTINGS_TABS.AIBOT_LOGS) {
      return;
    }
    aiBotLogRefreshRunning = true;
    const currentLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
    const currentMessageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
    const currentPendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
    const previousScrollTop = currentLogList?.scrollTop || 0;
    const previousMessageScrollTop = currentMessageLogList?.scrollTop || 0;
    const previousPendingScrollTop = currentPendingLogList?.scrollTop || 0;
    const wasNearTop = previousScrollTop <= 4;
    const messageWasNearTop = previousMessageScrollTop <= 4;
    const pendingWasNearTop = previousPendingScrollTop <= 4;
    currentLogList?.querySelectorAll(".better-settings__ai-bot-log-detail-wrap").forEach(syncAiBotLogDetailState);
    Promise.all([
      requestLocalSettingsState(1200),
      loadEmojis()
    ]).then(([response]) => {
      if (response?.ok) {
        aiBotLogs = normalizeAiBotLogs(response.values?.[AI_BOT_LOGS_STORAGE_KEY]);
        aiBotMessageLogs = normalizeAiBotMessageLogs(response.values?.[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
        aiBotReplyQueue = normalizeAiBotReplyQueue(response.values?.[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
      }
    }).finally(() => {
      if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
        const nextLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
        const nextMessageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
        const nextPendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
        refreshAiBotTodayStatsPanel();
        updateAiBotRuntimeLogList();
        if (nextMessageLogList) {
          const signature = getAiBotMessageLogSignature();
          if (nextMessageLogList.dataset.signature !== signature) {
            nextMessageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
            nextMessageLogList.dataset.signature = signature;
            nextMessageLogList.scrollTop = messageWasNearTop ? 0 : Math.min(previousMessageScrollTop, nextMessageLogList.scrollHeight);
          }
        }
        if (nextPendingLogList) {
          const signature = `${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`;
          if (nextPendingLogList.dataset.signature !== signature) {
            nextPendingLogList.innerHTML = renderAiBotReplyQueueItemsHtml();
            nextPendingLogList.dataset.signature = signature;
            nextPendingLogList.scrollTop = pendingWasNearTop ? 0 : Math.min(previousPendingScrollTop, nextPendingLogList.scrollHeight);
          }
        }
      }
      aiBotLogRefreshRunning = false;
    });
  }

  function startAiBotLogAutoRefresh() {
    refreshAiBotLogsPanel();
    if (aiBotLogRefreshTimer) {
      return;
    }
    aiBotLogRefreshTimer = window.setInterval(refreshAiBotLogsPanel, 10000);
  }

  function stopAiBotLogAutoRefresh() {
    if (!aiBotLogRefreshTimer) {
      return;
    }
    window.clearInterval(aiBotLogRefreshTimer);
    aiBotLogRefreshTimer = null;
  }

  function ensureSettingsPanel() {
    let panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    if (panel) {
      return panel;
    }

    panel = document.createElement("div");
    panel.className = SETTINGS_PANEL_CLASS;
    panel.hidden = true;
    panel.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!(event.target instanceof Element)) {
        return;
      }

      const secretToggleButton = event.target.closest(".better-settings__secret-toggle");
      if (secretToggleButton && panel.contains(secretToggleButton)) {
        toggleSecretInputFromPanel(panel, secretToggleButton);
        return;
      }

      const consentConfirmButton = event.target.closest(".better-settings__ai-bot-consent-confirm");
      if (consentConfirmButton && panel.contains(consentConfirmButton)) {
        const consentCheckbox = panel.querySelector(".better-settings__ai-bot-consent-checkbox");
        if (!consentCheckbox?.checked) {
          return;
        }
        aiBotConsentAccepted = true;
        saveLocalSettings({
          [AI_BOT_CONSENT_STORAGE_KEY]: true
        });
        renderSettingsPanel();
        return;
      }

      const removeButton = event.target.closest(".better-settings__remove");
      if (removeButton && panel.contains(removeButton)) {
        removeBlockedKeyword(removeButton.dataset.keyword, removeButton.dataset.scope);
        return;
      }

      const settingsTab = event.target.closest(".better-settings__tab");
      if (settingsTab && panel.contains(settingsTab)) {
        setActiveSettingsTab(settingsTab.dataset.settingsTab);
        panel.querySelector(".better-settings__input, .better-settings__ai-base-url, .better-settings__open-ai-bot-options")?.focus();
        return;
      }

      const resetAiBotPromptButton = event.target.closest(".better-settings__ai-bot-reset-prompt");
      if (resetAiBotPromptButton && panel.contains(resetAiBotPromptButton)) {
        const promptInput = panel.querySelector(".better-settings__ai-bot-comment-prompt");
        if (promptInput) {
          promptInput.value = AI_BOT_DEFAULT_PROMPT;
          syncAutoHeightTextarea(promptInput);
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      const resetAiBotFeedPromptButton = event.target.closest(".better-settings__ai-bot-reset-feed-prompt");
      if (resetAiBotFeedPromptButton && panel.contains(resetAiBotFeedPromptButton)) {
        const feedPromptInput = panel.querySelector(".better-settings__ai-bot-feed-comment-prompt");
        if (feedPromptInput) {
          feedPromptInput.value = AI_BOT_DEFAULT_FEED_PROMPT;
          syncAutoHeightTextarea(feedPromptInput);
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      const aiBotTestButton = event.target.closest(".better-settings__ai-bot-test");
      if (aiBotTestButton && panel.contains(aiBotTestButton)) {
        testAiBotSettingsFromPanel(panel, aiBotTestButton);
        return;
      }

      const aiBotRunNowButton = event.target.closest(".better-settings__ai-bot-run-now");
      if (aiBotRunNowButton && panel.contains(aiBotRunNowButton)) {
        runAiBotFromPanel(panel, aiBotRunNowButton);
        return;
      }

      const aiBotViewLogsButton = event.target.closest(".better-settings__ai-bot-view-logs");
      if (aiBotViewLogsButton && panel.contains(aiBotViewLogsButton)) {
        setActiveSettingsTab(SETTINGS_TABS.AIBOT_LOGS);
        return;
      }

      const aiBotBackSettingsButton = event.target.closest(".better-settings__ai-bot-back-settings");
      if (aiBotBackSettingsButton && panel.contains(aiBotBackSettingsButton)) {
        setActiveSettingsTab(SETTINGS_TABS.AIBOT);
        return;
      }

      const aiBotRefreshLogsButton = event.target.closest(".better-settings__ai-bot-refresh-logs");
      if (aiBotRefreshLogsButton && panel.contains(aiBotRefreshLogsButton)) {
        refreshAiBotLogsPanel();
        return;
      }

      const aiBotLogViewButton = event.target.closest("[data-ai-bot-log-view]");
      if (aiBotLogViewButton && panel.contains(aiBotLogViewButton)) {
        setAiBotLogView(panel, aiBotLogViewButton.dataset.aiBotLogView);
        return;
      }

      const aiBotMessageFilterButton = event.target.closest("[data-ai-bot-message-filter-value]");
      if (aiBotMessageFilterButton && panel.contains(aiBotMessageFilterButton)) {
        setAiBotMessageLogFilter(panel, aiBotMessageFilterButton.dataset.aiBotMessageFilterValue);
        return;
      }

      const aiBotLogDetailSummary = event.target.closest(".better-settings__ai-bot-log-detail-summary");
      if (aiBotLogDetailSummary && panel.contains(aiBotLogDetailSummary)) {
        const detail = aiBotLogDetailSummary.closest(".better-settings__ai-bot-log-detail-wrap");
        window.requestAnimationFrame(() => syncAiBotLogDetailState(detail));
        return;
      }

      const aiBotLogCopyButton = event.target.closest(".better-settings__ai-bot-log-copy");
      if (aiBotLogCopyButton && panel.contains(aiBotLogCopyButton)) {
        syncAiBotLogDetailState(aiBotLogCopyButton.closest(".better-settings__ai-bot-log-detail-wrap"));
        copyAiBotLogFromPanel(aiBotLogCopyButton);
        return;
      }

      const aiBotClearLogsButton = event.target.closest(".better-settings__ai-bot-clear-logs");
      if (aiBotClearLogsButton && panel.contains(aiBotClearLogsButton)) {
        clearAiBotLogsFromPanel(panel, aiBotClearLogsButton);
        return;
      }

      const resetPromptButton = event.target.closest(".better-settings__ai-reset-prompt");
      if (resetPromptButton && panel.contains(resetPromptButton)) {
        const promptInput = panel.querySelector(".better-settings__ai-summary-prompt");
        if (promptInput) {
          promptInput.value = DEFAULT_SUMMARY_PROMPT;
        }
        saveAiSettingsFromPanel(panel);
        return;
      }

      const testButton = event.target.closest(".better-settings__ai-test");
      if (testButton && panel.contains(testButton)) {
        testAiSettingsFromPanel(panel, testButton);
      }

      const fetchModelsButton = event.target.closest(".better-settings__ai-fetch-models");
      if (fetchModelsButton && panel.contains(fetchModelsButton)) {
        fetchAiModelsFromPanel(panel, fetchModelsButton);
        return;
      }

      const fetchAiBotModelsButton = event.target.closest(".better-settings__ai-bot-fetch-models");
      if (fetchAiBotModelsButton && panel.contains(fetchAiBotModelsButton)) {
        fetchAiBotModelsFromPanel(panel, fetchAiBotModelsButton);
        return;
      }

      const modelDropdown = event.target.closest(".better-settings__ai-model-dropdown");
      if (modelDropdown && panel.contains(modelDropdown) && !modelDropdown.classList.contains("better-settings__ai-bot-model-dropdown")) {
        toggleAiModelMenu(panel);
        return;
      }

      const aiBotModelDropdown = event.target.closest(".better-settings__ai-bot-model-dropdown");
      if (aiBotModelDropdown && panel.contains(aiBotModelDropdown)) {
        toggleAiBotModelMenu(panel);
        return;
      }

      const modelOption = event.target.closest(".better-settings__ai-model-option");
      if (modelOption && panel.contains(modelOption) && !modelOption.classList.contains("better-settings__ai-bot-model-option")) {
        const modelInput = panel.querySelector(".better-settings__ai-model");
        if (modelInput && modelOption.dataset.model) {
          modelInput.value = modelOption.dataset.model;
          syncAiModelSelect(panel);
          closeAiModelMenu(panel);
          saveAiSettingsFromPanel(panel);
          syncAiConnectionDot("ai", getAiSettingsFormValues(panel));
        }
        return;
      }

      const aiBotModelOption = event.target.closest(".better-settings__ai-bot-model-option");
      if (aiBotModelOption && panel.contains(aiBotModelOption)) {
        const modelInput = panel.querySelector(".better-settings__ai-bot-model");
        if (modelInput && aiBotModelOption.dataset.model) {
          modelInput.value = aiBotModelOption.dataset.model;
          syncAiBotModelSelect(panel);
          closeAiBotModelMenu(panel);
          saveAiBotSettingsFromPanel(panel);
          syncAiConnectionDot("aiBot", getAiBotSettingsFormValues(panel));
        }
        return;
      }

      closeAiModelMenu(panel);
      closeAiBotModelMenu(panel);
    });
    panel.addEventListener("toggle", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const connectionConfig = event.target.closest("[data-connection-config]");
      if (connectionConfig) {
        setConnectionConfigOpen(connectionConfig.dataset.connectionConfig, connectionConfig.open);
        return;
      }
      const aiBotSection = event.target.closest("[data-ai-bot-section]");
      if (aiBotSection) {
        const section = aiBotSection.dataset.aiBotSection;
        if (section === "auto-reply") {
          uiState = normalizeUiState({ ...uiState, aiBotAutoReplyOpen: aiBotSection.open });
        } else if (section === "auto-feed") {
          uiState = normalizeUiState({ ...uiState, aiBotAutoFeedOpen: aiBotSection.open });
        }
        persistUiState();
        return;
      }
      const detail = event.target.closest(".better-settings__ai-bot-log-detail-wrap");
      if (!detail) {
        return;
      }
      syncAiBotLogDetailState(detail);
    }, true);
    panel.addEventListener("input", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.matches(".better-settings__level-range")) {
        updateLevelFilter(event.target.dataset.scope, {
          maxLevel: event.target.value
        }, {
          render: false,
          refresh: false,
          persist: false
        });
        const scope = normalizeBlockedKeywordScope(event.target.dataset.scope);
        const valueLabel = panel.querySelector(".better-settings__level-value");
        if (valueLabel) {
          valueLabel.textContent = `展示 ${getLevelFilterLabel(Number.parseInt(event.target.value, 10) || LEVEL_FILTER_MIN)} 及以上${BLOCKED_KEYWORD_SCOPE_LABELS[scope]}`;
        }
      }

      if (event.target.matches(".better-settings__ai-base-url, .better-settings__ai-model, .better-settings__ai-api-key, .better-settings__ai-summary-prompt")) {
        if (event.target.matches(".better-settings__ai-summary-prompt")) {
          syncAutoHeightTextarea(event.target);
          repositionSettingsPanelIfOpen();
        }
        if (event.target.matches(".better-settings__ai-model")) {
          syncAiModelSelect(panel);
          filterAiModelOptionsFromInput(panel, event.target);
        }
        saveAiSettingsFromPanel(panel);
      }

      if (event.target.matches(".better-settings__ai-bot-base-url, .better-settings__ai-bot-model, .better-settings__ai-bot-api-key, .better-settings__ai-bot-poll-minutes, .better-settings__ai-bot-feed-poll-minutes, .better-settings__ai-bot-fresh-minutes, .better-settings__ai-bot-reply-limit, .better-settings__ai-bot-history-limit, .better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-comment-prompt, .better-settings__ai-bot-feed-comment-prompt")) {
        if (event.target.matches(".better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-comment-prompt, .better-settings__ai-bot-feed-comment-prompt")) {
          syncAutoHeightTextarea(event.target);
          repositionSettingsPanelIfOpen();
        }
        if (event.target.matches(".better-settings__ai-bot-model")) {
          syncAiBotModelSelect(panel);
          filterAiModelOptionsFromInput(panel, event.target, true);
        }
        saveAiBotSettingsFromPanel(panel, { silentStatus: true });
      }
    });
    panel.addEventListener("change", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.matches(".better-settings__ai-enabled, .better-settings__ai-allow-emoji, .better-settings__ai-auto-popup")) {
        saveAiSettingsFromPanel(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-provider")) {
        syncAiProviderDefaultBaseUrl(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-consent-checkbox")) {
        const confirmButton = panel.querySelector(".better-settings__ai-bot-consent-confirm");
        if (confirmButton) {
          confirmButton.disabled = !event.target.checked;
        }
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-provider")) {
        syncAiBotProviderDefaultBaseUrl(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-base-url")) {
        loadCachedAiBotModelOptions(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-poll-minutes, .better-settings__ai-bot-feed-poll-minutes, .better-settings__ai-bot-fresh-minutes, .better-settings__ai-bot-reply-limit, .better-settings__ai-bot-history-limit, .better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-reply-mentions, .better-settings__ai-bot-reply-comments, .better-settings__ai-bot-comment-home-feed, .better-settings__ai-bot-feed-select-strategy, .better-settings__ai-bot-allow-emoji, .better-settings__ai-bot-global-history")) {
        const normalized = getAiBotSettingsFormValues(panel);
        const pollInput = panel.querySelector(".better-settings__ai-bot-poll-minutes");
        const feedPollInput = panel.querySelector(".better-settings__ai-bot-feed-poll-minutes");
        const freshInput = panel.querySelector(".better-settings__ai-bot-fresh-minutes");
        const replyLimitInput = panel.querySelector(".better-settings__ai-bot-reply-limit");
        const historyLimitInput = panel.querySelector(".better-settings__ai-bot-history-limit");
        const whitelistInput = panel.querySelector(".better-settings__ai-bot-whitelist");
        const rejectedKeywordsInput = panel.querySelector(".better-settings__ai-bot-rejected-keywords");
        if (pollInput) {
          pollInput.value = normalized.pollMinutes;
        }
        if (feedPollInput) {
          feedPollInput.value = normalized.feedPollMinutes;
        }
        if (freshInput) {
          freshInput.value = normalized.messageFreshMinutes;
        }
        if (replyLimitInput) {
          replyLimitInput.value = normalized.replyLimitPerLinkUser;
        }
        if (historyLimitInput) {
          historyLimitInput.value = normalized.globalHistoryLimit;
        }
        if (whitelistInput) {
          whitelistInput.value = normalized.whitelistUserIds.join("\n");
          syncAutoHeightTextarea(whitelistInput);
        }
        if (rejectedKeywordsInput) {
          rejectedKeywordsInput.value = normalized.rejectedReplyKeywords.join("\n");
          syncAutoHeightTextarea(rejectedKeywordsInput);
        }
        if (event.target.matches(".better-settings__ai-bot-comment-home-feed")) {
          const feedSection = panel.querySelector(".better-settings__feed-poll-section");
          if (feedSection) {
            feedSection.open = event.target.checked;
          }
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-base-url")) {
        loadCachedAiModelOptions(panel);
        return;
      }

      if (event.target.matches(".better-settings__level-enabled")) {
        updateLevelFilter(event.target.dataset.scope, {
          enabled: event.target.checked
        });
        return;
      }

      if (event.target.matches(".better-settings__level-range")) {
        updateLevelFilter(event.target.dataset.scope, {
          maxLevel: event.target.value
        }, {
          render: false,
          refresh: false
        });
        scheduleKeywordFiltersRefresh();
      }
    });
    panel.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = panel.querySelector(".better-settings__input");
      if (!input) {
        return;
      }

      addBlockedKeyword(input.value, activeBlockedKeywordScope);
      input.value = "";
      input.focus();
    });
    document.body.appendChild(panel);
    renderSettingsPanel();
    return panel;
  }

  function closeSettingsPanel() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (panel) {
      panel.hidden = true;
    }
    stopAiBotLogAutoRefresh();
    button?.setAttribute("aria-expanded", "false");
  }

  function bindSettingsPanelOutsideClick() {
    if (settingsPanelOutsideClickBound) {
      return;
    }

    settingsPanelOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      if (!panel || panel.hidden || !(event.target instanceof Element)) {
        return;
      }

      if (
        event.target.closest(`.${SETTINGS_PANEL_CLASS}`)
        || event.target.closest(`.${SETTINGS_ENTRY_CLASS}`)
      ) {
        return;
      }

      closeSettingsPanel();
    }, true);
  }

  function bindSettingsPanelResizeSync() {
    if (window.__betterXiaoheiheSettingsResizeBound) {
      return;
    }

    window.__betterXiaoheiheSettingsResizeBound = true;
    window.addEventListener("resize", repositionSettingsPanelIfOpen);
  }

  function toggleSettingsPanel(button) {
    const panel = ensureSettingsPanel();
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    button.setAttribute("aria-expanded", String(isOpening));
    if (isOpening) {
      renderSettingsPanel();
      positionSettingsPanel(panel, button);
      panel.querySelector(".better-settings__input")?.focus();
      bindSettingsPanelOutsideClick();
      bindSettingsPanelResizeSync();
    } else {
      stopAiBotLogAutoRefresh();
    }
  }

  function openSettingsPanelTab(tab) {
    activeSettingsTab = tab === SETTINGS_TABS.AI || tab === SETTINGS_TABS.AIBOT || tab === SETTINGS_TABS.AIBOT_LOGS ? tab : normalizeBlockedKeywordScope(tab);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!button) {
      return;
    }

    const panel = ensureSettingsPanel();
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    renderSettingsPanel();
    positionSettingsPanel(panel, button);
    panel.querySelector(activeSettingsTab === SETTINGS_TABS.AI ? ".better-settings__ai-base-url" : (activeSettingsTab === SETTINGS_TABS.AIBOT ? ".better-settings__ai-bot-base-url" : (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS ? ".better-settings__ai-bot-refresh-logs" : ".better-settings__input")))?.focus();
    if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
      startAiBotLogAutoRefresh();
    } else {
      stopAiBotLogAutoRefresh();
    }
    bindSettingsPanelOutsideClick();
    bindSettingsPanelResizeSync();
  }

  function handleOpenPageSettings(event) {
    const detail = parseEventDetail(event?.detail);
    ensureSettingsEntry();
    openSettingsPanelTab(detail.tab || SETTINGS_TABS.AIBOT);
  }

  function ensureFavoriteEntry() {
    const messageButton = document.querySelector(".hb-view-header .message-center__btn");
    if (!messageButton) {
      removeFavoriteEntry();
      return;
    }

    let entry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("a");
      entry.className = FAVORITE_ENTRY_CLASS;
      entry.innerHTML = '<i class="hb-icon heybox-bbs_favorite_filled_24x24 better-xiaoheihe-favorite-entry__icon" aria-hidden="true">★</i><span>收藏</span>';
      entry.title = "查看收藏";
      entry.setAttribute("aria-label", "查看收藏");
    }

    entry.href = "/app/user/favour/content";
    if (entry.previousElementSibling !== messageButton) {
      messageButton.insertAdjacentElement("afterend", entry);
    }
  }

  function getCurrentSearchQuery() {
    if (!isSearchPage()) {
      return "";
    }

    try {
      return new URL(window.location.href).searchParams.get("q") || "";
    } catch (error) {
      return "";
    }
  }

  function removeMessagePopover() {
    document.querySelector(`.${MESSAGE_POPOVER_CLASS}`)?.remove();
    document.querySelector(`.${HEADER_MESSAGE_CLASS}`)?.setAttribute("aria-expanded", "false");
  }

  function removeHeaderMessage() {
    document.querySelectorAll(`.${HEADER_MESSAGE_CLASS}`).forEach((entry) => {
      entry.remove();
    });
    removeMessagePopover();
  }

  function ensureMessagePopover() {
    let popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
    if (popover) {
      return popover;
    }

    popover = document.createElement("div");
    popover.className = MESSAGE_POPOVER_CLASS;
    popover.hidden = true;
    popover.innerHTML = `
      <div class="better-message-popover__header">
        <div class="better-message-popover__title">
          <strong>消息</strong>
        </div>
        <div class="better-message-popover__tabs" role="tablist" aria-label="消息类型">
          <button class="better-message-popover__tab" type="button" role="tab" data-message-tab="reply" aria-selected="true">回复</button>
          <button class="better-message-popover__tab" type="button" role="tab" data-message-tab="award" aria-selected="false">点赞</button>
        </div>
      </div>
      <div class="better-message-popover__body">
        <div class="better-message-popover__state">点击刷新查看消息</div>
      </div>
    `;
    popover.querySelectorAll(".better-message-popover__tab").forEach((tab) => {
      tab.addEventListener("click", (event) => {
        event.preventDefault();
        setMessagePopoverTab(tab.dataset.messageTab || "reply");
      });
    });
    popover.querySelector(".better-message-popover__body")?.addEventListener("scroll", (event) => {
      const body = event.currentTarget;
      const state = getActiveMessageTabState();
      if (
        state.hasMore
        && !state.loading
        && body.scrollTop + body.clientHeight >= body.scrollHeight - 80
      ) {
        fetchAndRenderReplyMessages({ append: true });
      }
    });
    document.body.appendChild(popover);
    return popover;
  }

  function positionMessagePopover(button, popover) {
    if (!button || !popover || popover.hidden) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), Math.max(12, window.innerWidth - width - 12));
    const top = Math.min(rect.bottom + 10, Math.max(12, window.innerHeight - 80));
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }

  function setMessagePopoverState(contentHtml) {
    const popover = ensureMessagePopover();
    const body = popover.querySelector(".better-message-popover__body");
    if (body) {
      body.innerHTML = contentHtml;
    }
  }

  function getActiveMessageTabState() {
    return messagePopoverState.tabs[messagePopoverState.activeTab] || messagePopoverState.tabs.reply;
  }

  function updateMessagePopoverTabs() {
    const popover = ensureMessagePopover();
    popover.querySelectorAll(".better-message-popover__tab").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.messageTab === messagePopoverState.activeTab));
    });
  }

  function setMessagePopoverTab(tab) {
    messagePopoverState.activeTab = tab === "award" ? "award" : "reply";
    updateMessagePopoverTabs();
    const state = getActiveMessageTabState();
    if (state.messages.length) {
      renderReplyMessages(state);
      return;
    }
    fetchAndRenderReplyMessages();
  }

  function renderReplyMessages(state = getActiveMessageTabState()) {
    const messages = state.messages || [];

    if (!messages.length) {
      setMessagePopoverState(`<div class="better-message-popover__state">暂时没有新的${messagePopoverState.activeTab === "award" ? "点赞" : "回复"}消息</div>`);
      return;
    }

    setMessagePopoverState(messages.map((message) => {
      const actors = Array.isArray(message.actors) ? message.actors : [];
      const visibleActors = actors.slice(0, 3);
      const hiddenActorCount = Math.max(0, Number(message.awardCount || actors.length || 0) - visibleActors.length);
      const actorAvatarHtml = visibleActors.length ? `
        <div class="better-message-popover__likers" aria-hidden="true">
          ${visibleActors.map((actor) => actor.avatar
            ? `<img class="better-message-popover__liker-avatar" src="${escapeHtml(actor.avatar)}" alt="">`
            : `<span class="better-message-popover__liker-avatar">${escapeHtml(actor.avatarFallback)}</span>`).join("")}
          ${hiddenActorCount > 0 ? `<span class="better-message-popover__liker-more">+${escapeHtml(hiddenActorCount)}</span>` : ""}
        </div>
      ` : (message.avatar
        ? `<img class="better-message-popover__avatar" src="${escapeHtml(message.avatar)}" alt="">`
        : `<div class="better-message-popover__avatar" aria-hidden="true">${escapeHtml(message.avatarFallback)}</div>`);
      const itemClass = [
        "better-message-popover__item",
        message.awardKind === "post" ? "better-message-popover__item--award-post" : "",
        message.awardKind === "comment" ? "better-message-popover__item--award-comment" : ""
      ].filter(Boolean).join(" ");
      return `
      <a class="${itemClass}" href="/app/bbs/link/${escapeHtml(message.linkId)}">
        <div class="better-message-popover__actor">
          ${actorAvatarHtml}
          <div class="better-message-popover__actor-main">
            <div class="better-message-popover__actor-line">
              <span class="better-message-popover__user">${escapeHtml(message.userName)}</span>
              <span class="better-message-popover__action">${escapeHtml(message.actionText)}</span>
              <span class="better-message-popover__type">${escapeHtml(message.typeLabel)}</span>
            </div>
            <span class="better-message-popover__time">${escapeHtml(formatCommentTime(message.timestamp))}</span>
          </div>
        </div>
        ${message.awardKind === "comment" ? `
          <div class="better-message-popover__comment-target">
            <span class="better-message-popover__comment-target-label">被点赞的评论</span>
            <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
            ${message.targetImages?.length ? `
              <div class="better-message-popover__target-images">
                ${message.targetImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="评论图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
              </div>
            ` : ""}
          </div>
        ` : `
          <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.content))}</div>
          ${message.contentImages?.length ? `
            <div class="better-message-popover__target-images">
              ${message.contentImages.map((url, index) => `<img class="better-message-popover__target-image" src="${escapeHtml(url)}" alt="回复图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
            </div>
          ` : ""}
          ${message.replyTargetContent ? `
            <div class="better-message-popover__comment-target">
              <span class="better-message-popover__comment-target-label">被回复的内容</span>
              <div class="better-message-popover__content">${renderEmojiTokensInHtml(escapeHtml(message.replyTargetContent))}</div>
            </div>
          ` : ""}
        `}
        <div class="better-message-popover__post">
          <div class="better-message-popover__context">
            ${message.linkAuthor ? `
              <div class="better-message-popover__post-author">
                ${message.linkAuthorAvatar ? `<img class="better-message-popover__post-author-avatar" src="${escapeHtml(message.linkAuthorAvatar)}" alt="">` : `<span class="better-message-popover__post-author-avatar" aria-hidden="true">${escapeHtml(message.linkAuthorAvatarFallback)}</span>`}
                <span class="better-message-popover__post-author-name">${escapeHtml(message.linkAuthor)}</span>
                ${message.linkAuthorLevel ? `<span class="better-message-popover__post-author-level">${escapeHtml(message.linkAuthorLevel)}</span>` : ""}
              </div>
            ` : ""}
            <span class="better-message-popover__link-title">${renderEmojiTokensInHtml(escapeHtml(message.title))}</span>
            ${message.description ? `<span class="better-message-popover__link-desc">${renderEmojiTokensInHtml(escapeHtml(message.description))}</span>` : ""}
            ${(message.linkImages?.length || message.topicName) ? `
              <div class="better-message-popover__media-row">
                ${message.linkImages?.length ? `
                  <div class="better-message-popover__thumbs">
                    ${message.linkImages.map((url, index) => `<img class="better-message-popover__thumb" src="${escapeHtml(url)}" alt="帖子图片 ${escapeHtml(index + 1)}" loading="lazy">`).join("")}
                  </div>
                ` : ""}
                ${message.topicName ? `<span class="better-message-popover__topic">${escapeHtml(message.topicName)}</span>` : ""}
              </div>
            ` : ""}
          </div>
        </div>
      </a>
    `;
    }).join("") + (state.loading
      ? '<div class="better-message-popover__footer-state">正在加载更多...</div>'
      : (state.hasMore ? '<div class="better-message-popover__footer-state">继续下滑加载更多</div>' : '<div class="better-message-popover__footer-state">没有更多消息了</div>')));
  }

  function fetchReplyMessages(options = {}) {
    const limit = Number(options.limit || 20);
    const tab = options.tab === "award" ? "award" : "reply";
    return runAfterIdentityCookiesRestored(() => fetch(buildMessageApiUrl({
      limit,
      offset: options.offset || 0,
      listType: tab === "award" ? 1 : 0
    }), {
      credentials: "include",
      headers: {
        accept: "application/json"
      }
    })).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "消息查询失败");
      }
      const rawMessages = data?.result?.messages || data?.result?.list || data?.result?.Lists || data?.messages || [];
      return {
        messages: normalizeReplyMessages(rawMessages, { tab }),
        hasMore: Array.isArray(rawMessages) && rawMessages.length >= limit
      };
    });
  }

  function fetchAndRenderReplyMessages(options = {}) {
    const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    const popover = ensureMessagePopover();
    const activeTab = messagePopoverState.activeTab;
    const activeState = getActiveMessageTabState();
    if (activeState.loading) {
      return Promise.resolve();
    }
    const append = options.append === true;
    activeState.loading = true;
    button?.classList.add("is-loading");
    if (!append) {
      activeState.messages = [];
      activeState.offset = 0;
      activeState.hasMore = true;
      setMessagePopoverState(`<div class="better-message-popover__state">正在拉取${activeTab === "award" ? "点赞" : "回复"}消息...</div>`);
    } else {
      renderReplyMessages(activeState);
    }
    return loadEmojis().then(() => fetchReplyMessages({ tab: activeTab, offset: append ? activeState.offset : 0, limit: 20 }))
      .then((payload) => {
        const mergedMessages = append
          ? [...activeState.messages, ...payload.messages]
          : payload.messages;
        const seenMessageIds = new Set();
        activeState.messages = mergedMessages.filter((message) => {
          const key = message.id || `${message.linkId}-${message.timestamp}-${message.content}`;
          if (seenMessageIds.has(key)) {
            return false;
          }
          seenMessageIds.add(key);
          return true;
        });
        activeState.offset = activeState.messages.length;
        activeState.hasMore = payload.hasMore;
        activeState.loading = false;
        renderReplyMessages(activeState);
      })
      .catch((error) => {
        activeState.loading = false;
        if (append && activeState.messages.length) {
          renderReplyMessages(activeState);
          return;
        }
        setMessagePopoverState(`<div class="better-message-popover__state">${escapeHtml(error?.message || "消息加载失败")}</div>`);
      })
      .finally(() => {
        button?.classList.remove("is-loading");
        positionMessagePopover(button, popover);
      });
  }

  function closeMessagePopover() {
    const popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
    const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    if (popover) {
      popover.hidden = true;
    }
    button?.setAttribute("aria-expanded", "false");
  }

  function bindMessagePopoverOutsideClick() {
    if (messagePopoverOutsideClickBound) {
      return;
    }

    messagePopoverOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      if (event.__betterHeaderMessageHandled) {
        return;
      }
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest(`.${MESSAGE_POPOVER_CLASS}, .${HEADER_MESSAGE_CLASS}`)) {
        return;
      }
      closeMessagePopover();
    }, true);
    window.addEventListener("resize", () => {
      const popover = document.querySelector(`.${MESSAGE_POPOVER_CLASS}`);
      const button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
      if (popover && button && !popover.hidden) {
        positionMessagePopover(button, popover);
      }
    });
  }

  function toggleMessagePopover(button) {
    const popover = ensureMessagePopover();
    const shouldOpen = popover.hidden;
    if (!shouldOpen) {
      fetchAndRenderReplyMessages();
      return;
    }
    popover.hidden = !shouldOpen;
    button.setAttribute("aria-expanded", String(shouldOpen));
    positionMessagePopover(button, popover);
    bindMessagePopoverOutsideClick();
    fetchAndRenderReplyMessages();
  }

  function handleHeaderMessageClick(event, button) {
    if (event.__betterHeaderMessageHandled) {
      return;
    }
    event.__betterHeaderMessageHandled = true;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    toggleMessagePopover(button);
  }

  function bindHeaderMessageClickDelegation() {
    if (headerMessageClickBound) {
      return;
    }

    headerMessageClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${HEADER_MESSAGE_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleHeaderMessageClick(event, button);
    }, true);
    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest(`.${HEADER_MESSAGE_CLASS}`)
        : null;
      if (!button) {
        return;
      }
      handleHeaderMessageClick(event, button);
    }, true);
  }

  function ensureHeaderMessage(settingsEntry) {
    if (!settingsEntry) {
      removeHeaderMessage();
      return;
    }

    let button = document.querySelector(`.${HEADER_MESSAGE_CLASS}`);
    if (!button) {
      button = document.createElement("button");
      button.className = HEADER_MESSAGE_CLASS;
      button.type = "button";
      button.title = "回复我的";
      button.setAttribute("aria-label", "回复我的");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `
        <i aria-hidden="true">
          <svg class="better-header-message__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6.5h16v11H4z"></path>
            <path d="m4.8 7.2 7.2 5.6 7.2-5.6"></path>
          </svg>
        </i>
      `;
    }
    button.onpointerdown = (event) => handleHeaderMessageClick(event, button);
    button.onclick = (event) => handleHeaderMessageClick(event, button);
    bindHeaderMessageClickDelegation();

    if (settingsEntry.previousElementSibling !== button) {
      settingsEntry.insertAdjacentElement("beforebegin", button);
    }
  }

  function ensureHeaderSearch(settingsEntry) {
    if (!settingsEntry) {
      removeHeaderSearch();
      return;
    }

    let form = document.querySelector(`.${HEADER_SEARCH_CLASS}`);
    if (!form) {
      form = document.createElement("form");
      form.className = HEADER_SEARCH_CLASS;
      form.setAttribute("role", "search");
      form.innerHTML = `
        <input class="better-header-search__input" type="search" autocomplete="off" placeholder="搜索小黑盒" aria-label="搜索小黑盒">
        <button class="better-header-search__submit" type="submit" aria-label="搜索">
          <i class="hb-icon" aria-hidden="true">
            <svg class="hb-iconfont" aria-hidden="true">
              <use xlink:href="#icon-common_search_line_24x24"></use>
            </svg>
          </i>
        </button>
      `;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector(".better-header-search__input");
        const query = input?.value?.trim() || "";
        window.location.href = query ? `/app/search?q=${encodeURIComponent(query)}` : "/app/search";
      });
    }

    const input = form.querySelector(".better-header-search__input");
    if (input && document.activeElement !== input) {
      input.value = getCurrentSearchQuery();
    }

    if (settingsEntry.previousElementSibling !== form) {
      settingsEntry.insertAdjacentElement("beforebegin", form);
    }
  }

  function ensureSettingsEntry() {
    const favoriteEntry = document.querySelector(`.${FAVORITE_ENTRY_CLASS}`);
    const messageButton = document.querySelector(".hb-view-header .message-center__btn");
    const publishButton = document.querySelector(".nav-actions .publish-btn");
    const anchor = favoriteEntry || messageButton;
    if (!publishButton && !anchor) {
      removeSettingsEntry();
      return;
    }

    let entry = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!entry) {
      entry = document.createElement("button");
      entry.className = SETTINGS_ENTRY_CLASS;
      entry.type = "button";
      entry.title = "设置";
      entry.setAttribute("aria-label", "设置");
      entry.setAttribute("aria-expanded", "false");
      entry.innerHTML = '<i class="hb-icon heybox-common_setting_line_24x24" aria-hidden="true">⚙</i>';
      entry.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleSettingsPanel(entry);
      });
    }

    entry.classList.toggle("better-xiaoheihe-settings-entry--before-publish", Boolean(publishButton));
    if (publishButton) {
      if (entry.nextElementSibling !== publishButton) {
        publishButton.insertAdjacentElement("beforebegin", entry);
      }
      ensureHeaderSearch(entry);
      ensureHeaderMessage(entry);
      return;
    }

    if (entry.previousElementSibling !== anchor) {
      anchor.insertAdjacentElement("afterend", entry);
    }
    ensureHeaderSearch(entry);
    ensureHeaderMessage(entry);
  }



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

  function getLinkPageCommentUpCount(item) {
    const text = item.querySelector('.comment-item__like, .comment-item__support, .comment-item__action-like, .heybox-thumbs-up')?.parentElement?.textContent
      || item.querySelector('[class*="like"], [class*="support"]')?.textContent
      || '';
    const match = text.match(/\d+/);
    return match ? Number.parseInt(match[0], 10) || 0 : 0;
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
    if (commentPreviewSort === COMMENT_PREVIEW_SORTS.HOT) {
      const hotDiff = getLinkPageCommentUpCount(right) - getLinkPageCommentUpCount(left);
      return hotDiff || getLinkPageCommentOriginalIndex(left) - getLinkPageCommentOriginalIndex(right);
    }
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

  function addFilterToBbsLink() {
    if (!isLinkPage()) {
      return;
    }

    ensureLinkPageCommentUserLevels();
    moveLinkPageEmptyStateIntoCommentPanel();
    ensureLinkPageAiSummaryButton();

    const mountPoint = document.querySelector('.link-comment .hb-cpt__pagination-inner');
    if (!mountPoint) {
      return;
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

  function handlePage() {
    if (!isEnhancedPage()) {
      document.documentElement.classList.remove(HOME_LAYOUT_CLASS);
      document.documentElement.classList.remove(LINK_DETAIL_LAYOUT_CLASS);
      restoreLeftMenu();
      removeHotSearchSidebar();
      removeFavoriteEntry();
      removeSettingsEntry();
      closeTopicBlockMenu();
      return;
    }

    const wasLinkPage = document.documentElement.classList.contains(LINK_DETAIL_LAYOUT_CLASS);

    injectLayoutStyle();
    ensureFavoriteEntry();
    ensureSettingsEntry();

    document.documentElement.classList.add(HOME_LAYOUT_CLASS);
    document.documentElement.classList.toggle(LINK_DETAIL_LAYOUT_CLASS, isLinkPage());
    moveLeftMenuToTop();
    moveSearchHotListToLeftSidebar();
    removeRightContent();
    if (isLinkPage()) {
      savedScrollY = window.scrollY;
      addFilterToBbsLink();
    } else {
      enhanceFeed();
      if (wasLinkPage && savedScrollY !== null) {
        window.scrollTo(0, savedScrollY);
        savedScrollY = null;
      }
    }

  }

  function scheduleHandlePage() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      handlingPage = true;
      handlePage();
      handlingPage = false;
    });
  }

  function scheduleLinkPageFilterRefresh() {
    if (!isLinkPage()) {
      return;
    }

    if (linkPageFilterRefreshTimer) {
      window.clearTimeout(linkPageFilterRefreshTimer);
    }
    window.requestAnimationFrame(updateLinkPageFilterControls);
    linkPageFilterRefreshTimer = window.setTimeout(() => {
      linkPageFilterRefreshTimer = null;
      updateLinkPageFilterControls();
    }, 160);
  }

  function mutationNodeMatches(node, selector) {
    return node?.nodeType === Node.ELEMENT_NODE
      && (node.matches(selector) || Boolean(node.querySelector(selector)));
  }

  function mutationTargetMatches(mutation, selector) {
    const target = mutation.target?.nodeType === Node.ELEMENT_NODE
      ? mutation.target
      : mutation.target?.parentElement;
    return mutationNodeMatches(target, selector);
  }

  function shouldRefreshLinkPageForMutations(mutations) {
    const commentStructureSelector = [
      '.link-comment',
      '.link-comment__list',
      '.link-comment__comment-item',
      '.comment-children-item',
      '.comment-item__content',
      '.children-item__comment-content'
    ].join(', ');
    const setupStructureSelector = [
      '.link-comment .hb-cpt__pagination-inner',
      '.hb-bbs-link__header',
      '.scroll-list__no-more-desc'
    ].join(', ');

    return mutations.some((mutation) => {
      if (
        mutationTargetMatches(mutation, commentStructureSelector)
        || mutationTargetMatches(mutation, setupStructureSelector)
      ) {
        return true;
      }

      const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];
      return changedNodes.some((node) => (
        mutationNodeMatches(node, commentStructureSelector)
        || mutationNodeMatches(node, setupStructureSelector)
      ));
    });
  }

  function observePage() {
    const observer = new MutationObserver((mutations) => {
      if (handlingPage) {
        return;
      }
      if (!isLinkPage() || shouldRefreshLinkPageForMutations(mutations)) {
        scheduleHandlePage();
        scheduleLinkPageFilterRefresh();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function installRouteHooks() {
    window.addEventListener("popstate", scheduleHandlePage);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);
      scheduleHandlePage();
      return result;
    };

    history.replaceState = function (...args) {
      const result = originalReplaceState.apply(this, args);
      scheduleHandlePage();
      return result;
    };
  }

  function installLocalSettingsStateSync() {
    window.addEventListener("storage", (event) => {
      if (!useLegacyLocalSettingsSync) {
        return;
      }

      if (event.key === HIDE_CY_COMMENTS_STORAGE_KEY) {
        syncLegacyHideCyCommentsState();
      }
      if (event.key === BLOCKED_KEYWORDS_STORAGE_KEY) {
        syncLegacyBlockedKeywordsState();
      }
      if (event.key === LEVEL_FILTERS_STORAGE_KEY) {
        syncLegacyLevelFiltersState();
      }
      if (event.key === COMMENT_PREVIEW_SORT_STORAGE_KEY) {
        syncCommentPreviewSortState(localStorage.getItem(COMMENT_PREVIEW_SORT_STORAGE_KEY));
      }
    });

    window.addEventListener(LOCAL_SETTINGS_CHANGED_EVENT, (event) => {
      const detail = parseEventDetail(event.detail);
      const values = detail.values || {};
      if (Object.prototype.hasOwnProperty.call(values, HIDE_CY_COMMENTS_STORAGE_KEY)) {
        syncHideCyCommentsState(values[HIDE_CY_COMMENTS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, BLOCKED_KEYWORDS_STORAGE_KEY)) {
        syncBlockedKeywordsState(values[BLOCKED_KEYWORDS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, LEVEL_FILTERS_STORAGE_KEY)) {
        syncLevelFiltersState(values[LEVEL_FILTERS_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, COMMENT_PREVIEW_SORT_STORAGE_KEY)) {
        syncCommentPreviewSortState(values[COMMENT_PREVIEW_SORT_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, UI_STATE_STORAGE_KEY)) {
        syncUiState(values[UI_STATE_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, COMMENT_EMOJI_USAGE_STORAGE_KEY)) {
        syncEmojiUsageStats(values[COMMENT_EMOJI_USAGE_STORAGE_KEY]);
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_SETTINGS_STORAGE_KEY)) {
        aiBotSettings = normalizeAiBotSettings(values[AI_BOT_SETTINGS_STORAGE_KEY]);
        const settingsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
        const isEditingAiBotSettings = activeSettingsTab === SETTINGS_TABS.AIBOT
          && settingsPanel
          && !settingsPanel.hidden
          && settingsPanel.contains(document.activeElement);
        if (!isEditingAiBotSettings) {
          renderSettingsPanel();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_CONSENT_STORAGE_KEY)) {
        aiBotConsentAccepted = values[AI_BOT_CONSENT_STORAGE_KEY] === true;
        if (activeSettingsTab === SETTINGS_TABS.AIBOT) {
          renderSettingsPanel();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_LOGS_STORAGE_KEY)) {
        aiBotLogs = normalizeAiBotLogs(values[AI_BOT_LOGS_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          updateAiBotRuntimeLogList();
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_MESSAGE_LOGS_STORAGE_KEY)) {
        aiBotMessageLogs = normalizeAiBotMessageLogs(values[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          refreshAiBotTodayStatsPanel();
          loadEmojis().finally(() => {
            const messageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
            if (messageLogList) {
              const signature = getAiBotMessageLogSignature();
              if (messageLogList.dataset.signature === signature) {
                return;
              }
              const previousScrollTop = messageLogList.scrollTop;
              const wasNearTop = previousScrollTop <= 4;
              messageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
              messageLogList.dataset.signature = signature;
              messageLogList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, messageLogList.scrollHeight);
            }
          });
        }
      }
      if (Object.prototype.hasOwnProperty.call(values, AI_BOT_REPLY_QUEUE_STORAGE_KEY)) {
        aiBotReplyQueue = normalizeAiBotReplyQueue(values[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
        if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
          loadEmojis().finally(() => {
            const pendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
            if (pendingLogList) {
              const signature = `${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`;
              if (pendingLogList.dataset.signature === signature) {
                return;
              }
              const previousScrollTop = pendingLogList.scrollTop;
              const wasNearTop = previousScrollTop <= 4;
              pendingLogList.innerHTML = renderAiBotReplyQueueItemsHtml();
              pendingLogList.dataset.signature = signature;
              pendingLogList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, pendingLogList.scrollHeight);
            }
          });
        }
      }
    });
  }

  function bindFeedAiCapture() {
    if (feedAiCaptureBound) {
      return;
    }

    feedAiCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const aiButton = event.target.closest(".better-ai-summary-button");
      const item = aiButton?.closest(FEED_ITEM_SELECTOR);
      if (!aiButton || !item || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      const linkId = getLinkIdFromItem(item);
      if (!linkId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      summarizeFeedItem(item, linkId, aiButton);
    }, true);
  }

  function bindHeyboxWebLinkCapture() {
    if (heyboxWebLinkCaptureBound) {
      return;
    }

    heyboxWebLinkCaptureBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest(
        ".better-comment-preview__text a, .better-comment-preview__reply-text a, .link-comment .comment-item__content a"
      );
      if (!link || !document.documentElement.classList.contains(HOME_LAYOUT_CLASS)) {
        return;
      }

      if (link.closest(".comment-item__image-box, .comment-item__image-wrapper") || link.querySelector("img")) {
        return;
      }

      const webHref = getHeyboxWebHref(link.getAttribute("href") || "");
      if (!webHref) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.href = webHref;
    }, true);
  }

  function bindReplyEmojiOutsideClick() {
    if (replyEmojiOutsideClickBound) {
      return;
    }

    replyEmojiOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        closeOtherReplyEmojiPanels();
        return;
      }

      const emojiOption = event.target.closest(".better-comment-preview__emoji-option");
      if (emojiOption) {
        const form = getOpenReplyEmojiForm();
        if (form) {
          event.preventDefault();
          event.stopPropagation();
          insertEmojiIntoReplyForm(form, emojiOption.dataset.emojiText || "");
        }
        return;
      }

      if (event.target.closest(".better-comment-preview__emoji-panel, .better-comment-preview__emoji-toggle")) {
        return;
      }

      closeOtherReplyEmojiPanels();
    });
    window.addEventListener("resize", () => {
      const form = getOpenReplyEmojiForm();
      if (form) {
        positionReplyEmojiPanel(form);
      }
    });
    window.addEventListener("scroll", (event) => {
      if (event.target instanceof Element && event.target.closest(".better-comment-preview__emoji-panel")) {
        return;
      }

      const form = getOpenReplyEmojiForm();
      if (form) {
        positionReplyEmojiPanel(form);
      }
    }, true);
  }

  function installAiSettingsSync() {
    window.addEventListener(OPEN_PAGE_SETTINGS_EVENT, handleOpenPageSettings);
    window.addEventListener(AI_SETTINGS_EVENT, (event) => {
      let settingsDetail = {};
      try {
        settingsDetail = typeof event.detail === "string" ? JSON.parse(event.detail) : (event.detail || {});
      } catch {
        settingsDetail = {};
      }
      const previousSummaryConfigKey = JSON.stringify({
        enabled: aiSettings.enabled,
        provider: aiSettings.provider,
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model,
        apiKey: aiSettings.apiKey,
        allowEmoji: aiSettings.allowEmoji,
        summaryPrompt: aiSettings.summaryPrompt
      });
      aiSettings = normalizeAiSettings(settingsDetail);
      const nextSummaryConfigKey = JSON.stringify({
        enabled: aiSettings.enabled,
        provider: aiSettings.provider,
        baseUrl: aiSettings.baseUrl,
        model: aiSettings.model,
        apiKey: aiSettings.apiKey,
        allowEmoji: aiSettings.allowEmoji,
        summaryPrompt: aiSettings.summaryPrompt
      });
      if (nextSummaryConfigKey !== previousSummaryConfigKey) {
        aiSummaryCache.clear();
      }
      const settingsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      const isEditingAiSettings = activeSettingsTab === SETTINGS_TABS.AI
        && settingsPanel
        && !settingsPanel.hidden
        && settingsPanel.contains(document.activeElement);
      if (!isEditingAiSettings) {
        renderSettingsPanel();
      }
      syncAiSummaryButtons();
    });
    window.addEventListener(AI_CHAT_RESPONSE_EVENT, handleAiChatResponse);
    window.dispatchEvent(new CustomEvent(AI_SETTINGS_REQUEST_EVENT));
  }

  async function start() {
    installApiParamCapture();
    captureExistingApiEntries();
    bindFeedAiCapture();
    bindFeedAwardCapture();
    bindFeedImageCapture();
    bindHeyboxWebLinkCapture();
    bindTopicBlockContextMenu();
    bindReplyEmojiOutsideClick();
    installLocalSettingsStateSync();
    await loadLocalSettingsState();
    installAiSettingsSync();
    scheduleHandlePage();
    observePage();
    installRouteHooks();
  }

  if (document.documentElement) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
