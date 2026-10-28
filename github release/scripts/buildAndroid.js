/**
 * Exciting AI — Android Mobile Build Script
 * Syncs the web client assets into Android assets and packages the distribution.
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

async function buildAndroid() {
  console.log('====================================================');
  console.log('  Exciting AI — Android Application Packager');
  console.log('====================================================');

  const rootDir = path.join(__dirname, '..');
  const androidAssetsDir = path.join(rootDir, 'apps', 'mobile', 'android', 'app', 'src', 'main', 'assets', 'www');
  const releaseAndroidDir = path.join(rootDir, 'release', 'android');

  console.log('1. Syncing web assets to Android assets directory...');
  if (fs.existsSync(androidAssetsDir)) {
    fs.rmSync(androidAssetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(androidAssetsDir, { recursive: true });

  // Copy public web assets
  const publicDir = path.join(rootDir, 'public');
  copyRecursive(publicDir, androidAssetsDir);

  console.log('2. Preparing release/android output directory...');
  fs.mkdirSync(releaseAndroidDir, { recursive: true });

  // Generate metadata and manifest
  const manifest = {
    appId: "com.exciting.ai",
    appName: "Exciting AI",
    version: "1.0.0",
    versionCode: 1,
    minSdkVersion: 24,
    targetSdkVersion: 34,
    developer: "Ubaid",
    company: "IDeV",
    repository: "https://github.com/musawir-13/Exciting-AI.git",
    builtAt: new Date().toISOString(),
    features: [
      "1,927 Model Catalogue Support",
      "Shared Web Access Engine",
      "Full Touch & Keyboard Responsive Design",
      "Safe Areas & Offline Persistence"
    ]
  };

  fs.writeFileSync(
    path.join(releaseAndroidDir, 'build-info.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('3. Android project synchronized successfully at: apps/mobile/android');
  console.log(`4. Target APK/AAB build output staged at: ${releaseAndroidDir}`);
  console.log('====================================================');
}

if (require.main === module) {
  buildAndroid();
}

module.exports = { buildAndroid };
