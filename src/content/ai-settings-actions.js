// AI 设置测试、模型列表和表单保存。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function testAiSettingsFromPanel(panel, button) {
    saveAiSettingsFromPanel(panel);
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiSettingsFormValues(panel);
    if (!settings.baseUrl || !settings.model) {
      if (status) {
        status.textContent = "请先填写 Base URL 和模型";
        status.style.color = "#d33b4a";
      }
      setAiConnectionStatus("ai", "error", settings);
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "测试中...";
      status.style.color = "#8a9299";
    }

    window.setTimeout(() => {
      requestAiChat([{ role: "user", content: "请回复 OK" }], 0).then(() => {
        if (status) {
          status.textContent = "连接成功";
          status.style.color = "#0b806f";
        }
        setAiConnectionStatus("ai", "ok", aiSettings);
      }).catch((error) => {
        if (status) {
          status.textContent = error?.message || "连接失败";
          status.style.color = "#d33b4a";
        }
        setAiConnectionStatus("ai", "error", aiSettings);
      }).finally(() => {
        if (button) {
          button.disabled = false;
        }
      });
    }, 0);
  }

  function requestAiModelList(settings, options = {}) {
    const requestId = `models-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
        reject(new Error("模型列表拉取超时"));
      }, 30000);

      function handleResponse(event) {
        const detail = parseEventDetail(event.detail);
        if (detail.id !== requestId) {
          return;
        }

        window.clearTimeout(timeoutId);
        window.removeEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
        if (!detail.ok) {
          reject(new Error(detail.error || "模型列表拉取失败"));
          return;
        }
        resolve(Array.isArray(detail.models) ? detail.models : []);
      }

      window.addEventListener(AI_MODEL_LIST_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(AI_MODEL_LIST_REQUEST_EVENT, {
        detail: JSON.stringify({
          id: requestId,
          settings,
          cacheOnly: options.cacheOnly === true
        })
      }));
    });
  }

  function fillAiModelOptions(panel, models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (!modelMenu || !modelDropdown) {
      return;
    }

    modelDropdown.disabled = !normalizedModels.length;
    closeAiModelMenu(panel);
    modelMenu.innerHTML = normalizedModels.map((model) => `
      <button class="better-settings__ai-model-option" type="button" role="option" data-model="${escapeHtml(model)}" title="${escapeHtml(model)}">${escapeHtml(model)}</button>
    `).join("");
    syncAiModelSelect(panel);
  }

  function fillAiBotModelOptions(panel, models) {
    const normalizedModels = [...new Set((Array.isArray(models) ? models : [])
      .map((model) => String(model || "").trim())
      .filter(Boolean))];
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (!modelMenu || !modelDropdown) {
      return;
    }

    modelDropdown.disabled = !normalizedModels.length;
    closeAiBotModelMenu(panel);
    modelMenu.innerHTML = normalizedModels.map((model) => `
      <button class="better-settings__ai-model-option better-settings__ai-bot-model-option" type="button" role="option" data-model="${escapeHtml(model)}" title="${escapeHtml(model)}">${escapeHtml(model)}</button>
    `).join("");
    syncAiBotModelSelect(panel);
  }

  function closeAiModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (modelMenu) {
      modelMenu.hidden = true;
      setAiModelMenuOpenState(modelMenu, false);
    }
    if (modelDropdown) {
      modelDropdown.setAttribute("aria-expanded", "false");
    }
  }

  function closeAiBotModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (modelMenu) {
      modelMenu.hidden = true;
      setAiModelMenuOpenState(modelMenu, false);
    }
    if (modelDropdown) {
      modelDropdown.setAttribute("aria-expanded", "false");
    }
  }

  function setAiModelMenuOpenState(modelMenu, isOpen) {
    const combobox = modelMenu?.closest(".better-settings__ai-model-combobox");
    combobox?.classList.toggle("is-open", isOpen);
    combobox?.closest(".better-settings__field")?.classList.toggle("is-model-menu-open", isOpen);
    combobox?.closest(".better-settings__collapsible-section")?.classList.toggle("is-model-menu-open", isOpen);
  }

  function filterAiModelMenu(modelMenu, keyword) {
    if (!modelMenu) {
      return 0;
    }

    const normalizedKeyword = String(keyword || "").trim().toLocaleLowerCase();
    let visibleCount = 0;
    modelMenu.querySelectorAll(".better-settings__ai-model-option").forEach((option) => {
      const matches = !normalizedKeyword || String(option.dataset.model || "").toLocaleLowerCase().includes(normalizedKeyword);
      option.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    });

    let emptyMessage = modelMenu.querySelector(".better-settings__ai-model-empty");
    if (!emptyMessage) {
      emptyMessage = document.createElement("div");
      emptyMessage.className = "better-settings__ai-model-empty";
      emptyMessage.textContent = "没有匹配的模型";
      modelMenu.appendChild(emptyMessage);
    }
    emptyMessage.hidden = visibleCount > 0;
    return visibleCount;
  }

  function openAiModelMenu(modelMenu, modelDropdown, keyword = "") {
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    filterAiModelMenu(modelMenu, keyword);
    modelMenu.hidden = false;
    modelDropdown.setAttribute("aria-expanded", "true");
    setAiModelMenuOpenState(modelMenu, true);
  }

  function toggleAiModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    const shouldOpen = modelMenu.hidden;
    if (shouldOpen) {
      openAiModelMenu(modelMenu, modelDropdown);
    } else {
      closeAiModelMenu(panel);
    }
  }

  function toggleAiBotModelMenu(panel) {
    const modelMenu = panel.querySelector(".better-settings__ai-bot-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-bot-model-dropdown");
    if (!modelMenu || !modelDropdown || modelDropdown.disabled) {
      return;
    }

    const shouldOpen = modelMenu.hidden;
    if (shouldOpen) {
      openAiModelMenu(modelMenu, modelDropdown);
      syncAiBotModelSelect(panel);
    } else {
      closeAiBotModelMenu(panel);
    }
  }

  function filterAiModelOptionsFromInput(panel, input, isAiBot = false) {
    const modelMenu = panel.querySelector(isAiBot ? ".better-settings__ai-bot-model-menu" : ".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(isAiBot ? ".better-settings__ai-bot-model-dropdown" : ".better-settings__ai-model-dropdown");
    openAiModelMenu(modelMenu, modelDropdown, input?.value);
  }

  function syncAiModelSelect(panel) {
    const value = panel.querySelector(".better-settings__ai-model")?.value?.trim() || "";
    panel.querySelectorAll(".better-settings__ai-model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function syncAiBotModelSelect(panel) {
    const value = panel.querySelector(".better-settings__ai-bot-model")?.value?.trim() || "";
    panel.querySelectorAll(".better-settings__ai-bot-model-option").forEach((option) => {
      const isSelected = option.dataset.model === value;
      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });
  }

  function fetchAiModelsFromPanel(panel, button) {
    saveAiSettingsFromPanel(panel);
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiSettingsFormValues(panel);
    if (!settings.baseUrl) {
      if (status) {
        status.textContent = "请先填写 Base URL";
        status.style.color = "#d33b4a";
      }
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "正在拉取模型...";
      status.style.color = "#8a9299";
    }

    requestAiModelList(settings).then((models) => {
      fillAiModelOptions(panel, models);
      if (status) {
        status.textContent = models.length ? `已拉取 ${models.length} 个模型` : "未返回可用模型，可手动填写";
        status.style.color = "#0b806f";
      }
    }).catch((error) => {
      if (status) {
        status.textContent = error?.message || "模型列表拉取失败";
        status.style.color = "#d33b4a";
      }
    }).finally(() => {
      if (button) {
        button.disabled = false;
      }
    });
  }

  function loadCachedAiModelOptions(panel) {
    const settings = getAiSettingsFormValues(panel);
    requestAiModelList(settings, { cacheOnly: true }).then((models) => {
      fillAiModelOptions(panel, models);
    }).catch(() => {
      fillAiModelOptions(panel, []);
    });
  }

  function fetchAiBotModelsFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    const status = panel.querySelector(".better-settings__message");
    const settings = getAiBotSettingsFormValues(panel);
    if (!settings.baseUrl) {
      if (status) {
        status.textContent = "请先填写 Base URL";
        status.style.color = "#d33b4a";
      }
      return;
    }

    if (button) {
      button.disabled = true;
    }
    if (status) {
      status.textContent = "正在拉取模型...";
      status.style.color = "#8a9299";
    }

    requestAiModelList(settings).then((models) => {
      fillAiBotModelOptions(panel, models);
      if (status) {
        status.textContent = models.length ? `已拉取 ${models.length} 个模型` : "未返回可用模型，可手动填写";
        status.style.color = "#0b806f";
      }
    }).catch((error) => {
      if (status) {
        status.textContent = error?.message || "模型列表拉取失败";
        status.style.color = "#d33b4a";
      }
    }).finally(() => {
      if (button) {
        button.disabled = false;
      }
    });
  }

  function loadCachedAiBotModelOptions(panel) {
    const settings = getAiBotSettingsFormValues(panel);
    requestAiModelList(settings, { cacheOnly: true }).then((models) => {
      fillAiBotModelOptions(panel, models);
    }).catch(() => {
      fillAiBotModelOptions(panel, []);
    });
  }

  function syncAiProviderDefaultBaseUrl(panel) {
    const providerInput = panel.querySelector(".better-settings__ai-provider");
    const baseUrlInput = panel.querySelector(".better-settings__ai-base-url");
    if (!providerInput || !baseUrlInput) {
      return;
    }

    const nextProvider = Object.values(AI_PROVIDERS).includes(providerInput.value) ? providerInput.value : DEFAULT_AI_PROVIDER;
    const defaultBaseUrls = Object.values(AI_PROVIDER_DEFAULT_BASE_URLS);
    const currentBaseUrl = baseUrlInput.value.replace(/\/+$/, "");
    if (!currentBaseUrl || defaultBaseUrls.includes(currentBaseUrl)) {
      baseUrlInput.value = AI_PROVIDER_DEFAULT_BASE_URLS[nextProvider] || "";
    }
    fillAiModelOptions(panel, []);
    saveAiSettingsFromPanel(panel);
    loadCachedAiModelOptions(panel);
  }

  function getAiBotSettingsFormValues(panel) {
    const replyMentions = panel.querySelector(".better-settings__ai-bot-reply-mentions")?.checked === true;
    const replyComments = panel.querySelector(".better-settings__ai-bot-reply-comments")?.checked === true;
    const commentHomeFeed = panel.querySelector(".better-settings__ai-bot-comment-home-feed")?.checked === true;
    return normalizeAiBotSettings({
      enabled: replyMentions || replyComments || commentHomeFeed,
      provider: panel.querySelector(".better-settings__ai-bot-provider")?.value,
      baseUrl: panel.querySelector(".better-settings__ai-bot-base-url")?.value,
      model: panel.querySelector(".better-settings__ai-bot-model")?.value,
      apiKey: panel.querySelector(".better-settings__ai-bot-api-key")?.value,
      pollMinutes: panel.querySelector(".better-settings__ai-bot-poll-minutes")?.value,
      feedPollMinutes: panel.querySelector(".better-settings__ai-bot-feed-poll-minutes")?.value,
      feedSelectStrategy: panel.querySelector(".better-settings__ai-bot-feed-select-strategy")?.value,
      messageFreshMinutes: panel.querySelector(".better-settings__ai-bot-fresh-minutes")?.value,
      replyLimitPerLinkUser: panel.querySelector(".better-settings__ai-bot-reply-limit")?.value,
      globalHistoryEnabled: panel.querySelector(".better-settings__ai-bot-global-history")?.checked !== false,
      globalHistoryLimit: panel.querySelector(".better-settings__ai-bot-history-limit")?.value,
      replyMentions,
      replyComments,
      commentHomeFeed,
      whitelistText: panel.querySelector(".better-settings__ai-bot-whitelist")?.value,
      rejectedReplyKeywordsText: panel.querySelector(".better-settings__ai-bot-rejected-keywords")?.value,
      allowEmoji: panel.querySelector(".better-settings__ai-bot-allow-emoji")?.checked !== false,
      commentPrompt: panel.querySelector(".better-settings__ai-bot-comment-prompt")?.value,
      feedCommentPrompt: panel.querySelector(".better-settings__ai-bot-feed-comment-prompt")?.value
    });
  }

  function saveAiBotSettingsFromPanel(panel, options = {}) {
    aiBotSettings = getAiBotSettingsFormValues(panel);
    syncAiConnectionDot("aiBot", aiBotSettings);
    writeAiBotSettingsState(aiBotSettings);
    const status = panel.querySelector(".better-settings__message");
    if (status && !options.silentStatus) {
      status.textContent = aiBotSettings.baseUrl && aiBotSettings.model ? "已保存" : "请填写 Base URL 和模型";
      status.style.color = "#68727d";
    }
  }

  function syncAiBotProviderDefaultBaseUrl(panel) {
    const providerInput = panel.querySelector(".better-settings__ai-bot-provider");
    const baseUrlInput = panel.querySelector(".better-settings__ai-bot-base-url");
    if (!providerInput || !baseUrlInput) {
      return;
    }

    const nextProvider = Object.values(AI_PROVIDERS).includes(providerInput.value) ? providerInput.value : DEFAULT_AI_PROVIDER;
    const defaultBaseUrls = Object.values(AI_PROVIDER_DEFAULT_BASE_URLS);
    const currentBaseUrl = baseUrlInput.value.replace(/\/+$/, "");
    if (!currentBaseUrl || defaultBaseUrls.includes(currentBaseUrl)) {
      baseUrlInput.value = AI_PROVIDER_DEFAULT_BASE_URLS[nextProvider] || "";
    }
    fillAiBotModelOptions(panel, []);
    saveAiBotSettingsFromPanel(panel);
    loadCachedAiBotModelOptions(panel);
  }

