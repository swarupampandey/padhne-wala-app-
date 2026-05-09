"use strict";
/**
 * Electron Preload Script
 *
 * Provides a secure bridge between the renderer (frontend) and main process.
 * Use this to expose safe APIs to the frontend without full Node.js access.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose secure API to renderer process
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    // App info
    getVersion: () => electron_1.ipcRenderer.invoke("get-app-version"),
    getAppPath: () => electron_1.ipcRenderer.invoke("get-app-path"),
    // Example: File operations
    openFile: (options) => electron_1.ipcRenderer.invoke("dialog:openFile", options),
    saveFile: (options) => electron_1.ipcRenderer.invoke("dialog:saveFile", options),
    // Example: System info
    getPlatform: () => process.platform,
    getNodeVersion: () => process.versions.node,
    getElectronVersion: () => process.versions.electron,
});
