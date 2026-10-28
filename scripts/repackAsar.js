const asar = require('@electron/asar');
const path = require('path');
const fs = require('fs');

async function pack() {
  const rootDir = path.join(__dirname, '..');
  const stageDir = path.join(rootDir, 'temp_asar_stage');
  const targetAsar = path.join(rootDir, 'release', 'win-unpacked', 'resources', 'app.asar');
  const tempAsar = path.join(rootDir, 'temp_app.asar');

  console.log('Creating clean staging directory...');
  if (fs.existsSync(stageDir)) {
    fs.rmSync(stageDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stageDir, { recursive: true });

  // Helper to copy recursively
  function copyRecursive(src, dest) {
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

  // Copy essential files
  const topFiles = ['main.js', 'preload.js', 'server.js', 'package.json', 'README.md', 'favicon.png'];
  for (const f of topFiles) {
    const srcPath = path.join(rootDir, f);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(stageDir, f));
    }
  }

  // Copy directories
  const dirs = ['engine', 'public', 'assets'];
  for (const d of dirs) {
    const srcPath = path.join(rootDir, d);
    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, path.join(stageDir, d));
    }
  }

  // Copy Storage/models only
  const modelsSrc = path.join(rootDir, 'Storage', 'models');
  const modelsDest = path.join(stageDir, 'Storage', 'models');
  if (fs.existsSync(modelsSrc)) {
    copyRecursive(modelsSrc, modelsDest);
  }

  console.log('Packaging app.asar with @electron/asar...');
  await asar.createPackage(stageDir, tempAsar);

  const stat = fs.statSync(tempAsar);
  console.log(`Generated app.asar (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);

  if (fs.existsSync(targetAsar)) {
    fs.copyFileSync(tempAsar, targetAsar);
    console.log(`Successfully updated: ${targetAsar}`);
  }

  // Clean up staging files
  fs.rmSync(tempAsar, { force: true });
  fs.rmSync(stageDir, { recursive: true, force: true });
  console.log('Done!');
}

pack().catch(err => {
  console.error('Packaging failed:', err);
  process.exit(1);
});
