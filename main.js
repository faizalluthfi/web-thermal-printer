const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

const log = require('electron-log');

const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

let printerPort;
let printer = new ThermalPrinter({ type: PrinterTypes.EPSON });
let initPrinter = port => {
  if (port != printerPort) {
    printerPort = port;
    printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: port
    });
  }
};
let printNote = note => {
  printer.clear();
  printer.println(note);
  printer.cut();
  if (printerPort) {
    try {
      printer.execute();
      win.webContents.send('print-success');
      console.log('Print done');
    } catch (error) {
      console.log('Print failed');
    }
  } else {
    win.webContents.send('no-printer-port');
  }
};
ipcMain.on('init-printer', (_e, arg) => initPrinter(arg));
ipcMain.on('test-printer', (event, arg) => {
  let oldPort = printerPort;
  initPrinter(arg.printerPath);
  printNote('Print berhasil');
  initPrinter(oldPort);
  event.returnValue = true;
});

autoUpdater.logger = log;
autoUpdater.logger['transports'].file.level = 'info';
ipcMain.on('apply-update', (e, arg) => {
  autoUpdater.quitAndInstall();
});

let win;

app.on('ready', () => {
  // Global variables
  global['autoUpdater'] = autoUpdater;

  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile('html/index.html');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});