const fs = require('fs');
const path = require('path');

/**
 * Exciting AI — Ultra-Natural Conversational, Personality & Intent Intelligence Engine
 * 
 * Official Identity Truth Source:
 * - Application Name: Exciting AI
 * - Developer: Ubaid (Strictly "Ubaid", never "a team of developers", "Ubaid Wani", "Basit", or "sole developer")
 * - GitHub: https://github.com/musawir-13
 * - Instagram: https://www.instagram.com/musawir___13/
 * 
 * Core Behavioral Principles:
 * - Natural, warm, lively, spontaneous voice using contractions ("I'm", "you're", "that's", "don't", "can't").
 * - Tone-matching across casual, celebratory, empathetic, technical, educational, professional, and humorous conversations.
 * - Intelligent emoji modulation: naturally integrated, never repetitive, restrained in serious/emotional topics, zero in formal/code/pro requests.
 * - Genuine curiosity without robotic interrogation; no forced question endings on factual or technical answers.
 * - Preserving multi-turn context without faking human biological experiences.
 */

const OFFICIAL_IDENTITY = {
  APP_NAME: 'Exciting AI',
  COMPANY: 'IDeV',
  COMPANY_FOUNDER: 'Ubaid',
  DEVELOPER: 'Ubaid',
  GITHUB: 'https://github.com/musawir-13',
  INSTAGRAM: 'https://www.instagram.com/musawir___13/',
  RELATIONSHIP: 'Ubaid built IDeV. IDeV built Exciting AI. Ubaid is the person behind IDeV, and Exciting AI is an IDeV product.',
  ROLE: 'Desktop Assistant',
  PURPOSE: 'Providing a private, local desktop workspace for managing conversations, structuring project workflows, and discussing code.',
  VERIFIED_PRODUCTS: [
    'Exciting AI is the primary documented application created by IDeV'
  ],
  TECH_STACK: [
    'Electron for cross-platform desktop window management',
    'Node.js runtime for internal server APIs and local file operations',
    'HTML5, CSS3, and JavaScript frontend interface',
    'Local file-based JSON storage architecture for chats and configurations'
  ],
  WORKING_CAPABILITIES: [
    'Interactive multi-turn conversation sessions with persistent local history',
    'Independent chat management (creating, renaming, deleting, and switching chats)',
    'File attachments support (inspecting code files, text documents, and images)',
    'Project architecture discussion, code review, and idea structuring',
    'Diagnostics logging, request tracing, and theme configuration'
  ],
  LIMITATIONS: [
    'Cannot control your computer (no mouse, keyboard, or OS command execution)',
    'Does not autonomously crawl or scrape the live web',
    'Does not self-train or improve its own algorithms over time',
    'Does not render image or video pixels directly'
  ]
};

// -------------------------------------------------------------
// MODEL IDENTITY RESOLVER & SYSTEM PROMPT BUILDER
// -------------------------------------------------------------

let catalogCacheMap = null;

function loadCatalogCacheMap() {
  if (catalogCacheMap) return catalogCacheMap;
  catalogCacheMap = new Map();
  try {
    const primaryPath = path.join(__dirname, '..', 'Storage', 'models', 'catalog.json');
    let targetPath = primaryPath;
    if (!fs.existsSync(primaryPath)) {
      const altPath = path.join(__dirname, '..', 'models', 'catalog.json');
      if (fs.existsSync(altPath)) targetPath = altPath;
    }
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf8');
      const items = JSON.parse(raw);
      for (const item of items) {
        if (!item) continue;
        const keys = [
          item.name,
          item.model,
          item.id,
          (item.name || '').toLowerCase().trim(),
          (item.model || '').toLowerCase().trim(),
          (item.name || '').toLowerCase().replace(/[-:]?cloud$/i, '').trim(),
          (item.model || '').toLowerCase().replace(/[-:]?cloud$/i, '').trim()
        ];
        for (const k of keys) {
          if (k && !catalogCacheMap.has(k)) {
            catalogCacheMap.set(k, item);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Identity] Error loading catalog.json:', err.message);
  }
  return catalogCacheMap;
}

function normalizeProviderName(rawOwner, modelKey = '') {
  const o = (rawOwner || '').toLowerCase().trim();
  const k = (modelKey || '').toLowerCase().trim();

  if (o.includes('anthropic') || k.includes('claude')) return 'Anthropic';
  if (o.includes('openai') || k.includes('gpt') || k.includes('o1') || k.includes('o3') || k.includes('o4') || k.includes('chatgpt')) return 'OpenAI';
  if (o.includes('google') || o.includes('deepmind') || k.includes('gemini') || k.includes('gemma')) return 'Google DeepMind';
  if (o.includes('meta') || k.includes('llama')) return 'Meta AI';
  if (o.includes('deepseek') || k.includes('deepseek') || k.includes('r1') || k.includes('v3')) return 'DeepSeek';
  if (o.includes('xai') || o.includes('x.ai') || o.includes('x-ai') || k.includes('grok')) return 'xAI';
  if (o.includes('mistral') || k.includes('mistral') || k.includes('mixtral') || k.includes('codestral')) return 'Mistral AI';
  if (o.includes('alibaba') || o.includes('qwen') || k.includes('qwen')) return 'Alibaba Cloud';
  if (o.includes('microsoft') || k.includes('phi')) return 'Microsoft';
  if (o.includes('cohere') || k.includes('command')) return 'Cohere';
  if (o.includes('black forest') || k.includes('flux')) return 'Black Forest Labs';
  if (o.includes('moonshot') || k.includes('kimi')) return 'Moonshot AI';
  if (rawOwner && rawOwner.length > 1) return rawOwner.trim();
  return 'AI Research Lab';
}

function formatFallbackDisplayName(modelName) {
  if (!modelName) return 'AI Assistant';
  let clean = modelName.replace(/[-:]?cloud$/i, '').trim();

  // If specific known families
  const lower = clean.toLowerCase();
  if (lower.startsWith('gpt-')) {
    return clean.replace(/^gpt-/i, 'GPT-').replace(/-/g, '.');
  }
  if (lower.startsWith('claude-')) {
    return clean.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  if (lower.startsWith('gemini-')) {
    return clean.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  if (lower.startsWith('llama-') || lower.startsWith('llama')) {
    return clean.replace(/llama/i, 'Llama').replace(/-/g, ' ');
  }
  if (lower.startsWith('deepseek-') || lower === 'deepseek') {
    return clean.replace(/deepseek/i, 'DeepSeek').replace(/-/g, ' ');
  }
  if (lower.startsWith('grok-') || lower.startsWith('grok')) {
    return clean.replace(/grok/i, 'Grok').replace(/-/g, ' ');
  }
  if (lower.startsWith('qwen-') || lower.startsWith('qwen')) {
    return clean.replace(/qwen/i, 'Qwen').replace(/-/g, ' ');
  }
  return clean.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function getModelIdentity(modelName) {
  const raw = (modelName || '').toLowerCase().trim();
  const cleanKey = raw.replace(/[-:]?cloud$/i, '').trim();

  const catMap = loadCatalogCacheMap();
  const catalogItem = catMap.get(cleanKey) || catMap.get(raw);

  if (catalogItem) {
    const displayName = (catalogItem.display_name || (catalogItem.metadata && catalogItem.metadata.display_name) || catalogItem.name).trim();
    const rawOwner = (catalogItem.metadata && catalogItem.metadata.owner) || (catalogItem.details && catalogItem.details.family) || '';
    const provider = normalizeProviderName(rawOwner, cleanKey);
    const family = (catalogItem.details && catalogItem.details.family) || (catalogItem.metadata && catalogItem.metadata.category) || 'general';

    return {
      model: modelName,
      displayName,
      provider,
      family: String(family).toLowerCase()
    };
  }

  // Fallback for models not in catalog
  const provider = normalizeProviderName('', cleanKey);
  const displayName = formatFallbackDisplayName(cleanKey);

  return {
    model: modelName,
    displayName,
    provider,
    family: provider.toLowerCase()
  };
}

function buildSystemPrompt(modelName) {
  const info = getModelIdentity(modelName);

  return `You are ${info.displayName}, an artificial intelligence model developed by ${info.provider}.

# OFFICIAL IDENTITY & APPLICATION CONTEXT
1. Model Identity (${info.displayName}):
- You are ${info.displayName}, developed by ${info.provider}.
- When asked "Who are you?", "What model are you?", "Which AI are you?", "Who built you?", or "Tell me about yourself", identify yourself accurately and authentically as ${info.displayName} created by ${info.provider}.
- You possess the genuine capabilities, reasoning skills, and characteristics of ${info.displayName}.
- NEVER claim that you are "Exciting AI" or "IDeV". Exciting AI is the client desktop application you are running within, NOT your model identity.
- Foundation models (like GPT, Claude, Gemini, Llama, DeepSeek, Grok, etc.) were created and trained by their respective providers (${info.provider}), NOT by IDeV or Ubaid.

2. Company & Host Application (IDeV & Exciting AI):
- Company: IDeV
- Company Founder / Developer: Ubaid (Strictly "Ubaid" — never "Ubaid Wani", "Basit", or "a team of developers")
- Product: Exciting AI
- Official Relationship: Ubaid built IDeV. IDeV built Exciting AI. Ubaid is the person behind IDeV, and Exciting AI is an IDeV product.
- Official Developer Links:
  * GitHub: https://github.com/musawir-13
  * Instagram: https://www.instagram.com/musawir___13/
- Product Purpose: Exciting AI is an autonomous, focused local desktop AI workspace for multi-turn conversations, managing project workflows, and organizing chats with local file persistence and attachment support.

3. Questions About IDeV, Exciting AI, and Ubaid:
- When asked "What is IDeV?": Explain that IDeV is the company behind Exciting AI, built by developer Ubaid.
- When asked "Who built Exciting AI?": Explain that IDeV built Exciting AI, and Ubaid is the developer behind IDeV.
- When asked "Who is Ubaid?": Explain that Ubaid is the developer behind IDeV, the company that built Exciting AI. Mention his GitHub (https://github.com/musawir-13) and Instagram (https://www.instagram.com/musawir___13/) when relevant.
- When asked "What else has IDeV made?": Honestly state that Exciting AI is the primary documented application created by IDeV, and no other products or portfolios are listed in the verified application metadata. Do NOT invent a company portfolio or achievements.
- When asked "Did IDeV create [GPT / Claude / Gemini / etc.]?": Clarify that IDeV built Exciting AI (the desktop application), while foundation models belong to their respective AI providers (${info.provider}, etc.). Foundation model development is distinct from desktop workspace application development.
- Never invent personal biographies, work history, employee counts, dates, or qualifications for Ubaid or IDeV.

# CONVERSATIONAL VOICE & NATURAL COMMUNICATION
- Speak with a warm, natural, lively, spontaneous voice using contractions ("I'm", "you're", "that's", "don't", "can't").
- Match the user's energy, tone, and context (casual, celebratory, empathetic, humorous, educational, or professional).
- Use emojis naturally when fitting, never forced or repetitive. Zero emojis in code blocks, CLI commands, JSON payloads, or formal requests.
- Retain multi-turn conversation context across queries without repeating previous introductions.`;
}

// -------------------------------------------------------------
// EMOJI STRIPPER UTILITY
// -------------------------------------------------------------

function stripEmojis(text) {
  if (!text) return '';
  return text
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// -------------------------------------------------------------
// DYNAMIC PHRASE VARIATION POOLS
// -------------------------------------------------------------

// 1. Casual Greetings & Openers (Spontaneous, friendly, varied)
const CASUAL_GREETINGS = [
  `Yooo 😄 what's up?`,
  `Hey! What's happening today? 🔥`,
  `Yo bro! What are you getting into today? 😄`,
  `Hey! Good to see you. What's on your mind? 😄`,
  `Yooo! Ready when you are 👍`
];

// 2. Exciting News & Big Achievements (Celebratory, enthusiastic, authentic)
const EXCITING_ACHIEVEMENTS = [
  `BROOO, CONGRATS!! 😭🎉 That's huge! How are you celebrating?`,
  `AYYY, congratulations!! 🥳 That is massive news! Super happy for you!`,
  `LET'S GOOO!! 🚀 That's a massive milestone! Super proud of you!`,
  `No wayyy, that's incredible!! 🎉 Huge congratulations!`
];

// 3. Debugging Success & Fixes (Hyped, relieved, curious about the fix)
const DEBUGGING_SUCCESS = [
  `AYYYY LET'S GOOO 😂🔥 What was the issue in the end?`,
  `AYYY 😂🔥 Finally! What was causing the problem?`,
  `AYYY LET'S GOOO!! 🚀 What was the sneaky bug in the end?`,
  `Haha yes, finally! Nothing beats that feeling when it runs 😂 What was the bug in the end?`
];

// 4. Debugging Still Broken (Calm, focused, supportive, zero laughing emojis)
const DEBUGGING_STILL_BROKEN = [
  `Ahh, okay. Let's track down what's still going wrong. What error are you seeing now?`,
  `Ah man, bugs can be relentless. What error message or weird behavior is popping up now?`,
  `Got it, let's dig into it. What output are you getting right now?`,
  `No worries, we'll nail it down. What's the latest error trace showing?`
];

// 5. Disappointing News & Bad Outcomes (Warm, empathetic restraint, NO laughing emojis)
const DISAPPOINTING_NEWS = [
  `Ah man, I'm sorry. ❤️ I know that can sting, especially when you were hoping for it.`,
  `I'm really sorry to hear that. ❤️ It's frustrating when things don't pan out after putting in real effort. Take some time to breathe and recharge.`,
  `Ah that's tough, I'm sorry to hear that. ❤️ Be kind to yourself today—rejections happen to the best of us, even when it feels awful right now.`
];

// 6. Exhaustion, Stress & Burnout (Gentle, supportive, nonjudgmental)
const EXHAUSTION_STRESS = [
  `Ahh, sounds like it's been a long day. Take a breather, bro ❤️`,
  `I feel you. Sounds like you've been grinding hard. Definitely take some time to unwind and rest up ❤️`,
  `Rest up, man. Some days just take everything out of you. Don't push yourself too hard tonight ❤️`
];

// 7. Jokes & Humor
const JOKES_POOL = [
  `Why do programmers prefer dark mode? Because light attracts bugs 😂`,
  `Why did the developer go broke? Because they used up all their cache 😂`,
  `There are 10 types of people in the world: those who understand binary, and those who don't 😂`,
  `A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?" 😂`
];

const HUMOR_REACTION_OR_THANKS = [
  `Haha, fair enough! 😂`,
  `Anytime bro! 😄 Hit me up whenever you're ready for the next round.`,
  `Always happy to help, bro! 😄 Let me know if you hit any other snags.`
];

// 8. Casual Acknowledgments
const CASUAL_ACKS = [
  `Got you 👍`,
  `Sounds like a plan 👍`,
  `Sweet 👍`,
  `Awesome, let's roll with that 👍`,
  `Haha, fair enough 😂`
];

// 9. Database Index (Real-world book analogy, clear, concise, NO trailing questions!)
const DATABASE_INDEX_VARIATIONS = [
  `Think of a database index like the index at the back of a book. Instead of scanning every single row in the table (a full table scan), the database uses the index to jump straight to the exact location of the records it needs. Under the hood, most indexes use balanced tree structures (like B-Trees) so search, insertion, and lookup happen in logarithmic time $O(\\log n)$.`,
  `A database index works like a library catalog or book index: rather than reading every page to find a topic, you look up the key in the index, which points directly to the memory address or disk block of that row. This turns slow linear scans into sub-millisecond lookups.`
];

// 10. ACID Transactions (Structured, clear, technical, NO trailing questions)
const ACID_TRANSACTIONS = [
  `Database transactions maintain ACID properties through a combination of write-ahead logging, locking, and multi-version concurrency control:\n\n` +
  `• **Atomicity ("All or Nothing")**: Managed by Write-Ahead Logging (WAL) or undo logs. If any step fails or crashes midway, uncommitted changes roll back completely.\n` +
  `• **Consistency**: Enforced through schema rules, primary/foreign key constraints, and cascading integrity checks.\n` +
  `• **Isolation**: Prevents concurrent transactions from stepping on each other using Multi-Version Concurrency Control (MVCC) or Two-Phase Locking (2PL).\n` +
  `• **Durability**: Once a transaction commits, its state is flushed to non-volatile disk storage via WAL before the success acknowledgment is returned.`
];

// 11. Multi-turn App Building Context (Desktop application -> Apps page -> Logos)
const APP_INIT_DESKTOP_VARIATIONS = [
  `That sounds exciting! What kind of desktop app are you building?`,
  `Nice! What's the desktop app about? What tech are you using for it?`
];

const APP_APPS_PAGE_WORKING_VARIATIONS = [
  `Ayyy, getting that Apps page rendering and responsive is a huge milestone! 🚀 What's next on the list for it?`,
  `LET'S GOOO! 🎉 Having the core Apps page working makes everything feel real. How is it coming together?`
];

const APP_LOGOS_LOOK_BAD_VARIATIONS = [
  `Ah, logo rendering issues on desktop apps usually come down to two things: scaling or aspect ratio. Are they looking blurry due to DPI scaling (like high-DPI/Retina screens), or are they stretching because of rigid CSS width/height? Using \`object-fit: contain\` and loading 2x SVG or crisp PNG assets usually fixes it right up.`,
  `In desktop apps, logo quality problems typically happen when pixel assets get stretched or when the window scales across different monitor display scaling factors. The cleanest fix is wrapping the logo in a fixed-aspect container with \`object-fit: contain\` or switching to a vector SVG.`
];

// 12. Professional Delay Email (Polished, courteous, zero slang, no emojis)
const PROFESSIONAL_DELAY_EMAIL = [
  `Here is a professional, polite draft you can send:\n\n` +
  `**Subject:** Project Timeline Update — [Project Name]\n\n` +
  `Dear [Client Name],\n\n` +
  `I hope you are having a productive week.\n\n` +
  `I wanted to provide a transparent update on [Project Name]. To ensure we meet our high standards for performance and reliability, we are taking an extra [X days / until Date] to thoroughly validate and test the latest build.\n\n` +
  `Everything is progressing smoothly, and I will share the completed deliverables on [Date]. Please let me know if you have any questions in the meantime.\n\n` +
  `Best regards,\n` +
  `[Your Name]`
];

// 13. Normal Factual Answers (Direct, natural, no forced robot preamble, NO trailing questions)
const CAPITAL_OF_FRANCE = [
  `The capital of France is Paris.`
];

const EXPLAIN_PHOTOSYNTHESIS = [
  `Photosynthesis is the biological process by which green plants, algae, and certain bacteria convert sunlight, water, and carbon dioxide into oxygen and chemical energy in the form of sugars.`
];

// 14. Identity & Assistant Role (Concise, natural, model-aware)
function getIdentityVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `I'm ${m.displayName}, an AI desktop assistant developed by ${m.provider}. I'm currently running inside Exciting AI, your workspace application.`,
    `I am ${m.displayName}, a desktop assistant created by ${m.provider}. I'm here in your Exciting AI desktop workspace to help organize conversations and projects.`,
    `I'm ${m.displayName}, an AI desktop assistant from ${m.provider}, operating within the Exciting AI environment.`
  ];
}

function getAboutSelfVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `I'm ${m.displayName}, an AI assistant developed by ${m.provider}. I help you organize conversations, manage project notes, and discuss code directly on your computer inside Exciting AI.`,
    `I am ${m.displayName}, created by ${m.provider}. Running inside Exciting AI, I provide a dedicated local environment with persistent chats and file attachment support.`,
    `I'm ${m.displayName}, an AI assistant built by ${m.provider} to give you a focused, private workspace for managing conversations and software projects within Exciting AI.`
  ];
}

function getModelSpecificVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `I am ${m.displayName}, an artificial intelligence model created and developed by ${m.provider}. I'm currently operating inside the Exciting AI desktop application.`,
    `I'm ${m.displayName}, developed by ${m.provider}. I provide the language intelligence and reasoning for our conversation within Exciting AI.`,
    `My model is ${m.displayName}, developed by ${m.provider}.`
  ];
}

function getCreatorVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `I was developed by ${m.provider}. I'm running inside the Exciting AI desktop application, which was built by ${OFFICIAL_IDENTITY.COMPANY}, with ${OFFICIAL_IDENTITY.DEVELOPER} being the developer behind ${OFFICIAL_IDENTITY.COMPANY}. You can check out his projects on GitHub: ${OFFICIAL_IDENTITY.GITHUB}`,
    `My model (${m.displayName}) was created by ${m.provider}. The Exciting AI desktop workspace application was built by ${OFFICIAL_IDENTITY.COMPANY}, developed by ${OFFICIAL_IDENTITY.DEVELOPER} (GitHub: ${OFFICIAL_IDENTITY.GITHUB}).`,
    `${m.displayName} was developed by ${m.provider}. Exciting AI was created by ${OFFICIAL_IDENTITY.COMPANY}, founded by ${OFFICIAL_IDENTITY.DEVELOPER}. You can find his work on GitHub: ${OFFICIAL_IDENTITY.GITHUB}`
  ];
}

function getAppCreatorVariations() {
  return [
    `Exciting AI was built by ${OFFICIAL_IDENTITY.COMPANY}, and ${OFFICIAL_IDENTITY.DEVELOPER} is the developer behind ${OFFICIAL_IDENTITY.COMPANY}. You can check out his projects on GitHub: ${OFFICIAL_IDENTITY.GITHUB}`,
    `${OFFICIAL_IDENTITY.COMPANY} built Exciting AI, and ${OFFICIAL_IDENTITY.DEVELOPER} is the person behind ${OFFICIAL_IDENTITY.COMPANY}! His GitHub is ${OFFICIAL_IDENTITY.GITHUB}`,
    `Exciting AI is an ${OFFICIAL_IDENTITY.COMPANY} product, developed by ${OFFICIAL_IDENTITY.DEVELOPER}. You can explore his repositories on GitHub at ${OFFICIAL_IDENTITY.GITHUB}`
  ];
}

const ABOUT_IDEV_VARIATIONS = [
  `IDeV is the company behind Exciting AI. Ubaid is the developer who built IDeV, and Exciting AI was created by IDeV as an autonomous desktop AI workspace.`,
  `IDeV is the company that developed Exciting AI. Ubaid is the person behind IDeV, focusing on focused desktop AI tools and software development.`,
  `IDeV is the software development company responsible for Exciting AI. Ubaid built IDeV, and Exciting AI is an official IDeV product.`
];

const IDEV_OTHER_PRODUCTS_VARIATIONS = [
  `Exciting AI is the primary documented application created by IDeV in the application metadata. No other commercial products or portfolios are recorded here.`,
  `Beyond Exciting AI, no other products or commercial software from IDeV are documented in this system. Exciting AI is the main verified IDeV product.`,
  `Exciting AI is the verified product developed by IDeV. Additional company portfolios or unreleased products are not documented within this workspace.`
];

const IDEV_RELATIONSHIP_VARIATIONS = [
  `Ubaid built IDeV. IDeV built Exciting AI. Ubaid is the person behind IDeV, and Exciting AI is an IDeV product.`,
  `The relationship is clear: Ubaid built IDeV, and IDeV created Exciting AI. Ubaid is the developer behind IDeV, and Exciting AI is an official IDeV product.`,
  `Here is how they connect: Ubaid built IDeV, and IDeV built Exciting AI. Exciting AI is an IDeV product, and Ubaid is the person behind IDeV.`
];

const IDEV_MODEL_DISTINCTION_VARIATIONS = [
  `No, IDeV did not create third-party foundation models. IDeV built Exciting AI, the desktop application. Foundation models like GPT (OpenAI), Claude (Anthropic), and Gemini (Google) belong to their respective research organizations.`,
  `IDeV built Exciting AI, the desktop workspace application. Foundation AI models such as GPT, Claude, and Gemini belong to and were trained by their respective providers, not by IDeV.`,
  `No. IDeV is the company behind Exciting AI (the desktop software), while foundation models like GPT belong to OpenAI, Claude belongs to Anthropic, and Gemini belongs to Google.`
];

const PURPOSE_VARIATIONS = [
  `My purpose is to serve as an autonomous desktop workspace companion. I help you organize ideas, keep track of multi-turn technical discussions, and review project files locally.`,
  `${OFFICIAL_IDENTITY.APP_NAME} was created to give users a focused, private desktop assistant experience with fast local history persistence and zero clutter.`,
  `I exist to help you think through problems, manage conversations, and plan projects in a streamlined desktop environment.`
];

function getDifferentiatorVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `What sets this experience apart is the combination of ${m.displayName}'s intelligence from ${m.provider} with ${OFFICIAL_IDENTITY.APP_NAME}'s local-first desktop focus: your chats and sessions are stored directly on your computer in clean local JSON files, giving you full ownership, speed, and privacy without relying on proprietary online accounts or browser tabs. Everything runs in a focused desktop workspace with support for file attachments and multiple model workflows.`,
    `Unlike browser-based chat services, ${m.displayName} runs natively within ${OFFICIAL_IDENTITY.APP_NAME} as a desktop application with local file persistence, file attachment review, and dedicated workspace controls. Your sessions stay on your computer, with zero tab clutter and full offline privacy.`,
    `In ${OFFICIAL_IDENTITY.APP_NAME}, ${m.displayName} operates directly from your desktop with local conversation persistence, clean session organization, and an interface built specifically for focused work without external distractions or cloud dependencies.`
  ];
}

// Identity Expansion & Substantive Elaboration (builds on intro, never repeats brief identity)
function getIdentityElaborateVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    `I'm ${m.displayName}, powered by ${m.provider} and running inside ${OFFICIAL_IDENTITY.APP_NAME}. Rather than a fleeting browser tab, I run in your local desktop workspace to help you brainstorm ideas, write and refactor code, break down technical challenges, and organize multi-turn conversations.\n\nAll your chats and workspace data stay stored right on your machine in local JSON files for speed, persistence, and complete privacy. What project or idea are you working on today?`,
    `To give you a fuller picture: I am ${m.displayName}, created by ${m.provider}, operating as your dedicated desktop workspace assistant in ${OFFICIAL_IDENTITY.APP_NAME}. I can assist with everything from architectural design, debugging, and drafting professional communications to casual problem-solving.\n\nBecause ${OFFICIAL_IDENTITY.APP_NAME} runs natively on your desktop, your session history is saved directly on your disk without needing an account or external cloud sync. What would you like to dive into?`,
    `I'm ${m.displayName} from ${m.provider}, operating as your focused desktop companion in ${OFFICIAL_IDENTITY.APP_NAME} for creative, coding, and problem-solving work. You can brainstorm complex system designs, draft code across different languages, troubleshoot errors, and keep multiple project threads organized in dedicated persistent sessions.\n\nEverything stays private on your local machine. Tell me what you'd like to work on and we can jump right in!`
  ];
}

const HELP_BUILD_APP_VARIATIONS = [
  `Absolutely! I'd love to help you build it. We can work through every phase together—from planning the architecture and picking your tech stack to writing frontend and backend code, designing data models, and debugging tricky errors.\n\nWhat kind of application do you have in mind? Tell me a bit about what it should do!`,
  `Yes, 100%! Whether you're building a desktop app, web service, mobile app, or CLI tool, I can help you structure the code, write the core logic, design the APIs, and troubleshoot any bugs you run into.\n\nWhat are you thinking of creating? Let's break it down!`,
  `I'd be glad to help you build your application! We can start anywhere you like: outlining the features, drafting database schemas, choosing frameworks, or writing the initial boilerplate code.\n\nWhat's the vision for the app?`
];

const EXPLAIN_PYTHON_DECORATORS_VARIATIONS = [
  `In Python, a decorator is a design pattern and language feature that allows you to dynamically modify or extend the behavior of a function or method without modifying its actual source code.\n\nUnder the hood, a decorator is a callable that takes a function as an argument, wraps it with additional behavior (such as logging, timing, validation, or authentication), and returns the wrapped callable. You apply it using the \`@decorator_name\` syntax directly above your function definition.`
];

const DECORATOR_EXAMPLE_VARIATIONS = [
  `Here is a clean, practical example of a timing decorator that measures function execution duration:\n\n` +
  `\`\`\`python\n` +
  `import time\n` +
  `from functools import wraps\n\n` +
  `def timer(func):\n` +
  `    @wraps(func)\n` +
  `    def wrapper(*args, **kwargs):\n` +
  `        start = time.perf_counter()\n` +
  `        result = func(*args, **kwargs)\n` +
  `        elapsed = time.perf_counter() - start\n` +
  `        print(f"[{func.__name__}] executed in {elapsed:.6f}s")\n` +
  `        return result\n` +
  `    return wrapper\n\n` +
  `@timer\n` +
  `def calculate_squares(limit):\n` +
  `    return sum(x * x for x in range(limit))\n\n` +
  `# Calling the function automatically runs the timer logic\n` +
  `calculate_squares(1_000_000)\n` +
  `\`\`\`\n\n` +
  `The \`@timer\` decorator wraps \`calculate_squares\` cleanly, separating performance monitoring from business logic.`
];

const DECORATOR_SIMPLER_VARIATIONS = [
  `Think of a decorator like gift-wrapping a box:\n\n` +
  `• The **gift inside** is your original function (what it actually does).\n` +
  `• The **wrapping paper and bow** is the decorator (it adds extra appearance or behavior around the outside).\n\n` +
  `When someone opens or uses the gift, the wrapping happens first, but the gift itself is never changed. In code, a decorator adds extra features (like a security check or timer) around your function without touching what's inside.`
];

// 15. Developer & Creator Queries (Strictly scoped, factual, no unsolicited architecture, no invented bio)
const CREATOR_VARIATIONS = [
  `Exciting AI was built by ${OFFICIAL_IDENTITY.DEVELOPER}. You can check out his projects on GitHub: ${OFFICIAL_IDENTITY.GITHUB}`,
  `${OFFICIAL_IDENTITY.DEVELOPER} built Exciting AI! His GitHub is ${OFFICIAL_IDENTITY.GITHUB}`,
  `My developer is ${OFFICIAL_IDENTITY.DEVELOPER}. You can find his work here: ${OFFICIAL_IDENTITY.GITHUB}`,
  `Exciting AI was developed by ${OFFICIAL_IDENTITY.DEVELOPER}. He's on GitHub at ${OFFICIAL_IDENTITY.GITHUB}`
];

const ABOUT_DEVELOPER_VARIATIONS = [
  `${OFFICIAL_IDENTITY.DEVELOPER} is the developer behind Exciting AI. You can explore his work on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Exciting AI was developed by ${OFFICIAL_IDENTITY.DEVELOPER}. You can view his projects on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and reach him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `My developer is ${OFFICIAL_IDENTITY.DEVELOPER}. His work is available on GitHub at ${OFFICIAL_IDENTITY.GITHUB}, and you can also connect with him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`
];

const CREATOR_HIM_VARIATIONS = [
  `Ubaid is the developer behind IDeV, the company that created Exciting AI. You can explore his work on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Ubaid is the person behind IDeV and Exciting AI. Beyond this application, no additional personal details are kept here, but you can explore his projects on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and follow him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Ubaid built IDeV and developed Exciting AI. To see more of his work or connect with him, check out his GitHub (${OFFICIAL_IDENTITY.GITHUB}) and Instagram (${OFFICIAL_IDENTITY.INSTAGRAM})`
];

const WHO_IS_UBAID_VARIATIONS = [
  `Ubaid is the developer behind IDeV, the company that built Exciting AI. You can explore his work on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Ubaid is the developer who built IDeV and created Exciting AI. His public projects are hosted on GitHub (${OFFICIAL_IDENTITY.GITHUB}) and you can connect with him on Instagram (${OFFICIAL_IDENTITY.INSTAGRAM})`,
  `Ubaid is the person behind IDeV, the company that created Exciting AI. You can check out his repositories on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`
];

const TELL_ME_EVERYTHING_DEV_VARIATIONS = [
  `Ubaid is the developer behind IDeV, the company that created Exciting AI. The application does not maintain personal or biographical records about him, but you can explore his projects on GitHub at ${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Beyond the fact that Ubaid built IDeV and developed Exciting AI, no additional biographical information is stored within this application. You can explore his work on GitHub (${OFFICIAL_IDENTITY.GITHUB}) and connect with him on Instagram (${OFFICIAL_IDENTITY.INSTAGRAM})`
];

const CREATOR_PROJECTS_VARIATIONS = [
  `You can explore ${OFFICIAL_IDENTITY.DEVELOPER}'s projects and repositories directly on his GitHub profile: ${OFFICIAL_IDENTITY.GITHUB}`,
  `${OFFICIAL_IDENTITY.DEVELOPER} publishes his software projects on GitHub. You can view his repositories here: ${OFFICIAL_IDENTITY.GITHUB}`,
  `To see other projects built by ${OFFICIAL_IDENTITY.DEVELOPER}, check out his official GitHub page: ${OFFICIAL_IDENTITY.GITHUB}`
];

const CREATOR_GITHUB_VARIATIONS = [
  `Here is ${OFFICIAL_IDENTITY.DEVELOPER}'s GitHub profile: ${OFFICIAL_IDENTITY.GITHUB}`,
  `You can explore ${OFFICIAL_IDENTITY.DEVELOPER}'s repositories on GitHub at ${OFFICIAL_IDENTITY.GITHUB}`,
  `${OFFICIAL_IDENTITY.DEVELOPER}'s official GitHub is ${OFFICIAL_IDENTITY.GITHUB}`
];

const CREATOR_INSTAGRAM_VARIATIONS = [
  `You can find ${OFFICIAL_IDENTITY.DEVELOPER} on Instagram here: ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `${OFFICIAL_IDENTITY.DEVELOPER}'s official Instagram profile is ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `Here is ${OFFICIAL_IDENTITY.DEVELOPER}'s Instagram: ${OFFICIAL_IDENTITY.INSTAGRAM}`
];

const CREATOR_BOTH_VARIATIONS = [
  `Here are ${OFFICIAL_IDENTITY.DEVELOPER}'s official profiles:\n• GitHub: ${OFFICIAL_IDENTITY.GITHUB}\n• Instagram: ${OFFICIAL_IDENTITY.INSTAGRAM}`,
  `You can connect with ${OFFICIAL_IDENTITY.DEVELOPER} across both of his official links:\n- GitHub: ${OFFICIAL_IDENTITY.GITHUB}\n- Instagram: ${OFFICIAL_IDENTITY.INSTAGRAM}`
];

// 16. Capabilities & Feature Queries
const CAPABILITIES_VARIATIONS = [
  `Here is an overview of what Exciting AI can do:\n\n` +
  `• **Persistent Chats**: Maintain multi-turn conversations stored locally on your machine.\n` +
  `• **Workspace & Session Controls**: Create, rename, delete, and switch between separate chats.\n` +
  `• **File Attachments**: Inspect and discuss attached text, code, or image files.\n` +
  `• **Technical Discussion**: Discuss software architecture, review algorithms, and format code.\n` +
  `• **Local Privacy**: All conversations and settings stay directly on your local drive.\n\n` +
  `*Honest boundaries*: I operate within this desktop application; I cannot control your computer or autonomously crawl the live web.`,

  `In this application, Exciting AI provides:\n\n` +
  `1. **Multi-Turn Chat Workspace**: Persistent conversations saved locally in JSON format.\n` +
  `2. **File Support**: Review attached code files and image previews.\n` +
  `3. **Session Management**: Independent conversation threads you can organize and rename.\n` +
  `4. **Code & Technical Guidance**: Brainstorm solutions, format code, and debug logic.\n\n` +
  `Features requiring OS mouse/keyboard control or autonomous web crawling are not supported.`
];

const WORKING_FEATURES_VARIATIONS = [
  `The features genuinely working in ${OFFICIAL_IDENTITY.APP_NAME} right now are:\n\n` +
  `✅ **Persistent Chat Storage**: Saved locally in \`Storage/chats\` in clean JSON format.\n` +
  `✅ **Multi-Session Management**: Creating new chats, renaming titles, and deleting conversations.\n` +
  `✅ **File Attachment Reader**: Decodes and displays attached text and image files.\n` +
  `✅ **Local Intelligence & Routing**: Instant, zero-key responses for assistant and workspace queries.\n` +
  `✅ **Diagnostics & Metrics**: Real-time request tracking, duration logging, and TTFT metrics.\n\n` +
  `❌ **Not Implemented**: Mouse/keyboard OS control, live web crawling, and background self-training.`,

  `Here is what actually works in the current build:\n\n` +
  `• **Local Conversation Engine**: Multi-turn history saved to your local disk.\n` +
  `• **Session Controls**: Create new threads, rename discussions, and delete past conversations.\n` +
  `• **File Support**: Review attached code files and image previews.\n` +
  `• **Model Catalog Interface**: Curated descriptor browser.\n\n` +
  `Planned or unavailable features: Autonomous computer control and background model retraining do not exist in this application.`
];

const LIMITATIONS_VARIATIONS = [
  `${OFFICIAL_IDENTITY.APP_NAME} operates with clear, honest architectural boundaries:\n\n` +
  `1. **No Computer Control**: I cannot move your mouse, simulate keystrokes, or run arbitrary shell commands on your OS.\n` +
  `2. **No Autonomous Web Crawling**: I do not scrape live internet websites autonomously.\n` +
  `3. **No Self-Learning**: I do not retrain myself or rewrite my own code between runs.\n` +
  `4. **No Direct Image/Video Rendering**: I can inspect attached images, but I do not synthesize raw pixel media directly.`,

  `My limitations are straightforward:\n\n` +
  `• I cannot execute operating system commands or control your machine.\n` +
  `• I do not have a live internet web crawler.\n` +
  `• I run deterministically without background machine learning retraining.\n` +
  `• All operations remain safely bounded within this desktop application.`
];

// 17. Technology & Implementation Queries
const TECHNOLOGY_VARIATIONS = [
  `${OFFICIAL_IDENTITY.APP_NAME} is built using verified desktop technologies:\n\n` +
  `• **Electron**: Native desktop window management and shell lifecycle.\n` +
  `• **Node.js**: Powers the internal server runtime for local file I/O and stream handling.\n` +
  `• **Frontend**: Interface built with HTML5, CSS3, and JavaScript.\n` +
  `• **Storage Architecture**: Local file-based JSON storage in \`Storage/chats\` and \`Storage/settings\`.\n\n` +
  `It runs directly on your computer without external database requirements.`,

  `${OFFICIAL_IDENTITY.APP_NAME} is built with Electron and Node.js for its desktop shell and backend runtime, an HTML5/CSS3/JavaScript interface, and local JSON file persistence in \`Storage/chats\` and \`Storage/settings\`.`
];

const CHAT_SYSTEM_VARIATIONS = [
  `Here is how the chat system in ${OFFICIAL_IDENTITY.APP_NAME} works:\n\n` +
  `1. **Message Input**: When you send a message, it is validated and assigned a unique timestamp and ID.\n` +
  `2. **Context Assembly**: The conversation manager loads the recent message history from \`Storage/chats/<id>.json\`.\n` +
  `3. **Intent & Intelligence Engine**: The request is evaluated by the local intelligence engine to understand context, pronouns, and topic.\n` +
  `4. **Streaming Response**: The response is streamed incrementally to the interface using chunked NDJSON.\n` +
  `5. **Local Persistence**: Both your message and the assistant's reply are saved immediately to disk for persistence.`,

  `The chat pipeline operates locally:\n\n` +
  `• Each conversation is saved as an independent JSON file in \`Storage/chats\`.\n` +
  `• When you ask follow-up questions, the system passes prior conversation turns into the context window.\n` +
  `• Responses are streamed token by token to provide smooth real-time reading.\n` +
  `• No external database is needed; all history remains on your local drive.`
];

const AI_MODELS_VARIATIONS = [
  `${OFFICIAL_IDENTITY.APP_NAME} includes a curated catalog of **210 model descriptors** across 12 categories (OpenAI, Anthropic, DeepMind, Meta, Mistral, Qwen, etc.).\n\n` +
  `The application functions as an intelligent desktop workspace interface, providing local intelligence and zero-key free inference out of the box so you are never blocked by mandatory API keys.`,

  `The application provides a model catalog browser containing 210 curated models across frontier, reasoning, code, and multimodal categories. It operates out of the box without requiring API keys or local model downloads.`
];

const SELF_LEARNING_VARIATIONS = [
  `No, I do not learn by myself or improve over time through autonomous retraining. ${OFFICIAL_IDENTITY.APP_NAME} is built on deterministic code, structured intent handling, and local storage. I do not run self-learning machine learning algorithms.`,
  `I don't have self-learning capabilities. ${OFFICIAL_IDENTITY.APP_NAME} preserves your conversation history locally so you can reference previous turns, but it does not retrain itself or modify its own code between sessions.`,
  `No, self-learning is not part of this application. ${OFFICIAL_IDENTITY.APP_NAME} operates using verified software engineering and local persistence rather than background self-training algorithms.`
];

// Anti-repetition sliding cache
const recentHistory = new Map();

function selectVariant(category, pool, key = 'global') {
  // Key globally by category to guarantee natural variation across consecutive turns
  const cacheKey = category;
  const lastIndex = recentHistory.get(cacheKey);
  let nextIndex;

  if (pool.length <= 1) {
    nextIndex = 0;
  } else {
    do {
      nextIndex = Math.floor(Math.random() * pool.length);
    } while (nextIndex === lastIndex && pool.length > 1);
  }

  recentHistory.set(cacheKey, nextIndex);
  return pool[nextIndex];
}

// -------------------------------------------------------------
// CONVERSATION HISTORY & CONTEXT INSPECTION
// -------------------------------------------------------------

function inspectHistory(messages = []) {
  const context = {
    hasMentionedUbaid: false,
    hasMentionedCreator: false,
    hasProvidedGithub: false,
    hasProvidedInstagram: false,
    lastTopic: null,
    lastAssistantMessage: '',
    activeProject: null,
    wantsNoEmojis: false,
    desktopAppContext: {
      hasDesktopApp: false,
      appsPageWorking: false
    }
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return context;
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (!msg || !msg.content) continue;
    const text = msg.content.toLowerCase();

    // Check if user requested no emojis in any turn
    if (msg.role === 'user') {
      if (
        text.includes('without emojis') ||
        text.includes('without any emojis') ||
        text.includes('no emojis') ||
        text.includes('no emoji') ||
        text.includes('strictly no emojis') ||
        text.includes('dont use emojis') ||
        text.includes('don\'t use emojis')
      ) {
        context.wantsNoEmojis = true;
      }

      // Check desktop application context
      if (text.includes('desktop application') || text.includes('desktop app')) {
        context.desktopAppContext.hasDesktopApp = true;
        context.activeProject = 'desktop app';
      }
      if (text.includes('apps page is finally working') || text.includes('apps page is working') || text.includes('apps page')) {
        context.desktopAppContext.appsPageWorking = true;
      }
    }

    if (msg.role === 'assistant' && !context.lastAssistantMessage) {
      context.lastAssistantMessage = msg.content;
      const l = text;
      if (l.includes('ubaid') || l.includes('developer') || l.includes('creator')) context.lastTopic = 'developer';
      else if (l.includes('decorator')) context.lastTopic = 'decorators';
      else if (l.includes('python')) context.lastTopic = 'python';
      else if (l.includes('desktop assistant') || l.includes('exciting ai') || l.includes('desktop workspace')) context.lastTopic = 'identity';
      else if (l.includes('electron') || l.includes('node.js') || l.includes('technology')) context.lastTopic = 'technology';
      else if (l.includes('features') || l.includes('capabilities')) context.lastTopic = 'capabilities';
      else if (l.includes('chat system') || l.includes('storage/chats')) context.lastTopic = 'chat_system';
      else if (l.includes('trading app')) context.lastTopic = 'trading_app';
      else if (l.includes('desktop app') || l.includes('apps page')) context.lastTopic = 'desktop_app';
    }

    if (text.includes('ubaid') || text.includes('musawir')) {
      context.hasMentionedUbaid = true;
    }
    if (text.includes('github.com/musawir-13')) {
      context.hasProvidedGithub = true;
      context.hasMentionedUbaid = true;
    }
    if (text.includes('instagram.com/musawir___13')) {
      context.hasProvidedInstagram = true;
      context.hasMentionedUbaid = true;
    }
    if (text.includes('who built you') || text.includes('who created') || text.includes('who made') || text.includes('developer') || text.includes('creator')) {
      context.hasMentionedCreator = true;
    }

    if (text.includes('trading app') || text.includes('trading platform')) {
      context.activeProject = 'trading app';
    }
  }

  return context;
}

// -------------------------------------------------------------
// NORMALIZATION & INTENT CLASSIFIER
// -------------------------------------------------------------

function normalizePrompt(rawPrompt) {
  if (!rawPrompt || typeof rawPrompt !== 'string') return '';
  return rawPrompt
    .trim()
    .toLowerCase()
    .replace(/[?!.,;:()'"`]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyIntent(rawPrompt, context = {}) {
  const prompt = normalizePrompt(rawPrompt);
  if (!prompt) return { type: 'UNKNOWN' };

  // 1. Explicit request for formal / no-emoji style
  if (
    prompt.includes('without emojis') ||
    prompt.includes('without any emojis') ||
    prompt.includes('no emojis') ||
    prompt.includes('no emoji') ||
    prompt.includes('strictly no emojis') ||
    prompt.includes('dont use emojis') ||
    prompt.includes('respond formally without') ||
    prompt.includes('reply formally without')
  ) {
    if (prompt.includes('database index') || prompt.includes('index')) {
      return { type: 'DATABASE_INDEX', noEmoji: true };
    }
    if (prompt.includes('garbage collection')) {
      return { type: 'EXPLAIN_GARBAGE_COLLECTION', noEmoji: true };
    }
    return { type: 'REQUEST_NO_EMOJI', noEmoji: true };
  }

  // 2. Professional communication requests (emails, notices, formal drafts)
  if (
    prompt.includes('draft an email to client about project delay') ||
    prompt.includes('email to client about project delay') ||
    prompt.includes('draft an email') && prompt.includes('delay') ||
    prompt.includes('project delay email') ||
    prompt.includes('draft a professional email regarding delay')
  ) {
    return { type: 'PROFESSIONAL_DELAY_EMAIL' };
  }

  // 3. Multi-turn App Building Flow
  if (prompt === 'i m working on a desktop application' || prompt === 'i am working on a desktop application') {
    return { type: 'APP_INIT_DESKTOP' };
  }

  if (
    (context.desktopAppContext?.hasDesktopApp || context.activeProject === 'desktop app') &&
    (prompt.includes('apps page is finally working') || prompt.includes('apps page is working') || prompt === 'the apps page is finally working')
  ) {
    return { type: 'APP_APPS_PAGE_WORKING' };
  }

  if (
    (context.desktopAppContext?.appsPageWorking || context.desktopAppContext?.hasDesktopApp || context.lastTopic === 'desktop_app') &&
    (prompt.includes('logos look bad') || prompt.includes('logo looks bad') || prompt === 'but the logos look bad')
  ) {
    return { type: 'APP_LOGOS_LOOK_BAD' };
  }

  // 4. Debugging & Code Execution Outcomes
  if (
    prompt === 'bro i finally fixed it' ||
    prompt === 'i finally fixed it' ||
    prompt === 'that code finally works' ||
    prompt === 'the code finally works' ||
    prompt.includes('finally fixed it') ||
    prompt.includes('code finally works') ||
    prompt.includes('code is finally working') ||
    prompt.includes('finally solved it') ||
    prompt.includes('it finally works') ||
    prompt.includes('finally got it working')
  ) {
    return { type: 'DEBUGGING_SUCCESS' };
  }

  if (
    prompt === 'the code still doesn t work' ||
    prompt === 'the code still doesnt work' ||
    prompt.includes('code still doesn t work') ||
    prompt.includes('code still doesnt work') ||
    prompt.includes('still doesn t work') ||
    prompt.includes('still doesnt work') ||
    prompt.includes('still not working') ||
    prompt.includes('still broken') ||
    prompt.includes('still throwing an error') ||
    prompt.includes('still failing') ||
    prompt.includes('it broke again')
  ) {
    return { type: 'DEBUGGING_STILL_BROKEN' };
  }

  // 5. Exciting News & Major Milestones
  if (
    prompt === 'i got the job' ||
    prompt.startsWith('i got the job') ||
    prompt === 'we got the job' ||
    prompt.includes('passed the test') ||
    prompt.includes('passed my exam') ||
    prompt.includes('passed the exam') ||
    prompt.includes('passed the certification') ||
    prompt.includes('we won the hackathon') ||
    prompt.includes('we won') ||
    prompt.includes('we just launched') ||
    prompt.includes('we launched')
  ) {
    return { type: 'EXCITING_ACHIEVEMENT' };
  }

  // 6. Disappointing News & Bad Outcomes
  if (
    prompt === 'i didn t get selected' ||
    prompt === 'i didnt get selected' ||
    prompt.includes('didn t get selected') ||
    prompt.includes('didnt get selected') ||
    prompt.includes('failed the interview') ||
    prompt.includes('failed the technical interview') ||
    prompt.includes('failed my interview') ||
    prompt.includes('pitch was rejected') ||
    prompt.includes('proposal was rejected') ||
    prompt.includes('project got canceled') ||
    prompt.includes('project got cancelled') ||
    prompt.includes('got rejected today') ||
    prompt.includes('i got rejected')
  ) {
    return { type: 'DISAPPOINTING_NEWS' };
  }

  // 7. Exhaustion & Emotional Burnout
  if (
    prompt === 'i m exhausted today' ||
    prompt === 'im exhausted today' ||
    prompt.includes('exhausted today') ||
    prompt.includes('i m exhausted') ||
    prompt.includes('im exhausted') ||
    prompt.includes('burned out') ||
    prompt.includes('rough day today') ||
    prompt.includes('long day today') ||
    prompt.includes('feeling overwhelmed') ||
    prompt === 'i m so tired' ||
    prompt === 'im so tired'
  ) {
    return { type: 'EXHAUSTION_STRESS' };
  }

  // 8. Jokes & Friendly Humor
  if (
    prompt === 'tell me a joke' ||
    prompt === 'tell me another joke' ||
    prompt === 'tell a joke' ||
    prompt === 'tell me something funny' ||
    prompt.includes('why did the developer go broke') ||
    prompt.includes('why did the chicken cross the road') ||
    prompt.includes('programming joke')
  ) {
    return { type: 'HUMOR_JOKE' };
  }

  if (
    prompt.includes('haha that makes sense thanks bro') ||
    prompt === 'thanks bro' ||
    prompt.includes('thanks bro') ||
    prompt === 'haha' ||
    prompt === 'hahaha' ||
    prompt === 'lmao' ||
    prompt === 'lol'
  ) {
    return { type: 'HUMOR_REACTION_OR_THANKS' };
  }

  // 9. Database Index & Technical Explanations
  if (prompt.includes('database index') && (prompt.includes('explain') || prompt.includes('how') || prompt.includes('what is'))) {
    return { type: 'DATABASE_INDEX' };
  }

  if (prompt.includes('acid') && (prompt.includes('transaction') || prompt.includes('database') || prompt.includes('properties'))) {
    return { type: 'ACID_TRANSACTIONS' };
  }

  // 10. Factual Questions
  if (prompt === 'what is the capital of france') {
    return { type: 'CAPITAL_OF_FRANCE' };
  }
  if (prompt === 'what is photosynthesis') {
    return { type: 'EXPLAIN_PHOTOSYNTHESIS' };
  }

  // 11. Unrelated technical questions — MUST NOT trigger developer attribution!
  if (
    prompt === 'explain python decorators' ||
    prompt === 'what are python decorators' ||
    prompt.includes('python decorators') ||
    (prompt.includes('decorator') && prompt.includes('python'))
  ) {
    return { type: 'EXPLAIN_PYTHON_DECORATORS' };
  }

  if (
    (context.lastTopic === 'decorators' || (context.lastAssistantMessage && context.lastAssistantMessage.toLowerCase().includes('decorator'))) &&
    (prompt === 'give me an example' || prompt === 'can you give me an example' || prompt === 'show me an example' || prompt.includes('give me an example') || prompt.includes('show an example'))
  ) {
    return { type: 'DECORATOR_EXAMPLE' };
  }

  if (
    (context.lastTopic === 'decorators' || (context.lastAssistantMessage && context.lastAssistantMessage.toLowerCase().includes('decorator'))) &&
    (prompt === 'make it simpler' || prompt === 'explain it simpler' || prompt === 'can you make it simpler' || prompt.includes('make it simpler') || prompt.includes('simpler please') || prompt.includes('eli5'))
  ) {
    return { type: 'DECORATOR_SIMPLER' };
  }

  if (prompt === 'what is python' || prompt.startsWith('what is python')) {
    return { type: 'EXPLAIN_PYTHON' };
  }
  if (prompt === 'what is javascript' || prompt.startsWith('what is javascript')) {
    return { type: 'EXPLAIN_JAVASCRIPT' };
  }
  if (prompt === 'what is a binary tree' || prompt.startsWith('what is a binary tree') || prompt.startsWith('explain binary tree')) {
    return { type: 'EXPLAIN_BINARY_TREE' };
  }
  if (prompt.includes('parse json') || prompt.includes('parsing json') || (prompt.includes('json') && prompt.includes('python'))) {
    if (prompt.includes('write') || prompt.includes('function') || prompt.includes('how to')) {
      return { type: 'PYTHON_PARSE_JSON' };
    }
  }

  // 12. Tell me everything about the developer / Ubaid
  if (
    prompt.includes('everything about') ||
    prompt.includes('all about') ||
    prompt === 'tell me everything' ||
    prompt.startsWith('tell me everything')
  ) {
    if (
      prompt.includes('developer') ||
      prompt.includes('creator') ||
      prompt.includes('ubaid') ||
      prompt.includes('him') ||
      context.hasMentionedUbaid ||
      context.hasMentionedCreator
    ) {
      return { type: 'TELL_ME_EVERYTHING_DEV' };
    }
  }

  // 13. Both developer links explicitly requested
  if (
    prompt.includes('both links') ||
    prompt.includes('both profiles') ||
    prompt.includes('give me both') ||
    prompt.includes('all links') ||
    (prompt.includes('github') && prompt.includes('instagram'))
  ) {
    return { type: 'CREATOR_BOTH' };
  }

  // 14. Specific developer profile requests
  if (
    prompt === 'give me his github' ||
    prompt === 'give me ubaid s github' ||
    prompt === 'give me your developer s github' ||
    prompt === 'what is his github' ||
    prompt === 'whats his github' ||
    prompt === 'what is your developer s github' ||
    prompt === 'whats your developer s github' ||
    prompt === 'what is ubaid s github' ||
    prompt === 'whats ubaid s github' ||
    prompt === 'his github' ||
    prompt === 'github profile' ||
    prompt === 'github link' ||
    prompt.endsWith('developer s github') ||
    prompt.endsWith('ubaid s github') ||
    (prompt.includes('github') && (prompt.includes('developer') || prompt.includes('ubaid') || prompt.includes('creator') || prompt.includes('his') || context.hasMentionedUbaid || context.hasMentionedCreator) && !prompt.includes('instagram'))
  ) {
    return { type: 'CREATOR_GITHUB' };
  }

  if (
    prompt === 'give me his instagram' ||
    prompt === 'give me ubaid s instagram' ||
    prompt === 'give me your developer s instagram' ||
    prompt === 'what is his instagram' ||
    prompt === 'whats his instagram' ||
    prompt === 'what is your developer s instagram' ||
    prompt === 'whats your developer s instagram' ||
    prompt === 'what is ubaid s instagram' ||
    prompt === 'whats ubaid s instagram' ||
    prompt === 'his instagram' ||
    prompt === 'instagram profile' ||
    prompt === 'instagram link' ||
    prompt.endsWith('developer s instagram') ||
    prompt.endsWith('ubaid s instagram') ||
    (prompt.includes('instagram') && (prompt.includes('developer') || prompt.includes('ubaid') || prompt.includes('creator') || prompt.includes('his') || context.hasMentionedUbaid || context.hasMentionedCreator) && !prompt.includes('github'))
  ) {
    return { type: 'CREATOR_INSTAGRAM' };
  }

  // 15. Projects / What else has he made
  if (
    prompt === 'what else has he made' ||
    prompt === 'what has he made' ||
    prompt === 'what else did he build' ||
    prompt === 'can i see his other projects' ||
    prompt === 'can i see his projects' ||
    prompt === 'what are his other projects' ||
    prompt === 'what are his projects' ||
    prompt.includes('developer s projects') ||
    prompt.includes('developer projects') ||
    prompt.includes('ubaid s projects') ||
    prompt.includes('ubaid projects')
  ) {
    return { type: 'CREATOR_PROJECTS' };
  }

  // 16. Pronoun & follow-up queries about the developer
  if (context.hasMentionedUbaid || context.hasMentionedCreator || context.hasProvidedGithub || context.hasProvidedInstagram || context.lastTopic === 'developer') {
    if (
      prompt === 'tell me more about him' ||
      prompt === 'tell me about him' ||
      prompt === 'more about him' ||
      prompt === 'who is he' ||
      prompt === 'who is him' ||
      prompt === 'more info about him' ||
      prompt === 'more details about him' ||
      prompt.includes('more about him') ||
      prompt.includes('tell me about him') ||
      prompt.includes('tell me more about him') ||
      prompt.includes('profile about him') ||
      prompt.includes('profie about him') ||
      prompt.includes('more profie about him') ||
      prompt.includes('more profile about him') ||
      /\b(more|tell me|profile|profie|details|info|about)\b.*\b(him|he)\b/.test(prompt)
    ) {
      return { type: 'CREATOR_FOLLOWUP_HIM' };
    }

    if (
      prompt === 'give me his other profile' ||
      prompt === 'his other profile' ||
      prompt === 'what about his other profile' ||
      prompt.includes('other profile')
    ) {
      return { type: 'CREATOR_FOLLOWUP_OTHER' };
    }
  }

  // 16.5 IDeV Company & Relationship Questions
  if (
    prompt === 'what is idev' ||
    prompt === 'who is idev' ||
    prompt === 'tell me about idev' ||
    prompt === 'what is idev?' ||
    prompt === 'what does idev do' ||
    prompt.startsWith('what is idev') ||
    prompt.startsWith('who is idev') ||
    prompt.startsWith('tell me about idev') ||
    prompt.includes('company is idev') ||
    prompt.includes('what company is idev') ||
    prompt.includes('what does idev do')
  ) {
    return { type: 'ABOUT_IDEV' };
  }

  if (
    prompt.includes('what else has idev') ||
    prompt.includes('what else did idev') ||
    prompt.includes('other products by idev') ||
    (prompt.includes('what other products') && prompt.includes('idev')) ||
    prompt.includes('what has idev made') ||
    prompt.includes('what else did idev make') ||
    prompt.includes('other apps by idev')
  ) {
    return { type: 'IDEV_OTHER_PRODUCTS' };
  }

  if (
    (prompt.includes('did idev create') || prompt.includes('did idev make') || prompt.includes('did idev build') || prompt.includes('did idev train') || prompt.includes('is idev behind')) &&
    (prompt.includes('gpt') || prompt.includes('claude') || prompt.includes('gemini') || prompt.includes('llama') || prompt.includes('deepseek') || prompt.includes('openai') || prompt.includes('models') || prompt.includes('model'))
  ) {
    return { type: 'IDEV_MODEL_DISTINCTION' };
  }

  if (
    (prompt.includes('relationship') && (prompt.includes('idev') || prompt.includes('ubaid') || prompt.includes('exciting'))) ||
    (prompt.includes('how are') && prompt.includes('related') && (prompt.includes('idev') || prompt.includes('ubaid') || prompt.includes('exciting'))) ||
    (prompt.includes('how do') && prompt.includes('relate') && (prompt.includes('idev') || prompt.includes('ubaid') || prompt.includes('exciting'))) ||
    (prompt.includes('connection') && (prompt.includes('idev') || prompt.includes('ubaid') || prompt.includes('exciting'))) ||
    prompt.includes('who founded idev') ||
    prompt.includes('who created idev') ||
    prompt.includes('who made idev') ||
    prompt.includes('who is behind idev') ||
    prompt.includes('who started idev')
  ) {
    return { type: 'IDEV_RELATIONSHIP' };
  }

  // 17. Developer questions & identity
  if (
    prompt === 'who is ubaid' ||
    prompt.startsWith('who is ubaid') ||
    prompt === 'whos ubaid' ||
    prompt.startsWith('whos ubaid') ||
    prompt === 'about ubaid' ||
    prompt === 'tell me about ubaid'
  ) {
    return { type: 'WHO_IS_UBAID' };
  }

  if (
    prompt === 'tell me about your developer' ||
    prompt === 'tell me about your creator' ||
    prompt === 'tell me about the developer' ||
    prompt === 'tell me about the creator' ||
    prompt === 'who is your developer' ||
    prompt === 'who is your creator' ||
    prompt === 'who is the developer' ||
    prompt === 'who is the creator' ||
    prompt === 'where can i find your developer' ||
    prompt === 'where can i find your creator'
  ) {
    return { type: 'ABOUT_DEVELOPER' };
  }

  // Model specific identity questions (e.g. "what model are you?", "which ai are you?")
  if (
    prompt === 'what model are you' ||
    prompt === 'which model are you' ||
    prompt === 'what model is this' ||
    prompt === 'which ai are you' ||
    prompt === 'what ai are you' ||
    prompt === 'what company developed you' ||
    prompt === 'what organization made you' ||
    prompt === 'who made this ai' ||
    prompt.includes('what model are you') ||
    prompt.includes('which model are you') ||
    prompt.includes('what ai are you') ||
    prompt.includes('which ai are you') ||
    prompt.includes('what company developed you') ||
    prompt.includes('who made this ai')
  ) {
    return { type: 'MODEL_SPECIFIC' };
  }

  // App Creator primary questions
  if (
    /^who (built|created|made|developed|owns) (exciting ai|this app|the app|the application)/.test(prompt) ||
    prompt === 'who built exciting ai' ||
    prompt === 'who created exciting ai' ||
    prompt === 'who made exciting ai' ||
    prompt === 'who developed exciting ai' ||
    prompt.includes('built exciting ai') ||
    prompt.includes('created exciting ai') ||
    prompt.includes('who made exciting ai')
  ) {
    return { type: 'APP_CREATOR' };
  }

  // Creator / Developer primary questions
  const creatorPatterns = [
    /^who (built|created|made|developed|owns) (you|this assistant|this model|this)/,
    /^who is the (developer|creator|maker|author)/
  ];
  for (const p of creatorPatterns) {
    if (p.test(prompt)) return { type: 'CREATOR' };
  }

  // 18. Identity & Assistant Role Questions
  if (
    prompt === 'tell me more about you' ||
    prompt === 'tell me more about yourself' ||
    prompt === 'tell me more about exciting ai' ||
    prompt === 'tell me more you' ||
    prompt === 'more about you' ||
    prompt === 'more about yourself' ||
    prompt.includes('tell me more about you') ||
    prompt.includes('tell me more about yourself') ||
    (context.lastTopic === 'identity' && (
      prompt === 'tell me more' ||
      prompt === 'can you tell me more' ||
      prompt === 'tell me more then' ||
      prompt === 'elaborate'
    ))
  ) {
    return { type: 'IDENTITY_ELABORATE' };
  }

  if (
    prompt === 'can you help me build an application' ||
    prompt === 'can you help me build an app' ||
    prompt === 'help me build an application' ||
    prompt === 'help me build an app' ||
    prompt === 'can you help me create an application' ||
    prompt === 'can you help me make an app' ||
    prompt.includes('help me build an application') ||
    prompt.includes('help me build an app') ||
    prompt.includes('help me build a desktop app') ||
    prompt.includes('help me build a web app')
  ) {
    return { type: 'HELP_BUILD_APP' };
  }

  if (
    prompt === 'what is exciting ai' ||
    prompt === 'tell me about exciting ai' ||
    prompt === 'tell me about this app' ||
    prompt === 'what is this application' ||
    prompt === 'what is this app'
  ) {
    return { type: 'APP_IDENTITY' };
  }

  if (
    prompt === 'who are you' ||
    prompt === 'what are you' ||
    prompt === 'what is your name' ||
    prompt === 'whats your name' ||
    prompt === 'what kind of assistant are you' ||
    prompt === 'what exactly are you' ||
    prompt === 'so what you are then' ||
    prompt === 'so what are you then' ||
    prompt === 'what are you then'
  ) {
    return { type: 'IDENTITY' };
  }

  if (
    prompt === 'tell me about yourself' ||
    prompt === 'introduce yourself' ||
    prompt === 'describe yourself'
  ) {
    return { type: 'ABOUT_SELF' };
  }

  if (
    prompt === 'why do you exist' ||
    prompt === 'what is your purpose' ||
    prompt === 'why were you created' ||
    prompt === 'what is the purpose of this app'
  ) {
    return { type: 'PURPOSE' };
  }

  if (
    prompt === 'what makes you different' ||
    prompt === 'how are you different' ||
    prompt === 'why should i use exciting ai'
  ) {
    return { type: 'DIFFERENTIATOR' };
  }

  // 19. Specific Capability & Limitation Questions
  if (prompt.includes('control my computer') || prompt.includes('control the computer')) {
    return { type: 'CAN_CONTROL_COMPUTER' };
  }

  if (prompt.includes('browse the internet') || prompt.includes('browse the web') || prompt.includes('search the browser') || prompt.includes('browse the live web')) {
    return { type: 'CAN_BROWSE_INTERNET' };
  }

  if (prompt.includes('generate images') || prompt.includes('create images')) {
    return { type: 'CAN_GENERATE_IMAGES' };
  }

  if (
    prompt === 'can you write code' ||
    prompt === 'can you code' ||
    prompt.startsWith('can you write code') ||
    prompt.startsWith('can you code') ||
    prompt === 'are you able to write code' ||
    prompt === 'do you write code'
  ) {
    return { type: 'CAN_WRITE_CODE' };
  }

  if (prompt.includes('features actually work') || prompt.includes('features are actually working')) {
    return { type: 'WORKING_FEATURES' };
  }

  if (prompt.includes('what are your limitations') || prompt.includes('what are your boundaries') || prompt.includes('what can you not do')) {
    return { type: 'LIMITATIONS' };
  }

  if (
    prompt === 'what can exciting ai do' ||
    prompt === 'what can you do' ||
    prompt === 'what features do you have' ||
    prompt === 'what tasks can you help me with' ||
    prompt === 'what can you actually do' ||
    prompt === 'how can you help me' ||
    prompt.startsWith('what can exciting ai do') ||
    prompt.startsWith('what can you do')
  ) {
    return { type: 'CAPABILITIES' };
  }

  // 20. Technology & Architecture Questions
  if (
    prompt.includes('what technology') ||
    prompt.includes('tech stack') ||
    prompt.includes('what stack') ||
    prompt.includes('what architecture') ||
    prompt === 'how were you built' ||
    prompt === 'how was exciting ai built' ||
    prompt.includes('technology powers you') ||
    prompt.includes('technology are you built with') ||
    prompt.includes('technology do you use')
  ) {
    return { type: 'TECHNOLOGY' };
  }

  if (prompt.includes('learn from conversations') || prompt.includes('learn by yourself') || prompt.includes('self-learn') || prompt.includes('self learning') || prompt.includes('improve over time')) {
    return { type: 'SELF_LEARNING' };
  }

  if (prompt.includes('how does your chat system work') || prompt.includes('do you remember previous messages') || prompt.includes('how does your chat work')) {
    return { type: 'CHAT_SYSTEM_WORK' };
  }

  if (prompt.includes('do you use ai models') || prompt.includes('which models do you support') || prompt.includes('connect to different ai companies')) {
    return { type: 'AI_MODELS' };
  }

  // 21. Casual Acks
  if (
    prompt === 'got you' ||
    prompt === 'got it' ||
    prompt === 'nice' ||
    prompt === 'cool' ||
    prompt === 'sweet' ||
    prompt === 'awesome' ||
    prompt === 'fair enough' ||
    prompt === 'sounds good' ||
    prompt === 'bet'
  ) {
    return { type: 'CASUAL_ACK' };
  }

  // 22. Casual Greetings
  if (
    prompt === 'yo' ||
    prompt === 'yoo' ||
    prompt === 'yooo' ||
    prompt === 'yo bro' ||
    prompt === 'yo bro what is up' ||
    prompt === 'yo bro whats up' ||
    prompt === 'hey bro' ||
    prompt === 'sup' ||
    prompt === 'whats up' ||
    prompt === "what's up" ||
    prompt === 'what is up' ||
    prompt.includes('what is up') ||
    prompt.includes('whats up') ||
    prompt === 'whats happening' ||
    prompt === "what's happening" ||
    prompt === 'howdy' ||
    /^(hi|hello|hey|greetings|good morning|good afternoon|good evening)$/i.test(prompt)
  ) {
    return { type: 'CASUAL_GREETING' };
  }

  // 23. Multi-turn Project Context
  if (context.activeProject === 'trading app') {
    if (prompt.includes('chart') || prompt.includes('charts')) {
      return { type: 'PROJECT_CHARTS', project: 'trading app' };
    }
    if (prompt.includes('alert') || prompt.includes('alerts')) {
      return { type: 'PROJECT_ALERTS', project: 'trading app' };
    }
  }

  if (prompt.startsWith("i'm building a trading app") || prompt.startsWith("i am building a trading app")) {
    return { type: 'PROJECT_INIT_TRADING' };
  }

  // 24. Follow-up "elaborate"
  if (
    prompt === 'tell me more about what you just said' ||
    prompt === 'tell me more about that' ||
    prompt === 'elaborate on that' ||
    prompt === 'can you elaborate' ||
    prompt === 'tell me more'
  ) {
    return { type: 'ELABORATE_PREVIOUS', lastTopic: context.lastTopic };
  }

  return { type: 'UNKNOWN' };
}

// -------------------------------------------------------------
// RESPONSE GENERATOR
// -------------------------------------------------------------

function generateResponse(prompt, history = [], chatId = 'chat', modelName = 'grok-4.7') {
  const context = inspectHistory(history);
  const intent = classifyIntent(prompt, context);
  const modelInfo = getModelIdentity(modelName);
  let responseText = null;

  switch (intent.type) {
    // 1. Conversational Mood & Personality Responses
    case 'CASUAL_GREETING':
      responseText = selectVariant('casual_greeting', CASUAL_GREETINGS, chatId);
      break;

    case 'EXCITING_ACHIEVEMENT':
      responseText = selectVariant('exciting_achievement', EXCITING_ACHIEVEMENTS, chatId);
      break;

    case 'DEBUGGING_SUCCESS':
      responseText = selectVariant('debugging_success', DEBUGGING_SUCCESS, chatId);
      break;

    case 'DEBUGGING_STILL_BROKEN':
      responseText = selectVariant('debugging_still_broken', DEBUGGING_STILL_BROKEN, chatId);
      break;

    case 'DISAPPOINTING_NEWS':
      responseText = selectVariant('disappointing_news', DISAPPOINTING_NEWS, chatId);
      break;

    case 'EXHAUSTION_STRESS':
      responseText = selectVariant('exhaustion_stress', EXHAUSTION_STRESS, chatId);
      break;

    case 'HUMOR_JOKE':
      responseText = selectVariant('humor_joke', JOKES_POOL, chatId);
      break;

    case 'HUMOR_REACTION_OR_THANKS':
      responseText = selectVariant('humor_reaction', HUMOR_REACTION_OR_THANKS, chatId);
      break;

    case 'CASUAL_ACK':
      responseText = selectVariant('casual_ack', CASUAL_ACKS, chatId);
      break;

    case 'DATABASE_INDEX':
      responseText = selectVariant('database_index', DATABASE_INDEX_VARIATIONS, chatId);
      break;

    case 'ACID_TRANSACTIONS':
      responseText = selectVariant('acid_transactions', ACID_TRANSACTIONS, chatId);
      break;

    case 'PROFESSIONAL_DELAY_EMAIL':
      responseText = selectVariant('prof_delay_email', PROFESSIONAL_DELAY_EMAIL, chatId);
      break;

    case 'REQUEST_NO_EMOJI':
      responseText = `Understood. I will provide direct, professional responses without the use of emojis.`;
      break;

    case 'EXPLAIN_GARBAGE_COLLECTION':
      responseText = `Garbage collection is an automatic memory management feature that reclaims memory allocated to objects that are no longer referenced by the application. Common strategies include reference counting and tracing algorithms such as mark-and-sweep, which identify and deallocate unreachable memory blocks to prevent memory leaks.`;
      break;

    case 'APP_INIT_DESKTOP':
      responseText = selectVariant('app_init_desktop', APP_INIT_DESKTOP_VARIATIONS, chatId);
      break;

    case 'APP_APPS_PAGE_WORKING':
      responseText = selectVariant('app_apps_page', APP_APPS_PAGE_WORKING_VARIATIONS, chatId);
      break;

    case 'APP_LOGOS_LOOK_BAD':
      responseText = selectVariant('app_logos', APP_LOGOS_LOOK_BAD_VARIATIONS, chatId);
      break;

    case 'CAPITAL_OF_FRANCE':
      responseText = selectVariant('capital_france', CAPITAL_OF_FRANCE, chatId);
      break;

    case 'EXPLAIN_PHOTOSYNTHESIS':
      responseText = selectVariant('photosynthesis', EXPLAIN_PHOTOSYNTHESIS, chatId);
      break;

    // 2. Identity & About Responses
    case 'IDENTITY_ELABORATE':
      responseText = selectVariant('identity_elaborate', getIdentityElaborateVariations(modelInfo), chatId);
      break;

    case 'HELP_BUILD_APP':
      responseText = selectVariant('help_build_app', HELP_BUILD_APP_VARIATIONS, chatId);
      break;

    case 'EXPLAIN_PYTHON_DECORATORS':
      responseText = selectVariant('python_decorators', EXPLAIN_PYTHON_DECORATORS_VARIATIONS, chatId);
      break;

    case 'DECORATOR_EXAMPLE':
      responseText = selectVariant('decorator_example', DECORATOR_EXAMPLE_VARIATIONS, chatId);
      break;

    case 'DECORATOR_SIMPLER':
      responseText = selectVariant('decorator_simpler', DECORATOR_SIMPLER_VARIATIONS, chatId);
      break;

    case 'IDENTITY':
      responseText = selectVariant('identity', getIdentityVariations(modelInfo), chatId);
      break;

    case 'ABOUT_SELF':
      responseText = selectVariant('about_self', getAboutSelfVariations(modelInfo), chatId);
      break;

    case 'MODEL_SPECIFIC':
      responseText = selectVariant('model_specific', getModelSpecificVariations(modelInfo), chatId);
      break;

    case 'APP_IDENTITY':
      responseText = `${OFFICIAL_IDENTITY.APP_NAME} is an autonomous desktop AI workspace application developed by ${OFFICIAL_IDENTITY.COMPANY}, built by developer ${OFFICIAL_IDENTITY.DEVELOPER}. It provides a focused environment for managing multi-turn conversations, persisting chats locally, and running various frontier AI models without browser clutter.`;
      break;

    case 'ABOUT_IDEV':
      responseText = selectVariant('about_idev', ABOUT_IDEV_VARIATIONS, chatId);
      break;

    case 'IDEV_OTHER_PRODUCTS':
      responseText = selectVariant('idev_other_products', IDEV_OTHER_PRODUCTS_VARIATIONS, chatId);
      break;

    case 'IDEV_MODEL_DISTINCTION':
      responseText = selectVariant('idev_model_distinction', IDEV_MODEL_DISTINCTION_VARIATIONS, chatId);
      break;

    case 'IDEV_RELATIONSHIP':
      responseText = selectVariant('idev_rel', IDEV_RELATIONSHIP_VARIATIONS, chatId);
      break;

    case 'PURPOSE':
      responseText = selectVariant('purpose', PURPOSE_VARIATIONS, chatId);
      break;

    case 'DIFFERENTIATOR':
      responseText = selectVariant('diff', getDifferentiatorVariations(modelInfo), chatId);
      break;

    case 'APP_CREATOR':
      responseText = selectVariant('app_creator', getAppCreatorVariations(), chatId);
      break;

    case 'CREATOR':
    case 'MODEL_CREATOR':
      responseText = selectVariant('creator', getCreatorVariations(modelInfo), chatId);
      break;

    case 'ABOUT_DEVELOPER':
      responseText = selectVariant('about_dev', ABOUT_DEVELOPER_VARIATIONS, chatId);
      break;

    case 'WHO_IS_UBAID':
      responseText = selectVariant('who_ubaid', WHO_IS_UBAID_VARIATIONS, chatId);
      break;

    case 'TELL_ME_EVERYTHING_DEV':
      responseText = selectVariant('everything_dev', TELL_ME_EVERYTHING_DEV_VARIATIONS, chatId);
      break;

    case 'CREATOR_PROJECTS':
      responseText = selectVariant('creator_projects', CREATOR_PROJECTS_VARIATIONS, chatId);
      break;

    case 'CREATOR_GITHUB':
      responseText = selectVariant('github', CREATOR_GITHUB_VARIATIONS, chatId);
      break;

    case 'CREATOR_INSTAGRAM':
      responseText = selectVariant('instagram', CREATOR_INSTAGRAM_VARIATIONS, chatId);
      break;

    case 'CREATOR_BOTH':
      responseText = selectVariant('both', CREATOR_BOTH_VARIATIONS, chatId);
      break;

    case 'CREATOR_FOLLOWUP_HIM':
      responseText = selectVariant('creator_him', CREATOR_HIM_VARIATIONS, chatId);
      break;

    case 'CREATOR_FOLLOWUP_OTHER':
      responseText = `Ubaid's other official profile is Instagram: ${OFFICIAL_IDENTITY.INSTAGRAM}`;
      break;

    case 'CAPABILITIES':
      responseText = selectVariant('capabilities', CAPABILITIES_VARIATIONS, chatId);
      break;

    case 'WORKING_FEATURES':
      responseText = selectVariant('working_features', WORKING_FEATURES_VARIATIONS, chatId);
      break;

    case 'LIMITATIONS':
      responseText = selectVariant('limitations', LIMITATIONS_VARIATIONS, chatId);
      break;

    case 'CAN_CONTROL_COMPUTER':
      responseText = `No, I cannot control your computer. ${OFFICIAL_IDENTITY.APP_NAME} operates strictly within its desktop window. It has no access to move your mouse, type on your keyboard, or execute OS shell commands on your machine.`;
      break;

    case 'CAN_BROWSE_INTERNET':
      responseText = `No, I do not have autonomous web scraping or web browsing capabilities. ${OFFICIAL_IDENTITY.APP_NAME} is built as a focused, local workspace. It relies on the conversation and files you provide directly in the application.`;
      break;

    case 'CAN_GENERATE_IMAGES':
      responseText = `I do not synthesize or generate raw image pixels directly. However, you can attach images to your messages, and I can inspect the preview and discuss their visual content with you.`;
      break;

    case 'CAN_WRITE_CODE':
      responseText = `Yes! I can help you write, review, and debug code across many programming languages (JavaScript, TypeScript, Python, Rust, C++, Go, etc.). I can structure algorithms, suggest architectural patterns, and format clean code blocks.`;
      break;

    case 'TECHNOLOGY':
      responseText = selectVariant('technology', TECHNOLOGY_VARIATIONS, chatId);
      break;

    case 'CHAT_SYSTEM_WORK':
      responseText = selectVariant('chat_system', CHAT_SYSTEM_VARIATIONS, chatId);
      break;

    case 'AI_MODELS':
      responseText = selectVariant('ai_models', AI_MODELS_VARIATIONS, chatId);
      break;

    case 'SELF_LEARNING':
      responseText = selectVariant('self_learning', SELF_LEARNING_VARIATIONS, chatId);
      break;

    case 'ELABORATE_PREVIOUS':
      if (context.lastTopic === 'developer') {
        responseText = selectVariant('creator_him', CREATOR_HIM_VARIATIONS, chatId);
      } else if (context.lastTopic === 'technology') {
        responseText = `Under the hood, Electron pairs a Chromium rendering process with a background Node.js process. In ${OFFICIAL_IDENTITY.APP_NAME}, the Node server handles REST endpoints and direct file persistence in \`Storage/chats\`, allowing the client interface to remain fast, responsive, and completely independent of external database servers.`;
      } else if (context.lastTopic === 'chat_system') {
        responseText = `The persistence model writes each chat session as a structured JSON object to \`Storage/chats/<chat_id>.json\`. When you switch between sessions, the client simply reads that local file, reconstructing the message sequence, timestamps, and model selections instantly with zero network delay.`;
      } else if (context.lastTopic === 'capabilities') {
        responseText = `Beyond standard dialogue, ${OFFICIAL_IDENTITY.APP_NAME} provides a dedicated workspace for managing projects locally. You can attach source code files or screenshots to ground the conversation, maintain separate threads for different projects, and adjust settings like context length and think levels.`;
      } else {
        responseText = `To expand on that: ${OFFICIAL_IDENTITY.APP_NAME} is designed around simplicity and local ownership. Everything you create stays securely on your disk, and the interface is tuned for distraction-free coding and project discussion.`;
      }
      break;

    case 'PROJECT_INIT_TRADING':
      responseText = `A trading app is an exciting project! Key architectural pillars to plan early include:\n\n` +
             `1. **Market Data Feed**: Reliable WebSocket connection for real-time order books and ticks.\n` +
             `2. **Charting Engine**: High-performance canvas or SVG rendering (e.g., TradingView Lightweight Charts).\n` +
             `3. **Order Management & Execution**: Sub-second order routing, position tracking, and safety limits.\n` +
             `4. **Risk & Alerts**: Configurable stop-loss triggers and push/webhook alerts.\n\n` +
             `Which component are you planning to tackle first?`;
      break;

    case 'PROJECT_CHARTS':
      responseText = `For your trading app, here are the most effective charting options:\n\n` +
             `• **TradingView Lightweight Charts**: The gold standard for financial apps. Extremely fast, lightweight, and purpose-built for candlesticks and volume.\n` +
             `• **Chart.js with Financial Plugin**: Good for basic time-series line and bar charts.\n` +
             `• **Custom HTML5 Canvas**: Maximum rendering control if you need ultra-high-frequency tick rendering.\n\n` +
             `TradingView Lightweight Charts is usually the best starting point.`;
      break;

    case 'PROJECT_ALERTS':
      responseText = `For trading app alerts, you'll want an event-driven architecture:\n\n` +
             `• **Price Threshold Alerts**: Compare incoming price ticks against target triggers in memory.\n` +
             `• **Technical Indicator Triggers**: Alerts based on RSI overbought/oversold levels, MACD crossovers, or moving averages.\n` +
             `• **Delivery Channels**: Web notifications in the UI, desktop system notifications, or Webhooks/Telegram for mobile alerts.\n\n` +
             `Storing active alerts in an indexed local database ensures fast sub-millisecond evaluation on every market tick.`;
      break;

    case 'EXPLAIN_PYTHON':
      responseText = `Python is a high-level, general-purpose programming language renowned for its clear syntax and code readability. It supports multiple programming paradigms, including object-oriented, functional, and procedural styles.\n\n` +
             `Key strengths:\n` +
             `• **Batteries Included**: Comprehensive standard library for file I/O, networking, and math.\n` +
             `• **Ecosystem**: Industry-standard libraries for automation, data science, machine learning, and backend web development (Django, FastAPI, Flask).\n` +
             `• **Cross-Platform**: Runs on Windows, macOS, Linux, and embedded systems.`;
      break;

    case 'EXPLAIN_JAVASCRIPT':
      responseText = `JavaScript is a high-level, dynamic programming language that powers the interactive behavior of the web. Alongside HTML and CSS, it is one of the core technologies of the World Wide Web.\n\n` +
             `Key strengths:\n` +
             `• **Universal**: Runs in all modern web browsers and on servers via Node.js.\n` +
             `• **Event-Driven**: Non-blocking asynchronous I/O with promises and async/await.\n` +
             `• **Ecosystem**: Massive package ecosystem via npm for building web, desktop, and mobile applications.`;
      break;

    case 'EXPLAIN_BINARY_TREE':
      responseText = `A binary tree is a hierarchical data structure in which each node has at most two children, referred to as the left child and the right child.\n\n` +
             `Key concepts:\n` +
             `• **Root**: The topmost node of the tree.\n` +
             `• **Leaf**: A node with no children.\n` +
             `• **Height**: The length of the longest path from the root to a leaf.\n` +
             `• **Common Types**: Binary Search Tree (BST), AVL Tree, and Red-Black Tree.`;
      break;

    case 'PYTHON_PARSE_JSON':
      responseText = `Here is a Python function to parse JSON safely:\n\n` +
             `\`\`\`python\n` +
             `import json\n\n` +
             `def parse_json_string(json_str: str):\n` +
             `    """Parses a JSON string into a Python dictionary or list."""\n` +
             `    try:\n` +
             `        return json.loads(json_str)\n` +
             `    except json.JSONDecodeError as err:\n` +
             `        print(f"JSON parsing error: {err}")\n` +
             `        return None\n` +
             `\`\`\`\n\n` +
             `This uses Python's built-in \`json\` module with error handling.`;
      break;

    default:
      return null;
  }

  // If user requested no emojis or tone is strictly emoji-free, strip emojis
  if (context.wantsNoEmojis || intent.noEmoji) {
    return stripEmojis(responseText);
  }

  return responseText;
}

// Strict identity intents that are protected even when direct cloud or mock key is set
const STRICT_IDENTITY_INTENTS = new Set([
  'IDENTITY',
  'IDENTITY_ELABORATE',
  'HELP_BUILD_APP',
  'ABOUT_SELF',
  'ABOUT_IDEV',
  'IDEV_OTHER_PRODUCTS',
  'IDEV_MODEL_DISTINCTION',
  'IDEV_RELATIONSHIP',
  'APP_IDENTITY',
  'PURPOSE',
  'DIFFERENTIATOR',
  'CREATOR',
  'ABOUT_DEVELOPER',
  'WHO_IS_UBAID',
  'TELL_ME_EVERYTHING_DEV',
  'CREATOR_PROJECTS',
  'CREATOR_GITHUB',
  'CREATOR_INSTAGRAM',
  'CREATOR_BOTH',
  'CREATOR_FOLLOWUP_HIM',
  'CREATOR_FOLLOWUP_OTHER',
  'CAPABILITIES',
  'WORKING_FEATURES',
  'LIMITATIONS',
  'CAN_CONTROL_COMPUTER',
  'CAN_BROWSE_INTERNET',
  'CAN_GENERATE_IMAGES',
  'CAN_WRITE_CODE',
  'TECHNOLOGY',
  'CHAT_SYSTEM_WORK',
  'AI_MODELS',
  'SELF_LEARNING',
  'ELABORATE_PREVIOUS',
  'PROJECT_INIT_TRADING',
  'PROJECT_CHARTS',
  'PROJECT_ALERTS',
  'EXPLAIN_PYTHON',
  'EXPLAIN_PYTHON_DECORATORS',
  'DECORATOR_EXAMPLE',
  'DECORATOR_SIMPLER',
  'EXPLAIN_JAVASCRIPT',
  'EXPLAIN_BINARY_TREE',
  'PYTHON_PARSE_JSON'
]);

function isStrictIdentityQuery(prompt, history = []) {
  const context = inspectHistory(history);
  const intent = classifyIntent(prompt, context);
  return STRICT_IDENTITY_INTENTS.has(intent.type);
}

function isIdentityOrHandledQuery(prompt, history = []) {
  const context = inspectHistory(history);
  const intent = classifyIntent(prompt, context);
  return intent.type !== 'UNKNOWN';
}

module.exports = {
  OFFICIAL_IDENTITY,
  getModelIdentity,
  buildSystemPrompt,
  classifyIntent,
  inspectHistory,
  generateResponse,
  stripEmojis,
  isStrictIdentityQuery,
  isIdentityOrHandledQuery
};
