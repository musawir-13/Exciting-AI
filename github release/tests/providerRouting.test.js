const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runProviderRoutingTests() {
  console.log('\n--- [TEST SUITE 2] Provider & Model Routing Tests (Ollama Severed) ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_routing');
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testStorageDir, 'models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'cloud models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'chats'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'settings'), { recursive: true });

  const realCatalog = path.join(__dirname, '..', 'Storage', 'models', 'catalog.json');
  if (fs.existsSync(realCatalog)) {
    fs.copyFileSync(realCatalog, path.join(testStorageDir, 'models', 'catalog.json'));
    fs.copyFileSync(realCatalog, path.join(testStorageDir, 'cloud models', 'catalog.json'));
  }

  // Mock Cloud / Poe API Server
  let lastHeaders = null;
  let lastPayload = null;
  const mockServer = http.createServer((req, res) => {
    if (req.url === '/chat/completions' && req.method === 'POST') {
      lastHeaders = req.headers;
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        lastPayload = JSON.parse(b);
        if (lastHeaders['authorization'] === 'Bearer invalid-key') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: 'Invalid API Key' } }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write(`data: ${JSON.stringify({
          choices: [{ delta: { reasoning_content: 'Step 1: Analyzing context...' } }]
        })}\n\n`);
        res.write(`data: ${JSON.stringify({
          choices: [{ delta: { content: 'Direct model response.' } }]
        })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(r => mockServer.listen(0, '127.0.0.1', r));
  const mockPort = mockServer.address().port;
  const mockEndpoint = `http://127.0.0.1:${mockPort}`;

  // Test 1: Direct Cloud Routing with Bearer Token and Thinking
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({
        CloudEndpoint: mockEndpoint,
        CloudApiKey: 'valid-secret-key-999'
      })
    });

    let fullText = '';
    let fullThinking = '';

    await engine.inferenceRouter.routeAndExecute({
      model: 'grok-4.7',
      messages: [{ role: 'user', content: 'Explain quantum computing' }],
      reqId: 'test_route_1',
      chatId: 'c1',
      onChunk: (c) => { fullText += c; },
      onThinking: (t) => { fullThinking += t; },
      onDone: () => {},
      onError: (err) => { throw err; }
    });

    assert.strictEqual(fullText, 'Direct model response.');
    assert.strictEqual(fullThinking, 'Step 1: Analyzing context...');
    assert.strictEqual(lastHeaders['authorization'], 'Bearer valid-secret-key-999');
    assert.strictEqual(lastPayload.model, 'grok-4.7');
    console.log('  [PASS] Test 1: Direct cloud routing streams text, reasoning, and sends Bearer token');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // Test 2: Error handling for 401 Unauthorized emits error event, never chat text
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({
        CloudEndpoint: mockEndpoint,
        CloudApiKey: 'invalid-key'
      })
    });

    let receivedError = null;
    let leakedChat = false;

    await engine.inferenceRouter.routeAndExecute({
      model: 'claude-sonnet-5.5',
      messages: [{ role: 'user', content: 'Testing invalid auth' }],
      reqId: 'test_route_2',
      chatId: 'c2',
      onChunk: () => { leakedChat = true; },
      onThinking: () => {},
      onDone: () => {},
      onError: (err) => { receivedError = err; }
    });

    assert.ok(receivedError, 'Should have received an error');
    assert.strictEqual(receivedError.code, 'HTTP_401');
    assert.strictEqual(leakedChat, false, 'Error must not leak as a chat message');
    console.log('  [PASS] Test 2: Provider errors emitted via onError without leaking into chat');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // Test 3: No local Ollama connection attempted
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({ CloudEndpoint: mockEndpoint, CloudApiKey: 'key' })
    });

    const localCheck = await engine.diagnostics.checkLocalEngine();
    assert.strictEqual(localCheck.disabled, true, 'Local Ollama engine check must be disabled');
    console.log('  [PASS] Test 3: Local Ollama engine check is completely disabled');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  // Test 4: Free AI execution with no API key fallback (out-of-the-box mode)
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({}) // No API key, no custom endpoint
    });

    const cloudConfig = engine.inferenceRouter.getCloudConfig();
    assert.strictEqual(cloudConfig.apiKey, null, 'API key should be null in free mode');
    assert.ok(cloudConfig.endpoint.includes('pollinations') || cloudConfig.endpoint.includes('devtoolbox'), 'Default endpoint must be free tier');
    console.log('  [PASS] Test 4: Out-of-the-box free tier requires no API key');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 4:', e.message);
    failed++;
  }

  // Cleanup
  await new Promise(r => mockServer.close(r));
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }

  console.log(`\nProvider Routing Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runProviderRoutingTests().catch(e => {
    console.error('Test runner failure:', e);
    process.exit(1);
  });
}

module.exports = { runProviderRoutingTests };
