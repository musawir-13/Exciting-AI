const fs = require('fs');
const path = require('path');

class ModelRegistry {
  constructor(storageDir, bundledStorageDir) {
    this.storageDir = storageDir;
    this.bundledStorageDir = bundledStorageDir;
    this.cloudModels = [];
    this.cloudModelsMap = new Map();
    this.lastMtime = 0;
    this.reload();
  }

  getCloudCatalogPath() {
    const fromModels = path.join(this.storageDir, 'models', 'catalog.json');
    if (fs.existsSync(fromModels)) return fromModels;
    if (this.bundledStorageDir) {
      const fallback = path.join(this.bundledStorageDir, 'models', 'catalog.json');
      if (fs.existsSync(fallback)) return fallback;
    }
    return fromModels;
  }

  reload() {
    const catalogPath = this.getCloudCatalogPath();
    try {
      if (fs.existsSync(catalogPath)) {
        const stats = fs.statSync(catalogPath);
        if (stats.mtimeMs === this.lastMtime && this.cloudModels.length > 0) {
          return this.cloudModels;
        }
        const raw = fs.readFileSync(catalogPath, 'utf8');
        const data = JSON.parse(raw);
        this.cloudModels = data;
        this.lastMtime = stats.mtimeMs;
        this.cloudModelsMap.clear();
        for (const m of data) {
          if (m.name) this.cloudModelsMap.set(m.name.toLowerCase().trim(), m);
          if (m.model) this.cloudModelsMap.set(m.model.toLowerCase().trim(), m);
        }
      }
    } catch (err) {
      console.error('[ModelRegistry] Failed to load cloud catalog:', err.message);
    }
    return this.cloudModels;
  }

  isCloudModel(modelName) {
    if (!modelName || typeof modelName !== 'string') return false;
    const lower = modelName.toLowerCase().trim();
    if (this.cloudModelsMap.has(lower)) return true;
    return lower.endsWith(':cloud') || lower.endsWith('-cloud') || lower.includes(':cloud') || lower === 'cloud';
  }

  getModel(modelName) {
    if (!modelName || typeof modelName !== 'string') return null;
    this.reload();
    const lower = modelName.toLowerCase().trim();
    if (this.cloudModelsMap.has(lower)) {
      return this.cloudModelsMap.get(lower);
    }
    // Also try stripping :cloud
    const stripped = lower.replace(/[-:]?cloud$/i, '').trim();
    if (this.cloudModelsMap.has(stripped)) {
      return this.cloudModelsMap.get(stripped);
    }
    return null;
  }

  listCloudModels() {
    this.reload();
    return this.cloudModels;
  }

  supportsVision(modelName) {
    const model = this.getModel(modelName);
    if (model && Array.isArray(model.capabilities)) {
      return model.capabilities.includes('vision');
    }
    const lower = (modelName || '').toLowerCase();
    return lower.includes('vision') || lower.includes('ocr') || lower.includes('vl');
  }

  supportsThinking(modelName) {
    const model = this.getModel(modelName);
    if (model && Array.isArray(model.capabilities)) {
      return model.capabilities.includes('thinking');
    }
    const lower = (modelName || '').toLowerCase();
    return lower.includes('r1') || lower.includes('thinking') || lower.includes('reason');
  }
}

module.exports = ModelRegistry;
