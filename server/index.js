// server/index.js
// ============================================
// ROBOT DIGITAL TWIN - WebSocket Server
// Author: Pulin
// ============================================

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({ origin: CLIENT_URL, methods: ['GET', 'POST'] }))
app.use(express.json())

// ============================================
// HTTP + WEBSOCKET SERVER
// ============================================
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// ============================================
// ROBOT STATE (Central State Management)
// ============================================
let robotState = {
  position: { x: 0, y: 0.5, z: 0 },
  rotation: { y: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  angularVelocity: 0,
  speed: 0,
  isMoving: false,
  mode: 'manual',
  status: 'idle',
  battery: 100,
  timestamp: Date.now(),
  connectedClients: 0
}

// Simulation settings
let simSettings = {
  physicsFPS: 60,
  sensorUpdateRate: 30,
  maxSpeed: 5.0,
  worldSize: 30,
  boundaryLimit: 14
}

// ============================================
// WEBSOCKET CONNECTION HANDLERS
// ============================================
io.on('connection', (socket) => {
  robotState.connectedClients++
  console.log(`🤖 Client connected: ${socket.id} (Total: ${robotState.connectedClients})`)

  // Send current state to newly connected client
  socket.emit('robotState', robotState)
  socket.emit('simSettings', simSettings)

  // ========== MOVEMENT COMMANDS ==========
  socket.on('command', (data) => {
    switch (data.type) {
      case 'move': {
        const linear = Math.max(-simSettings.maxSpeed,
          Math.min(simSettings.maxSpeed, data.linear || 0))
        const angular = data.angular || 0

        robotState.speed = linear
        robotState.angularVelocity = angular
        robotState.isMoving = (linear !== 0 || angular !== 0)
        robotState.status = robotState.isMoving ? 'moving' : 'idle'

        // Calculate velocity components
        robotState.velocity = {
          x: linear * Math.sin(robotState.rotation.y),
          y: 0,
          z: linear * Math.cos(robotState.rotation.y)
        }
        break
      }

      case 'stop':
        robotState.velocity = { x: 0, y: 0, z: 0 }
        robotState.angularVelocity = 0
        robotState.speed = 0
        robotState.isMoving = false
        robotState.status = 'idle'
        break

      case 'reset':
        robotState = {
          ...robotState,
          position: { x: 0, y: 0.5, z: 0 },
          rotation: { y: 0 },
          velocity: { x: 0, y: 0, z: 0 },
          angularVelocity: 0,
          speed: 0,
          isMoving: false,
          mode: 'manual',
          status: 'idle',
          battery: 100
        }
        console.log('🔄 Robot reset')
        break

      case 'setMode':
        robotState.mode = data.mode
        break

      case 'navigate':
        robotState.mode = 'autonomous'
        robotState.status = 'planning'
        io.emit('planPath', {
          start: { ...robotState.position },
          goal: data.goal,
          algorithm: data.algorithm || 'astar'
        })
        break

      case 'setPosition':
        if (data.position) robotState.position = data.position
        if (data.rotation) robotState.rotation = data.rotation
        break

      default:
        console.log(`Unknown command: ${data.type}`)
    }

    robotState.timestamp = Date.now()
    io.emit('robotState', robotState)
  })

  // ========== SENSOR DATA ==========
  socket.on('sensorData', (data) => {
    io.emit('telemetry', {
      timestamp: Date.now(),
      sensors: data,
      robotState: { ...robotState }
    })
  })

  // ========== PATH PLANNING RESULTS ==========
  socket.on('pathResult', (data) => {
    io.emit('pathFound', data)
    robotState.status = data.found ? 'navigating' : 'error'
    io.emit('robotState', robotState)
  })

  // ========== POSITION UPDATES ==========
  socket.on('positionUpdate', (data) => {
    if (data.position) robotState.position = data.position
    if (data.rotation) robotState.rotation = data.rotation
    if (data.velocity) robotState.velocity = data.velocity
  })

  // ========== NAVIGATION COMPLETE ==========
  socket.on('navigationUpdate', (data) => {
    if (data.arrived) {
      robotState.status = 'idle'
      robotState.isMoving = false
      robotState.speed = 0
      robotState.velocity = { x: 0, y: 0, z: 0 }
      robotState.angularVelocity = 0
      console.log('🎯 Robot reached destination!')
    }
    io.emit('robotState', robotState)
  })

  // ========== DISCONNECT ==========
  socket.on('disconnect', (reason) => {
    robotState.connectedClients = Math.max(0, robotState.connectedClients - 1)
    console.log(`👋 Disconnected: ${socket.id} (${reason})`)
  })
})

// ============================================
// SIMULATION TICK LOOP (Server-side Physics)
// ============================================
const PHYSICS_DT = 1 / 60

setInterval(() => {
  if (robotState.isMoving) {
    // Update position
    robotState.position.x += robotState.velocity.x * PHYSICS_DT
    robotState.position.z += robotState.velocity.z * PHYSICS_DT

    // Update rotation
    robotState.rotation.y += robotState.angularVelocity * PHYSICS_DT

    // Normalize rotation [-PI, PI]
    while (robotState.rotation.y > Math.PI) robotState.rotation.y -= 2 * Math.PI
    while (robotState.rotation.y < -Math.PI) robotState.rotation.y += 2 * Math.PI

    // Recalculate velocity after rotation
    robotState.velocity = {
      x: robotState.speed * Math.sin(robotState.rotation.y),
      y: 0,
      z: robotState.speed * Math.cos(robotState.rotation.y)
    }

    // Boundary check
    const limit = simSettings.boundaryLimit
    robotState.position.x = Math.max(-limit, Math.min(limit, robotState.position.x))
    robotState.position.z = Math.max(-limit, Math.min(limit, robotState.position.z))

    // Battery drain
    robotState.battery = Math.max(0, robotState.battery - 0.005)
    if (robotState.battery <= 0) {
      robotState.isMoving = false
      robotState.speed = 0
      robotState.velocity = { x: 0, y: 0, z: 0 }
      robotState.angularVelocity = 0
      robotState.status = 'error'
    }
  }

  robotState.timestamp = Date.now()
}, PHYSICS_DT * 1000)

// Broadcast state at 30fps
setInterval(() => {
  io.emit('robotState', robotState)
}, 1000 / 30)

// ============================================
// REST API ENDPOINTS
// ============================================
app.get('/', (req, res) => {
  res.json({
    name: 'Robot Digital Twin Server',
    version: '1.0.0',
    status: 'running',
    clients: robotState.connectedClients,
    uptime: Math.floor(process.uptime())
  })
})

app.get('/api/status', (req, res) => {
  res.json(robotState)
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.floor(process.uptime()),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    clients: robotState.connectedClients
  })
})

app.get('/api/settings', (req, res) => {
  res.json(simSettings)
})

// ========== UPDATE SIMULATION SETTINGS ==========
app.post('/api/settings', (req, res) => {
  const allowed = ['physicsFPS', 'sensorUpdateRate', 'maxSpeed', 'worldSize', 'boundaryLimit']
  const updates = {}

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      simSettings[key] = req.body[key]
      updates[key] = req.body[key]
    }
  }

  io.emit('simSettings', simSettings)
  res.json({ message: 'Settings updated', updated: updates, settings: simSettings })
})

app.post('/api/reset', (req, res) => {
  robotState.position = { x: 0, y: 0.5, z: 0 }
  robotState.rotation = { y: 0 }
  robotState.velocity = { x: 0, y: 0, z: 0 }
  robotState.speed = 0
  robotState.angularVelocity = 0
  robotState.isMoving = false
  robotState.battery = 100
  robotState.status = 'idle'
  io.emit('robotState', robotState)
  res.json({ message: 'Robot reset', state: robotState })
})

// ============================================
// START SERVER
// ============================================
server.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║   🤖 Robot Digital Twin Server           ║')
  console.log(`║   🚀 Running on http://localhost:${PORT}   ║`)
  console.log(`║   🌐 Client: ${CLIENT_URL}       ║`)
  console.log('║   📡 WebSocket: Ready                    ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('')
})

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...')
  server.close(() => process.exit(0))
})
