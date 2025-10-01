const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialog operations
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultPath) => ipcRenderer.invoke('dialog:saveFile', defaultPath),

  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // RPC communication (we'll add this later)
  rpcCall: (method, params) => ipcRenderer.invoke('rpc:call', method, params),

  // Validator operations (we'll add these later)
  startValidator: (config) => ipcRenderer.invoke('validator:start', config),
  stopValidator: () => ipcRenderer.invoke('validator:stop'),
  getValidatorStatus: () => ipcRenderer.invoke('validator:status'),

  // Platform-specific operations
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
});

// Also expose a simple API for common operations
contextBridge.exposeInMainWorld('validatorAPI', {
  // Testnet RPC operations
  getBlockNumber: () => ipcRenderer.invoke('testnet:getBlockNumber'),
  getValidators: () => ipcRenderer.invoke('testnet:getValidators'),
  getValidatorInfo: (address) => ipcRenderer.invoke('testnet:getValidatorInfo', address),

  // Validator management
  registerValidator: (validatorData) => ipcRenderer.invoke('validator:register', validatorData),
  getValidatorStats: (address) => ipcRenderer.invoke('validator:getStats', address),
});
