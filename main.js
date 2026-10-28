const { app, BrowserWindow, shell, Menu, MenuItem, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = process.env.PORT || 2020;

function getUserDataPath() {
  if (app && typeof app.getPath === 'function') {
    try {
      return app.getPath('userData');
    } catch (e) {}
  }
  const base = process.env.APPDATA || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') : path.join(os.homedir(), '.config'));
  return path.join(base, 'Exciting AI');
}

const isPackaged = (app && typeof app.isPackaged === 'boolean') ? app.isPackaged : __dirname.includes('app.asar');

// Resolve writable Storage directory for packaged vs developer mode
if (!process.env.EXCITING_STORAGE_DIR) {
  if (isPackaged) {
    const portableStorage = path.join(path.dirname(process.execPath), 'Storage');
    if (fs.existsSync(portableStorage)) {
      process.env.EXCITING_STORAGE_DIR = portableStorage;
    } else {
      process.env.EXCITING_STORAGE_DIR = path.join(getUserDataPath(), 'Storage');
    }
  } else {
    process.env.EXCITING_STORAGE_DIR = path.join(__dirname, 'Storage');
  }
}

// Local developer storage
const devModelsDir = path.join(process.env.EXCITING_STORAGE_DIR, 'models');

// Start internal HTTP server directly inside the Electron main process
let internalServer = null;
try {
  internalServer = require('./server.js');
} catch (err) {
  console.error('Failed to start internal server:', err);
}

// Native Windows context menu handler
ipcMain.handle('show-context-menu', (event, items) => {
  return new Promise((resolve) => {
    const template = (items || []).map(item => ({
      label: item.label,
      enabled: item.enabled !== false,
      click: () => resolve(item.label)
    }));

    template.push({
      label: 'More tools',
      submenu: [
        {
          label: 'Share',
          click: () => resolve('Share')
        }
      ]
    });

    const menu = Menu.buildFromTemplate(template);
    const win = BrowserWindow.fromWebContents(event.sender);
    menu.popup({
      window: win,
      callback: () => resolve(null)
    });
  });
});

// Enhanced MIME type detection for images, documents, and code
function getEnhancedMimeType(ext) {
  const map = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    avif: 'image/avif',
    tiff: 'image/tiff',
    tif: 'image/tiff',
    // Documents & Data
    txt: 'text/plain',
    md: 'text/markdown',
    markdown: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    rtf: 'application/rtf',
    log: 'text/plain',
    ini: 'text/plain',
    cfg: 'text/plain',
    conf: 'text/plain',
    env: 'text/plain',
    yaml: 'text/yaml',
    yml: 'text/yaml',
    xml: 'application/xml',
    toml: 'text/plain',
    // Code & Scripts
    js: 'text/javascript',
    mjs: 'text/javascript',
    cjs: 'text/javascript',
    jsx: 'text/javascript',
    ts: 'text/typescript',
    tsx: 'text/typescript',
    py: 'text/x-python',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    scss: 'text/x-scss',
    sass: 'text/x-sass',
    less: 'text/x-less',
    c: 'text/x-c',
    cpp: 'text/x-c++',
    cc: 'text/x-c++',
    h: 'text/x-c',
    hpp: 'text/x-c++',
    cs: 'text/plain',
    java: 'text/x-java-source',
    kt: 'text/x-kotlin',
    rs: 'text/x-rust',
    go: 'text/x-go',
    php: 'text/x-php',
    rb: 'text/x-ruby',
    swift: 'text/x-swift',
    sql: 'application/sql',
    sh: 'application/x-sh',
    bash: 'application/x-sh',
    bat: 'application/x-bat',
    cmd: 'application/x-bat',
    ps1: 'text/plain',
    vue: 'text/plain',
    svelte: 'text/plain',
    astro: 'text/plain',
    diff: 'text/plain',
    patch: 'text/plain'
  };
  return map[ext] || 'application/octet-stream';
}

const FILE_DIALOG_FILTERS = [
  {
    name: 'All Supported Files',
    extensions: [
      'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico', 'avif', 'tiff',
      'txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'pdf', 'docx', 'rtf', 'log',
      'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'html', 'css', 'scss',
      'c', 'cpp', 'cc', 'h', 'hpp', 'cs', 'java', 'kt', 'rs', 'go',
      'php', 'rb', 'swift', 'sql', 'sh', 'bat', 'cmd', 'ps1', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env'
    ]
  },
  {
    name: 'Images (*.png; *.jpg; *.jpeg; *.webp; *.gif; *.bmp; *.svg; *.ico; *.avif)',
    extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico', 'avif', 'tiff', 'tif']
  },
  {
    name: 'Source Code & Scripts (*.js; *.ts; *.py; *.cpp; *.java; *.rs; *.go; *.sql; etc.)',
    extensions: [
      'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'cc', 'h', 'hpp',
      'cs', 'rs', 'go', 'php', 'rb', 'swift', 'kt', 'sql', 'sh', 'bash', 'bat', 'cmd', 'ps1',
      'html', 'htm', 'css', 'scss', 'vue', 'svelte', 'astro'
    ]
  },
  {
    name: 'Documents & Data (*.txt; *.md; *.json; *.csv; *.pdf; *.yaml; *.xml; etc.)',
    extensions: ['txt', 'md', 'markdown', 'json', 'csv', 'tsv', 'yaml', 'yml', 'xml', 'toml', 'log', 'ini', 'cfg', 'conf', 'env', 'pdf', 'docx', 'rtf']
  },
  {
    name: 'All Files (*.*)',
    extensions: ['*']
  }
];

function readSingleFileRecord(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 100 * 1024 * 1024) {
      console.warn('Skipping file larger than 100MB:', filePath);
      return null;
    }
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mimeType = getEnhancedMimeType(ext);
    const dataURL = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const isTextReadable = mimeType.startsWith('text/') ||
      ['application/json', 'application/sql', 'application/xml', 'application/x-sh', 'application/x-bat'].includes(mimeType) ||
      ['md', 'markdown', 'json', 'yaml', 'yml', 'toml', 'txt', 'js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css', 'scss', 'c', 'cpp', 'h', 'hpp', 'cs', 'java', 'kt', 'rs', 'go', 'php', 'rb', 'swift', 'sql', 'sh', 'bat', 'cmd', 'ps1', 'vue', 'svelte', 'log', 'env', 'diff', 'patch'].includes(ext);

    let textContent = null;
    if (isTextReadable && stats.size <= 5 * 1024 * 1024) {
      try {
        textContent = buffer.toString('utf8');
      } catch (e) {}
    }

    return {
      filename,
      filePath,
      size: stats.size,
      mimeType,
      dataURL,
      textContent
    };
  } catch (err) {
    console.error('Error reading selected file:', filePath, err);
    return null;
  }
}

// Native multiple files picker handler
ipcMain.handle('select-multiple-files', async (event, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win, {
    title: (options && options.title) || 'Select Files or Images',
    filters: FILE_DIALOG_FILTERS,
    properties: ['openFile', 'multiSelections']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return [];
  }

  const files = [];
  for (const filePath of result.filePaths) {
    const fileRecord = readSingleFileRecord(filePath);
    if (fileRecord) files.push(fileRecord);
  }
  return files;
});

// Native single file picker handler
ipcMain.handle('select-file', async (event, options = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(win, {
    title: (options && options.title) || 'Select File or Image',
    filters: FILE_DIALOG_FILTERS,
    properties: ['openFile']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }
  return readSingleFileRecord(result.filePaths[0]);
});

// Read file directly from path (with bounds)
ipcMain.handle('read-file', async (event, filePath) => {
  if (!filePath || typeof filePath !== 'string') return null;
  return readSingleFileRecord(filePath);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Exciting AI',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#ffffff',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      v8CacheOptions: 'bypassHeatCheck'
    }
  });

  const appURL = `http://127.0.0.1:${PORT}`;

  let retryTimer = null;
  const loadApp = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.loadURL(appURL).catch(() => {
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = setTimeout(loadApp, 250);
    });
  };

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = setTimeout(loadApp, 250);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (retryTimer) clearTimeout(retryTimer);
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  loadApp();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Native context menu on right click for input box, text selection, etc.
  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu();

    if (params.isEditable) {
      menu.append(new MenuItem({ role: 'undo' }));
      menu.append(new MenuItem({ role: 'redo' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'cut' }));
      menu.append(new MenuItem({ role: 'copy' }));
      menu.append(new MenuItem({ role: 'paste' }));
      menu.append(new MenuItem({ role: 'pasteAndMatchStyle' }));
      menu.append(new MenuItem({ role: 'delete' }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'selectAll' }));
      menu.popup({ window: mainWindow });
      return;
    }

    if (params.selectionText && params.selectionText.trim().length > 0) {
      menu.append(new MenuItem({ role: 'copy' }));
      menu.append(new MenuItem({ role: 'selectAll' }));
      menu.popup({ window: mainWindow });
      return;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initApp() {
  if (internalServer && internalServer.listening) {
    createWindow();
  } else if (internalServer && typeof internalServer.on === 'function') {
    let started = false;
    const startOnce = () => {
      if (started) return;
      started = true;
      createWindow();
    };
    internalServer.once('listening', startOnce);
    internalServer.once('error', startOnce);
    setTimeout(startOnce, 400);
  } else {
    createWindow();
  }
}

app.whenReady().then(() => {
  initApp();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
