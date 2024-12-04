const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
const { stat } = require('fs/promises')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  } else {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  }

  // 创建应用菜单
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Handle file selection
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mkv', 'webm', 'avi'] }
    ]
  })

  if (!result.canceled) {
    const filePath = result.filePaths[0]
    const stats = await stat(filePath)
    return {
      filePath,
      size: stats.size
    }
  }
  return { filePath: null }
})

// Handle video export
ipcMain.handle('export-video', async (event, { inputPath, format, speed }) => {
  const outputPath = await dialog.showSaveDialog({
    defaultPath: path.join(
      path.dirname(inputPath),
      `output_${speed}x.${format}`
    ),
    filters: [
      { name: 'Video', extensions: [format] }
    ]
  })

  if (outputPath.canceled) return

  return new Promise((resolve, reject) => {
    let progress = 0

    ffmpeg(inputPath)
      .videoFilters(`setpts=${1/speed}*PTS`)
      .audioFilters(`atempo=${speed}`)
      .format(format)
      .on('progress', (info) => {
        progress = Math.round(info.percent)
        event.sender.send('export-progress', progress)
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath.filePath)
  })
})

