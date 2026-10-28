const assert = require('assert');
const { getModelIdentity, buildSystemPrompt, generateResponse, OFFICIAL_IDENTITY } = require('../engine/identity');
const fs = require('fs');
const path = require('path');

async function runIdevAndModelIdentityTests() {
  console.log('\n--- Running Test Suite: IDeV Knowledge & Model Identity Sync ---');

  // 1. Verify Model Identity for gpt-6-1-sol
  console.log('1. Verifying model identity for gpt-6-1-sol...');
  const gpt6SolInfo = getModelIdentity('gpt-6-1-sol');
  assert.strictEqual(gpt6SolInfo.displayName, 'GPT-6.1 Sol', 'Model name should be GPT-6.1 Sol');
  assert.strictEqual(gpt6SolInfo.provider, 'OpenAI', 'Provider should be OpenAI');

  const gpt6SolPrompt = buildSystemPrompt('gpt-6-1-sol');
  assert(gpt6SolPrompt.includes('GPT-6.1 Sol'), 'System prompt must identify as GPT-6.1 Sol');
  assert(gpt6SolPrompt.includes('OpenAI'), 'System prompt must identify OpenAI as provider');
  assert(!gpt6SolPrompt.includes('GPT-6 Astra'), 'System prompt must NOT contain GPT-6 Astra alias');

  const gpt6SolWhoAreYou = generateResponse('who are you?', [], 'test_chat_1', 'gpt-6-1-sol');
  assert(gpt6SolWhoAreYou.includes('GPT-6.1 Sol'), 'Response must identify as GPT-6.1 Sol');
  assert(gpt6SolWhoAreYou.includes('OpenAI'), 'Response must identify OpenAI');
  assert(!gpt6SolWhoAreYou.includes('GPT-6 Astra'), 'Response must NOT contain GPT-6 Astra');
  console.log('   ✓ gpt-6-1-sol correctly identifies as GPT-6.1 Sol from OpenAI');

  // 2. Verify Claude model identity (no stale GPT instructions)
  console.log('2. Verifying Claude model identity...');
  const claudeInfo = getModelIdentity('claude-3-7-sonnet');
  assert.strictEqual(claudeInfo.provider, 'Anthropic', 'Provider must be Anthropic');
  const claudePrompt = buildSystemPrompt('claude-3-7-sonnet');
  assert(claudePrompt.includes('Anthropic'), 'Claude system prompt must include Anthropic');
  assert(!claudePrompt.includes('developed by OpenAI'), 'Claude system prompt must not claim developed by OpenAI');

  const claudeWhoAreYou = generateResponse('who are you?', [], 'test_chat_claude', 'claude-3-7-sonnet');
  assert(claudeWhoAreYou.includes('Anthropic'), 'Claude response must identify Anthropic');
  assert(!claudeWhoAreYou.includes('OpenAI'), 'Claude response must not identify OpenAI');
  console.log('   ✓ Claude model identity accurately references Anthropic without OpenAI leak');

  // 3. Verify Gemini model identity (no stale Claude/GPT instructions)
  console.log('3. Verifying Gemini model identity...');
  const geminiInfo = getModelIdentity('gemini-2.5-pro');
  assert.strictEqual(geminiInfo.provider, 'Google DeepMind', 'Provider must be Google DeepMind');
  const geminiPrompt = buildSystemPrompt('gemini-2.5-pro');
  assert(geminiPrompt.includes('Google DeepMind'), 'Gemini system prompt must include Google DeepMind');
  assert(!geminiPrompt.includes('developed by OpenAI'), 'Gemini prompt must not claim OpenAI');
  assert(!geminiPrompt.includes('developed by Anthropic'), 'Gemini prompt must not claim Anthropic');

  const geminiWhoAreYou = generateResponse('who are you?', [], 'test_chat_gemini', 'gemini-2.5-pro');
  assert(geminiWhoAreYou.includes('Google DeepMind'), 'Gemini response must identify Google DeepMind');
  console.log('   ✓ Gemini model identity accurately references Google DeepMind');

  // 4. Verify Provider Switching dynamically updates context
  console.log('4. Verifying provider switching dynamic context...');
  const modelsToTest = [
    { id: 'llama-3.3-70b', expectedName: 'Llama-3.3-70B', expectedProvider: 'Meta AI' },
    { id: 'deepseek-r1', expectedName: 'DeepSeek R1', expectedProvider: 'DeepSeek' },
    { id: 'mistral-large-2411', expectedName: 'Mistral Large (2411)', expectedProvider: 'Mistral AI' },
    { id: 'grok-4.7', expectedName: 'Grok 4.7', expectedProvider: 'xAI' }
  ];
  for (const m of modelsToTest) {
    const info = getModelIdentity(m.id);
    assert.strictEqual(info.provider, m.expectedProvider, `Model ${m.id} provider mismatch`);
    const resp = generateResponse('who are you?', [], `chat_${m.id}`, m.id);
    assert(resp.includes(info.displayName), `Response for ${m.id} must include ${info.displayName}`);
    assert(resp.includes(m.expectedProvider), `Response for ${m.id} must include ${m.expectedProvider}`);
  }
  console.log('   ✓ Dynamic provider switching updates context cleanly across all frontier families');

  // 5. "What is IDeV?"
  console.log('5. Verifying "What is IDeV?"...');
  const idevResp = generateResponse('what is idev?', [], 'test_idev_1', 'gpt-6-1-sol');
  assert(idevResp.includes('IDeV'), 'Must mention IDeV');
  assert(idevResp.includes('Exciting AI'), 'Must mention Exciting AI');
  assert(idevResp.includes('Ubaid'), 'Must mention Ubaid');
  console.log('   ✓ "What is IDeV?" correctly explains IDeV is the company behind Exciting AI, built by Ubaid');

  // 6. "Who built Exciting AI?"
  console.log('6. Verifying "Who built Exciting AI?"...');
  const builtAppResp = generateResponse('who built exciting ai?', [], 'test_idev_2', 'gpt-6-1-sol');
  assert(builtAppResp.includes('IDeV'), 'Must mention IDeV');
  assert(builtAppResp.includes('Ubaid'), 'Must mention Ubaid');
  assert(builtAppResp.includes(OFFICIAL_IDENTITY.GITHUB), 'Must include official GitHub link');
  console.log('   ✓ "Who built Exciting AI?" correctly credits IDeV and developer Ubaid with official GitHub link');

  // 7. "Who is Ubaid?"
  console.log('7. Verifying "Who is Ubaid?"...');
  const whoUbaidResp = generateResponse('who is ubaid?', [], 'test_idev_3', 'gpt-6-1-sol');
  assert(whoUbaidResp.includes('Ubaid'), 'Must mention Ubaid');
  assert(whoUbaidResp.includes('IDeV'), 'Must mention IDeV');
  assert(whoUbaidResp.includes(OFFICIAL_IDENTITY.GITHUB), 'Must include GitHub');
  assert(whoUbaidResp.includes(OFFICIAL_IDENTITY.INSTAGRAM), 'Must include Instagram');
  console.log('   ✓ "Who is Ubaid?" correctly identifies Ubaid as developer behind IDeV with GitHub and Instagram');

  // 8. "Did IDeV create GPT?"
  console.log('8. Verifying "Did IDeV create GPT?"...');
  const didIdevGpt = generateResponse('did idev create gpt?', [], 'test_idev_4', 'gpt-6-1-sol');
  assert(didIdevGpt.toLowerCase().includes('application') || didIdevGpt.toLowerCase().includes('desktop'), 'Must distinguish desktop app');
  assert(didIdevGpt.includes('OpenAI') || didIdevGpt.includes('respective') || didIdevGpt.includes('not by IDeV'), 'Must distinguish foundation model creators');
  console.log('   ✓ "Did IDeV create GPT?" clearly distinguishes desktop app from foundation models');

  // 9. "How are Ubaid, IDeV, and Exciting AI related?"
  console.log('9. Verifying relationship between Ubaid, IDeV, and Exciting AI...');
  const relResp = generateResponse('how are ubaid, idev, and exciting ai related?', [], 'test_idev_5', 'gpt-6-1-sol');
  assert(relResp.includes('Ubaid built IDeV') || relResp.includes('Ubaid is the developer behind IDeV') || relResp.includes('Ubaid is the person behind IDeV'), 'Must mention Ubaid built IDeV');
  assert(relResp.includes('Exciting AI'), 'Must mention Exciting AI');
  assert(relResp.includes('IDeV'), 'Must mention IDeV');
  console.log('   ✓ Relationship between Ubaid, IDeV, and Exciting AI explained accurately');

  // 10. Catalog Availability: all models available
  console.log('10. Verifying catalog contains all models...');
  const catalogPath = path.join(__dirname, '..', 'Storage', 'models', 'catalog.json');
  assert(fs.existsSync(catalogPath), 'catalog.json must exist');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  assert(catalog.length >= 1900, `Catalog should contain at least 1900 models, found ${catalog.length}`);
  const hasGpt6Sol = catalog.some(m => m.name === 'gpt-6-1-sol' || m.model === 'gpt-6-1-sol');
  assert(hasGpt6Sol, 'catalog.json must contain gpt-6-1-sol');
  console.log(`   ✓ Catalog contains all ${catalog.length} models, including gpt-6-1-sol`);

  // 11. Technical questions have zero developer attribution
  console.log('11. Verifying technical questions have zero developer attribution...');
  const techQueries = [
    'Write a python script to parse JSON',
    'How do closures work in Rust?',
    'What is Dijkstra algorithm?'
  ];
  for (const q of techQueries) {
    const resp = generateResponse(q, [], 'test_chat_tech', 'gpt-6-1-sol');
    if (resp !== null) {
      assert(!resp.includes('Ubaid'), `Technical question "${q}" should not mention Ubaid`);
      assert(!resp.includes('IDeV'), `Technical question "${q}" should not mention IDeV`);
      assert(!resp.includes('musawir'), `Technical question "${q}" should not include developer links`);
    }
  }
  console.log('   ✓ Technical queries have zero unsolicited developer or company attribution');

  console.log('--- All IDeV & Model Identity Tests Passed Successfully! ---\n');
}

if (require.main === module) {
  runIdevAndModelIdentityTests().catch(err => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
}

module.exports = { runIdevAndModelIdentityTests };
