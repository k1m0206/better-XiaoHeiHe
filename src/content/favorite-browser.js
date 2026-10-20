// 收藏帖子列表、分页与搜索。
// 本文件由 scripts/build-source-bundles.ps1 拼入 src/content.js，请勿直接修改生成文件。
  // ---------------------------------------------------------------------------
  // 收藏夹适配层
  //
  // 已知事实：项目里唯一有证据的收藏接口是 FAVOUR_LIST_API_PATH（/bbs/web/profile/favours），
  // 现有实现只从中读取帖子数组，仓库内没有任何“收藏夹分组”响应样本。
  // 因此这里不猜测请求参数、也不把帖子伪造成多个分组：
  //   1. 若响应里真的出现了收藏夹数组，就按下面这组候选键名读取分组；
  //   2. 若响应里没有分组信息，就退回到唯一的“全部收藏”分组，并在弹层里说明原因；
  //   3. 需要接入真实分组接口时，只要替换 loadFavoriteFolders()/loadFavoriteItems() 即可。
  // ---------------------------------------------------------------------------
  const FAVORITE_FOLDER_CONTAINER_KEYS = [
    "folders",
    "folder_list",
    "favour_folders",
    "favourite_folders",
    "favour_tags",
    "favourite_tags",
    "groups",
    "group_list",
    "collections",
    "collection_list",
    "categories",
    "cate",
    "tags"
  ];
  const FAVORITE_FOLDER_FIELD_KEYS = {
    id: [
      "id",
      "folder_id",
      "folderid",
      "group_id",
      "groupid",
      "tag_id",
      "tagid",
      "favour_id",
      "favourite_id",
      "collection_id",
      "cate_id",
      "cid"
    ],
    name: [
      "name",
      "title",
      "folder_name",
      "group_name",
      "tag_name",
      "favour_name",
      "favourite_name",
      "collection_name",
      "cate_name",
      "label"
    ],
    count: [
      "count",
      "num",
      "link_num",
      "link_count",
      "total",
      "total_count",
      "favour_num",
      "item_count"
    ]
  };

  function readFirstScalarField(source, keys) {
    if (!source || typeof source !== "object") {
      return "";
    }

    for (const key of keys) {
      const value = source[key];
      if (value === undefined || value === null || value === "" || typeof value === "object" || typeof value === "boolean") {
        continue;
      }
      const text = String(value).trim();
      if (text) {
        return text;
      }
    }

    return "";
  }

  function readFirstNumberField(source, keys) {
    if (!source || typeof source !== "object") {
      return 0;
    }

    for (const key of keys) {
      const value = Number(source[key]);
      if (Number.isFinite(value) && value >= 0) {
        return value;
      }
    }

    return 0;
  }

  function getFavouritePostLinkId(item) {
    return String(item?.linkid || item?.link_id || item?.id || item?.link?.linkid || item?.link?.id || "").trim();
  }

  function getFavouritePostAuthor(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    return String(
      item?.username
      || item?.user_name
      || item?.nickname
      || item?.link_user
      || item?.author_name
      || item?.link_user_name
      || author?.username
      || author?.user_name
      || author?.nickname
      || author?.name
      || ""
    ).trim();
  }

  function getFavouritePostAuthorId(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    return String(
      getUserProfileId(author)
      || item?.userid
      || item?.user_id
      || item?.author_id
      || item?.link_user_id
      || ""
    ).trim();
  }

  function getFavouritePostAuthorAvatar(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    return String(
      item?.avatar
      || item?.avartar
      || item?.author_avatar
      || item?.link_user_avatar
      || author?.avatar
      || author?.avartar
      || author?.avatar_url
      || author?.avatarUrl
      || ""
    ).trim();
  }

  function getFavouritePostAuthorLevel(item) {
    const author = item?.user || item?.author || item?.link_user || item?.link?.user || item?.link?.author || {};
    const level = normalizeUserLevel(
      item?.level
      || item?.user_level
      || item?.author_level
      || item?.link_user_level
      || author?.level_info?.level
      || author?.level
      || author?.user_level
      || ""
    );
    return level ? `Lv.${level}` : "";
  }

  function getFavoriteItemFolderRef(raw) {
    const nested = [raw?.folder, raw?.group, raw?.collection, raw?.cate]
      .find((value) => value && typeof value === "object" && !Array.isArray(value));
    return {
      id: readFirstScalarField(nested, FAVORITE_FOLDER_FIELD_KEYS.id)
        || readFirstScalarField(raw, ["folder_id", "folderid", "group_id", "groupid", "favour_id", "favourite_id", "collection_id", "cate_id"]),
      name: readFirstScalarField(nested, FAVORITE_FOLDER_FIELD_KEYS.name)
        || readFirstScalarField(raw, ["folder_name", "group_name", "favour_name", "favourite_name", "collection_name", "cate_name"])
    };
  }

  function normalizeFavoriteItem(raw) {
    const id = getFavouritePostLinkId(raw);
    if (!id || !LINK_ID_REGEXP.test(id)) {
      return null;
    }

    const folderRef = getFavoriteItemFolderRef(raw);
    const topic = Array.isArray(raw?.topics) ? raw.topics[0] : raw?.topic;
    const author = getFavouritePostAuthor(raw);
    const images = Array.isArray(raw?.imgs) ? raw.imgs.filter(Boolean) : [];
    const thumbnails = Array.isArray(raw?.thumbs) ? raw.thumbs.filter(Boolean) : [];
    return {
      id,
      folderId: folderRef.id,
      folderName: folderRef.name,
      title: truncateText(String(raw?.title || raw?.link?.title || "").trim(), 120),
      description: truncateText(stripMessageHtml(raw?.description || raw?.desc || raw?.link?.description || ""), 160),
      author: truncateText(author, 40),
      authorId: getFavouritePostAuthorId(raw),
      authorAvatar: getFavouritePostAuthorAvatar(raw),
      authorAvatarFallback: Array.from(author || "作")[0] || "作",
      authorLevel: getFavouritePostAuthorLevel(raw),
      topicName: truncateText(String(topic?.name || ""), 40),
      topicIcon: String(topic?.pic_url || topic?.icon || ""),
      thumbnailUrl: String(thumbnails[0] || images[0] || ""),
      imageCount: Math.max(thumbnails.length, images.length),
      imageUrls: images.length ? images : thumbnails,
      timestamp: Number(raw?.create_at || raw?.created_at || raw?.time || 0) || 0,
      awardCount: Number(raw?.link_award_num || raw?.up || raw?.support_num || 0) || 0,
      commentCount: Number(raw?.comment_num || raw?.reply_num || 0) || 0,
      schemaVersion: FAVORITE_SCHEMA_VERSION
    };
  }

  // 判断一个对象是否“像帖子”。注意不能用通用的 id 字段判断，
  // 因为收藏夹自身也可能带 id，而帖子一定带 linkid 或 user/评论数等字段。
  function looksLikeFavoritePost(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return false;
    }
    return Boolean(
      raw.linkid
      || raw.link_id
      || raw.link?.linkid
      || raw.link?.id
      || raw.user
      || raw.link_user
      || raw.comment_num
      || raw.link_award_num
      || (raw.link && typeof raw.link === "object")
    );
  }

  function looksLikeFavoriteFolder(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return false;
    }
    if (looksLikeFavoritePost(raw)) {
      return false;
    }
    return Boolean(
      readFirstScalarField(raw, FAVORITE_FOLDER_FIELD_KEYS.id)
      && readFirstScalarField(raw, FAVORITE_FOLDER_FIELD_KEYS.name)
    );
  }

  function normalizeFavoriteFolder(raw, index = 0) {
    if (!looksLikeFavoriteFolder(raw)) {
      return null;
    }

    return {
      id: readFirstScalarField(raw, FAVORITE_FOLDER_FIELD_KEYS.id),
      name: truncateText(readFirstScalarField(raw, FAVORITE_FOLDER_FIELD_KEYS.name), 40),
      count: readFirstNumberField(raw, FAVORITE_FOLDER_FIELD_KEYS.count),
      sortIndex: Math.max(0, Number(index) || 0),
      source: "server",
      schemaVersion: FAVORITE_SCHEMA_VERSION
    };
  }

  // 从收藏响应里找出真正的收藏夹数组；找不到时返回空数组（调用方会退回“全部收藏”）。
  function detectFavoriteFoldersFromPayload(data) {
    const roots = [data?.result, data?.result?.data, data?.data]
      .filter((root) => root && typeof root === "object" && !Array.isArray(root));
    const seenIds = new Set();
    const folders = [];

    const collect = (list) => {
      if (!Array.isArray(list) || !list.length || !list.every((item) => looksLikeFavoriteFolder(item))) {
        return false;
      }
      list.forEach((item) => {
        const folder = normalizeFavoriteFolder(item, folders.length);
        if (!folder || seenIds.has(folder.id)) {
          return;
        }
        seenIds.add(folder.id);
        folders.push(folder);
      });
      return true;
    };

    for (const root of roots) {
      for (const key of FAVORITE_FOLDER_CONTAINER_KEYS) {
        if (collect(root[key])) {
          return folders;
        }
      }
      for (const value of Object.values(root)) {
        if (Array.isArray(value) && collect(value)) {
          return folders;
        }
      }
    }

    return folders;
  }

  function buildFavoriteFolderList(items, serverFolders, total) {
    const folders = Array.isArray(serverFolders) ? serverFolders : [];
    return [
      {
        id: FAVORITE_ALL_FOLDER_ID,
        name: "全部收藏",
        count: Math.max(Number(total) || 0, favoriteItemStore.items.length),
        sortIndex: 0,
        source: "virtual",
        schemaVersion: FAVORITE_SCHEMA_VERSION
      },
      ...folders
    ];
  }

  function fetchFavoritePage(options = {}) {
    const limit = Math.max(1, Number(options.limit) || FAVORITE_PAGE_LIMIT);
    return runAfterIdentityCookiesRestored(() => fetch(buildFavourListApiUrl({
      offset: Math.max(0, Number(options.offset) || 0),
      limit
    }), {
      credentials: "include",
      headers: {
        accept: "application/json"
      }
    })).then((response) => {
      if (!response.ok) {
        throw new Error(`收藏查询失败（HTTP ${response.status}）`);
      }
      return response.json();
    }).then((data) => {
      if (data?.status !== "ok") {
        throw new Error(data?.message || data?.msg || data?.error || "收藏查询失败");
      }
      const rawItems = data?.result?.links || data?.result?.list || data?.result || data?.links || [];
      const list = Array.isArray(rawItems) ? rawItems : [];
      return {
        items: list.map((item) => normalizeFavoriteItem(item)).filter(Boolean),
        rawCount: list.length,
        folders: detectFavoriteFoldersFromPayload(data),
        hasMore: list.length >= limit,
        total: readFirstNumberField(data?.result, ["total", "count", "link_num", "total_count"])
      };
    });
  }

  function loadFavoriteFolders(options = {}) {
    if (favoriteFoldersCache && options.force !== true) {
      return Promise.resolve(favoriteFoldersCache);
    }

    return fetchFavoritePage({ offset: 0, limit: FAVORITE_PAGE_LIMIT }).then((page) => {
      if (!favoriteItemStore.complete) {
        mergeFavoriteItems(page.items);
        favoriteItemStore.offset = Math.max(favoriteItemStore.offset, page.rawCount);
        if (!page.hasMore || !page.rawCount || !page.items.length) {
          favoriteItemStore.complete = true;
        }
      }
      const folders = buildFavoriteFolderList(page.items, page.folders, page.total);
      favoriteFoldersCache = folders;
      return folders;
    });
  }

  function mergeFavoriteItems(items) {
    const seen = new Set(favoriteItemStore.items.map((item) => item.id));
    (Array.isArray(items) ? items : []).forEach((item) => {
      if (!item || seen.has(item.id)) {
        return;
      }
      seen.add(item.id);
      favoriteItemStore.items.push(item);
    });

    if (favoriteItemStore.items.length >= FAVORITE_MAX_ITEMS) {
      // 达到本地缓存上限后不再翻页，搜索范围以已缓存的帖子为准。
      favoriteItemStore.items = favoriteItemStore.items.slice(0, FAVORITE_MAX_ITEMS);
      favoriteItemStore.complete = true;
    }
  }

  function ensureAllFavoriteItems() {
    if (favoriteItemStore.complete) {
      return Promise.resolve(favoriteItemStore);
    }
    if (favoriteInitialItemsPromise) {
      return favoriteInitialItemsPromise.then(() => ensureAllFavoriteItems());
    }
    if (favoriteAllItemsPromise) {
      return favoriteAllItemsPromise;
    }

    favoriteItemStore.loading = true;
    favoriteAllItemsPromise = Promise.resolve().then(async () => {
      try {
        for (let page = 0; page < FAVORITE_MAX_PAGES; page += 1) {
          if (favoriteItemStore.complete) {
            break;
          }
          const payload = await fetchFavoritePage({
            offset: favoriteItemStore.offset,
            limit: FAVORITE_PAGE_LIMIT
          });
          mergeFavoriteItems(payload.items);
          favoriteItemStore.offset += payload.rawCount;
          if (!payload.hasMore || !payload.items.length) {
            favoriteItemStore.complete = true;
            break;
          }
        }
      } finally {
        favoriteItemStore.loading = false;
        favoriteAllItemsPromise = null;
      }
      return favoriteItemStore;
    });

    return favoriteAllItemsPromise;
  }

  function loadFavoriteItemsThroughPage(pageCount) {
    if (favoriteInitialItemsPromise) {
      return favoriteInitialItemsPromise;
    }

    const targetOffset = Math.max(1, Number(pageCount) || 1) * FAVORITE_PAGE_LIMIT;
    favoriteItemStore.loading = true;
    favoriteInitialItemsPromise = Promise.resolve().then(async () => {
      while (!favoriteItemStore.complete && favoriteItemStore.offset < targetOffset) {
        const payload = await fetchFavoritePage({
          offset: favoriteItemStore.offset,
          limit: FAVORITE_PAGE_LIMIT
        });
        mergeFavoriteItems(payload.items);
        favoriteItemStore.offset += payload.rawCount;
        if (!payload.hasMore || !payload.rawCount || !payload.items.length) {
          favoriteItemStore.complete = true;
          break;
        }
        favoriteBrowserState.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
        favoriteBrowserState.hasMore = !favoriteItemStore.complete;
        if (!favoriteBrowserState.query) {
          renderFavoriteList();
        }
      }
      return favoriteItemStore;
    }).finally(() => {
      favoriteItemStore.loading = false;
      favoriteInitialItemsPromise = null;
    });

    return favoriteInitialItemsPromise;
  }

  function getFavoriteFolderItems(folderId) {
    if (!folderId || folderId === FAVORITE_ALL_FOLDER_ID) {
      return favoriteItemStore.items.slice();
    }
    return favoriteItemStore.items.filter((item) => item.folderId === folderId);
  }

  // 读取某个收藏夹下的全部帖子（必要时补全分页），供搜索使用。
  function loadFavoriteItems(folderId = FAVORITE_ALL_FOLDER_ID) {
    return ensureAllFavoriteItems().then(() => getFavoriteFolderItems(folderId));
  }

  function rankFavoriteSearchResults(items, keywords) {
    const scored = [];
    (Array.isArray(items) ? items : []).forEach((item, index) => {
      const titleText = normalizeSearchText(item.title);
      const haystack = [item.title, item.description, item.author, item.topicName].join(" ");
      if (!matchesSearchKeywords(haystack, keywords)) {
        return;
      }
      scored.push({
        item,
        index,
        titleHits: keywords.filter((keyword) => titleText.includes(keyword)).length
      });
    });

    return scored
      .sort((left, right) => (right.titleHits - left.titleHits) || (left.index - right.index))
      .map((entry) => entry.item);
  }

  // 在收藏夹内做本地模糊搜索：先补全分页，避免因为分页未加载而漏掉结果。
  function searchFavoriteItems(folderId, query) {
    const keywords = splitSearchKeywords(query);
    return loadFavoriteItems(folderId).then((items) => {
      if (!keywords.length) {
        return items;
      }
      return rankFavoriteSearchResults(items, keywords);
    });
  }

  // ---------------------------------------------------------------------------
  // 列表渲染
  // ---------------------------------------------------------------------------
  function renderPostBrowserItem(item, options = {}) {
    const openTarget = options.openTarget === "history" ? "history" : "favorite";
    const animateIndex = Number.isFinite(options.animateIndex) ? options.animateIndex : -1;
    const author = item.author || "";
    const avatar = item.authorAvatar || "";
    const fallback = item.authorAvatarFallback || Array.from(author || "作")[0] || "作";
    const title = item.title || "未命名帖子";
    return `
      <a class="better-message-popover__item better-post-browser__item${animateIndex >= 0 ? " better-message-popover__item--enter" : ""}"
        href="/app/bbs/link/${escapeHtml(item.id)}"
        target="_blank"
        rel="noopener noreferrer"
        data-better-open-new-tab="${openTarget}"
        title="${escapeHtml(title)}"${animateIndex >= 0 ? ` style="--better-popover-enter-index: ${Math.min(animateIndex, 8)}"` : ""}>
        <div class="better-message-popover__context">
          ${author ? `
            <div class="better-favorite-popover__author">
              ${avatar
                ? `<img class="better-favorite-popover__author-avatar" src="${escapeHtml(avatar)}" alt=""${renderHeaderProfileAttributes(item.authorId)}>`
                : `<span class="better-favorite-popover__author-avatar"${renderHeaderProfileAttributes(item.authorId)}>${escapeHtml(fallback)}</span>`}
              <span class="better-favorite-popover__author-name"${renderHeaderProfileAttributes(item.authorId)}>${escapeHtml(author)}</span>
              ${renderUserLevel(item.authorLevel)}
            </div>
          ` : ""}
          <div class="better-message-popover__post-content-row">
            <div class="better-message-popover__post-copy">
              <span class="better-message-popover__link-title">${renderEmojiTokensInHtml(escapeHtml(title))}</span>
              ${item.description ? `<span class="better-message-popover__link-desc">${renderEmojiTokensInHtml(escapeHtml(item.description))}</span>` : ""}
            </div>
            ${item.thumbnailUrl ? `
              <span class="better-message-popover__post-thumbnail"${renderHeaderImageViewerAttributes(item.imageUrls, 0, `查看帖子图片，共 ${Math.max(1, item.imageCount)} 张`)}>
                <img src="${escapeHtml(item.thumbnailUrl)}" alt="" loading="lazy" decoding="async">
                ${item.imageCount > 1 ? `<span class="better-message-popover__post-image-count">+${escapeHtml(item.imageCount - 1)}</span>` : ""}
              </span>
            ` : ""}
          </div>
          <div class="better-message-popover__media-row">${options.metaHtml || ""}</div>
        </div>
      </a>
    `;
  }

  function renderFavoriteItemMeta(item) {
    return `
      ${item.timestamp ? `<span class="better-favorite-popover__meta">${escapeHtml(formatCommentTime(item.timestamp))}</span>` : ""}
      <span class="better-favorite-popover__meta better-favorite-popover__stat" aria-label="点赞 ${escapeHtml(item.awardCount)}">
        <svg class="better-favorite-popover__stat-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 21h4V9H2v12Zm19.5-11.8c-.2-.7-.8-1.2-1.6-1.2h-5.7l.9-4.1v-.3c0-.4-.2-.8-.5-1.1L13.6 1 7 7.6V19c0 1.1.9 2 2 2h8.4c.8 0 1.5-.5 1.8-1.2l3-7.1c.1-.2.1-.5.1-.7v-1.1c0-.6-.3-1.2-.8-1.7Z"></path>
        </svg>
        ${escapeHtml(item.awardCount)}
      </span>
      <span class="better-favorite-popover__meta better-favorite-popover__stat" aria-label="评论 ${escapeHtml(item.commentCount)}">
        <svg class="better-favorite-popover__stat-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h1v3a1 1 0 0 0 1.6.8l5.07-3.8H19a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3Z"></path>
        </svg>
        ${escapeHtml(item.commentCount)}
      </span>
      ${renderPostBrowserTopic(item)}
    `;
  }

  function renderPostBrowserTopic(item) {
    if (!item.topicName && !item.topicIcon) {
      return "";
    }
    return `
      <span class="better-message-popover__topic" title="${escapeHtml(item.topicName || "帖子话题")}" aria-label="${escapeHtml(item.topicName || "帖子话题")}">
        ${item.topicIcon ? `<img class="better-message-popover__topic-icon" src="${escapeHtml(item.topicIcon)}" alt="">` : ""}
        ${escapeHtml(item.topicName || "")}
      </span>
    `;
  }

  function renderFavoriteStateCard(message, options = {}) {
    return `
      <div class="better-favorite-browser__state-card">
        <p class="better-favorite-browser__state-text">${escapeHtml(message)}</p>
        ${options.hint ? `<p class="better-favorite-browser__state-hint">${escapeHtml(options.hint)}</p>` : ""}
        ${options.retry ? `<button type="button" class="better-favorite-browser__retry" data-favorite-retry="1">重试</button>` : ""}
      </div>
    `;
  }

  // 标签模型：内容 / 收藏夹 / CY。
  // 未来若服务端返回自定义标签，只改这里，DOM 与交互不用动。
  let favoriteTabsRuntime = FAVORITE_TABS.slice();

  function loadFavoriteTabs() {
    return Promise.resolve(FAVORITE_TABS.slice());
  }

  function getFavoriteFolderById(folderId) {
    return (favoriteBrowserState.folders || []).find((folder) => folder.id === folderId) || null;
  }

  function getFavoriteFolderCount(folder) {
    const localCount = folder?.id ? getFavoriteFolderItems(folder.id).length : 0;
    return Math.max(Number(folder?.count) || 0, localCount);
  }

  // 分夹封面：优先用分夹自带封面，其次从已缓存的帖子里取前 3 张缩略图。
  function getFavoriteFolderCoverUrls(folder) {
    if (!folder?.id) {
      return [];
    }
    if (Array.isArray(folder.coverUrls) && folder.coverUrls.length) {
      return folder.coverUrls.filter(Boolean).slice(0, FAVORITE_FOLDER_COVER_LIMIT);
    }

    const urls = [];
    getFavoriteFolderItems(folder.id).some((item) => {
      const url = item?.thumbnailUrl;
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
      return urls.length >= FAVORITE_FOLDER_COVER_LIMIT;
    });
    return urls;
  }

  function renderFavoriteTabs() {
    const activeTab = favoriteBrowserState.tab;
    return `
      <div class="better-favorite-browser__tabs" role="tablist" aria-label="收藏分类">
        ${favoriteTabsRuntime.map((tab) => `
          <button type="button" role="tab"
            class="better-favorite-browser__tab${tab.id === activeTab ? " is-active" : ""}"
            data-favorite-tab="${escapeHtml(tab.id)}"
            aria-selected="${tab.id === activeTab ? "true" : "false"}">${escapeHtml(tab.label)}</button>
        `).join("")}
      </div>
    `;
  }

  function renderFavoriteSearchBox(placeholder) {
    const state = favoriteBrowserState;
    return `
      <div class="better-favorite-browser__search">
        <input class="better-favorite-browser__search-input" type="search" data-favorite-search="1"
          placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}" autocomplete="off" spellcheck="false"
          value="${escapeHtml(state.query)}">
        <button type="button" class="better-favorite-browser__search-clear" data-favorite-search-clear="1" aria-label="清除搜索"${state.query ? "" : " hidden"}>×</button>
      </div>
    `;
  }

  function renderFavoritePane() {
    const state = favoriteBrowserState;
    if (state.tab === FAVORITE_TAB_IDS.CONTENT) {
      return renderFavoriteSearchBox("搜索收藏内容");
    }
    if (state.tab === FAVORITE_TAB_IDS.FOLDERS && state.folderView === "items") {
      return `
        <div class="better-favorite-browser__breadcrumb">
          <button type="button" class="better-favorite-browser__back" data-favorite-back="1" aria-label="返回收藏夹列表">← 返回</button>
          <span class="better-favorite-browser__breadcrumb-name" title="${escapeHtml(state.folderName || "全部收藏")}">${escapeHtml(state.folderName || "全部收藏")}</span>
          <span class="better-favorite-browser__breadcrumb-count" data-favorite-count>${state.items.length ? `${state.items.length} 篇` : ""}</span>
        </div>
        ${renderFavoriteSearchBox("搜索当前收藏夹")}
      `;
    }
    return "";
  }

  function renderFavoriteFolderCard(folder) {
    const count = getFavoriteFolderCount(folder);
    const countLabel = `${count} 篇内容`;
    const covers = getFavoriteFolderCoverUrls(folder);
    return `
      <button type="button" class="better-favorite-browser__folder-card" role="listitem"
        data-favorite-folder-id="${escapeHtml(folder.id)}"
        data-favorite-folder-name="${escapeHtml(folder.name)}"
        aria-label="${escapeHtml(`打开收藏夹 ${folder.name}，${countLabel}`)}">
        <span class="better-favorite-browser__folder-row">
          <span class="better-favorite-browser__folder-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h3.6c.7 0 1.3.3 1.8.8L12.3 6H19a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 19 20H5.5A2.5 2.5 0 0 1 3 17.5v-11Z"></path>
            </svg>
          </span>
          <span class="better-favorite-browser__folder-text">
            <span class="better-favorite-browser__folder-name">${escapeHtml(folder.name)}</span>
            <span class="better-favorite-browser__folder-count">${escapeHtml(countLabel)}</span>
          </span>
          <span class="better-favorite-browser__folder-arrow" aria-hidden="true">›</span>
        </span>
        ${covers.length ? `
          <span class="better-favorite-browser__folder-covers" aria-hidden="true">
            ${covers.map((url) => `<img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async">`).join("")}
          </span>
        ` : ""}
      </button>
    `;
  }

  function renderCreateFavoriteFolderDialog() {
    const state = favoriteBrowserState;
    if (!state.dialogOpen) {
      return "";
    }

    return `
      <div class="better-favorite-browser__dialog-mask" data-favorite-dialog-mask="1">
        <div class="better-favorite-browser__dialog" role="dialog" aria-modal="true" aria-label="新建收藏夹">
          <h3 class="better-favorite-browser__dialog-title">新建收藏夹</h3>
          <input class="better-favorite-browser__dialog-input" type="text" data-favorite-dialog-input="1"
            maxlength="${FAVORITE_FOLDER_NAME_MAX_LENGTH}" placeholder="输入收藏夹名称" aria-label="收藏夹名称"
            autocomplete="off" spellcheck="false" value="${escapeHtml(state.dialogName || "")}">
          <p class="better-favorite-browser__dialog-hint">名称 1～${FAVORITE_FOLDER_NAME_MAX_LENGTH} 个字符，不能与已有收藏夹重名。</p>
          <p class="better-favorite-browser__dialog-error" data-favorite-dialog-error${state.dialogError ? "" : " hidden"}>${escapeHtml(state.dialogError || "")}</p>
          <div class="better-favorite-browser__dialog-actions">
            <button type="button" class="better-favorite-browser__dialog-cancel" data-favorite-dialog-cancel="1">取消</button>
            <button type="button" class="better-favorite-browser__dialog-submit" data-favorite-dialog-submit="1"${state.dialogSubmitting ? " disabled" : ""}>${state.dialogSubmitting ? "创建中…" : "创建"}</button>
          </div>
          <button type="button" class="better-favorite-browser__dialog-site" data-favorite-open-site="1"${state.dialogUnsupported ? "" : " hidden"}>去小黑盒收藏页新建</button>
        </div>
      </div>
    `;
  }

  function renderFavoriteFoldersDirectory() {
    const state = favoriteBrowserState;
    const folders = state.folders || [];
    if (state.foldersLoading && !folders.length) {
      return renderHeaderPopoverLoading("正在加载收藏夹");
    }
    if (state.error && !folders.length) {
      return renderFavoriteStateCard(state.error, { retry: true });
    }

    const serverFolders = folders.filter((folder) => folder.source === "server");
    // “全部收藏”始终排在最前；接口没有返回分夹时它就是唯一入口，并明确说明原因。
    const listFolders = folders;
    return `
      ${serverFolders.length ? "" : '<p class="better-favorite-browser__notice">当前收藏接口没有返回分夹数据，暂时只能从“全部收藏”浏览。</p>'}
      <div class="better-favorite-browser__folder-list" role="list">
        ${listFolders.map(renderFavoriteFolderCard).join("")}
      </div>
      <button type="button" class="better-favorite-browser__create-button" data-favorite-create="1">
        <span class="better-favorite-browser__create-icon" aria-hidden="true">＋</span>
        <span>新建收藏夹</span>
      </button>
      ${renderCreateFavoriteFolderDialog()}
    `;
  }

  function renderFavoriteCyContent() {
    const cy = favoriteBrowserState.cy;
    if (cy.loading && !cy.loaded) {
      return renderHeaderPopoverLoading("正在加载 CY 收藏");
    }
    if (cy.error) {
      return renderFavoriteStateCard(cy.error, { retry: true });
    }
    if (cy.unsupported) {
      return renderFavoriteStateCard("当前网页版暂不提供 CY 收藏数据", {
        hint: "为避免把普通收藏当成 CY 内容，这里不展示任何替代数据。"
      });
    }
    if (!cy.items.length) {
      return renderFavoriteStateCard("暂时没有 CY 内容");
    }
    return cy.items.map((item, index) => renderPostBrowserItem(item, {
      openTarget: "favorite",
      animateIndex: index,
      metaHtml: renderFavoriteItemMeta(item)
    })).join("");
  }

  function renderFavoritePostsList(options = {}) {
    const state = favoriteBrowserState;
    if (state.error && !state.items.length) {
      return renderFavoriteStateCard(state.error, { retry: true });
    }
    if (state.searching && !state.items.length) {
      return renderHeaderPopoverLoading("正在搜索收藏");
    }
    if (state.loading && !state.items.length) {
      return renderHeaderPopoverLoading("正在加载收藏");
    }
    if (!state.items.length) {
      if (state.query) {
        return renderFavoriteStateCard("没有匹配内容", { hint: "试试更短的关键词，或切换到其他分类。" });
      }
      if (state.tab === FAVORITE_TAB_IDS.FOLDERS) {
        return renderFavoriteStateCard("这个收藏夹还没有帖子");
      }
      return renderFavoriteStateCard("暂时没有收藏内容", { hint: "在帖子里点击收藏后就会出现在这里。" });
    }

    const animateFrom = Number.isFinite(options.animateFrom) ? Math.max(0, options.animateFrom) : state.items.length;
    return state.items.map((item, index) => renderPostBrowserItem(item, {
      openTarget: "favorite",
      animateIndex: index >= animateFrom ? index - animateFrom : -1,
      metaHtml: renderFavoriteItemMeta(item)
    })).join("");
  }

  function renderFavoriteFooterText() {
    const state = favoriteBrowserState;
    if (state.tab === FAVORITE_TAB_IDS.CY) {
      if (state.cy.loading) {
        return "正在加载 CY 收藏";
      }
      return state.cy.unsupported ? "CY 数据不可用" : (state.cy.items.length ? `共 ${state.cy.items.length} 条` : "");
    }
    if (state.tab === FAVORITE_TAB_IDS.FOLDERS && state.folderView === "list") {
      return state.foldersLoading ? "正在加载收藏夹" : "";
    }
    if (state.error && state.items.length) {
      return "加载失败，继续下滑可重试";
    }
    if (state.searching) {
      return "正在搜索…";
    }
    if (state.loading) {
      return "正在加载更多…";
    }
    if (state.query) {
      return `共 ${state.items.length} 条匹配结果`;
    }
    if (state.hasMore) {
      return "继续下滑加载更多";
    }
    return state.items.length ? "没有更多收藏了" : "";
  }

  function syncFavoriteDialogFocus() {
    const state = favoriteBrowserState;
    if (!state.dialogFocusPending) {
      return;
    }
    const input = ensureFavoritePopover()?.querySelector("[data-favorite-dialog-input]");
    state.dialogFocusPending = false;
    input?.focus();
  }

  function renderFavoriteList(options = {}) {
    const popover = ensureFavoritePopover();
    const state = favoriteBrowserState;
    const list = popover?.querySelector("[data-favorite-list]");
    const footer = popover?.querySelector("[data-favorite-footer]");
    const countNode = popover?.querySelector("[data-favorite-count]");
    const clearButton = popover?.querySelector("[data-favorite-search-clear]");
    if (clearButton) {
      clearButton.hidden = !state.query;
    }
    if (countNode) {
      countNode.textContent = state.items.length ? `${state.items.length} 篇` : "";
    }
    if (!list) {
      return;
    }

    list.innerHTML = renderFavoritePostsList(options);

    if (footer) {
      footer.textContent = renderFavoriteFooterText();
    }
    syncFavoriteDialogFocus();
  }

  function renderFavoriteBrowser() {
    const popover = ensureFavoritePopover();
    const body = popover?.querySelector(".better-message-popover__body");
    if (!body) {
      return;
    }

    body.innerHTML = `
      <div class="better-favorite-browser__head">
        <div class="better-favorite-browser__pane" data-favorite-pane>${renderFavoriteSearchBox("搜索收藏内容")}</div>
      </div>
      <div class="better-favorite-browser__list" data-favorite-list role="list"></div>
      <div class="better-message-popover__footer-state" data-favorite-footer></div>
    `;
    renderFavoriteList();
  }

  // ---------------------------------------------------------------------------
  // 交互
  // ---------------------------------------------------------------------------
  function getFavoriteBody() {
    return ensureFavoritePopover()?.querySelector(".better-message-popover__body") || null;
  }

  // 收藏夹目录的滚动位置：进入分夹再返回时要还原。
  function saveFavoriteScrollTop() {
    const body = getFavoriteBody();
    if (!body) {
      return;
    }
    if (favoriteBrowserState.tab === FAVORITE_TAB_IDS.FOLDERS && favoriteBrowserState.folderView === "list") {
      favoriteBrowserState.foldersScrollTop = body.scrollTop;
    }
  }

  function setFavoriteScrollTop(top) {
    const body = getFavoriteBody();
    if (!body) {
      return;
    }
    body.scrollTop = Math.max(0, Number(top) || 0);
  }

  function resetFavoriteDialogState() {
    const state = favoriteBrowserState;
    state.dialogOpen = false;
    state.dialogName = "";
    state.dialogError = "";
    state.dialogSubmitting = false;
    state.dialogUnsupported = false;
    state.dialogFocusPending = false;
  }

  function openFavoriteBrowser() {
    const state = favoriteBrowserState;
    window.clearTimeout(favoriteSearchTimer);
    resetFavoriteDialogState();
    state.tab = FAVORITE_TAB_IDS.CONTENT;
    state.folderView = "list";
    state.folderId = "";
    state.folderName = "";
    state.query = "";
    state.items = [];
    state.error = "";
    state.searching = false;
    state.folders = favoriteFoldersCache ? favoriteFoldersCache.slice() : [];
    state.foldersLoaded = Boolean(favoriteFoldersCache);
    state.foldersLoading = !favoriteFoldersCache;
    state.loading = true;
    state.hasMore = !favoriteItemStore.complete;
    renderFavoriteBrowser();

    // 标题里的表情短码需要表情表；只刷新列表区域，避免打断搜索输入。
    loadEmojis().then(() => {
      if (favoriteBrowserState.tab !== FAVORITE_TAB_IDS.FOLDERS || favoriteBrowserState.folderView !== "list") {
        renderFavoriteList();
      }
    }).catch(() => {});

    return refreshFavoriteContent();
  }

  function switchFavoriteTab(tabId) {
    const state = favoriteBrowserState;
    if (!FAVORITE_TABS.some((tab) => tab.id === tabId) || state.tab === tabId) {
      return;
    }

    saveFavoriteScrollTop();
    window.clearTimeout(favoriteSearchTimer);
    resetFavoriteDialogState();
    state.tab = tabId;
    state.query = "";
    state.error = "";
    state.searching = false;
    if (tabId !== FAVORITE_TAB_IDS.FOLDERS) {
      state.folderView = "list";
    }
    state.items = [];
    state.hasMore = false;
    state.loading = false;

    if (tabId === FAVORITE_TAB_IDS.CONTENT) {
      state.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
      state.hasMore = !favoriteItemStore.complete;
      state.loading = !favoriteItemStore.items.length;
    }

    renderFavoriteBrowser();
    setFavoriteScrollTop(0);

    if (tabId === FAVORITE_TAB_IDS.CONTENT && !favoriteItemStore.items.length) {
      refreshFavoriteContent();
    } else if (tabId === FAVORITE_TAB_IDS.FOLDERS && !state.foldersLoaded) {
      refreshFavoriteFolders();
    } else if (tabId === FAVORITE_TAB_IDS.CY && !state.cy.loaded) {
      refreshFavoriteCy();
    }
  }

  function refreshFavoriteContent() {
    const state = favoriteBrowserState;
    const token = ++favoriteBrowserRequestToken;
    state.loading = true;
    state.error = "";
    renderFavoriteList();

    return loadFavoriteFolders({ force: true }).then((folders) => {
      if (token !== favoriteBrowserRequestToken) {
        return;
      }
      state.folders = folders;
      state.foldersLoaded = true;
      state.foldersLoading = false;
      state.loading = false;
      state.loaded = true;
      state.error = "";
      state.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
      state.hasMore = !favoriteItemStore.complete;
      renderFavoriteList({ animateFrom: 0 });
      if (favoriteItemStore.offset >= FAVORITE_INITIAL_PAGE_COUNT * FAVORITE_PAGE_LIMIT || favoriteItemStore.complete) {
        return undefined;
      }

      state.loading = true;
      renderFavoriteList();
      return loadFavoriteItemsThroughPage(FAVORITE_INITIAL_PAGE_COUNT);
    }).catch((error) => {
      if (token !== favoriteBrowserRequestToken) {
        return;
      }
      state.loading = false;
      state.error = error?.message || "收藏加载失败";
      state.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
      state.hasMore = !favoriteItemStore.complete;
      renderFavoriteList();
    }).finally(() => {
      if (token !== favoriteBrowserRequestToken) {
        return;
      }
      state.loading = false;
      state.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
      state.hasMore = !favoriteItemStore.complete;
      renderFavoriteList();
    });
  }

  function refreshFavoriteFolders(options = {}) {
    const token = ++favoriteBrowserRequestToken;
    if (options.silent !== true) {
      favoriteBrowserState.foldersLoading = true;
      favoriteBrowserState.error = "";
      renderFavoriteList();
    }

    return loadFavoriteFolders({ force: true })
      .then((folders) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        favoriteBrowserState.folders = folders;
        favoriteBrowserState.foldersLoaded = true;
        favoriteBrowserState.foldersLoading = false;
        favoriteBrowserState.loading = false;
        favoriteBrowserState.loaded = true;
        favoriteBrowserState.error = "";
        if (favoriteBrowserState.tab === FAVORITE_TAB_IDS.CONTENT) {
          favoriteBrowserState.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
          favoriteBrowserState.hasMore = !favoriteItemStore.complete;
        }
        renderFavoriteList();
      })
      .catch((error) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        favoriteBrowserState.foldersLoading = false;
        favoriteBrowserState.loading = false;
        favoriteBrowserState.error = error?.message || "收藏夹加载失败";
        renderFavoriteList();
      });
  }

  function refreshFavoriteCy() {
    const cy = favoriteBrowserState.cy;
    if (cy.loading) {
      return Promise.resolve();
    }

    cy.loading = true;
    cy.error = "";
    renderFavoriteList();
    return loadCyFavorites()
      .then((result) => {
        cy.loading = false;
        cy.loaded = true;
        cy.unsupported = result?.supported !== true;
        cy.items = Array.isArray(result?.items) ? result.items : [];
        renderFavoriteList();
      })
      .catch((error) => {
        cy.loading = false;
        cy.loaded = true;
        cy.error = error?.message || "CY 收藏加载失败";
        renderFavoriteList();
      });
  }

  function updateFavoriteFolderCount(folderId, count) {
    if (!favoriteFoldersCache || !folderId) {
      return;
    }
    const folder = favoriteFoldersCache.find((item) => item.id === folderId);
    if (folder && count > (folder.count || 0)) {
      folder.count = count;
    }
  }

  function openFavoriteFolder(folderId, folderName) {
    if (!folderId) {
      return;
    }

    // 记录目录滚动位置，返回时还原。
    saveFavoriteScrollTop();
    window.clearTimeout(favoriteSearchTimer);
    favoriteBrowserState.folderView = "items";
    favoriteBrowserState.folderId = folderId;
    favoriteBrowserState.folderName = folderName || getFavoriteFolderById(folderId)?.name || "";
    favoriteBrowserState.query = "";
    favoriteBrowserState.items = [];
    favoriteBrowserState.hasMore = folderId === FAVORITE_ALL_FOLDER_ID && !favoriteItemStore.complete;
    favoriteBrowserState.error = "";
    favoriteBrowserState.searching = false;
    favoriteBrowserState.loading = true;
    renderFavoriteBrowser();
    setFavoriteScrollTop(0);
    refreshFavoriteItems();
  }

  function backToFavoriteFolders() {
    window.clearTimeout(favoriteSearchTimer);
    favoriteBrowserState.folderView = "list";
    favoriteBrowserState.folderId = "";
    favoriteBrowserState.folderName = "";
    favoriteBrowserState.query = "";
    favoriteBrowserState.items = [];
    favoriteBrowserState.hasMore = false;
    favoriteBrowserState.error = "";
    favoriteBrowserState.searching = false;
    favoriteBrowserState.loading = false;
    renderFavoriteBrowser();
    setFavoriteScrollTop(favoriteBrowserState.foldersScrollTop);
  }

  function refreshFavoriteItems() {
    const folderId = favoriteBrowserState.folderId;
    const token = ++favoriteBrowserRequestToken;
    favoriteBrowserState.loading = true;
    favoriteBrowserState.error = "";
    renderFavoriteList();

    const task = folderId === FAVORITE_ALL_FOLDER_ID
      ? (favoriteItemStore.items.length
        ? Promise.resolve(getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID))
        : fetchFavoritePage({ offset: 0, limit: FAVORITE_PAGE_LIMIT }).then((payload) => {
          mergeFavoriteItems(payload.items);
          if (!payload.hasMore || !payload.items.length) {
            favoriteItemStore.complete = true;
          }
          return getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
        }))
      : loadFavoriteItems(folderId);

    return task
      .then((items) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        favoriteBrowserState.loading = false;
        favoriteBrowserState.items = items;
        favoriteBrowserState.hasMore = folderId === FAVORITE_ALL_FOLDER_ID && !favoriteItemStore.complete;
        renderFavoriteList({ animateFrom: 0 });
        updateFavoriteFolderCount(folderId, items.length);
      })
      .catch((error) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        favoriteBrowserState.loading = false;
        favoriteBrowserState.error = error?.message || "收藏加载失败";
        renderFavoriteList();
      });
  }

  function canLoadMoreFavoriteItems() {
    const state = favoriteBrowserState;
    if (state.query || state.loading || state.searching || !state.hasMore || favoriteItemStore.complete) {
      return false;
    }
    if (state.tab === FAVORITE_TAB_IDS.CONTENT) {
      return true;
    }
    return state.tab === FAVORITE_TAB_IDS.FOLDERS
      && state.folderView === "items"
      && state.folderId === FAVORITE_ALL_FOLDER_ID;
  }

  function loadMoreFavoriteItems() {
    if (!canLoadMoreFavoriteItems()) {
      return Promise.resolve();
    }

    const state = favoriteBrowserState;
    const token = favoriteBrowserRequestToken;
    const previousCount = state.items.length;
    state.loading = true;
    renderFavoriteList();
    return fetchFavoritePage({ offset: favoriteItemStore.offset, limit: FAVORITE_PAGE_LIMIT })
      .then((payload) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        mergeFavoriteItems(payload.items);
        favoriteItemStore.offset += payload.rawCount;
        if (!payload.hasMore || !payload.rawCount || !payload.items.length) {
          favoriteItemStore.complete = true;
        }
        state.loading = false;
        state.items = getFavoriteFolderItems(FAVORITE_ALL_FOLDER_ID);
        state.hasMore = !favoriteItemStore.complete;
        renderFavoriteList({ animateFrom: previousCount });
      })
      .catch((error) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        state.loading = false;
        state.error = error?.message || "收藏加载失败";
        renderFavoriteList();
      });
  }

  // 搜索范围：内容标签搜全部收藏，分夹标签搜当前分夹。
  function getFavoriteSearchScopeFolderId() {
    const state = favoriteBrowserState;
    if (state.tab === FAVORITE_TAB_IDS.FOLDERS && state.folderView === "items") {
      return state.folderId || FAVORITE_ALL_FOLDER_ID;
    }
    return FAVORITE_ALL_FOLDER_ID;
  }

  function applyFavoriteSearch(query) {
    const state = favoriteBrowserState;
    const scopeFolderId = getFavoriteSearchScopeFolderId();
    const keywords = splitSearchKeywords(query);
    state.query = String(query || "");
    state.error = "";

    if (!keywords.length) {
      state.searching = false;
      state.items = getFavoriteFolderItems(scopeFolderId);
      state.hasMore = scopeFolderId === FAVORITE_ALL_FOLDER_ID && !favoriteItemStore.complete;
      renderFavoriteList();
      return Promise.resolve();
    }

    const token = ++favoriteBrowserRequestToken;
    state.searching = true;
    renderFavoriteList();
    return searchFavoriteItems(scopeFolderId, state.query)
      .then((items) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        state.searching = false;
        state.items = items;
        state.hasMore = false;
        renderFavoriteList();
      })
      .catch((error) => {
        if (token !== favoriteBrowserRequestToken) {
          return;
        }
        state.searching = false;
        state.error = error?.message || "搜索失败";
        renderFavoriteList();
      });
  }

  function scheduleFavoriteSearchInput(query) {
    window.clearTimeout(favoriteSearchTimer);
    favoriteSearchTimer = window.setTimeout(() => applyFavoriteSearch(query), FAVORITE_SEARCH_DEBOUNCE);
  }

  function clearFavoriteSearch() {
    const popover = ensureFavoritePopover();
    const input = popover?.querySelector("[data-favorite-search]");
    window.clearTimeout(favoriteSearchTimer);
    if (input) {
      input.value = "";
    }
    applyFavoriteSearch("");
    input?.focus();
  }

  function retryFavoriteBrowser() {
    const state = favoriteBrowserState;
    if (state.tab === FAVORITE_TAB_IDS.CY) {
      return refreshFavoriteCy();
    }
    if (state.tab === FAVORITE_TAB_IDS.FOLDERS) {
      return state.folderView === "items" ? refreshFavoriteItems() : refreshFavoriteFolders();
    }
    return refreshFavoriteContent();
  }

  // ---------------------------------------------------------------------------
  // CY 收藏与新建收藏夹：都需要真实接口才能实现
  //
  // 已确认的事实：仓库内唯一有证据的收藏接口是 FAVOUR_LIST_API_PATH（/bbs/web/profile/favours），
  // 它只被用来读取收藏帖子列表；没有发现 CY 收藏接口，也没有发现创建收藏夹接口。
  // 按需求约定，这里不猜测路径和参数、不伪造数据，直接返回明确状态，由 UI 如实告知用户。
  // 接入真实接口时，只需替换下面两个函数：
  //   loadCyFavorites()            → { supported: true, items: [normalizeFavoriteItem(...)] }
  //   createFavoriteFolder(name)   → { ok: true, folder: { id, name, count } }
  // ---------------------------------------------------------------------------
  function loadCyFavorites() {
    return Promise.resolve({
      supported: false,
      items: [],
      message: "当前网页版暂不提供 CY 收藏数据"
    });
  }

  function createFavoriteFolder(name) {
    const folderName = String(name || "").trim();
    return Promise.resolve({
      ok: false,
      unsupported: true,
      name: folderName,
      message: "当前版本暂不支持创建收藏夹，请到小黑盒收藏页新建。"
    });
  }

  function openCreateFavoriteFolderDialog() {
    const state = favoriteBrowserState;
    state.dialogOpen = true;
    state.dialogName = "";
    state.dialogError = "";
    state.dialogSubmitting = false;
    state.dialogUnsupported = false;
    state.dialogFocusPending = true;
    renderFavoriteList();
  }

  function closeCreateFavoriteFolderDialog() {
    resetFavoriteDialogState();
    renderFavoriteList();
  }

  function showFavoriteDialogError(message) {
    favoriteBrowserState.dialogError = message || "";
    renderFavoriteList();
    ensureFavoritePopover()?.querySelector("[data-favorite-dialog-input]")?.focus();
  }

  function submitCreateFavoriteFolder() {
    const state = favoriteBrowserState;
    const name = String(state.dialogName || "").trim();
    if (state.dialogSubmitting) {
      return Promise.resolve();
    }
    if (!name) {
      showFavoriteDialogError("收藏夹名称不能为空");
      return Promise.resolve();
    }
    if (Array.from(name).length > FAVORITE_FOLDER_NAME_MAX_LENGTH) {
      showFavoriteDialogError(`名称不能超过 ${FAVORITE_FOLDER_NAME_MAX_LENGTH} 个字符`);
      return Promise.resolve();
    }
    const duplicated = state.folders.some((folder) => folder.source === "server"
      && String(folder.name || "").trim().toLowerCase() === name.toLowerCase());
    if (duplicated) {
      showFavoriteDialogError("已存在同名收藏夹");
      return Promise.resolve();
    }

    state.dialogSubmitting = true;
    state.dialogError = "";
    renderFavoriteList();
    return createFavoriteFolder(name).then((result) => {
      state.dialogSubmitting = false;
      if (result?.ok) {
        resetFavoriteDialogState();
        favoriteFoldersCache = null;
        return refreshFavoriteFolders().then(() => {
          const createdFolder = result.folder?.id ? getFavoriteFolderById(result.folder.id) : null;
          if (createdFolder) {
            openFavoriteFolder(createdFolder.id, createdFolder.name);
          }
        });
      }
      state.dialogUnsupported = result?.unsupported === true;
      state.dialogError = result?.message || "创建收藏夹失败";
      renderFavoriteList();
      return undefined;
    }).catch((error) => {
      state.dialogSubmitting = false;
      state.dialogError = error?.message || "创建收藏夹失败";
      renderFavoriteList();
    });
  }

  function handleFavoritePopoverScroll(body) {
    if (!canLoadMoreFavoriteItems()) {
      return;
    }
    if (body.scrollTop + body.clientHeight < body.scrollHeight - 80) {
      return;
    }
    loadMoreFavoriteItems();
  }

  // 让历史/收藏里的新标签页链接不受页面自身 SPA 路由影响。
  // 只截断冒泡、不调用 preventDefault，浏览器原生 target="_blank"（含中键、Ctrl/Command 点击）行为保持不变。
  function isolatePostBrowserLinkClicks(popover) {
    if (!popover || popover.dataset.newTabIsolated === "1") {
      return;
    }

    popover.dataset.newTabIsolated = "1";
    popover.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const anchor = event.target.closest("a[target='_blank']");
      if (!anchor || !popover.contains(anchor)) {
        return;
      }
      // 头像和缩略图有自己的点击行为，交给 activateHeaderPopoverInteraction 处理。
      if (event.target.closest("[data-better-image-urls], [data-better-profile-id]")) {
        return;
      }
      event.stopPropagation();
    }, true);
  }

  function bindFavoriteBrowserInteractions(popover) {
    if (!popover || popover.dataset.favoriteBrowserBound === "1") {
      return;
    }

    popover.dataset.favoriteBrowserBound = "1";
    isolatePostBrowserLinkClicks(popover);
    popover.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.closest("[data-favorite-search-clear]")) {
        event.preventDefault();
        clearFavoriteSearch();
        return;
      }
      if (event.target.closest("[data-favorite-retry]")) {
        event.preventDefault();
        retryFavoriteBrowser();
      }
    });

    popover.addEventListener("input", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const input = target?.closest("[data-favorite-search]");
      if (!input) {
        return;
      }
      const clearButton = popover.querySelector("[data-favorite-search-clear]");
      if (clearButton) {
        clearButton.hidden = !input.value;
      }
      scheduleFavoriteSearchInput(input.value || "");
    });

    popover.addEventListener("keydown", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const input = target?.closest("[data-favorite-search]");
      if (!input) {
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        window.clearTimeout(favoriteSearchTimer);
        applyFavoriteSearch(input.value || "");
        return;
      }
      if (event.key === "Escape" && input.value) {
        event.preventDefault();
        event.stopPropagation();
        clearFavoriteSearch();
      }
    });
  }
