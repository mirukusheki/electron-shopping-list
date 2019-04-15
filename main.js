const electron = require('electron');
const url      = require('url');
const path     = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function () {
  //Create new window
  mainWindow = new BrowserWindow({});
  //load HTML File into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes : true
  }));

  //Quit app when closed
  mainWindow.on('closed', function () {
    app.quit()
  });

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //insert Menu
  Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow() {
//Create new window
  addWindow = new BrowserWindow({
    width : 300,
    height: 200,
    title : 'Add Shopping List Item'
  });
  //load HTML File into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes : true
  }));
  //Garbage collection handle
  addWindow.on('closed', function () {
    addWindow = null;
  })
}

//Catch item add
ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
  {
    label  : 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label      : 'Quit',
        accelerator: process.platform === 'Darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
];

//If Mac, add empty object to menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({});
}

//add developer tool item if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label  : 'Developer Tools',
    submenu: [
      {
        label      : 'Toggle DevTools',
        accelerator: process.platform === 'Darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}