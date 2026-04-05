import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function RobotModel({ position, rotation, speed, isMoving }) {
  position = position || { x: 0, y: 0.5, z: 0 }
  rotation = rotation || { y: 0 }
  speed = speed || 0
  isMoving = isMoving || false

  var robotRef = useRef()
  var wheels = [useRef(), useRef(), useRef(), useRef()]
  var lidarRef = useRef()
  var targetPos = useMemo(function () { return new THREE.Vector3() }, [])

  useFrame(function (state, delta) {
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
  })

  var wPos = [
    [-0.7 - 0.06, -0.2, 0.55],
    [0.7 + 0.06, -0.2, 0.55],
    [-0.7 - 0.06, -0.2, -0.55],
    [0.7 + 0.06, -0.2, -0.55]
  ]

  return (
    <group ref={robotRef}>
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.4, 1.8]} />
        <meshStandardMaterial color="#1565C0" metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.3, -0.15]} castShadow>
        <boxGeometry args={[0.98, 0.2, 0.9]} />
        <meshStandardMaterial color="#0D47A1" metalness={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[0, -0.05, 0.95]} castShadow>
        <boxGeometry args={[1.47, 0.24, 0.1]} />
        <meshStandardMaterial color="#263238" />
      </mesh>

      <mesh position={[0, 0.21, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.3, 3]} />
        <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={0.8} />
      </mesh>

      <group position={[0, 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#333" metalness={0.8} />
        </mesh>
        <mesh ref={lidarRef} position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#FF5722" emissive="#FF5722" emissiveIntensity={isMoving ? 0.6 : 0.2} />
        </mesh>
      </group>

      <mesh position={[0, 0.32, 0.6]}>
        <boxGeometry args={[0.2, 0.15, 0.15]} />
        <meshStandardMaterial color="#212121" />
      </mesh>

      <mesh position={[0.6, 0.21, 0.8]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={isMoving ? '#4CAF50' : '#ff9800'} emissive={isMoving ? '#4CAF50' : '#ff9800'} emissiveIntensity={1} />
      </mesh>

      <group position={[-0.4, 0.3, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#666" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#f44336" emissive="#f44336" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {wPos.map(function (p, i) {
        return (
          <group key={i} position={p}>
            <mesh ref={wheels[i]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.25, 0.25, 0.12, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.13, 8]} />
              <meshStandardMaterial color="#555" metalness={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
