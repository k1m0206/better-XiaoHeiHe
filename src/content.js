(function () {
  const BBS_PATH_PREFIX = "/app/bbs";
  const LINK_PATH_REGEXP = /^\/app\/bbs\/link\/(\d+)/;
  const RIGHT_CONTENT_SELECTOR = ".hb-layout__content--right";
  const STYLE_ID = "better-xiaoheihe-bbs-layout-style";
  const HOME_LAYOUT_CLASS = "better-xiaoheihe-home-layout";
  const TOP_MENU_CLASS = "better-xiaoheihe-top-menu";
  const TOP_MENU_OPEN_CLASS = "better-xiaoheihe-top-menu--open";
  const TOP_MENU_TOGGLE_CLASS = "better-xiaoheihe-top-menu__toggle";
  const TOP_MENU_PANEL_CLASS = "better-xiaoheihe-top-menu__panel";
  const ROW_CLASS = "better-xiaoheihe-feed-row";
  const PREVIEW_CLASS = "better-xiaoheihe-comment-preview";
  const API_PATH = "/bbs/app/link/tree";
  const API_ORIGIN = "https://api.xiaoheihe.cn";
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
  const capturedApiParams = {};
  let leftMenuOriginalPosition = null;
  let scheduled = false;
  let previewObserver = null;
  let rowResizeObserver = null;

  function isBbsPage() {
    return window.location.hostname === "www.xiaoheihe.cn"
      && window.location.pathname.startsWith(BBS_PATH_PREFIX);
  }

  function isLinkPage() {
    return LINK_PATH_REGEXP.test(window.location.pathname);
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
        width: 100% !important;
        height: 40px !important;
        min-width: 0;
        margin: 0 !important;
        padding: 0 14px !important;
        border-radius: 6px !important;
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

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content {
        box-sizing: border-box !important;
        min-width: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
        overflow: hidden !important;
        border-bottom: 0 !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content * {
        min-width: 0 !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content img,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content video,
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content canvas {
        max-width: 100% !important;
      }

      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="image"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="img"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="media"],
      .${HOME_LAYOUT_CLASS} .${ROW_CLASS} > .hb-cpt__bbs-list-content [class*="picture"] {
        max-width: 100% !important;
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

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__more {
        border: 0;
        background: transparent;
        color: #a8afb7;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
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
        grid-template-columns: 24px minmax(0, 1fr) auto;
        gap: 8px;
        align-items: start;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        background: #eef0f2;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__body {
        min-width: 0;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__name {
        display: inline-flex;
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
        display: inline-block;
        margin-left: 4px;
        padding: 0 3px;
        border-radius: 2px;
        background: #ff4778;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        line-height: 14px;
        vertical-align: top;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__text {
        display: -webkit-box;
        overflow: hidden;
        margin-top: 4px;
        color: #333a42;
        line-height: 1.45;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__time {
        margin-top: 4px;
        color: #a8afb7;
        font-size: 12px;
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
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        word-break: break-word;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__reply-meta {
        margin-top: 3px;
        color: #a8afb7;
      }

      .${HOME_LAYOUT_CLASS} .${PREVIEW_CLASS} .better-comment-preview__up {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #c3c8ce;
        font-size: 12px;
        white-space: nowrap;
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

  function buildApiUrl(linkId) {
    const params = new URLSearchParams({
      ...getBaseApiParams(),
      ...createSignedParams(API_PATH),
      link_id: linkId,
      is_first: "1",
      page: "1",
      index: "1",
      limit: "3",
      owner_only: "0"
    });

    return `https://api.xiaoheihe.cn${API_PATH}?${params.toString().replace("&link_id=", "&h_src&link_id=")}`;
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

  function renderCommentUser(user, isOwner) {
    const level = user.level_info?.level;
    return `
      <span class="better-comment-preview__name">${escapeHtml(user.username || "匿名用户")}</span>
      ${isOwner ? '<span class="better-comment-preview__owner">作者</span>' : ""}
      ${level ? `<span class="better-comment-preview__level">Lv.${escapeHtml(level)}</span>` : ""}
    `;
  }

  function renderCommentMeta(comment) {
    return `
      <span>${escapeHtml(formatCommentTime(comment.create_at))}</span>
      ${comment.ip_location ? `<span class="better-comment-preview__ip">${escapeHtml(comment.ip_location)}</span>` : ""}
    `;
  }

  function renderRootComment(comment) {
    const user = comment.user || {};
    return `
      <div class="better-comment-preview__item">
        <img class="better-comment-preview__avatar" src="${escapeHtml(user.avatar || user.avartar || "")}" alt="">
        <div class="better-comment-preview__body">
          <div>${renderCommentUser(user, comment.is_link_owner === 1)}</div>
          <div class="better-comment-preview__text">${escapeHtml(normalizeCommentText(comment.text))}</div>
          <div class="better-comment-preview__time">${renderCommentMeta(comment)}</div>
        </div>
        <div class="better-comment-preview__up">
          <i class="hb-icon heybox-thumbs-up better-comment-preview__up-icon"></i>
          <span>${escapeHtml(comment.up || 0)}</span>
        </div>
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
        <div class="better-comment-preview__reply-text">${escapeHtml(normalizeCommentText(comment.text))}</div>
        <div class="better-comment-preview__reply-meta">${renderCommentMeta(comment)}</div>
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

  function renderPreview(preview, state) {
    const linkId = preview.dataset.linkId || "";
    const count = state?.commentCount || preview.dataset.commentCount || "0";
    const commentGroups = state?.commentGroups || [];
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
        <button class="better-comment-preview__more" type="button">...</button>
      </div>
      <div class="better-comment-preview__list">
        ${commentGroups.length ? commentGroups.map(renderCommentGroup).join("") : '<div class="better-comment-preview__empty">暂无评论</div>'}
      </div>
      <a class="better-comment-preview__open" href="/app/bbs/link/${escapeHtml(linkId)}">查看全部 ${escapeHtml(count)} 条评论 ›</a>
    `;
    scheduleRowHeightSync(preview.closest(`.${ROW_CLASS}`));
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

    const pending = { commentGroups: [] };
    commentCache.set(linkId, pending);
    renderPreview(preview, pending);

    fetch(buildApiUrl(linkId), {
      credentials: "include",
      headers: {
        accept: "*/*"
      }
    }).then((response) => response.json()).then((data) => {
      const state = data?.status === "ok"
        ? {
          commentGroups: normalizeCommentGroups(data),
          commentCount: data.result?.link?.comment_num || data.result?.total_floor_num
        }
        : { commentGroups: [], failed: true };
      commentCache.set(linkId, state);
      document.querySelectorAll(`.${PREVIEW_CLASS}`).forEach((node) => {
        if (node.dataset.linkId !== linkId) {
          return;
        }

        renderPreview(node, state);
      });
    }).catch(() => {
      const state = { commentGroups: [], failed: true };
      commentCache.set(linkId, state);
      renderPreview(preview, state);
    });
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

  function syncRowHeight(row) {
    if (!row) {
      return;
    }

    const item = row.querySelector(":scope > .hb-cpt__bbs-list-content");
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

  function enhanceFeedItem(item) {
    if (item.closest(`.${ROW_CLASS}`)) {
      return;
    }

    const linkId = getLinkIdFromItem(item);
    if (!linkId) {
      return;
    }

    const row = document.createElement("div");
    row.className = ROW_CLASS;

    const preview = document.createElement("aside");
    preview.className = PREVIEW_CLASS;
    preview.dataset.linkId = linkId;
    preview.dataset.commentCount = getCommentCountFromItem(item);

    item.parentNode.insertBefore(row, item);
    row.appendChild(item);
    row.appendChild(preview);
    renderPreview(preview, null);
    observeRowHeight(row, item);
    observePreview(preview);
  }

  function enhanceHomeFeed() {
    document.querySelectorAll("a.hb-cpt__bbs-list-content.bbs-home__content-item").forEach(enhanceFeedItem);
  }

  function getTopMenuMountPoint() {
    return document.querySelector(".hb-view-header .view-header__right")
      || document.querySelector(".hb-view-header .hb-layout-main__container--main")
      || null;
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
        const isOpen = topMenu.classList.toggle(TOP_MENU_OPEN_CLASS);
        toggle.setAttribute("aria-expanded", String(isOpen));
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

    if (leftMenu && leftMenuOriginalPosition?.parent?.isConnected) {
      leftMenuOriginalPosition.parent.insertBefore(
        leftMenu,
        leftMenuOriginalPosition.nextSibling?.isConnected ? leftMenuOriginalPosition.nextSibling : null
      );
    }

    removeDuplicateTopMenus(null);
  }

  function handlePage() {
    if (!isBbsPage()) {
      restoreLeftMenu();
      return;
    }

    injectLayoutStyle();

    if (isLinkPage()) {
      document.documentElement.classList.remove(HOME_LAYOUT_CLASS);
      restoreLeftMenu();
      return;
    }

    document.documentElement.classList.add(HOME_LAYOUT_CLASS);
    moveLeftMenuToTop();
    removeRightContent();
    enhanceHomeFeed();
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
