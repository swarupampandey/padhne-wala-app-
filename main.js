"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDevelopment = () => process.env.NODE_ENV !== "production";
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    if (isDevelopment()) {
        // Development: Load from Vite dev server
        mainWindow.loadURL("http://localhost:4173");
        mainWindow.webContents.openDevTools();
    }
    else {
        // Production: Load from build output
        mainWindow.loadFile(path_1.default.join(__dirname, "../dist/public/index.html"));
    }
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", () => {
    // On macOS, app stays active until user quits explicitly
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    // Re-create window when dock icon is clicked on macOS
    if (mainWindow === null) {
        createWindow();
    }
});
// IPC Handlers (optional)
electron_1.ipcMain.handle("get-app-version", () => electron_1.app.getVersion());
electron_1.ipcMain.handle("get-app-path", () => electron_1.app.getAppPath());
// Application Menu
const template = [
    {
        label: "File",
        submenu: [
            {
                label: "Exit",
                accelerator: "CmdOrCtrl+Q",
                click: () => electron_1.app.quit(),
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
electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
