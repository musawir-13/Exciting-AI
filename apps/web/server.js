/**
 * Exciting AI — Standalone Web Application Server
 * 
 * Runs Exciting AI in any standard web browser, cloud server, or container (Docker, VPS)
 * without requiring the Electron desktop runtime.
 */

const path = require('path');
const http = require('http');
const fs = require('fs');

// Set root working directory
const rootDir = path.join(__dirname, '..', '..');
process.chdir(rootDir);

const PORT = process.env.PORT || 2020;
console.log('====================================================');
console.log('  Exciting AI — Web Application Edition');
console.log(`  Access URL:       http://localhost:${PORT}`);
console.log('  Multi-Platform:   Browser / Cloud / Container');
console.log('====================================================');

// Start the core Exciting AI server
require(path.join(rootDir, 'server.js'));
