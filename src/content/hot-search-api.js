// 搜索热榜读取、渲染和侧栏迁移。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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
      ensureHotSearchPermanentCloseButton(panel);
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
    ensureHotSearchPermanentCloseButton(panel);
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
    ensureHotSearchPermanentCloseButton(panel);

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
        ensureHotSearchPermanentCloseButton(panel);
      });
  }

  function moveSearchHotListToLeftSidebar() {
    if (hotSearchDisabled || (!isSearchPage() && !isCommunityHomePage())) {
      removeHotSearchSidebar();
      return;
    }

    const sidebar = ensureHotSearchSidebar();
    if (!sidebar) {
      return;
    }
    const panel = sidebar.querySelector(`.${HOT_SEARCH_SIDEBAR_PANEL_CLASS}`);
    if (!panel) {
      return;
    }

    const hotSearch = findSearchHotList();
    if (hotSearch && panel.contains(hotSearch)) {
      ensureHotSearchPermanentCloseButton(panel);
      return;
    }

    if (hotSearch && hotSearch.parentElement !== panel) {
      panel.dataset.betterHotSearchFallback = "";
      panel.replaceChildren();
      panel.appendChild(hotSearch);
      ensureHotSearchPermanentCloseButton(panel);
      return;
    }

    renderHotSearchFallback(panel);
  }

