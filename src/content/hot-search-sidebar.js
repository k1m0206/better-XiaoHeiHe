// 热搜侧栏挂载和显隐控制。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function removeRightContent() {
    document.querySelectorAll(RIGHT_CONTENT_SELECTOR).forEach((node) => {
      if (node.closest(`.${HOT_SEARCH_SIDEBAR_CLASS}`)) {
        node.style.removeProperty("display");
        return;
      }
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

  function bindHotSearchSidebarOutsideClick() {
    if (hotSearchSidebarOutsideClickBound) {
      return;
    }

    hotSearchSidebarOutsideClickBound = true;
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const sidebar = document.querySelector(`.${HOT_SEARCH_SIDEBAR_CLASS}.${HOT_SEARCH_SIDEBAR_OPEN_CLASS}`);
      if (!sidebar || sidebar.contains(event.target)) {
        return;
      }

      setHotSearchSidebarOpen(sidebar, false);
    });
  }

  function removeHotSearchSidebar() {
    document.querySelectorAll(`.${HOT_SEARCH_SIDEBAR_CLASS}`).forEach((node) => {
      node.style.display = "none";
    });
  }

  function ensureHotSearchSidebar() {
    bindHotSearchSidebarOutsideClick();

    let sidebar = document.querySelector(`.${HOT_SEARCH_SIDEBAR_CLASS}`);
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.className = HOT_SEARCH_SIDEBAR_CLASS;

      const panel = document.createElement("div");
      panel.className = HOT_SEARCH_SIDEBAR_PANEL_CLASS;
      panel.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      sidebar.appendChild(panel);

      const toggle = document.createElement("button");
      toggle.className = HOT_SEARCH_SIDEBAR_TOGGLE_CLASS;
      toggle.type = "button";
      toggle.textContent = "热搜";
      toggle.title = "展开黑盒热搜";
      toggle.setAttribute("aria-label", "展开黑盒热搜");
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        setHotSearchSidebarOpen(sidebar, !sidebar.classList.contains(HOT_SEARCH_SIDEBAR_OPEN_CLASS));
      });
      sidebar.appendChild(toggle);

      document.body.appendChild(sidebar);
    }

    sidebar.style.removeProperty("display");

    return sidebar;
  }

