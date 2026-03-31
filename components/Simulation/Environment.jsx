// Environment.jsx
import React from 'react';
import obstacleData from '../../utils/obstacleData';

const Obstacle = ({ obstacle }) => {
  if (obstacle.type === 'cylinder') {
    return (
      <mesh position={obstacle.position} castShadow receiveShadow>
        <cylinderGeometry args={[obstacle.radius, obstacle.radius, obstacle.height, 20]} />
        <meshStandardMaterial color={obstacle.color} roughness={0.5} metalness={0.2} />
      </mesh>
    );
  }

  // Default: box-shaped obstacles and walls
  return (
    <mesh position={obstacle.position} castShadow receiveShadow>
      <boxGeometry args={obstacle.size} />
      <meshStandardMaterial
        color={obstacle.color}
        roughness={0.6}
        metalness={0.1}
        transparent={obstacle.type === 'wall'}
        opacity={obstacle.type === 'wall' ? 0.8 : 1}
      />
    </mesh>
  );
};

const Environment = () => {
  return (
    <group>
      {/* === GROUND PLANE === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a2332" roughness={0.8} />
      </mesh>

      {/* === GRID ON THE FLOOR === */}
      <gridHelper args={[20, 20, '#2a3a4a', '#2a3a4a']} position={[0, 0.01, 0]} />

      {/* === RENDER ALL OBSTACLES === */}
      {obstacleData.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}

      {/* === GOAL/TARGET MARKER === */}
      <mesh position={[4, 0.05, 4]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          side={2}
        />
      </mesh>
      <mesh position={[4, 0.06, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.8}
          side={2}
        />
      </mesh>

      {/* === START MARKER === */}
      <mesh position={[-4, 0.05, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshStandardMaterial
          color="#3498db"
          emissive="#3498db"
          emissiveIntensity={0.5}
          side={2}
        />
      </mesh>
    </group>
  );
};

export default Environment;