const { runMessagePipelineTests } = require('./messagePipeline.test');
const { runProviderRoutingTests } = require('./providerRouting.test');
const { runNaturalVariationTests } = require('./naturalVariation.test');
const { runConversationMemoryTests } = require('./conversationMemory.test');
const { runPoeModelsTests } = require('./poeModels.test');
const { runIdentityAccuracyTests } = require('./identityAccuracy.test');
const { runNaturalConversationTests } = require('./naturalConversation.test');
const { runConversationalSystemTests } = require('./conversationalSystem.test');
const { runCompanyHubTests } = require('./companyHub.test');
const { runEnhancedFilesAndChatDefaultTests } = require('./enhancedFilesAndChatDefault.test');
const { runIdevAndModelIdentityTests } = require('./idevAndModelIdentity.test');
const { runWebResearchTests } = require('./webResearch.test');

async function runAll() {
  console.log('========================================================');
  console.log('  EXCITING AI — AUTOMATED MASTER TEST SUITE');
  console.log('========================================================');

  const startTime = Date.now();

  try {
    await runMessagePipelineTests();
    await runProviderRoutingTests();
    await runNaturalVariationTests();
    await runConversationMemoryTests();
    await runPoeModelsTests();
    await runIdentityAccuracyTests();
    await runNaturalConversationTests();
    await runConversationalSystemTests();
    await runCompanyHubTests();
    await runEnhancedFilesAndChatDefaultTests();
    await runIdevAndModelIdentityTests();
    await runWebResearchTests();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('========================================================');
    console.log(`  ALL 12 TEST SUITES PASSED SUCCESSFULLY IN ${elapsed}s!`);
    console.log('========================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\nTEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runAll();
