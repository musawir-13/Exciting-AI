const path = require('path');
const ModelRegistry = require('./modelRegistry');
const { ConversationManager, SYSTEM_INSTRUCTION } = require('./conversationManager');
const InferenceRouter = require('./inferenceRouter');
const diagnostics = require('./diagnostics');
const identity = require('./identity');
const { CompanyRegistry, getCompanyRegistry } = require('./companyRegistry');
const { WebResearchEngine, getWebResearchEngine } = require('./webResearch');

function createEngine({ storageDir, bundledStorageDir, getSettings }) {
  const modelRegistry = new ModelRegistry(storageDir, bundledStorageDir);
  const conversationManager = new ConversationManager(storageDir);
  const companyRegistry = getCompanyRegistry(storageDir);
  const webResearch = getWebResearchEngine();
  const inferenceRouter = new InferenceRouter({ modelRegistry, getSettings, webResearch });

  return {
    modelRegistry,
    conversationManager,
    companyRegistry,
    inferenceRouter,
    webResearch,
    diagnostics,
    identity,
    SYSTEM_INSTRUCTION
  };
}

module.exports = {
  createEngine,
  ModelRegistry,
  ConversationManager,
  CompanyRegistry,
  getCompanyRegistry,
  InferenceRouter,
  WebResearchEngine,
  getWebResearchEngine,
  diagnostics,
  identity,
  SYSTEM_INSTRUCTION
};
