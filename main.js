const electron = require('electron');
// // 控制应用生命周期的模块
// const {app} = electron;
// // 创建本地浏览器窗口的模块
// const {BrowserWindow} = electron;
// const Menu = require('electron').Menu;
// var template = [];
// var menu = Menu.buildFromTemplate(template)
// Menu.setApplicationMenu(menu);
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var mainWindow=null;
app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 640,
        width: 860,frame: true,
        autoHideMenuBar: false,
        resizable: true,
        minWidth:860,
        minHeight:640
    });

        // ,frame: false autoHideMenuBar: true,  resizable: false,
    mainWindow.loadURL('file://' + __dirname + '/webContent/index.html');
});
// 关闭按钮
const ipcMain = electron.ipcMain;
ipcMain.on('close-main-window',function(){
    app.quit();
});
// 小窗口到大窗口
const ipcMain1 = require('electron').ipcMain;
ipcMain1.on('change-main-window',function(){
    mainWindow.setResizable(true);
    // mainWindow.setResizable(true); 
    // 暂时不予许修改大小
});


//退出
ipcMain.on('window-all-closed', () => { app.quit(); });
//小化
ipcMain.on('hide-window', () => { mainWindow.minimize(); });
//最大化
ipcMain.on('show-window', () => { mainWindow.maximize(); });
//还原
ipcMain.on('orignal-window', () => { mainWindow.unmaximize(); });

// 指向窗口对象的一个全局引用，如果没有这个引用，那么当该javascript对象被垃圾回收的
// 时候该窗口将会自动关闭
// let win;

// function createWindow() {
//   // 创建一个新的浏览器窗口
//   win = new BrowserWindow({width: 330, height: 550});//570+50

//   // 并且装载应用的index.html页面
//   win.loadURL('file://' + __dirname + '/BBChatWeb/webContent/index.html');

//   // 打开开发工具页面
// //   win.webContents.openDevTools();

//   // 当窗口关闭时调用的方法
//   win.on('closed', () => {
//     // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
//     // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
//     win = null;
//   });
// }

// // 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// // 有些API只能在该事件发生后才能被使用。
// app.on('ready', createWindow);

// // 当所有的窗口被关闭后退出应用
// app.on('window-all-closed', () => {
//   // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他
//   // 窗口打开
//   if (win === null) {
//     createWindow();
//   }
// });

// 在这个文件后面你可以直接包含你应用特定的由主进程运行的代码。
// 也可以把这些代码放在另一个文件中然后在这里导入。