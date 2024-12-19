import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../hooks/useTheme';

export default function DNAHelix() {
  const { isDark } = useTheme();
  const helix = useRef();
  
  const particleCount = 200; // Increased particle count
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const radius = 3; // Increased radius
    const height = 10; // Increased height
    
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 8; // More rotations
      const y = (i / particleCount) * height - height / 2;
      
      pos[i * 3] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    helix.current.rotation.y = time * 0.1;
    helix.current.rotation.z = Math.sin(time * 0.2) * 0.1;
  });

  return (
    <Points ref={helix}>
      <PointMaterial
        transparent
        vertexColors
        size={0.2}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        color={isDark ? '#4f46e5' : '#6366f1'}
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}