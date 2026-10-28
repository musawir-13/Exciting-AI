const fs = require('fs');
const path = require('path');

// 1. Update engine/identity.js
const identityPath = path.join(__dirname, '..', 'engine', 'identity.js');
let identityCode = fs.readFileSync(identityPath, 'utf8');

// Ensure fs and path are required at top
if (!identityCode.includes("const fs = require('fs');")) {
  identityCode = "const fs = require('fs');\nconst path = require('path');\n\n" + identityCode;
}

// Update OFFICIAL_IDENTITY
const oldOfficialIdentity = `const OFFICIAL_IDENTITY = {
  APP_NAME: 'Exciting AI',
  DEVELOPER: 'Ubaid',
  GITHUB: 'https://github.com/musawir-13',
  INSTAGRAM: 'https://www.instagram.com/musawir___13/',
  ROLE: 'Desktop Assistant',
  PURPOSE: 'Providing a private, local desktop workspace for managing conversations, structuring project workflows, and discussing code.',
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
};`;

const newOfficialIdentity = `const OFFICIAL_IDENTITY = {
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
};`;

if (identityCode.includes(oldOfficialIdentity)) {
  identityCode = identityCode.replace(oldOfficialIdentity, newOfficialIdentity);
  console.log('✓ Updated OFFICIAL_IDENTITY with IDeV company metadata');
} else {
  console.warn('! OFFICIAL_IDENTITY pattern not matched');
}

// Replace getModelIdentity and buildSystemPrompt with catalog-driven resolution
const getModelIdentityRegex = /\/\/ -+\s*\/\/ MODEL IDENTITY RESOLVER & SYSTEM PROMPT BUILDER\s*\/\/ -+[\s\S]*?function buildSystemPrompt\(modelName\) \{[\s\S]*?\n\}/;

const newModelIdentitySection = `// -------------------------------------------------------------
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

  return \`You are \${info.displayName}, an artificial intelligence model developed by \${info.provider}.

# OFFICIAL IDENTITY & APPLICATION CONTEXT
1. Model Identity (\${info.displayName}):
- You are \${info.displayName}, developed by \${info.provider}.
- When asked "Who are you?", "What model are you?", "Which AI are you?", "Who built you?", or "Tell me about yourself", identify yourself accurately and authentically as \${info.displayName} created by \${info.provider}.
- You possess the genuine capabilities, reasoning skills, and characteristics of \${info.displayName}.
- NEVER claim that you are "Exciting AI" or "IDeV". Exciting AI is the client desktop application you are running within, NOT your model identity.
- Foundation models (like GPT, Claude, Gemini, Llama, DeepSeek, Grok, etc.) were created and trained by their respective providers (\${info.provider}), NOT by IDeV or Ubaid.

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
- When asked "Did IDeV create [GPT / Claude / Gemini / etc.]?": Clarify that IDeV built Exciting AI (the desktop application), while foundation models belong to their respective AI providers (\${info.provider}, etc.). Foundation model development is distinct from desktop workspace application development.
- Never invent personal biographies, work history, employee counts, dates, or qualifications for Ubaid or IDeV.

# CONVERSATIONAL VOICE & NATURAL COMMUNICATION
- Speak with a warm, natural, lively, spontaneous voice using contractions ("I'm", "you're", "that's", "don't", "can't").
- Match the user's energy, tone, and context (casual, celebratory, empathetic, humorous, educational, or professional).
- Use emojis naturally when fitting, never forced or repetitive. Zero emojis in code blocks, CLI commands, JSON payloads, or formal requests.
- Retain multi-turn conversation context across queries without repeating previous introductions.\`;
}`;

if (getModelIdentityRegex.test(identityCode)) {
  identityCode = identityCode.replace(getModelIdentityRegex, newModelIdentitySection);
  console.log('✓ Updated getModelIdentity and buildSystemPrompt with catalog-driven resolution');
} else {
  console.warn('! getModelIdentityRegex pattern not matched');
}

// Update getCreatorVariations and getAppCreatorVariations
const oldGetCreator = `function getCreatorVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    \`I was developed by \${m.provider}. I'm running inside the Exciting AI desktop application, which was built by \${OFFICIAL_IDENTITY.DEVELOPER}. You can check out his projects on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`My model (\${m.displayName}) was created by \${m.provider}. The Exciting AI desktop workspace application was built by \${OFFICIAL_IDENTITY.DEVELOPER} (GitHub: \${OFFICIAL_IDENTITY.GITHUB}).\`,
    \`\${m.displayName} was developed by \${m.provider}. Exciting AI, the desktop application hosting our conversation, was built by \${OFFICIAL_IDENTITY.DEVELOPER}. You can find his work on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`
  ];
}

function getAppCreatorVariations() {
  return [
    \`Exciting AI was built by \${OFFICIAL_IDENTITY.DEVELOPER}. You can check out his projects on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`\${OFFICIAL_IDENTITY.DEVELOPER} built Exciting AI! His GitHub is \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`Exciting AI was developed by \${OFFICIAL_IDENTITY.DEVELOPER}. He's on GitHub at \${OFFICIAL_IDENTITY.GITHUB}\`
  ];
}`;

const newGetCreator = `function getCreatorVariations(modelInfo) {
  const m = modelInfo || getModelIdentity('grok-4.7');
  return [
    \`I was developed by \${m.provider}. I'm running inside the Exciting AI desktop application, which was built by \${OFFICIAL_IDENTITY.COMPANY}, with \${OFFICIAL_IDENTITY.DEVELOPER} being the developer behind \${OFFICIAL_IDENTITY.COMPANY}. You can check out his projects on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`My model (\${m.displayName}) was created by \${m.provider}. The Exciting AI desktop workspace application was built by \${OFFICIAL_IDENTITY.COMPANY}, developed by \${OFFICIAL_IDENTITY.DEVELOPER} (GitHub: \${OFFICIAL_IDENTITY.GITHUB}).\`,
    \`\${m.displayName} was developed by \${m.provider}. Exciting AI was created by \${OFFICIAL_IDENTITY.COMPANY}, founded by \${OFFICIAL_IDENTITY.DEVELOPER}. You can find his work on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`
  ];
}

function getAppCreatorVariations() {
  return [
    \`Exciting AI was built by \${OFFICIAL_IDENTITY.COMPANY}, and \${OFFICIAL_IDENTITY.DEVELOPER} is the developer behind \${OFFICIAL_IDENTITY.COMPANY}. You can check out his projects on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`\${OFFICIAL_IDENTITY.COMPANY} built Exciting AI, and \${OFFICIAL_IDENTITY.DEVELOPER} is the person behind \${OFFICIAL_IDENTITY.COMPANY}! His GitHub is \${OFFICIAL_IDENTITY.GITHUB}\`,
    \`Exciting AI is an \${OFFICIAL_IDENTITY.COMPANY} product, developed by \${OFFICIAL_IDENTITY.DEVELOPER}. You can explore his repositories on GitHub at \${OFFICIAL_IDENTITY.GITHUB}\`
  ];
}

const ABOUT_IDEV_VARIATIONS = [
  \`IDeV is the company behind Exciting AI. Ubaid is the developer who built IDeV, and Exciting AI was created by IDeV as an autonomous desktop AI workspace.\`,
  \`IDeV is the company that developed Exciting AI. Ubaid is the person behind IDeV, focusing on focused desktop AI tools and software development.\`,
  \`IDeV is the software development company responsible for Exciting AI. Ubaid built IDeV, and Exciting AI is an official IDeV product.\`
];

const IDEV_OTHER_PRODUCTS_VARIATIONS = [
  \`Exciting AI is the primary documented application created by IDeV in the application metadata. No other commercial products or portfolios are recorded here.\`,
  \`Beyond Exciting AI, no other products or commercial software from IDeV are documented in this system. Exciting AI is the main verified IDeV product.\`,
  \`Exciting AI is the verified product developed by IDeV. Additional company portfolios or unreleased products are not documented within this workspace.\`
];

const IDEV_MODEL_DISTINCTION_VARIATIONS = [
  \`No, IDeV did not create third-party foundation models. IDeV built Exciting AI, the desktop application. Foundation models like GPT (OpenAI), Claude (Anthropic), and Gemini (Google) belong to their respective research organizations.\`,
  \`IDeV built Exciting AI, the desktop workspace application. Foundation AI models such as GPT, Claude, and Gemini belong to and were trained by their respective providers, not by IDeV.\`,
  \`No. IDeV is the company behind Exciting AI (the desktop software), while foundation models like GPT belong to OpenAI, Claude belongs to Anthropic, and Gemini belongs to Google.\`
];`;

if (identityCode.includes(oldGetCreator)) {
  identityCode = identityCode.replace(oldGetCreator, newGetCreator);
  console.log('✓ Updated creator and IDeV variations');
} else {
  console.warn('! getCreatorVariations pattern not matched');
}

// Update CREATOR_HIM_VARIATIONS, WHO_IS_UBAID_VARIATIONS, TELL_ME_EVERYTHING_DEV_VARIATIONS
const oldWhoUbaidSection = `const CREATOR_HIM_VARIATIONS = [
  \`Ubaid is the developer behind Exciting AI. You can explore his work on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid is the creator of Exciting AI. Beyond this application, no additional personal details are kept here, but you can explore his projects on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and follow him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid developed Exciting AI. To see more of his work or connect with him, check out his GitHub (\${OFFICIAL_IDENTITY.GITHUB}) and Instagram (\${OFFICIAL_IDENTITY.INSTAGRAM})\`
];

const WHO_IS_UBAID_VARIATIONS = [
  \`Ubaid is the developer behind Exciting AI. You can explore his work on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid is the developer who created Exciting AI. His public projects are hosted on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
  \`Ubaid is the creator of Exciting AI. You can check out his repositories on GitHub at \${OFFICIAL_IDENTITY.GITHUB}\`
];

const TELL_ME_EVERYTHING_DEV_VARIATIONS = [
  \`Ubaid is the developer of Exciting AI. The application does not maintain personal or biographical records about him, but you can explore his projects on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Beyond the fact that Ubaid is the developer who created Exciting AI, no additional biographical information is stored within this application. You can explore his work on GitHub (\${OFFICIAL_IDENTITY.GITHUB}) and connect with him on Instagram (\${OFFICIAL_IDENTITY.INSTAGRAM})\`
];`;

const newWhoUbaidSection = `const CREATOR_HIM_VARIATIONS = [
  \`Ubaid is the developer behind IDeV, the company that created Exciting AI. You can explore his work on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid is the person behind IDeV and Exciting AI. Beyond this application, no additional personal details are kept here, but you can explore his projects on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and follow him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid built IDeV and developed Exciting AI. To see more of his work or connect with him, check out his GitHub (\${OFFICIAL_IDENTITY.GITHUB}) and Instagram (\${OFFICIAL_IDENTITY.INSTAGRAM})\`
];

const WHO_IS_UBAID_VARIATIONS = [
  \`Ubaid is the developer behind IDeV, the company that built Exciting AI. You can explore his work on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Ubaid is the developer who built IDeV and created Exciting AI. His public projects are hosted on GitHub: \${OFFICIAL_IDENTITY.GITHUB}\`,
  \`Ubaid is the person behind IDeV, the company that created Exciting AI. You can check out his repositories on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`
];

const TELL_ME_EVERYTHING_DEV_VARIATIONS = [
  \`Ubaid is the developer behind IDeV, the company that created Exciting AI. The application does not maintain personal or biographical records about him, but you can explore his projects on GitHub at \${OFFICIAL_IDENTITY.GITHUB} and find him on Instagram at \${OFFICIAL_IDENTITY.INSTAGRAM}\`,
  \`Beyond the fact that Ubaid built IDeV and developed Exciting AI, no additional biographical information is stored within this application. You can explore his work on GitHub (\${OFFICIAL_IDENTITY.GITHUB}) and connect with him on Instagram (\${OFFICIAL_IDENTITY.INSTAGRAM})\`
];`;

if (identityCode.includes(oldWhoUbaidSection)) {
  identityCode = identityCode.replace(oldWhoUbaidSection, newWhoUbaidSection);
  console.log('✓ Updated Ubaid and IDeV profile variations');
} else {
  console.warn('! oldWhoUbaidSection pattern not matched');
}

// Add IDeV intents to classifyIntent
const oldWhoIsUbaidCheck = `  // 17. Developer questions & identity
  if (
    prompt === 'who is ubaid' ||
    prompt.startsWith('who is ubaid') ||
    prompt === 'whos ubaid' ||
    prompt.startsWith('whos ubaid') ||
    prompt === 'about ubaid' ||
    prompt === 'tell me about ubaid'
  ) {
    return { type: 'WHO_IS_UBAID' };
  }`;

const newWhoIsUbaidCheck = `  // 16.5 IDeV Company & Relationship Questions
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
  }`;

if (identityCode.includes(oldWhoIsUbaidCheck)) {
  identityCode = identityCode.replace(oldWhoIsUbaidCheck, newWhoIsUbaidCheck);
  console.log('✓ Added IDeV intent classification');
} else {
  console.warn('! oldWhoIsUbaidCheck pattern not matched');
}

// Update generateResponse cases
const oldAppIdentityCase = `    case 'APP_IDENTITY':
      responseText = \`\${OFFICIAL_IDENTITY.APP_NAME} is an autonomous desktop AI workspace application developed by Ubaid. It provides a focused environment for managing multi-turn conversations, persisting chats locally, and running various frontier AI models without browser clutter.\`;
      break;`;

const newAppIdentityCase = `    case 'APP_IDENTITY':
      responseText = \`\${OFFICIAL_IDENTITY.APP_NAME} is an autonomous desktop AI workspace application developed by \${OFFICIAL_IDENTITY.COMPANY}, built by developer \${OFFICIAL_IDENTITY.DEVELOPER}. It provides a focused environment for managing multi-turn conversations, persisting chats locally, and running various frontier AI models without browser clutter.\`;
      break;

    case 'ABOUT_IDEV':
      responseText = selectVariant('about_idev', ABOUT_IDEV_VARIATIONS, chatId);
      break;

    case 'IDEV_OTHER_PRODUCTS':
      responseText = selectVariant('idev_other_products', IDEV_OTHER_PRODUCTS_VARIATIONS, chatId);
      break;

    case 'IDEV_MODEL_DISTINCTION':
      responseText = selectVariant('idev_model_distinction', IDEV_MODEL_DISTINCTION_VARIATIONS, chatId);
      break;`;

if (identityCode.includes(oldAppIdentityCase)) {
  identityCode = identityCode.replace(oldAppIdentityCase, newAppIdentityCase);
  console.log('✓ Updated generateResponse cases for IDeV');
} else {
  console.warn('! oldAppIdentityCase pattern not matched');
}

// Update STRICT_IDENTITY_INTENTS
const oldStrictIntents = `  'HELP_BUILD_APP',
  'ABOUT_SELF',`;

const newStrictIntents = `  'HELP_BUILD_APP',
  'ABOUT_SELF',
  'ABOUT_IDEV',
  'IDEV_OTHER_PRODUCTS',
  'IDEV_MODEL_DISTINCTION',
  'APP_IDENTITY',`;

if (identityCode.includes(oldStrictIntents)) {
  identityCode = identityCode.replace(oldStrictIntents, newStrictIntents);
  console.log('✓ Updated STRICT_IDENTITY_INTENTS with IDeV intents');
}

fs.writeFileSync(identityPath, identityCode, 'utf8');
console.log('Saved engine/identity.js');

// 2. Update server.js for all models in selector and no company filtering
const serverPath = path.join(__dirname, '..', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

// Update /api/tags to return all models
const oldApiTags = `  if (pathname === '/api/tags' && req.method === 'GET') {
    const reqCompany = parsedUrl.searchParams.get('company');
    const showAll = parsedUrl.searchParams.get('all') === 'true';
    let models;
    if (showAll) {
      models = loadCloudModels();
    } else if (reqCompany && engine.companyRegistry) {
      models = engine.companyRegistry.getModelsForCompany(reqCompany);
    } else if (engine.companyRegistry) {
      models = engine.companyRegistry.getActiveCompanyModels();
    } else {
      models = loadCloudModels();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ models }));
    return;
  }`;

const newApiTags = `  if (pathname === '/api/tags' && req.method === 'GET') {
    const models = loadCloudModels();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ models }));
    return;
  }`;

if (serverCode.includes(oldApiTags)) {
  serverCode = serverCode.replace(oldApiTags, newApiTags);
  console.log('✓ Updated /api/tags in server.js to return all 1,927 models');
}

// Remove company isolation rejection in /api/chat and POST /api/v1/chat/:id
const companyValidationBlock = `      // Company isolation: verify model belongs to active company
      if (engine.companyRegistry) {
        const val = engine.companyRegistry.validateModelForCompany(null, model);
        if (!val.valid) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: val.error,
            code: "COMPANY_MODEL_MISMATCH"
          }));
          return;
        }
      }`;

if (serverCode.includes(companyValidationBlock)) {
  serverCode = serverCode.replaceAll(companyValidationBlock, '// Company isolation bypassed: all catalog models available in model selector');
  console.log('✓ Removed company model mismatch restrictions from chat endpoints');
}

fs.writeFileSync(serverPath, serverCode, 'utf8');
console.log('Saved server.js');
