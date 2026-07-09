// 设置面板挂载、关闭、定位和外部事件绑定。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
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

      const consentConfirmButton = event.target.closest(".better-settings__ai-bot-consent-confirm");
      if (consentConfirmButton && panel.contains(consentConfirmButton)) {
        const consentCheckbox = panel.querySelector(".better-settings__ai-bot-consent-checkbox");
        if (!consentCheckbox?.checked) {
          return;
        }
        aiBotConsentAccepted = true;
        saveLocalSettings({
          [AI_BOT_CONSENT_STORAGE_KEY]: true
        });
        renderSettingsPanel();
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
        panel.querySelector(".better-settings__input, .better-settings__ai-base-url, .better-settings__open-ai-bot-options")?.focus();
        return;
      }

      const resetAiBotPromptButton = event.target.closest(".better-settings__ai-bot-reset-prompt");
      if (resetAiBotPromptButton && panel.contains(resetAiBotPromptButton)) {
        const promptInput = panel.querySelector(".better-settings__ai-bot-comment-prompt");
        if (promptInput) {
          promptInput.value = AI_BOT_DEFAULT_PROMPT;
          syncAutoHeightTextarea(promptInput);
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      const resetAiBotFeedPromptButton = event.target.closest(".better-settings__ai-bot-reset-feed-prompt");
      if (resetAiBotFeedPromptButton && panel.contains(resetAiBotFeedPromptButton)) {
        const feedPromptInput = panel.querySelector(".better-settings__ai-bot-feed-comment-prompt");
        if (feedPromptInput) {
          feedPromptInput.value = AI_BOT_DEFAULT_FEED_PROMPT;
          syncAutoHeightTextarea(feedPromptInput);
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      const aiBotTestButton = event.target.closest(".better-settings__ai-bot-test");
      if (aiBotTestButton && panel.contains(aiBotTestButton)) {
        testAiBotSettingsFromPanel(panel, aiBotTestButton);
        return;
      }

      const aiBotRunNowButton = event.target.closest(".better-settings__ai-bot-run-now");
      if (aiBotRunNowButton && panel.contains(aiBotRunNowButton)) {
        runAiBotFromPanel(panel, aiBotRunNowButton);
        return;
      }

      const aiBotViewLogsButton = event.target.closest(".better-settings__ai-bot-view-logs");
      if (aiBotViewLogsButton && panel.contains(aiBotViewLogsButton)) {
        setActiveSettingsTab(SETTINGS_TABS.AIBOT_LOGS);
        return;
      }

      const aiBotBackSettingsButton = event.target.closest(".better-settings__ai-bot-back-settings");
      if (aiBotBackSettingsButton && panel.contains(aiBotBackSettingsButton)) {
        setActiveSettingsTab(SETTINGS_TABS.AIBOT);
        return;
      }

      const aiBotRefreshLogsButton = event.target.closest(".better-settings__ai-bot-refresh-logs");
      if (aiBotRefreshLogsButton && panel.contains(aiBotRefreshLogsButton)) {
        refreshAiBotLogsPanel();
        return;
      }

      const aiBotLogViewButton = event.target.closest("[data-ai-bot-log-view]");
      if (aiBotLogViewButton && panel.contains(aiBotLogViewButton)) {
        setAiBotLogView(panel, aiBotLogViewButton.dataset.aiBotLogView);
        return;
      }

      const aiBotMessageFilterButton = event.target.closest("[data-ai-bot-message-filter-value]");
      if (aiBotMessageFilterButton && panel.contains(aiBotMessageFilterButton)) {
        setAiBotMessageLogFilter(panel, aiBotMessageFilterButton.dataset.aiBotMessageFilterValue);
        return;
      }

      const aiBotLogDetailSummary = event.target.closest(".better-settings__ai-bot-log-detail-summary");
      if (aiBotLogDetailSummary && panel.contains(aiBotLogDetailSummary)) {
        const detail = aiBotLogDetailSummary.closest(".better-settings__ai-bot-log-detail-wrap");
        window.requestAnimationFrame(() => syncAiBotLogDetailState(detail));
        return;
      }

      const aiBotLogCopyButton = event.target.closest(".better-settings__ai-bot-log-copy");
      if (aiBotLogCopyButton && panel.contains(aiBotLogCopyButton)) {
        syncAiBotLogDetailState(aiBotLogCopyButton.closest(".better-settings__ai-bot-log-detail-wrap"));
        copyAiBotLogFromPanel(aiBotLogCopyButton);
        return;
      }

      const aiBotClearLogsButton = event.target.closest(".better-settings__ai-bot-clear-logs");
      if (aiBotClearLogsButton && panel.contains(aiBotClearLogsButton)) {
        clearAiBotLogsFromPanel(panel, aiBotClearLogsButton);
        return;
      }

      const resetPromptButton = event.target.closest(".better-settings__ai-reset-prompt");
      if (resetPromptButton && panel.contains(resetPromptButton)) {
        const promptInput = panel.querySelector(".better-settings__ai-summary-prompt");
        if (promptInput) {
          promptInput.value = DEFAULT_SUMMARY_PROMPT;
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

      const fetchAiBotModelsButton = event.target.closest(".better-settings__ai-bot-fetch-models");
      if (fetchAiBotModelsButton && panel.contains(fetchAiBotModelsButton)) {
        fetchAiBotModelsFromPanel(panel, fetchAiBotModelsButton);
        return;
      }

      const modelDropdown = event.target.closest(".better-settings__ai-model-dropdown");
      if (modelDropdown && panel.contains(modelDropdown) && !modelDropdown.classList.contains("better-settings__ai-bot-model-dropdown")) {
        toggleAiModelMenu(panel);
        return;
      }

      const aiBotModelDropdown = event.target.closest(".better-settings__ai-bot-model-dropdown");
      if (aiBotModelDropdown && panel.contains(aiBotModelDropdown)) {
        toggleAiBotModelMenu(panel);
        return;
      }

      const modelOption = event.target.closest(".better-settings__ai-model-option");
      if (modelOption && panel.contains(modelOption) && !modelOption.classList.contains("better-settings__ai-bot-model-option")) {
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

      const aiBotModelOption = event.target.closest(".better-settings__ai-bot-model-option");
      if (aiBotModelOption && panel.contains(aiBotModelOption)) {
        const modelInput = panel.querySelector(".better-settings__ai-bot-model");
        if (modelInput && aiBotModelOption.dataset.model) {
          modelInput.value = aiBotModelOption.dataset.model;
          syncAiBotModelSelect(panel);
          closeAiBotModelMenu(panel);
          saveAiBotSettingsFromPanel(panel);
          syncAiConnectionDot("aiBot", getAiBotSettingsFormValues(panel));
        }
        return;
      }

      closeAiModelMenu(panel);
      closeAiBotModelMenu(panel);
    });
    panel.addEventListener("toggle", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      const connectionConfig = event.target.closest("[data-connection-config]");
      if (connectionConfig) {
        setConnectionConfigOpen(connectionConfig.dataset.connectionConfig, connectionConfig.open);
        return;
      }
      const aiBotSection = event.target.closest("[data-ai-bot-section]");
      if (aiBotSection) {
        const section = aiBotSection.dataset.aiBotSection;
        if (section === "auto-reply") {
          uiState = normalizeUiState({ ...uiState, aiBotAutoReplyOpen: aiBotSection.open });
        } else if (section === "auto-feed") {
          uiState = normalizeUiState({ ...uiState, aiBotAutoFeedOpen: aiBotSection.open });
        }
        persistUiState();
        return;
      }
      const detail = event.target.closest(".better-settings__ai-bot-log-detail-wrap");
      if (!detail) {
        return;
      }
      syncAiBotLogDetailState(detail);
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
          repositionSettingsPanelIfOpen();
        }
        if (event.target.matches(".better-settings__ai-model")) {
          syncAiModelSelect(panel);
          filterAiModelOptionsFromInput(panel, event.target);
        }
        saveAiSettingsFromPanel(panel);
      }

      if (event.target.matches(".better-settings__ai-bot-base-url, .better-settings__ai-bot-model, .better-settings__ai-bot-api-key, .better-settings__ai-bot-poll-minutes, .better-settings__ai-bot-feed-poll-minutes, .better-settings__ai-bot-fresh-minutes, .better-settings__ai-bot-reply-limit, .better-settings__ai-bot-history-limit, .better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-comment-prompt, .better-settings__ai-bot-feed-comment-prompt")) {
        if (event.target.matches(".better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-comment-prompt, .better-settings__ai-bot-feed-comment-prompt")) {
          syncAutoHeightTextarea(event.target);
          repositionSettingsPanelIfOpen();
        }
        if (event.target.matches(".better-settings__ai-bot-model")) {
          syncAiBotModelSelect(panel);
          filterAiModelOptionsFromInput(panel, event.target, true);
        }
        saveAiBotSettingsFromPanel(panel, { silentStatus: true });
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

      if (event.target.matches(".better-settings__ai-provider")) {
        syncAiProviderDefaultBaseUrl(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-consent-checkbox")) {
        const confirmButton = panel.querySelector(".better-settings__ai-bot-consent-confirm");
        if (confirmButton) {
          confirmButton.disabled = !event.target.checked;
        }
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-provider")) {
        syncAiBotProviderDefaultBaseUrl(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-base-url")) {
        loadCachedAiBotModelOptions(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-bot-poll-minutes, .better-settings__ai-bot-feed-poll-minutes, .better-settings__ai-bot-fresh-minutes, .better-settings__ai-bot-reply-limit, .better-settings__ai-bot-history-limit, .better-settings__ai-bot-whitelist, .better-settings__ai-bot-rejected-keywords, .better-settings__ai-bot-reply-mentions, .better-settings__ai-bot-reply-comments, .better-settings__ai-bot-comment-home-feed, .better-settings__ai-bot-feed-select-strategy, .better-settings__ai-bot-allow-emoji, .better-settings__ai-bot-global-history")) {
        const normalized = getAiBotSettingsFormValues(panel);
        const pollInput = panel.querySelector(".better-settings__ai-bot-poll-minutes");
        const feedPollInput = panel.querySelector(".better-settings__ai-bot-feed-poll-minutes");
        const freshInput = panel.querySelector(".better-settings__ai-bot-fresh-minutes");
        const replyLimitInput = panel.querySelector(".better-settings__ai-bot-reply-limit");
        const historyLimitInput = panel.querySelector(".better-settings__ai-bot-history-limit");
        const whitelistInput = panel.querySelector(".better-settings__ai-bot-whitelist");
        const rejectedKeywordsInput = panel.querySelector(".better-settings__ai-bot-rejected-keywords");
        if (pollInput) {
          pollInput.value = normalized.pollMinutes;
        }
        if (feedPollInput) {
          feedPollInput.value = normalized.feedPollMinutes;
        }
        if (freshInput) {
          freshInput.value = normalized.messageFreshMinutes;
        }
        if (replyLimitInput) {
          replyLimitInput.value = normalized.replyLimitPerLinkUser;
        }
        if (historyLimitInput) {
          historyLimitInput.value = normalized.globalHistoryLimit;
        }
        if (whitelistInput) {
          whitelistInput.value = normalized.whitelistUserIds.join("\n");
          syncAutoHeightTextarea(whitelistInput);
        }
        if (rejectedKeywordsInput) {
          rejectedKeywordsInput.value = normalized.rejectedReplyKeywords.join("\n");
          syncAutoHeightTextarea(rejectedKeywordsInput);
        }
        if (event.target.matches(".better-settings__ai-bot-comment-home-feed")) {
          const feedSection = panel.querySelector(".better-settings__feed-poll-section");
          if (feedSection) {
            feedSection.open = event.target.checked;
          }
        }
        saveAiBotSettingsFromPanel(panel);
        return;
      }

      if (event.target.matches(".better-settings__ai-base-url")) {
        loadCachedAiModelOptions(panel);
        return;
      }

      if (event.target.matches(".better-settings__level-enabled")) {
        updateLevelFilter(event.target.dataset.scope, {
          enabled: event.target.checked
        });
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
    stopAiBotLogAutoRefresh();
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
    } else {
      stopAiBotLogAutoRefresh();
    }
  }

  function openSettingsPanelTab(tab) {
    activeSettingsTab = tab === SETTINGS_TABS.AI || tab === SETTINGS_TABS.AIBOT || tab === SETTINGS_TABS.AIBOT_LOGS ? tab : normalizeBlockedKeywordScope(tab);
    const button = document.querySelector(`.${SETTINGS_ENTRY_CLASS}`);
    if (!button) {
      return;
    }

    const panel = ensureSettingsPanel();
    panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    renderSettingsPanel();
    positionSettingsPanel(panel, button);
    panel.querySelector(activeSettingsTab === SETTINGS_TABS.AI ? ".better-settings__ai-base-url" : (activeSettingsTab === SETTINGS_TABS.AIBOT ? ".better-settings__ai-bot-base-url" : (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS ? ".better-settings__ai-bot-refresh-logs" : ".better-settings__input")))?.focus();
    if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
      startAiBotLogAutoRefresh();
    } else {
      stopAiBotLogAutoRefresh();
    }
    bindSettingsPanelOutsideClick();
    bindSettingsPanelResizeSync();
  }

  function handleOpenPageSettings(event) {
    const detail = parseEventDetail(event?.detail);
    ensureSettingsEntry();
    openSettingsPanelTab(detail.tab || SETTINGS_TABS.AIBOT);
  }

