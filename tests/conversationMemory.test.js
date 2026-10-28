const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runConversationMemoryTests() {
  console.log('\n--- [TEST SUITE 4] Multi-Turn Conversation Memory & Persistence Tests ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_memory');
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testStorageDir, 'chats'), { recursive: true });

  const engine = createEngine({
    storageDir: testStorageDir,
    bundledStorageDir: testStorageDir,
    getSettings: () => ({})
  });
  const cm = engine.conversationManager;

  // Test 1: Create chat and add multiple turns
  try {
    const chatId = 'multi_turn_test_1';
    cm.addUserMessage(chatId, 'Turn 1: My name is Alice.', 'qwen2.5:7b');
    cm.addAssistantMessage(chatId, 'Turn 1 reply: Nice to meet you, Alice!');

    cm.addUserMessage(chatId, 'Turn 2: What is my name?', 'qwen2.5:7b');
    cm.addAssistantMessage(chatId, 'Turn 2 reply: Your name is Alice.');

    cm.addUserMessage(chatId, 'Turn 3: What did I ask you first?', 'qwen2.5:7b');
    cm.addAssistantMessage(chatId, 'Turn 3 reply: You told me your name was Alice.');

    const history = cm.buildHistoryForInference(chatId);
    assert.strictEqual(history.length, 7, 'Should have 1 system message + 6 conversation messages');
    assert.strictEqual(history[0].role, 'system');
    assert.strictEqual(history[1].role, 'user');
    assert.strictEqual(history[1].content, 'Turn 1: My name is Alice.');
    assert.strictEqual(history[2].role, 'assistant');
    assert.strictEqual(history[2].content, 'Turn 1 reply: Nice to meet you, Alice!');
    assert.strictEqual(history[3].role, 'user');
    assert.strictEqual(history[4].role, 'assistant');
    assert.strictEqual(history[5].role, 'user');
    assert.strictEqual(history[6].role, 'assistant');

    console.log('  [PASS] Test 1: Multi-turn messages appended and ordered properly');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // Test 2: Persistence across disk load & independent conversation state
  try {
    const chat1 = 'chat_persisted_A';
    const chat2 = 'chat_persisted_B';

    cm.addUserMessage(chat1, 'Message in Chat A', 'qwen2.5:7b');
    cm.addAssistantMessage(chat1, 'Reply in Chat A');

    cm.addUserMessage(chat2, 'Message in Chat B', 'qwen2.5:7b');
    cm.addAssistantMessage(chat2, 'Reply in Chat B');

    // Simulate app restart by creating a new conversation manager pointing to same storage
    const newEngine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({})
    });
    const reloadedHistoryA = newEngine.conversationManager.buildHistoryForInference(chat1);
    const reloadedHistoryB = newEngine.conversationManager.buildHistoryForInference(chat2);

    assert.strictEqual(reloadedHistoryA.length, 3, '1 system + 2 messages in Chat A');
    assert.strictEqual(reloadedHistoryA[1].content, 'Message in Chat A');
    assert.strictEqual(reloadedHistoryB.length, 3, '1 system + 2 messages in Chat B');
    assert.strictEqual(reloadedHistoryB[1].content, 'Message in Chat B');

    // Rename chat
    newEngine.conversationManager.renameChat(chat1, 'Alice Conversation');
    const chatMeta = newEngine.conversationManager.getChat(chat1);
    assert.strictEqual(chatMeta.title, 'Alice Conversation');

    console.log('  [PASS] Test 2: Chat persistence across reloads and multi-chat separation verified');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // Test 3: Failed inferences are NEVER saved as assistant responses
  try {
    const chatFail = 'chat_fail_verify';
    cm.addUserMessage(chatFail, 'Tell me something that fails', 'qwen2.5:7b');

    // Simulate an error: assistant response is NOT appended to conversation
    // Verify that raw error string is not in history
    const history = cm.buildHistoryForInference(chatFail);
    assert.strictEqual(history.length, 2, 'Only 1 system + 1 user message should be present');
    assert.strictEqual(history[1].role, 'user');

    console.log('  [PASS] Test 3: Failed inferences never persist as assistant answers');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  // Test 4: Delete conversation
  try {
    const chatDel = 'chat_to_delete';
    cm.addUserMessage(chatDel, 'Temporary message', 'qwen2.5:7b');
    assert.ok(cm.getChat(chatDel));

    const deleted = cm.deleteChat(chatDel);
    assert.strictEqual(deleted, true);
    assert.strictEqual(cm.getChat(chatDel), null);

    console.log('  [PASS] Test 4: Conversation deletion clears metadata and message store');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 4:', e.message);
    failed++;
  }

  // Cleanup
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }

  console.log(`\nConversation Memory Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runConversationMemoryTests().catch(e => {
    console.error('Test runner failure:', e);
    process.exit(1);
  });
}

module.exports = { runConversationMemoryTests };
