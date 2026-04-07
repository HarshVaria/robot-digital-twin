import ControlPanel from './components/Dashboard/ControlPanel'
import TelemetryDisplay from './components/Dashboard/TelemetryDisplay'
import SensorPanel from './components/Sensors/SensorPanel'
import { useWebSocket } from './hooks/useWebSocket'

function App() {

  const { connected, move, stop, reset } = useWebSocket()

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

  return (
    <div>
      <h3>{connected ? "🟢 Connected" : "🔴 Offline Mode"}</h3>

      <ControlPanel
        onMove={move}
        onStop={stop}
        onReset={reset}
      />

      <TelemetryDisplay 
        robotState={robotState}
        connected={connected}
      />

      <SensorPanel
        imuData={imuData}
        encoderData={encoderData}
        lidarData={lidarData}
      />
    </div>
  )
}

export default App