import { DEFAULT_OBSTACLES } from '../../utils/obstacleData'

export default function SimEnvironment({ obstacles }) {
  obstacles = obstacles || DEFAULT_OBSTACLES

  var walls = [
    { pos: [0, 0.75, -14.5], size: [30, 1.5, 0.3] },
    { pos: [0, 0.75, 14.5], size: [30, 1.5, 0.3] },
    { pos: [-14.5, 0.75, 0], size: [0.3, 1.5, 30] },
    { pos: [14.5, 0.75, 0], size: [0.3, 1.5, 30] }
  ]

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color="#1f6feb" transparent opacity={0.5} />
      </mesh>

      {walls.map(function (w, i) {
        return (
          <mesh key={'w' + i} position={w.pos} castShadow>
            <boxGeometry args={w.size} />
            <meshStandardMaterial color="#37474F" transparent opacity={0.6} />
          </mesh>
        )
      })}

      {obstacles.map(function (obs) {
        return (
          <group key={obs.id}>
            <mesh position={obs.position} castShadow>
              <boxGeometry args={obs.size} />
              <meshStandardMaterial color={obs.color} roughness={0.6} />
            </mesh>
            <mesh position={[obs.position[0], obs.position[1] + obs.size[1] / 2 + 0.01, obs.position[2]]}>
              <boxGeometry args={[obs.size[0] + 0.05, 0.02, obs.size[2] + 0.05]} />
              <meshBasicMaterial color={obs.color} transparent opacity={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}