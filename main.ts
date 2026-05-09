/**
 * Electron Main Process Entry Point (Optional)
 * 
 * This file enables running the NEET AI Suite as a desktop app via Electron.
 * 
 * To use:
 * 1. npm install --save-dev electron
 * 2. Add "main": "main.js" to package.json
 * 3. Run: electron .
 * 
 * Note: This is a minimal implementation. Extend as needed for your use case.
 */

import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";

const isDevelopment = () => process.env.NODE_ENV !== "production";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDevelopment()) {
    // Development: Load from Vite dev server
    mainWindow.loadURL("http://localhost:4173");
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from build output
    mainWindow.loadFile(path.join(__dirname, "../dist/public/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  // On macOS, app stays active until user quits explicitly
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // Re-create window when dock icon is clicked on macOS
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers (optional)
ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-app-path", () => app.getAppPath());

// Application Menu
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: "File",
    submenu: [
      {
        label: "Exit",
        accelerator: "CmdOrCtrl+Q",
        click: () => app.quit(),
      },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
