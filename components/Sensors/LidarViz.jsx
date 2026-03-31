// LidarViz.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LidarViz = ({ robotPosition = [0, 0, 0], robotRotation = 0, lidarData = [] }) => {
  const raysRef = useRef();
  const pointsRef = useRef();

  // Build ray lines from robot to each hit point
  const { rayPositions, hitPositions, hitColors } = useMemo(() => {
    const rayPos = [];
    const hitPos = [];
    const hitCol = [];

    lidarData.forEach((reading) => {
      // reading = { angle (radians), distance (meters), hit (boolean) }
      const worldAngle = reading.angle + robotRotation;
      const startX = robotPosition[0];
      const startY = 0.7; // LiDAR height on robot
      const startZ = robotPosition[2];

      const endX = startX + Math.cos(worldAngle) * reading.distance;
      const endZ = startZ + Math.sin(worldAngle) * reading.distance;
      const endY = startY;

      // Ray line: start point → end point (each line needs 2 vertices)
      rayPos.push(startX, startY, startZ);
      rayPos.push(endX, endY, endZ);

      // Hit point position
      if (reading.hit) {
        hitPos.push(endX, endY, endZ);

        // Color based on distance (close = red, far = green)
        const maxDist = 8;
        const ratio = Math.min(reading.distance / maxDist, 1);
        hitCol.push(1 - ratio, ratio, 0.2); // R, G, B
      }
    });

    return {
      rayPositions: new Float32Array(rayPos),
      hitPositions: new Float32Array(hitPos),
      hitColors: new Float32Array(hitCol),
    };
  }, [lidarData, robotPosition, robotRotation]);

  // Subtle animation for point glow
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material;
      material.size = 0.12 + Math.sin(clock.elapsedTime * 3) * 0.02;
    }
  });

  if (lidarData.length === 0) return null;

  return (
    <group>
      {/* === LIDAR RAY LINES === */}
      <lineSegments ref={raysRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={rayPositions}
            count={rayPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ff88" transparent opacity={0.15} linewidth={1} />
      </lineSegments>

      {/* === HIT POINTS (colored dots where LiDAR hits obstacles) === */}
      {hitPositions.length > 0 && (
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={hitPositions}
              count={hitPositions.length / 3}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              array={hitColors}
              count={hitColors.length / 3}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.12} vertexColors sizeAttenuation transparent opacity={0.9} />
        </points>
      )}
    </group>
  );
};

export default LidarViz;