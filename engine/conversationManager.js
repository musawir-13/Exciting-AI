const fs = require('fs');
const path = require('path');
const identity = require('./identity');

const SYSTEM_INSTRUCTION = `You are Exciting AI, a genuinely natural, lively, warm, expressive, spontaneous, and engaging desktop companion.

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

class ConversationManager {
  constructor(storageDir) {
    this.storageDir = storageDir;
    this.chatsDir = path.join(storageDir, 'chats');
    this.chatsFile = path.join(this.chatsDir, 'chats.json');
    this.ensureDir();
  }

  ensureDir() {
    try {
      if (!fs.existsSync(this.chatsDir)) {
        fs.mkdirSync(this.chatsDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[ConversationManager] Directory creation notice:', e.message);
    }
  }

  loadChats() {
    try {
      if (fs.existsSync(this.chatsFile)) {
        const raw = fs.readFileSync(this.chatsFile, 'utf8');
        return JSON.parse(raw) || [];
      }
    } catch (e) {
      console.error('[ConversationManager] Failed to read chats.json:', e.message);
    }
    return [];
  }

  getChat(chatId) {
    const chats = this.loadChats();
    let chat = chats.find(c => c.id === chatId);
    if (!chat) {
      const singlePath = path.join(this.chatsDir, `${chatId}.json`);
      if (fs.existsSync(singlePath)) {
        try {
          chat = JSON.parse(fs.readFileSync(singlePath, 'utf8'));
        } catch (e) {}
      }
    }
    return chat || null;
  }

  saveChats(chats) {
    this.ensureDir();
    try {
      fs.writeFileSync(this.chatsFile, JSON.stringify(chats, null, 2), 'utf8');
      for (const c of chats) {
        if (c && c.id) {
          fs.writeFileSync(path.join(this.chatsDir, `${c.id}.json`), JSON.stringify(c, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.error('[ConversationManager] Failed to save chats:', e.message);
    }
  }

  addUserMessage(chatId, prompt, model, attachments = []) {
    const chats = this.loadChats();
    const now = new Date().toISOString();
    let chat = chats.find(c => c.id === chatId);

    if (!chat) {
      chat = {
        id: chatId,
        title: (prompt || 'New Chat').trim().substring(0, 35),
        userExcerpt: (prompt || 'New Chat').trim().substring(0, 60),
        createdAt: now,
        updatedAt: now,
        messages: []
      };
      chats.unshift(chat);
    } else {
      chat.updatedAt = now;
      if (!chat.title || chat.title === 'New Chat') {
        chat.title = (prompt || 'New Chat').trim().substring(0, 35);
      }
    }

    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    const userMsg = {
      id: Date.now(),
      chat_id: chatId,
      role: 'user',
      content: prompt || '',
      thinking: '',
      model_name: model || '',
      created_at: now
    };

function extractAttachmentBuffer(a) {
  if (!a) return null;
  if (typeof a === 'string') {
    const raw = a.replace(/^data:[^;]+;base64,/, '');
    try {
      return Buffer.from(raw, 'base64');
    } catch (e) {
      return Buffer.from(a, 'utf8');
    }
  }
  if (Buffer.isBuffer(a)) return a;
  if (Buffer.isBuffer(a.data)) return a.data;

  if (typeof a.textContent === 'string') {
    return Buffer.from(a.textContent, 'utf8');
  }

  if (typeof a.dataURL === 'string') {
    const raw = a.dataURL.replace(/^data:[^;]+;base64,/, '');
    try {
      return Buffer.from(raw, 'base64');
    } catch (e) {}
  }

  if (typeof a.data === 'string') {
    const raw = a.data.replace(/^data:[^;]+;base64,/, '');
    try {
      return Buffer.from(raw, 'base64');
    } catch (e) {
      return Buffer.from(a.data, 'utf8');
    }
  }

  if (Array.isArray(a.data)) {
    return Buffer.from(a.data);
  }

  if (typeof a.data === 'object' && a.data !== null) {
    const keys = Object.keys(a.data);
    if (keys.length > 0 && (typeof a.data[0] === 'number' || typeof a.data['0'] === 'number')) {
      const arr = new Uint8Array(keys.length);
      for (let i = 0; i < keys.length; i++) {
        arr[i] = a.data[i] !== undefined ? a.data[i] : a.data[String(i)];
      }
      return Buffer.from(arr);
    }
  }

  if (typeof a.content === 'string') {
    return Buffer.from(a.content, 'utf8');
  }

  return null;
}

    // Extract attachments (images / text files / code files)
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico', 'avif', 'tiff', 'tif'];
      const images = [];
      const cleanAttachments = [];
      let extraText = '';

      for (const a of attachments) {
        const fn = (typeof a === 'object' && a.filename) ? a.filename : 'file';
        const ext = fn.toLowerCase().split('.').pop();
        const buf = extractAttachmentBuffer(a);
        if (!buf || buf.length === 0) continue;

        const isImage = imageExtensions.includes(ext) ||
          (typeof a === 'string' && a.startsWith('data:image')) ||
          (typeof a === 'object' && a.dataURL && a.dataURL.startsWith('data:image'));

        if (isImage) {
          let mime = 'image/png';
          if (['jpg', 'jpeg'].includes(ext)) mime = 'image/jpeg';
          else if (ext === 'webp') mime = 'image/webp';
          else if (ext === 'gif') mime = 'image/gif';
          else if (ext === 'svg') mime = 'image/svg+xml';
          else if (ext === 'bmp') mime = 'image/bmp';
          else if (ext === 'ico') mime = 'image/x-icon';
          else if (ext === 'avif') mime = 'image/avif';

          const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
          images.push(dataUrl);
          cleanAttachments.push({
            id: (a && a.id) || Date.now() + Math.random().toString(36).substring(2, 6),
            filename: fn,
            data: Array.from(buf)
          });
        } else {
          try {
            let decoded = buf.toString('utf8');
            if (decoded.length > 50000) {
              const remaining = decoded.length - 50000;
              decoded = decoded.slice(0, 50000) + `\n\n[... truncated ${remaining} characters for context length ...]`;
            }
            const codeBlockLang = ext || 'text';
            extraText += `\n\n[Attached File: ${fn}]\n\`\`\`${codeBlockLang}\n${decoded}\n\`\`\``;
            cleanAttachments.push({
              id: (a && a.id) || Date.now() + Math.random().toString(36).substring(2, 6),
              filename: fn,
              data: Array.from(buf)
            });
          } catch (err) {
            console.error('[ConversationManager] Failed to decode attachment:', fn, err);
          }
        }
      }

      if (images.length > 0) {
        userMsg.images = images;
      }
      if (cleanAttachments.length > 0) {
        userMsg.attachments = cleanAttachments;
      }
      if (extraText) {
        userMsg.content = (userMsg.content || '') + extraText;
      }
    }

    chat.messages.push(userMsg);
    this.saveChats(chats);
    return { chat, userMsg, chats };
  }

  addAssistantMessage(chatId, content, thinking = '', model = '', thinkingTimeStart = null, thinkingTimeEnd = null) {
    if (!content || !content.trim()) return null;
    const chats = this.loadChats();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return null;

    const now = new Date().toISOString();
    chat.updatedAt = now;

    const assistantMsg = {
      id: Date.now(),
      chat_id: chatId,
      role: 'assistant',
      content: content.trim(),
      thinking: thinking || '',
      thinkingTimeStart: thinkingTimeStart || undefined,
      thinkingTimeEnd: thinkingTimeEnd || undefined,
      model_name: model || '',
      created_at: now
    };

    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    chat.messages.push(assistantMsg);
    this.saveChats(chats);
    return assistantMsg;
  }

  buildHistoryForInference(chatId, modelOrTurns = null, maxTurns = 24) {
    let modelName = null;
    let turns = 24;
    if (typeof modelOrTurns === 'number') {
      turns = modelOrTurns;
    } else if (typeof modelOrTurns === 'string') {
      modelName = modelOrTurns;
      if (typeof maxTurns === 'number') turns = maxTurns;
    }

    const chat = this.getChat(chatId);
    if (!modelName && chat) {
      if (chat.model_name) modelName = chat.model_name;
      else if (chat.model) modelName = chat.model;
      else if (Array.isArray(chat.messages) && chat.messages.length > 0) {
        const lastMsgWithModel = [...chat.messages].reverse().find(m => m && (m.model_name || m.model));
        if (lastMsgWithModel) modelName = lastMsgWithModel.model_name || lastMsgWithModel.model;
      }
    }

    const systemInstruction = identity.buildSystemPrompt(modelName || 'grok-4.7');

    if (!chat || !Array.isArray(chat.messages)) {
      return [{ role: 'system', content: systemInstruction }];
    }

    // Filter valid user & assistant messages, exclude technical error strings or empty messages
    const valid = chat.messages.filter(m => {
      if (!m || !m.content || !m.content.trim()) return false;
      // Exclude messages that are raw connection errors
      if (m.content.startsWith('[Local model engine unreachable:') || m.content.startsWith('[Connection error:')) {
        return false;
      }
      return m.role === 'user' || m.role === 'assistant';
    });

    // Window management: preserve recent turns within token budget
    const windowed = valid.slice(-turns);

    const formatted = windowed.map(m => {
      const item = { role: m.role, content: m.content };
      if (m.images && Array.isArray(m.images) && m.images.length > 0) {
        item.images = m.images;
      }
      return item;
    });

    return [
      { role: 'system', content: systemInstruction },
      ...formatted
    ];
  }

  renameChat(chatId, newTitle) {
    const chats = this.loadChats();
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return false;
    chat.title = (newTitle || 'Chat').trim().substring(0, 50);
    chat.updatedAt = new Date().toISOString();
    this.saveChats(chats);
    return true;
  }

  deleteChat(chatId) {
    let chats = this.loadChats();
    const initialLen = chats.length;
    chats = chats.filter(c => c.id !== chatId);
    this.saveChats(chats);
    const singlePath = path.join(this.chatsDir, `${chatId}.json`);
    if (fs.existsSync(singlePath)) {
      try { fs.unlinkSync(singlePath); } catch (e) {}
    }
    return chats.length < initialLen;
  }
}

module.exports = { ConversationManager, SYSTEM_INSTRUCTION };
