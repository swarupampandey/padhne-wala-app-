/**
 * Electron Preload Script
 * 
 * Provides a secure bridge between the renderer (frontend) and main process.
 * Use this to expose safe APIs to the frontend without full Node.js access.
 */

import { contextBridge, ipcRenderer } from "electron";

// Expose secure API to renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getVersion: () => ipcRenderer.invoke("get-app-version"),
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  
  // Example: File operations
  openFile: (options: any) => ipcRenderer.invoke("dialog:openFile", options),
  saveFile: (options: any) => ipcRenderer.invoke("dialog:saveFile", options),
  
  // Example: System info
  getPlatform: () => process.platform,
  getNodeVersion: () => process.versions.node,
  getElectronVersion: () => process.versions.electron,
});

// Declare type for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getVersion: () => Promise<string>;
      getAppPath: () => Promise<string>;
      openFile: (options: any) => Promise<any>;
      saveFile: (options: any) => Promise<any>;
      getPlatform: () => string;
      getNodeVersion: () => string;
      getElectronVersion: () => string;
    };
  }
}
