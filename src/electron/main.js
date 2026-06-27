import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
const APPDATA = path.join(app.getPath('userData'), 'data.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../../src/images/youricon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

app.whenReady().then(() => {

  const tray = new Tray(path.join(__dirname, '../../src/images/icon.png'));

  tray.on('click', (event, bounds) => {
    const display = screen.getDisplayNearestPoint({ x: bounds.x, y: bounds.y }); 
    const { workArea } = display; 

    const width = 400; 
    const height = 300; 

    const x = Math.round(workArea.x + workArea.width - width); 
    const y = Math.round(workArea.y + workArea.height - height);

    const popupWin = new BrowserWindow({
      width: 400,
      height: 300,
      x,
      y,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs')
      }
    });

    if (isDev) {
      popupWin.loadURL('http://localhost:5173/popup.html');
    } else {
      popupWin.loadFile(path.join(__dirname, '../../dist/popup.html'));
    }

    popupWin.on('blur', () => popupWin.close());
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (fs.existsSync(APPDATA)) {
    const data = JSON.parse(fs.readFileSync(APPDATA, 'utf-8'));
    data.lastOnline = Date.now();
    fs.writeFileSync(APPDATA, JSON.stringify(data));
  }
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('save', (event, data) => {
  fs.writeFileSync(APPDATA, JSON.stringify(data));
});

ipcMain.handle('load', () => {
  if (fs.existsSync(APPDATA)) {
    return JSON.parse(fs.readFileSync(APPDATA, 'utf-8'));
  }
  return { todos: [], coins: 0 };
});

ipcMain.on('notify', (event, { title, body }) => {
  console.log('notify received', title, body);
  new Notification({ title, body }).show();
});

