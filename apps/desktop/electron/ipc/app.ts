import { app, ipcMain } from "electron";


ipcMain.handle(
  "app:getVersion",
  ()=>{

    return app.getVersion();

  }
);