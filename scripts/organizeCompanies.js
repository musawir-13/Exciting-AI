const fs = require('fs');

const importScript = fs.readFileSync('scripts/importModels.js', 'utf8');
const match = importScript.match(/const rawList = (\[[\s\S]*?\n\];)/);
const rawList = eval(match[1]);

function toModelId(name) {
  let s = name.toLowerCase();
  s = s.replace(/\+/g, '-plus');
  s = s.replace(/[\(\)]/g, ' ');
  s = s.trim().replace(/[\s_.]+/g, '-');
  s = s.replace(/[^a-z0-9-]/g, '');
  s = s.replace(/-+/g, '-');
  return s.replace(/^-|-$/g, '');
}

console.log('Total models:', rawList.length);

// Map each model to company
const companyMap = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OpenAI',
    desc: 'Pioneers of GPT, ChatGPT, and reasoning models like o1.',
    models: []
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    shortName: 'Anthropic',
    desc: 'Creators of Claude, Claude Sonnet, and Constitutional AI.',
    models: []
  },
  google: {
    id: 'google',
    name: 'Google DeepMind',
    shortName: 'Google',
    desc: 'Creators of Gemini, Gemma, and frontier multimodal AI.',
    models: []
  },
  meta: {
    id: 'meta',
    name: 'Meta AI',
    shortName: 'Meta',
    desc: 'Leading open weights innovation with Llama and Code Llama.',
    models: []
  },
  microsoft: {
    id: 'microsoft',
    name: 'Microsoft & Azure AI',
    shortName: 'Microsoft',
    desc: 'Frontier small language models with Phi and enterprise intelligence.',
    models: []
  },
  alibaba: {
    id: 'alibaba',
    name: 'Alibaba Cloud (Qwen)',
    shortName: 'Qwen',
    desc: 'High-capability multilingual foundation models and vision reasoning.',
    models: []
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    shortName: 'Mistral',
    desc: 'Open and efficient European models including Mistral, Mixtral, and Pixtral.',
    models: []
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek',
    desc: 'Breakthrough reasoning and code generation systems like DeepSeek R1 and V3.',
    models: []
  },
  nvidia: {
    id: 'nvidia',
    name: 'NVIDIA',
    shortName: 'NVIDIA',
    desc: 'Optimized Nemotron reasoning and accelerated hardware models.',
    models: []
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    shortName: 'Cohere',
    desc: 'Enterprise retrieval, Command R+, and multilingual reranking engines.',
    models: []
  },
  xai: {
    id: 'xai',
    name: 'xAI',
    shortName: 'xAI',
    desc: 'Truth-seeking intelligence and reasoning with Grok.',
    models: []
  },
  zhipu: {
    id: 'zhipu',
    name: 'Zhipu AI (GLM)',
    shortName: 'Zhipu AI',
    desc: 'Tsinghua University spinout powering the GLM bilingual foundation series.',
    models: []
  },
  moonshot: {
    id: 'moonshot',
    name: 'Moonshot AI (Kimi)',
    shortName: 'Kimi',
    desc: 'Ultra-long context comprehension and mathematical reasoning.',
    models: []
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    shortName: 'MiniMax',
    desc: 'Next-generation MoE architectures with Abab series.',
    models: []
  },
  stepfun: {
    id: 'stepfun',
    name: 'StepFun',
    shortName: 'StepFun',
    desc: 'Multimodal foundation models with Step-2 and Step-1.5 series.',
    models: []
  },
  ai21: {
    id: 'ai21',
    name: 'AI21 Labs',
    shortName: 'AI21',
    desc: 'Production-ready Mamba hybrid architectures and Jamba models.',
    models: []
  },
  reka: {
    id: 'reka',
    name: 'Reka AI',
    shortName: 'Reka',
    desc: 'Multimodal intelligence trained from scratch across text, audio, and video.',
    models: []
  },
  upstage: {
    id: 'upstage',
    name: 'Upstage',
    shortName: 'Upstage',
    desc: 'Solar Pro and depth-upscaled enterprise decision architectures.',
    models: []
  },
  nous: {
    id: 'nous',
    name: 'Nous Research',
    shortName: 'Nous Research',
    desc: 'Open-weights flagships including Hermes 3 and function calling.',
    models: []
  },
  databricks: {
    id: 'databricks',
    name: 'Databricks',
    shortName: 'Databricks',
    desc: 'Open MoE architecture for enterprise data analytics with DBRX.',
    models: []
  },
  tii: {
    id: 'tii',
    name: 'Technology Innovation Institute',
    shortName: 'TII (Falcon)',
    desc: 'Open-weights foundation models including Falcon series from Abu Dhabi.',
    models: []
  },
  stability: {
    id: 'stability',
    name: 'Stability AI',
    shortName: 'Stability AI',
    desc: 'Pioneers of generative media and Stable Diffusion.',
    models: []
  },
  'black-forest-labs': {
    id: 'black-forest-labs',
    name: 'Black Forest Labs',
    shortName: 'Black Forest Labs',
    desc: 'State-of-the-art rectified flow visual transformers with FLUX.1.',
    models: []
  },
  midjourney: {
    id: 'midjourney',
    name: 'Midjourney',
    shortName: 'Midjourney',
    desc: 'Premier photorealistic visual synthesis and artistic interpretation.',
    models: []
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'ElevenLabs',
    desc: 'Industry-standard voice synthesis and multilingual speech audio.',
    models: []
  },
  community: {
    id: 'community',
    name: 'Community & Other Models',
    shortName: 'Community',
    desc: 'Open-source innovations, research architectures, and specialized community merges.',
    models: []
  }
};

rawList.forEach(m => {
  const modelId = toModelId(m.name);
  const entry = {
    id: modelId,
    name: m.name,
    desc: m.desc,
    ctx: m.ctx,
    think: !!m.think,
    vision: !!m.vision,
    family: m.family,
    category: m.category
  };

  let compId = m.family;
  if (!companyMap[compId]) {
    // Check aliases
    if (compId === 'cerebras' || compId === 'mercury' || compId === 'k2-horizon' || compId === 'macaron' ||
        compId === 'reflection' || compId === 'gryphe' || compId === 'openchat' || compId === 'bigcode' ||
        compId === 'generative-media') {
      compId = 'community';
    } else {
      compId = 'community';
    }
  }

  companyMap[compId].models.push(entry);
});

let totalAssigned = 0;
for (const [id, c] of Object.entries(companyMap)) {
  console.log(`${c.name.padEnd(35)} (${id}): ${c.models.length} models`);
  totalAssigned += c.models.length;
}
console.log('Total assigned models:', totalAssigned);
