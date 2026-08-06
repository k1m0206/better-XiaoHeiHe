// 跨入口复用的配置归一化逻辑。
// 依赖 src/shared/constants.js，生成入口时必须在 constants.js 之后拼入。
  function normalizeProvider(provider) {
    return Object.values(AI_PROVIDERS).includes(provider) ? provider : DEFAULT_AI_PROVIDER;
  }
  function normalizeBaseUrl(baseUrl, provider) {
    return String(baseUrl || AI_PROVIDER_DEFAULT_BASE_URLS[provider] || "").trim().replace(/\/+$/, "");
  }

  function normalizeAiSettings(settings = {}) {
    const provider = normalizeProvider(settings?.provider || settings?.endpointMode);
    return {
      enabled: settings?.enabled !== false,
      provider,
      endpointMode: provider,
      baseUrl: normalizeBaseUrl(settings?.baseUrl, provider),
      model: String(settings?.model || "").trim(),
      apiKey: String(settings?.apiKey || ""),
      allowEmoji: settings?.allowEmoji !== false,
      autoPopup: settings?.autoPopup !== false,
      summaryPrompt: String(settings?.summaryPrompt || "").trim() || DEFAULT_SUMMARY_PROMPT
    };
  }

  function normalizeIdList(value) {
    return [...new Set((Array.isArray(value) ? value : String(value || "").split(/[\s,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter(Boolean))];
  }

  function normalizeKeywordList(value) {
    const seen = new Set();
    return (Array.isArray(value) ? value : String(value || "").split(/[\r\n,，;；]+/))
      .map((item) => String(item || "").trim())
      .filter((item) => {
        const normalized = item.toLocaleLowerCase();
        if (!normalized || seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  }
