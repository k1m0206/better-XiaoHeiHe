// AI 总结弹窗、Markdown 渲染和总结请求编排。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function positionAiSummaryDialog(dialog) {
    if (!dialog) {
      return;
    }
    const savedLeft = uiState.aiSummaryWindowLeft;
    const savedTop = uiState.aiSummaryWindowTop;
    if (!Number.isFinite(savedLeft) || !Number.isFinite(savedTop)) {
      dialog.style.left = "50%";
      dialog.style.top = "50%";
      dialog.style.right = "auto";
      dialog.style.transform = "translate(-50%, -50%)";
      return;
    }
    dialog.style.transform = "none";
    dialog.style.right = "auto";
    const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);
    dialog.style.left = `${Math.min(maxLeft, Math.max(0, savedLeft))}px`;
    dialog.style.top = `${Math.min(maxTop, Math.max(0, savedTop))}px`;
  }

  function persistAiSummaryDialogPosition(dialog) {
    if (!dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    uiState = normalizeUiState({
      ...uiState,
      aiSummaryWindowLeft: Math.round(rect.left),
      aiSummaryWindowTop: Math.round(rect.top)
    });
    persistUiState();
  }

  function ensureAiSummaryModal() {
    let modal = document.querySelector(`.${AI_SUMMARY_MODAL_CLASS}`);
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.className = AI_SUMMARY_MODAL_CLASS;
    modal.hidden = true;
    modal.innerHTML = `
      <div class="better-ai-summary__dialog" role="dialog" aria-modal="false" aria-labelledby="better-ai-summary-title">
        <div class="better-ai-summary__header">
          <div class="better-ai-summary__title" id="better-ai-summary-title">AI 总结</div>
          <div class="better-ai-summary__meta"></div>
          <div class="better-ai-summary__actions">
            <label class="better-ai-summary__auto-popup" title="总结完成后自动打开总结窗口">
              <input type="checkbox"${aiSettings.autoPopup ? " checked" : ""}>
              <span>自动弹出</span>
            </label>
            <button class="better-ai-summary__regenerate" type="button">重新总结</button>
            <button class="better-ai-summary__close" type="button" aria-label="关闭">×</button>
          </div>
        </div>
        <div class="better-ai-summary__body is-muted">
          <div class="better-ai-summary__summary-content">准备中...</div>
          <div class="better-ai-summary__chat-messages" aria-live="polite"></div>
        </div>
        <div class="better-ai-summary__chat">
          <form class="better-ai-summary__chat-form">
            <textarea class="better-ai-summary__chat-input" rows="1" placeholder="继续问 AI 一个问题"></textarea>
            <button class="better-ai-summary__chat-send" type="submit">发送</button>
          </form>
        </div>
      </div>
    `;
    modal.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target === modal || event.target.closest(".better-ai-summary__close")) {
        closeAiSummaryModal();
        return;
      }

      if (event.target.closest(".better-ai-summary__regenerate")) {
        const linkId = modal.dataset.linkId || "";
        closeAiSummaryModal();
        if (linkId) {
          aiSummaryCache.delete(linkId);
          const item = findFeedItemByLinkId(linkId);
          const button = item?.querySelector(".better-ai-summary-button");
          if (item) {
            summarizeFeedItem(item, linkId, button, { force: true });
          } else if (isLinkPage() && getCurrentLinkId() === linkId) {
            summarizeLinkPage(getLinkPageAiSummaryButton(), { force: true });
          }
        }
      }
    });
    modal.addEventListener("submit", (event) => {
      const form = event.target instanceof Element ? event.target.closest(".better-ai-summary__chat-form") : null;
      if (!form || !modal.contains(form)) {
        return;
      }

      event.preventDefault();
      submitAiSummaryChatQuestion(modal);
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.isComposing) {
        return;
      }

      const input = event.target instanceof Element ? event.target.closest(".better-ai-summary__chat-input") : null;
      if (!input || !modal.contains(input)) {
        return;
      }

      event.preventDefault();
      submitAiSummaryChatQuestion(modal);
    });
    modal.addEventListener("change", (event) => {
      const input = event.target instanceof Element ? event.target.closest(".better-ai-summary__auto-popup input") : null;
      if (!input) {
        return;
      }
      aiSettings = normalizeAiSettings({
        ...aiSettings,
        autoPopup: input.checked
      });
      window.dispatchEvent(new CustomEvent(AI_SETTINGS_SAVE_EVENT, {
        detail: JSON.stringify(aiSettings)
      }));
    });
    const dialog = modal.querySelector(".better-ai-summary__dialog");
    const header = modal.querySelector(".better-ai-summary__header");
    header?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".better-ai-summary__actions")) {
        return;
      }
      const rect = dialog.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      dialog.style.left = `${rect.left}px`;
      dialog.style.top = `${rect.top}px`;
      dialog.style.right = "auto";
      dialog.style.transform = "none";
      header.setPointerCapture?.(event.pointerId);

      const moveDialog = (moveEvent) => {
        const maxLeft = Math.max(0, window.innerWidth - dialog.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - dialog.offsetHeight);
        const left = Math.min(maxLeft, Math.max(0, moveEvent.clientX - offsetX));
        const top = Math.min(maxTop, Math.max(0, moveEvent.clientY - offsetY));
        dialog.style.left = `${left}px`;
        dialog.style.top = `${top}px`;
      };
      const stopDragging = () => {
        persistAiSummaryDialogPosition(dialog);
        header.removeEventListener("pointermove", moveDialog);
        header.removeEventListener("pointerup", stopDragging);
        header.removeEventListener("pointercancel", stopDragging);
      };
      header.addEventListener("pointermove", moveDialog);
      header.addEventListener("pointerup", stopDragging);
      header.addEventListener("pointercancel", stopDragging);
      event.preventDefault();
    });
    window.addEventListener("resize", () => {
      if (!modal.hidden) {
        positionAiSummaryDialog(dialog);
      }
    });
    document.body.appendChild(modal);
    return modal;
  }

  function lockAiSummaryPageScroll() {
    lockPageScroll(AI_SUMMARY_MODAL_CLASS);
  }

  function unlockAiSummaryPageScroll() {
    unlockPageScroll(AI_SUMMARY_MODAL_CLASS);
  }

  function closeAiSummaryModal() {
    const modal = document.querySelector(`.${AI_SUMMARY_MODAL_CLASS}`);
    if (modal) {
      modal.hidden = true;
    }
    unlockAiSummaryPageScroll();
  }

  function formatAiElapsedSeconds(elapsedMs) {
    const seconds = Number(elapsedMs) / 1000;
    return Number.isFinite(seconds) && seconds >= 0 ? seconds.toFixed(1) : "";
  }

  function normalizeAiSummaryCacheEntry(entry) {
    if (entry && typeof entry === "object") {
      return {
        content: cleanAiSummaryContent(entry.content, aiSettings.allowEmoji),
        elapsedMs: Number.isFinite(entry.elapsedMs) ? entry.elapsedMs : null,
        payload: String(entry.payload || ""),
        chatMessages: Array.isArray(entry.chatMessages)
          ? entry.chatMessages.map((message) => ({
            role: message?.role === "user" ? "user" : "assistant",
            content: message?.role === "user" ? String(message?.content || "") : cleanAiSummaryContent(message?.content, aiSettings.allowEmoji),
            muted: message?.muted === true,
            pending: message?.pending === true,
            elapsedMs: Number.isFinite(message?.elapsedMs) ? message.elapsedMs : null
          })).filter((message) => message.content)
          : []
      };
    }

    return {
      content: cleanAiSummaryContent(entry, aiSettings.allowEmoji),
      elapsedMs: null,
      payload: "",
      chatMessages: []
    };
  }

  function renderAiSummaryChatMessage(message) {
    const role = message?.role === "user" ? "user" : "assistant";
    const mutedClass = message?.muted ? " better-ai-summary__chat-message--muted" : "";
    const content = role === "assistant" ? renderMarkdown(message?.content || "") : escapeHtml(message?.content || "");
    const elapsedSeconds = role === "assistant" && !message?.pending ? formatAiElapsedSeconds(message?.elapsedMs) : "";
    const meta = elapsedSeconds ? `<div class="better-ai-summary__chat-message-meta">思考耗时 ${elapsedSeconds} 秒</div>` : "";
    return `<div class="better-ai-summary__chat-message better-ai-summary__chat-message--${role}${mutedClass}">${content}${meta}</div>`;
  }

  function renderAiSummaryChatMessages(messagesElement, messages) {
    if (!messagesElement) {
      return;
    }

    messagesElement.innerHTML = (messages || []).map(renderAiSummaryChatMessage).join("");
    const body = messagesElement.closest(".better-ai-summary__body");
    if (body && messages?.length) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function setAiSummaryChatControls(modal, enabled) {
    const input = modal.querySelector(".better-ai-summary__chat-input");
    const sendButton = modal.querySelector(".better-ai-summary__chat-send");
    if (input) {
      input.disabled = !enabled;
      input.placeholder = enabled ? "继续问 AI 一个问题" : "生成总结后可继续追问";
    }
    if (sendButton) {
      sendButton.disabled = !enabled;
    }
  }

  function syncAiSummaryChatPanel(modal, linkId) {
    const messagesElement = modal.querySelector(".better-ai-summary__chat-messages");
    const cacheEntry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    renderAiSummaryChatMessages(messagesElement, cacheEntry.chatMessages);
    setAiSummaryChatControls(modal, Boolean(linkId && cacheEntry.content && cacheEntry.payload && isAiConfigured() && !aiSummaryChatSending.has(linkId)));
  }

  function getAiSummaryChatContextMessage(entry) {
    return [
      "下面是同一篇社区帖子的上下文。请优先基于这些内容回答；如果用户的问题需要帖子外的信息，可以结合你的通用知识补充；如果当前 AI 服务支持联网搜索或检索工具，也允许进行网络搜索。请明确区分哪些是帖子内容、哪些是额外补充、推断或搜索信息；引用网络搜索结果时必须标注出处链接。",
      "",
      "帖子上下文：",
      entry.payload,
      "",
      "已有总结：",
      entry.content
    ].join("\n");
  }

  function buildAiSummaryChatMessages(entry, question) {
    return [
      {
        role: "system",
        content: buildAiSummarySystemPrompt("你现在要继续回答用户围绕同一篇帖子提出的问题。回答要简洁、直接，并延续已有上下文；需要时可以结合帖子外的通用知识进行补充；如果当前 AI 服务支持联网搜索或检索工具，也允许进行网络搜索。不要把补充或搜索得到的内容伪装成原帖信息；引用网络搜索结果时必须标注出处链接。")
      },
      {
        role: "user",
        content: getAiSummaryChatContextMessage(entry)
      },
      ...entry.chatMessages
        .filter((message) => !message.pending && !message.muted)
        .map((message) => ({
          role: message.role,
          content: message.content
        })),
      {
        role: "user",
        content: question
      }
    ];
  }

  function updateAiSummaryChatCache(linkId, updater) {
    const entry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    const nextEntry = updater(entry) || entry;
    aiSummaryCache.set(linkId, nextEntry);
    return nextEntry;
  }

  function submitAiSummaryChatQuestion(modal) {
    const linkId = modal.dataset.linkId || "";
    const input = modal.querySelector(".better-ai-summary__chat-input");
    const question = input?.value?.trim() || "";
    if (!linkId || !question || aiSummaryChatSending.has(linkId)) {
      return;
    }

    const entry = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
    if (!entry.content || !entry.payload || !isAiConfigured()) {
      syncAiSummaryChatPanel(modal, linkId);
      return;
    }

    if (input) {
      input.value = "";
    }

    const requestMessages = buildAiSummaryChatMessages(entry, question);
    aiSummaryChatSending.add(linkId);
    const chatStartTime = performance.now();
    const messagesElement = modal.querySelector(".better-ai-summary__chat-messages");
    const nextEntry = updateAiSummaryChatCache(linkId, (cacheEntry) => ({
      ...cacheEntry,
      chatMessages: [
        ...cacheEntry.chatMessages,
        { role: "user", content: question },
        { role: "assistant", content: "正在思考...", muted: true, pending: true }
      ]
    }));
    renderAiSummaryChatMessages(messagesElement, nextEntry.chatMessages);
    setAiSummaryChatControls(modal, false);

    requestAiChat(requestMessages).then((answer) => {
      const elapsedMs = performance.now() - chatStartTime;
      updateAiSummaryChatCache(linkId, (cacheEntry) => ({
        ...cacheEntry,
        chatMessages: [
          ...cacheEntry.chatMessages.filter((message) => !message.pending),
          { role: "assistant", content: cleanAiSummaryContent(answer, aiSettings.allowEmoji) || "模型没有返回内容", elapsedMs }
        ]
      }));
    }).catch((error) => {
      const elapsedMs = performance.now() - chatStartTime;
      updateAiSummaryChatCache(linkId, (cacheEntry) => ({
        ...cacheEntry,
        chatMessages: [
          ...cacheEntry.chatMessages.filter((message) => !message.pending),
          { role: "assistant", content: error?.message || "AI 请求失败", muted: true, elapsedMs }
        ]
      }));
    }).finally(() => {
      aiSummaryChatSending.delete(linkId);
      syncAiSummaryChatPanel(modal, linkId);
      input?.focus();
    });
  }

  function setAiSummaryModal(title, content, muted = false, linkId = "", elapsedMs = null) {
    const modal = ensureAiSummaryModal();
    const titleElement = modal.querySelector(".better-ai-summary__title");
    const metaElement = modal.querySelector(".better-ai-summary__meta");
    const body = modal.querySelector(".better-ai-summary__body");
    const contentElement = modal.querySelector(".better-ai-summary__summary-content");
    modal.dataset.linkId = linkId || "";
    if (titleElement) {
      titleElement.textContent = title || "AI 总结";
    }
    if (metaElement) {
      const elapsedSeconds = formatAiElapsedSeconds(elapsedMs);
      metaElement.textContent = elapsedSeconds ? `总结耗时 ${elapsedSeconds} 秒` : "";
    }
    if (contentElement) {
      contentElement.innerHTML = muted ? escapeHtml(content || "") : renderMarkdown(content || "");
    }
    if (body) {
      body.classList.toggle("is-muted", muted);
    }
    const autoPopupInput = modal.querySelector(".better-ai-summary__auto-popup input");
    if (autoPopupInput) {
      autoPopupInput.checked = aiSettings.autoPopup;
    }
    modal.hidden = false;
    positionAiSummaryDialog(modal.querySelector(".better-ai-summary__dialog"));
    syncAiSummaryChatPanel(modal, linkId);
  }

  function findFeedItemByLinkId(linkId) {
    return Array.from(document.querySelectorAll(FEED_ITEM_SELECTOR))
      .find((item) => getLinkIdFromItem(item) === String(linkId)) || null;
  }

  function renderInlineMarkdown(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return renderEmojiTokensInHtml(html);
  }

  function renderMarkdownBlock(lines) {
    if (!lines.length) {
      return "";
    }

    const firstLine = lines[0] || "";
    const heading = firstLine.match(/^(#{1,3})\s*(.+)$/);
    if (heading && lines.length === 1) {
      const level = heading[1].length;
      return `<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`;
    }

    if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      return `<ul>${lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
    }

    if (lines.every((line) => /^\s*\d+\.\s+/.test(line))) {
      return `<ol>${lines.map((line) => `<li>${renderInlineMarkdown(line.replace(/^\s*\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
    }

    if (lines.every((line) => /^\s*>\s?/.test(line))) {
      return `<blockquote>${lines.map((line) => `<p>${renderInlineMarkdown(line.replace(/^\s*>\s?/, ""))}</p>`).join("")}</blockquote>`;
    }

    return `<p>${lines.map(renderInlineMarkdown).join("<br>")}</p>`;
  }

  function unwrapMarkdownCodeFence(markdown) {
    const text = String(markdown || "").replace(/\r\n?/g, "\n").trim();
    const match = text.match(/^```(?:md|markdown)\s*\n([\s\S]*?)\n```$/i);
    return match ? match[1].trim() : text;
  }

  function renderMarkdown(markdown) {
    const lines = unwrapMarkdownCodeFence(markdown).split("\n");
    const blocks = [];
    let blockLines = [];
    let blockType = "";
    let codeLines = [];
    let inCodeBlock = false;

    const getLineType = (line) => {
      if (/^(#{1,3})\s*.+$/.test(line)) {
        return "heading";
      }

      if (/^\s*[-*]\s+/.test(line)) {
        return "unordered-list";
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        return "ordered-list";
      }

      if (/^\s*>\s?/.test(line)) {
        return "blockquote";
      }

      return "paragraph";
    };

    const flushBlock = () => {
      if (blockLines.length) {
        blocks.push(renderMarkdownBlock(blockLines));
        blockLines = [];
        blockType = "";
      }
    };

    lines.forEach((line) => {
      if (/^```/.test(line.trim())) {
        if (inCodeBlock) {
          blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          inCodeBlock = false;
        } else {
          flushBlock();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (!line.trim()) {
        flushBlock();
        return;
      }

      const lineType = getLineType(line);
      if (lineType === "heading") {
        flushBlock();
        blocks.push(renderMarkdownBlock([line]));
        return;
      }

      if (blockType && blockType !== lineType) {
        flushBlock();
      }

      blockType = lineType;
      blockLines.push(line);
    });

    if (inCodeBlock) {
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }
    flushBlock();
    return blocks.join("");
  }

  function extractPlainCommentText(text) {
    const template = document.createElement("template");
    template.innerHTML = String(text || "");
    return normalizeCommentText(template.content.textContent || text);
  }

  function getCommentAuthor(comment) {
    return comment?.user?.username || comment?.user?.nickname || "匿名用户";
  }

  function getSummaryCommentEntries(groups) {
    let order = 0;
    return (groups || []).flatMap((group) => {
      const comments = [group.root, ...(group.replies || [])].filter(Boolean);
      return comments.map((comment) => {
        order += 1;
        return {
          line: `${getCommentAuthor(comment)}：${extractPlainCommentText(comment.text)}`.trim(),
          up: getCommentUpCount(comment),
          order
        };
      });
    }).filter((entry) => entry.line);
  }

  function selectSummaryCommentLines(entries) {
    const normalizedEntries = Array.isArray(entries) ? entries : [];
    const selectedEntries = normalizedEntries.length > SUMMARY_COMMENT_LIMIT
      ? normalizedEntries
        .slice()
        .sort((a, b) => (b.up - a.up) || (a.order - b.order))
        .slice(0, SUMMARY_COMMENT_LIMIT)
      : normalizedEntries;
    return selectedEntries
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((entry) => entry.line);
  }

  function getSummaryCommentLines(groups) {
    return selectSummaryCommentLines(getSummaryCommentEntries(groups));
  }

  function getCachedSummaryCommentLines(linkId) {
    const state = commentCache.get(linkId);
    return getSummaryCommentLines(state?.commentGroups);
  }

  function getCachedLinkDetail(linkId) {
    return commentCache.get(linkId)?.linkDetail || null;
  }

  function ensureLinkDetail(linkId) {
    const cachedDetail = getCachedLinkDetail(linkId);
    if (cachedDetail?.content) {
      return Promise.resolve(cachedDetail);
    }

    return fetchCommentPageData(linkId, 1)
      .then((data) => {
        cacheCommentPageFromApiData(linkId, 1, data, { onlyIfEmpty: true });
        return getCachedLinkDetail(linkId);
      })
      .catch(() => getCachedLinkDetail(linkId));
  }

  function ensureSummaryContext(linkId) {
    return ensureLinkDetail(linkId).then((linkDetail) => {
      const cachedCommentLines = getCachedSummaryCommentLines(linkId);
      if (cachedCommentLines.length) {
        return { commentLines: cachedCommentLines, linkDetail };
      }

      return ensureSummaryComments(linkId).then((commentLines) => ({ commentLines, linkDetail: getCachedLinkDetail(linkId) || linkDetail }));
    });
  }

  function getFeedItemSummaryPayload(item, linkId, commentLines, linkDetail = null) {
    const title = linkDetail?.title || item.querySelector(".bbs-content__title")?.textContent?.trim() || "";
    const author = linkDetail?.author || getFeedItemAuthorText(item);
    const content = linkDetail?.content || item.querySelector(".bbs-content__content")?.textContent?.trim() || "";
    const topic = linkDetail?.topic || getFeedItemTopicText(item);
    const imageUrls = uniqueStrings([...(linkDetail?.imageUrls || []), ...getFeedItemImageUrls(item)]);
    return [
      `帖子 ID：${linkId}`,
      title ? `标题：${title}` : "",
      author ? `作者：${author}` : "",
      content ? `正文：${content}` : "",
      imageUrls.length ? `正文图片链接：\n${imageUrls.join("\n")}` : "",
      topic ? `话题：${topic}` : "",
      commentLines.length ? `评论区（${SUMMARY_COMMENT_LIMIT} 条以内，超过时优先点赞多的评论）：\n${commentLines.join("\n")}` : "评论区：暂无已加载评论"
    ].filter(Boolean).join("\n\n");
  }

  function getLinkPageTitle() {
    return document.querySelector(".hb-bbs-link .section-title__content")?.textContent?.trim() || "";
  }

  function getLinkPageAuthorText() {
    return document.querySelector(".hb-bbs-link .link-user__username")?.textContent?.trim() || "";
  }

  function getLinkPageContentText() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .post__content .com-text"))
      .map((node) => node.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getLinkPageTopicText() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .link-section-tags .content-tag-text"))
      .map((tag) => tag.textContent?.trim())
      .filter(Boolean)
      .join("\n");
  }

  function getLinkPageImageUrls() {
    return Array.from(document.querySelectorAll(".hb-bbs-link .post__content img.hb-cpt__image-elem"))
      .map((image) => image.src || image.getAttribute("src") || "")
      .filter(Boolean);
  }

  function getLinkPageSummaryPayload(linkId, commentLines, linkDetail = null) {
    const title = linkDetail?.title || getLinkPageTitle();
    const author = linkDetail?.author || getLinkPageAuthorText();
    const content = linkDetail?.content || getLinkPageContentText();
    const topic = linkDetail?.topic || getLinkPageTopicText();
    const imageUrls = uniqueStrings([...(linkDetail?.imageUrls || []), ...getLinkPageImageUrls()]);
    return [
      `帖子 ID：${linkId}`,
      title ? `标题：${title}` : "",
      author ? `作者：${author}` : "",
      content ? `正文：${content}` : "",
      imageUrls.length ? `正文图片链接：\n${imageUrls.join("\n")}` : "",
      topic ? `话题：${topic}` : "",
      commentLines.length ? `评论区（${SUMMARY_COMMENT_LIMIT} 条以内，超过时优先点赞多的评论）：\n${commentLines.join("\n")}` : "评论区：暂无已加载评论"
    ].filter(Boolean).join("\n\n");
  }

  function requestAiChat(messages, temperature = 0.2) {
    return new Promise((resolve, reject) => {
      const id = `better-ai-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const timeout = window.setTimeout(() => {
        aiPendingRequests.delete(id);
        setAiConnectionStatus("ai", "error");
        reject(new Error("AI 请求超时"));
      }, 60000);

      aiPendingRequests.set(id, { resolve, reject, timeout });
      window.dispatchEvent(new CustomEvent(AI_CHAT_REQUEST_EVENT, {
        detail: JSON.stringify({
          id,
          messages,
          temperature
        })
      }));
    });
  }

  function getAiSummaryEmojiCodes(limit = 120) {
    const codes = [...new Set(Array.from(emojiCache.values())
      .map((emoji) => normalizeEmojiToken(emoji?.code))
      .filter((code) => code && !/^\d+$/.test(code) && !/^https?:\/\//i.test(code))
      .map((code) => `[${code}]`)
      .filter((code) => /^\[[^\]\r\n]{1,40}\]$/.test(code)))];
    return codes.slice(0, limit);
  }

  function buildAiSummarySystemPrompt(extraInstruction = "") {
    const emojiCodes = getAiSummaryEmojiCodes();
    return [
      aiSettings.summaryPrompt,
      "",
      aiSettings.allowEmoji
        ? (emojiCodes.length
          ? `可以自然使用 Unicode emoji 表情，也可以使用 0-3 个列表内小黑盒表情短码：${emojiCodes.join(" ")}。不要编造列表外的方括号短码，不要输出纯数字方括号编号，例如 [34]、[64]。`
          : "可以自然使用 Unicode emoji 表情；没有可用小黑盒表情短码时，不要输出方括号表情短码。")
        : "不要使用 Unicode emoji 表情，不要输出任何小黑盒表情短码或方括号表情。",
      extraInstruction
    ].filter((part) => String(part || "").trim()).join("\n\n");
  }

  function handleAiChatResponse(event) {
    let detail = {};
    try {
      detail = typeof event.detail === "string" ? JSON.parse(event.detail) : (event.detail || {});
    } catch {
      detail = {};
    }
    const pending = aiPendingRequests.get(detail.id);
    if (!pending) {
      return;
    }

    window.clearTimeout(pending.timeout);
    aiPendingRequests.delete(detail.id);
    if (detail.ok) {
      setAiConnectionStatus("ai", "ok");
      pending.resolve(detail.content || "");
    } else {
      setAiConnectionStatus("ai", "error");
      pending.reject(new Error(detail.error || "AI 请求失败"));
    }
  }

  function hasLoadedAllSummaryComments(state) {
    return Boolean(state) && state.hasMore === false;
  }

  function mergeSummaryCommentPageState(linkId, page, data) {
    const state = cacheCommentPageFromApiData(linkId, page, data) || commentCache.get(linkId) || { commentGroups: [] };
    renderLinkedPreviews(linkId);
    return state;
  }

  function fetchSummaryCommentPages(linkId, page = 1) {
    return fetchCommentPageData(linkId, page).then((data) => {
      if (data?.status !== "ok") {
        return commentCache.get(linkId);
      }

      const state = mergeSummaryCommentPageState(linkId, page, data);
      if (!state.hasMore) {
        return state;
      }

      return fetchSummaryCommentPages(linkId, page + 1);
    }).catch(() => commentCache.get(linkId));
  }

  function ensureSummaryComments(linkId) {
    const cachedState = commentCache.get(linkId);
    if (hasLoadedAllSummaryComments(cachedState)) {
      return Promise.resolve(getSummaryCommentLines(cachedState.commentGroups));
    }

    return fetchSummaryCommentPages(linkId, 1).then((state) => {
      return getSummaryCommentLines(state?.commentGroups);
    });
  }

  function setAiButtonLoading(button, isLoading) {
    if (!button) {
      return;
    }

    if (isLoading) {
      button.classList.remove("is-complete");
    }
    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
  }

  function setAiButtonComplete(button, isComplete) {
    if (!button) {
      return;
    }
    button.classList.toggle("is-complete", isComplete);
    button.textContent = isComplete ? "" : "AI";
    button.title = isComplete ? "查看 AI 总结" : "AI 总结";
    button.setAttribute("aria-label", button.title);
  }

  function summarizeFeedItem(item, linkId, button, options = {}) {
    if (button?.classList.contains("is-loading")) {
      return;
    }

    const title = item.querySelector(".bbs-content__title")?.textContent?.trim() || "AI 总结";
    if (!options.force && aiSummaryCache.has(linkId)) {
      const cachedSummary = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
      setAiButtonComplete(button, true);
      setAiSummaryModal(title, cachedSummary.content, false, linkId, cachedSummary.elapsedMs);
      return;
    }

    if (!isAiConfigured()) {
      openSettingsPanelTab(SETTINGS_TABS.AI);
      return;
    }

    setAiButtonLoading(button, true);
    const summaryStartTime = performance.now();
    Promise.all([ensureSummaryContext(linkId), aiSettings.allowEmoji ? loadEmojis() : Promise.resolve(emojiCache)]).then(([{ commentLines, linkDetail }]) => {
      const payload = getFeedItemSummaryPayload(item, linkId, commentLines, linkDetail);
      return requestAiChat([
        {
          role: "system",
          content: buildAiSummarySystemPrompt()
        },
        {
          role: "user",
          content: payload
        }
      ]).then((summary) => ({ summary, payload }));
    }).then(({ summary, payload }) => {
      const elapsedMs = performance.now() - summaryStartTime;
      const content = cleanAiSummaryContent(summary, aiSettings.allowEmoji) || "没有生成总结。";
      aiSummaryCache.set(linkId, { content, elapsedMs, payload, chatMessages: [] });
      setAiButtonComplete(button, true);
      if (aiSettings.autoPopup) {
        setAiSummaryModal(title, content, false, linkId, elapsedMs);
      }
    }).catch((error) => {
      setAiButtonComplete(button, false);
      setAiSummaryModal(title, error?.message || "AI 总结失败", true, linkId, performance.now() - summaryStartTime);
    }).finally(() => {
      setAiButtonLoading(button, false);
    });
  }

  function summarizeLinkPage(button, options = {}) {
    const linkId = getCurrentLinkId();
    if (!linkId || button?.classList.contains("is-loading")) {
      return;
    }

    const title = getLinkPageTitle() || "AI 总结";
    if (!options.force && aiSummaryCache.has(linkId)) {
      const cachedSummary = normalizeAiSummaryCacheEntry(aiSummaryCache.get(linkId));
      setAiButtonComplete(button, true);
      setAiSummaryModal(title, cachedSummary.content, false, linkId, cachedSummary.elapsedMs);
      return;
    }

    if (!isAiConfigured()) {
      openSettingsPanelTab(SETTINGS_TABS.AI);
      return;
    }

    setAiButtonLoading(button, true);
    const summaryStartTime = performance.now();
    Promise.all([ensureSummaryContext(linkId), aiSettings.allowEmoji ? loadEmojis() : Promise.resolve(emojiCache)]).then(([{ commentLines, linkDetail }]) => {
      const payload = getLinkPageSummaryPayload(linkId, commentLines, linkDetail);
      return requestAiChat([
        {
          role: "system",
          content: buildAiSummarySystemPrompt()
        },
        {
          role: "user",
          content: payload
        }
      ]).then((summary) => ({ summary, payload }));
    }).then(({ summary, payload }) => {
      const elapsedMs = performance.now() - summaryStartTime;
      const content = cleanAiSummaryContent(summary, aiSettings.allowEmoji) || "没有生成总结。";
      aiSummaryCache.set(linkId, { content, elapsedMs, payload, chatMessages: [] });
      setAiButtonComplete(button, true);
      if (aiSettings.autoPopup) {
        setAiSummaryModal(title, content, false, linkId, elapsedMs);
      }
    }).catch((error) => {
      setAiButtonComplete(button, false);
      setAiSummaryModal(title, error?.message || "AI 总结失败", true, linkId, performance.now() - summaryStartTime);
    }).finally(() => {
      setAiButtonLoading(button, false);
    });
  }

