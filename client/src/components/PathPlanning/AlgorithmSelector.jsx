import { useState } from 'react'

const IconMap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
const IconStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconDiamond = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 12 12 22 2 12 12 2"/></svg>
const IconTarget = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
const IconPlay = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
const IconSquare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="12" x="6" y="6"/></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
const IconSliders = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f0883e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="21" y2="21"/><line x1="4" x2="20" y1="14" y2="14"/><line x1="4" x2="20" y1="7" y2="7"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="14" r="1"/><circle cx="9" cy="7" r="1"/></svg>

export default function AlgorithmSelector({ onRunAlgorithm, onSetGoal, onFollowPath, onStopNavigation, result, pidGains, onPIDChange, isNavigating }) {
  pidGains = pidGains || { kp: 2, ki: 0.5, kd: 0.1 }
  isNavigating = isNavigating || false
  const [algo, setAlgo] = useState('astar')
  const [gx, setGx] = useState(8)
  const [gz, setGz] = useState(8)

  // 🔹 Slightly tightened padding to save vertical space
  const b = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s', boxSizing: 'border-box' }
  const inputStyle = { width: '100%', background: '#161b22', border: '1px solid #30363d', color: 'white', padding: '6px', borderRadius: '4px', boxSizing: 'border-box', textAlign: 'center' }

  return (
    <div style={{ background: '#0d1117', borderRadius: 12, padding: 12, color: 'white', width: '100%', boxSizing: 'border-box', fontFamily: "'Segoe UI', monospace", border: '1px solid #30363d' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #21262d' }}>
        <IconMap />
        <h3 style={{ margin: 0, color: '#58a6ff', fontSize: 14 }}>Path Planning</h3>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#8b949e', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Algorithm</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setAlgo('astar')} style={{ ...b, background: algo === 'astar' ? 'linear-gradient(135deg, #238636, #2ea043)' : '#21262d', flex: 1 }}><IconStar /> A*</button>
          <button onClick={() => setAlgo('dijkstra')} style={{ ...b, background: algo === 'dijkstra' ? 'linear-gradient(135deg, #1f6feb, #388bfd)' : '#21262d', flex: 1 }}><IconDiamond /> Dijkstra</button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#8b949e', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Goal Position</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <div style={{ flex: 1 }}><label style={{ color: '#6e7681', fontSize: 10, display: 'block', marginBottom: 2, textAlign: 'center' }}>X</label><input type="number" value={gx} onChange={e => setGx(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
          <div style={{ flex: 1 }}><label style={{ color: '#6e7681', fontSize: 10, display: 'block', marginBottom: 2, textAlign: 'center' }}>Z</label><input type="number" value={gz} onChange={e => setGz(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
        </div>
        <button onClick={() => onSetGoal({ x: gx, z: gz })} style={{ ...b, background: 'linear-gradient(135deg, #da3633, #f85149)', width: '100%', marginBottom: 4 }}><IconTarget /> Set Goal</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => onRunAlgorithm(algo)} style={{ ...b, background: '#21262d', border: '1px solid #1f6feb', color: '#58a6ff', flex: 1 }}><IconSearch /> Find Path</button>
        <button onClick={onFollowPath} disabled={!(result && result.found) || isNavigating} style={{ ...b, background: isNavigating ? '#6e7681' : 'linear-gradient(135deg, #238636, #2ea043)', flex: 1, opacity: (!(result && result.found) || isNavigating) ? 0.5 : 1 }}>
          {isNavigating ? <><IconSquare /> Moving...</> : <><IconPlay /> Follow</>}
        </button>
      </div>

      {isNavigating && (
        <button onClick={onStopNavigation} style={{ ...b, background: '#da3633', width: '100%', marginBottom: 10 }}><IconSquare /> Stop Auto-Nav</button>
      )}

      {/* 🔹 ULTRA-COMPACT RESULT RIBBON: Saves massive vertical space! */}
      {result && (
        <div style={{ padding: '8px 10px', background: '#161b22', borderRadius: 8, fontSize: 11, marginBottom: 10, border: '1px solid ' + (result.found ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: result.found ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
            {result.found ? <IconCheck/> : <IconX/>}
            {result.found ? `${(result.distance || 0).toFixed(1)}m` : 'Failed'}
          </div>
          {result.found && (
            <div style={{ display: 'flex', gap: 10, color: '#8b949e' }}>
              <span>Iter: <span style={{ color: '#79c0ff' }}>{result.iterations}</span></span>
              <span>Time: <span style={{ color: '#7ee787' }}>{result.time}ms</span></span>
            </div>
          )}
        </div>
      )}

      <div style={{ paddingTop: 8, borderTop: '1px solid #21262d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <IconSliders />
          <h4 style={{ color: '#f0883e', margin: 0, fontSize: 12 }}>PID Control</h4>
        </div>
        {[
          { k: 'kp', label: 'Kp', color: '#ff6b6b', max: 5 },
          { k: 'ki', label: 'Ki', color: '#4ecdc4', max: 2 },
          { k: 'kd', label: 'Kd', color: '#45b7d1', max: 2 }
        ].map((item) => (
          <div key={item.k} style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: '#8b949e' }}>{item.label}</span>
              <span style={{ color: item.color, fontWeight: 'bold' }}>{(pidGains[item.k] || 0).toFixed(2)}</span>
            </div>
            <input type="range" min="0" max={item.max} step="0.05" value={pidGains[item.k] || 0} onChange={e => onPIDChange(item.k, parseFloat(e.target.value))} style={{ width: '100%', accentColor: item.color }} />
          </div>
        ))}
      </div>
    </div>
  )
}