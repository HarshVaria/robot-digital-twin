import ControlPanel from './components/Dashboard/ControlPanel'
import TelemetryDisplay from './components/Dashboard/TelemetryDisplay'
import { useWebSocket } from './hooks/useWebSocket'

function App() {

  const { connected, move, stop, reset } = useWebSocket()

  const robotState = { mode: "manual" } // temp

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
    </div>
  )
}

export default App