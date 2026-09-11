import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

import "./ipc/app.ts";
import "./ipc/dialog.ts";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let mainWindow: BrowserWindow | null = null;



function createWindow() {

  const win = new BrowserWindow({

    width: 1200,
    height: 800,

    webPreferences: {

      preload: path.join(
        __dirname,
        "preload.js"
      ),

      contextIsolation: true,
      nodeIntegration: false,

    },

  });
  mainWindow = win;


  if(process.env.VITE_DEV_SERVER_URL){

    win.loadURL(
      process.env.VITE_DEV_SERVER_URL
    );

  }else{

    win.loadFile(
      path.join(
        __dirname,
        "../dist/index.html"
      )
    );

  }

}

app.whenReady()
.then(()=>{

  createWindow();

});


app.on(
  "window-all-closed",
  ()=>{

    if(process.platform !== "darwin"){
      app.quit();
    }

  }
);