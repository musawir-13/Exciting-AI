const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runMessagePipelineTests() {
  console.log('\n--- [TEST SUITE 1] Message Pipeline & No-Scripted Responses ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_pipeline');
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testStorageDir, 'cloud models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'chats'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'settings'), { recursive: true });

  // Copy catalog
  const realCatalog = path.join(__dirname, '..', 'Storage', 'cloud models', 'catalog.json');
  if (fs.existsSync(realCatalog)) {
    fs.copyFileSync(realCatalog, path.join(testStorageDir, 'cloud models', 'catalog.json'));
  }

  // 1. Create a mock Cloud server (OpenAI / Poe compatible)
  let lastReceivedPayload = null;
  const mockServer = http.createServer((req, res) => {
    if (req.url === '/chat/completions' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        lastReceivedPayload = JSON.parse(b);
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Dynamic ' } }] })}\n\n`);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'genuine response based on user input.' } }] })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(resolve => mockServer.listen(0, '127.0.0.1', resolve));
  const mockPort = mockServer.address().port;
  const mockHost = `http://127.0.0.1:${mockPort}`;

  const engine = createEngine({
    storageDir: testStorageDir,
    bundledStorageDir: testStorageDir,
    getSettings: () => ({
      CloudEndpoint: mockHost,
      CloudApiKey: 'test-key',
      SelectedModel: 'qwen2.5:7b',
      Temperature: 0.8
    })
  });

  // Test 1: User sends "hi" -> MUST NOT return the scripted greeting
  try {
    let receivedChunks = [];
    let isDone = false;
    const reqId = engine.diagnostics.generateRequestId();

    // Add user message
    const chatId = 'chat_test_1';
    engine.conversationManager.addUserMessage(chatId, 'hi', 'qwen2.5:7b');
    const messages = engine.conversationManager.buildHistoryForInference(chatId);

    await engine.inferenceRouter.routeAndExecute({
      model: 'qwen2.5:7b',
      messages,
      reqId,
      chatId,
      onChunk: c => receivedChunks.push(c),
      onThinking: () => {},
      onDone: ({ content }) => {
        isDone = true;
        engine.conversationManager.addAssistantMessage(chatId, content, '', 'qwen2.5:7b');
      },
      onError: err => { throw err; }
    });

    const fullContent = receivedChunks.join('');
    assert(isDone, 'Stream did not finish');
    assert(fullContent.includes('Dynamic genuine response'), 'Response did not come from mock inference engine');
    assert(!fullContent.includes('very excited to meet you'), 'SCRIPTED GREETING DETECTED! Must be removed!');
    assert.strictEqual(lastReceivedPayload.messages[lastReceivedPayload.messages.length - 1].content, 'hi');
    console.log('  PASS: First turn "hi" executes genuine model inference without scripted greeting');
    passed++;
  } catch (err) {
    console.error('  FAIL: Test 1 failed:', err.message);
    failed++;
  }

  // Test 2: Consecutive turn "how are you?" in the SAME conversation
  try {
    let receivedChunks = [];
    const reqId = engine.diagnostics.generateRequestId();
    const chatId = 'chat_test_1';

    engine.conversationManager.addUserMessage(chatId, 'how are you?', 'qwen2.5:7b');
    const messages = engine.conversationManager.buildHistoryForInference(chatId);

    // Verify context contains prior turns
    assert(messages.length >= 3, `Expected at least 3 messages (system, user, assistant, user), got ${messages.length}`);
    assert.strictEqual(messages[1].role, 'user');
    assert.strictEqual(messages[1].content, 'hi');
    assert.strictEqual(messages[2].role, 'assistant');
    assert(messages[2].content.includes('Dynamic genuine response'));
    assert.strictEqual(messages[3].role, 'user');
    assert.strictEqual(messages[3].content, 'how are you?');

    await engine.inferenceRouter.routeAndExecute({
      model: 'qwen2.5:7b',
      messages,
      reqId,
      chatId,
      onChunk: c => receivedChunks.push(c),
      onThinking: () => {},
      onDone: ({ content }) => {
        engine.conversationManager.addAssistantMessage(chatId, content, '', 'qwen2.5:7b');
      },
      onError: err => { throw err; }
    });

    const savedChat = engine.conversationManager.getChat(chatId);
    assert.strictEqual(savedChat.messages.length, 4, 'Chat must have 4 messages across 2 turns');
    console.log('  PASS: Consecutive multi-turn conversation works and retains full history');
    passed++;
  } catch (err) {
    console.error('  FAIL: Test 2 failed:', err.message);
    failed++;
  }

  // Test 3: Model-selection changes affect the next request
  try {
    const reqId = engine.diagnostics.generateRequestId();
    const chatId = 'chat_test_model_switch';
    engine.conversationManager.addUserMessage(chatId, 'Write code', 'llama3.2');
    const messages = engine.conversationManager.buildHistoryForInference(chatId);

    await engine.inferenceRouter.routeAndExecute({
      model: 'llama3.2',
      messages,
      reqId,
      chatId,
      onChunk: () => {},
      onThinking: () => {},
      onDone: () => {},
      onError: err => { throw err; }
    });

    assert(lastReceivedPayload.model.includes('llama3.2'), `Expected llama3.2, got ${lastReceivedPayload.model}`);
    console.log('  PASS: Model selection properly dynamically applied to outgoing inference request');
    passed++;
  } catch (err) {
    console.error('  FAIL: Test 3 failed:', err.message);
    failed++;
  }

  // Cleanup
  await new Promise(resolve => mockServer.close(resolve));
  try { fs.rmSync(testStorageDir, { recursive: true, force: true }); } catch (e) {}

  return { passed, failed };
}

module.exports = { runMessagePipelineTests };

if (require.main === module) {
  runMessagePipelineTests().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}
