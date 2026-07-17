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

  function syncHotSearchDisabledState(savedState) {
    const isDisabled = savedState === true;
    if (isDisabled === hotSearchDisabled) {
      return;
    }

    hotSearchDisabled = isDisabled;
    if (hotSearchDisabled) {
      removeHotSearchSidebar();
    } else {
      scheduleHandlePage();
    }
    if (activeSettingsTab === SETTINGS_TABS.GENERAL) {
      renderSettingsPanel();
    }
  }

  function setHotSearchDisabled(isDisabled) {
    syncHotSearchDisabledState(isDisabled);
    saveLocalSettings({
      [HOT_SEARCH_DISABLED_STORAGE_KEY]: isDisabled === true
    });
  }

  function ensureHotSearchPermanentCloseButton(panel) {
    let footer = panel.querySelector(".better-hot-search__footer");
    if (!footer) {
      footer = document.createElement("div");
      footer.className = "better-hot-search__footer";

      const button = document.createElement("button");
      button.className = HOT_SEARCH_CLOSE_BUTTON_CLASS;
      button.type = "button";
      button.textContent = "永久关闭热搜";
      button.addEventListener("click", () => {
        setHotSearchDisabled(true);
      });
      footer.appendChild(button);

      const hint = document.createElement("div");
      hint.className = "better-hot-search__footer-hint";
      hint.textContent = "?";
      hint.tabIndex = 0;
      hint.dataset.tooltip = "关闭后可在通用设置中恢复";
      hint.setAttribute("aria-label", "说明：关闭后可在通用设置中恢复");
      footer.appendChild(hint);
    }
    panel.appendChild(footer);
  }

  function ensureHotSearchSidebar() {
    if (hotSearchDisabled) {
      removeHotSearchSidebar();
      return null;
    }

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

