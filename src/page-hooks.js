(function () {
  const ROUTE_CHANGE_EVENT = "better-xiaoheihe-route-change";

  function notifyRouteChange() {
    window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
  }

  window.addEventListener("popstate", notifyRouteChange);

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    notifyRouteChange();
    return result;
  };

  history.replaceState = function (...args) {
    const result = originalReplaceState.apply(this, args);
    notifyRouteChange();
    return result;
  };
})();
