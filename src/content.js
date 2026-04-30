(function () {
  const ENHANCED_PATH_PREFIXES = ["/app/bbs", "/app/topic/link", "/app/user/profile", "/app/search"];
  const LINK_PATH_REGEXP = /^\/app\/bbs\/link\/(\d+)/;
  const RIGHT_CONTENT_SELECTOR = ".hb-layout__content--right";
  const STYLE_ID = "better-xiaoheihe-bbs-layout-style";
  const HOME_LAYOUT_CLASS = "better-xiaoheihe-home-layout";
  const TOP_MENU_CLASS = "better-xiaoheihe-top-menu";
  const TOP_MENU_OPEN_CLASS = "better-xiaoheihe-top-menu--open";
  const TOP_MENU_TOGGLE_CLASS = "better-xiaoheihe-top-menu__toggle";
  const TOP_MENU_PANEL_CLASS = "better-xiaoheihe-top-menu__panel";
  const HOT_SEARCH_SIDEBAR_CLASS = "better-xiaoheihe-hot-search-sidebar";
  const HOT_SEARCH_SIDEBAR_OPEN_CLASS = "better-xiaoheihe-hot-search-sidebar--open";
  const HOT_SEARCH_SIDEBAR_TOGGLE_CLASS = "better-xiaoheihe-hot-search-sidebar__toggle";
  const HOT_SEARCH_SIDEBAR_PANEL_CLASS = "better-xiaoheihe-hot-search-sidebar__panel";
  const HIDE_CY_COMMENTS_STORAGE_KEY = "better-xiaoheihe-hide-cy-comments";
  const ROW_CLASS = "better-xiaoheihe-feed-row";
  const PREVIEW_CLASS = "better-xiaoheihe-comment-preview";
  const IMAGE_VIEWER_CLASS = "better-xiaoheihe-image-viewer";
  const FEED_ITEM_SELECTOR = 'a.hb-cpt__bbs-list-content[href*="/app/bbs/link/"], a.hb-cpt__bbs-content[href*="/app/bbs/link/"]';
  const API_PATH = "/bbs/app/link/tree";
  const COMMENT_SUPPORT_API_PATH = "/bbs/app/comment/support";
  const LINK_AWARD_API_PATH = "/bbs/app/profile/award/link";
  const EMOJI_API_PATH = "/bbs/app/api/emojis/list";
  const SEARCH_WELCOME_API_PATH = "/bbs/app/api/search/welcome_page/v2";
  const API_ORIGIN = "https://api.xiaoheihe.cn";
  const COMMENT_PAGE_LIMIT = 20;
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
  const capturedApiParams = {};
  let hideCyComments = localStorage.getItem(HIDE_CY_COMMENTS_STORAGE_KEY) === "1";
  let hotSearchPromise = null;
  let leftMenuOriginalPosition = null;
  let emojiPromise = null;
  let scheduled = false;
  let previewObserver = null;
  let rowResizeObserver = null;
  let topMenuOutsideClickBound = false;
  let feedAwardCaptureBound = false;
  let imageViewerKeydownBound = false;
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

  function isSearchPage() {
    return window.location.pathname.startsWith("/app/search");
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

      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content--left {
        flex: 1 1 0 !important;
        max-width: none !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-website__container > .hb-layout-main__container--left {
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
        -webkit-line-clamp: 2;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} {
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(300px, 30vw, 380px);
        gap: 8px;
        align-items: start;
        margin: 0;
        border-bottom: 1px solid #f1f2f4;
        overflow: hidden;
      }

      .${HOME_LAYOUT_CLASS} .search-result__link.${ROW_CLASS} {
        border-bottom: 0;
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

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like {
        cursor: pointer;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--active {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--loading {
        opacity: 0.75;
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

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__toolbar {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__filtered-count {
        color: #a8afb7;
        font-size: 12px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle {
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

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle-switch {
        position: relative;
        width: 28px;
        height: 16px;
        flex: 0 0 auto;
        border-radius: 999px;
        background: #d8dde2;
        transition: background 0.16s ease;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle-switch::after {
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

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"] {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch {
        background: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__cy-toggle[aria-pressed="true"] .better-comment-preview__cy-toggle-switch::after {
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
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: start;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__user {
        display: inline-flex;
        max-width: 100%;
        align-items: center;
        color: inherit;
        text-decoration: none;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__user-avatar {
        flex: 0 0 auto;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__body {
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__name {
        display: block;
        max-width: 130px;
        overflow: hidden;
        color: #14191e;
        font-weight: 600;
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
        display: inline-block !important;
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
        -webkit-line-clamp: 2;
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

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__time {
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
        font-size: 12px;
        line-height: 1.45;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text {
        display: -webkit-box;
        overflow: hidden;
        margin-top: 3px;
        position: relative;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-text.comment-item__content.cy::before {
        top: 1px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-meta {
        margin-top: 3px;
        color: #a8afb7;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-footer .better-comment-preview__reply-meta {
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-footer .better-comment-preview__up {
        flex: 0 0 auto;
        font-size: 12px;
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
        font-size: 13px;
        line-height: 1;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__open {
        display: block;
        flex: 0 0 auto;
        margin-top: 12px;
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

      @media (max-width: 1180px) {
        .${HOME_LAYOUT_CLASS} .${ROW_CLASS} {
          grid-template-columns: minmax(0, 1fr);
        }

        .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} {
          display: none;
        }
      }
    `;
    document.documentElement.appendChild(style);
  }

  function removeRightContent() {
    document.querySelectorAll(RIGHT_CONTENT_SELECTOR).forEach((node) => {
      node.remove();
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
      node.remove();
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

    CAPTURED_API_PARAM_KEYS.forEach((key) => {
      const value = parsed.searchParams.get(key);
      if (value) {
        capturedApiParams[key] = value;
      }
    });
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

  function installApiParamCapture() {
    if (window.__betterXiaoHeiHeApiCaptureInstalled) {
      return;
    }

    window.__betterXiaoHeiHeApiCaptureInstalled = true;
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

  function getBaseApiParams() {
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
      device_info: "Edge"
    };

    CAPTURED_API_PARAM_KEYS.forEach((key) => {
      if (capturedApiParams[key]) {
        params[key] = capturedApiParams[key];
      }
    });

    return params;
  }

  function buildCommentApiUrl(linkId, page) {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
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

  function buildLinkAwardApiUrl() {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(LINK_AWARD_API_PATH)
    });

    return `https://api.xiaoheihe.cn${LINK_AWARD_API_PATH}?${params.toString()}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
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

        const code = emoji.code || emoji.name;
        const imageKey = getEmojiImageKey(emoji.img);
        addEmojiMapEntry(code, emoji);
        addEmojiMapEntry(`${groupCode}_${code}`, emoji);
        addEmojiMapEntry(imageKey, emoji);
        addEmojiMapEntry(`${groupCode}_${imageKey}`, emoji);
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
    return `<img class="${className}" src="${escapeHtml(emoji.img)}" alt="[${escapeHtml(emoji.code)}]" title="${escapeHtml(emoji.code)}" loading="lazy">`;
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

  function isSafeCommentLink(href) {
    return /^(heybox|https?):\/\//i.test(href);
  }

  function isSafeCommentImageUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function normalizeCommentLinkHref(href) {
    if (!href.toLowerCase().startsWith("heybox://")) {
      return href;
    }

    return href.replace(/%(?!25)([0-9a-f]{2})/gi, "%25$1");
  }

  function renderCommentLink(node) {
    const href = node.getAttribute("href") || "";
    const linkType = node.getAttribute("data-link-type") || "";
    if (!href || !isSafeCommentLink(href)) {
      return renderPlainCommentText(node.textContent || "");
    }

    return `<a href="${escapeHtml(normalizeCommentLinkHref(href))}"${linkType ? ` data-link-type="${escapeHtml(linkType)}"` : ""}>${renderPlainCommentText(node.textContent || "")}</a>`;
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

  function normalizeCommentGroups(data) {
    const groups = Array.isArray(data?.result?.comments) ? data.result.comments : [];
    return groups.map((group) => {
      const list = Array.isArray(group.comment) ? group.comment : [];
      return {
        root: list[0],
        replies: list.slice(1, 2)
      };
    }).filter((group) => group.root);
  }

  function normalizeUserLevel(level) {
    const value = Number(level);
    if (!Number.isInteger(value) || value <= 0) {
      return "";
    }
    return String(value);
  }

  function getLevelTagWidth(level) {
    return 11.5 + level.length * 5;
  }

  function renderUserLevel(level) {
    const normalizedLevel = normalizeUserLevel(level);
    if (!normalizedLevel) {
      return "";
    }

    return `
      <div class="hb-cpt__level-tag list-content__level better-comment-preview__level" style="width: ${getLevelTagWidth(normalizedLevel)}px;">
        <div class="level-tag__wrapper level-${escapeHtml(normalizedLevel)}"> Lv.${escapeHtml(normalizedLevel)}</div>
      </div>
    `;
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

    return `
      <${tagName}${href} class="header__user better-comment-preview__user">
        ${renderUserAvatar(user)}
        <p class="list-content__username better-comment-preview__name">${escapeHtml(user.username || "匿名用户")}</p>
        ${renderUserLevel(user.level_info?.level)}
      </${tagName}>
      ${isOwner ? '<span class="better-comment-preview__owner">作者</span>' : ""}
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

  function getCommentUpCount(comment) {
    return Number(comment.up || comment.up_num || comment.support_num || 0);
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

  function renderRootComment(comment) {
    const user = comment.user || {};
    return `
      <div class="better-comment-preview__item">
        <div class="better-comment-preview__body">
          <div>${renderCommentUser(user, comment.is_link_owner === 1)}</div>
          <div class="${getCommentContentClass(comment, "better-comment-preview__text")}">${renderCommentText(comment.text)}</div>
          ${renderCommentImages(comment)}
          <div class="better-comment-preview__time">${renderCommentMeta(comment)}</div>
        </div>
        ${renderCommentSupportButton(comment)}
      </div>
    `;
  }

  function renderReplyComment(comment) {
    const user = comment.user || {};
    const replyUser = comment.replyuser || {};
    const replyTo = replyUser.username ? `回复 ${replyUser.username}` : "";
    return `
      <div class="better-comment-preview__reply">
        <div>
          ${renderCommentUser(user, comment.is_link_owner === 1)}
          ${replyTo ? `<span class="better-comment-preview__reply-meta">${escapeHtml(replyTo)}</span>` : ""}
        </div>
        <div class="${getCommentContentClass(comment, "better-comment-preview__reply-text")}">${renderCommentText(comment.text)}</div>
        ${renderCommentImages(comment)}
        <div class="better-comment-preview__reply-footer">
          <div class="better-comment-preview__reply-meta">${renderCommentMeta(comment)}</div>
          ${renderCommentSupportButton(comment)}
        </div>
      </div>
    `;
  }

  function renderCommentGroup(group) {
    return `
      <div class="better-comment-preview__group">
        ${renderRootComment(group.root)}
        ${group.replies.map(renderReplyComment).join("")}
      </div>
    `;
  }

  function isCyComment(comment) {
    return comment?.is_cy === 1 || comment?.is_cy === true || comment?.is_cy === "1";
  }

  function countCommentGroupItems(groups) {
    return groups.reduce((sum, group) => sum + 1 + (group.replies?.length || 0), 0);
  }

  function getVisibleCommentGroups(commentGroups) {
    if (!hideCyComments) {
      return commentGroups;
    }

    return commentGroups
      .filter((group) => !isCyComment(group.root))
      .map((group) => ({
        ...group,
        replies: (group.replies || []).filter((reply) => !isCyComment(reply))
      }));
  }

  function renderCyToggle(hiddenCount) {
    return `
      <div class="better-comment-preview__toolbar">
        ${hideCyComments && hiddenCount ? `<span class="better-comment-preview__filtered-count">已屏蔽 ${escapeHtml(hiddenCount)} 条</span>` : ""}
        <button class="better-comment-preview__cy-toggle" type="button" aria-pressed="${hideCyComments ? "true" : "false"}" title="${hideCyComments ? "显示插眼评论" : "屏蔽插眼评论"}">
          <span class="better-comment-preview__cy-toggle-switch" aria-hidden="true"></span>
          <span>屏蔽CY</span>
        </button>
      </div>
    `;
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
      return '<div class="better-comment-preview__empty">插眼评论已屏蔽</div>';
    }
    if (!commentGroups.length) {
      return '<div class="better-comment-preview__empty">暂无评论</div>';
    }
    return `${commentGroups.map(renderCommentGroup).join("")}${renderCommentListFooter(state)}`;
  }

  function renderPreview(preview, state) {
    const linkId = preview.dataset.linkId || "";
    const count = state?.commentCount || preview.dataset.commentCount || "0";
    const allCommentGroups = state?.commentGroups || [];
    const commentGroups = getVisibleCommentGroups(allCommentGroups);
    const hiddenCount = countCommentGroupItems(allCommentGroups) - countCommentGroupItems(commentGroups);
    const failed = state?.failed;

    if (!state) {
      preview.innerHTML = '<div class="better-comment-preview__loading">评论加载中</div>';
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
      return;
    }

    if (failed) {
      preview.innerHTML = '<div class="better-comment-preview__empty">评论暂时加载失败</div>';
      scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
      return;
    }

    preview.innerHTML = `
      <div class="better-comment-preview__header">
        <span>评论 ${escapeHtml(count)}</span>
        ${renderCyToggle(hiddenCount)}
      </div>
      <div class="better-comment-preview__list">
        ${renderCommentListContent(state, commentGroups, hiddenCount)}
      </div>
      <a class="better-comment-preview__open" href="/app/bbs/link/${escapeHtml(linkId)}">查看全部 ${escapeHtml(count)} 条评论 ›</a>
    `;
    bindPreviewActions(preview);
    bindPreviewListScroll(preview);
    scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
  }

  function fetchCommentPage(linkId, page) {
    Promise.all([
      loadEmojis(),
      fetch(buildCommentApiUrl(linkId, page), {
        credentials: "include",
        headers: {
          accept: "*/*"
        }
      }).then((response) => response.json())
    ]).then(([, data]) => {
      const state = commentCache.get(linkId) || { commentGroups: [] };
      if (data?.status !== "ok") {
        state.failed = page === 1;
        state.loadingMore = false;
        state.loadMoreFailed = page > 1;
        state.hasMore = false;
        commentCache.set(linkId, state);
        renderLinkedPreviews(linkId);
        return;
      }

      const pageGroups = normalizeCommentGroups(data);
      state.commentGroups = page === 1 ? pageGroups : state.commentGroups.concat(pageGroups);
      state.commentCount = data.result?.link?.comment_num || data.result?.total_floor_num || state.commentCount;
      state.linkCreateAt = getLinkCreateTime(data.result?.link) || state.linkCreateAt;
      state.page = page;
      state.failed = false;
      state.loadMoreFailed = false;
      state.loadingMore = false;
      state.hasMore = pageGroups.length >= COMMENT_PAGE_LIMIT;
      commentCache.set(linkId, state);
      updateFeedItemPublishTime(linkId, state.linkCreateAt);
      renderLinkedPreviews(linkId);
    }).catch(() => {
      const state = commentCache.get(linkId) || { commentGroups: [] };
      state.failed = page === 1;
      state.loadingMore = false;
      state.loadMoreFailed = page > 1;
      state.hasMore = false;
      commentCache.set(linkId, state);
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
  }

  function setHideCyComments(isHidden) {
    hideCyComments = isHidden;
    localStorage.setItem(HIDE_CY_COMMENTS_STORAGE_KEY, isHidden ? "1" : "0");
    renderAllPreviews();
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
  }

  function supportComment(commentId, button) {
    if (!commentId || button.dataset.loading === "1") {
      return;
    }

    button.dataset.loading = "1";
    button.disabled = true;

    fetch(buildCommentSupportApiUrl(), {
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
    }).then((response) => response.json()).then((data) => {
      if (data?.status !== "ok") {
        delete button.dataset.loading;
        button.disabled = false;
        return;
      }

      updateCachedComment(commentId, (comment) => {
        if (!isCommentSupported(comment)) {
          comment.up = getCommentUpCount(comment) + 1;
        }
        comment.is_support = 1;
        comment.better_supported = true;
      });
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

    fetch(buildLinkAwardApiUrl(), {
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
    }).then((response) => response.json()).then((data) => {
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

  function openCommentImageViewer(imageLink) {
    const imageGroup = imageLink.closest(".better-comment-preview__images");
    const links = Array.from(imageGroup?.querySelectorAll(".better-comment-preview__image-link") || [imageLink]);
    activeImageViewerImages = links.map((link) => link.dataset.previewSrc || link.href).filter(isSafeCommentImageUrl);
    const index = Math.max(0, links.indexOf(imageLink));
    showImageViewerAt(index);
  }

  function bindPreviewActions(preview) {
    if (preview.dataset.actionsBound === "1") {
      return;
    }

    preview.dataset.actionsBound = "1";
    preview.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
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

      const supportButton = event.target.closest(".better-comment-preview__up");
      if (!supportButton || !preview.contains(supportButton)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      supportComment(supportButton.dataset.commentId, supportButton);
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

    if (commentCache.has(linkId)) {
      renderPreview(preview, commentCache.get(linkId));
      return;
    }

    const pending = {
      commentGroups: [],
      page: 0,
      hasMore: true,
      loadingMore: true
    };
    commentCache.set(linkId, pending);
    renderPreview(preview, pending);
    fetchCommentPage(linkId, 1);
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

  function bindFeedItemActions(item, linkId) {
    if (item.dataset.betterActionsBound === "1") {
      return;
    }

    item.dataset.betterActionsBound = "1";
    item.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
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

  function enhanceFeedItem(item) {
    if (item.closest(`.${ROW_CLASS}`)) {
      return;
    }

    const linkId = getLinkIdFromItem(item);
    if (!linkId) {
      return;
    }

    bindFeedItemActions(item, linkId);
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
    renderPreview(preview, null);
    observeRowHeight(row, item);
    observePreview(preview);
  }

  function enhanceFeed() {
    document.querySelectorAll(FEED_ITEM_SELECTOR).forEach(enhanceFeedItem);
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

      closeTopMenus();
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

  function moveLeftMenuToTop() {
    const leftMenu = document.querySelector(".hb-websit__left-section");
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

  function handlePage() {
    if (!isEnhancedPage()) {
      document.documentElement.classList.remove(HOME_LAYOUT_CLASS);
      restoreLeftMenu();
      removeHotSearchSidebar();
      return;
    }

    injectLayoutStyle();

    if (isLinkPage()) {
      document.documentElement.classList.remove(HOME_LAYOUT_CLASS);
      restoreLeftMenu();
      removeHotSearchSidebar();
      return;
    }

    document.documentElement.classList.add(HOME_LAYOUT_CLASS);
    moveLeftMenuToTop();
    moveSearchHotListToLeftSidebar();
    removeRightContent();
    enhanceFeed();
  }

  function scheduleHandlePage() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      handlePage();
    });
  }

  function observePage() {
    const observer = new MutationObserver(scheduleHandlePage);
    observer.observe(document.documentElement, {
      childList: true,
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

  function start() {
    installApiParamCapture();
    captureExistingApiEntries();
    bindFeedAwardCapture();
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
