// 页面状态、配置归一化、本地设置同步。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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
  const HEADER_SEARCH_HISTORY_CLASS = "better-header-search__history";
  const SEARCH_HISTORY_STORAGE_KEY = "website:bbs-search-history";
  const HEADER_MESSAGE_CLASS = "better-xiaoheihe-header-message";
  const HEADER_MORE_MENU_CLASS = "better-xiaoheihe-header-more-menu";
  const HEADER_MORE_MENU_OPEN_CLASS = "better-xiaoheihe-header-more-menu--open";
  const HEADER_MORE_MENU_TOGGLE_CLASS = "better-xiaoheihe-header-more-menu__toggle";
  const HEADER_MORE_MENU_PANEL_CLASS = "better-xiaoheihe-header-more-menu__panel";
  const HEADER_MORE_MENU_SOURCE_CLASS = "better-xiaoheihe-header-more-menu__source";
  const MESSAGE_POPOVER_CLASS = "better-xiaoheihe-message-popover";
  const FAVORITE_POPOVER_CLASS = "better-xiaoheihe-favorite-popover";
  const SETTINGS_ENTRY_CLASS = "better-xiaoheihe-settings-entry";
  const SETTINGS_PANEL_CLASS = "better-xiaoheihe-settings-panel";
  const AI_SUMMARY_MODAL_CLASS = "better-xiaoheihe-ai-summary-modal";
  const TOPIC_BLOCK_MENU_CLASS = "better-xiaoheihe-topic-block-menu";
  const HOT_SEARCH_SIDEBAR_CLASS = "better-xiaoheihe-hot-search-sidebar";
  const HOT_SEARCH_SIDEBAR_OPEN_CLASS = "better-xiaoheihe-hot-search-sidebar--open";
  const HOT_SEARCH_SIDEBAR_TOGGLE_CLASS = "better-xiaoheihe-hot-search-sidebar__toggle";
  const HOT_SEARCH_SIDEBAR_PANEL_CLASS = "better-xiaoheihe-hot-search-sidebar__panel";
  const DEFAULT_USER_LEVEL = 6;
  const LEVEL_FILTER_MIN = 7;
  const LEVEL_FILTER_MAX = 25;
  const BLOCKED_KEYWORD_SCOPES = {
    COMMENT: "comment",
    FEED: "feed"
  };
  const SETTINGS_TABS = {
    BLOCKED: "blocked",
    FEED: "feed",
    COMMENT: "comment",
    GENERAL: "general",
    AI: "ai",
    AIBOT: "aibot",
    AIBOT_LOGS: "aibot-logs"
  };
  const COMMENT_PREVIEW_SORTS = {
    DEFAULT: "default",
    NEWEST: "newest",
    AUTHOR: "author"
  };
  const COMMENT_PREVIEW_SORT_LABELS = {
    [COMMENT_PREVIEW_SORTS.DEFAULT]: "默认",
    [COMMENT_PREVIEW_SORTS.NEWEST]: "最新",
    [COMMENT_PREVIEW_SORTS.AUTHOR]: "作者优先"
  };
  const BLOCKED_KEYWORD_SCOPE_LABELS = {
    [BLOCKED_KEYWORD_SCOPES.COMMENT]: "评论",
    [BLOCKED_KEYWORD_SCOPES.FEED]: "帖子"
  };
  const DEFAULT_FEED_LAYOUT = {
    totalWidth: 65,
    postWidth: 60
  };
  const FEED_LAYOUT_TOTAL_WIDTH_MIN = 60;
  const FEED_LAYOUT_TOTAL_WIDTH_MAX = 100;
  const FEED_LAYOUT_POST_WIDTH_MIN = 45;
  const FEED_LAYOUT_POST_WIDTH_MAX = 80;
  const ROW_CLASS = "better-xiaoheihe-feed-row";
  const PREVIEW_CLASS = "better-xiaoheihe-comment-preview";
  const IMAGE_VIEWER_CLASS = "better-xiaoheihe-image-viewer";
  const FEED_ITEM_SELECTOR = 'a.hb-cpt__bbs-list-content[href*="/app/bbs/link/"], a.hb-cpt__bbs-content[href*="/app/bbs/link/"]';
  const LINK_AWARD_BUTTON_SELECTOR = ".content-list__like, .bbs-new-style-bottom__like";
  const LINK_AWARD_COUNT_SELECTOR = ".content-list__like-cnt, .bbs-new-style-bottom__like > span:last-child";
  const API_PATH = "/bbs/app/link/tree";
  const SUB_COMMENT_API_PATH = "/bbs/app/comment/sub/comments";
  const COMMENT_SUPPORT_API_PATH = "/bbs/app/comment/support";
  const COMMENT_CREATE_API_PATH = "/bbs/app/comment/create";
  const COMMENT_UPLOAD_INFO_API_PATH = "/bbs/app/api/qcloud/cos/upload/info/v2";
  const COMMENT_UPLOAD_TOKEN_API_PATH = "/bbs/app/api/qcloud/cos/upload/token/v2";
  const COMMENT_UPLOAD_CALLBACK_API_PATH = "/bbs/app/api/qcloud/cos/upload/callback/v2";
  const LINK_AWARD_API_PATH = "/bbs/app/profile/award/link";
  const FAVOUR_LIST_API_PATH = "/bbs/web/profile/favours";
  const MESSAGE_API_PATH = "/bbs/app/user/message";
  const EMOJI_API_PATH = "/bbs/app/api/emojis/list";
  const FEEDS_API_PATH = "/bbs/app/feeds";
  const SEARCH_WELCOME_API_PATH = "/bbs/app/api/search/welcome_page/v2";
  const API_ORIGIN = "https://api.xiaoheihe.cn";
  const WORKSHOP_API_ORIGIN = "https://workshopapi.xiaoheihe.cn";
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
    "x_client_version",
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
  let feedLayoutSettings = normalizeFeedLayoutSettings();
  let feedLayoutPreviewFrame = 0;
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
  let activeSettingsTab = SETTINGS_TABS.GENERAL;
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
  let hotSearchSidebarOutsideClickBound = false;
  let settingsPanelOutsideClickBound = false;
  let messagePopoverOutsideClickBound = false;
  let favoriteEntryClickBound = false;
  let favoriteEntryLastPointerHandledAt = 0;
  let favoritePopoverOutsideClickBound = false;
  let headerMessageClickBound = false;
  let headerSearchHistoryOutsideClickBound = false;
  let headerMoreMenuOutsideClickBound = false;
  let feedAiCaptureBound = false;
  let feedAwardCaptureBound = false;
  let feedImageCaptureBound = false;
  let heyboxWebLinkCaptureBound = false;
  let homeFeedFocusRefreshGuardBound = false;
  let topicSearchCaptureBound = false;
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
  const favoritePopoverState = {
    items: [],
    offset: 0,
    hasMore: true,
    loading: false
  };
  const pageScrollLockOwners = new Set();
  let pageScrollLockState = null;
  let activeImageViewerImages = [];
  let activeImageViewerIndex = 0;
  let imageViewerLoadToken = 0;
  const imageViewerPreloadCache = new Map();

  function isEnhancedPage() {
    return ["xiaoheihe.cn", "www.xiaoheihe.cn"].includes(window.location.hostname)
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

  function isCommunityHomePage() {
    return window.location.pathname === "/app/bbs/home"
      || window.location.pathname === "/app/bbs/home/";
  }

  function clampFeedLayoutValue(value, min, max, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : fallback));
  }

  function normalizeFeedLayout(layout) {
    return {
      totalWidth: clampFeedLayoutValue(
        layout?.totalWidth,
        FEED_LAYOUT_TOTAL_WIDTH_MIN,
        FEED_LAYOUT_TOTAL_WIDTH_MAX,
        DEFAULT_FEED_LAYOUT.totalWidth
      ),
      postWidth: clampFeedLayoutValue(
        layout?.postWidth,
        FEED_LAYOUT_POST_WIDTH_MIN,
        FEED_LAYOUT_POST_WIDTH_MAX,
        DEFAULT_FEED_LAYOUT.postWidth
      )
    };
  }

  function normalizeFeedLayoutSettings(settings) {
    if (settings?.totalWidth !== undefined || settings?.postWidth !== undefined) {
      return normalizeFeedLayout(settings);
    }
    return normalizeFeedLayout(settings?.home);
  }

  function applyFeedLayoutSettings() {
    const layout = feedLayoutSettings;
    const root = document.documentElement;
    root.style.setProperty("--better-feed-total-width", `${layout.totalWidth}vw`);
    root.style.setProperty("--better-feed-post-column", `${layout.postWidth}fr`);
    root.style.setProperty("--better-feed-comment-column", `${100 - layout.postWidth}fr`);
  }

  function updateFeedLayoutSetting(nextLayout, options = {}) {
    feedLayoutSettings = normalizeFeedLayoutSettings({
      ...feedLayoutSettings,
      ...nextLayout
    });
    applyFeedLayoutSettings();
    if (options.persist !== false) {
      saveLocalSettings({
        [FEED_LAYOUT_SETTINGS_STORAGE_KEY]: feedLayoutSettings
      });
    }
    if (options.render === true) {
      renderSettingsPanel();
    }
  }

  function syncFeedLayoutSettings(savedSettings) {
    const normalizedSettings = normalizeFeedLayoutSettings(savedSettings);
    if (JSON.stringify(normalizedSettings) === JSON.stringify(feedLayoutSettings)) {
      applyFeedLayoutSettings();
      return;
    }
    feedLayoutSettings = normalizedSettings;
    applyFeedLayoutSettings();
    if (activeSettingsTab === SETTINGS_TABS.GENERAL) {
      renderSettingsPanel();
    }
  }

  function captureInlineStyle(element, property) {
    return {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property)
    };
  }

  function restoreInlineStyle(element, property, savedStyle) {
    if (savedStyle?.value) {
      element.style.setProperty(property, savedStyle.value, savedStyle.priority || "");
      return;
    }
    element.style.removeProperty(property);
  }

  function lockPageScroll(owner) {
    if (!owner || pageScrollLockOwners.has(owner) || !document.body) {
      return;
    }

    pageScrollLockOwners.add(owner);
    if (pageScrollLockState) {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
    pageScrollLockState = {
      scrollX,
      scrollY,
      rootOverflow: captureInlineStyle(root, "overflow"),
      bodyStyles: Object.fromEntries([
        "overflow",
        "position",
        "top",
        "left",
        "right",
        "width",
        "padding-right"
      ].map((property) => [property, captureInlineStyle(body, property)]))
    };

    root.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("position", "fixed", "important");
    body.style.setProperty("top", `${-scrollY}px`, "important");
    body.style.setProperty("left", `${-scrollX}px`, "important");
    body.style.setProperty("right", "0", "important");
    body.style.setProperty("width", "100%", "important");
    if (scrollbarWidth > 0) {
      const paddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.setProperty("padding-right", `${paddingRight + scrollbarWidth}px`, "important");
    }
  }

  function unlockPageScroll(owner) {
    pageScrollLockOwners.delete(owner);
    if (pageScrollLockOwners.size || !pageScrollLockState || !document.body) {
      return;
    }

    const savedState = pageScrollLockState;
    pageScrollLockState = null;
    restoreInlineStyle(document.documentElement, "overflow", savedState.rootOverflow);
    Object.entries(savedState.bodyStyles).forEach(([property, savedStyle]) => {
      restoreInlineStyle(document.body, property, savedStyle);
    });
    window.scrollTo(savedState.scrollX, savedState.scrollY);
    window.requestAnimationFrame(() => {
      if (!pageScrollLockState) {
        window.scrollTo(savedState.scrollX, savedState.scrollY);
      }
    });
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
    feedLayoutSettings = normalizeFeedLayoutSettings(values[FEED_LAYOUT_SETTINGS_STORAGE_KEY]);
    applyFeedLayoutSettings();
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
    nextValues[FEED_LAYOUT_SETTINGS_STORAGE_KEY] = keysPresent[FEED_LAYOUT_SETTINGS_STORAGE_KEY]
      ? normalizeFeedLayoutSettings(values[FEED_LAYOUT_SETTINGS_STORAGE_KEY])
      : normalizeFeedLayoutSettings();

    applyLocalSettingsValues(nextValues);

    if (Object.keys(migrationValues).length) {
      saveLocalSettings(migrationValues);
    }
  }

