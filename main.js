const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { existsSync } = require('fs')

var mainWindow = undefined

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  })

  let handler = (e) => {
    e.preventDefault()

    const choice = dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Cancel', 'Ok'],
      title: 'Are you sure?',
      message: "It's recommended that you go through the First Setup guide, even if you're an experienced user of other Linux distributions. First Setup will be shown again on the next login."
    }).then((val) => {
      if (val.response === 1) {
        mainWindow.removeListener('close', handler)
        mainWindow.close()
      }
    })
  }

  mainWindow.on('close', handler)

  ipcMain.on('app-quit', (e, msg) => {
    mainWindow.removeListener('close', handler)

    require('child_process').spawnSync('bash', ['-c', 'mkdir -p ~/.config; touch ~/.config/blendos-first-setup-done'])

    mainWindow.close()
  })

  mainWindow.setMenu(null)

  if (existsSync('/mnt/iso-update/.successful-update')) {
    mainWindow.removeListener('close', handler)
    mainWindow.loadFile('src/update.html')
  } else {
    mainWindow.loadFile('src/index.html')
  }
}

app.whenReady().then(() => {
  require('child_process').spawn('categorize_apps_gnome')
  if (!(existsSync('/run/archiso'))) {
    if (!(existsSync(require('os').homedir() + '/.config/blendos-first-setup-done'))) {
      setTimeout(createWindow, 2000)
    } else if (existsSync('/mnt/iso-update/.successful-update')) {
      setTimeout(createWindow, 2000)
    }
  }
})
