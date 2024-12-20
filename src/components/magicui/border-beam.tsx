import React, { useRef, useEffect } from 'react';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
}

export function BorderBeam({ size = 250, duration = 12, delay = 9 }: BorderBeamProps) {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;

    const animate = () => {
      beam.style.transform = 'translateX(-100%)';
      setTimeout(() => {
        beam.style.transition = 'none';
        beam.style.transform = 'translateX(100%)';
        setTimeout(() => {
          beam.style.transition = `transform ${duration}s linear`;
          beam.style.transform = 'translateX(-100%)';
        }, 50);
      }, duration * 1000);
    };

    const timeoutId = setTimeout(animate, delay * 1000);
    const intervalId = setInterval(animate, (duration + delay) * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [duration, delay]);

  return (
    <div
      ref={beamRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
      style={{ width: `${size}%` }}
    />
  );
}