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

  function filterAiModelOptionsFromInput(panel, input) {
    const modelMenu = panel.querySelector(".better-settings__ai-model-menu");
    const modelDropdown = panel.querySelector(".better-settings__ai-model-dropdown");
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

