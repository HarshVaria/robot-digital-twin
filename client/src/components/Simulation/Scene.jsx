import { OrbitControls, Grid, Sky, Stars, ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei'

export default function Scene({ children }) {
  return (
    <>
      {/* 1. Camera & Background Setup */}
      <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} />
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, 50]} />

      {/* 2. Enhanced Lighting & Reflections */}
      {/* Environment gives the robot "twin" realistic metallic reflections */}
      <Environment preset="city" /> 
      <ambientLight intensity={0.2} />
      
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize={[1024, 1024]} // Reduced for performance, but crisp enough
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      
      {/* Subtle accent light to define the silhouette of the robot */}
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#4fa3ff" />

      {/* 3. Atmosphere */}
      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />

      {/* 4. Floor & Grid */}
      <Grid 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={0.7} 
        cellColor="#202020"
        sectionSize={5} 
        sectionThickness={1.2} 
        sectionColor="#353535"
        fadeDistance={40} 
        infiniteGrid 
      />
      
      {/* Soft shadow directly under the robot for a "grounded" feel */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />

      {/* 5. Controls */}
      <OrbitControls 
        makeDefault
        maxPolarAngle={Math.PI / 2.1} 
        minPolarAngle={0.1}
        minDistance={2} 
        maxDistance={40} 
        enableDamping 
        dampingFactor={0.05} 
      />

      {/* Your Robot Models */}
      {children}
    </>
  )
}
