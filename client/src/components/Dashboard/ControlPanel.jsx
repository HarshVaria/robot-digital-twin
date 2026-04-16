import { useState, useEffect } from 'react'

const IconGamepad = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
const IconUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
const IconDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IconLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconStop = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="12" x="6" y="6" rx="2"/></svg>
const IconBattery = () => <svg width="20" height="12" viewBox="0 0 24 14" fill="none" stroke="#4ade80" strokeWidth="1.5"><rect x="1" y="2" width="20" height="10" rx="2" fill="#4ade80" fillOpacity="0.8"/><path d="M23 5v4" strokeLinecap="round"/></svg>;

export default function ControlPanel({ onMove, onStop, onReset, robotState, connected }) {
  // Properly mapping nested state variables so the live telemetry updates
  const safeState = { 
    x: robotState?.position?.x || 0, 
    z: robotState?.position?.z || 0, 
    heading: robotState?.rotation?.y ? (robotState.rotation.y * 180 / Math.PI) : 0, 
    speed: robotState?.speed || 0, 
    isMoving: robotState?.isMoving || false, 
    battery: robotState?.battery || 100 
  }
  connected = connected !== undefined ? connected : true

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
    if (keys[' ']) { onStop && onStop(); return }
    if (l !== 0 || a !== 0) { onMove && onMove(l, a) }
    else if (Object.keys(keys).length === 0 && safeState.isMoving) { onStop && onStop() }
  }, [keys, speed, onMove, onStop, safeState.isMoving])

  // Upgraded hardware button styling
  const btn = (active, danger = false) => ({
    width: 52, height: 52, borderRadius: 12, border: 'none',
    background: active ? (danger ? 'rgba(248, 81, 73, 0.2)' : 'rgba(96, 165, 250, 0.2)') : '#1b1d24',
    color: active ? (danger ? '#f85149' : '#60a5fa') : '#8b949e', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)', 
    boxShadow: active 
      ? `inset 0 0 0 1px ${danger ? '#f85149' : '#60a5fa'}, 0 0 15px ${danger ? 'rgba(248, 81, 73, 0.3)' : 'rgba(96, 165, 250, 0.3)'}` 
      : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 6px rgba(0,0,0,0.3)'
  })

  return (
    <div style={{ padding: '20px 16px', width: '100%', boxSizing: 'border-box', background: 'rgba(35, 39, 46, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'Inter', 'Segoe UI', sans-serif", animation: 'fadeScale 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <style>{`
        @keyframes fadeScale {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
        <IconGamepad />
        <span style={{ color: '#a0a5ad', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          MANUAL
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
           <span style={{ fontSize: 10, fontWeight: 700, color: connected ? '#4ade80' : '#f85149', letterSpacing: '1px' }}>{connected ? 'LINKED' : 'OFFLINE'}</span>
           <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#4ade80' : '#f85149', boxShadow: connected ? '0 0 6px #4ade80' : 'none' }} />
        </div>
      </div>

      {/* Advanced Telemetry Grid */}
      <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: safeState.isMoving ? '#60a5fa' : '#8b949e', fontSize: 11, fontWeight: 700, letterSpacing: '1px' }}>{safeState.isMoving ? 'THRUST ACTIVE' : 'SYSTEM IDLE'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b949e', fontSize: 11, fontWeight: 600 }}>
            <IconBattery /> {Math.round(Number(safeState.battery))}%
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ background: '#1b1d24', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#8b949e', fontSize: 10, display: 'block', marginBottom: 2, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>POS X</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>{Number(safeState.x).toFixed(2)}</span>
          </div>
          <div style={{ background: '#1b1d24', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#8b949e', fontSize: 10, display: 'block', marginBottom: 2, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>POS Z</span>
            <span style={{ color: '#d946ef', fontWeight: 700 }}>{Number(safeState.z).toFixed(2)}</span>
          </div>
          <div style={{ background: '#1b1d24', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#8b949e', fontSize: 10, display: 'block', marginBottom: 2, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>HEADING</span>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{Number(safeState.heading).toFixed(1)}°</span>
          </div>
          <div style={{ background: '#1b1d24', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#8b949e', fontSize: 10, display: 'block', marginBottom: 2, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>SPEED</span>
            <span style={{ color: '#22d3ee', fontWeight: 700 }}>{Number(safeState.speed).toFixed(2)} <span style={{fontSize: 10, color: '#8b949e'}}>m/s</span></span>
          </div>
        </div>
      </div>

      {/* Hardware D-Pad Cluster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 52px)', gap: 8, justifyContent: 'center', margin: '4px 0' }}>
        <div />
        <button style={btn(keys['w'] || keys['arrowup'])} onMouseDown={() => setKeys({ w: true })} onMouseUp={() => setKeys({})} onMouseLeave={() => setKeys({})}><IconUp /></button>
        <div />
        <button style={btn(keys['a'] || keys['arrowleft'])} onMouseDown={() => setKeys({ a: true })} onMouseUp={() => setKeys({})} onMouseLeave={() => setKeys({})}><IconLeft /></button>
        <button style={btn(keys[' '], true)} onMouseDown={() => { onStop && onStop(); setKeys({ ' ': true }) }} onMouseUp={() => setKeys({})} onMouseLeave={() => setKeys({})}><IconStop /></button>
        <button style={btn(keys['d'] || keys['arrowright'])} onMouseDown={() => setKeys({ d: true })} onMouseUp={() => setKeys({})} onMouseLeave={() => setKeys({})}><IconRight /></button>
        <div />
        <button style={btn(keys['s'] || keys['arrowdown'])} onMouseDown={() => setKeys({ s: true })} onMouseUp={() => setKeys({})} onMouseLeave={() => setKeys({})}><IconDown /></button>
        <div />
      </div>

      {/* Precision Speed Slider */}
      <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#8b949e', fontWeight: 600, letterSpacing: '1px' }}>SPEED</span>
          <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{speed.toFixed(1)} <span style={{fontSize:10}}>m/s</span></span>
        </div>
        <input type="range" min="0.5" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24', height: 4, appearance: 'auto' }} />
      </div>

      {/* Action Button */}
      <button onClick={onReset} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(48, 54, 61, 0.5)', color: '#c9d1d9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 12, transition: 'all 0.2s', ':hover': { background: 'rgba(48, 54, 61, 0.8)' } }}>
        <IconRefresh /> RESTART
      </button>

    </div>
  )
}