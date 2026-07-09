// AI Bot 运行控制、日志刷新和辅助操作。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function sendAiBotRuntimeMessage(type, detail = {}) {
    return new Promise((resolve, reject) => {
      const id = `better-ai-bot-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const timer = window.setTimeout(() => {
        window.removeEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
        reject(new Error("请求超时"));
      }, 60000);

      function handleResponse(event) {
        const response = parseEventDetail(event.detail);
        if (response.id !== id) {
          return;
        }

        window.clearTimeout(timer);
        window.removeEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
        resolve(response || {});
      }

      window.addEventListener(AI_BOT_RUNTIME_RESPONSE_EVENT, handleResponse);
      window.dispatchEvent(new CustomEvent(AI_BOT_RUNTIME_REQUEST_EVENT, {
        detail: stringifyEventDetail({
          id,
          type,
          detail
        })
      }));
    });
  }

  function setAiBotPanelStatus(panel, text, isError = false) {
    const status = panel.querySelector(".better-settings__message");
    if (status) {
      status.textContent = text;
      status.style.color = isError ? "#d33b4a" : "#68727d";
    }
  }

  function testAiBotSettingsFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    if (!aiBotSettings.baseUrl || !aiBotSettings.model) {
      setAiBotPanelStatus(panel, "请先填写 Base URL 和模型", true);
      setAiConnectionStatus("aiBot", "error", aiBotSettings);
      return;
    }

    button.disabled = true;
    setAiBotPanelStatus(panel, "测试中...");
    sendAiBotRuntimeMessage("better-xiaoheihe-ai-bot-test", { settings: aiBotSettings }).then((response) => {
      if (!response.ok) {
        setAiBotPanelStatus(panel, response.error || "连接失败", true);
        setAiConnectionStatus("aiBot", "error", aiBotSettings);
        return;
      }
      setAiBotPanelStatus(panel, "连接成功");
      setAiConnectionStatus("aiBot", "ok", aiBotSettings);
    }).catch((error) => {
      setAiBotPanelStatus(panel, error?.message || "连接失败", true);
      setAiConnectionStatus("aiBot", "error", aiBotSettings);
    }).finally(() => {
      button.disabled = false;
    });
  }

  function runAiBotFromPanel(panel, button) {
    saveAiBotSettingsFromPanel(panel, { silentStatus: true });
    button.disabled = true;
    setAiBotPanelStatus(panel, "正在轮询...");
    sendAiBotRuntimeMessage("better-xiaoheihe-ai-bot-run-now").then((response) => {
      if (!response.ok) {
        setAiBotPanelStatus(panel, response.error || "轮询失败", true);
        return;
      }
      setAiBotPanelStatus(panel, `轮询完成：${response.count || 0} 条消息，首页推荐帖结果见日志`);
    }).catch((error) => {
      setAiBotPanelStatus(panel, error?.message || "轮询失败", true);
    }).finally(() => {
      button.disabled = false;
    });
  }

  function clearAiBotLogsFromPanel(panel, button) {
    button.disabled = true;
    saveLocalSettings({
      [AI_BOT_LOGS_STORAGE_KEY]: [],
      [AI_BOT_MESSAGE_LOGS_STORAGE_KEY]: []
    });
    aiBotLogs = [];
    aiBotMessageLogs = [];
    renderSettingsPanel();
    setAiBotPanelStatus(panel, "日志已清空");
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      textarea.remove();
    }
  }

  function toggleSecretInputFromPanel(panel, button) {
    const input = button?.dataset?.secretInput ? panel.querySelector(button.dataset.secretInput) : null;
    if (!input) {
      return;
    }
    input.type = input.type === "password" ? "text" : "password";
    const isVisible = input.type === "text";
    button.textContent = isVisible ? "隐藏" : "显示";
    button.setAttribute("aria-label", isVisible ? "隐藏 API Key" : "显示 API Key");
    button.setAttribute("aria-pressed", isVisible ? "true" : "false");
  }

  function copyAiBotLogFromPanel(button) {
    const detail = button?.closest(".better-settings__ai-bot-log-detail-wrap");
    const log = getAiBotLogById(detail?.dataset.logId || "");
    const text = log ? [
      `[${{
        success: "成功",
        warn: "提醒",
        error: "错误",
        info: "信息"
      }[log.level] || "信息"}] ${log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false })}`,
      log.message || "",
      formatAiBotLogDetailText(log.detail || {})
    ].filter(Boolean).join("\n") : "";
    if (!text) {
      return;
    }
    copyTextToClipboard(text).then(() => {
      const previousText = button.textContent;
      button.textContent = "已复制";
      window.setTimeout(() => {
        button.textContent = previousText || "复制";
      }, 1200);
    }).catch(() => {
      const panel = document.querySelector(`.${SETTINGS_PANEL_CLASS}`);
      if (panel) {
        setAiBotPanelStatus(panel, "复制失败，请手动选择文本复制", true);
      }
    });
  }

  function updateAiBotRuntimeLogList(options = {}) {
    const logList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
    if (!logList) {
      return;
    }
    const signature = getAiBotLogListSignature(aiBotLogs);
    if (!options.force && logList.dataset.signature === signature) {
      return;
    }
    const previousScrollTop = logList.scrollTop;
    const wasNearTop = previousScrollTop <= 4;
    logList.innerHTML = renderAiBotLogItemsHtml();
    logList.dataset.signature = signature;
    logList.scrollTop = wasNearTop ? 0 : Math.min(previousScrollTop, logList.scrollHeight);
  }

  function syncAiBotLogDetailState(detail) {
    const logId = detail?.dataset?.logId || "";
    if (!logId) {
      return;
    }
    if (detail.open) {
      expandedAiBotLogIds.add(logId);
      const detailContent = detail.querySelector(".better-settings__ai-bot-log-detail");
      if (detailContent && !detailContent.hasChildNodes()) {
        const log = getAiBotLogById(logId);
        if (log) {
          detailContent.innerHTML = renderAiBotLogDetailRowsHtml(log.detail || {});
        }
      }
    } else {
      expandedAiBotLogIds.delete(logId);
    }
  }

  function refreshAiBotLogsPanel() {
    if (aiBotLogRefreshRunning || activeSettingsTab !== SETTINGS_TABS.AIBOT_LOGS) {
      return;
    }
    aiBotLogRefreshRunning = true;
    const currentLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
    const currentMessageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
    const currentPendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
    const previousScrollTop = currentLogList?.scrollTop || 0;
    const previousMessageScrollTop = currentMessageLogList?.scrollTop || 0;
    const previousPendingScrollTop = currentPendingLogList?.scrollTop || 0;
    const wasNearTop = previousScrollTop <= 4;
    const messageWasNearTop = previousMessageScrollTop <= 4;
    const pendingWasNearTop = previousPendingScrollTop <= 4;
    currentLogList?.querySelectorAll(".better-settings__ai-bot-log-detail-wrap").forEach(syncAiBotLogDetailState);
    Promise.all([
      requestLocalSettingsState(1200),
      loadEmojis()
    ]).then(([response]) => {
      if (response?.ok) {
        aiBotLogs = normalizeAiBotLogs(response.values?.[AI_BOT_LOGS_STORAGE_KEY]);
        aiBotMessageLogs = normalizeAiBotMessageLogs(response.values?.[AI_BOT_MESSAGE_LOGS_STORAGE_KEY]);
        aiBotReplyQueue = normalizeAiBotReplyQueue(response.values?.[AI_BOT_REPLY_QUEUE_STORAGE_KEY]);
      }
    }).finally(() => {
      if (activeSettingsTab === SETTINGS_TABS.AIBOT_LOGS) {
        const nextLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-logs`);
        const nextMessageLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} .better-settings__ai-bot-message-logs`);
        const nextPendingLogList = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-log-panel="pending"]`);
        refreshAiBotTodayStatsPanel();
        updateAiBotRuntimeLogList();
        if (nextMessageLogList) {
          const signature = getAiBotMessageLogSignature();
          if (nextMessageLogList.dataset.signature !== signature) {
            nextMessageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
            nextMessageLogList.dataset.signature = signature;
            nextMessageLogList.scrollTop = messageWasNearTop ? 0 : Math.min(previousMessageScrollTop, nextMessageLogList.scrollHeight);
          }
        }
        if (nextPendingLogList) {
          const signature = `${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`;
          if (nextPendingLogList.dataset.signature !== signature) {
            nextPendingLogList.innerHTML = renderAiBotReplyQueueItemsHtml();
            nextPendingLogList.dataset.signature = signature;
            nextPendingLogList.scrollTop = pendingWasNearTop ? 0 : Math.min(previousPendingScrollTop, nextPendingLogList.scrollHeight);
          }
        }
      }
      aiBotLogRefreshRunning = false;
    });
  }

  function startAiBotLogAutoRefresh() {
    refreshAiBotLogsPanel();
    if (aiBotLogRefreshTimer) {
      return;
    }
    aiBotLogRefreshTimer = window.setInterval(refreshAiBotLogsPanel, 10000);
  }

  function stopAiBotLogAutoRefresh() {
    if (!aiBotLogRefreshTimer) {
      return;
    }
    window.clearInterval(aiBotLogRefreshTimer);
    aiBotLogRefreshTimer = null;
  }

