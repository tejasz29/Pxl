const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  closeOverlay: () => ipcRenderer.send('close-overlay'),
  captureRegion: (rect) => ipcRenderer.invoke('capture-region', rect),
  copyImage: (dataURL) => ipcRenderer.invoke('copy-image', dataURL),
  closeAnnotate: () => ipcRenderer.send('close-annotate'),
  onInitCapture: (cb) => ipcRenderer.on('init-capture', (event, dataURL) => cb(dataURL))
})