// 页面 Cookie、接口参数捕获和请求上下文。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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

