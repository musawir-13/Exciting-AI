const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { createEngine } = require('../engine');

async function runNaturalVariationTests() {
  console.log('\n--- [TEST SUITE 3] Natural Response Variation & Non-Deterministic Sampling ---');
  let passed = 0;
  let failed = 0;

  const testStorageDir = path.join(__dirname, 'test_storage_variation');
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testStorageDir, 'models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'cloud models'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'chats'), { recursive: true });
  fs.mkdirSync(path.join(testStorageDir, 'settings'), { recursive: true });

  const capturedPayloads = [];
  const mockServer = http.createServer((req, res) => {
    if (req.url === '/chat/completions' && req.method === 'POST') {
      let b = '';
      req.on('data', c => b += c);
      req.on('end', () => {
        const payload = JSON.parse(b);
        capturedPayloads.push(payload);
        const userPrompt = payload.messages[payload.messages.length - 1].content;
        let generatedReply = `Response to [${userPrompt}] with temp=${payload.temperature}`;

        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.write(`data: ${JSON.stringify({
          choices: [{ delta: { content: generatedReply } }]
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
  const mockHost = `http://127.0.0.1:${mockPort}`;

  // Test 1: Sampling parameters are non-zero and no fixed seed is forced
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({ CloudEndpoint: mockHost, CloudApiKey: 'key', Temperature: 0.75, TopP: 0.9 })
    });

    await engine.inferenceRouter.routeAndExecute({
      model: 'grok-4.7',
      messages: [{ role: 'user', content: 'Generate a random number or creative poem' }],
      options: {},
      reqId: 'test_var_1',
      chatId: 'cv1',
      onChunk: () => {},
      onThinking: () => {},
      onDone: () => {},
      onError: (err) => { throw err; }
    });

    assert.strictEqual(capturedPayloads.length, 1);
    const sentOptions = capturedPayloads[0];
    assert.strictEqual(sentOptions.temperature, 0.75, 'Temperature should be positive (0.75)');
    assert.strictEqual(sentOptions.top_p, 0.9, 'Top-p should be positive (0.9)');
    assert.strictEqual(sentOptions.seed, undefined, 'No fixed random seed should be passed');
    console.log('  [PASS] Test 1: Default sampling parameters maintain natural temperature and no fixed seed');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 1:', e.message);
    failed++;
  }

  // Test 2: Context-sensitive responses to different prompts
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({ CloudEndpoint: mockHost, CloudApiKey: 'key' })
    });

    let resp1 = '';
    let resp2 = '';

    await engine.inferenceRouter.routeAndExecute({
      model: 'claude-sonnet-5.5',
      messages: [{ role: 'user', content: 'What is the capital of France?' }],
      options: {},
      reqId: 'test_var_2a',
      chatId: 'cv2',
      onChunk: (c) => { resp1 += c; },
      onThinking: () => {},
      onDone: () => {},
      onError: (err) => { throw err; }
    });

    await engine.inferenceRouter.routeAndExecute({
      model: 'claude-sonnet-5.5',
      messages: [{ role: 'user', content: 'How do rockets escape Earth gravity?' }],
      options: {},
      reqId: 'test_var_2b',
      chatId: 'cv2',
      onChunk: (c) => { resp2 += c; },
      onThinking: () => {},
      onDone: () => {},
      onError: (err) => { throw err; }
    });

    assert.notStrictEqual(resp1, resp2, 'Different user prompts must produce different responses');
    assert.ok(!resp1.includes('I am Exciting AI, and I am very excited to meet you!'), 'No hardcoded canned greeting');
    assert.ok(!resp2.includes('I am Exciting AI, and I am very excited to meet you!'), 'No hardcoded canned greeting');
    console.log('  [PASS] Test 2: Different user inputs produce contextually distinct model outputs');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 2:', e.message);
    failed++;
  }

  // Test 3: Custom temperature override works per request
  try {
    const engine = createEngine({
      storageDir: testStorageDir,
      bundledStorageDir: testStorageDir,
      getSettings: () => ({ CloudEndpoint: mockHost, CloudApiKey: 'key', Temperature: 0.5 })
    });

    await engine.inferenceRouter.routeAndExecute({
      model: 'assistant',
      messages: [{ role: 'user', content: 'High creativity prompt' }],
      options: { temperature: 1.2 },
      reqId: 'test_var_3',
      chatId: 'cv3',
      onChunk: () => {},
      onThinking: () => {},
      onDone: () => {},
      onError: (err) => { throw err; }
    });

    const lastPayload = capturedPayloads[capturedPayloads.length - 1];
    assert.strictEqual(lastPayload.temperature, 1.2, 'Caller options must override settings');
    console.log('  [PASS] Test 3: Request-level temperature override properly forwarded to model backend');
    passed++;
  } catch (e) {
    console.error('  [FAIL] Test 3:', e.message);
    failed++;
  }

  // Cleanup
  await new Promise(r => mockServer.close(r));
  if (fs.existsSync(testStorageDir)) {
    fs.rmSync(testStorageDir, { recursive: true, force: true });
  }

  console.log(`\nNatural Variation Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

if (require.main === module) {
  runNaturalVariationTests().catch(e => {
    console.error('Test runner failure:', e);
    process.exit(1);
  });
}

module.exports = { runNaturalVariationTests };
