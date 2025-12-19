import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import FlowField from './FlowField';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

export default function Scene() {
  const { isLowEnd } = useDeviceDetection();

  // Don't render Three.js on low-end devices
  if (isLowEnd) {
    return null;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 50], fov: 75 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
      dpr={[1, 1.5]} // Reduced from [1, 2] for better performance
      performance={{ min: 0.5 }} // Lower performance threshold
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FlowField />
        <Preload all />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.3} // Reduced from 0.5
      />
    </Canvas>
  );
}