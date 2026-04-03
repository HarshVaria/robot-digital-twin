import ControlPanel from './ControlPanel'
import { useWebSocket } from './useWebSocket'

function App() {

  const { connected, move, stop, reset } = useWebSocket()

  return (
    <div>
      <h3>{connected ? "🟢 Connected" : "🔴 Offline Mode"}</h3>

      <ControlPanel
        onMove={move}
        onStop={stop}
        onReset={reset}
      />
    </div>
  )
}

export default App