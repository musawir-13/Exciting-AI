/**
 * Exciting AI — Production Web Build Script
 * Packages the standalone browser edition of Exciting AI.
 */

const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function buildWeb() {
  console.log('====================================================');
  console.log('  Exciting AI — Web Edition Packager');
  console.log('====================================================');

  const rootDir = path.join(__dirname, '..');
  const webDistDir = path.join(rootDir, 'dist', 'web');

  if (fs.existsSync(webDistDir)) {
    fs.rmSync(webDistDir, { recursive: true, force: true });
  }
  fs.mkdirSync(webDistDir, { recursive: true });

  console.log('1. Copying frontend assets...');
  copyRecursive(path.join(rootDir, 'public'), path.join(webDistDir, 'public'));

  console.log('2. Staging server and engine files...');
  copyRecursive(path.join(rootDir, 'engine'), path.join(webDistDir, 'engine'));
  copyRecursive(path.join(rootDir, 'Storage', 'models'), path.join(webDistDir, 'Storage', 'models'));

  fs.copyFileSync(path.join(rootDir, 'server.js'), path.join(webDistDir, 'server.js'));
  fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(webDistDir, 'package.json'));

  // Generate web entry
  const webEntry = `/**
 * Standalone Web Runner for Exciting AI
 * Usage: node server.js
 */
process.env.IS_STANDALONE_WEB = 'true';
process.env.PORT = process.env.PORT || 2020;
require('./server.js');
`;
  fs.writeFileSync(path.join(webDistDir, 'index.js'), webEntry);

  console.log(`3. Production web package generated at: ${webDistDir}`);
  console.log('   Ready for deployment to Vercel, Netlify, Docker, or any Node.js VPS.');
  console.log('====================================================');
}

if (require.main === module) {
  buildWeb();
}

module.exports = { buildWeb };
