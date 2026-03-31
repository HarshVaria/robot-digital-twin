// PathVisualizer.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PathVisualizer = ({ pathData = [] }) => {
  const lineRef = useRef();
  const dotsRef = useRef();

  // Build path line and waypoint positions
  const { pathPoints, waypointPositions } = useMemo(() => {
    if (pathData.length < 2) return { pathPoints: null, waypointPositions: [] };

    // Create smooth curve through path points
    const curvePoints = pathData.map(
      (point) => new THREE.Vector3(point[0], 0.15, point[1])
    );
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.5);
    const points = curve.getPoints(pathData.length * 10);

    // Waypoint markers at actual path nodes
    const waypoints = pathData.map((point) => ({
      position: [point[0], 0.15, point[1]],
    }));

    return { pathPoints: points, waypointPositions: waypoints };
  }, [pathData]);

  // Animate the path line (dashed scroll effect)
  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.material.dashOffset = -clock.elapsedTime * 0.5;
    }
  });

  if (!pathPoints || pathPoints.length === 0) return null;

  return (
    <group>
      {/* === PATH LINE === */}
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(pathPoints.flatMap((p) => [p.x, p.y, p.z]))}
            count={pathPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color="#ffaa00"
          dashSize={0.3}
          gapSize={0.1}
          linewidth={1}
          transparent
          opacity={0.8}
        />
      </line>

      {/* === WAYPOINT DOTS === */}
      {waypointPositions.map((wp, index) => (
        <mesh key={index} position={wp.position}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color={index === 0 ? '#3498db' : index === waypointPositions.length - 1 ? '#00ff88' : '#ffaa00'}
            emissive={index === 0 ? '#3498db' : index === waypointPositions.length - 1 ? '#00ff88' : '#ffaa00'}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* === DIRECTION ARROWS along the path === */}
      {pathPoints
        .filter((_, i) => i % 20 === 10 && i < pathPoints.length - 1)
        .map((point, index) => {
          const nextPoint = pathPoints[Math.min(
            pathPoints.indexOf(point) + 5,
            pathPoints.length - 1
          )];
          const direction = new THREE.Vector3()
            .subVectors(nextPoint, point)
            .normalize();
          const angle = Math.atan2(direction.x, direction.z);

          return (
            <mesh
              key={`arrow-${index}`}
              position={[point.x, 0.2, point.z]}
              rotation={[0, angle, 0]}
            >
              <coneGeometry args={[0.06, 0.15, 6]} />
              <meshStandardMaterial
                color="#ffaa00"
                emissive="#ffaa00"
                emissiveIntensity={0.4}
              />
            </mesh>
          );
        })}
    </group>
  );
};

export default PathVisualizer;