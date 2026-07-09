// AI provider 请求、模型列表和响应解析。
// 本文件由原入口文件等价拆分而来，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  function buildProviderUrl(baseUrl, path) {
    const normalizedBaseUrl = String(baseUrl || "").trim().replace(/\/+$/, "");
    const normalizedPath = String(path || "").replace(/^\/+/, "");
    return normalizedPath ? `${normalizedBaseUrl}/${normalizedPath}` : normalizedBaseUrl;
  }

  function buildOpenAiChatUrl(baseUrl) {
    return /\/chat\/completions$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "chat/completions");
  }

  function buildOpenAiResponsesUrl(baseUrl) {
    return /\/responses$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "responses");
  }

  function buildModelsUrl(baseUrl) {
    return /\/models$/i.test(baseUrl) ? baseUrl : buildProviderUrl(baseUrl, "models");
  }

  function readAiSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(AI_SETTINGS_STORAGE_KEY, (result) => {
        resolve(normalizeAiSettings(result?.[AI_SETTINGS_STORAGE_KEY]));
      });
    });
  }

  function createJsonHeaders(settings) {
    const headers = {
      accept: "application/json",
      "content-type": "application/json"
    };
    if (settings.apiKey) {
      headers.authorization = `Bearer ${settings.apiKey}`;
    }
    return headers;
  }

  async function readJsonResponse(response) {
    const text = await response.text().catch(() => "");
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { text };
    }
  }

  function getProviderError(data, response) {
    return data?.error?.message || data?.error || data?.message || data?.text || `请求失败：${response.status}`;
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await readJsonResponse(response);
    if (!response.ok) {
      throw new Error(String(getProviderError(data, response)));
    }
    return data;
  }

  function getTemperature(detail) {
    return Number.isFinite(detail?.temperature) ? detail.temperature : 0.2;
  }

  function splitSystemMessages(messages) {
    const system = [];
    const rest = [];
    (Array.isArray(messages) ? messages : []).forEach((message) => {
      const role = String(message?.role || "user");
      const content = String(message?.content || "");
      if (!content) {
        return;
      }
      if (role === "system") {
        system.push(content);
        return;
      }
      rest.push({ role, content });
    });
    return { system: system.join("\n\n"), messages: rest };
  }

  function parseOpenAiContent(data) {
    return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || "";
  }

  function parseResponsesContent(data) {
    if (data?.output_text) {
      return data.output_text;
    }

    const parts = [];
    (data?.output || []).forEach((item) => {
      (item?.content || []).forEach((content) => {
        if (content?.text) {
          parts.push(content.text);
        }
      });
    });
    return parts.join("\n");
  }

  function parseAnthropicContent(data) {
    return (data?.content || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  function parseGeminiContent(data) {
    return (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text || "")
      .filter(Boolean)
      .join("\n");
  }

  async function requestOpenAiCompatibleChat(settings, detail) {
    const data = await fetchJson(buildOpenAiChatUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        messages: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseOpenAiContent(data);
  }

  async function requestOpenAiResponses(settings, detail) {
    const data = await fetchJson(buildOpenAiResponsesUrl(settings.baseUrl), {
      method: "POST",
      headers: createJsonHeaders(settings),
      body: JSON.stringify({
        model: settings.model,
        input: Array.isArray(detail?.messages) ? detail.messages : [],
        temperature: getTemperature(detail)
      })
    });
    return parseResponsesContent(data);
  }

  async function requestAnthropicChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const headers = {
      accept: "application/json",
      "content-type": "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }

    const body = {
      model: settings.model,
      messages: messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content
      })),
      max_tokens: 2048,
      temperature: getTemperature(detail)
    };
    if (system) {
      body.system = system;
    }

    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "messages"), {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return parseAnthropicContent(data);
  }

  function appendGeminiApiKey(url, apiKey) {
    if (!apiKey) {
      return url;
    }

    const nextUrl = new URL(url);
    nextUrl.searchParams.set("key", apiKey);
    return nextUrl.toString();
  }

  async function requestGeminiChat(settings, detail) {
    const { system, messages } = splitSystemMessages(detail?.messages);
    const geminiMessages = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));
    if (system) {
      const firstUserMessage = geminiMessages.find((message) => message.role === "user");
      if (firstUserMessage) {
        firstUserMessage.parts[0].text = `${system}\n\n${firstUserMessage.parts[0].text}`;
      } else {
        geminiMessages.unshift({
          role: "user",
          parts: [{ text: system }]
        });
      }
    }

    const body = {
      contents: geminiMessages,
      generationConfig: {
        temperature: getTemperature(detail)
      }
    };

    const url = appendGeminiApiKey(buildProviderUrl(settings.baseUrl, `models/${encodeURIComponent(settings.model)}:generateContent`), settings.apiKey);
    const data = await fetchJson(url, {
      method: "POST",
      headers: createJsonHeaders({ ...settings, apiKey: "" }),
      body: JSON.stringify(body)
    });
    return parseGeminiContent(data);
  }

  async function requestChat(detail, overrideSettings = null) {
    const settings = overrideSettings ? normalizeAiSettings(overrideSettings) : await readAiSettings();
    if (!settings.enabled || !settings.baseUrl || !settings.model) {
      return { ok: false, error: "请先开启 AI，并填写 Base URL 和模型" };
    }

    try {
      const requesters = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: requestOpenAiCompatibleChat,
        [AI_PROVIDERS.OPENAI_RESPONSES]: requestOpenAiResponses,
        [AI_PROVIDERS.ANTHROPIC]: requestAnthropicChat,
        [AI_PROVIDERS.GEMINI]: requestGeminiChat
      };
      const content = await requesters[settings.provider](settings, detail);
      return {
        ok: true,
        content: String(content || "").trim() || "模型没有返回内容"
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "AI 请求失败"
      };
    }
  }

  function parseOpenAiModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseAnthropicModels(data) {
    return (data?.data || [])
      .map((model) => model?.id)
      .filter(Boolean);
  }

  function parseGeminiModels(data) {
    return (data?.models || [])
      .filter((model) => !Array.isArray(model?.supportedGenerationMethods) || model.supportedGenerationMethods.includes("generateContent"))
      .map((model) => String(model?.name || "").replace(/^models\//, ""))
      .filter(Boolean);
  }

  async function listOpenAiModels(settings) {
    const data = await fetchJson(buildModelsUrl(settings.baseUrl), {
      method: "GET",
      headers: createJsonHeaders(settings)
    });
    return parseOpenAiModels(data);
  }

  async function listAnthropicModels(settings) {
    const headers = {
      accept: "application/json",
      "anthropic-version": "2023-06-01"
    };
    if (settings.apiKey) {
      headers["x-api-key"] = settings.apiKey;
    }
    const data = await fetchJson(buildProviderUrl(settings.baseUrl, "models"), {
      method: "GET",
      headers
    });
    return parseAnthropicModels(data);
  }

  async function listGeminiModels(settings) {
    const data = await fetchJson(appendGeminiApiKey(buildProviderUrl(settings.baseUrl, "models"), settings.apiKey), {
      method: "GET",
      headers: { accept: "application/json" }
    });
    return parseGeminiModels(data);
  }

  async function listModels(overrideSettings = null) {
    const settings = normalizeAiSettings(overrideSettings || await readAiSettings());
    if (!settings.baseUrl) {
      return { ok: false, error: "请先填写 Base URL" };
    }

    try {
      const listers = {
        [AI_PROVIDERS.OPENAI_COMPATIBLE]: listOpenAiModels,
        [AI_PROVIDERS.OPENAI_RESPONSES]: listOpenAiModels,
        [AI_PROVIDERS.ANTHROPIC]: listAnthropicModels,
        [AI_PROVIDERS.GEMINI]: listGeminiModels
      };
      const models = await listers[settings.provider](settings);
      const cachedModels = await writeModelListCache(settings, models);
      return {
        ok: true,
        models: cachedModels
      };
    } catch (error) {
      return {
        ok: false,
        error: error?.message || "模型列表拉取失败"
      };
    }
  }
