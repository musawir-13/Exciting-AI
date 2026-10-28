const fs = require('fs');
const path = require('path');

function sanitizeFilename(str) {
  return str
    .toLowerCase()
    .replace(/\+/g, '-plus')
    .replace(/[\(\)\[\]\{\}]/g, ' ')
    .replace(/[:\/\\|?*"<>]/g, '-')
    .replace(/[\s_.]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchModels() {
  console.log('========================================================');
  console.log('  EXCITING AI — MODEL HARVESTER & REGISTRY SYNC');
  console.log('  Sources: OpenRouter (https://openrouter.ai/models)');
  console.log('           Poe (https://poe.com/api/models)');
  console.log('========================================================\n');

  const storageDir = path.join(__dirname, '..', 'Storage');
  const modelsDir = path.join(storageDir, 'models');
  const catalogPath = path.join(modelsDir, 'catalog.json');
  const descriptorsDir = path.join(modelsDir, 'descriptors');
  const rawOrPath = path.join(modelsDir, 'raw_openrouter_models.json');
  const rawPoePath = path.join(modelsDir, 'raw_poe_models.json');

  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  // 1. Read existing catalog if present
  let existingCatalog = [];
  if (fs.existsSync(catalogPath)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      console.log(`[INFO] Loaded ${existingCatalog.length} existing models from catalog.json.`);
    } catch (e) {
      console.warn('[WARN] Could not parse existing catalog.json:', e.message);
    }
  }

  // 2. Fetch OpenRouter models for free
  console.log('\n[FETCH] Fetching models from OpenRouter (https://openrouter.ai/models)...');
  let orModels = [];
  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Exciting-AI/1.0.0 (https://github.com/musawir-13)'
      }
    });
    if (!orRes.ok) throw new Error(`HTTP ${orRes.status}: ${orRes.statusText}`);
    const orJson = await orRes.json();
    orModels = orJson.data || [];
    console.log(`[SUCCESS] Extracted ${orModels.length} models from OpenRouter without errors.`);
    fs.writeFileSync(rawOrPath, JSON.stringify(orModels, null, 2), 'utf8');
    console.log(`[SAVED] Raw OpenRouter data saved to: ${rawOrPath}`);
  } catch (err) {
    console.error('[ERROR] Failed fetching OpenRouter models:', err.message);
    if (fs.existsSync(rawOrPath)) {
      console.log('[FALLBACK] Using existing raw_openrouter_models.json cache.');
      orModels = JSON.parse(fs.readFileSync(rawOrPath, 'utf8'));
    }
  }

  // 3. Fetch Poe models for free
  console.log('\n[FETCH] Fetching models from Poe (https://poe.com/api/models)...');
  let poeModels = [];
  try {
    const poeRes = await fetch('https://api.poe.com/v1/models', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Exciting-AI/1.0.0 (https://github.com/musawir-13)'
      }
    });
    if (!poeRes.ok) throw new Error(`HTTP ${poeRes.status}: ${poeRes.statusText}`);
    const poeJson = await poeRes.json();
    poeModels = poeJson.data || [];
    console.log(`[SUCCESS] Extracted ${poeModels.length} models from Poe without errors.`);
    fs.writeFileSync(rawPoePath, JSON.stringify(poeModels, null, 2), 'utf8');
    console.log(`[SAVED] Raw Poe data saved to: ${rawPoePath}`);
  } catch (err) {
    console.error('[ERROR] Failed fetching Poe models:', err.message);
    if (fs.existsSync(rawPoePath)) {
      console.log('[FALLBACK] Using existing raw_poe_models.json cache.');
      poeModels = JSON.parse(fs.readFileSync(rawPoePath, 'utf8'));
    }
  }

  // 4. Merge catalogs while preserving existing models
  console.log('\n[MERGE] Merging models with existing catalog...');
  const usedNames = new Set();
  const finalCatalog = [];

  // Step 4a: Keep all existing models intact
  for (const item of existingCatalog) {
    const key = (item.name || '').toLowerCase().trim();
    if (key) usedNames.add(key);
    finalCatalog.push(item);
  }

  // Step 4b: Integrate Poe models
  let addedPoe = 0;
  for (const pm of poeModels) {
    const baseSlug = sanitizeFilename(pm.id || pm.metadata?.display_name || 'poe-model');
    let candidateName = baseSlug;
    if (usedNames.has(candidateName)) {
      candidateName = `poe-${baseSlug}`;
    }
    let counter = 1;
    while (usedNames.has(candidateName)) {
      candidateName = `poe-${baseSlug}-${counter++}`;
    }
    usedNames.add(candidateName);

    const capabilities = ['completion', 'cloud'];
    if (pm.reasoning && (pm.reasoning.required || pm.reasoning.supports_reasoning_effort)) {
      capabilities.push('thinking');
    }
    const modalities = pm.architecture?.input_modalities || [];
    if (modalities.includes('image') || modalities.includes('video') || modalities.includes('vision')) {
      capabilities.push('vision');
    }
    if (pm.supported_features && pm.supported_features.includes('tools')) {
      capabilities.push('tools');
    }

    const contextLen = pm.context_length || pm.context_window?.context_length || 4096;
    const ctxK = Math.round(contextLen / 1000) + 'k';
    const owner = pm.owned_by || 'Poe';

    const normalized = {
      name: candidateName,
      model: pm.id || candidateName,
      display_name: pm.metadata?.display_name || pm.id,
      modified_at: new Date().toISOString(),
      size: 0,
      digest: 'poe-' + candidateName,
      details: {
        parent_model: pm.metadata?.display_name || pm.id,
        format: 'poe',
        family: owner.toLowerCase().replace(/[^a-z0-9]/g, ''),
        families: [owner.toLowerCase().replace(/[^a-z0-9]/g, ''), 'cloud', 'poe'],
        parameter_size: 'POE API',
        quantization_level: 'cloud',
        context_window: ctxK
      },
      capabilities,
      description: pm.description || `Poe AI model ${pm.metadata?.display_name || pm.id} provided by ${owner}.`,
      context_length: contextLen,
      metadata: {
        display_name: pm.metadata?.display_name || pm.id,
        owner: owner,
        category: owner,
        url: pm.metadata?.url || `https://poe.com/${pm.id}`,
        pricing: pm.pricing || null,
        icon_url: pm.metadata?.image?.url || null
      }
    };
    finalCatalog.push(normalized);
    addedPoe++;
  }

  // Step 4c: Integrate OpenRouter models
  let addedOr = 0;
  for (const om of orModels) {
    const rawId = om.id || '';
    const cleanId = sanitizeFilename(rawId.replace('/', '-'));
    let candidateName = cleanId;
    if (usedNames.has(candidateName)) {
      candidateName = `openrouter-${cleanId}`;
    }
    let counter = 1;
    while (usedNames.has(candidateName)) {
      candidateName = `openrouter-${cleanId}-${counter++}`;
    }
    usedNames.add(candidateName);

    const capabilities = ['completion', 'cloud'];
    if (om.reasoning && (om.reasoning.mandatory || om.reasoning.default_enabled || om.supported_parameters?.includes('reasoning'))) {
      capabilities.push('thinking');
    }
    const inputMods = om.architecture?.input_modalities || [];
    if (inputMods.includes('image') || inputMods.includes('video') || (om.architecture?.modality && om.architecture.modality.includes('image'))) {
      capabilities.push('vision');
    }
    if (om.supported_parameters?.includes('tools') || om.supported_parameters?.includes('tool_choice')) {
      capabilities.push('tools');
    }

    const contextLen = om.context_length || om.top_provider?.context_length || 4096;
    const ctxK = Math.round(contextLen / 1000) + 'k';
    const providerParts = rawId.split('/');
    const provider = providerParts.length > 1 ? providerParts[0] : 'openrouter';

    const normalized = {
      name: candidateName,
      model: om.id,
      display_name: om.name || rawId,
      modified_at: new Date().toISOString(),
      size: 0,
      digest: 'openrouter-' + candidateName,
      details: {
        parent_model: om.name || rawId,
        format: 'openrouter',
        family: provider.toLowerCase().replace(/[^a-z0-9]/g, ''),
        families: [provider.toLowerCase().replace(/[^a-z0-9]/g, ''), 'cloud', 'openrouter'],
        parameter_size: 'OpenRouter API',
        quantization_level: 'cloud',
        context_window: ctxK
      },
      capabilities,
      description: om.description || `OpenRouter model ${om.name || rawId}.`,
      context_length: contextLen,
      metadata: {
        display_name: om.name || rawId,
        owner: provider,
        category: provider,
        url: `https://openrouter.ai/models/${om.id}`,
        pricing: om.pricing || null,
        top_provider: om.top_provider || null
      }
    };
    finalCatalog.push(normalized);
    addedOr++;
  }

  // 5. Write merged catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
  console.log(`[SUCCESS] Wrote unified catalog with ${finalCatalog.length} models to: ${catalogPath}`);
  console.log(`          - Existing preserved: ${existingCatalog.length}`);
  console.log(`          - Poe added:          ${addedPoe}`);
  console.log(`          - OpenRouter added:   ${addedOr}`);

  // 6. Generate individual descriptors in Storage/models/descriptors/
  if (fs.existsSync(descriptorsDir)) {
    const existingDescriptors = fs.readdirSync(descriptorsDir);
    for (const f of existingDescriptors) {
      try { fs.unlinkSync(path.join(descriptorsDir, f)); } catch (_) {}
    }
  } else {
    fs.mkdirSync(descriptorsDir, { recursive: true });
  }

  let descWritten = 0;
  for (const m of finalCatalog) {
    const descPath = path.join(descriptorsDir, `${m.name}.json`);
    fs.writeFileSync(descPath, JSON.stringify(m, null, 2), 'utf8');
    descWritten++;
  }
  console.log(`[SUCCESS] Wrote ${descWritten} descriptor files to: ${descriptorsDir}`);

  // 7. Verification: check duplicates
  const checkNames = new Set();
  const duplicates = [];
  finalCatalog.forEach(m => {
    const clean = (m.name || '').toLowerCase().trim();
    if (checkNames.has(clean)) duplicates.push(clean);
    checkNames.add(clean);
  });

  if (duplicates.length === 0) {
    console.log(`\n[VERIFICATION] PASS: All ${finalCatalog.length} models have 100% unique names.`);
  } else {
    console.error(`\n[VERIFICATION] FAIL: Found duplicates: ${duplicates.join(', ')}`);
    process.exit(1);
  }

  console.log('\n========================================================');
  console.log('  MODEL EXTRACTION AND SYNC COMPLETED SUCCESSFULLY!');
  console.log('========================================================');
}

if (require.main === module) {
  fetchModels().catch(err => {
    console.error('Fatal fetchModels failure:', err);
    process.exit(1);
  });
}

module.exports = { fetchModels };
