import { useMemo } from 'react'
import * as THREE from 'three'

export default function LidarVisualization({ scanData, robotPosition }) {
  scanData = scanData || []
  robotPosition = robotPosition || { x: 0, z: 0 }

  var pointsGeometry = useMemo(function () {
    if (scanData.length === 0) return null
    var pos = []
    var col = []
    for (var i = 0; i < scanData.length; i++) {
      var p = scanData[i]
      if (p.hit && p.point) {
        pos.push(p.point.x, 0.5, p.point.z)
        var r = Math.min(1, p.distance / 10)
        col.push(r, 1 - r, 0)
      }
    }
    if (pos.length === 0) return null
    var g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    return g
  }, [scanData])

  var raysGeometry = useMemo(function () {
    if (scanData.length === 0) return null
    var pos = []
    for (var i = 0; i < scanData.length; i += 6) {
      var p = scanData[i]
      if (p && p.point) {
        pos.push(robotPosition.x, 0.5, robotPosition.z)
        pos.push(p.point.x, 0.5, p.point.z)
      }
    }
    if (pos.length === 0) return null
    var g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [scanData, robotPosition])

  if (scanData.length === 0) return null

  return (
    <group>
      {pointsGeometry && (
        <points>
          <primitive object={pointsGeometry} attach="geometry" />
          <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} sizeAttenuation />
        </points>
      )}
      {raysGeometry && (
        <lineSegments>
          <primitive object={raysGeometry} attach="geometry" />
          <lineBasicMaterial color="#00ff41" transparent opacity={0.1} />
        </lineSegments>
      )}
    </group>
  )
}