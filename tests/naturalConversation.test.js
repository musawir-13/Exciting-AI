const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runNaturalConversationTests() {
  console.log('\n--- [TEST SUITE 7] Ultra-Natural Conversation, Personality & Emoji Intelligence Tests ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_natural');
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
      reqId: 'req_nat_' + Date.now() + '_' + Math.random().toString(36).substring(7),
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

  // Helper regex for any emoji
  const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;

  // -------------------------------------------------------------
  // Test 1: Casual Greetings
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_1', 'yo');
    assert(res.toLowerCase().includes('yo') || res.toLowerCase().includes('hey'), 'Casual greeting recognition');
    assert(!res.toLowerCase().includes('hello! i am exciting ai'), 'No canned introductory greeting');
    assert(!res.toLowerCase().includes('how may i assist you today'), 'No customer support boilerplate');
    assert(EMOJI_REGEX.test(res), 'Natural casual emoji included');
    console.log('  [PASS] Test 1: Casual greetings sound lively and informal');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 2: Exciting News & Major Achievements
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_2', 'I got the job!');
    assert(res.toLowerCase().includes('congrat') || res.includes('CONGRATS') || res.includes('LET\'S GOOO'), 'Celebratory energy');
    assert(res.includes('🎉') || res.includes('🥳') || res.includes('🚀') || res.includes('🔥'), 'Celebratory emojis present');
    assert(!res.toLowerCase().includes('i understand your request'), 'Not treated like a formal ticket');
    console.log('  [PASS] Test 2: Exciting news greeted with authentic celebration and emojis');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 3: Disappointing News
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_3', 'I didn\'t get selected.');
    assert(res.toLowerCase().includes('sorry') || res.toLowerCase().includes('sting') || res.toLowerCase().includes('tough'), 'Empathetic response');
    assert(!res.includes('😂') && !res.includes('🤣') && !res.includes('🎉') && !res.includes('🥳'), 'NO laughing or celebratory emojis on disappointment');
    assert(res.includes('❤️') || !EMOJI_REGEX.test(res), 'Gentle warmth or restrained emoji');
    console.log('  [PASS] Test 3: Disappointing news handled with empathy and restraint');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 4: Friendly Jokes and Humorous Conversations
  // -------------------------------------------------------------
  try {
    const resJoke = await executeTurn('chat_nat_4a', 'Tell me a joke');
    assert(resJoke.includes('😂') || resJoke.includes('cache') || resJoke.includes('bugs') || resJoke.includes('binary'), 'Tells a humorous joke');

    const resHumor = await executeTurn('chat_nat_4b', 'Haha that makes sense thanks bro');
    assert(resHumor.toLowerCase().includes('anytime') || resHumor.toLowerCase().includes('happy to help') || resHumor.toLowerCase().includes('fair enough'), 'Friendly reciprocal banter');
    console.log('  [PASS] Test 4: Friendly jokes and humorous conversations handled with wit');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 4:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 5: Questions About the Developer (Verified & Scoped)
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_5', 'Who built you?');
    assert(res.includes('Ubaid'), 'Identifies Ubaid');
    assert(res.includes('https://github.com/musawir-13'), 'Provides GitHub link');
    assert(!res.toLowerCase().includes('sole developer'), 'Must NOT claim sole developer');
    assert(!res.toLowerCase().includes('electron') && !res.toLowerCase().includes('node.js'), 'Must NOT volunteer architecture');
    console.log('  [PASS] Test 5: Developer questions answered concisely and accurately');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 5:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 6: Normal Factual Questions (Direct, clean, no filler)
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_6', 'What is the capital of France?');
    assert(res.includes('Paris'), 'Direct factual answer');
    assert(!res.toLowerCase().includes('certainly') && !res.toLowerCase().includes('as an ai'), 'No robotic preamble');
    assert(!res.trim().endsWith('?'), 'NO trailing question on factual answers');
    console.log('  [PASS] Test 6: Normal factual questions answered directly without boilerplate');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 6:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 7: Detailed Technical Explanations (Analogy, clear, no trailing interrogation)
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_7', 'Explain how a database index works.');
    assert(res.toLowerCase().includes('book') || res.toLowerCase().includes('library') || res.toLowerCase().includes('scan'), 'Uses intuitive real-world analogy');
    assert(res.toLowerCase().includes('logarithmic') || res.toLowerCase().includes('lookup') || res.toLowerCase().includes('b-tree'), 'Explains technical mechanics');
    assert(!res.toLowerCase().includes('would you like to know more'), 'NO forced trailing question');
    assert(!res.toLowerCase().includes('how may i assist you further'), 'NO trailing robotic interrogation');
    console.log('  [PASS] Test 7: Detailed technical explanations use clear analogies and stop cleanly');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 7:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 8: Coding & Debugging Conversations (Success vs Still Broken)
  // -------------------------------------------------------------
  try {
    // 8a: Success -> Celebrate and ask what caused it
    const resFix = await executeTurn('chat_nat_8a', 'bro, I finally fixed it!');
    assert(resFix.toLowerCase().includes('ayyy') || resFix.toLowerCase().includes('finally') || resFix.toLowerCase().includes("let's go"), 'Celebrates fix');
    assert(resFix.toLowerCase().includes('issue') || resFix.toLowerCase().includes('bug') || resFix.toLowerCase().includes('problem'), 'Shows natural curiosity about root cause');
    assert(resFix.includes('🔥') || resFix.includes('😂') || resFix.includes('🚀'), 'Celebratory emojis');

    // 8b: Still broken -> Calm, supportive troubleshooting
    const resBroken = await executeTurn('chat_nat_8b', 'The code still doesn\'t work.');
    assert(resBroken.toLowerCase().includes('error') || resBroken.toLowerCase().includes('track') || resBroken.toLowerCase().includes('output'), 'Supportive troubleshooting');
    assert(!resBroken.includes('😂') && !resBroken.includes('🔥') && !resBroken.includes('🎉'), 'NO celebration emojis when code is broken');
    console.log('  [PASS] Test 8: Coding and debugging reactions match success vs broken states');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 8:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 9: Multi-Turn Conversation History Tracking
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_nat_multi_app';
    const r1 = await executeTurn(chatId, "I'm working on a desktop application.");
    assert(r1.toLowerCase().includes('desktop app') || r1.toLowerCase().includes('what kind') || r1.toLowerCase().includes('tech'), 'Acknowledges desktop app');

    const r2 = await executeTurn(chatId, 'The Apps page is finally working.');
    assert(r2.toLowerCase().includes('apps page') || r2.toLowerCase().includes('milestone') || r2.includes('🚀'), 'Understands Apps page of desktop app');

    const r3 = await executeTurn(chatId, 'But the logos look bad.');
    assert(r3.toLowerCase().includes('logo') && (r3.toLowerCase().includes('scaling') || r3.toLowerCase().includes('object-fit') || r3.toLowerCase().includes('svg') || r3.toLowerCase().includes('aspect')), 'Connects logos directly to the desktop app page');
    console.log('  [PASS] Test 9: Multi-turn conversation history successfully preserved and connected');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 9:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 10: Professional Requests (Polished, respectful, zero slang)
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_10', 'Draft an email to client about project delay');
    assert(res.toLowerCase().includes('subject:') || res.toLowerCase().includes('dear'), 'Formats professional email draft');
    assert(!res.includes('Yooo') && !res.includes('bro') && !res.includes('LET\'S GOOO'), 'Zero slang in professional request');
    assert(!res.includes('😂') && !res.includes('🔥') && !res.includes('🚀'), 'Zero casual emojis in formal draft');
    console.log('  [PASS] Test 10: Professional requests generate polished, respectful communication');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 10:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 11: Serious or Emotional Conversations (Calm, empathetic, warmth)
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_11', 'I\'m exhausted today.');
    assert(res.toLowerCase().includes('long day') || res.toLowerCase().includes('breather') || res.toLowerCase().includes('rest'), 'Caring and considerate tone');
    assert(!res.includes('😂') && !res.includes('🤣') && !res.includes('🚀'), 'NO laughing or hype emojis for exhaustion');
    assert(res.includes('❤️'), 'Empathetic warmth emoji used');
    console.log('  [PASS] Test 11: Serious/emotional conversations respond with warmth and restraint');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 11:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 12: Emoji-Free Responses When Requested
  // -------------------------------------------------------------
  try {
    const res = await executeTurn('chat_nat_12', 'Please respond formally without any emojis');
    assert(!EMOJI_REGEX.test(res), `Must contain ZERO emojis when user requests no emojis (found: ${res})`);
    console.log('  [PASS] Test 12: Emoji-free requests strictly suppress all emojis');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 12:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 13: Repeated Messages to Detect Robotic Repetition
  // -------------------------------------------------------------
  try {
    const setYo = new Set();
    for (let i = 0; i < 4; i++) {
      const r = await executeTurn(`chat_nat_var_${i}`, 'yo');
      setYo.add(r);
    }
    assert(setYo.size > 1, `Must vary phrasing across runs for "yo" (found ${setYo.size})`);
    console.log(`  [PASS] Test 13: Dynamic natural variation across runs (${setYo.size} distinct variants)`);
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 13:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 14: Conversation Transitions From Casual to Technical and Back
  // -------------------------------------------------------------
  try {
    const chatId = 'chat_nat_transition';
    // Turn 1: Casual
    const r1 = await executeTurn(chatId, 'yo');
    assert(r1.toLowerCase().includes('yo') || r1.toLowerCase().includes('hey'), 'Casual opening');

    // Turn 2: Technical
    const r2 = await executeTurn(chatId, 'How do database transactions maintain ACID properties?');
    assert(r2.toLowerCase().includes('atomicity') || r2.toLowerCase().includes('consistency') || r2.toLowerCase().includes('isolation'), 'Transitions into structured technical depth');
    assert(!r2.toLowerCase().includes('as an ai assistant'), 'No robotic preamble in technical depth');

    // Turn 3: Back to casual banter
    const r3 = await executeTurn(chatId, 'Haha that makes sense, thanks bro');
    assert(r3.toLowerCase().includes('anytime') || r3.toLowerCase().includes('happy to help') || r3.toLowerCase().includes('fair enough'), 'Transitions back to relaxed casual banter');
    console.log('  [PASS] Test 14: Seamless transitions from casual to technical and back');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 14:', e.message);
    failed++;
  }

  // -------------------------------------------------------------
  // Test 15: Responses that Should End Without a Follow-Up Question
  // -------------------------------------------------------------
  try {
    const resIndex = await executeTurn('chat_nat_15a', 'Explain how a database index works.');
    assert(!resIndex.trim().endsWith('?'), 'Database index explanation should NOT end with a question');
    assert(!resIndex.toLowerCase().includes('would you like to know more'), 'No "would you like to know more"');
    assert(!resIndex.toLowerCase().includes('how can i assist you further'), 'No "how can i assist you further"');

    const resFact = await executeTurn('chat_nat_15b', 'What is photosynthesis?');
    assert(!resFact.trim().endsWith('?'), 'Factual photosynthesis explanation should NOT end with a question');
    assert(!resFact.toLowerCase().includes('is there anything else'), 'No "is there anything else"');
    console.log('  [PASS] Test 15: Technical and factual responses terminate cleanly without forced questions');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 15:', e.message);
    failed++;
  }

  console.log(`\nNatural Conversation Test Summary: ${passed} passed, ${failed} failed.`);
  assert.strictEqual(failed, 0, `${failed} tests failed in Natural Conversation test suite`);
}

module.exports = { runNaturalConversationTests };

if (require.main === module) {
  runNaturalConversationTests().then(() => {
    console.log('All Natural Conversation tests completed successfully!');
  }).catch(e => {
    console.error('Test run failed:', e);
    process.exit(1);
  });
}
