import { useState, useEffect } from 'react'

const IconCompass = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
const IconActivity = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff007f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
const IconLidar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h4v4H4z"/><path d="M16 4h4v4h-4z"/><path d="M4 16h4v4H4z"/><path d="M16 16h4v4h-4z"/></svg>

// Using the precise background constraints requested
const PanelWrapper = ({ title, icon, dotColor = '#4ade80', danger = false, children }) => (
  <div style={{ 
    background: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(35, 39, 46, 0.7)', 
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', 
    border: danger ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.05)', 
    borderRadius: 12, padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', 
    display: 'flex', flexDirection: 'column', gap: 12, fontFamily: "'Inter', 'Segoe UI', sans-serif",
    animation: danger ? 'super-danger-blink 0.5s infinite alternate' : 'none'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon}
      <span style={{ color: danger ? '#ef4444' : '#b0b5be', fontSize: 12, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}80` }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {children}
    </div>
  </div>
)

const SplitBox = ({ label1, value1, unit1, color1, label2, value2, unit2, color2, danger }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <div style={{ flex: 1, background: danger ? 'rgba(255,0,0,0.1)' : 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: danger ? '#ff6b6b' : '#828892', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', marginBottom: 2 }}>{label1}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ color: danger ? '#ff3333' : color1, fontSize: 17, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{value1}</span>
        <span style={{ color: danger ? '#ff3333' : color1, fontSize: 10, fontWeight: 800 }}>{unit1}</span>
      </div>
    </div>
    <div style={{ flex: 1, background: danger ? 'rgba(255,0,0,0.1)' : 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: danger ? '#ff6b6b' : '#828892', fontSize: 10, fontWeight: 800, letterSpacing: '0.5px', marginBottom: 2 }}>{label2}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ color: danger ? '#ff3333' : color2, fontSize: 17, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{value2}</span>
        <span style={{ color: danger ? '#ff3333' : color2, fontSize: 10, fontWeight: 800 }}>{unit2}</span>
      </div>
    </div>
  </div>
)

const FullBox = ({ label, value, unit, color }) => (
  <div style={{ background: 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ color: '#828892', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ color: color, fontSize: 15, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      <span style={{ color: color, fontSize: 11, fontWeight: 800 }}>{unit}</span>
    </div>
  </div>
)

export default function SensorPanel({ imuData, encoderData, lidarData }) {
  var rays = Array.isArray(lidarData) ? lidarData : []
  var minD = rays.length > 0 ? rays.reduce((min, ray) => Math.min(min, ray.distance), Infinity) : 2.99
  if (minD === Infinity) minD = 2.99
  var pointsFound = rays.length > 0 ? rays.filter(r => r.hit).length : 67
  var isDanger = minD < 0.6
  var progressWidth = Math.min(100, Math.max(0, (minD / 5) * 100))

  return (
    <>
      <style>{`
        @keyframes super-danger-blink {
          0% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.8); }
          100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2), inset 0 0 0px transparent; border-color: rgba(239, 68, 68, 0.3); }
        }
      `}</style>
      <PanelWrapper title="ROBOT ORIENTATION" icon={<IconCompass />}>
        <SplitBox 
          label1="TILT (X)" value1={(imuData?.orientation?.roll || 0).toFixed(2)} unit1="°" color1="#00e5ff"
          label2="TILT (Y)" value2={(imuData?.orientation?.pitch || 0).toFixed(2)} unit2="°" color2="#00e5ff" />
        <FullBox label="DIRECTION" value={(imuData?.orientation?.yaw || 0).toFixed(2)} unit="°" color="#00e5ff" />
      </PanelWrapper>

      <PanelWrapper title="WHEEL SPEED" icon={<IconActivity />}>
        <SplitBox 
          label1="LEFT WHEEL" value1={(encoderData?.left?.rpm || 0).toFixed(2)} unit1="RPM" color1="#ff007f"
          label2="RIGHT WHEEL" value2={(encoderData?.right?.rpm || 0).toFixed(2)} unit2="RPM" color2="#ff007f" />
        <FullBox label="DISTANCE MOVED" value={(encoderData?.totalDistance || 0).toFixed(2)} unit="m" color="#ff007f" />
      </PanelWrapper>

      <PanelWrapper title={isDanger ? "PROXIMITY ALERT" : "LIDAR SENSOR"} icon={<IconLidar />} dotColor={isDanger ? '#ef4444' : '#4ade80'} danger={isDanger}>
        <div style={{ background: isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(17, 20, 24, 0.5)', borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: isDanger ? '#f87171' : '#828892', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>POINTS FOUND</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: isDanger ? '#ef4444' : '#fbbf24', fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{pointsFound}</span>
              <span style={{ color: isDanger ? '#ef4444' : '#fbbf24', fontSize: 11, fontWeight: 800 }}>pts</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: isDanger ? '#f87171' : '#828892', fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>CLOSEST OBJECT</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: isDanger ? '#ef4444' : '#4ade80', fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{minD.toFixed(2)}</span>
              <span style={{ color: isDanger ? '#ef4444' : '#4ade80', fontSize: 11, fontWeight: 800 }}>m</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${progressWidth}%`, height: '100%', background: isDanger ? '#ef4444' : '#fbbf24', borderRadius: 3, transition: 'width 0.2s' }} />
          </div>
        </div>
      </PanelWrapper>
    </>
  )
}