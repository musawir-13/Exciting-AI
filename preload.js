const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronNative', {
  showContextMenu: (items) => ipcRenderer.invoke('show-context-menu', items)
});

contextBridge.exposeInMainWorld('webview', {
  selectMultipleFiles: (options) => ipcRenderer.invoke('select-multiple-files', options),
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath)
});
