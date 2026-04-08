import { useState, useEffect } from 'react'

const IconGamepad = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const IconUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const IconDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconStop = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="12" x="6" y="6" rx="2"/></svg>

export default function ControlPanel({ onMove, onStop, onReset, robotState, connected }) {
  robotState = robotState || {}
  connected = connected || false
  const [speed, setSpeed] = useState(1.5)
  const [keys, setKeys] = useState({})

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0) e.preventDefault()
      setKeys((p) => ({ ...p, [k]: true }))
    }
    const up = (e) => {
      const k = e.key.toLowerCase()
      setKeys((p) => { const n = { ...p }; delete n[k]; return n })
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(() => {
    let l = 0, a = 0
    if (keys['w'] || keys['arrowup']) l += speed
    if (keys['s'] || keys['arrowdown']) l -= speed
    if (keys['a'] || keys['arrowleft']) a += speed * 1.5
    if (keys['d'] || keys['arrowright']) a -= speed * 1.5
    if (keys[' ']) { onStop(); return }
    if (l !== 0 || a !== 0) onMove(l, a)
    else if (Object.keys(keys).length === 0 && robotState.isMoving) onStop()
  }, [keys, speed, onMove, onStop, robotState.isMoving])

  const btn = (active) => ({
    padding: 12, borderRadius: 8,
    border: '1px solid ' + (active ? 'rgba(255,255,255,0.2)' : '#30363d'),
    background: active ? 'linear-gradient(135deg, #1f6feb, #388bfd)' : '#21262d',
    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.1s ease', boxShadow: active ? '0 4px 12px rgba(31,111,235,0.4)' : 'none'
  })

  return (
    <div style={{ background: '#0d1117', borderRadius: 12, padding: 14, color: 'white', width: '100%', boxSizing: 'border-box', fontFamily: "'Segoe UI', monospace", border: '1px solid #30363d' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #21262d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconGamepad />
          <h3 style={{ margin: 0, color: '#58a6ff', fontSize: 14 }}>Control Panel</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ background: robotState.status === 'moving' ? '#238636' : robotState.status === 'error' ? '#da3633' : '#21262d', padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
          {robotState.status || 'idle'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 32, height: 14, border: '2px solid ' + ((robotState.battery || 100) > 50 ? '#3fb950' : '#da3633'), borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: (robotState.battery || 100) + '%', height: '100%', background: (robotState.battery || 100) > 50 ? '#3fb950' : '#da3633', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 10, color: '#8b949e' }}>{(robotState.battery || 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* 🔹 Reverted Position Section */}
      <div style={{ background: '#161b22', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 11, border: '1px solid #21262d' }}>
        <div style={{ color: '#6e7681', marginBottom: 4, fontSize: 10 }}>Position</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div>
            X: <span style={{ color: '#79c0ff', fontWeight: 'bold' }}>
              {(robotState.position ? robotState.position.x : 0).toFixed(2)}
            </span>
          </div>

          <div>
            Z: <span style={{ color: '#d2a8ff', fontWeight: 'bold' }}>
              {(robotState.position ? robotState.position.z : 0).toFixed(2)}
            </span>
          </div>

          <div>
            Heading: <span style={{ color: '#ffa657' }}>
              {((robotState.rotation ? robotState.rotation.y : 0) * 180 / Math.PI).toFixed(1)}°
            </span>
          </div>

          <div>
            Speed: <span style={{ color: '#79c0ff' }}>
              {Math.abs(robotState.speed || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#6e7681', fontSize: 10, marginBottom: 6 }}>Movement</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          <div />
          <button onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(speed, 0) }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} style={btn(keys['w'])}><IconUp /></button>
          <div />
          <button onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(0, speed * 1.5) }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} style={btn(keys['a'])}><IconLeft /></button>
          <button onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={onStop} style={{ ...btn(false), background: '#da3633', border: '1px solid #f85149' }}><IconStop /></button>
          <button onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(0, -speed * 1.5) }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} style={btn(keys['d'])}><IconRight /></button>
          <div />
          <button onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(-speed, 0) }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }} style={btn(keys['s'])}><IconDown /></button>
          <div />
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
          <span style={{ color: '#6e7681' }}>Speed</span>
          <span style={{ color: '#ffa657', fontWeight: 'bold' }}>{speed.toFixed(1)} m/s</span>
        </div>
        <input type="range" min="0.5" max="4" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#ffa657' }} />
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={onReset} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid #30363d', background: '#f59e0b', color: 'white', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <IconRefresh /> Reset Robot
        </button>
      </div>

    </div>
  )
}