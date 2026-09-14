import { contextBridge, ipcRenderer } from "electron";


contextBridge.exposeInMainWorld("electron", {
  app: {
    getName: () => ipcRenderer.invoke("app-name")
  }
});

contextBridge.exposeInMainWorld("electronAPI", {
});