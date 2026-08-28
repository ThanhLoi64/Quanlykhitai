import { contextBridge, ipcRenderer } from "electron";


contextBridge.exposeInMainWorld("electron", {
  app: {
    getName: () => ipcRenderer.invoke("app-name")
  }
});

contextBridge.exposeInMainWorld("electronAPI", {
  updater: {
    onAvailable: (callback: (info: { version: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, info: { version: string }) => callback(info);
      ipcRenderer.on("updater:available", listener);
      return () => ipcRenderer.removeListener("updater:available", listener);
    },
    onDownloaded: (callback: (info: { version: string }) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, info: { version: string }) => callback(info);
      ipcRenderer.on("updater:downloaded", listener);
      return () => ipcRenderer.removeListener("updater:downloaded", listener);
    },
    download: () => ipcRenderer.invoke("updater:download"),
    install: () => ipcRenderer.invoke("updater:install"),
  },
});