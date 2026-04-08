import { useMemo } from 'react'
import * as THREE from 'three'

export default function PathVisualizer({ path, visitedCells, gridMap, startPos, goalPos, currentWaypoint }) {
  path = path || []
  visitedCells = visitedCells || []
  currentWaypoint = currentWaypoint || 0

  var pathCurve = useMemo(function () {
    if (path.length < 2) return null
    var points = path.map(function (p) { return new THREE.Vector3(p.x, 0.12, p.z) })
    return new THREE.CatmullRomCurve3(points, false)
  }, [path])

  var visitedPositions = useMemo(function () {
    if (!visitedCells.length || !gridMap) return []
    return visitedCells.map(function (c) { return gridMap.gridToWorld(c.row, c.col) })
  }, [visitedCells, gridMap])

  return (
    <group>
      {visitedPositions.map(function (pos, i) {
        return (
          <mesh key={'v' + i} position={[pos.x, 0.03, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.85, 0.85]} />
            <meshBasicMaterial color="#1f6feb" transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
        )
      })}

      {pathCurve && (
        <mesh>
          <tubeGeometry args={[pathCurve, path.length * 2, 0.06, 8, false]} />
          <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={0.4} />
        </mesh>
      )}

      {path.length > 0 && currentWaypoint < path.length && (
        <mesh position={[path[currentWaypoint].x, 0.3, path[currentWaypoint].z]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={0.8} transparent opacity={0.7} />
        </mesh>
      )}

      {startPos && (
        <mesh position={[startPos.x, 0.4, startPos.z]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#4CAF50" emissive="#4CAF50" emissiveIntensity={0.6} />
        </mesh>
      )}

      {goalPos && (
        <group position={[goalPos.x, 0, goalPos.z]}>
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
    </group>
  )
}