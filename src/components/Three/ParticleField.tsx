import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../hooks/useTheme';

export default function ParticleField() {
  const { isDark } = useTheme();
  const points = useRef();

  const particleCount = 3000;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const distance = 15; // Increased spread

    for (let i = 0; i < particleCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      positions[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = distance * Math.cos(theta);
    }

    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    points.current.rotation.x = time * 0.05;
    points.current.rotation.y = time * 0.075;
  });

  return (
    <Points ref={points}>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        color={isDark ? '#8b5cf6' : '#6366f1'}
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