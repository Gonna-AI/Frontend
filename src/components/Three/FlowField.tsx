import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function FlowField() {
  const points = useRef();
  
  const count = 5000;
  const sep = 3;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const x = points.current.geometry.attributes.position.array[i * 3];
      const y = points.current.geometry.attributes.position.array[i * 3 + 1];
      const z = points.current.geometry.attributes.position.array[i * 3 + 2];

      // Flow field animation
      points.current.geometry.attributes.position.array[i * 3] += Math.sin(y * 0.1 + time * 0.1) * 0.1;
      points.current.geometry.attributes.position.array[i * 3 + 1] += Math.cos(x * 0.1 + time * 0.1) * 0.1;
      points.current.geometry.attributes.position.array[i * 3 + 2] += Math.sin(time * 0.1) * 0.1;

      // Keep particles within bounds
      if (Math.abs(x) > 50) points.current.geometry.attributes.position.array[i * 3] *= -0.95;
      if (Math.abs(y) > 50) points.current.geometry.attributes.position.array[i * 3 + 1] *= -0.95;
      if (Math.abs(z) > 25) points.current.geometry.attributes.position.array[i * 3 + 2] *= -0.95;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={points}>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
        color="#8b5cf6"
        blending={THREE.AdditiveBlending}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
}