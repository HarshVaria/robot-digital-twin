import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

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
var motorController = new RobotMotorController()
var kinematics = new DifferentialDriveKinematics()

// ── Helper: path simplification (skip collinear waypoints) ──
function simplifyPath(path) {
  if (!path || path.length < 3) return path
  var result = [path[0]]
  for (var i = 1; i < path.length - 1; i++) {
    var prev = result[result.length - 1]
    var next = path[i + 1]
    var cur = path[i]
    var dx1 = cur.x - prev.x, dz1 = cur.z - prev.z
    var dx2 = next.x - cur.x, dz2 = next.z - cur.z
    var cross = Math.abs(dx1 * dz2 - dz1 * dx2)
    if (cross > 0.01) result.push(cur) // keep only non-collinear points
  }
  result.push(path[path.length - 1])
  return result
}

// ── Click-on-ground plane component ──
function GroundClickPlane({ onClickGround }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onPointerDown={function (e) {
        e.stopPropagation()
        if (e.point) {
          onClickGround({ x: e.point.x, z: e.point.z })
        }
      }}
    >
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── Icons for the Toggle Switcher ──
const IconGamepad = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><rect width="20" height="12" x="2" y="6" rx="2" />
  </svg>
)

const IconMap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
  </svg>
)

export default function App() {
  var ws = useWebSocket()

  const [activePanel, setActivePanel] = useState('control')

  var [sensorData, setSensorData] = useState({ lidar: [], imu: null, encoder: null })
  var [pathResult, setPathResult] = useState(null)
  var [goalPosition, setGoalPosition] = useState({ x: 8, z: 8 })
  var [startPosition, setStartPosition] = useState({ x: 0, z: 0 })
  var [pidGains, setPidGains] = useState({ kp: 2.0, ki: 0.5, kd: 0.1 })
  var [isNavigating, setIsNavigating] = useState(false)
  var [currentWaypoint, setCurrentWaypoint] = useState(0)

  // ── Dynamic obstacle state ──
  var [obstacles, setObstacles] = useState(DEFAULT_OBSTACLES)
  var [obstacleMode, setObstacleMode] = useState(false)
  var nextObstacleId = useRef(100)

  // ── Build the grid map whenever obstacles change ──
  var gridMapRef = useRef(new GridMap(30, 30, 1))
  useEffect(function () {
    var gm = new GridMap(30, 30, 1)
    for (var i = 0; i < obstacles.length; i++) {
      gm.addObstacle(obstacles[i].position, obstacles[i].size, 0)
    }
    gridMapRef.current = gm
  }, [obstacles])

  // ── Ref to hold the latest robot state without triggering effect re-runs ──
  const robotStateRef = useRef(ws.robotState)
  useEffect(function () {
    robotStateRef.current = ws.robotState
  }, [ws.robotState])

  // ── Sensor loop ──
  useEffect(function () {
    var interval = setInterval(function () {
      var state = robotStateRef.current
      if (!state) return
      try {
        var lidarData = lidar.scan(state.position, state.rotation ? state.rotation.y : 0, obstacles)
        var imuData = imuSensor.update({
          velocity: state.velocity || { x: 0, y: 0, z: 0 },
          angularVelocity: state.angularVelocity || 0,
          heading: state.rotation ? state.rotation.y : 0
        })
        var wheelSpeeds = kinematics.inverseKinematics(state.speed || 0, state.angularVelocity || 0)
        var encoderData = encoder.update(wheelSpeeds.left, wheelSpeeds.right, 1 / 30)
        setSensorData({ lidar: lidarData, imu: imuData, encoder: encoderData })
        ws.sendSensorData({ lidar: lidarData, imu: imuData, encoder: encoderData })
      } catch (e) { console.error('Sensor error:', e) }
    }, 1000 / 30)
    return function () { clearInterval(interval) }
  }, [ws.sendSensorData, obstacles])

  // ── Path following loop (30 Hz for faster response) ──
  useEffect(function () {
    if (!isNavigating || !pathResult || !pathResult.path || pathResult.path.length === 0) return
    var interval = setInterval(function () {
      var state = robotStateRef.current
      if (!state || !state.position) return

      var result = motorController.followPath(state.position, state.rotation ? state.rotation.y : 0, pathResult.path)
      setCurrentWaypoint(result.waypointIndex)
      if (result.arrived && result.waypointIndex >= pathResult.path.length - 1) {
        setIsNavigating(false)
        ws.stop()
        motorController.resetNavigation()
      } else {
        ws.move(result.linearVelocity, result.angularVelocity)
      }
    }, 1000 / 30)
    return function () { clearInterval(interval) }
  }, [isNavigating, pathResult, ws.stop, ws.move])

  // ── Run algorithm ──
  var handleRunAlgorithm = useCallback(function (algorithm) {
    var freshGrid = new GridMap(30, 30, 1)
    for (var i = 0; i < obstacles.length; i++) {
      freshGrid.addObstacle(obstacles[i].position, obstacles[i].size, 0)
    }

    var start = {
      x: ws.robotState.position ? ws.robotState.position.x : 0,
      z: ws.robotState.position ? ws.robotState.position.z : 0
    }

    console.log('Running algorithm:', algorithm, 'Start:', start, 'Goal:', goalPosition)

    var result = algorithm === 'astar'
      ? astar(freshGrid, start, goalPosition)
      : dijkstra(freshGrid, start, goalPosition)

    // Simplify path to skip collinear waypoints → much faster following
    if (result.found && result.path) {
      result.path = simplifyPath(result.path)
    }

    console.log('Path Result:', result.found ? result.path.length + ' waypoints' : 'not found')

    setPathResult(result)
    setStartPosition(start)
    setCurrentWaypoint(0)
    motorController.resetNavigation()
  }, [ws.robotState, goalPosition, obstacles])

  // ── Set goal (from click or manual input) ──
  var handleSetGoal = useCallback(function (goal) {
    setGoalPosition(goal)
    setIsNavigating(false)
    setPathResult(null)
  }, [])

  // ── Ground click handler ──
  var handleClickGround = useCallback(function (point) {
    if (obstacleMode) {
      // Add an obstacle at click position
      var id = nextObstacleId.current++
      var colors = ['#e53935', '#ff9800', '#7b1fa2', '#c62828', '#4e342e', '#ef6c00', '#ad1457', '#6a1b9a', '#d84315', '#1b5e20']
      var newObs = {
        id: id,
        position: [point.x, 0.5, point.z],
        size: [1, 1, 1],
        color: colors[id % colors.length]
      }
      setObstacles(function (prev) { return prev.concat([newObs]) })
      // Sync to server
      ws.sendObstacles && ws.sendObstacles(obstacles.concat([newObs]))
    } else {
      // Set goal at click position
      handleSetGoal({ x: Math.round(point.x * 2) / 2, z: Math.round(point.z * 2) / 2 })
    }
  }, [obstacleMode, obstacles, handleSetGoal, ws.sendObstacles])

  // ── Obstacle management ──
  var handleToggleObstacleMode = useCallback(function () {
    setObstacleMode(function (prev) { return !prev })
  }, [])

  var handleClearUserObstacles = useCallback(function () {
    setObstacles(DEFAULT_OBSTACLES)
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
      motorController.kp = g.kp
      motorController.ki = g.ki
      motorController.kd = g.kd
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

  var isDanger = false
  if (Array.isArray(sensorData.lidar) && sensorData.lidar.length > 0) {
    isDanger = sensorData.lidar.reduce((min, ray) => Math.min(min, ray.distance), Infinity) < 0.6
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas camera={{ position: [12, 10, 12], fov: 50 }} shadows style={{ background: '#0a0a1a' }} gl={{ antialias: true }}>
        <Scene>
          <RobotModel position={ws.robotState.position} rotation={ws.robotState.rotation} speed={ws.robotState.speed || 0} isMoving={ws.robotState.isMoving} isDanger={isDanger} />
          <SimEnvironment obstacles={obstacles} />
          <LidarVisualization scanData={sensorData.lidar} robotPosition={ws.robotState.position || { x: 0, z: 0 }} />
          {pathResult && pathResult.found && (
            <PathVisualizer
              path={pathResult.path}
              visitedCells={pathResult.visited}
              gridMap={gridMapRef.current}
              startPos={startPosition}
              goalPos={goalPosition}
              currentWaypoint={currentWaypoint}
            />
          )}
          {/* Click-on-ground for goal or obstacle placement */}
          <GroundClickPlane onClickGround={handleClickGround} />
          {/* Show goal marker even when no path yet */}
          {!pathResult && goalPosition && (
            <group position={[goalPosition.x, 0, goalPosition.z]}>
              <mesh position={[0, 0.4, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.4, 32]} />
                <meshBasicMaterial color="#f44336" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}
        </Scene>
      </Canvas>

      {/* Glowing Status Header */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        background: ws.connected ? '#0d1117ee' : '#3d1114ee', borderRadius: 20,
        padding: '6px 20px', color: 'white', fontFamily: 'monospace', fontSize: 12,
        display: 'flex', alignItems: 'center', gap: 8,
        border: '1px solid ' + (ws.connected ? '#30363d' : '#f85149'), zIndex: 20
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ws.connected ? '#3fb950' : '#f85149', boxShadow: ws.connected ? '0 0 8px #3fb950' : '0 0 8px #f85149', animation: 'pulse 2s infinite' }} />
        <span>System {ws.connected ? 'Connected' : 'Offline'}</span>
        {obstacleMode && (
          <span style={{ background: '#da3633', padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>
            🧱 OBSTACLE MODE
          </span>
        )}
      </div>

      {/* Removed Interaction Mode Indicator as requested */}

      {/* Left Side Swappable Container */}
      <div style={{
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: '12px',
        boxSizing: 'border-box',
        zIndex: 10
      }}>

        {/* Sleek Toggle Switcher */}
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

        {/* Dynamic Component Rendering */}
        <div style={{ flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
          {activePanel === 'control' ? (
            <ControlPanel onMove={ws.move} onStop={ws.stop} onReset={handleReset} robotState={ws.robotState} connected={ws.connected} />
          ) : (
            <AlgorithmSelector
              onRunAlgorithm={handleRunAlgorithm}
              onSetGoal={handleSetGoal}
              onFollowPath={handleFollowPath}
              onStopNavigation={handleStopNavigation}
              result={pathResult}
              pidGains={pidGains}
              onPIDChange={handlePIDChange}
              isNavigating={isNavigating}
              goalPosition={goalPosition}
              obstacleMode={obstacleMode}
              onToggleObstacleMode={handleToggleObstacleMode}
              onClearObstacles={handleClearUserObstacles}
              obstacleCount={obstacles.length}
            />
          )}
        </div>
      </div>

      {/* Right Side Unified Telemetry Stack */}
      <div style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10
      }}>
        <SensorPanel imuData={sensorData.imu} encoderData={sensorData.encoder} lidarData={sensorData.lidar} />
        <TelemetryDisplay robotState={ws.robotState} connected={ws.connected} activePanel={activePanel} />
      </div>

      {/* Navigation Progress Bar */}
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