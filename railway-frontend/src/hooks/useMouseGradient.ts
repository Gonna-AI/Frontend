import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

export function useMouseGradient() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const gradientStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(129, 140, 248, 0.2) 0%, rgba(168, 85, 247, 0.2) 45%, rgba(236, 72, 153, 0.2) 100%)`,
  };

  return { gradientStyle };
}