const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Synergy Network logo
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  if (isDev) {
    // In development, try to load from localhost:3000 first
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // If that fails, try loading the built app
      mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// IPC handlers for file operations and RPC calls
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Validator Key Files', extensions: ['json', 'key'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('dialog:saveFile', async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultPath || 'validator-config.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

// RPC communication handlers
ipcMain.handle('rpc:call', async (event, method, params) => {
  const axios = require('axios');

  try {
    const response = await axios.post('http://localhost:8545', {
      jsonrpc: '2.0',
      method: method,
      params: params || [],
      id: Date.now(),
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    return response.data.result;
  } catch (error) {
    console.error(`RPC call ${method} failed:`, error.message);
    throw error;
  }
});

// Validator management handlers
ipcMain.handle('validator:start', async (event, config) => {
  // In a real implementation, this would start the validator node
  console.log('Starting validator with config:', config);
  return { success: true, message: 'Validator started' };
});

ipcMain.handle('validator:stop', async () => {
  // In a real implementation, this would stop the validator node
  console.log('Stopping validator');
  return { success: true, message: 'Validator stopped' };
});

ipcMain.handle('validator:status', async () => {
  // In a real implementation, this would check validator status
  return {
    status: 'running',
    uptime: '2h 15m',
    blocksProduced: 1247,
    lastBlock: '5 minutes ago'
  };
});
