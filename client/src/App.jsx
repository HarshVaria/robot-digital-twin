import { useState } from 'react'
import ControlPanel from './components/Dashboard/ControlPanel'
import TelemetryDisplay from './components/Dashboard/TelemetryDisplay'
import SensorPanel from './components/Sensors/SensorPanel'
import AlgorithmSelector from './components/PathPlanning/AlgorithmSelector'
import { useWebSocket } from './hooks/useWebSocket'

const IconGamepad = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/>
  </svg>
)

const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>
  </svg>
)

function App() {
  const { connected, move, stop, reset } = useWebSocket()

  // 🔹 UI Swapper State
  const [activePanel, setActivePanel] = useState('control')

  // 🔹 Algorithm selector states
  const [result, setResult] = useState(null)
  const [pidGains, setPidGains] = useState({ kp: 2, ki: 0.5, kd: 0.1 })
  const [isNavigating, setIsNavigating] = useState(false)

  // 🔹 Dummy robot + sensor data
  const robotState = { mode: "manual" }

  const imuData = {
    orientation: { roll: 10, pitch: 5, yaw: 45 },
    acceleration: { x: 0.5 },
    gyroscope: { y: 0.2 }
  }

  const encoderData = {
    left: { rpm: 120 },
    right: { rpm: 110 },
    totalDistance: 12
  }

  const lidarData = [
    { hit: true, distance: 2.3 },
    { hit: true, distance: 1.8 }
  ]

  const handleRunAlgorithm = (algo) => {
    setResult({ found: true, algorithm: algo, iterations: 50, distance: 10, time: 20 })
  }

  const handleSetGoal = (goal) => { console.log("Goal:", goal) }
  const handleFollowPath = () => { setIsNavigating(true) }
  const handleStopNavigation = () => { setIsNavigating(false) }
  const handlePIDChange = (key, value) => { setPidGains(prev => ({ ...prev, [key]: value })) }

  return (
    <div>
      {/* 🔹 Top Centered Header with Glowing SVG Dot */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
        <div style={{ 
          width: 10, height: 10, borderRadius: '50%', 
          background: connected ? '#3fb950' : '#f85149', 
          boxShadow: connected ? '0 0 10px #3fb950' : '0 0 10px #f85149' 
        }} />
        <h3 style={{ margin: 0, color: 'white', fontFamily: "'Segoe UI', monospace" }}>
          {connected ? "System Connected" : "Offline Mode"}
        </h3>
      </div>

      {/* 🔹 Left Side Swappable Container */}
      <div style={{
        position: 'absolute', 
        left: '10px', 
        top: '60px', 
        width: '280px', // Slightly wider so elements have breathing room
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'stretch', // Forces children to match exactly in width
        gap: '12px', 
        boxSizing: 'border-box',
        zIndex: 10
      }}>
        
        {/* 🎚️ Sleek Toggle Switcher */}
        <div style={{
          display: 'flex', background: '#0d1117', borderRadius: '12px',
          padding: '6px', border: '1px solid #30363d', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => setActivePanel('control')}
            style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px',
              background: activePanel === 'control' ? 'linear-gradient(135deg, #1f6feb, #388bfd)' : 'transparent',
              color: activePanel === 'control' ? 'white' : '#8b949e',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: activePanel === 'control' ? '0 0 12px rgba(31, 111, 235, 0.4)' : 'none'
            }}
          >
            <IconGamepad /> Manual
          </button>
          <button
            onClick={() => setActivePanel('algo')}
            style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: '8px',
              background: activePanel === 'algo' ? 'linear-gradient(135deg, #238636, #2ea043)' : 'transparent',
              color: activePanel === 'algo' ? 'white' : '#8b949e',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: activePanel === 'algo' ? '0 0 12px rgba(35, 134, 54, 0.4)' : 'none'
            }}
          >
            <IconMap /> Auto
          </button>
        </div>

        {/* 🔄 Dynamic Component Rendering */}
        <div style={{ flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
          {activePanel === 'control' ? (
            <ControlPanel onMove={move} onStop={stop} onReset={reset} robotState={robotState} connected={connected} />
          ) : (
            <AlgorithmSelector onRunAlgorithm={handleRunAlgorithm} onSetGoal={handleSetGoal} onFollowPath={handleFollowPath} onStopNavigation={handleStopNavigation} result={result} pidGains={pidGains} onPIDChange={handlePIDChange} isNavigating={isNavigating} />
          )}
        </div>
      </div>

      <TelemetryDisplay robotState={robotState} connected={connected} />
      <SensorPanel imuData={imuData} encoderData={encoderData} lidarData={lidarData} />
    </div>
  )
}

export default App