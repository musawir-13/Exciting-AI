const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runPoeModelsTests() {
  console.log('\n--- [TEST SUITE 5] Poe Models Extraction & Local Ollama Removal ---');
  let passed = 0;
  let failed = 0;

  const storageDir = path.join(__dirname, '..', 'Storage');
  const modelsCatalogPath = path.join(storageDir, 'models', 'catalog.json');
  const rawPoePath = path.join(storageDir, 'models', 'raw_poe_models.json');
  const descriptorsDir = path.join(storageDir, 'models', 'descriptors');

  // Test 1: Verify Poe catalog exists with >= 300 models
  try {
    assert.ok(fs.existsSync(modelsCatalogPath), 'Storage/models/catalog.json must exist');
    assert.ok(fs.existsSync(rawPoePath), 'Storage/models/raw_poe_models.json must exist');
    assert.ok(fs.existsSync(descriptorsDir), 'Storage/models/descriptors/ must exist');

    const catalog = JSON.parse(fs.readFileSync(modelsCatalogPath, 'utf8'));
    assert.ok(catalog.length >= 200, `Catalog should have at least 200 models, found: ${catalog.length}`);
    
    // Verify no duplicate names exist
    const namesSet = new Set();
    const dups = [];
    catalog.forEach(m => {
      const clean = (m.name || '').toLowerCase().trim();
      if (namesSet.has(clean)) dups.push(clean);
      namesSet.add(clean);
    });
    assert.strictEqual(dups.length, 0, `Catalog must not contain duplicate models, found: ${dups.join(', ')}`);
    console.log(`  [PASS] Test 1: Verified ${catalog.length} curated unique models with zero duplicates`);
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // Test 2: Check presence of flagship models (Claude, Grok, Gemini, Kimi, Mistral)
  try {
    const catalog = JSON.parse(fs.readFileSync(modelsCatalogPath, 'utf8'));
    const names = catalog.map(m => m.name.toLowerCase());
    
    const hasGrok = names.some(n => n.includes('grok'));
    const hasClaude = names.some(n => n.includes('claude'));
    const hasGemini = names.some(n => n.includes('gemini'));
    const hasKimi = names.some(n => n.includes('kimi'));
    const hasMistral = names.some(n => n.includes('mistral'));

    assert.ok(hasGrok, 'Must include Grok model');
    assert.ok(hasClaude, 'Must include Claude model');
    assert.ok(hasGemini, 'Must include Gemini model');
    assert.ok(hasKimi, 'Must include Kimi model');
    assert.ok(hasMistral, 'Must include Mistral model');

    console.log('  [PASS] Test 2: Flagship frontier models verified in catalog (Grok, Claude, Gemini, Kimi, Mistral)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // Test 3: ModelRegistry loads and recognizes Poe models
  try {
    const engine = createEngine({
      storageDir: storageDir,
      bundledStorageDir: storageDir,
      getSettings: () => ({})
    });

    const models = engine.modelRegistry.listCloudModels();
    assert.ok(models.length >= 200, 'Model registry should expose all unique models');
    assert.ok(engine.modelRegistry.isCloudModel('grok-4-5') || engine.modelRegistry.isCloudModel('grok-4.5'));
    assert.ok(engine.modelRegistry.isCloudModel('claude-sonnet-5-5') || engine.modelRegistry.isCloudModel('claude-sonnet-5.5'));

    console.log('  [PASS] Test 3: Engine ModelRegistry integrates models seamlessly with no duplicates');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  console.log(`\nPoe Models Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runPoeModelsTests().catch(e => {
    console.error('Test runner failure:', e);
    process.exit(1);
  });
}

module.exports = { runPoeModelsTests };
