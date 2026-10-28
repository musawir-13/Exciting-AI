const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getCompanyRegistry } = require('../engine/companyRegistry');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runCompanyHubTests() {
  console.log('\n--- Running Test Suite 9: AI Company Apps Hub & Provider-Specific Chat System ---');

  const BASE_URL = 'http://localhost:2020';
  const registry = getCompanyRegistry();

  // Test 1: Centralized Company Registry definitions
  console.log('  1. Verifying 26 Company definitions and 210 Model assignments...');
  const companies = registry.getCompanies();
  assert.strictEqual(companies.length, 26, `Expected 26 companies, got ${companies.length}`);

  let totalModels = 0;
  companies.forEach(c => {
    assert(c.id, 'Company missing id');
    assert(c.name, 'Company missing name');
    assert(c.desc, 'Company missing desc');
    assert(c.logo, 'Company missing logo');
    assert(c.modelCount > 0, `Company ${c.name} has 0 models`);
    totalModels += c.modelCount;
  });
  assert.strictEqual(totalModels, 210, `Expected exactly 210 models across companies, got ${totalModels}`);

  // Check specific high-priority company counts
  const compMap = new Map(companies.map(c => [c.id, c]));
  assert.strictEqual(compMap.get('openai').modelCount, 27, 'OpenAI should have 27 models');
  assert.strictEqual(compMap.get('anthropic').modelCount, 22, 'Anthropic should have 22 models');
  assert.strictEqual(compMap.get('google').modelCount, 26, 'Google should have 26 models');
  assert.strictEqual(compMap.get('meta').modelCount, 20, 'Meta should have 20 models');
  assert.strictEqual(compMap.get('deepseek').modelCount, 6, 'DeepSeek should have 6 models');
  console.log('     ✓ All 26 companies & 210 models mapped accurately.');

  // Test 2: Authentic SVG Logos
  console.log('  2. Verifying local vector SVG logos existence & serving...');
  const logosDir = path.join(__dirname, '..', 'public', 'assets', 'logos');
  companies.forEach(c => {
    const filename = `${c.id}.svg`;
    const filepath = path.join(logosDir, filename);
    assert(fs.existsSync(filepath), `Logo file missing: ${filepath}`);
    const svgContent = fs.readFileSync(filepath, 'utf8');
    assert(svgContent.includes('<svg'), `Invalid SVG content in ${filename}`);
  });

  const logoHttp = await get(`${BASE_URL}/assets/logos/openai.svg`);
  assert.strictEqual(logoHttp.status, 200, 'Logo should be served with 200');
  assert(logoHttp.headers['content-type'].includes('svg'), 'Content-Type should be image/svg+xml');
  console.log('     ✓ All 26 local SVG logos exist and are served via HTTP.');

  // Test 3: REST API Endpoints
  console.log('  3. Verifying /api/v1/companies REST endpoints...');
  const compRes = await get(`${BASE_URL}/api/v1/companies`);
  assert.strictEqual(compRes.status, 200);
  assert.strictEqual(compRes.data.companies.length, 26);
  assert(compRes.data.activeCompany, 'Missing activeCompany in response');

  const activeRes = await get(`${BASE_URL}/api/v1/companies/active`);
  assert.strictEqual(activeRes.status, 200);
  assert(activeRes.data.activeCompany.id, 'Missing activeCompany ID');
  console.log('     ✓ /api/v1/companies and /api/v1/companies/active return valid structures.');

  // Test 4: Model Selector Tag Availability
  console.log('  4. Verifying every model is implemented in model selector (/api/tags)...');
  const allTags = await get(`${BASE_URL}/api/tags`);
  assert.strictEqual(allTags.status, 200);
  assert(allTags.data.models.length >= 1900, `Model selector must return all catalog models, got ${allTags.data.models.length}`);
  const hasGpt6Sol = allTags.data.models.some(m => m.name === 'gpt-6-1-sol');
  assert.strictEqual(hasGpt6Sol, true, 'Model selector must contain gpt-6-1-sol');
  console.log('     ✓ /api/tags returns all catalog models for the model selector.');

  // Test 5: Provider-Specific Company Registry Mapping
  console.log('  5. Verifying provider company registry mappings...');
  const reg = getCompanyRegistry();
  const openAiModels = reg.getModelsForCompany('openai');
  assert.strictEqual(openAiModels.length, 27, `OpenAI registry should have 27 models, got ${openAiModels.length}`);
  const anthropicModels = reg.getModelsForCompany('anthropic');
  assert.strictEqual(anthropicModels.length, 22, `Anthropic registry should have 22 models, got ${anthropicModels.length}`);
  const deepseekModels = reg.getModelsForCompany('deepseek');
  assert.strictEqual(deepseekModels.length, 6, `DeepSeek registry should have 6 models, got ${deepseekModels.length}`);
  console.log('     ✓ CompanyRegistry maintains accurate company-specific model mappings.');

  // Test 6: Search & Model Discovery in Company Registry
  console.log('  6. Verifying search and model keyword matching...');
  const companiesWithModels = registry.getCompanies();
  // r1 -> DeepSeek
  const r1Matches = companiesWithModels.filter(c => c.name.toLowerCase().includes('r1') || c.modelNames.some(m => m.includes('r1')));
  assert(r1Matches.some(c => c.id === 'deepseek'), 'Searching r1 should match DeepSeek');

  // sonnet -> Anthropic
  const sonnetMatches = companiesWithModels.filter(c => c.name.toLowerCase().includes('sonnet') || c.modelNames.some(m => m.includes('sonnet')));
  assert(sonnetMatches.some(c => c.id === 'anthropic'), 'Searching sonnet should match Anthropic');

  // gemini -> Google
  const geminiMatches = companiesWithModels.filter(c => c.name.toLowerCase().includes('gemini') || c.modelNames.some(m => m.includes('gemini')));
  assert(geminiMatches.some(c => c.id === 'google'), 'Searching gemini should match Google');

  // flux -> Black Forest Labs
  const fluxMatches = companiesWithModels.filter(c => c.name.toLowerCase().includes('flux') || c.modelNames.some(m => m.includes('flux')));
  assert(fluxMatches.some(c => c.id === 'black-forest-labs'), 'Searching flux should match Black Forest Labs');
  console.log('     ✓ Model keyword matching accurately identifies provider companies.');

  // Test 7: SPA Router Configuration & Launch Flow (Default Chats Screen & Apps Removal)
  console.log('  7. Verifying default chats launch route and clean templates...');
  const bundleContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'index--k3l9yqh.js'), 'utf8');
  assert(bundleContent.includes('throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})}});'), 'SPA router must redirect root / to /c/new (Chats screen)');
  assert(!bundleContent.includes('className:t("apps"),draggable:!1,children:[x.jsx(wq,{className:"h-5 w-5 stroke-current"}),x.jsx("span",{className:"truncate",children:"Apps"})]'), 'Apps button must be removed from sidebar');

  const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert(!indexHtml.includes('company-apps-hub-view'), 'index.html must not contain company-apps-hub-view');
  console.log('     ✓ SPA launch redirects to /c/new and Apps button/features are completely removed.');

  // Reset active company to openai
  await post(`${BASE_URL}/api/v1/companies/select`, { company: 'openai' });
  console.log('     ✓ Reset active company to OpenAI complete.');

  console.log('--- Test Suite 9 Passed Successfully! ---\n');
}

if (require.main === module) {
  runCompanyHubTests().catch(err => {
    console.error('Test Suite 9 Failed:', err);
    process.exit(1);
  });
}

module.exports = { runCompanyHubTests };
