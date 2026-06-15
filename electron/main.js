const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer, clipboard, nativeImage } = require('electron')
const path = require('path')

let overlayWindow = null
let annotateWindow = null

function createOverlay() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  overlayWindow.loadURL('http://localhost:5173/#overlay')
  overlayWindow.setIgnoreMouseEvents(false)
}

function createAnnotateWindow(dataURL) {
  annotateWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'PXL',
    frame: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  annotateWindow.loadURL('http://localhost:5173/#annotate')
  annotateWindow.webContents.on('did-finish-load', () => {
    annotateWindow.webContents.send('init-capture', dataURL)
  })
}

app.whenReady().then(() => {
  // keep app running with a hidden main window
  const hidden = new BrowserWindow({ show: false })
  hidden.loadURL('http://localhost:5173')

  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (overlayWindow) {
      overlayWindow.close()
      overlayWindow = null
    } else {
      createOverlay()
    }
  })

  ipcMain.on('close-overlay', () => {
    if (overlayWindow) {
      overlayWindow.close()
      overlayWindow = null
    }
  })

  ipcMain.handle('capture-region', async (event, { x, y, w, h }) => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width, height }
    })
    const cropped = sources[0].thumbnail.crop({ x, y, width: w, height: h })
    const dataURL = cropped.toDataURL()

    if (overlayWindow) {
      overlayWindow.close()
      overlayWindow = null
    }

    createAnnotateWindow(dataURL)
    return 'done'
  })

  ipcMain.handle('copy-image', async (event, dataURL) => {
    const image = nativeImage.createFromDataURL(dataURL)
    clipboard.writeImage(image)
    return 'done'
  })

  ipcMain.on('close-annotate', () => {
    if (annotateWindow) {
      annotateWindow.close()
      annotateWindow = null
    }
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})