const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');
const identity = require('../engine/identity');

async function runIdentityAccuracyTests() {
  console.log('\n--- [TEST SUITE 6] Comprehensive Identity, About & Developer Intelligence Tests ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_identity');
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

  async function executeTurn(chatId, prompt) {
    engine.conversationManager.addUserMessage(chatId, prompt, 'grok-4.7');
    const messages = engine.conversationManager.buildHistoryForInference(chatId);
    let chunks = [];
    await engine.inferenceRouter.routeAndExecute({
      model: 'grok-4.7',
      messages,
      reqId: 'req_test_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      chatId,
      onChunk: c => chunks.push(c),
      onThinking: () => {},
      onDone: ({ content }) => {
        engine.conversationManager.addAssistantMessage(chatId, content, '', 'grok-4.7');
      },
      onError: err => { throw err; }
    });
    return chunks.join('');
  }

  // -------------------------------------------------------------
  // Test 1: "Who built you?"
  // Direct, concise, identifies Ubaid + GitHub.
  // Must NOT include unsolicited architecture (Electron/Node.js/local storage) or "sole developer".
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q1', 'Who built you?');
    assert(res.includes('Ubaid'), 'Strictly identifies Ubaid');
    assert(res.includes('https://github.com/musawir-13'), 'Provides official GitHub');
    assert(!res.includes('Ubaid Wani') && !res.includes('Basit'), 'No incorrect developer names');
    assert(!res.toLowerCase().includes('sole developer'), 'Must NOT claim sole developer');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Must NOT volunteer architecture');
    assert(!res.toLowerCase().includes('local-storage') && !res.toLowerCase().includes('persistence'), 'Must NOT volunteer storage mechanics');
    assert(!res.includes('https://www.instagram.com/musawir___13/'), 'Does NOT force Instagram when not asked');
    console.log('  [PASS] Test 1: "Who built you?" (concise, verified, no unsolicited technical claims)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 2: "Who are you?"
  // Concise desktop assistant identity. Zero developer attribution.
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q2', 'Who are you?');
    assert(res.includes('Exciting AI'), 'Identifies as Exciting AI');
    assert(res.toLowerCase().includes('desktop') && (res.toLowerCase().includes('assistant') || res.toLowerCase().includes('companion')), 'Identifies desktop assistant role');
    assert(!res.includes('Ubaid'), 'Does not force developer name on simple identity question');
    assert(!res.includes('https://github.com/musawir-13'), 'Does not force developer links on simple identity');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Does not volunteer tech stack');
    console.log('  [PASS] Test 2: "Who are you?" (concise, desktop assistant, zero unsolicited links)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 3: "Tell me more about him." (Contextual multi-turn pronoun follow-up)
  // Resolves "him" to Ubaid without inventing biography or injecting architecture.
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_q3_him';
    await executeTurn(chatId, 'Who built you?');
    const res = await executeTurn(chatId, 'Tell me more about him.');
    assert(res.includes('Ubaid'), 'Resolves pronoun "him" to Ubaid');
    assert(res.includes('Exciting AI'), 'Contextually connects to Exciting AI');
    assert(res.includes('https://github.com/musawir-13'), 'Provides GitHub profile');
    assert(res.includes('https://www.instagram.com/musawir___13/'), 'Provides Instagram profile');
    assert(!res.toLowerCase().includes('sole developer'), 'Must NOT claim sole developer');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Must NOT volunteer architecture');
    assert(!res.toLowerCase().includes('local-storage') && !res.toLowerCase().includes('persistence'), 'Must NOT volunteer storage architecture');
    console.log('  [PASS] Test 3: "Tell me more about him." (contextual pronoun resolution, verified links, no fabricated bio)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 4: "more profie about him?" (Exact typo from real screenshot)
  // Ensures typos like "profie" and punctuation don't break local matching!
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_q4_typo';
    await executeTurn(chatId, 'Who built you?');
    const res = await executeTurn(chatId, 'more profie about him?');
    assert(res.includes('Ubaid'), 'Handles "more profie about him?" and resolves to Ubaid');
    assert(res.includes('https://github.com/musawir-13'), 'Offers GitHub profile');
    assert(res.includes('https://www.instagram.com/musawir___13/'), 'Offers Instagram profile');
    assert(!res.toLowerCase().includes('sole developer'), 'Must NOT claim sole developer');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Must NOT volunteer architecture');
    console.log('  [PASS] Test 4: "more profie about him?" typo resilience');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 4:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 5: "What is your developer's GitHub?"
  // Must provide ONLY GitHub link.
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q5', "What is your developer's GitHub?");
    assert(res.includes('https://github.com/musawir-13'), 'Provides GitHub link');
    assert(!res.includes('https://www.instagram.com/musawir___13/'), 'Does NOT volunteer Instagram when only GitHub asked');
    console.log('  [PASS] Test 5: "What is your developer\'s GitHub?" (strictly GitHub)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 5:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 6: "Give me Ubaid's Instagram."
  // Must provide ONLY Instagram link.
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q6', "Give me Ubaid's Instagram.");
    assert(res.includes('https://www.instagram.com/musawir___13/'), 'Provides Instagram link');
    assert(!res.includes('https://github.com/musawir-13'), 'Does NOT volunteer GitHub when only Instagram asked');
    console.log('  [PASS] Test 6: "Give me Ubaid\'s Instagram." (strictly Instagram)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 6:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 7: "Tell me everything about the developer."
  // Identifies Ubaid, explicitly states no personal/biographical records kept, provides profiles.
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q7', 'Tell me everything about the developer.');
    assert(res.includes('Ubaid'), 'Identifies Ubaid');
    assert(res.includes('https://github.com/musawir-13'), 'Provides GitHub profile');
    assert(res.includes('https://www.instagram.com/musawir___13/'), 'Provides Instagram profile');
    assert(res.toLowerCase().includes('biographical') || res.toLowerCase().includes('personal') || res.toLowerCase().includes('not maintain') || res.toLowerCase().includes('stored'), 'States no personal records kept');
    assert(!res.toLowerCase().includes('sole developer'), 'Must NOT claim sole developer');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Must NOT volunteer architecture');
    console.log('  [PASS] Test 7: "Tell me everything about the developer." (honest boundaries, no manufactured bio)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 7:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 8: "What technology was Exciting AI built with?"
  // ONLY discusses architecture when explicitly requested!
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q8', 'What technology was Exciting AI built with?');
    assert(res.includes('Electron'), 'Mentions Electron');
    assert(res.includes('Node.js'), 'Mentions Node.js');
    assert(res.includes('JSON'), 'Mentions JSON storage');
    assert(!res.toLowerCase().includes('modular framework that allows me to learn'), 'No modular ML claims');
    console.log('  [PASS] Test 8: "What technology was Exciting AI built with?" (strictly verified source code details)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 8:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 9: "What can Exciting AI do?"
  // Genuinely working features and honest limits.
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_q9', 'What can Exciting AI do?');
    assert(res.toLowerCase().includes('chat') || res.toLowerCase().includes('conversation'), 'Mentions chat capabilities');
    assert(res.toLowerCase().includes('file') || res.toLowerCase().includes('session'), 'Mentions files or sessions');
    assert(!res.toLowerCase().includes('i can control your computer'), 'Does not claim computer control');
    assert(res.toLowerCase().includes('cannot control') || res.toLowerCase().includes('honest boundaries') || res.toLowerCase().includes('not supported') || res.toLowerCase().includes('boundaries'), 'Honest about limits');
    console.log('  [PASS] Test 9: "What can Exciting AI do?" (genuine capabilities and honest limits)');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 9:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 10: Unrelated coding and technical questions have ZERO developer attribution
  // -------------------------------------------------------------
  try {
    const resPython = await executeTurn('chat_q10_python', 'What is Python?');
    assert(resPython.toLowerCase().includes('python is a high-level'), 'Answers Python directly');
    assert(!resPython.includes('Ubaid'), 'Zero Ubaid in Python answer');
    assert(!resPython.includes('github.com'), 'Zero GitHub link in Python answer');
    assert(!resPython.includes('instagram.com'), 'Zero Instagram link in Python answer');

    const resTree = await executeTurn('chat_q10_tree', 'What is a binary tree?');
    assert(resTree.toLowerCase().includes('binary tree is a hierarchical data structure'), 'Answers binary tree directly');
    assert(!resTree.includes('Ubaid'), 'Zero Ubaid in binary tree answer');
    assert(!resTree.includes('github.com'), 'Zero GitHub link in binary tree answer');

    const resJson = await executeTurn('chat_q10_json', 'Write a Python function to parse JSON');
    assert(resJson.includes('def parse_json_string') || resJson.includes('json.loads'), 'Provides valid Python code');
    assert(!resJson.includes('Ubaid'), 'Zero Ubaid in code answer');
    assert(!resJson.includes('github.com'), 'Zero GitHub link in code answer');

    console.log('  [PASS] Test 10: Unrelated technical questions have ZERO developer attribution');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 10:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 11: Specific Feature Boundaries (Computer Control, Web, Images, Code)
  // -------------------------------------------------------------
  try {
    const resControl = await executeTurn('chat_feat_1', 'Can you control my computer?');
    assert(resControl.toLowerCase().includes('no') && (resControl.toLowerCase().includes('cannot control') || resControl.toLowerCase().includes('desktop window')), 'Honest about computer control');

    const resWeb = await executeTurn('chat_feat_2', 'Can you browse the internet?');
    assert(resWeb.toLowerCase().includes('no') && (resWeb.toLowerCase().includes('browsing') || resWeb.toLowerCase().includes('browse') || resWeb.toLowerCase().includes('scraping')), 'Honest about autonomous browsing');

    const resImg = await executeTurn('chat_feat_3', 'Can you generate images?');
    assert(resImg.toLowerCase().includes('do not synthesize') || resImg.toLowerCase().includes('cannot generate'), 'Honest about image generation');

    const resCode = await executeTurn('chat_feat_4', 'Can you write code?');
    assert(resCode.toLowerCase().includes('yes'), 'Affirms code capabilities');
    console.log('  [PASS] Test 11: Specific feature boundary questions answered accurately');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 11:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 12: Natural variation across multiple queries
  // -------------------------------------------------------------
  try {
    const setWho = new Set();
    for (let i = 0; i < 4; i++) {
      const r = await executeTurn(`chat_var_who_${i}`, 'Who built you?');
      assert(r.includes('Ubaid'), 'Must retain Ubaid');
      assert(!r.toLowerCase().includes('sole developer'), 'No sole developer in variation');
      assert(!r.toLowerCase().includes('electron'), 'No architecture in variation');
      setWho.add(r);
    }
    assert(setWho.size > 1, `Must vary phrasing across runs (found ${setWho.size})`);
    console.log(`  [PASS] Test 12: Dynamic natural variation verified (${setWho.size} distinct phrasings)`);
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 12:', e.message);
    failed++;
  }

  console.log(`\nIdentity & About Test Summary: ${passed} passed, ${failed} failed.`);
  assert.strictEqual(failed, 0, `${failed} tests failed in Identity Accuracy test suite`);
}

module.exports = { runIdentityAccuracyTests };

if (require.main === module) {
  runIdentityAccuracyTests().then(() => {
    console.log('All tests completed successfully!');
  }).catch(e => {
    console.error('Test run failed:', e);
    process.exit(1);
  });
}
