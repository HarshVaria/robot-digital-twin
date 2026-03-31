// RobotModel.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RobotModel = ({ position = [0, 0, 0], rotation = 0, sensorData }) => {
  const robotRef = useRef();

  // Update robot position and rotation every frame
  useFrame(() => {
    if (robotRef.current) {
      robotRef.current.position.set(position[0], position[1], position[2]);
      robotRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={robotRef}>
      {/* === BODY (Main Chassis) === */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === TOP PLATFORM === */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* === LIDAR DOME (on top) === */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
        <meshStandardMaterial color="#1abc9c" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Lidar spinning indicator */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>

      {/* === FRONT INDICATOR (so we know which way robot faces) === */}
      <mesh position={[0.6, 0.35, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.3} />
      </mesh>

      {/* === LEFT FRONT WHEEL === */}
      <mesh position={[0.35, 0.12, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* === RIGHT FRONT WHEEL === */}
      <mesh position={[0.35, 0.12, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* === LEFT REAR WHEEL === */}
      <mesh position={[-0.35, 0.12, 0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* === RIGHT REAR WHEEL === */}
      <mesh position={[-0.35, 0.12, -0.45]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>

      {/* === CAMERA/SENSOR (front-mounted) === */}
      <mesh position={[0.55, 0.5, 0]} castShadow>
        <boxGeometry args={[0.12, 0.08, 0.15]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Camera lens */}
      <mesh position={[0.62, 0.5, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.4} />
      </mesh>

      {/* === ANTENNA === */}
      <mesh position={[-0.3, 0.75, 0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.8} />
      </mesh>
      <mesh position={[-0.3, 0.92, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#e74c3c" emissive="#e74c3c" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

export default RobotModel;