export default function Toast() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      fontFamily: 'monospace'
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #a855f7',
        borderRadius: 8,
        padding: '12px 24px',
        color: '#a855f7',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 0 20px rgba(168,85,247,0.3)'
      }}>
        <span>✓</span>
        <span>copied to clipboard</span>
      </div>
    </div>
  )
}