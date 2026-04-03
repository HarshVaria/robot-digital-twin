import { useState, useEffect } from 'react'
import './ControlPanel.css'

export default function ControlPanel({ onMove, onStop, onReset }) {

  const [speed, setSpeed] = useState(1)
  const [keys, setKeys] = useState({})

  useEffect(() => {
    const down = (e) => {
      const key = e.key.toLowerCase()
      setKeys(prev => ({ ...prev, [key]: true }))
    }

    const up = (e) => {
      const key = e.key.toLowerCase()
      setKeys(prev => {
        const newKeys = { ...prev }
        delete newKeys[key]
        return newKeys
      })
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    let linear = 0
    let angular = 0

    if (keys['w'] || keys['arrowup']) linear = speed
    if (keys['s'] || keys['arrowdown']) linear = -speed
    if (keys['a'] || keys['arrowleft']) angular = speed
    if (keys['d'] || keys['arrowright']) angular = -speed

    if (keys[' ']) {
      onStop()
      return
    }

    if (linear !== 0 || angular !== 0) {
      onMove(linear, angular)
    }
  }, [keys, speed])

  return (
    <div className="panel">
      <h2>Remote Control</h2>

      <div className="grid">
        <div></div>

        <button className="btn"
          onMouseDown={() => onMove(speed, 0)}
          onMouseUp={onStop}>
          ↑
        </button>

        <div></div>

        <button className="btn"
          onMouseDown={() => onMove(0, speed)}
          onMouseUp={onStop}>
          ←
        </button>

        <button className="btn stop" onClick={onStop}>
          ■
        </button>

        <button className="btn"
          onMouseDown={() => onMove(0, -speed)}
          onMouseUp={onStop}>
          →
        </button>

        <div></div>

        <button className="btn"
          onMouseDown={() => onMove(-speed, 0)}
          onMouseUp={onStop}>
          ↓
        </button>

        <div></div>
      </div>

      <div className="speed">
        <p>Speed: {speed}</p>
        <input
          type="range"
          min="0.5"
          max="4"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </div>

      <button className="reset" onClick={onReset}>
        🔄 Reset
      </button>
    </div>
  )
}