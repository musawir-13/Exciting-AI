const assert = require('assert');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { createEngine } = require('../engine');

async function runTests() {
  console.log('\n=== Testing Chats Default Screen, Apps Removal & Enhanced File/Image Handling ===\n');

  // Test 1: Verify index--k3l9yqh.js routes and sidebar
  console.log('1. Verifying SPA routes and sidebar in public/assets/index--k3l9yqh.js...');
  const jsContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'index--k3l9yqh.js'), 'utf8');

  // Verify Root route redirects to /c/$chatId {chatId:"new"}
  assert.ok(
    jsContent.includes('throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})}});'),
    'Root route must redirect to /c/$chatId with chatId: "new"'
  );
  console.log('  ✓ Root route successfully redirects directly to Chats screen (/c/new)');

  // Verify /connect redirects to /c/$chatId {chatId:"new"}
  assert.ok(
    jsContent.includes('Ef("/connect")({beforeLoad:()=>{throw cm({to:"/c/$chatId",params:{chatId:"new"},mask:{to:"/"}})},component:()=>null});'),
    '/connect route must redirect to Chats screen'
  );
  console.log('  ✓ /connect route successfully redirects to Chats screen');

  // Verify Apps button is absent from sidebar navigation
  assert.ok(
    !jsContent.includes('className:t("apps"),draggable:!1,children:[x.jsx(wq,{className:"h-5 w-5 stroke-current"}),x.jsx("span",{className:"truncate",children:"Apps"})]'),
    'Sidebar navigation must not have an Apps button'
  );
  console.log('  ✓ Sidebar navigation Apps button completely removed');

  // Test 2: Verify public/index.html is clean
  console.log('2. Verifying public/index.html...');
  const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  assert.ok(!htmlContent.includes('company-apps-hub-view'), 'public/index.html must not contain company-apps-hub-view');
  assert.ok(!htmlContent.includes('/api/v1/companies'), 'public/index.html must not contain company API script');
  console.log('  ✓ public/index.html is clean and free of leftover app hub elements');

  // Test 3: Verify File and Image Extensions in bundle
  console.log('3. Verifying extended image and file format support in client bundle...');
  assert.ok(jsContent.includes('["png","jpg","jpeg","gif","webp","bmp","svg","ico","avif","tiff"]'), 'Lo(e) must support expanded image extensions');
  assert.ok(jsContent.includes('Efe=["png","jpg","jpeg","webp","gif","bmp","svg","ico","avif","tiff"]'), 'Efe must support expanded image extensions');
  console.log('  ✓ Frontend bundle supports PNG, JPG, JPEG, GIF, WEBP, BMP, SVG, ICO, AVIF, TIFF');

  // Test 4: Verify ConversationManager attachment decoding
  console.log('4. Verifying ConversationManager robust attachment handling...');
  const testStorageDir = path.join(__dirname, 'test_storage_files');
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

  // Case A: Attach a Python script as serialized Uint8Array
  const pyCode = 'def calculate_metrics(values):\n    return sum(values) / len(values)\n';
  const pyBuffer = Buffer.from(pyCode, 'utf8');
  const pyObj = {};
  for (let i = 0; i < pyBuffer.length; i++) pyObj[i] = pyBuffer[i];

  const res1 = cm.addUserMessage('chat_files_1', 'Can you review this code?', 'qwen2.5:7b', [
    { filename: 'metrics.py', data: pyObj }
  ]);

  assert.ok(res1.userMsg.content.includes('[Attached File: metrics.py]'), 'User prompt must contain attached file header');
  assert.ok(res1.userMsg.content.includes('def calculate_metrics(values):'), 'User prompt must contain decoded code content');
  assert.ok(res1.userMsg.attachments && res1.userMsg.attachments.length === 1, 'Attachments metadata must be preserved');
  console.log('  ✓ Serialized Uint8Array code attachment decoded and formatted into code fence');

  // Case B: Attach an image as data URL
  const imgPngBytes = Buffer.from('FAKE_PNG_BINARY_DATA', 'utf8');
  const imgDataUrl = `data:image/png;base64,${imgPngBytes.toString('base64')}`;

  const res2 = cm.addUserMessage('chat_files_2', 'What is shown in this picture?', 'gpt-4o', [
    { filename: 'diagram.png', dataURL: imgDataUrl }
  ]);

  assert.ok(res2.userMsg.images && res2.userMsg.images.length === 1, 'Image must be added to userMsg.images');
  assert.ok(res2.userMsg.images[0].startsWith('data:image/png;base64,'), 'Image data URL must be preserved');
  console.log('  ✓ Image attachment correctly identified and stored in userMsg.images');

  // Case C: Multi-attachment (1 image + 1 JSON file)
  const jsonContent = JSON.stringify({ server: 'production', status: 'online' }, null, 2);
  const res3 = cm.addUserMessage('chat_files_3', 'Here are server logs and screenshot', 'claude-sonnet-5.5', [
    { filename: 'screenshot.webp', data: Array.from(Buffer.from('WEBP_IMAGE_BYTES')) },
    { filename: 'config.json', textContent: jsonContent }
  ]);

  assert.ok(res3.userMsg.images && res3.userMsg.images.length === 1, 'Should have 1 image');
  assert.ok(res3.userMsg.content.includes('[Attached File: config.json]'), 'Should include attached JSON file');
  assert.ok(res3.userMsg.content.includes('"server": "production"'), 'Should decode JSON file text');
  console.log('  ✓ Multi-attachment with mixed image and text file handled seamlessly');

  // Test 5: Verify Chat Persistence with Attachments
  console.log('5. Verifying Chat persistence across reloads...');
  const loadedChats = cm.loadChats();
  const chat3 = loadedChats.find(c => c.id === 'chat_files_3');
  assert.ok(chat3, 'Chat session 3 must persist on disk');
  assert.ok(chat3.messages[0].images.length === 1, 'Images must persist on disk');
  assert.ok(chat3.messages[0].attachments.length === 2, 'Attachments metadata must persist on disk');
  console.log('  ✓ Persisted chat verified with image and attachment fidelity');

  // Clean up test storage
  fs.rmSync(testStorageDir, { recursive: true, force: true });

  console.log('\n--- All Enhanced File & Image Tests Passed Successfully! ---\n');
}

if (require.main === module) {
  runTests().catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });
}

module.exports = { runEnhancedFilesAndChatDefaultTests: runTests };
