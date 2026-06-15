import { useEffect, useRef, useState } from 'react'

export default function Overlay() {
  const canvasRef = useRef(null)
  const [selecting, setSelecting] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })
  const [rect, setRect] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }, [])


  useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      window.electronAPI.closeOverlay()
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])



  function handleMouseDown(e) {
    setSelecting(true)
    setStart({ x: e.clientX, y: e.clientY })
    setRect(null)
  }

  function handleMouseMove(e) {
    if (!selecting) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const x = Math.min(e.clientX, start.x)
    const y = Math.min(e.clientY, start.y)
    const w = Math.abs(e.clientX - start.x)
    const h = Math.abs(e.clientY - start.y)

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.clearRect(x, y, w, h)
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
  }

async function handleMouseUp(e) {
  setSelecting(false)
  const x = Math.min(e.clientX, start.x)
  const y = Math.min(e.clientY, start.y)
  const w = Math.abs(e.clientX - start.x)
  const h = Math.abs(e.clientY - start.y)
  if (w < 10 || h < 10) return
  await window.electronAPI.captureRegion({ x, y, w, h })
}

  function handleClose() {
    window.electronAPI.closeOverlay()
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      {rect && (
        <div style={{
          position: 'absolute',
          top: rect.y + rect.h + 8,
          left: rect.x,
          background: '#111',
          border: '1px solid #a855f7',
          borderRadius: 6,
          padding: '6px 12px',
          color: '#a855f7',
          fontFamily: 'monospace',
          fontSize: 13,
          display: 'flex',
          gap: 8
        }}>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontFamily: 'monospace' }}>
            ESC to close
          </button>
        </div>
      )}
    </div>
  )
}