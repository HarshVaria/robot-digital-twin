# 🤖 Robot Digital Twin & Control Simulator

A full software digital twin of a robot with real-time 3D simulation,
sensor modeling, path planning algorithms, PID control, and web-based dashboard.

## 🌟 Features

- **3D Robot Simulation** — Three.js + Cannon.js physics engine
- **Sensor Simulation** — LiDAR (360° ray casting), IMU, Wheel Encoders
- **Path Planning** — A* and Dijkstra algorithms with 3D visualization
- **PID Motor Control** — Tunable PID controller with anti-windup
- **Web Dashboard** — Real-time control panel with keyboard & joystick
- **WebSocket Communication** — 60fps real-time telemetry streaming

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D Engine | Three.js (@react-three/fiber) |
| Physics | Cannon-es |
| Backend | Node.js + Express |
| Real-time | Socket.io (WebSockets) |
| Algorithms | A*, Dijkstra, PID Controller |

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/robot-digital-twin.git
cd robot-digital-twin
npm install
npm run install-all