import { ipcMain, dialog } from "electron";


ipcMain.handle(
  "dialog:openFile",
  async()=>{


    const result = await dialog.showOpenDialog({

      properties:[
        "openFile"
      ]

    });


    return result.filePaths[0];

  }
);