// 页面布局样式注入。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function injectLayoutStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HOME_LAYOUT_CLASS} body,
      .${HOME_LAYOUT_CLASS} #app,
      .${HOME_LAYOUT_CLASS} .app,
      .${HOME_LAYOUT_CLASS} .hb-website__app,
      .${HOME_LAYOUT_CLASS} .hb-page__app,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-website__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__main,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content > main,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content > main > .list,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .hb-cpt__scroll-list,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .hb-bbs-home,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .bbs-home__content-list,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .bbs-home__content-item {
        box-sizing: border-box !important;
        position: relative !important;
        left: auto !important;
        right: auto !important;
        transform: none !important;
        min-width: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-website__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__main,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout-main__container,
      .${HOME_LAYOUT_CLASS} .hb-page__app .hb-layout__content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content > main,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .content > main > .list {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        transform: none !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        padding-left: clamp(12px, 4vw, 48px) !important;
        padding-right: clamp(12px, 4vw, 48px) !important;
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
        left: auto !important;
        right: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        transform: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__list {
        position: relative !important;
        left: auto !important;
        width: 100% !important;
        max-width: 100% !important;
        transform: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__header,
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__filter-row {
        box-sizing: border-box !important;
        width: 100% !important;
        max-width: 100% !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .hb-cpt__scroll-list.hb-bbs-home {
        position: relative !important;
        left: 50% !important;
        width: var(--better-feed-total-width, 92vw) !important;
        max-width: calc(100vw - 24px) !important;
        flex: 0 1 var(--better-feed-total-width, 92vw) !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home > .bbs-home__topic-list-wrapper,
      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home > .bbs-home__content-list {
        position: relative !important;
        left: auto !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        flex: 0 0 auto !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        transform: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-bbs-list > .content > .list {
        box-sizing: border-box !important;
        position: relative !important;
        left: 50% !important;
        width: var(--better-feed-total-width, 92vw) !important;
        min-width: 0 !important;
        max-width: calc(100vw - 24px) !important;
        flex: 0 1 var(--better-feed-total-width, 92vw) !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} #page-bbs-list > .content > .list > .hb-search-result,
      .${HOME_LAYOUT_CLASS} #page-bbs-list .search-result__list.general {
        box-sizing: border-box !important;
        position: relative !important;
        left: auto !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        flex: 0 1 100% !important;
        margin-right: 0 !important;
        margin-left: 0 !important;
        transform: none !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .hb-cpt__scroll-list.hb-bbs-home,
      .${HOME_LAYOUT_CLASS} #page-bbs-list > .content > .list {
        flex-shrink: 0 !important;
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

      .${HOME_LAYOUT_CLASS} #page-bbs-community::before,
      .${HOME_LAYOUT_CLASS} #page-topic-link::before,
      .${HOME_LAYOUT_CLASS} #page-bbs-list::before {
        content: none !important;
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} #page-bbs-community .list::before,
      .${HOME_LAYOUT_CLASS} #page-bbs-list > .content > .list::before {
        content: none !important;
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} .bbs-home__topic-item {
        flex: 0 0 auto !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-layout__content--right,
      .${HOME_LAYOUT_CLASS} .cpt-right-side,
      .${HOME_LAYOUT_CLASS} .bbs-community-hot-topic,
      .${HOME_LAYOUT_CLASS} .hot-search,
      .${HOME_LAYOUT_CLASS} .right-side-default.default-content,
      .${HOME_LAYOUT_CLASS} .hb-layout__content > [class*="right"],
      .${HOME_LAYOUT_CLASS} .hb-layout__content > [class*="side"],
      .${HOME_LAYOUT_CLASS} .hb-layout-main__container--left:empty,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .cpt-right-side,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .cpt-right-side.right,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .right-side-default,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .right-side-default.default-content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .dynamic-content,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .bbs-community-hot-topic,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .qr-section,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .app-links,
      .${HOME_LAYOUT_CLASS} #page-bbs-community .footer-info {
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
        position: relative;
        width: 36px;
        min-width: 36px;
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
        font-weight: 600;
        line-height: 1;
        text-decoration: none;
        white-space: nowrap;
        transition: background 0.16s ease, color 0.16s ease;
      }

      .${FAVORITE_ENTRY_CLASS}:hover {
        background: #eceff2;
        color: #000;
      }

      .${FAVORITE_ENTRY_CLASS}[aria-expanded="true"] {
        background: #eceff2;
        color: #000;
      }

      .${FAVORITE_ENTRY_CLASS} .better-xiaoheihe-favorite-entry__icon {
        width: 18px;
        height: 18px;
        display: block;
        fill: currentColor;
      }

      .${HEADER_SEARCH_CLASS} {
        box-sizing: border-box;
        display: inline-flex;
        width: clamp(180px, 24vw, 320px);
        height: 36px;
        position: relative;
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

      .${HEADER_SEARCH_CLASS} .${HEADER_SEARCH_HISTORY_CLASS} {
        box-sizing: border-box;
        display: flex;
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: 10030;
        width: 100%;
        max-height: 280px;
        flex-direction: column;
        overflow-y: auto;
        padding: 6px;
        border: 1px solid #e4e8ec;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 10px 28px rgba(20, 25, 30, 0.14);
      }

      .${HEADER_SEARCH_CLASS} .${HEADER_SEARCH_HISTORY_CLASS}[hidden] {
        display: none;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__history-title {
        padding: 3px 8px 6px;
        color: #8a9299;
        font-size: 11px;
        line-height: 16px;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__history-item {
        display: block;
        width: 100%;
        min-height: 34px;
        overflow: hidden;
        padding: 0 8px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #26313b;
        cursor: pointer;
        font-size: 13px;
        letter-spacing: 0;
        line-height: 34px;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${HEADER_SEARCH_CLASS} .better-header-search__history-item:hover,
      .${HEADER_SEARCH_CLASS} .better-header-search__history-item:focus-visible {
        background: #f1f5f9;
        color: #14191e;
        outline: 0;
      }

      .${HOME_LAYOUT_CLASS} .nav .nav-links {
        overflow: visible !important;
      }

      .${HOME_LAYOUT_CLASS} .nav .nav-links > .${HEADER_MORE_MENU_SOURCE_CLASS} {
        display: none !important;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_CLASS} {
        display: inline-flex;
        position: relative;
        height: 100%;
        align-items: center;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_TOGGLE_CLASS} {
        display: inline-flex;
        height: 36px;
        align-items: center;
        gap: 4px;
        padding: 0 12px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 15px;
        letter-spacing: 0;
        line-height: 36px;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_TOGGLE_CLASS}:hover,
      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_CLASS}.${HEADER_MORE_MENU_OPEN_CLASS} .${HEADER_MORE_MENU_TOGGLE_CLASS} {
        background: #f3f4f5;
        color: #14191e;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_TOGGLE_CLASS} .hb-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        align-items: center;
        justify-content: center;
        transition: transform 0.16s ease;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_CLASS}.${HEADER_MORE_MENU_OPEN_CLASS} .${HEADER_MORE_MENU_TOGGLE_CLASS} .hb-icon {
        transform: rotate(180deg);
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_PANEL_CLASS} {
        box-sizing: border-box;
        display: flex;
        position: absolute;
        top: calc(100% + 6px);
        left: 50%;
        z-index: 10020;
        width: 140px;
        flex-direction: column;
        padding: 4px;
        border: 1px solid #e6e9ed;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 8px 22px rgba(20, 25, 30, 0.12);
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, -4px);
        transition: opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease;
        visibility: hidden;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_CLASS}.${HEADER_MORE_MENU_OPEN_CLASS} .${HEADER_MORE_MENU_PANEL_CLASS} {
        opacity: 1;
        pointer-events: auto;
        transform: translate(-50%, 0);
        visibility: visible;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_PANEL_CLASS} > button {
        display: flex;
        width: 100%;
        height: 34px;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #4f5965;
        cursor: pointer;
        font-size: 13px;
        letter-spacing: 0;
        text-align: center;
        white-space: nowrap;
      }

      .${HOME_LAYOUT_CLASS} .${HEADER_MORE_MENU_PANEL_CLASS} > button:hover {
        background: #f3f6f9;
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

      .${FAVORITE_POPOVER_CLASS} {
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

      .${FAVORITE_POPOVER_CLASS}[hidden] {
        display: none !important;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 12px 10px;
        border-bottom: 1px solid #eef1f4;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__title {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 2px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__title strong {
        overflow: hidden;
        color: #14191e;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__all-link {
        display: inline-flex;
        height: 26px;
        flex: 0 0 auto;
        align-items: center;
        gap: 3px;
        padding: 0 9px;
        border: 1px solid #d9e5f2;
        border-radius: 6px;
        background: #f7fbff;
        color: #2775d1;
        font-size: 12px;
        font-weight: 700;
        line-height: 24px;
        text-decoration: none;
        transition: border-color 0.16s ease, background-color 0.16s ease;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__all-link:hover {
        border-color: #2775d1;
        background: #eef6ff;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__body {
        max-height: min(540px, calc(100vh - 112px));
        overflow-y: auto;
        padding: 10px;
        background: #f6f8fa;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__loading-state,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__loading-state {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__visually-hidden,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton-card,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton-card {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 9px;
        padding: 11px;
        border: 1px solid #e9edf1;
        border-radius: 9px;
        background: #fff;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton-author,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton-author,
      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton-content,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton-content,
      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton-footer,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton-footer {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 7px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton-copy,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton-copy {
        display: flex;
        min-width: 0;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 7px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton {
        display: block;
        border-radius: 999px;
        background: linear-gradient(90deg, #edf1f4 22%, #f8fafb 46%, #edf1f4 70%);
        background-size: 240% 100%;
        animation: better-popover-skeleton-shimmer 1.25s ease-in-out infinite;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--avatar,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--avatar {
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        border-radius: 50%;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--name,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--name {
        width: 88px;
        height: 10px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--title,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--title {
        width: 88%;
        height: 13px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--text,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--text {
        width: 100%;
        height: 9px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--text-short,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--text-short {
        width: 66%;
        height: 9px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--thumbnail,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--thumbnail {
        width: 84px;
        height: 68px;
        flex: 0 0 auto;
        border-radius: 7px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--pill,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--pill {
        width: 58px;
        height: 18px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton--pill-short,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton--pill-short {
        width: 42px;
        height: 18px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__item--enter,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__item--enter {
        animation: better-popover-card-enter 0.3s cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
        animation-delay: calc(var(--better-popover-enter-index, 0) * 36ms);
      }

      @keyframes better-popover-skeleton-shimmer {
        0% {
          background-position: 120% 0;
        }
        100% {
          background-position: -120% 0;
        }
      }

      @keyframes better-popover-card-enter {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.99);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .${FAVORITE_POPOVER_CLASS} .better-message-popover__skeleton,
        .${MESSAGE_POPOVER_CLASS} .better-message-popover__skeleton,
        .${FAVORITE_POPOVER_CLASS} .better-message-popover__item--enter,
        .${MESSAGE_POPOVER_CLASS} .better-message-popover__item--enter {
          animation: none;
        }
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__state {
        padding: 26px 14px;
        color: #6f7b87;
        font-size: 13px;
        line-height: 20px;
        text-align: center;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__item {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border: 1px solid #e9edf1;
        border-radius: 8px;
        background: #fff;
        color: inherit;
        text-decoration: none;
        transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__item + .better-message-popover__item {
        margin-top: 8px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__item:hover {
        border-color: #c8d7e8;
        box-shadow: 0 8px 22px rgba(20, 25, 30, 0.08);
        transform: translateY(-1px);
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__context {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 6px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__author {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 6px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__author-avatar {
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

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__author-name {
        min-width: 0;
        overflow: hidden;
        color: #4f5965;
        font-size: 12px;
        font-weight: 800;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${FAVORITE_POPOVER_CLASS} .better-comment-preview__level {
        display: inline-flex;
        flex: 0 0 auto;
        vertical-align: top;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-content-row,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-content-row {
        display: flex;
        min-width: 0;
        align-items: flex-start;
        gap: 10px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-copy,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-copy {
        display: flex;
        min-width: 0;
        flex: 1 1 auto;
        flex-direction: column;
        gap: 6px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-thumbnail,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-thumbnail {
        position: relative;
        display: block;
        width: 84px;
        height: 68px;
        flex: 0 0 auto;
        overflow: hidden;
        border-radius: 7px;
        background: #eef1f4;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-thumbnail > img,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-thumbnail > img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-image-count,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-image-count {
        position: absolute;
        right: 4px;
        bottom: 4px;
        min-width: 20px;
        padding: 1px 5px;
        border-radius: 999px;
        background: rgba(20, 25, 30, 0.72);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;
      }

      .${FAVORITE_POPOVER_CLASS} [data-better-profile-id],
      .${MESSAGE_POPOVER_CLASS} [data-better-profile-id] {
        cursor: pointer;
      }

      .${FAVORITE_POPOVER_CLASS} [data-better-image-urls],
      .${MESSAGE_POPOVER_CLASS} [data-better-image-urls] {
        cursor: zoom-in;
      }

      .${FAVORITE_POPOVER_CLASS} [data-better-profile-id]:focus-visible,
      .${FAVORITE_POPOVER_CLASS} [data-better-image-urls]:focus-visible,
      .${MESSAGE_POPOVER_CLASS} [data-better-profile-id]:focus-visible,
      .${MESSAGE_POPOVER_CLASS} [data-better-image-urls]:focus-visible {
        outline: 2px solid rgba(39, 117, 209, 0.72);
        outline-offset: 2px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__author-name[data-better-profile-id]:hover,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__user[data-better-profile-id]:hover,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-author-name[data-better-profile-id]:hover {
        text-decoration: underline;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__post-thumbnail[data-better-image-urls]:hover > img,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post-thumbnail[data-better-image-urls]:hover > img,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__target-image[data-better-image-urls]:hover {
        opacity: 0.88;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-title {
        display: -webkit-box;
        overflow: hidden;
        color: #14191e;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-desc {
        display: -webkit-box;
        overflow: hidden;
        color: #6f7b87;
        font-size: 12px;
        line-height: 18px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-title .better-comment-preview__emoji,
      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-desc .better-comment-preview__emoji {
        display: inline-block;
        width: 18px;
        height: 18px;
        margin: -2px 2px 0;
        border-radius: 4px;
        object-fit: contain;
        vertical-align: middle;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-title .better-comment-preview__emoji--big,
      .${FAVORITE_POPOVER_CLASS} .better-message-popover__link-desc .better-comment-preview__emoji--big {
        width: 20px;
        height: 20px;
        margin: -3px 2px 0;
        border-radius: 5px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__media-row {
        display: flex;
        min-width: 0;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__media-row .better-message-popover__topic {
        max-width: 55%;
        margin-left: auto;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__topic,
      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__meta {
        display: inline-flex;
        max-width: 100%;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        padding: 2px 6px;
        border-radius: 999px;
        background: #f1f4f7;
        color: #6f7b87;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__topic-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        border-radius: 50%;
        object-fit: cover;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__stat {
        gap: 3px;
      }

      .${FAVORITE_POPOVER_CLASS} .better-favorite-popover__stat-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
        fill: currentColor;
      }

      .${FAVORITE_POPOVER_CLASS} .better-message-popover__footer-state {
        padding: 10px 0 2px;
        color: #8a9299;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
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
        color: #14191e;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-desc {
        display: -webkit-box;
        overflow: hidden;
        color: #6f7b87;
        font-size: 12px;
        font-weight: 400;
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
        width: 18px;
        height: 18px;
        margin: -2px 2px 0;
        border-radius: 4px;
        object-fit: contain;
        vertical-align: middle;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-title .better-comment-preview__emoji--big,
      .${MESSAGE_POPOVER_CLASS} .better-message-popover__link-desc .better-comment-preview__emoji--big {
        width: 20px;
        height: 20px;
        margin: -3px 2px 0;
        border-radius: 5px;
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
        padding: 10px;
        border: 1px solid #e9edf1;
        border-radius: 8px;
        background: #fff;
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

      .${MESSAGE_POPOVER_CLASS} .better-comment-preview__level {
        display: inline-flex;
        flex: 0 0 auto;
        vertical-align: top;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__post {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 7px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__media-row {
        display: flex;
        min-width: 0;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__topic {
        display: inline-flex;
        flex: 0 0 auto;
        max-width: 55%;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        margin-left: auto;
        padding: 2px 6px;
        border-radius: 999px;
        background: #f1f4f7;
        color: #6f7b87;
        font-size: 12px;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${MESSAGE_POPOVER_CLASS} .better-message-popover__topic-icon {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        border-radius: 50%;
        object-fit: cover;
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

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-control {
        margin-top: 16px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-control-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        color: #3c4651;
        font-size: 12px;
        font-weight: 700;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-control-header output {
        flex: 0 0 auto;
        color: #2775d1;
        font-weight: 600;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-range {
        box-sizing: border-box;
        width: 100%;
        margin: 8px 0 0;
        accent-color: #2775d1;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-scale {
        display: flex;
        justify-content: space-between;
        margin-top: 2px;
        color: #a1a8b0;
        font-size: 11px;
        line-height: 16px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-preview {
        box-sizing: border-box;
        display: flex;
        width: var(--better-layout-preview-total);
        height: 34px;
        overflow: hidden;
        margin: 16px auto 10px;
        border: 1px solid #dce3ea;
        border-radius: 7px;
        background: #f7f9fb;
        color: #59636e;
        font-size: 11px;
        line-height: 34px;
        text-align: center;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-preview-post {
        width: var(--better-layout-preview-post);
        background: #eef5ff;
        color: #1f66b8;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__layout-preview-comment {
        width: var(--better-layout-preview-comment);
        border-left: 1px solid #dce3ea;
        background: #f7fafc;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-link {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 76px;
        padding: 12px 14px;
        border: 1px solid #dce7f3;
        border-radius: 8px;
        background: linear-gradient(135deg, #f8fbff 0%, #f3f7fc 100%);
        color: #14191e;
        text-decoration: none;
        box-shadow: 0 1px 2px rgba(28, 55, 84, 0.04);
        transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-link:hover {
        border-color: #b8cfe8;
        box-shadow: 0 7px 18px rgba(31, 102, 184, 0.11);
        transform: translateY(-1px);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-link:focus-visible {
        outline: 2px solid rgba(39, 117, 209, 0.35);
        outline-offset: 2px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-icon {
        display: inline-flex;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: #24292f;
        color: #fff;
        box-shadow: 0 4px 10px rgba(36, 41, 47, 0.18);
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-icon svg {
        width: 22px;
        height: 22px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-content {
        display: grid;
        min-width: 0;
        flex: 1;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: baseline;
        column-gap: 8px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-title {
        color: #14191e;
        font-weight: 700;
        line-height: 20px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-repo {
        min-width: 0;
        overflow: hidden;
        color: #2775d1;
        font-size: 12px;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-desc {
        grid-column: 1 / -1;
        color: #7b858f;
        font-size: 12px;
        line-height: 18px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-arrow {
        display: inline-flex;
        width: 28px;
        height: 28px;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        border-radius: 7px;
        background: rgba(39, 117, 209, 0.08);
        color: #2775d1;
        transition: background-color 0.16s ease, transform 0.16s ease;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-arrow svg {
        width: 17px;
        height: 17px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__project-link:hover .better-settings__project-arrow {
        background: rgba(39, 117, 209, 0.14);
        transform: translate(1px, -1px);
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

      .${SETTINGS_PANEL_CLASS} .better-settings__scope-tabs {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        margin-bottom: 10px;
        padding: 3px;
        border: 1px solid #e3e7eb;
        border-radius: 8px;
        background: #fbfcfd;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__scope-tab {
        height: 30px;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #59636e;
        cursor: pointer;
        font-size: 13px;
      }

      .${SETTINGS_PANEL_CLASS} .better-settings__scope-tab[aria-selected="true"] {
        background: #eaf3ff;
        color: #1f66b8;
        font-weight: 600;
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
        top: 88px;
        bottom: 20px;
        left: 14px;
        z-index: 9998;
        width: min(354px, calc(100vw - 28px));
        max-width: calc(100vw - 24px);
        overflow: hidden;
        pointer-events: none;
        isolation: isolate;
      }

      .${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS} {
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 0;
        z-index: 2;
        width: 34px;
        min-height: 92px;
        padding: 14px 5px;
        border: 1px solid #d7e4f1;
        border-radius: 0 14px 14px 0;
        background: linear-gradient(180deg, #ffffff 0%, #f5f9fd 100%);
        color: #2775d1;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(39, 78, 120, 0.14), 0 1px 2px rgba(20, 25, 30, 0.06);
        pointer-events: auto;
        transform: translateY(-50%);
        backface-visibility: hidden;
        writing-mode: vertical-rl;
        letter-spacing: 0;
        font-size: 13px;
        font-weight: 600;
        transition: left 0.2s ease;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS} .${HOT_SEARCH_SIDEBAR_TOGGLE_CLASS} {
        left: min(320px, calc(100vw - 62px));
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} {
        box-sizing: border-box;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        width: 320px;
        max-width: calc(100vw - 62px);
        overflow: auto;
        padding: 16px;
        border: 1px solid #e4ebf2;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 16px 40px rgba(20, 49, 79, 0.16), 0 2px 8px rgba(20, 25, 30, 0.06);
        pointer-events: auto;
        backface-visibility: hidden;
        transform: translate3d(-100%, 0, 0);
        transition: transform 0.2s ease;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS} .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} {
        transform: translate3d(0, 0, 0);
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .game-rank__aside-hot-game {
        margin: 0 !important;
      }

      .${HOT_SEARCH_SIDEBAR_CLASS} .hot-search {
        display: block !important;
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
        gap: 14px;
        margin: 0 -2px 14px;
        padding: 0 2px;
        overflow-x: auto;
        border-bottom: 1px solid #edf1f5;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__tab {
        flex: 0 0 auto;
        min-height: 30px;
        padding: 0 0 8px;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: #8a9299;
        cursor: pointer;
        font-size: 13px;
        line-height: 18px;
        transition: color 0.16s ease, border-color 0.16s ease;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__tab:hover {
        color: #2775d1;
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
        border-radius: 8px;
        padding: 5px 6px;
        margin: 0 -6px;
        transition: background 0.16s ease;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__item:hover {
        background: #f3f7fb;
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

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__item:nth-child(1) .better-hot-search__index {
        background: #fff0ed;
        color: #e45b47;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__item:nth-child(2) .better-hot-search__index {
        background: #fff6e5;
        color: #c98520;
      }

      .${HOT_SEARCH_SIDEBAR_PANEL_CLASS} .better-hot-search__item:nth-child(3) .better-hot-search__index {
        background: #eef5ff;
        color: #4d78b8;
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
        box-sizing: border-box;
        display: grid;
        position: relative;
        left: 50%;
        grid-template-columns: minmax(0, var(--better-feed-post-column, 70fr)) minmax(0, var(--better-feed-comment-column, 30fr));
        gap: 0;
        align-items: start;
        width: var(--better-feed-total-width, 92vw) !important;
        max-width: calc(100vw - 24px) !important;
        margin: 0 auto 14px;
        border: 1px solid #eef0f2;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(20, 25, 30, 0.04);
        overflow: hidden;
        transform: translateX(-50%);
      }

      .${HOME_LAYOUT_CLASS} #page-user-profile > .content > .list {
        box-sizing: border-box !important;
        position: relative !important;
        left: 50% !important;
        flex: 0 0 var(--better-feed-total-width, 92vw) !important;
        min-width: 0 !important;
        width: var(--better-feed-total-width, 92vw) !important;
        max-width: calc(100vw - 24px) !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__panel {
        box-sizing: border-box !important;
        position: relative !important;
        left: 50% !important;
        flex: 0 0 var(--better-feed-total-width, 92vw) !important;
        min-width: 0 !important;
        width: var(--better-feed-total-width, 92vw) !important;
        max-width: calc(100vw - 24px) !important;
        transform: translateX(-50%) !important;
      }

      .${HOME_LAYOUT_CLASS} #page-user-profile > .content > .list > .user-profile-page-header,
      .${HOME_LAYOUT_CLASS} #page-user-profile > .content > .list > .user-profile-wrapper,
      .${HOME_LAYOUT_CLASS} #page-user-profile > .content > .list > .post-link-wrapper,
      .${HOME_LAYOUT_CLASS} #page-user-profile .user-profile__list {
        box-sizing: border-box !important;
        min-width: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .hb-cpt__scroll-list.hb-bbs-home .${ROW_CLASS},
      .${HOME_LAYOUT_CLASS} .search-result__list.general > .search-result__link.${ROW_CLASS},
      .${HOME_LAYOUT_CLASS} #page-user-profile .user-profile__list > .${ROW_CLASS},
      .${HOME_LAYOUT_CLASS} #page-topic-link .topic-link__list .${ROW_CLASS} {
        left: auto;
        width: 100% !important;
        max-width: 100% !important;
        transform: none;
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
        position: relative !important;
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
        position: relative !important;
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

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-content__imgs-wrapper {
        position: relative !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-content__imgs-wrapper > .bbs-content__image-cnt {
        box-sizing: border-box;
        display: inline-flex !important;
        position: absolute !important;
        right: 8px !important;
        bottom: 8px !important;
        top: auto !important;
        left: auto !important;
        z-index: 2;
        min-width: 48px;
        height: 28px;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 999px !important;
        background: rgba(20, 25, 30, 0.68);
        box-shadow: 0 2px 8px rgba(20, 25, 30, 0.2);
        color: #fff;
        font-size: 13px;
        font-weight: 700;
        line-height: 26px;
        pointer-events: none;
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

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-new-style-bottom__like {
        cursor: pointer;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--active,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-new-style-bottom__like.better-link-award--active {
        color: #2775d1;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .content-list__like.better-link-award--loading,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} .bbs-new-style-bottom__like.better-link-award--loading {
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
        transition: opacity 0.14s ease;
        will-change: opacity, transform;
      }

      .${IMAGE_VIEWER_CLASS}.better-image-viewer--loading .better-image-viewer__image {
        opacity: 0.58;
      }

      .${IMAGE_VIEWER_CLASS}.better-image-viewer--loading::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;
        width: 30px;
        height: 30px;
        margin: -15px 0 0 -15px;
        border: 2px solid rgba(255, 255, 255, 0.28);
        border-top-color: #fff;
        border-radius: 50%;
        pointer-events: none;
        animation: better-image-viewer-spin 0.72s linear infinite;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-open {
        animation: better-image-viewer-enter-open 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-prev {
        animation: better-image-viewer-enter-prev 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-next {
        animation: better-image-viewer-enter-next 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      @keyframes better-image-viewer-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes better-image-viewer-enter-open {
        from {
          opacity: 0;
          transform: scale(0.965);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes better-image-viewer-enter-prev {
        from {
          opacity: 0;
          transform: translate3d(-24px, 0, 0) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes better-image-viewer-enter-next {
        from {
          opacity: 0;
          transform: translate3d(24px, 0, 0) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .${IMAGE_VIEWER_CLASS}.better-image-viewer--loading::before {
          display: none;
        }

        .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-open,
        .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-prev,
        .${IMAGE_VIEWER_CLASS} .better-image-viewer__image--enter-next {
          animation: none;
        }
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

      .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__content {
        grid-column: 1;
        min-width: 0;
        width: 100% !important;
        max-width: 100% !important;
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

        .${HOME_LAYOUT_CLASS}.${LINK_DETAIL_LAYOUT_CLASS} .hb-bbs-link__content {
          width: 100% !important;
          max-width: 100% !important;
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

