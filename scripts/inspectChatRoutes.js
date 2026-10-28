const fs = require('fs');
const content = fs.readFileSync('public/assets/index--k3l9yqh.js', 'utf8');

// Find /c/$chatId definition
const cChatIdx = content.indexOf('"/c/$chatId"');
console.log('/c/$chatId snippet:');
console.log(content.substring(cChatIdx - 50, cChatIdx + 400));

// Find sidebar navigation aA
const aaIdx = content.indexOf('function aA(');
console.log('\naA snippet:');
console.log(content.substring(aaIdx, aaIdx + 1500));
