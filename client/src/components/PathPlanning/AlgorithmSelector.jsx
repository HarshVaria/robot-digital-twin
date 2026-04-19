import { useState, useEffect } from 'react'

const IconMap = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>
const IconStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
const IconDiamond = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 12 12 22 2 12 12 2" /></svg>
const IconTarget = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
const IconPlay = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
const IconSquare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="12" height="12" x="6" y="6" /></svg>
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
const IconX = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
const IconBrick = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="8" rx="1" /><rect x="1" y="13" width="22" height="8" rx="1" /><line x1="12" y1="3" x2="12" y2="11" /><line x1="7" y1="13" x2="7" y2="21" /><line x1="17" y1="13" x2="17" y2="21" /></svg>
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>

export default function AlgorithmSelector({
  algorithm, onAlgorithmChange, onComputePaths, onSetGoal, onFollowPath, onStopNavigation,
  pathResults, selectedPathId, onSelectPath, pidGains, onPIDChange, isNavigating,
  goalPosition, obstacleMode, onToggleObstacleMode, onClearObstacles, obstacleCount
}) {
  pidGains = pidGains || { kp: 2, ki: 0.5, kd: 0.1 }
  isNavigating = isNavigating || false
  goalPosition = goalPosition || { x: 8, z: 8 }
  obstacleCount = obstacleCount || 0

  obstacleCount = obstacleCount || 0
  const [gx, setGx] = useState(goalPosition.x)
  const [gz, setGz] = useState(goalPosition.z)

  useEffect(function () {
    setGx(goalPosition.x)
    setGz(goalPosition.z)
  }, [goalPosition.x, goalPosition.z])

  const b = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 14px', borderRadius: 8, border: 'none', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }
  const inputStyle = { width: '100%', background: '#23272e', border: '1px solid rgba(255,255,255,0.05)', color: '#a78bfa', padding: '10px', borderRadius: '6px', boxSizing: 'border-box', textAlign: 'center', fontWeight: 'bold', fontSize: 14 }

  return (
    <div style={{ padding: '20px 16px', width: '100%', boxSizing: 'border-box', background: 'rgba(35, 39, 46, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', fontFamily: "'Inter', 'Segoe UI', sans-serif", display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeScale 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <style>{`
        @keyframes fadeScale {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 4 }}>
        <IconMap />
        <span style={{ color: '#a0a5ad', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          PATH PLANNING
        </span>
        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: isNavigating ? '#a78bfa' : '#8b949e', boxShadow: isNavigating ? '0 0 6px #a78bfa' : 'none' }} />
      </div>

      {/* Merged Setup Section */}
      <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#8b949e', fontWeight: 600, letterSpacing: '1px' }}>MISSION SETUP</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onAlgorithmChange('astar')} style={{ ...b, flex: 1, background: algorithm==='astar'?'rgba(96, 165, 250, 0.2)':'rgba(48, 54, 61, 0.5)', color: algorithm==='astar'?'#60a5fa':'#8b949e', border: algorithm==='astar'?'1px solid #60a5fa':'1px solid rgba(255,255,255,0.05)', padding: '10px' }}><IconStar /> A*</button>
          <button onClick={() => onAlgorithmChange('dijkstra')} style={{ ...b, flex: 1, background: algorithm==='dijkstra'?'rgba(167, 139, 250, 0.2)':'rgba(48, 54, 61, 0.5)', color: algorithm==='dijkstra'?'#a78bfa':'#8b949e', border: algorithm==='dijkstra'?'1px solid #a78bfa':'1px solid rgba(255,255,255,0.05)', padding: '10px' }}><IconDiamond /> Dijkstra</button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input type="number" value={gx} onChange={e => setGx(parseFloat(e.target.value) || 0)} style={inputStyle} />
          <input type="number" value={gz} onChange={e => setGz(parseFloat(e.target.value) || 0)} style={inputStyle} />
          <button onClick={() => onSetGoal({ x: gx, z: gz })} style={{ ...b, background: 'rgba(167, 139, 250, 0.2)', color: '#a78bfa', border: '1px solid #a78bfa', width: 'auto' }}><IconTarget /></button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onComputePaths()} style={{ ...b, flex: 1, background: 'rgba(48, 54, 61, 0.5)', color: '#c9d1d9', border: '1px solid rgba(255,255,255,0.05)' }}><IconSearch /> COMPUTE PATHS</button>
        
        {isNavigating ? (
          <button onClick={onStopNavigation} style={{ ...b, flex: 1, background: '#f85149', color: 'white', border: '1px solid #f85149' }}><IconSquare /> ABORT</button>
        ) : (
          <button onClick={onFollowPath} disabled={!(pathResults && selectedPathId && pathResults[selectedPathId] && pathResults[selectedPathId].found)} style={{ ...b, flex: 1, background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', border: '1px solid #4ade80', opacity: !(pathResults && selectedPathId && pathResults[selectedPathId] && pathResults[selectedPathId].found) ? 0.3 : 1 }}>
            <IconPlay /> EXECUTE
          </button>
        )}
      </div>

      {/* Results Box */}
      {pathResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', contain: 'paint' }}>
          <style>{`
            div::-webkit-scrollbar { width: 4px; }
            div::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 2px; }
            div::-webkit-scrollbar-thumb { background: rgba(139, 148, 158, 0.4); border-radius: 2px; }
            div::-webkit-scrollbar-thumb:hover { background: rgba(139, 148, 158, 0.8); }
          `}</style>
          {Object.keys(pathResults).map((algoKey, index) => {
            const res = pathResults[algoKey];
            if (!res) return null;
            const isSelected = selectedPathId === algoKey;
            
            // Determine if it's the absolute shortest valid path
            let isShortest = true;
            if (res.found) {
               for(const otherKey in pathResults) {
                 const otherRes = pathResults[otherKey];
                 if (otherRes && otherRes.found && otherRes.distance < res.distance) {
                   isShortest = false;
                   break;
                 }
               }
            }

            return (
              <div 
                key={algoKey}
                onClick={() => { if (res.found) onSelectPath(algoKey) }}
                style={{ 
                  background: isSelected ? 'rgba(96, 165, 250, 0.2)' : 'rgba(17, 20, 24, 0.5)', 
                  border: isSelected ? '1px solid #60a5fa' : '1px solid transparent',
                  borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: res.found ? 'pointer' : 'default', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IconMap /> Option {index + 1}
                    {isShortest && res.found && <span style={{ background: '#eab308', color: '#422006', fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>SHORTEST</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: res.found ? '#4ade80' : '#f85149', fontWeight: 700, fontSize: 11 }}>
                    {res.found ? <IconCheck /> : <IconX />}
                    {res.found ? `${(res.distance || 0).toFixed(1)}m` : 'UNREACHABLE'}
                  </div>
                </div>
                {res.found && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, color: '#8b949e', fontSize: 10, fontWeight: 600 }}>
                    <span>ITER <span style={{ color: 'white' }}>{res.iterations}</span></span>
                    <span>TIME <span style={{ color: 'white' }}>{res.time}ms</span></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Clean, Inline PID Section */}
      <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 10, color: '#8b949e', fontWeight: 600, letterSpacing: '1px' }}>CLOSED-LOOP CONTROLLER</span>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { k: 'kp', label: 'P', color: '#4ade80', max: 5 },
            { k: 'ki', label: 'I', color: '#60a5fa', max: 2 },
            { k: 'kd', label: 'D', color: '#a78bfa', max: 2 }
          ].map((item) => (
             <div key={item.k} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <span style={{ color: '#8b949e', fontWeight: 700, fontSize: 11, width: 14 }}>{item.label}</span>
               <input type="range" min="0" max={item.max} step="0.05" value={pidGains[item.k] || 0} onChange={e => onPIDChange(item.k, parseFloat(e.target.value))} style={{ flex: 1, accentColor: item.color, cursor: 'pointer', height: 4, margin: 0, appearance: 'auto' }} />
               <span style={{ color: item.color, fontWeight: 'bold', fontSize: 12, width: 32, textAlign: 'right' }}>{(pidGains[item.k] || 0).toFixed(2)}</span>
             </div>
          ))}
        </div>
      </div>

      {/* Hazards Section */}
      <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#8b949e', fontWeight: 600, letterSpacing: '1px' }}>HAZARDS</span>
          <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700 }}>{obstacleCount} OBSTACLES</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onToggleObstacleMode} style={{ ...b, flex: 1, background: obstacleMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(48, 54, 61, 0.5)', color: obstacleMode ? '#fbbf24' : '#8b949e', border: obstacleMode ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
            <IconBrick /> {obstacleMode ? 'DISABLE' : 'PLACE'}
          </button>
          <button onClick={onClearObstacles} style={{ ...b, background: 'rgba(48, 54, 61, 0.5)', border: '1px solid rgba(255,255,255,0.05)', color: '#8b949e', flex: 0.6, padding: '10px' }}>
            <IconTrash /> PURGE
          </button>
        </div>
      </div>

    </div>
  )
}