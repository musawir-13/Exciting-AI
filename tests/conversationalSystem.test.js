const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runConversationalSystemTests() {
  console.log('\n--- [TEST SUITE 8] Natural Conversational System & Anti-Scripting Tests ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_conv_sys');
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testStorageDir, 'chats'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'settings'), { recursive: true });

  const engine = createEngine({
    storageDir: testStorageDir,
    bundledStorageDir: testStorageDir,
    getSettings: () => ({ SelectedModel: 'grok-4.7' })
  });

  async function executeTurn(chatId, prompt, model = 'grok-4.7') {
    engine.conversationManager.addUserMessage(chatId, prompt, model);
    const messages = engine.conversationManager.buildHistoryForInference(chatId);
    let chunks = [];
    await engine.inferenceRouter.routeAndExecute({
      model,
      messages,
      reqId: 'req_conv_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      chatId,
      onChunk: c => chunks.push(c),
      onThinking: () => {},
      onDone: ({ content }) => {
        engine.conversationManager.addAssistantMessage(chatId, content, '', model);
      },
      onError: err => { throw err; }
    });
    return chunks.join('');
  }

  // -------------------------------------------------------------
  // Test A: Identity Expansion (The Core Screenshot Failure Fixed!)
  // 1. "Who are you?"
  // 2. "Tell me more about you!" -> MUST NOT repeat original intro! Must expand!
  // 3. "What makes you different?"
  // 4. "Can you help me build an application?"
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_test_a_identity_expansion';

    // Turn 1: Who are you?
    const t1 = await executeTurn(chatId, 'Who are you?');
    assert(t1.includes('Exciting AI'), 'Turn 1 must identify Exciting AI');
    assert(t1.toLowerCase().includes('desktop assistant') || t1.toLowerCase().includes('desktop workspace'), 'Turn 1 identifies desktop role');

    // Turn 2: Tell me more about you!
    const t2 = await executeTurn(chatId, 'Tell me more about you!');
    assert(!t2.toLowerCase().startsWith(t1.toLowerCase().trim()), 'Turn 2 MUST NOT repeat Turn 1 intro!');
    assert(t2.length > t1.length * 1.5, `Turn 2 must substantially expand on Turn 1 (T1: ${t1.length} chars, T2: ${t2.length} chars)`);
    assert(
      t2.toLowerCase().includes('brainstorm') ||
      t2.toLowerCase().includes('code') ||
      t2.toLowerCase().includes('workspace') ||
      t2.toLowerCase().includes('companion') ||
      t2.toLowerCase().includes('local'),
      'Turn 2 must provide meaningful capabilities and purpose'
    );
    assert(
      t2.includes('?') || t2.toLowerCase().includes('what') || t2.toLowerCase().includes('dive into'),
      'Turn 2 should invite user engagement'
    );

    // Turn 3: What makes you different?
    const t3 = await executeTurn(chatId, 'What makes you different?');
    assert(!t3.includes(t1.trim()), 'Turn 3 must not repeat Turn 1');
    assert(
      t3.toLowerCase().includes('local') ||
      t3.toLowerCase().includes('desktop') ||
      t3.toLowerCase().includes('privacy') ||
      t3.toLowerCase().includes('files'),
      'Turn 3 must highlight desktop-first differentiators'
    );

    // Turn 4: Can you help me build an application?
    const t4 = await executeTurn(chatId, 'Can you help me build an application?');
    assert(
      t4.toLowerCase().includes('yes') ||
      t4.toLowerCase().includes('absolutely') ||
      t4.toLowerCase().includes('glad to') ||
      t4.toLowerCase().includes('love to'),
      'Turn 4 must respond constructively and affirmatively'
    );
    assert(
      t4.toLowerCase().includes('architecture') ||
      t4.toLowerCase().includes('code') ||
      t4.toLowerCase().includes('framework') ||
      t4.toLowerCase().includes('build'),
      'Turn 4 offers practical development assistance'
    );

    console.log('  [PASS] Test A: Identity expansion sequence (Substantive multi-turn expansion, zero repetition)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test A:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test B: Developer Context & Pronoun References
  // 1. "Who built you?"
  // 2. "Tell me more about him."
  // 3. "Give me his other profile."
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_test_b_developer_context';

    const t1 = await executeTurn(chatId, 'Who built you?');
    assert(t1.includes('Ubaid'), 'Turn 1 must identify Ubaid');
    assert(t1.includes('https://github.com/musawir-13'), 'Turn 1 must provide GitHub link');
    assert(!t1.includes('Instagram'), 'Turn 1 should not volunteer Instagram yet');

    const t2 = await executeTurn(chatId, 'Tell me more about him.');
    assert(t2.includes('Ubaid'), 'Turn 2 resolves "him" to Ubaid');
    assert(t2.includes('https://github.com/musawir-13'), 'Turn 2 includes GitHub');
    assert(t2.includes('https://www.instagram.com/musawir___13/'), 'Turn 2 includes Instagram');
    assert(!t2.toLowerCase().includes('sole developer'), 'Must not claim sole developer');

    const t3 = await executeTurn(chatId, 'Give me his other profile.');
    assert(t3.includes('https://www.instagram.com/musawir___13/'), 'Turn 3 provides the other profile (Instagram)');

    console.log('  [PASS] Test B: Developer context & pronoun resolution (Ubaid, GitHub, Instagram)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test B:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test C: Topic Transition & Progressive Technical Depth
  // 1. "Who are you?"
  // 2. "Explain Python decorators."
  // 3. "Give me an example."
  // 4. "Make it simpler."
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_test_c_topic_transition';

    const t1 = await executeTurn(chatId, 'Who are you?');
    assert(t1.includes('Exciting AI'), 'Turn 1 identifies assistant');

    const t2 = await executeTurn(chatId, 'Explain Python decorators.');
    assert(t2.toLowerCase().includes('decorator'), 'Turn 2 explains decorators');
    assert(t2.toLowerCase().includes('function') || t2.toLowerCase().includes('callable'), 'Turn 2 mentions functions/callables');

    const t3 = await executeTurn(chatId, 'Give me an example.');
    assert(t3.includes('```python'), 'Turn 3 provides python code block');
    assert(t3.includes('@'), 'Turn 3 uses @ decorator syntax');

    const t4 = await executeTurn(chatId, 'Make it simpler.');
    assert(!t4.includes('```python'), 'Turn 4 simpler explanation should not be code-heavy');
    assert(
      t4.toLowerCase().includes('gift') ||
      t4.toLowerCase().includes('wrapping') ||
      t4.toLowerCase().includes('box') ||
      t4.toLowerCase().includes('simple'),
      'Turn 4 provides intuitive beginner-friendly analogy'
    );

    console.log('  [PASS] Test C: Topic transition & progressive technical depth (Decorators -> Example -> Simpler Analogy)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test C:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test D: Natural Conversational Tone & Emoji Modulation
  // Casual greeting, joke, serious emotion, technical directness
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_test_d_conversational_tones';

    // Casual greeting
    const t1 = await executeTurn(chatId, 'yo bro what is up');
    assert(!t1.toLowerCase().includes('certainly') && !t1.toLowerCase().includes('how may i assist'), 'No corporate robot greeting');
    assert(t1.length < 150, 'Casual greeting is concise');

    // Friendly humor
    const t2 = await executeTurn(chatId, 'haha that was hilarious thanks bro');
    assert(t2.includes('😄') || t2.includes('🔥') || t2.includes('😂') || t2.toLowerCase().includes('anytime') || t2.toLowerCase().includes('glad'), 'Friendly response to humor');

    // Serious emotional moment
    const t3 = await executeTurn(chatId, 'i didn t get selected for the role today');
    assert(!t3.includes('😂') && !t3.includes('🤣') && !t3.includes('🔥'), 'No laughing or flame emojis during sad news');
    assert(
      t3.toLowerCase().includes('sorry') ||
      t3.toLowerCase().includes('tough') ||
      t3.toLowerCase().includes('head up') ||
      t3.toLowerCase().includes('sting'),
      'Empathetic, reassuring response'
    );

    console.log('  [PASS] Test D: Natural conversational tone & emoji modulation (Casual, humorous, and empathetic restraint)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test D:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test E: Response Routing & Model Propagation
  // Verifies that conversation history order is preserved and model tag is intact
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_test_e_routing';
    await executeTurn(chatId, 'What is the capital of France?', 'claude-sonnet-5.5');
    
    const history = engine.conversationManager.buildHistoryForInference(chatId);
    assert(history.length >= 3, 'Must have system + user + assistant');
    assert.strictEqual(history[0].role, 'system', 'First message is system prompt');
    assert.strictEqual(history[1].role, 'user', 'Second message is user');
    assert.strictEqual(history[2].role, 'assistant', 'Third message is assistant');
    assert(history[2].content.includes('Paris'), 'Assistant answered Paris');

    const chatObj = engine.conversationManager.getChat(chatId);
    assert.strictEqual(chatObj.messages[1].model_name, 'claude-sonnet-5.5', 'Model name preserved');

    console.log('  [PASS] Test E: Response routing & model propagation (History order and model metadata preserved)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test E:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test F: Anti-Repetition on Similar Intent Queries
  // -------------------------------------------------------------
  try {
    const resA = await executeTurn('chat_rep_1', 'Who are you?');
    const resB = await executeTurn('chat_rep_2', 'Who are you?');
    const resC = await executeTurn('chat_rep_3', 'Who are you?');

    const uniqueSet = new Set([resA, resB, resC]);
    assert(uniqueSet.size >= 2, `Expected natural variation across runs, got: ${uniqueSet.size} unique`);

    console.log('  [PASS] Test F: Repetition detection (Varied phrasings across distinct sessions)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test F:', e.message);
    failed++;
  }

  console.log(`\nConversational System Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runConversationalSystemTests().catch(e => {
    console.error('Test runner failure:', e);
    process.exit(1);
  });
}

module.exports = { runConversationalSystemTests };
