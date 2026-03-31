// Scene.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import RobotModel from './RobotModel';
import Environment from './Environment';
import LidarViz from '../Sensors/LidarViz';
import PathVisualizer from '../PathPlanning/PathVisualizer';

const Scene = ({
  robotPosition = [0, 0, 0],
  robotRotation = 0,
  lidarData = [],
  pathData = [],
  sensorData = {},
}) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      <Canvas shadows>
        {/* === CAMERA === */}
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={3}
          maxDistance={25}
        />

        {/* === LIGHTING === */}
        {/* Ambient light (base brightness) */}
        <ambientLight intensity={0.3} color="#b0c4de" />

        {/* Main directional light (sun-like) with shadows */}
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />

        {/* Fill light (softer, from opposite side) */}
        <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#4a90d9" />

        {/* Point light near robot for dramatic effect */}
        <pointLight
          position={[robotPosition[0], 3, robotPosition[2]]}
          intensity={0.5}
          color="#1abc9c"
          distance={8}
        />

        {/* === FOG (depth effect) === */}
        <fog attach="fog" args={['#0a0a0a', 15, 35]} />

        {/* === STARS (background) === */}
        <Stars radius={50} depth={50} count={2000} factor={4} fade speed={1} />

        {/* === SCENE CONTENT === */}
        <Suspense fallback={null}>
          <Environment />
          <RobotModel
            position={robotPosition}
            rotation={robotRotation}
            sensorData={sensorData}
          />
          {lidarData.length > 0 && (
            <LidarViz
              robotPosition={robotPosition}
              robotRotation={robotRotation}
              lidarData={lidarData}
            />
          )}
          {pathData.length > 0 && (
            <PathVisualizer pathData={pathData} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;