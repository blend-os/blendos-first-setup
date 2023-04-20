const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { existsSync } = require('fs')

var mainWindow = undefined

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 900,
    minHeight: 700,
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
        app.quit()
      }
    })
  }

  mainWindow.on('close', handler)

  ipcMain.on('app-quit', (e, msg) => {
    mainWindow.removeListener('close', handler)

    require('child_process').spawnSync('bash', ['-c', 'mkdir -p ~/.config; touch ~/.config/blendos-first-setup-done'])

    app.quit()
  })

  mainWindow.setMenu(null)

  mainWindow.loadFile('src/index.html')
}

app.whenReady().then(() => {
  if (existsSync(require('os').homedir() + '/.config/blendos-first-setup-done')) {
    app.quit()
  } else {
    setTimeout(createWindow, 2000)
  }
})

app.on('window-all-closed', function () {
  app.quit()
})
