import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from './server.js'; // 함수 import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'public/vite.svg')
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 서버가 뜰 때까지 잠시 대기
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3001');
    }, 1000);
  }
}

app.whenReady().then(() => {
  // [중요] 운영체제별 안전한 데이터 저장 경로 가져오기
  // Linux: ~/.config/roadmap-viewer/
  // Windows: %APPDATA%/RoadmapViewer/
  const userDataPath = app.getPath('userData');
  
  // 리소스 경로 (패키징된 내부 경로)
  const resourcesPath = app.isPackaged ? process.resourcesPath : __dirname;

  // 서버 시작 (경로 전달)
  startServer(userDataPath, resourcesPath);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});