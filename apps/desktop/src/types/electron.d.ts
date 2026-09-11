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

  };

 }


}