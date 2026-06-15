import { useEffect, useRef, useState } from 'react'

const COLORS = ['#a855f7', '#ef4444', '#3b82f6', '#facc15', '#ffffff']
const TOOLS = ['arrow', 'text', 'highlight']

export default function Annotate() {
  const bgRef = useRef(null)
  const drawRef = useRef(null)
  const [tool, setTool] = useState('arrow')
  const [color, setColor] = useState('#a855f7')
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [history, setHistory] = useState([])
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [textInput, setTextInput] = useState(null) // { x, y, canvasX, canvasY }
  const [textValue, setTextValue] = useState('')
  const textRef = useRef(null)

  useEffect(() => {
    window.electronAPI.onInitCapture((dataURL) => {
      const img = new Image()
      img.onload = () => {
        setImgSize({ w: img.width, h: img.height })
        const bg = bgRef.current
        bg.width = img.width
        bg.height = img.height
        const draw = drawRef.current
        draw.width = img.width
        draw.height = img.height
        bg.getContext('2d').drawImage(img, 0, 0)
      }
      img.src = dataURL
    })
  }, [])

  useEffect(() => {
    if (textInput && textRef.current) {
      textRef.current.focus()
    }
  }, [textInput])

  function saveHistory() {
    const draw = drawRef.current
    setHistory(h => [...h, draw.toDataURL()])
  }

  function undo() {
    const draw = drawRef.current
    const ctx = draw.getContext('2d')
    if (history.length === 0) {
      ctx.clearRect(0, 0, draw.width, draw.height)
      return
    }
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, draw.width, draw.height)
      ctx.drawImage(img, 0, 0)
    }
    img.src = prev
  }

  function getPos(e) {
    const rect = drawRef.current.getBoundingClientRect()
    return {
      screenX: e.clientX,
      screenY: e.clientY,
      x: (e.clientX - rect.left) * (imgSize.w / rect.width),
      y: (e.clientY - rect.top) * (imgSize.h / rect.height)
    }
  }

  function handleMouseDown(e) {
    if (tool === 'text') {
      const pos = getPos(e)
      setTextInput({ x: e.clientX, y: e.clientY, canvasX: pos.x, canvasY: pos.y })
      setTextValue('')
      return
    }
    saveHistory()
    setDrawing(true)
    setStartPos(getPos(e))
  }

  function handleMouseUp(e) {
    if (!drawing) return
    setDrawing(false)
    const end = getPos(e)
    const ctx = drawRef.current.getContext('2d')
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2

    if (tool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, end.x, end.y)
    } else if (tool === 'highlight') {
      ctx.globalAlpha = 0.35
      ctx.fillRect(
        Math.min(startPos.x, end.x),
        Math.min(startPos.y, end.y),
        Math.abs(end.x - startPos.x),
        Math.abs(end.y - startPos.y)
      )
      ctx.globalAlpha = 1
    }
  }

  function drawArrow(ctx, x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const headLen = 16
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
  }

  function commitText() {
    if (!textValue.trim() || !textInput) {
      setTextInput(null)
      return
    }
    saveHistory()
    const ctx = drawRef.current.getContext('2d')
    ctx.font = 'bold 20px monospace'
    ctx.fillStyle = color
    ctx.fillText(textValue, textInput.canvasX, textInput.canvasY)
    setTextInput(null)
    setTextValue('')
  }

  async function handleCopy() {
    const bg = bgRef.current
    const draw = drawRef.current
    const final = document.createElement('canvas')
    final.width = bg.width
    final.height = bg.height
    const ctx = final.getContext('2d')
    ctx.drawImage(bg, 0, 0)
    ctx.drawImage(draw, 0, 0)
    await window.electronAPI.copyImage(final.toDataURL())
    window.electronAPI.closeAnnotate()
  }

  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.key === 'z') undo()
      if (e.key === 'Escape') {
        if (textInput) {
          setTextInput(null)
        } else {
          window.electronAPI.closeAnnotate()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [history, textInput])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', fontFamily: 'monospace' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#111', borderBottom: '1px solid #222' }}>
        {TOOLS.map(t => (
          <button key={t} onClick={() => setTool(t)} style={{
            background: tool === t ? '#a855f7' : 'transparent',
            color: tool === t ? '#000' : '#a855f7',
            border: '1px solid #a855f7',
            borderRadius: 4,
            padding: '4px 12px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 12
          }}>{t}</button>
        ))}
        <div style={{ width: 1, height: 20, background: '#333' }} />
        {COLORS.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{
            width: 20, height: 20,
            borderRadius: '50%',
            background: c,
            cursor: 'pointer',
            border: color === c ? '2px solid #fff' : '2px solid transparent'
          }} />
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={undo} style={{ background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12 }}>
            undo
          </button>
          <button onClick={handleCopy} style={{ background: '#a855f7', color: '#000', border: 'none', borderRadius: 4, padding: '4px 16px', cursor: 'pointer', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' }}>
            copy & close
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <canvas ref={bgRef} style={{ display: 'block', maxWidth: '100%' }} />
          <canvas ref={drawRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: tool === 'text' ? 'text' : 'crosshair' }} />
        </div>

        {/* Inline text input */}
        {textInput && (
          <input
            ref={textRef}
            value={textValue}
            onChange={e => setTextValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitText()
              if (e.key === 'Escape') setTextInput(null)
            }}
            style={{
              position: 'fixed',
              left: textInput.x,
              top: textInput.y,
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${color}`,
              color: color,
              fontFamily: 'monospace',
              fontSize: 16,
              padding: '4px 8px',
              borderRadius: 4,
              outline: 'none',
              minWidth: 120,
              zIndex: 999
            }}
            placeholder='type then Enter'
          />
        )}
      </div>
    </div>
  )
}