import { useState, useEffect } from 'react'

export default function TelemetryDisplay({ robotState, connected }) {
  var [fps, setFps] = useState(60)
  var [uptime, setUptime] = useState(0)

  useEffect(function () {
    var fc = 0
    var lt = performance.now()
    function tick() {
      fc++
      var n = performance.now()
      if (n - lt >= 1000) { setFps(fc); fc = 0; lt = n }
      requestAnimationFrame(tick)
    }
    var id = requestAnimationFrame(tick)
    var ui = setInterval(function () { setUptime(function (p) { return p + 1 }) }, 1000)
    return function () { cancelAnimationFrame(id); clearInterval(ui) }
  }, [])

  var fmt = function (s) {
    var m = Math.floor(s / 60)
    var ss = s % 60
    return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss
  }

  return (
    <div style={{
      position: 'absolute', right: 10, bottom: 10, background: '#0d1117', borderRadius: 12,
      padding: 12, color: 'white', fontFamily: "'Segoe UI', monospace", fontSize: 11,
      border: '1px solid #30363d', width: 180, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #21262d' }}>
        <span>📈</span><span style={{ color: '#58a6ff', fontWeight: 'bold', fontSize: 12 }}>System</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
        <span style={{ color: '#6e7681' }}>FPS:</span>
        <span style={{ color: fps > 30 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>{fps}</span>
        <span style={{ color: '#6e7681' }}>Uptime:</span>
        <span style={{ color: '#79c0ff' }}>{fmt(uptime)}</span>
        <span style={{ color: '#6e7681' }}>Server:</span>
        <span style={{ color: connected ? '#3fb950' : '#f85149' }}>{connected ? 'On' : 'Off'}</span>
        <span style={{ color: '#6e7681' }}>Mode:</span>
        <span style={{ color: '#d2a8ff' }}>{robotState && robotState.mode ? robotState.mode : 'manual'}</span>
      </div>
    </div>
  )
}