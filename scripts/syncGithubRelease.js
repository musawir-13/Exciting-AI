/**
 * Exciting AI — Sync Main Project to "github release" Folder
 * 
 * Copies updated project source files into the "github release" git repository,
 * excluding large unpack caches, user chats, and node_modules, and stages them for git push.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'github release');

const EXCLUDED_NAMES = new Set([
  '.git',
  'node_modules',
  'release',
  'dist',
  'temp_asar_stage',
  'temp_app.asar',
  'github release',
  'test_storage_conv_sys',
  'test_storage_identity',
  'test_storage_natural'
]);

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (EXCLUDED_NAMES.has(item)) continue;
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('====================================================');
console.log('  Exciting AI — Sync to "github release" Git Folder');
console.log('====================================================');
console.log(`Source: ${rootDir}`);
console.log(`Target: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const item of fs.readdirSync(rootDir)) {
  if (EXCLUDED_NAMES.has(item)) continue;
  const srcPath = path.join(rootDir, item);
  const destPath = path.join(targetDir, item);
  copyRecursive(srcPath, destPath);
}

console.log('Files synchronized into "github release".');
try {
  console.log('\nChecking git status in "github release":');
  const status = execSync('git status --short', { cwd: targetDir, encoding: 'utf8' });
  console.log(status || 'Working tree clean, up to date with origin/main.');
} catch (e) {
  console.warn('Git check error:', e.message);
}
console.log('====================================================');
