const { app, BrowserWindow, globalShortcut, ipcMain, screen, desktopCapturer, clipboard, nativeImage, Tray, Menu } = require('electron')

const path = require('path')


let tray = null

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADASURBVDiNpZIxDoMwDEWfK3ASuEJ7KA7U0AP0Lj0Gp2DhCAxISBzEpf//XZoKpWribP2RHX87BoBpmg5mth8R8QRwAHpmdk7vjHNucs4NABhjHgBWAO+cuwAAzrkLgBXA2RiTZuAFQGuttQDMOfcuAN57D6AH0BpjOgAFkDMzsQVgZtZaSwDknFsBJAC01uoA0HtfAbQAemttBVABMMYUgABIKaUK0HtfKKWUFaBt2wLQ3vsIoAfQWWsLoBERIf9+AI+iDu8fGy90AAAAAElFTkSuQmCC'
  )

  tray = new Tray(icon)
  tray.setToolTip('PXL')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Capture (Ctrl+Shift+X)',
      click: () => createOverlay()
    },
    { type: 'separator' },
    {
      label: 'Quit PXL',
      click: () => app.quit()
    }
  ])

  tray.setContextMenu(menu)

  tray.on('click', () => {
    createOverlay()
  })
}



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
  createTray()

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

  function createToast() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const toast = new BrowserWindow({
    width: 260,
    height: 60,
    x: width - 280,
    y: height - 80,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  toast.loadURL('http://localhost:5173/#toast')

  setTimeout(() => {
    if (!toast.isDestroyed()) toast.close()
  }, 2000)
}



    ipcMain.handle('copy-image', async (event, dataURL) => {
      const image = nativeImage.createFromDataURL(dataURL)
      clipboard.writeImage(image)
      createToast()
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

app.on('window-all-closed', (e) => {
  e.preventDefault()
})


