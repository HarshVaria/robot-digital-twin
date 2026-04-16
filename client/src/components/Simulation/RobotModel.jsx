import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function RobotModel({ position, rotation, speed, isMoving, isDanger }) {
  position = position || { x: 0, y: 0.5, z: 0 }
  rotation = rotation || { y: 0 }
  speed = speed || 0
  isMoving = isMoving || false
  isDanger = isDanger || false

  var robotRef = useRef()
  var wheels = [useRef(), useRef(), useRef(), useRef()]
  var lidarRef = useRef()
  var sirenBlink = useRef()
  var targetPos = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!robotRef.current) return
    targetPos.set(position.x, 0.45, position.z)
    robotRef.current.position.lerp(targetPos, 0.15)

    var diff = rotation.y - robotRef.current.rotation.y
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI
    robotRef.current.rotation.y += diff * 0.15

    var wr = speed * delta * 8
    for (var i = 0; i < wheels.length; i++) {
      if (wheels[i].current) wheels[i].current.rotation.x += wr
    }
    if (lidarRef.current) lidarRef.current.rotation.y += delta * 5

    if (sirenBlink.current) {
        sirenBlink.current.intensity = isDanger ? (10 + Math.sin(state.clock.elapsedTime * 25) * 10) : 0
    }
  })

  var wPos = [
    [-0.7 - 0.06, -0.2, 0.55],
    [0.7 + 0.06, -0.2, 0.55],
    [-0.7 - 0.06, -0.2, -0.55],
    [0.7 + 0.06, -0.2, -0.55]
  ]

  // Sleek tech color palette for professional robotics feel
  const chassisColor = "#94a3b8" 
  const darkMetal = "#1e293b"
  const pureCarbon = "#0f172a"
  const neonAccent = isMoving ? "#0ea5e9" : "#3b82f6"

  return (
    <group ref={robotRef}>
      {/* Dynamic 3D Environment Alarm Siren */}
      <pointLight ref={sirenBlink} position={[0, 1.5, 0]} color="#ff4d4d" distance={15} decay={2} intensity={0} />

      {/* Main Base Chassis */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.35, 1.8]} />
        <meshPhysicalMaterial color={chassisColor} metalness={0.7} roughness={0.2} clearcoat={1.0} clearcoatRoughness={0.1} />
      </mesh>

      {/* Top Electronics Deck */}
      <mesh position={[0, 0.25, -0.15]} castShadow>
        <boxGeometry args={[0.98, 0.2, 0.9]} />
        <meshPhysicalMaterial color={darkMetal} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Front Bumper / Sensor Array Array */}
      <mesh position={[0, -0.05, 0.95]} castShadow>
        <boxGeometry args={[1.45, 0.2, 0.15]} />
        <meshPhysicalMaterial color={pureCarbon} metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Front Glowing Lightbar (Replaced simple cone) */}
      <mesh position={[0, 0.0, 1.03]}>
        <boxGeometry args={[0.8, 0.04, 0.02]} />
        <meshStandardMaterial color={neonAccent} emissive={neonAccent} emissiveIntensity={isMoving ? 1.5 : 0.5} toneMapped={false} />
      </mesh>

      {/* Lidar Scanner Tower */}
      <group position={[0, 0.45, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.15, 0.18, 0.2, 32]} />
          <meshPhysicalMaterial color={darkMetal} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Spinning Lidar Core */}
        <mesh ref={lidarRef} position={[0, 0.13, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 32]} />
          <meshStandardMaterial color={pureCarbon} />
          {/* Lidar Eye */}
          <mesh position={[0, 0, 0.1]}>
             <boxGeometry args={[0.08, 0.02, 0.04]} />
             <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={isMoving ? 1.5 : 0.5} toneMapped={false} />
          </mesh>
        </mesh>
        {/* Lidar Cap */}
        <mesh position={[0, 0.18, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.04, 32]} />
          <meshPhysicalMaterial color={chassisColor} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Antenna Node */}
      <group position={[-0.4, 0.35, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
          <meshPhysicalMaterial color="#cbd5e1" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color={isMoving ? "#10b981" : "#ef4444"} emissive={isMoving ? "#10b981" : "#ef4444"} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>

      {/* Wheels */}
      {wPos.map((p, i) => (
        <group key={i} position={p}>
          {/* Tire */}
          <mesh ref={wheels[i]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.16, 32]} />
            <meshStandardMaterial color="#020617" roughness={0.9} metalness={0.1} />
            {/* Hubcap */}
            <mesh position={[0, i % 2 === 0 ? 0.08 : -0.08, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
              <meshPhysicalMaterial color={darkMetal} metalness={0.8} roughness={0.3} />
            </mesh>
          </mesh>
        </group>
      ))}
    </group>
  )
}
