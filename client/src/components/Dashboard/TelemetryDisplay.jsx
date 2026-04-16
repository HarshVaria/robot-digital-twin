import { useState, useEffect } from 'react'

const IconActivity = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>

export default function TelemetryDisplay({ robotState, connected, activePanel }) {
  var [uptime, setUptime] = useState(0)

  useEffect(function () {
    var timer = setInterval(() => {
      setUptime(u => u + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  function fmt(s) {
    var m = Math.floor(s / 60)
    var sq = s % 60
    return (m < 10 ? '0' : '') + m + ':' + (sq < 10 ? '0' : '') + sq
  }

  return (
    <div style={{ background: 'rgba(35, 39, 46, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
        <IconActivity />
        <span style={{ color: '#b0b5be', fontSize: 12, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>SYSTEM INFO</span>
        <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: connected ? '#4ade80' : '#f85149', boxShadow: `0 0 6px ${connected ? '#4ade80' : '#f85149'}80` }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 11, color: '#828892', fontWeight: 800, letterSpacing: '1px' }}>UPTIME</span>
          <span style={{ color: '#a78bfa', fontSize: 15, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{fmt(uptime)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 11, color: '#828892', fontWeight: 800, letterSpacing: '1px' }}>SERVER</span>
          <span style={{ color: connected ? '#4ade80' : '#f85149', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{connected ? 'READY' : 'OFFLINE'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
          <span style={{ fontSize: 11, color: '#828892', fontWeight: 800, letterSpacing: '1px' }}>MODE</span>
          <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{activePanel === 'algo' ? 'AUTO' : 'MANUAL'}</span>
        </div>
      </div>
    </div>
  )
}