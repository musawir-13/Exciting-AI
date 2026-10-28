const http = require('http');
const https = require('https');
const { URL } = require('url');

class Diagnostics {
  constructor() {
    this.reqCounter = 0;
  }

  generateRequestId() {
    this.reqCounter = (this.reqCounter + 1) % 1000000;
    return `req_${Date.now()}_${this.reqCounter}`;
  }

  logRequestStart({ reqId, chatId, model, provider, isCloud }) {
    console.log(`[Diagnostics] [${reqId}] Start: model=${model || 'unspecified'} provider=${provider} isCloud=${Boolean(isCloud)} chatId=${chatId}`);
  }

  logRequestComplete({ reqId, chatId, model, provider, durationMs, ttftMs, tokenCount, outcome }) {
    console.log(`[Diagnostics] [${reqId}] Complete: outcome=${outcome} duration=${durationMs}ms ttft=${ttftMs || 0}ms tokens=${tokenCount || 0} model=${model} provider=${provider}`);
  }

  logRequestError({ reqId, chatId, model, provider, error, code }) {
    console.error(`[Diagnostics] [${reqId}] Error: code=${code || 'UNKNOWN'} message=${error} model=${model} provider=${provider}`);
  }

  logRequestCancel({ reqId, chatId, model, durationMs }) {
    console.log(`[Diagnostics] [${reqId}] Cancelled by client after ${durationMs}ms model=${model}`);
  }

  checkLocalEngine(ollamaHost, timeoutMs = 1500) {
    // Ollama connection is completely removed
    return Promise.resolve({ reachable: false, disabled: true });
  }

  checkCloudEndpoint(cloudEndpoint, apiKey, timeoutMs = 2000) {
    if (!cloudEndpoint) {
      return Promise.resolve({ configured: false, reachable: false, message: 'No cloud endpoint configured' });
    }
    return new Promise((resolve) => {
      const startTime = Date.now();
      try {
        const u = new URL(cloudEndpoint);
        const client = u.protocol === 'https:' ? https : http;
        const headers = {};
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        // Ping models or health
        const pingUrl = cloudEndpoint.endsWith('/v1') ? `${cloudEndpoint}/models` : `${cloudEndpoint}/api/tags`;
        const req = client.request(
          pingUrl,
          { method: 'GET', headers, timeout: timeoutMs },
          (res) => {
            const latencyMs = Date.now() - startTime;
            resolve({
              configured: true,
              reachable: res.statusCode < 500,
              statusCode: res.statusCode,
              latencyMs
            });
          }
        );

        req.on('timeout', () => req.destroy(new Error('Timeout')));
        req.on('error', (err) => {
          resolve({ configured: true, reachable: false, error: err.code || err.message, latencyMs: Date.now() - startTime });
        });
        req.end();
      } catch (err) {
        resolve({ configured: true, reachable: false, error: err.message, latencyMs: 0 });
      }
    });
  }

  async checkHealth(ollamaHost, cloudEndpoint, cloudApiKey) {
    const local = await this.checkLocalEngine(ollamaHost);
    const cloud = cloudEndpoint ? await this.checkCloudEndpoint(cloudEndpoint, cloudApiKey) : { configured: false };
    return {
      status: local.reachable ? 'healthy' : (cloud.reachable ? 'cloud_only' : 'degraded'),
      local,
      cloud,
      timestamp: new Date().toISOString()
    };
  }

  getSummary() {
    return {
      requestsProcessed: this.reqCounter,
      uptimeSec: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new Diagnostics();
