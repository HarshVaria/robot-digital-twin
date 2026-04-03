import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

export function useWebSocket() {

  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  // simple robot state
  const [robotState, setRobotState] = useState({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    moving: false
  })

  // connect socket
  useEffect(() => {
    const socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    return () => socket.disconnect()
  }, [])

  // send command
  function sendCommand(cmd) {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('command', cmd)
    } else {
      // fallback simulation (very simple)
      if (cmd.type === 'move') {
        setRobotState(prev => ({
          ...prev,
          x: prev.x + cmd.linear * 0.1,
          z: prev.z + cmd.linear * 0.1,
          angle: prev.angle + cmd.angular * 0.05,
          speed: cmd.linear,
          moving: true
        }))
      }

      if (cmd.type === 'stop') {
        setRobotState(prev => ({
          ...prev,
          speed: 0,
          moving: false
        }))
      }

      if (cmd.type === 'reset') {
        setRobotState({
          x: 0,
          z: 0,
          angle: 0,
          speed: 0,
          moving: false
        })
      }
    }
  }

  // exposed functions (used in ControlPanel)
  function move(l, a) {
    sendCommand({ type: 'move', linear: l, angular: a })
  }

  function stop() {
    sendCommand({ type: 'stop' })
  }

  function reset() {
    sendCommand({ type: 'reset' })
  }

  return {
    connected,
    robotState,
    move,
    stop,
    reset
  }
}