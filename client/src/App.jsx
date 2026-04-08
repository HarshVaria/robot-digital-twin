import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'

import Scene from './components/Simulation/Scene'
import RobotModel from './components/Simulation/RobotModel'
import SimEnvironment from './components/Simulation/Environment'
import LidarVisualization from './components/Sensors/LidarViz'
import PathVisualizer from './components/PathPlanning/PathVisualizer'

import ControlPanel from './components/Dashboard/ControlPanel'
import SensorPanel from './components/Sensors/SensorPanel'
import AlgorithmSelector from './components/PathPlanning/AlgorithmSelector'
import TelemetryDisplay from './components/Dashboard/TelemetryDisplay'
import { useWebSocket } from './hooks/useWebSocket'
import { LiDARSensor } from './utils/lidar'
import { IMUSensor } from './utils/imu'
import { EncoderSensor } from './utils/encoder'
import { GridMap } from './utils/gridMap'
import { astar } from './utils/astar'
import { dijkstra } from './utils/dijkstra'
import { RobotMotorController } from './utils/pid'
import { DifferentialDriveKinematics } from './utils/robotKinematics'
import { DEFAULT_OBSTACLES } from './utils/obstacleData'

var lidar = new LiDARSensor({ numRays: 180, maxRange: 8, noise: 0.02 })
var imuSensor = new IMUSensor()
var encoder = new EncoderSensor()
var gridMap = new GridMap(30, 30, 1)
var motorController = new RobotMotorController()
var kinematics = new DifferentialDriveKinematics()

for (var i = 0; i < DEFAULT_OBSTACLES.length; i++) {
  gridMap.addObstacle(DEFAULT_OBSTACLES[i].position, DEFAULT_OBSTACLES[i].size, 0)
}

// 🔹 Added Icons for the Toggle Switcher
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

export default function App() {
  var ws = useWebSocket()

  // 🔹 UI Swapper State added here
  const [activePanel, setActivePanel] = useState('control')

  var [sensorData, setSensorData] = useState({ lidar: [], imu: null, encoder: null })
  var [pathResult, setPathResult] = useState(null)
  var [goalPosition, setGoalPosition] = useState({ x: 8, z: 8 })
  var [startPosition, setStartPosition] = useState({ x: 0, z: 0 })
  var [pidGains, setPidGains] = useState({ kp: 2.0, ki: 0.5, kd: 0.1 })
  var [isNavigating, setIsNavigating] = useState(false)
  var [currentWaypoint, setCurrentWaypoint] = useState(0)

  useEffect(function () {
    var interval = setInterval(function () {
      if (!ws.robotState) return
      try {
        var lidarData = lidar.scan(ws.robotState.position, ws.robotState.rotation ? ws.robotState.rotation.y : 0, DEFAULT_OBSTACLES)
        var imuData = imuSensor.update({
          velocity: ws.robotState.velocity || { x: 0, y: 0, z: 0 },
          angularVelocity: ws.robotState.angularVelocity || 0,
          heading: ws.robotState.rotation ? ws.robotState.rotation.y : 0
        })
        var wheelSpeeds = kinematics.inverseKinematics(ws.robotState.speed || 0, ws.robotState.angularVelocity || 0)
        var encoderData = encoder.update(wheelSpeeds.left, wheelSpeeds.right, 1 / 30)
        setSensorData({ lidar: lidarData, imu: imuData, encoder: encoderData })
        ws.sendSensorData({ lidar: lidarData, imu: imuData, encoder: encoderData })
      } catch (e) { console.error('Sensor error:', e) }
    }, 1000 / 30)
    return function () { clearInterval(interval) }
  }, [ws.robotState, ws.sendSensorData])

  useEffect(function () {
    if (!isNavigating || !pathResult || !pathResult.path || pathResult.path.length === 0) return
    var interval = setInterval(function () {
      var result = motorController.followPath(ws.robotState.position, ws.robotState.rotation ? ws.robotState.rotation.y : 0, pathResult.path)
      setCurrentWaypoint(result.waypointIndex)
      if (result.arrived && result.waypointIndex >= pathResult.path.length - 1) {
        setIsNavigating(false)
        ws.stop()
        motorController.resetNavigation()
      } else {
        ws.move(result.linearVelocity, result.angularVelocity)
      }
    }, 1000 / 20)
    return function () { clearInterval(interval) }
  }, [isNavigating, pathResult, ws.robotState])

  var handleRunAlgorithm = useCallback(function (algorithm) {
    var freshGrid = new GridMap(30, 30, 1)

    for (var i = 0; i < DEFAULT_OBSTACLES.length; i++) {
      freshGrid.addObstacle(DEFAULT_OBSTACLES[i].position, DEFAULT_OBSTACLES[i].size, 0)
    }

    var start = {
      x: ws.robotState.position ? ws.robotState.position.x : 0,
      z: ws.robotState.position ? ws.robotState.position.z : 0
    }

    console.log('Running algorithm:', algorithm)
    console.log('Start:', start)
    console.log('Goal:', goalPosition)

    var startCell = freshGrid.worldToGrid(start.x, start.z)
    var goalCell = freshGrid.worldToGrid(goalPosition.x, goalPosition.z)

    console.log('Start Cell:', startCell, 'Obstacle?', freshGrid.isObstacle(startCell.row, startCell.col))
    console.log('Goal Cell:', goalCell, 'Obstacle?', freshGrid.isObstacle(goalCell.row, goalCell.col))

    var result = algorithm === 'astar'
      ? astar(freshGrid, start, goalPosition)
      : dijkstra(freshGrid, start, goalPosition)

    console.log('Path Result:', result)

    setPathResult(result)
    setStartPosition(start)
    setCurrentWaypoint(0)
    motorController.resetNavigation()
  }, [ws.robotState, goalPosition])

  var handleSetGoal = useCallback(function (goal) {
    setGoalPosition(goal)
    setIsNavigating(false)
    setPathResult(null)
  }, [])

  var handleFollowPath = useCallback(function () {
    if (pathResult && pathResult.found) {
      motorController.resetNavigation()
      setCurrentWaypoint(0)
      setIsNavigating(true)
    }
  }, [pathResult])

  var handleStopNavigation = useCallback(function () {
    setIsNavigating(false)
    ws.stop()
    motorController.resetNavigation()
  }, [ws.stop])

  var handlePIDChange = useCallback(function (param, value) {
    setPidGains(function (prev) {
      var g = Object.assign({}, prev)
      g[param] = value
      motorController.speedPID.setGains(g.kp, g.ki, g.kd)
      return g
    })
  }, [])

  var handleReset = useCallback(function () {
    ws.reset()
    setIsNavigating(false)
    setPathResult(null)
    setCurrentWaypoint(0)
    motorController.resetNavigation()
    encoder.reset()
    imuSensor.reset()
    kinematics.reset()
  }, [ws.reset])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [12, 10, 12], fov: 50 }} shadows style={{ background: '#0a0a1a' }} gl={{ antialias: true }}>
        <Scene>
          <RobotModel position={ws.robotState.position} rotation={ws.robotState.rotation} speed={ws.robotState.speed || 0} isMoving={ws.robotState.isMoving} />
          <SimEnvironment />
          <LidarVisualization scanData={sensorData.lidar} robotPosition={ws.robotState.position || { x: 0, z: 0 }} />
          {pathResult && pathResult.found && (
            <PathVisualizer
              path={pathResult.path}
              visitedCells={pathResult.visited}
              gridMap={gridMap}
              startPos={startPosition}
              goalPos={goalPosition}
              currentWaypoint={currentWaypoint}
              />
          )}
        </Scene>
      </Canvas>

      {/* 🔹 Glowing Status Header */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        background: ws.connected ? '#0d1117ee' : '#3d1114ee', borderRadius: 20,
        padding: '6px 20px', color: 'white', fontFamily: 'monospace', fontSize: 12,
        display: 'flex', alignItems: 'center', gap: 8,
        border: '1px solid ' + (ws.connected ? '#30363d' : '#f85149'), zIndex: 20
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ws.connected ? '#3fb950' : '#f85149', boxShadow: ws.connected ? '0 0 8px #3fb950' : '0 0 8px #f85149', animation: 'pulse 2s infinite' }} />
        <span>System {ws.connected ? 'Connected' : 'Offline'}</span>
      </div>

      {/* 🔹 NEW: Left Side Swappable Container */}
      <div style={{
        position: 'absolute', 
        left: '10px', 
        top: '60px', 
        width: '280px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'stretch', 
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
            <ControlPanel onMove={ws.move} onStop={ws.stop} onReset={handleReset} robotState={ws.robotState} connected={ws.connected} />
          ) : (
            <AlgorithmSelector onRunAlgorithm={handleRunAlgorithm} onSetGoal={handleSetGoal} onFollowPath={handleFollowPath} onStopNavigation={handleStopNavigation} result={pathResult} pidGains={pidGains} onPIDChange={handlePIDChange} isNavigating={isNavigating} />
          )}
        </div>
      </div>

      <SensorPanel imuData={sensorData.imu} encoderData={sensorData.encoder} lidarData={sensorData.lidar} />
      <TelemetryDisplay robotState={ws.robotState} connected={ws.connected} />

      {/* 🔹 Navigation Progress Bar */}
      {isNavigating && pathResult && (
        <div style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          background: '#0d1117ee', borderRadius: 12, padding: '8px 20px',
          color: 'white', fontFamily: 'monospace', fontSize: 12,
          display: 'flex', alignItems: 'center', gap: 12,
          border: '1px solid #238636', zIndex: 20
        }}>
          <span>🤖 Navigating</span>
          <div style={{ width: 120, height: 6, background: '#21262d', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: (currentWaypoint / pathResult.path.length) * 100 + '%', height: '100%', background: '#3fb950', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <span style={{ color: '#3fb950' }}>{currentWaypoint}/{pathResult.path.length}</span>
        </div>
      )}
    </div>
  )
}