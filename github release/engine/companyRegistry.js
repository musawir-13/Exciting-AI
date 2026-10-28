const fs = require('fs');
const path = require('path');

// Metadata definitions for 26 AI Companies
const COMPANY_DEFS = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'OpenAI',
    desc: 'Pioneers of GPT, ChatGPT, and deep reasoning architectures like o1 and GPT-6.',
    logo: '/assets/logos/openai.svg',
    status: 'Active',
    families: ['openai']
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    shortName: 'Anthropic',
    desc: 'Creators of Claude, Claude Sonnet, and industry-leading Constitutional AI systems.',
    logo: '/assets/logos/anthropic.svg',
    status: 'Active',
    families: ['anthropic']
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    shortName: 'Google',
    desc: 'Creators of Gemini, Gemma, and frontier multimodal foundation intelligence.',
    logo: '/assets/logos/google.svg',
    status: 'Active',
    families: ['google']
  },
  {
    id: 'meta',
    name: 'Meta AI',
    shortName: 'Meta',
    desc: 'Leading open weights innovation with Llama 4, Llama 3, and Code Llama.',
    logo: '/assets/logos/meta.svg',
    status: 'Active',
    families: ['meta']
  },
  {
    id: 'microsoft',
    name: 'Microsoft & Azure AI',
    shortName: 'Microsoft',
    desc: 'Frontier small language models with Phi and enterprise intelligence solutions.',
    logo: '/assets/logos/microsoft.svg',
    status: 'Active',
    families: ['microsoft']
  },
  {
    id: 'alibaba',
    name: 'Alibaba Cloud (Qwen)',
    shortName: 'Qwen',
    desc: 'High-capability multilingual foundation models and vision reasoning with Qwen.',
    logo: '/assets/logos/alibaba.svg',
    status: 'Active',
    families: ['alibaba']
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    shortName: 'Mistral',
    desc: 'Open and efficient European models including Mistral, Mixtral, and Pixtral.',
    logo: '/assets/logos/mistral.svg',
    status: 'Active',
    families: ['mistral']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek',
    desc: 'Breakthrough reasoning and code generation systems like DeepSeek R1 and V3.',
    logo: '/assets/logos/deepseek.svg',
    status: 'Active',
    families: ['deepseek']
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    shortName: 'NVIDIA',
    desc: 'Optimized Nemotron reasoning and accelerated hardware neural models.',
    logo: '/assets/logos/nvidia.svg',
    status: 'Active',
    families: ['nvidia']
  },
  {
    id: 'cohere',
    name: 'Cohere',
    shortName: 'Cohere',
    desc: 'Enterprise retrieval, Command R+, and multilingual reranking engines.',
    logo: '/assets/logos/cohere.svg',
    status: 'Active',
    families: ['cohere']
  },
  {
    id: 'xai',
    name: 'xAI',
    shortName: 'xAI',
    desc: 'Truth-seeking intelligence and maximum reasoning power with Grok.',
    logo: '/assets/logos/xai.svg',
    status: 'Active',
    families: ['xai']
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (GLM)',
    shortName: 'Zhipu AI',
    desc: 'Tsinghua University spinout powering the GLM bilingual foundation series.',
    logo: '/assets/logos/zhipu.svg',
    status: 'Active',
    families: ['zhipu']
  },
  {
    id: 'moonshot',
    name: 'Moonshot AI (Kimi)',
    shortName: 'Kimi',
    desc: 'Ultra-long context comprehension and mathematical reasoning architecture.',
    logo: '/assets/logos/moonshot.svg',
    status: 'Active',
    families: ['moonshot']
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    shortName: 'MiniMax',
    desc: 'Next-generation Mixture-of-Experts architectures with Abab series.',
    logo: '/assets/logos/minimax.svg',
    status: 'Active',
    families: ['minimax']
  },
  {
    id: 'stepfun',
    name: 'StepFun',
    shortName: 'StepFun',
    desc: 'Multimodal foundation models with Step-2 and Step-1.5 series.',
    logo: '/assets/logos/stepfun.svg',
    status: 'Active',
    families: ['stepfun']
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    shortName: 'AI21',
    desc: 'Production-ready Mamba hybrid architectures and Jamba models.',
    logo: '/assets/logos/ai21.svg',
    status: 'Active',
    families: ['ai21']
  },
  {
    id: 'reka',
    name: 'Reka AI',
    shortName: 'Reka',
    desc: 'Multimodal intelligence trained from scratch across text, audio, and video.',
    logo: '/assets/logos/reka.svg',
    status: 'Active',
    families: ['reka']
  },
  {
    id: 'upstage',
    name: 'Upstage',
    shortName: 'Upstage',
    desc: 'Solar Pro and depth-upscaled enterprise decision architectures.',
    logo: '/assets/logos/upstage.svg',
    status: 'Active',
    families: ['upstage']
  },
  {
    id: 'nous',
    name: 'Nous Research',
    shortName: 'Nous Research',
    desc: 'Open-weights flagships including Hermes 3 and function calling.',
    logo: '/assets/logos/nous.svg',
    status: 'Active',
    families: ['nous']
  },
  {
    id: 'databricks',
    name: 'Databricks',
    shortName: 'Databricks',
    desc: 'Open MoE architecture for enterprise data analytics with DBRX.',
    logo: '/assets/logos/databricks.svg',
    status: 'Active',
    families: ['databricks']
  },
  {
    id: 'tii',
    name: 'Technology Innovation Institute',
    shortName: 'TII (Falcon)',
    desc: 'Open-weights foundation models including Falcon series from Abu Dhabi.',
    logo: '/assets/logos/tii.svg',
    status: 'Active',
    families: ['tii']
  },
  {
    id: 'stability',
    name: 'Stability AI',
    shortName: 'Stability AI',
    desc: 'Pioneers of generative media, image synthesis, and Stable Diffusion.',
    logo: '/assets/logos/stability.svg',
    status: 'Active',
    families: ['stability']
  },
  {
    id: 'black-forest-labs',
    name: 'Black Forest Labs',
    shortName: 'Black Forest Labs',
    desc: 'State-of-the-art rectified flow visual transformers with FLUX.1.',
    logo: '/assets/logos/black-forest-labs.svg',
    status: 'Active',
    families: ['black-forest-labs']
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    shortName: 'Midjourney',
    desc: 'Premier photorealistic visual synthesis and artistic interpretation.',
    logo: '/assets/logos/midjourney.svg',
    status: 'Active',
    families: ['midjourney']
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'ElevenLabs',
    desc: 'Industry-standard voice synthesis and multilingual speech audio.',
    logo: '/assets/logos/elevenlabs.svg',
    status: 'Active',
    families: ['elevenlabs']
  },
  {
    id: 'community',
    name: 'Community & Other Models',
    shortName: 'Community',
    desc: 'Open-source innovations, research architectures, and specialized community merges.',
    logo: '/assets/logos/community.svg',
    status: 'Active',
    families: ['community', 'cerebras', 'mercury', 'k2-horizon', 'macaron', 'reflection', 'gryphe', 'openchat', 'bigcode', 'generative-media']
  }
];

class CompanyRegistry {
  constructor(storageDir) {
    this.storageDir = storageDir || path.join(__dirname, '..', 'Storage');
    this.settingsDir = path.join(this.storageDir, 'settings');
    this.activeCompanyFile = path.join(this.settingsDir, 'active_company.json');
    this.companies = [];
    this.companyMap = new Map();
    this.modelToCompanyMap = new Map();
    this.activeCompanyId = 'openai';
    this.init();
  }

  init() {
    // 1. Load catalog models (first 210 are the supplied 210 models)
    let catalog = [];
    let catalogPath = path.join(this.storageDir, 'models', 'catalog.json');
    if (!fs.existsSync(catalogPath)) {
      const fallback = path.join(__dirname, '..', 'Storage', 'models', 'catalog.json');
      if (fs.existsSync(fallback)) catalogPath = fallback;
    }
    try {
      if (fs.existsSync(catalogPath)) {
        catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      }
    } catch (e) {
      console.error('[CompanyRegistry] Error reading catalog:', e.message);
    }

    // Isolate the 210 supplied models
    const supplied210 = catalog.slice(0, 210);

    // Map each company definition
    this.companies = COMPANY_DEFS.map(def => {
      const company = {
        id: def.id,
        name: def.name,
        shortName: def.shortName,
        desc: def.desc,
        logo: def.logo,
        status: def.status,
        families: def.families,
        models: []
      };

      // Match models belonging to this company's families
      supplied210.forEach(m => {
        const fam = (m.details && m.details.family) ? m.details.family.toLowerCase() : '';
        if (def.families.includes(fam)) {
          company.models.push(m);
          this.modelToCompanyMap.set(m.name.toLowerCase(), def.id);
          if (m.model) this.modelToCompanyMap.set(m.model.toLowerCase(), def.id);
          if (m.display_name) this.modelToCompanyMap.set(m.display_name.toLowerCase(), def.id);
        }
      });

      company.modelCount = company.models.length;
      return company;
    });

    for (const comp of this.companies) {
      this.companyMap.set(comp.id, comp);
    }

    // 2. Load active company from disk
    this.loadActiveCompany();
  }

  loadActiveCompany() {
    try {
      if (fs.existsSync(this.activeCompanyFile)) {
        const data = JSON.parse(fs.readFileSync(this.activeCompanyFile, 'utf8'));
        if (data && data.companyId && this.companyMap.has(data.companyId)) {
          this.activeCompanyId = data.companyId;
          return;
        }
      }
    } catch (e) {
      console.error('[CompanyRegistry] Error reading active company:', e.message);
    }
    this.activeCompanyId = 'openai';
  }

  getActiveCompanyId() {
    return this.activeCompanyId;
  }

  getActiveCompany() {
    const comp = this.companyMap.get(this.activeCompanyId) || this.companyMap.get('openai');
    return {
      ...comp,
      isActive: true
    };
  }

  setActiveCompany(companyId) {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const cleanId = String(companyId).toLowerCase().trim();
    if (!this.companyMap.has(cleanId)) {
      throw new Error(`Unknown company ID: ${companyId}`);
    }
    this.activeCompanyId = cleanId;

    try {
      if (!fs.existsSync(this.settingsDir)) {
        fs.mkdirSync(this.settingsDir, { recursive: true });
      }
      fs.writeFileSync(
        this.activeCompanyFile,
        JSON.stringify({ companyId: cleanId, updatedAt: new Date().toISOString() }, null, 2),
        'utf8'
      );
    } catch (e) {
      console.error('[CompanyRegistry] Failed to persist active company:', e.message);
    }

    return this.getActiveCompany();
  }

  getCompanies() {
    return this.companies.map(c => ({
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      desc: c.desc,
      logo: c.logo,
      status: c.status,
      modelCount: c.models.length,
      isActive: c.id === this.activeCompanyId,
      modelNames: c.models.map(m => (m.display_name || m.name || m.model || '').toLowerCase())
    }));
  }

  getCompany(companyId) {
    if (!companyId) return null;
    const cleanId = String(companyId).toLowerCase().trim();
    const c = this.companyMap.get(cleanId);
    if (!c) return null;
    return {
      ...c,
      isActive: c.id === this.activeCompanyId
    };
  }

  getModelsForCompany(companyId) {
    const c = this.getCompany(companyId);
    return c ? c.models : [];
  }

  getActiveCompanyModels() {
    return this.getModelsForCompany(this.activeCompanyId);
  }

  normalizeModelName(modelName) {
    if (!modelName || typeof modelName !== 'string') return '';
    return modelName.toLowerCase().replace(/[-:]?cloud$/i, '').trim();
  }

  getCompanyForModel(modelName) {
    if (!modelName) return null;
    const norm = this.normalizeModelName(modelName);
    if (this.modelToCompanyMap.has(norm)) {
      return this.modelToCompanyMap.get(norm);
    }
    // Try searching through models
    for (const comp of this.companies) {
      for (const m of comp.models) {
        if (
          m.name.toLowerCase() === norm ||
          (m.model && m.model.toLowerCase() === norm) ||
          (m.display_name && m.display_name.toLowerCase() === norm)
        ) {
          return comp.id;
        }
      }
    }
    return null;
  }

  isModelInCompany(companyId, modelName) {
    if (!companyId || !modelName) return false;
    const cleanCompId = String(companyId).toLowerCase().trim();
    const modelCompId = this.getCompanyForModel(modelName);
    return modelCompId === cleanCompId;
  }

  validateModelForCompany(companyId, modelName) {
    const cleanCompId = String(companyId || this.activeCompanyId).toLowerCase().trim();
    const comp = this.getCompany(cleanCompId);
    if (!comp) {
      return {
        valid: false,
        error: `Company '${cleanCompId}' not found.`
      };
    }

    if (!modelName) {
      return {
        valid: false,
        error: `No model specified.`
      };
    }

    const modelComp = this.getCompanyForModel(modelName);
    if (!modelComp) {
      // Model unknown in the 210 catalog
      return {
        valid: false,
        error: `Model '${modelName}' is not recognized in the provider catalog.`
      };
    }

    if (modelComp !== cleanCompId) {
      const actualComp = this.getCompany(modelComp);
      const actualName = actualComp ? actualComp.name : modelComp;
      return {
        valid: false,
        error: `Model '${modelName}' belongs to ${actualName}, but the currently active company is ${comp.name}. Switch to ${actualName} in Apps to use this model.`
      };
    }

    return { valid: true };
  }
}

let instance = null;

function getCompanyRegistry(storageDir) {
  if (!instance || (storageDir && instance.storageDir !== storageDir)) {
    instance = new CompanyRegistry(storageDir);
  }
  return instance;
}

module.exports = {
  CompanyRegistry,
  getCompanyRegistry
};
