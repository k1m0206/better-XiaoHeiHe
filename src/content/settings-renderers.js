// AI 设置和 AI Bot 设置表单渲染。
// 本文件由上一级模块继续等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function renderAiSettingsPanelContent() {
    const promptLength = Array.from(aiSettings.summaryPrompt || "").length;
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI 总结</div>
            <div class="better-settings__ai-subtitle">帖子和评论区摘要</div>
          </div>
          <label class="better-settings__ai-master-toggle" title="${aiSettings.enabled ? "关闭 AI 总结" : "开启 AI 总结"}">
            <input class="better-settings__ai-enabled" type="checkbox" aria-label="AI 总结"${aiSettings.enabled ? " checked" : ""}>
            <span class="better-settings__ai-master-control" aria-hidden="true">
              <span class="better-settings__ai-status${aiSettings.enabled ? " is-on" : ""}">${aiSettings.enabled ? "已开启" : "未开启"}</span>
              <span class="better-settings__ai-master-track">
                <span class="better-settings__ai-master-thumb"></span>
              </span>
            </span>
          </label>
        </div>
        <div class="better-settings__ai-body">
          <details class="better-settings__collapsible-section" data-connection-config="ai"${uiState.aiConnectionConfigOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__connection-title">接入配置 ${renderAiConnectionDot("ai", aiSettings)}</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__field">
              <span class="better-settings__field-title">服务商类型</span>
              <select class="better-settings__select better-settings__ai-provider">
                ${renderAiProviderOptions()}
              </select>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">Base URL</span>
              <input class="better-settings__text-input better-settings__ai-base-url" name="better-xiaoheihe-ai-base-url" type="url" value="${escapeHtml(aiSettings.baseUrl)}" autocomplete="section-better-xiaoheihe-ai username" placeholder="https://api.openai.com/v1">
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">
                模型
                <button class="better-settings__text-button better-settings__ai-fetch-models" type="button">拉取模型</button>
              </span>
              <div class="better-settings__ai-model-combobox">
                <input class="better-settings__text-input better-settings__ai-model" name="better-xiaoheihe-ai-model" type="text" value="${escapeHtml(aiSettings.model)}" autocomplete="off" placeholder="gpt-4.1-mini">
                <button class="better-settings__ai-model-dropdown" type="button" aria-label="选择已拉取模型" aria-expanded="false" disabled></button>
                <div class="better-settings__ai-model-menu" role="listbox" hidden></div>
              </div>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">API Key</span>
              <div class="better-settings__connection-input">
                <div class="better-settings__secret-input">
                  <input class="better-settings__text-input better-settings__ai-api-key" name="better-xiaoheihe-ai-api-key" type="password" value="${escapeHtml(aiSettings.apiKey)}" autocomplete="section-better-xiaoheihe-ai current-password" placeholder="sk-...">
                  <button class="better-settings__secret-toggle" type="button" data-secret-input=".better-settings__ai-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button>
                </div>
                <button class="better-settings__primary better-settings__connection-test better-settings__ai-test" type="button">测试连通</button>
              </div>
            </label>
            <div class="better-settings__config-actions">
              <span class="better-settings__message" role="status">${isAiConfigured() ? "已配置" : "请填写 Base URL 和模型"}</span>
            </div>
          </details>
          <details class="better-settings__collapsible-section better-settings__ai-prompt-section" data-ai-prompt-section${uiState.aiPromptSettingsOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary better-settings__ai-prompt-summary">
              <span class="better-settings__connection-title">提示词设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <div class="better-settings__ai-prompt-expand-body">
              <div class="better-settings__ai-prompt-guide">
                <span class="better-settings__ai-prompt-guide-icon" aria-hidden="true">AI</span>
                <span>提示词会与帖子正文及评论一起发送给当前配置的 AI 服务商。</span>
              </div>
              <label class="better-settings__field better-settings__ai-prompt-field">
                <span class="better-settings__field-title">
                  <span>总结提示词</span>
                  <span class="better-settings__ai-prompt-count">${escapeHtml(promptLength)} 字</span>
                </span>
                <textarea class="better-settings__textarea better-settings__ai-summary-prompt" placeholder="描述希望 AI 如何总结帖子和评论区">${escapeHtml(aiSettings.summaryPrompt)}</textarea>
              </label>
              <div class="better-settings__ai-prompt-options">
                <label class="better-settings__ai-prompt-option">
                  <span class="better-settings__ai-prompt-option-copy">
                    <span class="better-settings__ai-prompt-option-title">允许表情</span>
                    <span class="better-settings__ai-prompt-option-desc">允许总结中使用小黑盒表情</span>
                  </span>
                  <input class="better-settings__ai-allow-emoji" type="checkbox"${aiSettings.allowEmoji ? " checked" : ""}>
                  <span class="better-settings__ai-prompt-option-switch" aria-hidden="true"><span></span></span>
                </label>
                <label class="better-settings__ai-prompt-option">
                  <span class="better-settings__ai-prompt-option-copy">
                    <span class="better-settings__ai-prompt-option-title">自动弹出</span>
                    <span class="better-settings__ai-prompt-option-desc">总结完成后自动打开结果窗口</span>
                  </span>
                  <input class="better-settings__ai-auto-popup" type="checkbox"${aiSettings.autoPopup ? " checked" : ""}>
                  <span class="better-settings__ai-prompt-option-switch" aria-hidden="true"><span></span></span>
                </label>
              </div>
              <div class="better-settings__ai-prompt-footer">
                <span class="better-settings__ai-prompt-footer-note">修改内容会即时保存</span>
                <button class="better-settings__ai-prompt-reset better-settings__ai-reset-prompt" type="button">恢复默认提示词</button>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;
  }

  function renderAiBotSettingsPanelContent() {
    if (!aiBotConsentAccepted) {
      return `
        <div class="better-settings__section better-settings__ai-section">
          <div class="better-settings__ai-header">
            <div>
              <div class="better-settings__ai-title">启用 AI Bot 前请确认</div>
              <div class="better-settings__ai-subtitle">该功能会代表当前登录账号自动发表评论</div>
            </div>
          </div>
          <div class="better-settings__ai-body">
            <div class="better-settings__desc">
              开启后，插件会读取相关帖子、评论、昵称或用户 ID，并把生成所需内容发送到你配置的第三方 AI 服务商。自动评论可能出现事实错误、不当表达、重复发送或触发平台风控，相关账号与内容责任由使用者承担。
            </div>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-consent-checkbox" type="checkbox">
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">我已阅读并理解上述风险，并明确授权插件按我的设置自动发表评论</span>
            </label>
            <div class="better-settings__actions">
              <button class="better-settings__primary better-settings__ai-bot-consent-confirm" type="button" disabled>确认并进入设置</button>
            </div>
          </div>
        </div>
      `;
    }
    const providerOptions = [
      [AI_PROVIDERS.OPENAI_COMPATIBLE, "OpenAI Compatible · Chat Completions"],
      [AI_PROVIDERS.OPENAI_RESPONSES, "OpenAI · Responses"],
      [AI_PROVIDERS.ANTHROPIC, "Anthropic · Messages"],
      [AI_PROVIDERS.GEMINI, "Gemini · Generate Content"]
    ].map(([value, label]) => `
      <option value="${escapeHtml(value)}"${aiBotSettings.provider === value ? " selected" : ""}>${escapeHtml(label)}</option>
    `).join("");
    return `
      <div class="better-settings__section better-settings__ai-section">
        <div class="better-settings__ai-header">
          <div>
            <div class="better-settings__ai-title">AI Bot</div>
            <div class="better-settings__ai-subtitle">自动回复 @、评论和首页推荐帖</div>
          </div>
        </div>
        <div class="better-settings__ai-body">
          <details class="better-settings__collapsible-section" data-connection-config="aiBot"${uiState.aiBotConnectionConfigOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__connection-title">接入配置 ${renderAiConnectionDot("aiBot", aiBotSettings)}</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__field">
              <span class="better-settings__field-title">服务商类型</span>
              <select class="better-settings__select better-settings__ai-bot-provider">
                ${providerOptions}
              </select>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">Base URL</span>
              <input class="better-settings__text-input better-settings__ai-bot-base-url" name="better-xiaoheihe-ai-bot-base-url" type="url" value="${escapeHtml(aiBotSettings.baseUrl)}" autocomplete="section-better-xiaoheihe-ai-bot username" placeholder="https://api.openai.com/v1">
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">
                模型
                <button class="better-settings__text-button better-settings__ai-bot-fetch-models" type="button">拉取模型</button>
              </span>
              <div class="better-settings__ai-model-combobox">
                <input class="better-settings__text-input better-settings__ai-bot-model" name="better-xiaoheihe-ai-bot-model" type="text" value="${escapeHtml(aiBotSettings.model)}" autocomplete="off" placeholder="gpt-4.1-mini">
                <button class="better-settings__ai-model-dropdown better-settings__ai-bot-model-dropdown" type="button" aria-label="选择已拉取模型" aria-expanded="false" disabled></button>
                <div class="better-settings__ai-model-menu better-settings__ai-bot-model-menu" role="listbox" hidden></div>
              </div>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">API Key</span>
              <div class="better-settings__connection-input">
                <div class="better-settings__secret-input">
                  <input class="better-settings__text-input better-settings__ai-bot-api-key" name="better-xiaoheihe-ai-bot-api-key" type="password" value="${escapeHtml(aiBotSettings.apiKey)}" autocomplete="section-better-xiaoheihe-ai-bot current-password" placeholder="sk-...">
                  <button class="better-settings__secret-toggle" type="button" data-secret-input=".better-settings__ai-bot-api-key" aria-label="显示 API Key" aria-pressed="false">显示</button>
                </div>
                <button class="better-settings__primary better-settings__connection-test better-settings__ai-bot-test" type="button">测试连通</button>
              </div>
            </label>
            <div class="better-settings__config-actions">
              <span class="better-settings__message" role="status">${aiBotSettings.baseUrl && aiBotSettings.model ? "已配置" : "请填写 Base URL 和模型"}</span>
            </div>
          </details>
          <details class="better-settings__section better-settings__collapsible-section" data-ai-bot-section="auto-reply"${uiState.aiBotAutoReplyOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__section-title">自动回复设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <div class="better-settings__compact-number-grid">
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">轮询评论和@周期（分钟）</span>
                <input class="better-settings__text-input better-settings__ai-bot-poll-minutes" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.pollMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">只处理最近消息（分钟）</span>
                <input class="better-settings__text-input better-settings__ai-bot-fresh-minutes" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.messageFreshMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">每贴每人最多回复（次）</span>
                <input class="better-settings__text-input better-settings__ai-bot-reply-limit" type="number" min="1" step="1" value="${escapeHtml(aiBotSettings.replyLimitPerLinkUser)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">最多历史对话（组）</span>
                <input class="better-settings__text-input better-settings__ai-bot-history-limit" type="number" min="1" max="${AI_BOT_MAX_GLOBAL_HISTORY_LIMIT}" step="1" value="${escapeHtml(aiBotSettings.globalHistoryLimit)}">
              </label>
            </div>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-global-history" type="checkbox"${aiBotSettings.globalHistoryEnabled ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">启用跨帖子历史对话（保留 7 天）</span>
            </label>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-reply-mentions" type="checkbox"${aiBotSettings.replyMentions ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">回复 @ 我的消息</span>
            </label>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-reply-comments" type="checkbox"${aiBotSettings.replyComments ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">回复评论 / 回复我的消息</span>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">白名单用户 ID</span>
              <textarea class="better-settings__textarea better-settings__ai-bot-whitelist" placeholder="空白表示允许回复所有触发用户；多个 ID 可用逗号、空格或换行分隔">${escapeHtml(aiBotSettings.whitelistUserIds.join("\n"))}</textarea>
            </label>
            <label class="better-settings__field">
              <span class="better-settings__field-title">拒绝回复关键词</span>
              <textarea class="better-settings__textarea better-settings__ai-bot-rejected-keywords" placeholder="评论或回复命中任一关键词时直接跳过；多个关键词可用逗号、分号或换行分隔">${escapeHtml(aiBotSettings.rejectedReplyKeywords.join("\n"))}</textarea>
            </label>
            <div class="better-settings__field">
              <div class="better-settings__field-title">
                <span>AI 评论提示词</span>
                <div class="better-settings__field-title-actions">
                  <label class="better-settings__prompt-toggle">
                    <input class="better-settings__ai-bot-allow-emoji" type="checkbox"${aiBotSettings.allowEmoji ? " checked" : ""}>
                    <span>允许表情</span>
                  </label>
                  <button class="better-settings__text-button better-settings__ai-bot-reset-prompt" type="button">恢复默认</button>
                </div>
              </div>
              <textarea class="better-settings__textarea better-settings__ai-bot-comment-prompt">${escapeHtml(aiBotSettings.commentPrompt)}</textarea>
            </div>
          </details>
          <details class="better-settings__section better-settings__collapsible-section better-settings__feed-poll-section" data-ai-bot-section="auto-feed"${uiState.aiBotAutoFeedOpen ? " open" : ""}>
            <summary class="better-settings__collapsible-summary">
              <span class="better-settings__section-title">自动暖贴设置</span>
              <span class="better-settings__collapsible-indicator" aria-hidden="true"></span>
            </summary>
            <label class="better-settings__rule-toggle">
              <input class="better-settings__ai-bot-comment-home-feed" type="checkbox"${aiBotSettings.commentHomeFeed ? " checked" : ""}>
              <span class="better-settings__rule-toggle-switch" aria-hidden="true"></span>
              <span class="better-settings__rule-toggle-text">评论首页推荐帖</span>
            </label>
            <div class="better-settings__compact-number-grid">
              <label class="better-settings__field better-settings__field--compact-number">
                <span class="better-settings__field-title">评论周期（分钟，最低10）</span>
                <input class="better-settings__text-input better-settings__ai-bot-feed-poll-minutes" type="number" min="${AI_BOT_MIN_FEED_POLL_MINUTES}" step="1" value="${escapeHtml(aiBotSettings.feedPollMinutes)}">
              </label>
              <label class="better-settings__field better-settings__field--compact-number better-settings__field--feed-strategy">
                <span class="better-settings__field-title">帖子挑选策略</span>
                <select class="better-settings__select better-settings__ai-bot-feed-select-strategy">
                  <option value="first"${aiBotSettings.feedSelectStrategy === "first" ? " selected" : ""}>默认（第一条）</option>
                  <option value="latest"${aiBotSettings.feedSelectStrategy === "latest" ? " selected" : ""}>发布时间最新</option>
                  <option value="hot"${aiBotSettings.feedSelectStrategy === "hot" ? " selected" : ""}>热度最高</option>
                </select>
              </label>
            </div>
            <div class="better-settings__field">
              <div class="better-settings__field-title">
                <span>暖贴提示词</span>
                <button class="better-settings__text-button better-settings__ai-bot-reset-feed-prompt" type="button">恢复默认</button>
              </div>
              <textarea class="better-settings__textarea better-settings__ai-bot-feed-comment-prompt">${escapeHtml(aiBotSettings.feedCommentPrompt)}</textarea>
            </div>
          </details>
          <div class="better-settings__actions">
            <button class="better-settings__primary better-settings__ai-bot-view-logs" type="button">查看运行日志</button>
          </div>
        </div>
      </div>
    `;
  }

  const AI_BOT_LOG_DETAIL_LABELS = {
    enabled: "功能已启用",
    count: "消息数量",
    processedCount: "处理数量",
    queueCount: "队列数量",
    queuedCount: "排队中数量",
    queuedAt: "入队时间戳",
    queuedAtText: "入队时间",
    queuedSeconds: "已排队（秒）",
    queueAge: "队列等待时长",
    queueAgeSeconds: "队列等待（秒）",
    remainingCount: "剩余数量",
    droppedCount: "清理数量",
    droppedMessages: "已清理消息",
    trimmed: "因队列上限移除数量",
    reason: "触发原因",
    action: "处理动作",
    actionResult: "处理结果",
    actionLabel: "结果说明",
    skipReason: "跳过原因",
    matchedKeyword: "命中的拒绝回复关键词",
    moderationReason: "内容审查具体原因",
    moderationReasonDetail: "内容审查原因说明",
    modelResponsePreview: "模型返回内容预览",
    freshMinutes: "有效时间窗口（分钟）",
    ageMinutes: "消息已过去（分钟）",
    messageAgeMinutes: "消息已过去（分钟）",
    queueAgeMinutes: "队列等待（分钟）",
    pollMinutes: "轮询周期（分钟）",
    feedPollMinutes: "暖贴周期（分钟）",
    replyMentions: "回复 @",
    replyComments: "回复评论",
    commentHomeFeed: "首页暖贴",
    messageSource: "消息来源",
    typeLabel: "消息类型",
    messageId: "消息 ID",
    messageType: "消息类型代码",
    messageText: "消息内容",
    notificationText: "通知描述",
    repliedText: "被回复的内容",
    triggerText: "触发内容",
    replyText: "回复内容",
    messageTime: "发送时间",
    messageTimeText: "发送时间",
    messageTimestamp: "发送时间戳",
    senderName: "发送人",
    senderId: "发送人 ID",
    targetId: "回复目标",
    linkTitle: "帖子标题",
    linkId: "帖子 ID",
    linkTag: "帖子标签",
    linkUrl: "帖子链接",
    replyCommentId: "回复评论 ID",
    rootCommentId: "根评论 ID",
    effectiveReplyCommentId: "实际回复评论 ID",
    replyTargetSource: "回复目标来源",
    commentId: "发送评论 ID",
    skippedAt: "跳过时间戳",
    sentAt: "发送时间戳",
    sentTimeText: "发送时间",
    record: "处理记录",
    context: "上下文",
    detail: "附加详情",
    groups: "分组信息",
    messages: "消息明细",
    results: "处理结果明细",
    whitelistUserIds: "白名单用户 ID",
    replyLimit: "回复次数上限",
    limit: "次数上限",
    sentCount: "已发送数量",
    pendingCount: "待处理数量",
    totalCount: "合计数量",
    replyPreview: "回复内容预览",
    replyLength: "回复字数",
    strategy: "挑选策略",
    selectedIndex: "选中位置",
    candidateCount: "候选数量",
    error: "错误信息",
    errorName: "错误类型",
    errorMessage: "错误信息",
    errorStack: "错误堆栈",
    stage: "失败阶段",
    status: "状态",
    responseStatus: "响应状态码",
    responseText: "响应内容",
    apiUrl: "接口地址",
    endpoint: "接口地址",
    model: "AI 模型",
    linkAuthor: "帖子作者",
    feedCommentNum: "评论数量",
    feedUp: "点赞数量",
    waitSeconds: "还需等待（秒）",
    intervalMinutes: "间隔时间（分钟）",
    lastFeedTime: "上次暖贴时间",
    ok: "执行成功",
    skipped: "是否跳过"
  };

  const AI_BOT_LOG_VALUE_LABELS = {
    true: "是",
    false: "否",
    alarm: "定时轮询",
    manual: "手动触发",
    startup: "启动检查",
    mention: "@ 我的消息",
    comment: "评论/回复我的消息",
    feed: "首页推荐帖",
    stale: "超过时间窗口",
    source_disabled: "对应回复开关已关闭",
    bot_disabled: "AI Bot 已关闭",
    whitelist_miss: "发送人不在白名单",
    content_moderation: "内容审查未通过",
    empty_model_response: "AI 接口返回内容为空",
    model_refused: "模型返回 [REFUSE]",
    empty_model_content: "模型没有返回可用内容",
    reply_removed_by_cleanup: "回复清理后为空",
    unknown_empty_reply: "未识别的空回复",
    missing_target: "缺少回复目标",
    reply_target_limit: "同帖同人回复次数达到上限",
    reply_comment_duplicate: "同一条评论已处理",
    queue_expired: "队列等待超时",
    send_failed: "发送失败",
    skipped: "已跳过",
    stopped: "已停止",
    enqueued: "已加入队列",
    success: "成功",
    error: "失败",
    first: "默认第一条",
    latest: "发布时间最新",
    hot: "热度最高"
  };

