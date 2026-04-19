import { useMemo } from 'react'
import * as THREE from 'three'

export default function PathVisualizer({ pathResults, selectedPathId, gridMap, startPos, goalPos, currentWaypoint }) {
  pathResults = pathResults || {}
  selectedPathId = selectedPathId || null
  currentWaypoint = currentWaypoint || 0

  var visitedCells = useMemo(() => {
    if (!selectedPathId || !pathResults[selectedPathId]) return []
    return pathResults[selectedPathId].visited || []
  }, [pathResults, selectedPathId])

  var visitedPositions = useMemo(function () {
    if (!visitedCells.length || !gridMap) return []
    return visitedCells.map(function (c) { return gridMap.gridToWorld(c.row, c.col) })
  }, [visitedCells, gridMap])

  var pathCurves = useMemo(function() {
    var curves = {}
    var i = 0
    for (var algoKey in pathResults) {
      if (pathResults[algoKey] && pathResults[algoKey].found && pathResults[algoKey].path.length > 1) {
        var yOffset = 0.12 + (i * 0.02)
        var points = pathResults[algoKey].path.map(function (p) { return new THREE.Vector3(p.x, yOffset, p.z) })
        curves[algoKey] = new THREE.CatmullRomCurve3(points, false)
        i++
      }
    }
    return curves;
  }, [pathResults])

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

      {Object.keys(pathCurves).map((algoKey, i) => {
         const isSelected = algoKey === selectedPathId;
         const curve = pathCurves[algoKey];
         const pathLen = pathResults[algoKey].path.length;
         
         const colors = ['#3b82f6', '#ec4899', '#06b6d4', '#eab308', '#8b5cf6', '#10b981'];
         const color = colors[i % colors.length];
         const finalColor = isSelected ? '#4ade80' : color;
         const emissiveInt = isSelected ? 0.6 : 0.3;
         const opacity = isSelected ? 1.0 : 0.35;
         const thickness = isSelected ? 0.07 : 0.03;

         return (
           <mesh key={`path-${algoKey}`}>
             <tubeGeometry args={[curve, pathLen * 2, thickness, 8, false]} />
             <meshStandardMaterial color={finalColor} emissive={finalColor} emissiveIntensity={emissiveInt} transparent opacity={opacity} />
           </mesh>
         );
      })}

      {selectedPathId && pathResults[selectedPathId] && pathResults[selectedPathId].path.length > 0 && currentWaypoint < pathResults[selectedPathId].path.length && (
        <mesh position={[pathResults[selectedPathId].path[currentWaypoint].x, 0.3, pathResults[selectedPathId].path[currentWaypoint].z]}>
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