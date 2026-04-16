import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:3001'

export function useWebSocket() {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  const [robotState, setRobotState] = useState({
    position: { x: 0, y: 0.5, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    angularVelocity: 0,
    speed: 0,
    isMoving: false,
    battery: 100,
    status: 'idle',
    mode: 'manual'
  })

  useEffect(function () {
    var socket = io(SERVER_URL)
    socketRef.current = socket

    socket.on('connect', function () {
      console.log('Connected to server')
      setConnected(true)
    })

    socket.on('disconnect', function () {
      console.log('Disconnected from server')
      setConnected(false)
    })

    // Listen for robot state updates from server
    socket.on('robotState', function (state) {
      setRobotState(state)
    })

    return function () {
      socket.disconnect()
    }
  }, [])

  var move = useCallback(function (linear, angular) {
    if (socketRef.current) {
      socketRef.current.emit('command', {
        type: 'move',
        linear: linear,
        angular: angular
      })
    }
  }, [])

  var stop = useCallback(function () {
    if (socketRef.current) {
      socketRef.current.emit('command', { type: 'stop' })
    }
  }, [])

  var reset = useCallback(function () {
    if (socketRef.current) {
      socketRef.current.emit('command', { type: 'reset' })
    }
  }, [])

  var sendSensorData = useCallback(function (data) {
    if (socketRef.current) {
      socketRef.current.emit('sensorData', data)
    }
  }, [])

  var sendObstacles = useCallback(function (obstacles) {
    if (socketRef.current) {
      socketRef.current.emit('updateObstacles', obstacles)
    }
  }, [])

  return {
    robotState: robotState,
    connected: connected,
    move: move,
    stop: stop,
    reset: reset,
    sendSensorData: sendSensorData,
    sendObstacles: sendObstacles
  }
}