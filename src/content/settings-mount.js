// 设置面板挂载、关闭、定位和外部事件绑定。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function syncFeedLayoutRangeInput(panel, range) {
    const isTotalWidth = range.matches(".better-settings__layout-total-range");
    feedLayoutSettings = normalizeFeedLayoutSettings({
      ...feedLayoutSettings,
      ...(isTotalWidth
        ? { totalWidth: range.value }
        : { postWidth: range.value })
    });
    const layout = feedLayoutSettings;
    const totalValue = panel.querySelector(".better-settings__layout-total-value");
    const ratioValue = panel.querySelector(".better-settings__layout-ratio-value");
    const preview = panel.querySelector(".better-settings__layout-preview");
    if (totalValue) {
      totalValue.textContent = `${layout.totalWidth}%`;
    }
    if (ratioValue) {
      ratioValue.textContent = `帖子 ${layout.postWidth}% · 评论 ${100 - layout.postWidth}%`;
    }
    if (preview) {
      preview.style.setProperty("--better-layout-preview-total", `${layout.totalWidth}%`);
      preview.style.setProperty("--better-layout-preview-post", `${layout.postWidth}%`);
      preview.style.setProperty("--better-layout-preview-comment", `${100 - layout.postWidth}%`);
    }
    if (!feedLayoutPreviewFrame) {
      feedLayoutPreviewFrame = window.requestAnimationFrame(() => {
        feedLayoutPreviewFrame = 0;
        applyFeedLayoutSettings();
      });
    }
  }

  function bindFeedLayoutRangeInputs(panel) {
    panel.querySelectorAll(".better-settings__layout-total-range, .better-settings__layout-post-range").forEach((range) => {
      range.addEventListener("input", () => syncFeedLayoutRangeInput(panel, range));
    });
  }

  function ensureSettingsPanel() {
    let panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    if (panel) {
      return panel;
    }

    panel = document.createElement("div");
    panel.className = SETTINGS_PANEL_CLASS;
    panel.hidden = true;
    panel.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!(event.target instanceof Element)) {
        return;
      }

      const secretToggleButton = event.target.closest(".better-settings__secret-toggle");
      if (secretToggleButton && panel.contains(secretToggleButton)) {
        toggleSecretInputFromPanel(panel, secretToggleButton);
        return;
      }

      const removeButton = event.target.closest(".better-settings__remove");
      if (removeButton && panel.contains(removeButton)) {
        removeBlockedKeyword(removeButton.dataset.keyword, removeButton.dataset.scope);
        return;
      }

      const settingsTab = event.target.closest(".better-settings__tab");
      if (settingsTab && panel.contains(settingsTab)) {
        setActiveSettingsTab(settingsTab.dataset.settingsTab);
        panel.querySelector(".better-settings__input, .better-settings__ai-base-url")?.focus();
        return;
      }

      const blockedScopeTab = event.target.closest(".better-settings__scope-tab");
      if (blockedScopeTab && panel.contains(blockedScopeTab)) {
        setActiveBlockedKeywordScope(blockedScopeTab.dataset.blockedScope);
        panel.querySelector(".better-settings__input")?.focus();
        return;
      }

      const layoutResetButton = event.target.closest(".better-settings__layout-reset");
      if (layoutResetButton && panel.contains(layoutResetButton)) {
        updateFeedLayoutSetting(DEFAULT_FEED_LAYOUT, {
          render: true
        });
        return;
      }

      const hotSearchToggleButton = event.target.closest(".better-settings__hot-search-toggle");
      if (hotSearchToggleButton && panel.contains(hotSearchToggleButton)) {
        setHotSearchDisabled(!hotSearchDisabled);
        return;
      }

      const resetPromptButton = event.target.closest(".better-settings__ai-reset-prompt");
      if (resetPromptButton && panel.contains(resetPromptButton)) {
        const promptInput = panel.querySelector(".better-settings__ai-summary-prompt");
        if (promptInput) {
          promptInput.value = DEFAULT_SUMMARY_PROMPT;
          syncAutoHeightTextarea(promptInput);
          const promptCount = panel.querySelector(".better-settings__ai-prompt-count");
          if (promptCount) {
            promptCount.textContent = `${Array.from(DEFAULT_SUMMARY_PROMPT).length} 字`;
          }
        }
        saveAiSettingsFromPanel(panel);
        return;
      }

      const testButton = event.target.closest(".better-settings__ai-test");
      if (testButton && panel.contains(testButton)) {
        testAiSettingsFromPanel(panel, testButton);
      }

      const fetchModelsButton = event.target.closest(".better-settings__ai-fetch-models");
      if (fetchModelsButton && panel.contains(fetchModelsButton)) {
        fetchAiModelsFromPanel(panel, fetchModelsButton);
        return;
      }

      const modelDropdown = event.target.closest(".better-settings__ai-model-dropdown");
      if (modelDropdown && panel.contains(modelDropdown)) {
        toggleAiModelMenu(panel);
        return;
      }

      const modelOption = event.target.closest(".better-settings__ai-model-option");
      if (modelOption && panel.contains(modelOption)) {
        const modelInput = panel.querySelector(".better-settings__ai-model");
        if (modelInput && modelOption.dataset.model) {
          modelInput.value = modelOption.dataset.model;
          syncAiModelSelect(panel);
          closeAiModelMenu(panel);
          saveAiSettingsFromPanel(panel);
          syncAiConnectionDot("ai", getAiSettingsFormValues(panel));
        }
        return;
      }

      closeAiModelMenu(panel);
    });
    panel.addEventListener("toggle", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const connectionConfig = event.target.closest("[data-connection-config]");
      if (connectionConfig) {
        setConnectionConfigOpen(connectionConfig.open);
        return;
      }
      const aiPromptSection = event.target.closest("[data-ai-prompt-section]");
      if (aiPromptSection) {
        uiState = normalizeUiState({ ...uiState, aiPromptSettingsOpen: aiPromptSection.open });
        persistUiState();
        if (aiPromptSection.open) {
          window.requestAnimationFrame(() => {
            syncAutoHeightTextarea(aiPromptSection.querySelector(".better-settings__ai-summary-prompt"));
            repositionSettingsPanelIfOpen();
          });
        }
        return;
      }
    }, true);
    panel.addEventListener("input", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.matches(".better-settings__level-range")) {
        updateLevelFilter(event.target.dataset.scope, {
          maxLevel: event.target.value
        }, {
          render: false,
          refresh: false,
          persist: false
        });
        const scope = normalizeBlockedKeywordScope(event.target.dataset.scope);
        const valueLabel = panel.querySelector(".better-settings__level-value");
        if (valueLabel) {
          valueLabel.textContent = `展示 ${getLevelFilterLabel(Number.parseInt(event.target.value, 10) || LEVEL_FILTER_MIN)} 及以上${BLOCKED_KEYWORD_SCOPE_LABELS[scope]}`;
        }
      }

      if (event.target.matches(".better-settings__ai-base-url, .better-settings__ai-model, .better-settings__ai-api-key, .better-settings__ai-summary-prompt")) {
        if (event.target.matches(".better-settings__ai-summary-prompt")) {
          syncAutoHeightTextarea(event.target);
          const promptCount = panel.querySelector(".better-settings__ai-prompt-count");
          if (promptCount) {
            promptCount.textContent = `${Array.from(event.target.value).length} 字`;
          }
          repositionSettingsPanelIfOpen();
        }
        if (event.target.matches(".better-settings__ai-model")) {
          syncAiModelSelect(panel);
          filterAiModelOptionsFromInput(panel, event.target);
        }
        saveAiSettingsFromPanel(panel);
      }

    });
    panel.addEventListener("change", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.matches(".better-settings__ai-enabled, .better-settings__ai-allow-emoji, .better-settings__ai-auto-popup")) {
        saveAiSettingsFromPanel(panel);
        return;
      }

      if (event.target.matches(".better-settings__layout-total-range, .better-settings__layout-post-range")) {
        const isTotalWidth = event.target.matches(".better-settings__layout-total-range");
        updateFeedLayoutSetting(isTotalWidth
          ? { totalWidth: event.target.value }
          : { postWidth: event.target.value });
        return;
      }

      if (event.target.matches(".better-settings__ai-provider")) {
        syncAiProviderDefaultBaseUrl(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-base-url")) {
        loadCachedAiModelOptions(panel);
        return;
      }

      if (event.target.matches(".better-settings__level-enabled")) {
        const scope = normalizeBlockedKeywordScope(event.target.dataset.scope);
        const enabled = event.target.checked;
        updateLevelFilter(scope, {
          enabled
        }, {
          render: false
        });
        const toggle = event.target.closest(".better-settings__ai-master-toggle");
        const status = toggle?.querySelector(".better-settings__ai-status");
        if (status) {
          status.textContent = enabled ? "已开启" : "未开启";
          status.classList.toggle("is-on", enabled);
        }
        if (toggle) {
          toggle.title = `${enabled ? "关闭" : "开启"}${BLOCKED_KEYWORD_SCOPE_LABELS[scope]}等级过滤`;
        }
        return;
      }

      if (event.target.matches(".better-settings__level-range")) {
        updateLevelFilter(event.target.dataset.scope, {
          maxLevel: event.target.value
        }, {
          render: false,
          refresh: false
        });
        scheduleKeywordFiltersRefresh();
      }
    });
    panel.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = panel.querySelector(".better-settings__input");
      if (!input) {
        return;
      }

      addBlockedKeyword(input.value, activeBlockedKeywordScope);
      input.value = "";
      input.focus();
    });
    document.body.appendChild(panel);
    renderSettingsPanel();
    return panel;
  }

  function closeSettingsPanel() {
    const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (panel) {
      panel.hidden = true;
    }
    button?.setAttribute("aria-expanded", "false");
  }

  function bindSettingsPanelOutsideClick() {
    if (settingsPanelOutsideClickBound) {
      return;
    }

    settingsPanelOutsideClickBound = true;
    document.addEventListener("pointerdown", (event) => {
      const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      if (!panel || panel.hidden || !(event.target instanceof Element)) {
        return;
      }

      if (
        event.target.closest(`.${SETTINGS_PANEL_CLASS}`)
        || event.target.closest(`.${SETTINGS_ENTRY_CLASS}`)
      ) {
        return;
      }

      closeSettingsPanel();
    }, true);
  }

  function bindSettingsPanelResizeSync() {
    if (window.__betterXiaoheiheSettingsResizeBound) {
      return;
    }

    window.__betterXiaoheiheSettingsResizeBound = true;
    window.addEventListener("resize", repositionSettingsPanelIfOpen);
  }

  function toggleSettingsPanel(button) {
    const panel = ensureSettingsPanel();
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    button.setAttribute("aria-expanded", String(isOpening));
    if (isOpening) {
      renderSettingsPanel();
      positionSettingsPanel(panel, button);
      panel.querySelector(".better-settings__input")?.focus();
      bindSettingsPanelOutsideClick();
      bindSettingsPanelResizeSync();
    }
  }

  function openSettingsPanelTab(tab) {
    const blockedScopes = [SETTINGS_TABS.FEED, SETTINGS_TABS.COMMENT];
    const standaloneTabs = [
      SETTINGS_TABS.BLOCKED,
      SETTINGS_TABS.GENERAL,
      SETTINGS_TABS.AI
    ];
    if (blockedScopes.includes(tab)) {
      activeBlockedKeywordScope = normalizeBlockedKeywordScope(tab);
      activeSettingsTab = SETTINGS_TABS.BLOCKED;
    } else {
      activeSettingsTab = standaloneTabs.includes(tab) ? tab : SETTINGS_TABS.GENERAL;
    }
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!button) {
      return;
    }

    const panel = ensureSettingsPanel();
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    renderSettingsPanel();
    positionSettingsPanel(panel, button);
    panel.querySelector(activeSettingsTab === SETTINGS_TABS.AI ? ".better-settings__ai-base-url" : (activeSettingsTab === SETTINGS_TABS.GENERAL ? ".better-settings__layout-total-range" : ".better-settings__input"))?.focus();
    bindSettingsPanelOutsideClick();
    bindSettingsPanelResizeSync();
  }

  function handleOpenPageSettings(event) {
    const detail = parseEventDetail(event?.detail);
    ensureSettingsEntry();
    openSettingsPanelTab(detail.tab || SETTINGS_TABS.GENERAL);
  }

