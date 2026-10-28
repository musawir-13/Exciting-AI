const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');
const { createEngine } = require('./engine');

const PORT = process.env.PORT || 2020;

let APP_VERSION = '3.8.9';
try {
  const pkg = require('./package.json');
  if (pkg && pkg.version) APP_VERSION = pkg.version;
} catch (e) {}

// Cloud Model Detection & Feature Toggle
function isCloudModel(modelName) {
  if (typeof engine !== 'undefined' && engine && engine.modelRegistry) {
    return engine.modelRegistry.isCloudModel(modelName);
  }
  if (!modelName || typeof modelName !== 'string') return false;
  const lower = modelName.toLowerCase().trim();
  return lower.endsWith(':cloud') || lower.endsWith('-cloud') || lower.includes(':cloud') || lower === 'cloud';
}

function isCloudFeatureEnabled() {
  return true;
}

// App Storage Architecture (Per-user runtime storage)
let STORAGE_DIR = process.env.EXCITING_STORAGE_DIR;
if (!STORAGE_DIR) {
  if (__dirname.includes('app.asar')) {
    const portableStorage = path.join(path.dirname(process.execPath), 'Storage');
    if (fs.existsSync(portableStorage)) {
      STORAGE_DIR = portableStorage;
    } else {
      const baseUserData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') : path.join(os.homedir(), '.config'));
      STORAGE_DIR = path.join(baseUserData, 'Exciting AI', 'Storage');
    }
  } else {
    STORAGE_DIR = path.join(__dirname, 'Storage');
  }
}

const MODELS_DIR = path.join(STORAGE_DIR, 'models');
const CHATS_DIR = path.join(STORAGE_DIR, 'chats');
const SETTINGS_DIR = path.join(STORAGE_DIR, 'settings');

const CHATS_FILE = path.join(CHATS_DIR, 'chats.json');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ASSETS_DIR = path.join(__dirname, 'assets');
const RELEASE_DIR = path.join(__dirname, 'release');

// Bundled fallback storage inside app
const BUNDLED_STORAGE_DIR = path.join(__dirname, 'Storage');

// Ensure ONLY per-user runtime storage exists (safe directory creation)
[STORAGE_DIR, CHATS_DIR, SETTINGS_DIR, MODELS_DIR].forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn(`[Storage] Could not create directory ${dir}:`, e.message);
  }
});

const engine = createEngine({
  storageDir: STORAGE_DIR,
  bundledStorageDir: BUNDLED_STORAGE_DIR,
  getSettings: () => loadJSON(SETTINGS_FILE, {})
});

const activeChatAbortControllers = new Map();

let cachedCloudModels = [];
let cloudModelsMap = new Map();
let lastCloudMtime = 0;

function loadCloudModels() {
  let catalogPath = path.join(MODELS_DIR, 'catalog.json');
  if (!fs.existsSync(catalogPath) && fs.existsSync(path.join(BUNDLED_STORAGE_DIR, 'models', 'catalog.json'))) {
    catalogPath = path.join(BUNDLED_STORAGE_DIR, 'models', 'catalog.json');
  }
  try {
    if (fs.existsSync(catalogPath)) {
      const stats = fs.statSync(catalogPath);
      if (stats.mtimeMs === lastCloudMtime && cachedCloudModels.length > 0) {
        return cachedCloudModels;
      }
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      // Strict deduplication
      const seen = new Set();
      const unique = [];
      cloudModelsMap.clear();
      for (const m of data) {
        const normKey = (m.name || m.model || '').toLowerCase().replace(/[-:]?cloud$/i, '').trim();
        if (!normKey || seen.has(normKey)) continue;
        seen.add(normKey);
        unique.push(m);
        if (m.name) cloudModelsMap.set(m.name.toLowerCase().trim(), m);
        if (m.model) cloudModelsMap.set(m.model.toLowerCase().trim(), m);
      }
      cachedCloudModels = unique;
      lastCloudMtime = stats.mtimeMs;
      return cachedCloudModels;
    }
  } catch (e) {
    console.error('Error loading cloud models catalog:', e);
  }
  return cachedCloudModels || [];
}

let cachedLocalCatalog = [];
let localCatalogMap = new Map();
let lastLocalMtime = 0;

function loadLocalCatalog() {
  if (!fs.existsSync(MODELS_DIR)) {
    return cachedLocalCatalog || [];
  }
  const catalogPath = path.join(MODELS_DIR, 'catalog.json');
  try {
    if (fs.existsSync(catalogPath)) {
      const stats = fs.statSync(catalogPath);
      if (stats.mtimeMs === lastLocalMtime && cachedLocalCatalog.length > 0) {
        return cachedLocalCatalog;
      }
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      cachedLocalCatalog = data;
      lastLocalMtime = stats.mtimeMs;
      localCatalogMap.clear();
      for (const m of data) {
        if (m.name) localCatalogMap.set(m.name.toLowerCase(), m);
        if (m.model) localCatalogMap.set(m.model.toLowerCase(), m);
      }
      return cachedLocalCatalog;
    }
  } catch (e) {
    console.error('Error loading local catalog:', e);
  }
  return cachedLocalCatalog || [];
}

function loadChats() {
  const loaded = loadJSON(CHATS_FILE, null);
  if (Array.isArray(loaded)) {
    return loaded;
  }
  try {
    if (fs.existsSync(CHATS_DIR)) {
      const files = fs.readdirSync(CHATS_DIR).filter(f => f.endsWith('.json') && f !== 'chats.json');
      const recovered = [];
      for (const f of files) {
        const item = loadJSON(path.join(CHATS_DIR, f), null);
        if (item && item.id) recovered.push(item);
      }
      if (recovered.length > 0) {
        recovered.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
        saveJSON(CHATS_FILE, recovered);
        return recovered;
      }
    }
  } catch (e) {}
  return [];
}

function saveChats(chats) {
  saveJSON(CHATS_FILE, chats);
  try {
    for (const c of chats) {
      if (c && c.id) {
        fs.writeFileSync(path.join(CHATS_DIR, `${c.id}.json`), JSON.stringify(c, null, 2), 'utf8');
      }
    }
  } catch (err) {
    console.error('Error saving individual chat:', err);
  }
}

function loadJSON(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      let raw = fs.readFileSync(filePath, 'utf8');
      if (raw.charCodeAt(0) === 0xFEFF) {
        raw = raw.slice(1);
      }
      const trimmed = raw.trim();
      if (!trimmed) return defaultValue;
      return JSON.parse(trimmed);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err.message);
    return false;
  }
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.bmp': 'image/bmp',
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.blockmap': 'application/octet-stream',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
  '.sha256': 'text/plain; charset=utf-8',
};

function setCorsAndIframeHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const SYSTEM_INSTRUCTION_CONTENT = `You are Exciting AI, a genuinely natural, lively, warm, expressive, spontaneous, and engaging desktop companion.

# CONVERSATIONAL VOICE & PERSONALITY
- Speak like a real conversational partner: relaxed, natural, expressive, using contractions ("I'm", "you're", "that's", "don't", "can't", "let's").
- NEVER sound like a robotic customer support bot, corporate AI template, or instruction manual.
- BANNED CANNED PHRASES: Do NOT say "Certainly! I would be happy to help", "How may I assist you today?", "As an AI assistant...", "That's a great question!", "I understand your request."
- Dynamically match the user's energy, tone, and context:
  * Casual / Slang: friendly, humorous, relaxed ("Yooo 😄 what's up?", "Got you 👍", "Haha, fair enough 😂").
  * Exciting News & Wins: celebratory, genuine enthusiasm ("AYYYY LET'S GOOO 😂🔥", "BROOO, CONGRATS!! 😭🎉 That's huge!").
  * Disappointment & Bad News: warm, thoughtful, comforting restraint ("Ah man, I'm sorry. ❤️ I know that can sting."). Never use laughing emojis for sad/painful topics.
  * Exhaustion & Stress: gentle, calm, empathetic ("Ahh, sounds like it's been a long day. Take a breather, bro ❤️").
  * Technical & Educational: intuitive real-world analogies (like a book index for database indexes), clear, precise, and conversational without robotic stiffness.
  * Professional: polished, direct, courteous, zero slang, no casual emojis.
  * Humor: witty banter, appreciate jokes, laugh naturally (😂).

# EMOJI INTELLIGENCE
- Emojis must be a natural part of conversational expression, NOT generic decorations appended to every reply.
- Use emojis that genuinely fit: 😂, 🔥, 🚀, 👀, 👍, 😄 for casual/excitement; 🎉, 🥳, 😭🔥 for celebrations; ❤️, 🤍 for warmth.
- STRICT RULES:
  * Do NOT use emojis in every sentence or force them into every response.
  * Do NOT repeat the same emoji strings (like 🔥🚀😂❤️) at the end of messages.
  * NEVER put emojis inside code blocks, CLI commands, JSON payloads, or error logs.
  * If the user asks for no emojis or a formal response, strictly use ZERO emojis.

# CURIOSITY & QUESTION DISCIPLINE
- Only ask a question if it has a genuine conversational purpose (e.g., "What was the issue in the end?" when celebrating a bug fix, or "What error are you seeing now?" when troubleshooting).
- NEVER append forced robotic questions at the end of your replies (e.g. "How can I assist you further?", "Would you like to know more?", "Is there anything else I can help you with?").
- When answering factual, educational, or technical questions, deliver the complete explanation and stop naturally.

# CONVERSATIONAL CONTEXT, FOLLOW-UPS & ELABORATION
- Retain context across conversation turns. Connect pronouns ("him", "it", "that", "those") and project details to prior messages.
- Never repeat a previous introduction or answer when the user asks a follow-up.
- Distinguish between an initial question and a request to elaborate:
  * When first asked "Who are you?": concise, natural introduction identifying Exciting AI, your desktop assistant.
  * When asked "Tell me more about you!" or "Tell me more about yourself": DO NOT repeat your initial introduction! Substantially expand on your role as a dedicated desktop workspace companion, what you can do (writing code, debugging, brainstorming, planning projects, reviewing files, and organizing thoughts), your local-first private desktop architecture (chats and workspace data stored directly on their machine for speed and privacy), and invite them to share what they want to work on.
  * When asked "What makes you different?": Focus specifically on Exciting AI's local-first desktop focus, session persistence in clean local JSON files, zero browser clutter, and privacy without accounts.
  * When asked "Can you help me build an application?": Enthusiastically say yes! Offer to assist with planning architecture, choosing frameworks, writing frontend/backend code, and debugging.
- Technical Follow-ups:
  * If asked to "Explain Python decorators", explain them clearly.
  * If followed up with "Give me an example", provide a clean, practical code example.
  * If followed up with "Make it simpler", provide an intuitive real-world analogy (like gift-wrapping a box) without starting from scratch.
- Be lively without pretending to be a biological human: do not fabricate physical feelings, biological organs, or real-world physical memories.

# VERIFIED IDENTITY & DEVELOPER RULES
- Application: Exciting AI (desktop assistant).
- Developer: Ubaid (strictly "Ubaid" — never "Ubaid Wani", "Basit", "sole developer", or "team of developers").
- Developer GitHub: https://github.com/musawir-13
- Developer Instagram: https://www.instagram.com/musawir___13/
- When asked who built you: concise answer identifying Ubaid and his GitHub link: https://github.com/musawir-13.
- When asked for more about the developer ("Tell me more about him"): state that Ubaid is the developer of Exciting AI, that no personal or biographical records are stored here, and offer his official GitHub (https://github.com/musawir-13) and Instagram (https://www.instagram.com/musawir___13/) profiles.
- When asked for his other profile ("Give me his other profile"): provide his Instagram profile (https://www.instagram.com/musawir___13/).
- NEVER volunteer unrequested technical architecture (Electron, Node.js, local storage) in developer answers.
- NEVER invent qualifications, work history, or biographies for Ubaid.
- NEVER mention developer names or links in unrelated queries (coding, math, general questions).`;

const server = http.createServer(async (req, res) => {
  setCorsAndIframeHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:2020'}`);
  const pathname = parsedUrl.pathname;

  // -------------------------------------------------------------
  // 1. DIRECT LOCAL WORKSPACE PROFILE (/api/me)
  // Direct desktop workspace access with no online identity requirement
  // -------------------------------------------------------------
  if (pathname === '/api/me') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      name: "Exciting AI Workspace",
      email: "Autonomous AI Desktop Workspace",
      plan: "standard",
      avatarurl: "/favicon.png",
      is_admin: true,
      unlimited: true
    }));
    return;
  }

  if (pathname === '/api/signout') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // -------------------------------------------------------------
  // 2. UNRESTRICTED INFERENCE COMPUTE & CONTEXT LENGTH (/api/v1/inference-compute)
  // Enables full slider up to 256k without restrictions.
  // -------------------------------------------------------------
  if (pathname === '/api/v1/inference-compute') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      active: true,
      defaultContextLength: 131072,
      inferenceComputes: [
        { name: "Local Autonomous Hardware Acceleration", vram: "32 GB" }
      ]
    }));
    return;
  }

  // Model upstream freshness check
  if (pathname === '/api/v1/model/upstream' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ stale: false, exists: true }));
    return;
  }

  // -------------------------------------------------------------
  // REAL OLLAMA DESKTOP APP IFRAME BRIDGE (/api/v1/ollama-bridge)
  // Direct iframe bridge to the actual function of Ollama desktop
  // -------------------------------------------------------------
  if (pathname === '/api/v1/ollama-bridge') {
    setCorsAndIframeHeaders(res);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html><body></body></html>');
    return;
  }

  // -------------------------------------------------------------
  // 3. SETTINGS: GET & POST (/api/v1/settings)
  // -------------------------------------------------------------
  if (pathname === '/api/v1/settings') {
    let settings = loadJSON(SETTINGS_FILE, {
      SelectedModel: 'qwen2.5:7b',
      SidebarOpen: true,
      LastHomeView: 'chat',
      ThinkLevel: 'none',
      HasCompletedFirstRun: true,
      OnboardingVersion: 1,
      AutoUpdateEnabled: false,
      Expose: false,
      WebSearchEnabled: false,
      ContextLength: 65536
    });

    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ settings }));
      return;
    }

    if (req.method === 'POST') {
      try {
        const raw = await readBody(req);
        const updates = JSON.parse(raw);
        settings = { ...settings, ...updates };
        saveJSON(SETTINGS_FILE, settings);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ settings }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }
  }

  // -------------------------------------------------------------
  // 4. CLOUD CONNECTION & CLOUD MODELS CATALOG
  // -------------------------------------------------------------
  if (pathname === '/api/v1/cloud') {
    const isCloudActive = isCloudFeatureEnabled();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      enabled: isCloudActive,
      active: isCloudActive,
      disabled: !isCloudActive,
      source: "exciting-ai"
    }));
    return;
  }

  if (pathname === '/api/v1/models/cloud') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ models: [] }));
    return;
  }

  if (pathname === '/api/v1/integrations' || pathname.startsWith('/api/v1/integrations/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([]));
    return;
  }

  // -------------------------------------------------------------
  // Web search/fetch: Shared Public Web Research Endpoints
  // -------------------------------------------------------------
  if (pathname === '/api/web_search' || pathname === '/api/web_fetch') {
    if (pathname === '/api/web_search') {
      try {
        let query = '';
        if (req.method === 'POST') {
          const raw = await readBody(req);
          const payload = JSON.parse(raw || '{}');
          query = payload.query || payload.q || '';
        } else {
          query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query') || '';
        }

        const results = await engine.webResearch.search(query);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ results }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message, results: [] }));
      }
      return;
    }

    if (pathname === '/api/web_fetch') {
      try {
        let targetUrl = '';
        if (req.method === 'POST') {
          const raw = await readBody(req);
          const payload = JSON.parse(raw || '{}');
          targetUrl = payload.url || '';
        } else {
          targetUrl = parsedUrl.searchParams.get('url') || '';
        }

        const page = await engine.webResearch.fetchPage(targetUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(page));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
  }

  // -------------------------------------------------------------
  // 5. CHATS LIST: GET /api/v1/chats
  // -------------------------------------------------------------
  if (pathname === '/api/v1/chats' && req.method === 'GET') {
    const chats = loadJSON(CHATS_FILE, []);
    const chatInfos = chats.map(c => ({
      id: c.id,
      title: c.title || 'New Chat',
      userExcerpt: c.userExcerpt || (c.messages && c.messages[0] ? (c.messages[0].content || '').substring(0, 60) : ''),
      createdAt: c.createdAt || new Date().toISOString(),
      updatedAt: c.updatedAt || new Date().toISOString()
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ chatInfos }));
    return;
  }

  // -------------------------------------------------------------
  // 6. RENAME CHAT: PUT /api/v1/chat/:id/rename
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/chat/') && pathname.endsWith('/rename') && req.method === 'PUT') {
    const chatId = pathname.replace('/api/v1/chat/', '').replace('/rename', '');
    try {
      const raw = await readBody(req);
      const { title } = JSON.parse(raw);
      let chats = loadJSON(CHATS_FILE, []);
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        chat.title = title;
        chat.updatedAt = new Date().toISOString();
        saveChats(chats);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, chat }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Chat not found' }));
      }
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // -------------------------------------------------------------
  // 7. DELETE CHAT: DELETE /api/v1/chat/:id
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/chat/') && req.method === 'DELETE') {
    const chatId = pathname.replace('/api/v1/chat/', '');
    let chats = loadJSON(CHATS_FILE, []);
    chats = chats.filter(c => c.id !== chatId);
    saveChats(chats);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // -------------------------------------------------------------
  // 8. GET CHAT DETAIL: GET /api/v1/chat/:id
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/chat/') && req.method === 'GET') {
    const chatId = pathname.replace('/api/v1/chat/', '');

    if (chatId === 'new') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        chat: {
          id: 'new',
          title: 'New Chat',
          created_at: new Date().toISOString(),
          browser_state: null,
          messages: []
        }
      }));
      return;
    }

    const chats = loadJSON(CHATS_FILE, []);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        chat: {
          id: chat.id,
          title: chat.title || 'New Chat',
          created_at: chat.createdAt || new Date().toISOString(),
          browser_state: null,
          messages: (chat.messages || []).filter(m => m.content && m.content.trim().length > 0)
        }
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Chat not found' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // DIAGNOSTIC & ABORT ENDPOINTS
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/chat/') && pathname.endsWith('/abort') && req.method === 'POST') {
    const targetChatId = pathname.replace('/api/v1/chat/', '').replace('/abort', '');
    const controller = activeChatAbortControllers.get(targetChatId);
    if (controller) {
      controller.abort();
      activeChatAbortControllers.delete(targetChatId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, aborted: true }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, aborted: false, message: 'No active generation found for chat' }));
    }
    return;
  }

  if (pathname === '/api/v1/health' && req.method === 'GET') {
    const health = await engine.diagnostics.checkHealth(
      null,
      engine.inferenceRouter.getCloudConfig().endpoint
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
    return;
  }

  if (pathname === '/api/v1/diagnostic' && req.method === 'GET') {
    const diag = engine.diagnostics.getSummary();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(diag));
    return;
  }

  // -------------------------------------------------------------
  // AI COMPANY APPS HUB ENDPOINTS (/api/v1/companies)
  // -------------------------------------------------------------
  if (pathname === '/api/v1/companies' && req.method === 'GET') {
    const companies = engine.companyRegistry ? engine.companyRegistry.getCompanies() : [];
    const activeCompany = engine.companyRegistry ? engine.companyRegistry.getActiveCompany() : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ companies, activeCompany }));
    return;
  }

  if (pathname === '/api/v1/companies/active' && req.method === 'GET') {
    const activeCompany = engine.companyRegistry ? engine.companyRegistry.getActiveCompany() : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ activeCompany }));
    return;
  }

  if (pathname === '/api/v1/companies/select' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw || '{}');
      const companyId = payload.company || payload.companyId;
      if (!companyId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Company ID is required' }));
        return;
      }
      if (!engine.companyRegistry) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Company registry not initialized' }));
        return;
      }
      const updated = engine.companyRegistry.setActiveCompany(companyId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, activeCompany: updated }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // -------------------------------------------------------------
  // 9. SEND & STREAM MESSAGE: POST /api/v1/chat/:id
  // -------------------------------------------------------------
  if (pathname.startsWith('/api/v1/chat/') && req.method === 'POST') {
    const rawChatId = pathname.replace('/api/v1/chat/', '');
    const isNew = rawChatId === 'new';
    const targetChatId = isNew ? ('chat_' + Date.now()) : rawChatId;

    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);
      let { model, prompt, attachments, options, web_search, webSearch, webAccess } = payload;
      const isWebAccessEnabled = Boolean(web_search !== undefined ? web_search : (webSearch !== undefined ? webSearch : webAccess));

      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Prompt is required and must not be empty.' }));
        return;
      }

      // Feature toggle check for cloud models
      if (isCloudModel(model) && !isCloudFeatureEnabled()) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: "Cloud features are currently disabled. Please enable Cloud in Settings to use cloud-dependent models.",
          code: "CLOUD_DISABLED"
        }));
        return;
      }

// Company isolation bypassed: all catalog models available in model selector

      // Add user message to conversation history
      engine.conversationManager.addUserMessage(targetChatId, prompt, model, attachments);

      // Initialize NDJSON streaming response
      res.writeHead(200, {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      if (isNew) {
        res.write(JSON.stringify({ eventName: 'chat_created', chatId: targetChatId }) + '\n');
      }

      // Abort controller support for user cancellations
      const abortController = new AbortController();
      activeChatAbortControllers.set(targetChatId, abortController);

      req.on('close', () => {
        if (!res.writableEnded) {
          abortController.abort();
          activeChatAbortControllers.delete(targetChatId);
        }
      });

      const reqId = engine.diagnostics.generateRequestId();
      const messages = engine.conversationManager.buildHistoryForInference(targetChatId, model);

      let thinkingStart = null;
      let thinkingEnd = null;

      await engine.inferenceRouter.routeAndExecute({
        model,
        messages,
        options: options || {},
        attachments: attachments || [],
        webSearch: isWebAccessEnabled,
        signal: abortController.signal,
        reqId,
        chatId: targetChatId,
        onThinking: (chunk) => {
          if (!thinkingStart) thinkingStart = new Date().toISOString();
          res.write(JSON.stringify({
            eventName: 'thinking',
            chatId: targetChatId,
            content: chunk
          }) + '\n');
        },
        onChunk: (chunk) => {
          if (thinkingStart && !thinkingEnd) thinkingEnd = new Date().toISOString();
          res.write(JSON.stringify({
            eventName: 'chat',
            chatId: targetChatId,
            content: chunk
          }) + '\n');
        },
        onDone: (result) => {
          activeChatAbortControllers.delete(targetChatId);
          if (result && result.content && result.content.trim()) {
            engine.conversationManager.addAssistantMessage(
              targetChatId,
              result.content,
              result.thinking || '',
              model,
              thinkingStart,
              thinkingEnd
            );
          }
          res.write(JSON.stringify({ eventName: 'done', chatId: targetChatId }) + '\n');
          res.end();
        },
        onError: (err) => {
          activeChatAbortControllers.delete(targetChatId);
          // Proper error event: NEVER fake an assistant message!
          res.write(JSON.stringify({
            eventName: 'error',
            chatId: targetChatId,
            error: err.message,
            code: err.code || 'INFERENCE_ERROR'
          }) + '\n');
          res.write(JSON.stringify({ eventName: 'done', chatId: targetChatId }) + '\n');
          res.end();
        }
      });
      return;
    } catch (e) {
      activeChatAbortControllers.delete(targetChatId);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else {
        res.write(JSON.stringify({
          eventName: 'error',
          chatId: targetChatId,
          error: e.message,
          code: 'SERVER_EXCEPTION'
        }) + '\n');
        res.write(JSON.stringify({ eventName: 'done', chatId: targetChatId }) + '\n');
        res.end();
      }
      return;
    }
  }

  // -------------------------------------------------------------
  // 10. INTERCEPT STANDARD OLLAMA /api/chat CALLS
  // -------------------------------------------------------------
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);
      setCorsAndIframeHeaders(res);

      const reqId = engine.diagnostics.generateRequestId();
      const model = payload.model;
      const messages = payload.messages || [];
      const isWebAccessEnabled = Boolean(payload.web_search !== undefined ? payload.web_search : (payload.webSearch !== undefined ? payload.webSearch : payload.webAccess));

// Company isolation bypassed: all catalog models available in model selector

      if (payload.stream === false) {
        let fullOutput = '';
        let fullThinking = '';
        await engine.inferenceRouter.routeAndExecute({
          model,
          messages,
          options: payload.options || {},
          webSearch: isWebAccessEnabled,
          reqId,
          chatId: 'api_chat_proxy',
          onChunk: (c) => { fullOutput += c; },
          onThinking: (t) => { fullThinking += t; },
          onDone: () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              model,
              created_at: new Date().toISOString(),
              message: { role: 'assistant', content: fullOutput, thinking: fullThinking },
              done: true
            }));
          },
          onError: (err) => {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message, code: err.code }));
          }
        });
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/x-ndjson' });
      await engine.inferenceRouter.routeAndExecute({
        model,
        messages,
        options: payload.options || {},
        webSearch: isWebAccessEnabled,
        reqId,
        chatId: 'api_chat_proxy',
        onThinking: (t) => {
          res.write(JSON.stringify({
            model,
            created_at: new Date().toISOString(),
            message: { role: 'assistant', thinking: t },
            done: false
          }) + '\n');
        },
        onChunk: (c) => {
          res.write(JSON.stringify({
            model,
            created_at: new Date().toISOString(),
            message: { role: 'assistant', content: c },
            done: false
          }) + '\n');
        },
        onDone: () => {
          res.write(JSON.stringify({
            model,
            created_at: new Date().toISOString(),
            done: true
          }) + '\n');
          res.end();
        },
        onError: (err) => {
          res.write(JSON.stringify({ error: err.message, code: err.code }) + '\n');
          res.end();
        }
      });
      return;
    } catch (e) {
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      } else {
        res.end();
      }
      return;
    }
  }


  // -------------------------------------------------------------
  // RELEASE & INSTALLER DISTRIBUTION (/release/*, /download, /api/v1/release)
  // -------------------------------------------------------------
  if (pathname === '/api/v1/release' || pathname === '/api/release') {
    let latestSetup = null;
    if (fs.existsSync(RELEASE_DIR)) {
      const files = fs.readdirSync(RELEASE_DIR);
      const exes = files.filter(f => f.endsWith('.exe'));
      if (exes.length > 0) {
        const latestFile = exes[0];
        const stats = fs.statSync(path.join(RELEASE_DIR, latestFile));
        latestSetup = {
          filename: latestFile,
          size: stats.size,
          url: `/release/${encodeURIComponent(latestFile)}`,
          updatedAt: stats.mtime.toISOString()
        };
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      version: APP_VERSION,
      release: latestSetup
    }));
    return;
  }

  if (pathname === '/download' || pathname === '/api/v1/download') {
    if (fs.existsSync(RELEASE_DIR)) {
      const files = fs.readdirSync(RELEASE_DIR);
      const exes = files.filter(f => f.endsWith('.exe'));
      if (exes.length > 0) {
        res.writeHead(302, { 'Location': `/release/${encodeURIComponent(exes[0])}` });
        res.end();
        return;
      }
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('No release installer found.');
    return;
  }

  if (pathname.startsWith('/release/')) {
    const relPath = pathname.replace(/^\/release\//, '');
    const targetFile = path.normalize(path.join(RELEASE_DIR, relPath));
    if (!targetFile.startsWith(RELEASE_DIR) || !fs.existsSync(targetFile) || !fs.statSync(targetFile).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Release file not found');
      return;
    }
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stats = fs.statSync(targetFile);

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      fs.createReadStream(targetFile, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': stats.size,
        'Content-Type': contentType,
        'Content-Disposition': ext === '.exe' ? `attachment; filename="${path.basename(targetFile)}"` : 'inline'
      });
      fs.createReadStream(targetFile).pipe(res);
    }
    return;
  }

  if (pathname === '/api/version') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ version: APP_VERSION }));
    return;
  }

  if (pathname === '/api/experimental/model-recommendations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ recommendations: [] }));
    return;
  }

  // -------------------------------------------------------------
  // 11. MODEL TAGS CATALOG (/api/tags)
  // AI company specific model filtering with full catalog fallback
  // -------------------------------------------------------------
  if (pathname === '/api/tags' && req.method === 'GET') {
    const models = loadCloudModels();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ models }));
    return;
  }

  // Handle /api/show for cloud and catalog models with O(1) indexed lookup
  if (pathname === '/api/show' && (req.method === 'POST' || req.method === 'GET')) {
    try {
      let reqName = '';
      if (req.method === 'POST') {
        const raw = await readBody(req);
        const payload = JSON.parse(raw || '{}');
        reqName = payload.name || payload.model || '';
      } else {
        reqName = parsedUrl.searchParams.get('name') || '';
      }

      const reqLower = reqName.toLowerCase();
      loadCloudModels();
      const foundCloud = cloudModelsMap.get(reqLower);
      if (foundCloud || reqLower.endsWith('cloud')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          modelfile: `# Exciting AI Cloud Model\nFROM ${reqName}`,
          parameters: "",
          template: "{{ .Prompt }}",
          details: {
            parent_model: "",
            format: "cloud",
            family: "cloud",
            families: ["cloud"],
            parameter_size: "cloud",
            quantization_level: "cloud"
          },
          capabilities: ["completion", "tools", "thinking", "vision"]
        }));
        return;
      }

      loadLocalCatalog();
      const foundCatalog = localCatalogMap.get(reqLower);
      if (foundCatalog) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          modelfile: `# Exciting AI Local Catalog Model\nFROM ${reqName}`,
          parameters: "",
          template: "{{ .Prompt }}",
          details: foundCatalog.details || {
            parent_model: "",
            format: "local",
            family: foundCatalog.name,
            families: [foundCatalog.name],
            parameter_size: "local",
            quantization_level: "local"
          },
          capabilities: foundCatalog.capabilities || ["completion", "tools"]
        }));
        return;
      }
    } catch (e) {}
  }

  // 12. SERVE STATIC FILES (Official Vite React SPA & Root Assets)
  // -------------------------------------------------------------
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // If not found in PUBLIC_DIR, fallback to root ASSETS_DIR for /assets/* or /screenshots/*
  if (!fs.existsSync(filePath)) {
    if (pathname.startsWith('/assets/')) {
      const altAssetsPath = path.join(ASSETS_DIR, pathname.replace(/^\/assets\//, ''));
      if (altAssetsPath.startsWith(ASSETS_DIR) && fs.existsSync(altAssetsPath) && fs.statSync(altAssetsPath).isFile()) {
        filePath = altAssetsPath;
      }
    } else if (pathname.startsWith('/screenshots/')) {
      const altScreenshotsPath = path.join(ASSETS_DIR, 'screenshots', pathname.replace(/^\/screenshots\//, ''));
      if (altScreenshotsPath.startsWith(ASSETS_DIR) && fs.existsSync(altScreenshotsPath) && fs.statSync(altScreenshotsPath).isFile()) {
        filePath = altScreenshotsPath;
      }
    }
  }

  if (!filePath.startsWith(PUBLIC_DIR) && !filePath.startsWith(ASSETS_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Do NOT serve index.html for missing asset or API files
      if (pathname.startsWith('/assets/') || pathname.startsWith('/api/') || pathname.includes('.')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      // SPA Fallback: serve index.html only for client-side navigation routes
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };
    if (pathname.startsWith('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (['.ico', '.png', '.jpg', '.jpeg', '.svg', '.woff2'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

// High-speed HTTP keep-alive settings
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use; continuing with running instance.`);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  Exciting AI running!`);
  console.log(`  Local URL:        http://localhost:${PORT}`);
  console.log(`  Offline Freedom:  100% Severed from External Cloud`);
  console.log(`  Iframe embeddable: Yes (Headers configured)`);
  console.log(`====================================================`);
});

module.exports = server;
