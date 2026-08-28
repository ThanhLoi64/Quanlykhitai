export {};


declare global {


 interface Window {

  electronAPI: {

    app:{
      getVersion():Promise<string>;
    };


    dialog:{
      openFile():Promise<string>;
    };

    updater: {
      onAvailable(callback: (info: { version: string }) => void): () => void;
      onDownloaded(callback: (info: { version: string }) => void): () => void;
      download(): Promise<void>;
      install(): Promise<void>;
    };


  };

 }


}