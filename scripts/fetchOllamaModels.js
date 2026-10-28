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

function inferOwnerAndFamily(slug, title, desc) {
  const text = `${slug} ${title} ${desc}`.toLowerCase();
  
  if (text.includes('meta') || text.includes('llama') || text.includes('codellama')) {
    return { owner: 'Meta AI', family: 'meta' };
  }
  if (text.includes('google') || text.includes('gemma') || text.includes('embeddinggemma')) {
    return { owner: 'Google DeepMind', family: 'google' };
  }
  if (text.includes('qwen') || text.includes('alibaba')) {
    return { owner: 'Alibaba Cloud', family: 'alibaba' };
  }
  if (text.includes('mistral') || text.includes('codestral') || text.includes('mixtral')) {
    return { owner: 'Mistral AI', family: 'mistral' };
  }
  if (text.includes('deepseek')) {
    return { owner: 'DeepSeek', family: 'deepseek' };
  }
  if (text.includes('microsoft') || text.includes('phi')) {
    return { owner: 'Microsoft', family: 'microsoft' };
  }
  if (text.includes('nvidia') || text.includes('nemotron')) {
    return { owner: 'NVIDIA', family: 'nvidia' };
  }
  if (text.includes('minimax')) {
    return { owner: 'MiniMax', family: 'minimax' };
  }
  if (text.includes('moonshot') || text.includes('kimi')) {
    return { owner: 'Moonshot AI', family: 'moonshot' };
  }
  if (text.includes('zhipu') || text.includes('glm')) {
    return { owner: 'Zhipu AI', family: 'zhipu' };
  }
  if (text.includes('nous') || text.includes('hermes')) {
    return { owner: 'Nous Research', family: 'nous' };
  }
  if (text.includes('ibm') || text.includes('granite')) {
    return { owner: 'IBM Granite', family: 'ibm' };
  }
  if (text.includes('cohere') || text.includes('command')) {
    return { owner: 'Cohere', family: 'cohere' };
  }
  if (text.includes('liquid') || text.includes('lfm')) {
    return { owner: 'Liquid AI', family: 'liquid' };
  }
  if (text.includes('cloudflare') || text.includes('clef')) {
    return { owner: 'Cloudflare', family: 'cloudflare' };
  }
  if (text.includes('prism ml') || text.includes('bonsai')) {
    return { owner: 'Prism ML', family: 'prism-ml' };
  }
  if (text.includes('recursive') || text.includes('flint')) {
    return { owner: 'Recursive', family: 'recursive' };
  }

  return { owner: 'Ollama Community', family: 'ollama' };
}

function parseContextWindow(desc, capabilities) {
  if (desc.includes('1M') || desc.includes('1 million') || desc.includes('1000k')) return 1000000;
  if (desc.includes('128k') || desc.includes('128,000')) return 128000;
  if (desc.includes('64k')) return 64000;
  if (desc.includes('32k') || desc.includes('32,768')) return 32768;
  if (capabilities.includes('embedding')) return 8192;
  return 32768;
}

function formatDisplayName(slug, size = '', isCloud = false) {
  const parts = slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  let baseName = parts.join(' ');
  
  if (slug.toLowerCase().startsWith('glm-')) baseName = slug.toUpperCase();
  else if (slug.toLowerCase().startsWith('lfm3')) baseName = slug.toUpperCase().replace('LFM3', 'LFM-3');
  else if (slug.toLowerCase().startsWith('d3')) baseName = 'D3';
  else if (slug.toLowerCase().startsWith('d1')) baseName = 'D1';
  
  if (size) {
    const sizeStr = size.toUpperCase();
    return `${baseName} (${sizeStr}) [${isCloud ? 'Cloud' : 'Local'}]`;
  }
  return `${baseName} [${isCloud ? 'Cloud' : 'Local'}]`;
}

async function fetchOllamaModels() {
  console.log('========================================================');
  console.log('  EXCITING AI — OLLAMA MODELS HARVESTER');
  console.log('  Sources: https://ollama.com/search?c=local');
  console.log('           https://ollama.com/search?c=cloud');
  console.log('========================================================\n');

  const storageDir = path.join(__dirname, '..', 'Storage');
  const modelsDir = path.join(storageDir, 'models');
  const catalogPath = path.join(modelsDir, 'catalog.json');
  const descriptorsDir = path.join(modelsDir, 'descriptors');
  const rawOllamaPath = path.join(modelsDir, 'raw_ollama_models.json');

  if (!fs.existsSync(descriptorsDir)) {
    fs.mkdirSync(descriptorsDir, { recursive: true });
  }

  // 1. Read existing catalog
  let existingCatalog = [];
  if (fs.existsSync(catalogPath)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      console.log(`[INFO] Loaded ${existingCatalog.length} existing models from catalog.json.`);
    } catch (e) {
      console.warn('[WARN] Could not parse existing catalog.json:', e.message);
    }
  }

  // 2. Crawl Ollama Search (Local & Cloud)
  const categories = ['local', 'cloud'];
  const baseModels = new Map();

  for (const c of categories) {
    console.log(`\n[FETCH] Harvesting Ollama category: c=${c}...`);
    let page = 1;
    let keepGoing = true;

    while (keepGoing) {
      const url = `https://ollama.com/search?c=${c}&page=${page}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'HX-Request': 'true',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        if (!res.ok) {
          console.log(`  [PAGE] Page ${page} responded HTTP ${res.status}. Finished.`);
          break;
        }

        const html = await res.text();
        const cardRegex = /<li[\s\S]*?<\/li>/gi;
        let match;
        let countThisPage = 0;

        while ((match = cardRegex.exec(html)) !== null) {
          const cardHtml = match[0];
          const hrefMatch = cardHtml.match(/href="\/library\/([^"/]+)"/);
          if (!hrefMatch) continue;

          const slug = hrefMatch[1].trim();
          countThisPage++;

          // Extract title
          const titleMatch = cardHtml.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i);
          const title = titleMatch ? titleMatch[1].trim() : slug;

          // Extract description
          const descMatch = cardHtml.match(/<p class="[^"]*text-black[^"]*">([^<]+)<\/p>/i);
          const desc = descMatch ? descMatch[1].trim() : '';

          // Extract capability badges (indigo badges: tools, thinking, vision, audio, decision, embedding)
          const capRegex = /text-indigo-600[^>]*>([^<]+)<\/span>/gi;
          const capabilities = ['completion'];
          let capMatch;
          while ((capMatch = capRegex.exec(cardHtml)) !== null) {
            const cap = capMatch[1].trim().toLowerCase();
            if (!capabilities.includes(cap)) capabilities.push(cap);
          }
          if (c === 'cloud' && !capabilities.includes('cloud')) {
            capabilities.push('cloud');
          }

          // Extract size badges (blue badges: e.g. 1.7b, 2b, 4b, 8b, 14b, 27b, 70b, 270m)
          const sizeRegex = /text-blue-600[^>]*>([^<]+)<\/span>/gi;
          const sizes = [];
          let sizeMatch;
          while ((sizeMatch = sizeRegex.exec(cardHtml)) !== null) {
            const sz = sizeMatch[1].trim().toLowerCase();
            if (!sizes.includes(sz)) sizes.push(sz);
          }

          if (!baseModels.has(slug)) {
            baseModels.set(slug, {
              slug,
              title,
              desc,
              capabilities,
              sizes,
              category: c
            });
          } else {
            const existing = baseModels.get(slug);
            for (const s of sizes) if (!existing.sizes.includes(s)) existing.sizes.push(s);
            for (const cap of capabilities) if (!existing.capabilities.includes(cap)) existing.capabilities.push(cap);
          }
        }

        console.log(`  [PAGE] Page ${page}: extracted ${countThisPage} cards. Total collected so far: ${baseModels.size}`);

        const hasNextPage = html.includes(`page=${page + 1}`);
        if (!hasNextPage || countThisPage === 0) {
          keepGoing = false;
        } else {
          page++;
        }
      } catch (err) {
        console.error(`  [ERROR] Page ${page} error:`, err.message);
        break;
      }
    }
  }

  const rawOllamaList = [...baseModels.values()];
  console.log(`\n[SUCCESS] Extracted ${rawOllamaList.length} base models from Ollama search without errors.`);
  fs.writeFileSync(rawOllamaPath, JSON.stringify(rawOllamaList, null, 2), 'utf8');
  console.log(`[SAVED] Raw Ollama scraped data saved to: ${rawOllamaPath}`);

  // 3. Expand base models into specific type/size variants
  console.log('\n[EXPAND] Expanding models and size variants (7b, 8b, 14b, etc.)...');
  const nowIso = new Date().toISOString();
  const generatedOllamaModels = [];

  for (const item of rawOllamaList) {
    const isCloud = item.category === 'cloud';
    const { owner, family } = inferOwnerAndFamily(item.slug, item.title, item.desc);
    const contextLen = parseContextWindow(item.desc, item.capabilities);

    // Primary/base model entry
    const baseModelObj = {
      name: `${item.slug}:latest`,
      model: `${item.slug}:latest`,
      display_name: formatDisplayName(item.slug, '', isCloud),
      modified_at: nowIso,
      size: 0,
      digest: `ollama-${item.slug}-latest`,
      details: {
        parent_model: item.title,
        format: 'ollama',
        family,
        families: [family, item.category, 'ollama'],
        parameter_size: item.sizes.length > 0 ? item.sizes[0].toUpperCase() : 'Standard',
        quantization_level: isCloud ? 'cloud' : 'Q4_K_M',
        context_window: `${Math.round(contextLen / 1000)}k`
      },
      capabilities: item.capabilities,
      description: item.desc || `Ollama ${isCloud ? 'cloud' : 'local'} model: ${item.title}.`,
      context_length: contextLen,
      metadata: {
        display_name: formatDisplayName(item.slug, '', isCloud),
        owner,
        category: isCloud ? 'Ollama Cloud' : 'Ollama Local',
        url: `https://ollama.com/library/${item.slug}`,
        pricing: { prompt: "0", completion: "0" }
      }
    };
    generatedOllamaModels.push(baseModelObj);

    // Also add unversioned alias entry e.g. "llama3.2" -> "llama3.2:latest"
    const aliasObj = {
      ...baseModelObj,
      name: item.slug,
      model: item.slug,
      digest: `ollama-${item.slug}`
    };
    generatedOllamaModels.push(aliasObj);

    // If model has distinct sizes (e.g. 7b, 8b, 14b, 27b, 70b), add each size variant
    for (const size of item.sizes) {
      const sizeSlug = `${item.slug}:${size}`;
      const sizeObj = {
        name: sizeSlug,
        model: sizeSlug,
        display_name: formatDisplayName(item.slug, size, isCloud),
        modified_at: nowIso,
        size: 0,
        digest: `ollama-${item.slug}-${size}`,
        details: {
          parent_model: item.title,
          format: 'ollama',
          family,
          families: [family, item.category, 'ollama', size],
          parameter_size: size.toUpperCase(),
          quantization_level: isCloud ? 'cloud' : 'Q4_K_M',
          context_window: `${Math.round(contextLen / 1000)}k`
        },
        capabilities: item.capabilities,
        description: item.desc || `Ollama model variant (${size.toUpperCase()}): ${item.title}.`,
        context_length: contextLen,
        metadata: {
          display_name: formatDisplayName(item.slug, size, isCloud),
          owner,
          category: isCloud ? 'Ollama Cloud' : 'Ollama Local',
          url: `https://ollama.com/library/${item.slug}`,
          pricing: { prompt: "0", completion: "0" }
        }
      };
      generatedOllamaModels.push(sizeObj);
    }
  }

  console.log(`[GENERATED] Generated ${generatedOllamaModels.length} Ollama model entries (including types & size variants).`);

  // 4. Merge with existing catalog while strictly preserving existing models
  console.log('\n[MERGE] Merging with existing catalog...');
  const usedKeys = new Set();
  const finalCatalog = [];

  // Step 4a: Retain all existing models
  for (const m of existingCatalog) {
    const key = (m.name || m.model || '').toLowerCase().trim();
    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      finalCatalog.push(m);
    }
  }
  const existingCount = finalCatalog.length;
  console.log(`[RETAINED] Preserved ${existingCount} existing models.`);

  // Step 4b: Append new Ollama models
  let addedCount = 0;
  for (const m of generatedOllamaModels) {
    const key = (m.name || m.model || '').toLowerCase().trim();
    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      finalCatalog.push(m);
      addedCount++;
    }
  }
  console.log(`[ADDED] Appended ${addedCount} new Ollama models.`);
  console.log(`[TOTAL] Total catalog model count is now: ${finalCatalog.length}`);

  // 5. Save updated catalog.json
  fs.writeFileSync(catalogPath, JSON.stringify(finalCatalog, null, 2), 'utf8');
  console.log(`\n[SAVED] Updated catalog saved to: ${catalogPath}`);

  // 6. Save individual descriptor files
  console.log(`[DESCRIPTORS] Writing descriptors to: ${descriptorsDir}...`);
  let descWritten = 0;
  for (const m of generatedOllamaModels) {
    const filename = sanitizeFilename(m.name || m.model) + '.json';
    const filePath = path.join(descriptorsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(m, null, 2), 'utf8');
    descWritten++;
  }
  console.log(`[DESCRIPTORS] Wrote ${descWritten} descriptor JSON files.`);

  console.log('\n========================================================');
  console.log('  OLLAMA EXTRACTION & STORAGE SYNC COMPLETE!');
  console.log(`  Existing models preserved: ${existingCount}`);
  console.log(`  New Ollama models added:   ${addedCount}`);
  console.log(`  New Total catalog count:   ${finalCatalog.length}`);
  console.log('========================================================\n');
}

if (require.main === module) {
  fetchOllamaModels().catch(err => {
    console.error('Fatal error during Ollama model fetch:', err);
    process.exit(1);
  });
}

module.exports = { fetchOllamaModels };
