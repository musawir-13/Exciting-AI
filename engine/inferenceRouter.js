const http = require('http');
const https = require('https');
const { URL } = require('url');
const diagnostics = require('./diagnostics');
const identity = require('./identity');
const { getWebResearchEngine } = require('./webResearch');

class InferenceRouter {
  constructor({ modelRegistry, getSettings, webResearch }) {
    this.modelRegistry = modelRegistry;
    this.getSettings = getSettings || (() => ({}));
    this.webResearch = webResearch || getWebResearchEngine();
  }

  getCloudConfig() {
    const s = this.getSettings();
    const apiKey = process.env.CLOUD_API_KEY || process.env.OPENAI_API_KEY || process.env.POE_API_KEY || s.CloudApiKey || null;
    let endpoint = process.env.CLOUD_API_URL || process.env.OPENAI_BASE_URL || process.env.POE_API_URL || s.CloudEndpoint || null;

    if (!endpoint) {
      if (apiKey) {
        endpoint = 'https://api.poe.com/v1';
      } else {
        endpoint = 'https://text.pollinations.ai/openai';
      }
    }
    return { endpoint, apiKey };
  }

  async executeLocalResponse({
    content,
    model,
    reqId,
    chatId,
    signal,
    onChunk,
    onDone
  }) {
    const startTime = Date.now();
    const tokens = content.split(/(\s+)/);
    for (const t of tokens) {
      if (signal && signal.aborted) return;
      onChunk(t);
      await new Promise(r => setTimeout(r, 6));
    }
    const durationMs = Date.now() - startTime;
    diagnostics.logRequestComplete({
      reqId,
      chatId,
      model: model || 'Exciting AI',
      provider: 'local-identity',
      durationMs,
      ttftMs: 6,
      tokenCount: tokens.length,
      outcome: 'success'
    });
    onDone({ content, thinking: '', tokenCount: tokens.length, durationMs });
  }

  async routeAndExecute({
    model,
    messages,
    options = {},
    attachments = [],
    webSearch = false,
    signal,
    reqId,
    chatId,
    onChunk,
    onThinking,
    onDone,
    onError
  }) {
    const { endpoint: cloudEndpoint, apiKey: cloudApiKey } = this.getCloudConfig();
    const settings = this.getSettings();

    // Determine sampling settings
    const temperature = typeof options.temperature === 'number'
      ? options.temperature
      : (typeof settings.Temperature === 'number' ? settings.Temperature : 0.7);

    const topP = typeof options.top_p === 'number'
      ? options.top_p
      : (typeof settings.TopP === 'number' ? settings.TopP : 0.9);

    const contextLength = Number(options.num_ctx) > 0
      ? Number(options.num_ctx)
      : (Number(settings.ContextLength) > 0 ? Number(settings.ContextLength) : 8192);

    const thinkSetting = options.think !== undefined ? options.think : settings.ThinkLevel;
    const shouldThink = Boolean(thinkSetting && thinkSetting !== 'none') || (this.modelRegistry && this.modelRegistry.supportsThinking(model));

    diagnostics.logRequestStart({ reqId, chatId, model, provider: 'cloud', isCloud: true });

    const lastUserMsg = [...(messages || [])].reverse().find(m => m.role === 'user');
    const userPrompt = lastUserMsg ? lastUserMsg.content : '';

    // Handle Web Access (Shared Provider-Independent Web Research Engine)
    let targetMessages = messages || [];
    let researchResult = null;

    if (webSearch && userPrompt && userPrompt.trim()) {
      // If asking strict identity questions (who are you, who is Ubaid), prioritize verified identity
      const isStrictId = identity.isStrictIdentityQuery(userPrompt, messages);
      if (!isStrictId) {
        try {
          if (onThinking) onThinking('Searching the public web for latest information...\n');
          researchResult = await this.webResearch.research(userPrompt);
          if (researchResult && researchResult.hasResults) {
            targetMessages = (messages || []).map(m => {
              if (m === lastUserMsg) {
                return {
                  ...m,
                  content: `${m.content}${researchResult.contextPrompt}`
                };
              }
              return m;
            });
          }
        } catch (researchErr) {
          console.warn('[InferenceRouter] Web research error:', researchErr.message);
        }
      }
    }

    // Wrap onDone to enforce clickable source citations when web research was used
    let citationsAppended = false;
    const wrappedOnDone = (result) => {
      let finalContent = (result && result.content) || '';
      if (researchResult && researchResult.hasResults && researchResult.citationsMarkdown) {
        if (!finalContent.includes('### Sources') && (!researchResult.sources[0] || !finalContent.includes(researchResult.sources[0].url))) {
          if (!citationsAppended) {
            citationsAppended = true;
            onChunk(researchResult.citationsMarkdown);
          }
          finalContent += researchResult.citationsMarkdown;
        }
      }
      onDone({
        ...result,
        content: finalContent,
        sources: researchResult ? researchResult.sources : []
      });
    };

    // Priority 1: Strict Identity, Creator, Capability, and Project Context Queries
    // These are handled locally to guarantee 100% verified accuracy and eliminate hallucinated developers or ML claims
    if (identity.isStrictIdentityQuery(userPrompt, messages)) {
      const response = identity.generateResponse(userPrompt, messages, chatId, model);
      if (response) {
        return this.executeLocalResponse({
          content: response,
          model,
          reqId,
          chatId,
          signal,
          onChunk,
          onDone: wrappedOnDone
        });
      }
    }

    // If user configured a valid API key or target is a mock/test endpoint (127.0.0.1 or localhost), use direct cloud
    const isMockOrLocal = cloudEndpoint && (cloudEndpoint.includes('127.0.0.1') || cloudEndpoint.includes('localhost'));
    if (cloudApiKey || isMockOrLocal) {
      return this.executeDirectCloud({
        endpoint: cloudEndpoint,
        apiKey: cloudApiKey,
        model,
        messages: targetMessages,
        temperature,
        topP,
        contextLength,
        shouldThink,
        signal,
        reqId,
        chatId,
        onChunk,
        onThinking,
        onDone: wrappedOnDone,
        onError
      });
    }

    // Handled general queries (greetings, programming languages, etc.) when no cloud key is set
    // Only if web research wasn't requested for this prompt
    if (!webSearch && identity.isIdentityOrHandledQuery(userPrompt, messages)) {
      const response = identity.generateResponse(userPrompt, messages, chatId, model);
      if (response) {
        return this.executeLocalResponse({
          content: response,
          model,
          reqId,
          chatId,
          signal,
          onChunk,
          onDone: wrappedOnDone
        });
      }
    }

    // Default: 100% Free AI Inference (Every model free to use without any API key)
    return this.executeFreeInference({
      model,
      messages: targetMessages,
      temperature,
      topP,
      signal,
      reqId,
      chatId,
      onChunk,
      onThinking,
      onDone: wrappedOnDone,
      onError
    });
  }

  async executeFreeInference({
    model,
    messages,
    temperature,
    topP,
    signal,
    reqId,
    chatId,
    onChunk,
    onThinking,
    onDone,
    onError
  }) {
    const cleanModel = (model || 'Assistant').replace(/[-:]?cloud$/i, '').trim();

    // Layer 1: Pollinations Fast SSE Stream
    try {
      const success = await this.executePollinationsStream({
        model: cleanModel,
        messages,
        temperature,
        topP,
        signal,
        reqId,
        chatId,
        onChunk,
        onThinking,
        onDone
      });
      if (success) return;
    } catch (e) {
      console.warn(`[InferenceRouter] Pollinations stream unavailable (${e.message}), trying DevToolBox...`);
    }

    if (signal && signal.aborted) return;

    // Layer 2: DevToolBox Workers AI (Llama 3.2 edge inference, no API key required)
    try {
      const success = await this.executeDevToolBoxFallback({
        model: cleanModel,
        messages,
        signal,
        reqId,
        chatId,
        onChunk,
        onDone
      });
      if (success) return;
    } catch (e) {
      console.warn(`[InferenceRouter] DevToolBox unavailable (${e.message}), trying raw fallback...`);
    }

    if (signal && signal.aborted) return;

    // Layer 3: Pollinations Raw GET text
    try {
      const success = await this.executePollinationsRawFallback({
        model: cleanModel,
        messages,
        signal,
        reqId,
        chatId,
        onChunk,
        onDone
      });
      if (success) return;
    } catch (e) {
      console.warn(`[InferenceRouter] Raw fallback unavailable (${e.message})`);
    }

    // Fallback: If free cloud gateways are unreachable (e.g. offline or test environment),
    // synthesize a model-aware response using the local identity and knowledge engine
    const lastUserMsg = [...(messages || [])].reverse().find(m => m.role === 'user');
    const userPrompt = lastUserMsg ? lastUserMsg.content : '';
    const fallbackResponse = identity.generateResponse(userPrompt, messages, chatId, cleanModel);
    if (fallbackResponse) {
      return this.executeLocalResponse({
        content: fallbackResponse,
        model: cleanModel,
        reqId,
        chatId,
        signal,
        onChunk,
        onDone
      });
    }

    // If all free layers and local synthesis failed
    const err = new Error('Free AI inference services are temporarily unreachable. Please check your internet connection.');
    err.code = 'FREE_INFERENCE_UNAVAILABLE';
    diagnostics.logRequestError({ reqId, chatId, model: cleanModel, provider: 'free-gateway', error: err.message, code: err.code });
    onError(err);
  }

  executePollinationsStream({
    model,
    messages,
    temperature,
    topP,
    signal,
    reqId,
    chatId,
    onChunk,
    onThinking,
    onDone
  }) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let ttftMs = null;
      let tokenCount = 0;
      let fullContent = '';
      let fullThinking = '';

      const systemPrompt = identity.buildSystemPrompt(model);

      const formattedMessages = [];
      let hasSystem = false;
      let hasImages = false;
      for (const m of messages) {
        if (m.role === 'system') {
          hasSystem = true;
          formattedMessages.push({ role: 'system', content: m.content || '' });
        } else if (m.images && Array.isArray(m.images) && m.images.length > 0) {
          hasImages = true;
          const parts = [{ type: 'text', text: m.content || '' }];
          for (const img of m.images) {
            const url = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
            parts.push({ type: 'image_url', image_url: { url } });
          }
          formattedMessages.push({ role: m.role, content: parts });
        } else {
          formattedMessages.push({ role: m.role, content: m.content || '' });
        }
      }
      if (!hasSystem) {
        formattedMessages.unshift({
          role: 'system',
          content: systemPrompt
        });
      }

      let targetModel = model && (model.includes('openai') || model.includes('gpt') || model.includes('chat')) ? 'openai' : 'openai-fast';
      if (hasImages) {
        targetModel = 'openai';
      }
      const payload = {
        model: targetModel,
        messages: formattedMessages,
        stream: true,
        temperature,
        top_p: topP,
        max_tokens: 4096
      };

      const targetUrl = 'https://text.pollinations.ai/openai/chat/completions';
      const req = https.request(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ExcitingAI/3.8.9'
        },
        timeout: 15000
      }, (res) => {
        if (res.statusCode !== 200) {
          let b = '';
          res.on('data', c => b += c);
          res.on('end', () => {
            reject(new Error(`Pollinations HTTP ${res.statusCode}: ${b.substring(0, 100)}`));
          });
          return;
        }

        let buffer = '';
        res.on('data', chunk => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split('\n');
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.replace(/^data:\s*/, '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const delta = (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) || {};
              const think = delta.reasoning_content || delta.reasoning;
              if (think) {
                if (ttftMs === null) ttftMs = Date.now() - startTime;
                fullThinking += think;
                onThinking(think);
              }
              if (delta.content) {
                if (ttftMs === null) ttftMs = Date.now() - startTime;
                tokenCount++;
                fullContent += delta.content;
                onChunk(delta.content);
              }
            } catch (e) {}
          }
        });

        res.on('end', () => {
          if (!fullContent && !fullThinking) {
            reject(new Error('Empty response from Pollinations stream'));
            return;
          }
          const durationMs = Date.now() - startTime;
          diagnostics.logRequestComplete({
            reqId,
            chatId,
            model,
            provider: 'free-pollinations',
            durationMs,
            ttftMs,
            tokenCount,
            outcome: 'success'
          });
          onDone({ content: fullContent, thinking: fullThinking, tokenCount, durationMs });
          resolve(true);
        });

        res.on('error', reject);
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          req.destroy();
          resolve(true);
        });
      }

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Pollinations request timed out'));
      });

      req.on('error', reject);
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  executeDevToolBoxFallback({
    model,
    messages,
    signal,
    reqId,
    chatId,
    onChunk,
    onDone
  }) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let formattedPrompt = '';
      let hasSystem = false;
      for (const m of messages) {
        if (m.role === 'system') {
          hasSystem = true;
          formattedPrompt += `System: ${m.content}\n`;
        }
        else if (m.role === 'user') formattedPrompt += `User: ${m.content}\n`;
        else if (m.role === 'assistant') formattedPrompt += `Assistant: ${m.content}\n`;
      }
      if (!hasSystem) {
        formattedPrompt = `System: ${identity.buildSystemPrompt(model)}\n\n` + formattedPrompt;
      }
      formattedPrompt += `Assistant:`;

      const data = JSON.stringify({ prompt: formattedPrompt });
      const req = https.request('https://devtoolbox-api.devtoolbox-api.workers.dev/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ExcitingAI/3.8.9'
        },
        timeout: 15000
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`DevToolBox HTTP ${res.statusCode}`));
          return;
        }

        let body = '';
        res.on('data', d => body += d);
        res.on('end', async () => {
          try {
            const json = JSON.parse(body);
            let reply = json.response;
            if (reply === undefined || reply === null) {
              reject(new Error('Invalid DevToolBox payload'));
              return;
            }
            if (typeof reply !== 'string') reply = String(reply);

            // Stream smoothly word by word with small 12ms pauses
            const tokens = reply.split(/(\s+)/);
            for (const t of tokens) {
              if (signal && signal.aborted) return resolve(true);
              onChunk(t);
              await new Promise(r => setTimeout(r, 12));
            }

            const durationMs = Date.now() - startTime;
            diagnostics.logRequestComplete({
              reqId,
              chatId,
              model,
              provider: 'free-devtoolbox',
              durationMs,
              ttftMs: 500,
              tokenCount: tokens.length,
              outcome: 'success'
            });
            onDone({ content: reply, thinking: '', tokenCount: tokens.length, durationMs });
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
        res.on('error', reject);
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          req.destroy();
          resolve(true);
        });
      }

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('DevToolBox timed out'));
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  executePollinationsRawFallback({
    model,
    messages,
    signal,
    reqId,
    chatId,
    onChunk,
    onDone
  }) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      const promptText = lastUserMsg ? lastUserMsg.content : 'Hello';
      const promptUrl = `https://text.pollinations.ai/${encodeURIComponent(promptText)}`;

      const req = https.get(promptUrl, { timeout: 12000 }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Pollinations raw HTTP ${res.statusCode}`));
          return;
        }

        let fullText = '';
        let tokenCount = 0;

        res.on('data', chunk => {
          const str = chunk.toString('utf8');
          fullText += str;
          tokenCount++;
          onChunk(str);
        });

        res.on('end', () => {
          if (!fullText) {
            reject(new Error('Empty text returned'));
            return;
          }
          const durationMs = Date.now() - startTime;
          diagnostics.logRequestComplete({
            reqId,
            chatId,
            model,
            provider: 'free-pollinations-raw',
            durationMs,
            ttftMs: 300,
            tokenCount,
            outcome: 'success'
          });
          onDone({ content: fullText, thinking: '', tokenCount, durationMs });
          resolve(true);
        });

        res.on('error', reject);
      });

      if (signal) {
        signal.addEventListener('abort', () => {
          req.destroy();
          resolve(true);
        });
      }

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Pollinations raw timed out'));
      });

      req.on('error', reject);
    });
  }

  executeDirectCloud({
    endpoint,
    apiKey,
    model,
    messages,
    temperature,
    topP,
    contextLength,
    shouldThink,
    signal,
    reqId,
    chatId,
    onChunk,
    onThinking,
    onDone,
    onError
  }) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let ttftMs = null;
      let tokenCount = 0;
      let fullContent = '';
      let fullThinking = '';

      const cleanModel = model.replace(/[-:]?cloud$/i, '').trim();

      // Format messages for OpenAI / Poe API
      const formattedMessages = messages.map(m => {
        if (m.images && Array.isArray(m.images) && m.images.length > 0) {
          const parts = [{ type: 'text', text: m.content || '' }];
          for (const img of m.images) {
            const url = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
            parts.push({ type: 'image_url', image_url: { url } });
          }
          return { role: m.role, content: parts };
        }
        return { role: m.role, content: m.content || '' };
      });

      const payload = {
        model: cleanModel,
        messages: formattedMessages,
        stream: true,
        temperature,
        top_p: topP,
        max_tokens: 4096
      };

      const targetUrl = endpoint.endsWith('/') ? `${endpoint}chat/completions` : `${endpoint}/chat/completions`;

      try {
        const u = new URL(targetUrl);
        const client = u.protocol === 'https:' ? https : http;
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

        const req = client.request(
          targetUrl,
          { method: 'POST', headers },
          (res) => {
            let buffer = '';

            if (res.statusCode !== 200) {
              res.on('data', c => buffer += c);
              res.on('end', () => {
                let errMsg = `Cloud API returned HTTP ${res.statusCode}`;
                try {
                  const parsed = JSON.parse(buffer);
                  if (parsed.error && parsed.error.message) errMsg = parsed.error.message;
                  else if (parsed.error) errMsg = parsed.error;
                } catch (e) {}

                // If no user API key was configured and endpoint failed with auth/key requirement,
                // seamlessly fall back to free inference so the user is never blocked!
                if (!apiKey && (errMsg.toLowerCase().includes('api key') || res.statusCode === 400 || res.statusCode === 401)) {
                  console.warn(`[InferenceRouter] Cloud key missing (${errMsg}), falling back to free inference...`);
                  return this.executeFreeInference({
                    model,
                    messages,
                    temperature,
                    topP,
                    signal,
                    reqId,
                    chatId,
                    onChunk,
                    onThinking,
                    onDone,
                    onError
                  }).then(() => resolve({ fallback: true }));
                }

                const err = new Error(errMsg);
                err.code = `HTTP_${res.statusCode}`;
                diagnostics.logRequestError({ reqId, chatId, model, provider: 'direct-cloud', error: errMsg, code: err.code });
                onError(err);
                resolve({ error: err });
              });
              return;
            }

            res.on('data', chunk => {
              buffer += chunk.toString('utf8');
              const lines = buffer.split('\n');
              buffer = lines.pop();

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const dataStr = trimmed.replace(/^data:\s*/, '').trim();
                if (dataStr === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(dataStr);
                  const delta = (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) || {};
                  const think = delta.reasoning_content || delta.reasoning;
                  if (think) {
                    if (ttftMs === null) ttftMs = Date.now() - startTime;
                    fullThinking += think;
                    onThinking(think);
                  }
                  if (delta.content) {
                    if (ttftMs === null) ttftMs = Date.now() - startTime;
                    tokenCount++;
                    fullContent += delta.content;
                    onChunk(delta.content);
                  }
                } catch (e) {
                  // incomplete line
                }
              }
            });

            res.on('end', () => {
              const durationMs = Date.now() - startTime;
              diagnostics.logRequestComplete({
                reqId,
                chatId,
                model,
                provider: 'direct-cloud',
                durationMs,
                ttftMs,
                tokenCount,
                outcome: 'success'
              });
              onDone({ content: fullContent, thinking: fullThinking, tokenCount, durationMs });
              resolve({ content: fullContent, thinking: fullThinking, tokenCount, durationMs });
            });

            res.on('error', err => {
              diagnostics.logRequestError({ reqId, chatId, model, provider: 'direct-cloud', error: err.message, code: err.code });
              onError(err);
              resolve({ error: err });
            });
          }
        );

        if (signal) {
          signal.addEventListener('abort', () => {
            req.destroy();
            diagnostics.logRequestCancel({ reqId, chatId, model, durationMs: Date.now() - startTime });
            resolve({ cancelled: true });
          });
        }

        req.on('error', err => {
          diagnostics.logRequestError({ reqId, chatId, model, provider: 'direct-cloud', error: err.message, code: err.code });
          onError(err);
          resolve({ error: err });
        });

        req.write(JSON.stringify(payload));
        req.end();
      } catch (err) {
        diagnostics.logRequestError({ reqId, chatId, model, provider: 'direct-cloud', error: err.message, code: 'REQUEST_INIT_ERROR' });
        onError(err);
        resolve({ error: err });
      }
    });
  }
}

module.exports = InferenceRouter;
