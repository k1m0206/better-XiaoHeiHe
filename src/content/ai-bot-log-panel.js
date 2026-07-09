// AI Bot 日志、消息日志和队列面板渲染。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function getAiBotLogDetailLabel(key) {
    return AI_BOT_LOG_DETAIL_LABELS[key] || String(key || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/^./, (value) => value.toUpperCase());
  }

  function formatAiBotLogScalar(key, value) {
    if (value === undefined || value === null || value === "") {
      return "无";
    }
    if (typeof value === "boolean") {
      return value ? "是" : "否";
    }
    const rawValue = String(value);
    if (Object.prototype.hasOwnProperty.call(AI_BOT_LOG_VALUE_LABELS, rawValue)) {
      return AI_BOT_LOG_VALUE_LABELS[rawValue];
    }
    if (key === "messageTimestamp" && Number.isFinite(Number(value))) {
      return new Date(Number(value)).toLocaleString("zh-CN", { hour12: false });
    }
    return rawValue;
  }

  function getAiBotLogValueClass(key, value) {
    if (value === undefined || value === null || value === "") {
      return " better-settings__ai-bot-log-detail-value--empty";
    }
    if (value === true || ["success", "enqueued"].includes(String(value))) {
      return " better-settings__ai-bot-log-detail-value--success";
    }
    if (value === false || key === "skipReason" || ["error", "skipped", "stopped"].includes(String(value))) {
      return " better-settings__ai-bot-log-detail-value--warn";
    }
    return "";
  }

  const AI_BOT_LOG_DETAIL_KEY_ORDER = [
    "senderName",
    "senderId",
    "messageText",
    "messageTime",
    "repliedText",
    "skipReason",
    "actionResult",
    "actionLabel"
  ];

  function getAiBotLogDetailEntries(detail) {
    const order = new Map(AI_BOT_LOG_DETAIL_KEY_ORDER.map((key, index) => [key, index]));
    return Object.entries(detail || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .sort(([leftKey], [rightKey]) => {
        const leftOrder = order.has(leftKey) ? order.get(leftKey) : AI_BOT_LOG_DETAIL_KEY_ORDER.length;
        const rightOrder = order.has(rightKey) ? order.get(rightKey) : AI_BOT_LOG_DETAIL_KEY_ORDER.length;
        return leftOrder - rightOrder;
      });
  }

  function renderAiBotLogDetailRowsHtml(detail) {
    return getAiBotLogDetailEntries(detail)
      .map(([key, value]) => {
        const label = getAiBotLogDetailLabel(key);
        if (Array.isArray(value)) {
          const itemsHtml = value.length
            ? value.map((item, index) => {
                if (item && typeof item === "object") {
                  return `
                    <div class="better-settings__ai-bot-log-detail-card">
                      <div class="better-settings__ai-bot-log-detail-card-title">第 ${index + 1} 条</div>
                      ${renderAiBotLogDetailRowsHtml(item)}
                    </div>
                  `;
                }
                return `<div class="better-settings__ai-bot-log-detail-card">${escapeHtml(formatAiBotLogScalar(key, item))}</div>`;
              }).join("")
            : `<div class="better-settings__ai-bot-log-detail-value better-settings__ai-bot-log-detail-value--empty">无</div>`;
          return `
            <div class="better-settings__ai-bot-log-detail-group">
              <div class="better-settings__ai-bot-log-detail-group-title">${escapeHtml(label)}（${value.length}）</div>
              ${itemsHtml}
            </div>
          `;
        }
        if (value && typeof value === "object") {
          return `
            <div class="better-settings__ai-bot-log-detail-group">
              <div class="better-settings__ai-bot-log-detail-group-title">${escapeHtml(label)}</div>
              <div class="better-settings__ai-bot-log-detail-card">${renderAiBotLogDetailRowsHtml(value)}</div>
            </div>
          `;
        }
        const codeClass = /(?:Id|Url|Stack|api|endpoint|model)/i.test(key)
          ? " better-settings__ai-bot-log-detail-code"
          : "";
        return `
          <div class="better-settings__ai-bot-log-detail-row">
            <div class="better-settings__ai-bot-log-detail-label">${escapeHtml(label)}</div>
            <div class="better-settings__ai-bot-log-detail-value${getAiBotLogValueClass(key, value)}${codeClass}">${escapeHtml(formatAiBotLogScalar(key, value))}</div>
          </div>
        `;
      }).join("");
  }

  function formatAiBotLogDetailText(detail, indent = "") {
    return getAiBotLogDetailEntries(detail)
      .map(([key, value]) => {
        const label = getAiBotLogDetailLabel(key);
        if (Array.isArray(value)) {
          if (!value.length) {
            return `${indent}${label}：无`;
          }
          return [
            `${indent}${label}（${value.length}）：`,
            ...value.map((item, index) => item && typeof item === "object"
              ? `${indent}  第 ${index + 1} 条：\n${formatAiBotLogDetailText(item, `${indent}    `)}`
              : `${indent}  ${index + 1}. ${formatAiBotLogScalar(key, item)}`)
          ].join("\n");
        }
        if (value && typeof value === "object") {
          return `${indent}${label}：\n${formatAiBotLogDetailText(value, `${indent}  `)}`;
        }
        return `${indent}${label}：${formatAiBotLogScalar(key, value)}`;
      }).join("\n");
  }

  function getAiBotLogId(log) {
    return String(log?.id || log?.timestamp || `${log?.level || ""}:${log?.message || ""}`);
  }

  function getAiBotLogById(logId) {
    return aiBotLogs.find((log) => getAiBotLogId(log) === String(logId || ""));
  }

  function getAiBotLogListSignature(logs) {
    const items = Array.isArray(logs) ? logs : [];
    return `${items.length}:${items.slice(0, 5).map((log) => getAiBotLogId(log)).join("|")}`;
  }

  function renderAiBotLogItemsHtml() {
    return aiBotLogs.length
      ? aiBotLogs.map((log) => `
            ${(() => {
              const logId = getAiBotLogId(log);
              const detailEntries = Object.entries(log.detail || {})
                .filter(([, value]) => value !== undefined && value !== null && value !== "");
              return `
            <div class="better-settings__ai-bot-log">
              <div class="better-settings__ai-bot-log-meta">
                <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--${escapeHtml(log.level || "info")}">${escapeHtml({
                  success: "成功",
                  warn: "提醒",
                  error: "错误",
                  info: "信息"
                }[log.level] || "信息")}</span>
                <span>${escapeHtml(log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false }))}</span>
              </div>
              <div class="better-settings__ai-bot-log-message">${escapeHtml(log.message || "")}</div>
              ${detailEntries.length ? (() => {
                const isExpanded = expandedAiBotLogIds.has(logId);
                const detailSummary = log.level === "error" ? "展开错误详情" : "展开日志详情";
                return `
                  <details class="better-settings__ai-bot-log-detail-wrap" data-log-id="${escapeHtml(logId)}"${isExpanded ? " open" : ""}>
                    <summary class="better-settings__ai-bot-log-detail-summary">${detailSummary}</summary>
                    <button class="better-settings__ai-bot-log-copy" type="button">复制</button>
                    <div class="better-settings__ai-bot-log-detail">${isExpanded ? renderAiBotLogDetailRowsHtml(log.detail || {}) : ""}</div>
                  </details>
                `;
              })() : ""}
            </div>
              `;
            })()}
          `).join("")
      : `<div class="better-settings__empty">暂无 AI Bot 运行日志</div>`;
  }

  function renderAiBotMessageLogItemsHtml() {
    const visibleLogs = activeAiBotMessageLogFilter === "all"
      ? aiBotMessageLogs
      : aiBotMessageLogs.filter((log) => String(log?.messageSource || "") === activeAiBotMessageLogFilter);
    return visibleLogs.length
      ? visibleLogs.map((log) => `
        <div class="better-settings__ai-bot-message-log${log.skipped ? " better-settings__ai-bot-message-log--skipped" : ""}">
          <div class="better-settings__ai-bot-log-meta">
            <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--${log.skipped ? "warn" : "success"}">${escapeHtml(log.skipped ? (log.skipReason === "content_moderation" ? "已跳过" : log.skipReason === "queue_expired" ? "队列超时" : log.skipReason === "send_failed" ? "发送失败" : log.skipReason === "source_disabled" ? "开关关闭" : log.skipReason === "stale" ? "已过期" : log.skipReason === "missing_target" ? "缺少目标" : log.skipReason === "reply_target_limit" ? "次数上限" : log.skipReason === "reply_comment_duplicate" ? "重复评论" : log.skipReason === "rejected_keyword" ? "关键词跳过" : "跳过") : (log.typeLabel || (log.messageSource === "feed" ? "首页推荐帖" : (log.messageSource === "comment" ? "评论" : "@"))))}</span>
            <span>${escapeHtml(log.timeText || new Date(log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false }))}</span>
          </div>
          <div class="better-settings__ai-bot-message-title">${log.linkUrl ? `<a href="${escapeHtml(log.linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(log.linkTitle || `帖子 ${log.linkId || ""}`)}</a>` : escapeHtml(log.linkTitle || `帖子 ${log.linkId || ""}`)}${log.messageSource === "feed" && log.messageTimestamp ? `<span class="better-settings__ai-bot-post-time">${escapeHtml(new Date(log.messageTimestamp).toLocaleString("zh-CN", { hour12: false }))}</span>` : ""}</div>
          <div class="better-settings__ai-bot-message-target">${escapeHtml([
            log.senderName ? `消息发送人：${log.senderName}${log.senderId ? `（${log.senderId}）` : ""}` : "",
            `消息时间：${log.messageTimeText || (log.messageTimestamp ? new Date(log.messageTimestamp).toLocaleString("zh-CN", { hour12: false }) : "未知")}`,
            `发送时间：${log.sentTimeText || log.timeText || new Date(log.sentTimestamp || log.timestamp || Date.now()).toLocaleString("zh-CN", { hour12: false })}`,
            log.linkId ? `帖子ID：${log.linkId}` : "",
            log.replyCommentId ? `回复评论ID：${log.replyCommentId}` : "",
            log.commentId ? `发送评论ID：${log.commentId}` : ""
          ].filter(Boolean).join(" · "))}</div>
          <div class="better-settings__ai-bot-message-source">消息内容：${renderPlainCommentText(log.messageText || log.triggerText || "")}</div>
          <div class="better-settings__ai-bot-message-reply">回复内容：${renderPlainCommentText(log.replyText || "")}</div>
        </div>
      `).join("")
      : `<div class="better-settings__empty">${aiBotMessageLogs.length ? "当前类型暂无消息日志" : "暂无 AI 回复记录"}</div>`;
  }

  function getAiBotMessageLogSignature() {
    const visibleLogs = activeAiBotMessageLogFilter === "all"
      ? aiBotMessageLogs
      : aiBotMessageLogs.filter((log) => String(log?.messageSource || "") === activeAiBotMessageLogFilter);
    return `${activeAiBotMessageLogFilter}:${visibleLogs.length}:${visibleLogs.slice(0, 5).map((log) => String(log?.id || log?.timestamp || "")).join("|")}`;
  }

  function renderAiBotReplyQueueItemsHtml() {
    return aiBotReplyQueue.length
      ? aiBotReplyQueue.map((item) => {
        const queuedAt = Number(item.queuedAt || 0);
        const messageTimestamp = Number(item.messageTimestamp || 0);
        const queueAgeText = queuedAt ? `${Math.max(0, Math.floor((Date.now() - queuedAt) / 1000))} 秒` : "未知";
        const typeLabel = item.messageSource === "feed" ? "首页推荐帖" : (item.messageSource === "comment" ? "评论/回复我的消息" : "@我的消息");
        return `
        <div class="better-settings__ai-bot-message-log">
          <div class="better-settings__ai-bot-log-meta">
            <span class="better-settings__ai-bot-log-level better-settings__ai-bot-log-level--warn">待处理</span>
            <span>${escapeHtml(queuedAt ? new Date(queuedAt).toLocaleString("zh-CN", { hour12: false }) : "未知时间")}</span>
          </div>
          <div class="better-settings__ai-bot-message-title">${escapeHtml(item.context?.detail?.title || `帖子 ${item.linkId || ""}`)}</div>
          <div class="better-settings__ai-bot-message-target">${escapeHtml([
            `类型：${typeLabel}`,
            item.senderName ? `消息发送人：${item.senderName}${item.senderId ? `（${item.senderId}）` : ""}` : "",
            `等待：${queueAgeText}`,
            messageTimestamp ? `消息时间：${new Date(messageTimestamp).toLocaleString("zh-CN", { hour12: false })}` : "",
            item.linkId ? `帖子ID：${item.linkId}` : "",
            item.replyCommentId ? `回复评论ID：${item.replyCommentId}` : "",
            item.rootCommentId ? `根评论ID：${item.rootCommentId}` : ""
          ].filter(Boolean).join(" · "))}</div>
          <div class="better-settings__ai-bot-message-source">消息内容：${renderPlainCommentText(item.messageText || "")}</div>
        </div>
      `;
      }).join("")
      : `<div class="better-settings__empty">暂无待处理消息</div>`;
  }

  function renderAiBotTodayStatsHtml() {
    const stats = getAiBotTodayStats();
    return `
      <div class="better-settings__ai-bot-stats" data-ai-bot-today-stats>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天评论帖子</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.feedComments)}</span>
        </div>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天回复评论</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.commentReplies)}</span>
        </div>
        <div class="better-settings__ai-bot-stat">
          <span class="better-settings__ai-bot-stat-label">今天回复 @</span>
          <span class="better-settings__ai-bot-stat-value">${escapeHtml(stats.mentionReplies)}</span>
        </div>
      </div>
    `;
  }

  function refreshAiBotTodayStatsPanel() {
    const statsPanel = document.querySelector(`.${SETTINGS_PANEL_CLASS} [data-ai-bot-today-stats]`);
    if (statsPanel) {
      statsPanel.outerHTML = renderAiBotTodayStatsHtml();
    }
  }

  function renderAiBotLogsPanelContent() {
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI Bot 运行日志</div>
            <div class="better-settings__ai-subtitle">动态读取本地运行记录</div>
          </div>
        </div>
        <div class="better-settings__ai-body">
          <div class="better-settings__field-title better-settings__ai-bot-log-title">
            <button class="better-settings__text-button better-settings__ai-bot-back-settings" type="button">返回设置</button>
            <button class="better-settings__text-button better-settings__ai-bot-clear-logs" type="button">清空日志</button>
          </div>
          ${renderAiBotTodayStatsHtml()}
          <div class="better-settings__log-switch" role="tablist" aria-label="AI Bot 日志类型">
            <button class="better-settings__log-switch-button${activeAiBotLogView === "runtime" ? " is-active" : ""}" type="button" data-ai-bot-log-view="runtime" role="tab" aria-selected="${activeAiBotLogView === "runtime" ? "true" : "false"}">运行日志</button>
            <button class="better-settings__log-switch-button${activeAiBotLogView === "message" ? " is-active" : ""}" type="button" data-ai-bot-log-view="message" role="tab" aria-selected="${activeAiBotLogView === "message" ? "true" : "false"}">消息日志</button>
            <button class="better-settings__log-switch-button${activeAiBotLogView === "pending" ? " is-active" : ""}" type="button" data-ai-bot-log-view="pending" role="tab" aria-selected="${activeAiBotLogView === "pending" ? "true" : "false"}">待处理消息</button>
          </div>
          <div class="better-settings__ai-bot-message-filter" data-ai-bot-message-filter${activeAiBotLogView === "message" ? "" : " hidden"}>
            ${[
              ["all", "全部"],
              ["mention", "@ 消息"],
              ["comment", "评论/回复"],
              ["feed", "首页推荐帖"]
            ].map(([value, label]) => `<button class="better-settings__ai-bot-message-filter-button${activeAiBotMessageLogFilter === value ? " is-active" : ""}" type="button" data-ai-bot-message-filter-value="${value}">${label}</button>`).join("")}
          </div>
          <div class="better-settings__ai-bot-logs" data-ai-bot-log-panel="runtime" data-signature="${escapeHtml(getAiBotLogListSignature(aiBotLogs))}"${activeAiBotLogView === "runtime" ? "" : " hidden"}>${renderAiBotLogItemsHtml()}</div>
          <div class="better-settings__ai-bot-message-logs" data-ai-bot-log-panel="message" data-signature="${escapeHtml(getAiBotMessageLogSignature())}"${activeAiBotLogView === "message" ? "" : " hidden"}>${renderAiBotMessageLogItemsHtml()}</div>
          <div class="better-settings__ai-bot-message-logs" data-ai-bot-log-panel="pending" data-signature="${escapeHtml(`${aiBotReplyQueue.length}:${aiBotReplyQueue.slice(0, 5).map((item) => String(item?.messageId || item?.queuedAt || "")).join("|")}`)}"${activeAiBotLogView === "pending" ? "" : " hidden"}>${renderAiBotReplyQueueItemsHtml()}</div>
          <div class="better-settings__actions">
            <button class="better-settings__primary better-settings__ai-bot-refresh-logs" type="button">刷新日志</button>
            <span class="better-settings__message" role="status">日志已加载</span>
          </div>
        </div>
      </div>
    `;
  }

  function setAiBotLogView(panel, view) {
    activeAiBotLogView = ["message", "pending"].includes(view) ? view : "runtime";
    panel.querySelectorAll("[data-ai-bot-log-view]").forEach((button) => {
      const active = button.dataset.aiBotLogView === activeAiBotLogView;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    panel.querySelectorAll("[data-ai-bot-log-panel]").forEach((logPanel) => {
      logPanel.hidden = logPanel.dataset.aiBotLogPanel !== activeAiBotLogView;
    });
    const messageFilter = panel.querySelector("[data-ai-bot-message-filter]");
    if (messageFilter) {
      messageFilter.hidden = activeAiBotLogView !== "message";
    }
  }

  function setAiBotMessageLogFilter(panel, filter) {
    activeAiBotMessageLogFilter = ["mention", "comment", "feed"].includes(filter) ? filter : "all";
    uiState = normalizeUiState({
      ...uiState,
      aiBotMessageLogFilter: activeAiBotMessageLogFilter
    });
    persistUiState();
    panel.querySelectorAll("[data-ai-bot-message-filter-value]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.aiBotMessageFilterValue === activeAiBotMessageLogFilter);
    });
    const messageLogList = panel.querySelector('[data-ai-bot-log-panel="message"]');
    if (messageLogList) {
      messageLogList.innerHTML = renderAiBotMessageLogItemsHtml();
      messageLogList.dataset.signature = getAiBotMessageLogSignature();
      messageLogList.scrollTop = 0;
    }
  }

