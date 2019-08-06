const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, clipboard, nativeImage } = require('electron');
const webpackConfig = require('./webpack/dev');
const path = require('path');

const WFMultiple = 1;
const WFWWidth = WFMultiple * 248;
const WFCPadding = WFMultiple * 4;

function createWindow () {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: WFWWidth + 2 * WFCPadding,
    height: 416,
    // file: './index.html'
    nodeIntegration: false,
  });

  // 然后加载应用的 index.html。
  // win.loadFile('./dist/index.html');
  win.loadURL(`http://localhost:${ webpackConfig.devServer.port }/index.html`);

  // 打开开发者工具
  win.webContents.openDevTools();
}


const handleReady = () => {
  createWindow();

  // let appIcon = new Tray('./public/img/ic_eighth.ico');
  appIcon = new Tray(path.resolve(__dirname, './public/img/tray-icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' }
  ]);

  // pluginArr.map((item) => {
  //   item.initPlugin();
  // });

  appIcon.setContextMenu(contextMenu);
}

app.on('ready', handleReady);
