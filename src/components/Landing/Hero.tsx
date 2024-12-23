"use client";

import React, { useEffect, useRef, useState } from "react";
import { Brain, Shield, Zap } from 'lucide-react';
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility functions
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function flattenColorPalette(colors: any) {
  return Object.assign(
    {},
    ...Object.entries(colors).flatMap(([color, values]) =>
      typeof values == "object"
        ? Object.entries(values).map(([key, value]) => ({
            [color + (key === "DEFAULT" ? "" : `-${key}`)]: value,
          }))
        : [{ [`${color}`]: values }]
    )
  );
}

// Particles Component
interface MousePosition {
  x: number;
  y: number;
}

function MousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const mousePosition = MousePosition();
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const rafID = useRef<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    window.addEventListener("resize", initCanvas);

    return () => {
      if (rafID.current != null) {
        window.cancelAnimationFrame(rafID.current);
      }
      window.removeEventListener("resize", initCanvas);
    };
  }, [color]);

  useEffect(() => {
    onMouseMove();
  }, [mousePosition.x, mousePosition.y]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    resizeCanvas();
    drawParticles();
  };

  const onMouseMove = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const { w, h } = canvasSize.current;
      const x = mousePosition.x - rect.left - w / 2;
      const y = mousePosition.y - rect.top - h / 2;
      const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
      if (inside) {
        mouse.current.x = x;
        mouse.current.y = y;
      }
    }
  };

  type Circle = {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    magnetism: number;
  };

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);
    }
  };

  const circleParams = (): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return {
      x,
      y,
      translateX,
      translateY,
      size: pSize,
      alpha,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  };

  const rgb = hexToRgb(color);

  const drawCircle = (circle: Circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle;
      context.current.translate(translateX, translateY);
      context.current.beginPath();
      context.current.arc(x, y, size, 0, 2 * Math.PI);
      context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
      context.current.fill();
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!update) {
        circles.current.push(circle);
      }
    }
  };

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(
        0,
        0,
        canvasSize.current.w,
        canvasSize.current.h,
      );
    }
  };

  const drawParticles = () => {
    clearContext();
    const particleCount = quantity;
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  };

  const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): number => {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  };

  const animate = () => {
    clearContext();
    circles.current.forEach((circle: Circle, i: number) => {
      // Handle the alpha value
      const edge = [
        circle.x + circle.translateX - circle.size, // distance from left edge
        canvasSize.current.w - circle.x - circle.translateX - circle.size, // distance from right edge
        circle.y + circle.translateY - circle.size, // distance from top edge
        canvasSize.current.h - circle.y - circle.translateY - circle.size, // distance from bottom edge
      ];
      const closestEdge = edge.reduce((a, b) => Math.min(a, b));
      const remapClosestEdge = parseFloat(
        remapValue(closestEdge, 0, 20, 0, 1).toFixed(2),
      );
      if (remapClosestEdge > 1) {
        circle.alpha += 0.02;
        if (circle.alpha > circle.targetAlpha) {
          circle.alpha = circle.targetAlpha;
        }
      } else {
        circle.alpha = circle.targetAlpha * remapClosestEdge;
      }
      circle.x += circle.dx + vx;
      circle.y += circle.dy + vy;
      circle.translateX +=
        (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) /
        ease;
      circle.translateY +=
        (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) /
        ease;

      drawCircle(circle, true);

      // circle gets out of the canvas
      if (
        circle.x < -circle.size ||
        circle.x > canvasSize.current.w + circle.size ||
        circle.y < -circle.size ||
        circle.y > canvasSize.current.h + circle.size
      ) {
        // remove the circle from the array
        circles.current.splice(i, 1);
        // create a new circle
        const newCircle = circleParams();
        drawCircle(newCircle);
        // update the circle position
      }
    });
    rafID.current = window.requestAnimationFrame(animate);
  };

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
      <div>
        <Icon className="w-10 h-10 text-purple-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/60">
          {description}
        </p>
      </div>
    </div>
  );
};

// Main Hero Component
interface HeroProps {
  onGetStarted: () => void;
  onJoinWaitlist: () => void;
}

const Hero = ({ onGetStarted, onJoinWaitlist }: HeroProps) => {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={50}
        ease={50}
        color="#ffffff"
      />
      <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 150" width="300" height="112.5">
            <defs>
              <linearGradient id="mintGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7FFFD4"/>
                <stop offset="50%" stopColor="#64D8BD"/>
                <stop offset="100%" stopColor="#48C1A3"/>
              </linearGradient>
            </defs>
            <text x="20" y="100" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="url(#mintGradient)">gonna.ai</text>
          </svg>
        </div>

        <div className="flex flex-col items-center space-y-6 mb-6">
          <h1 className="text-4xl font-bold flex flex-col items-center">
            <span className="mb-4">
              <span className="text-black dark:text-white bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500 px-1 rounded-lg">
                Revolutionizing
              </span>
            </span>
            <span className="text-neutral-700 dark:text-white/90">
              BPO Claims Processing
            </span>
          </h1>
        </div>

        <p className="text-xl mb-12 text-neutral-700 dark:text-white/70 max-w-3xl mx-auto leading-relaxed">
          Transform your claims processing workflow with AI-driven automation,
          intelligent callback scheduling, and real-time sentiment analysis
        </p>

        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold"
          >
            Learn More
          </button>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Analysis",
              description: "Advanced machine learning for accurate claim processing"
            },
            {
              icon: Shield,
              title: "Secure Processing",
              description: "Enterprise-grade security for sensitive data"
            },
            {
              icon: Zap,
              title: "Real-time Processing",
              description: "Instant analysis and automated decision making"
            }
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

