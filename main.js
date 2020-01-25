const { app, BrowserWindow } = require('electron');

let win;

app.on('ready', () => {
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