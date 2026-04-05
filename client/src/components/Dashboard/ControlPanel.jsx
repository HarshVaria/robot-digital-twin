import { useState, useEffect } from 'react'

export default function ControlPanel({ onMove, onStop, onReset, robotState, connected }) {
  robotState = robotState || {}
  connected = connected || false
  var [speed, setSpeed] = useState(1.5)
  var [keys, setKeys] = useState({})

  useEffect(function () {
    function down(e) {
      var k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0) e.preventDefault()
      setKeys(function (p) { var n = Object.assign({}, p); n[k] = true; return n })
    }
    function up(e) {
      var k = e.key.toLowerCase()
      setKeys(function (p) { var n = Object.assign({}, p); delete n[k]; return n })
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return function () { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  useEffect(function () {
    var l = 0
    var a = 0
    if (keys['w'] || keys['arrowup']) l += speed
    if (keys['s'] || keys['arrowdown']) l -= speed
    if (keys['a'] || keys['arrowleft']) a += speed * 1.5
    if (keys['d'] || keys['arrowright']) a -= speed * 1.5
    if (keys[' ']) { onStop(); return }
    if (l !== 0 || a !== 0) { onMove(l, a) }
    else if (Object.keys(keys).length === 0 && robotState.isMoving) { onStop() }
  }, [keys, speed])

  var btn = function (active) {
    return {
      padding: 14,
      borderRadius: 8,
      border: '1px solid ' + (active ? '#388bfd' : '#30363d'),
      background: active ? '#1f6feb' : '#21262d',
      color: 'white',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s ease',
      boxShadow: active ? '0 0 8px #1f6feb' : 'none'
    }
  }

  return (
    <div style={{
      position: 'absolute', left: 10, top: 10, background: '#0d1117', borderRadius: 12,
      padding: 14, color: 'white', width: 260, fontFamily: "'Segoe UI', monospace",
      border: '1px solid #30363d', zIndex: 10
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #21262d' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🎮</span>
          <h3 style={{ margin: 0, color: '#58a6ff', fontSize: 14 }}>Control Panel</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#3fb950' : '#f85149', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10, color: '#8b949e' }}>{connected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ background: robotState.status === 'moving' ? '#238636' : robotState.status === 'error' ? '#da3633' : '#21262d', padding: '3px 10px', borderRadius: 12, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}>
          {robotState.status || 'idle'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 32, height: 14, border: '2px solid ' + ((robotState.battery || 100) > 50 ? '#3fb950' : '#f85149'), borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: (robotState.battery || 100) + '%', height: '100%', background: (robotState.battery || 100) > 50 ? '#3fb950' : '#f85149', transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 10, color: '#8b949e' }}>{(robotState.battery || 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Position */}
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

      {/* Movement */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ color: '#6e7681', fontSize: 10, marginBottom: 6 }}>Movement</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>

          <div />

          <button
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(speed, 0) }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#30363d'}
            onMouseOut={(e) => e.currentTarget.style.background = btn(keys['w']).background}
            style={btn(keys['w'])}
          >▲</button>

          <div />

          <button
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(0, speed * 1.5) }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#30363d'}
            onMouseOut={(e) => e.currentTarget.style.background = btn(keys['a']).background}
            style={btn(keys['a'])}
          >◀</button>

          <button
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onClick={onStop}
            style={{ ...btn(false), background: '#da3633', border: '1px solid #f85149' }}
          >⏹</button>

          <button
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(0, -speed * 1.5) }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#30363d'}
            onMouseOut={(e) => e.currentTarget.style.background = btn(keys['d']).background}
            style={btn(keys['d'])}
          >▶</button>

          <div />

          <button
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; onMove(-speed, 0) }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; onStop() }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#30363d'}
            onMouseOut={(e) => e.currentTarget.style.background = btn(keys['s']).background}
            style={btn(keys['s'])}
          >▼</button>

          <div />
        </div>
      </div>

      {/* Speed */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
          <span style={{ color: '#6e7681' }}>Speed</span>
          <span style={{ color: '#ffa657', fontWeight: 'bold' }}>{speed.toFixed(1)} m/s</span>
        </div>
        <input type="range" min="0.5" max="4" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
      </div>

      {/* Reset */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid #30363d',
            background: '#f59e0b',
            color: 'white',
            fontSize: 13,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔄 Reset Robot
        </button>
      </div>

    </div>
  )
}