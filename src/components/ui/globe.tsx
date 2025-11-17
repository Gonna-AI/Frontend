"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "../../utils/cn";

interface GlobeProps {
  className?: string;
  config?: any;
}

export function Globe({ className, config = {} }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let phi = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    const initGlobe = () => {
      if (canvasRef.current && containerRef.current) {
        const width = containerRef.current.offsetWidth || 1000;
        const height = containerRef.current.offsetHeight || 600;
        
        globe = createGlobe(canvasRef.current, {
          devicePixelRatio: 2,
          width: width * 2,
          height: height * 2,
          phi: 0,
          theta: 0,
          dark: 1,
          diffuse: 1.2,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.3, 0.3, 0.3],
          markerColor: [0.1, 0.8, 1],
          glowColor: [1, 1, 1],
          markers: [],
          onRender: (state) => {
            state.phi = phi;
            phi += 0.01;
          },
          ...config,
        });
      }
    };

    // Small delay to ensure container is rendered
    const timeoutId = setTimeout(initGlobe, 100);

    return () => {
      clearTimeout(timeoutId);
      if (globe) {
        globe.destroy();
      }
    };
  }, [config]);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full min-h-[600px]", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", contain: "layout style paint" }}
      />
    </div>
  );
}

