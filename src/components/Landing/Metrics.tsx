import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { PhoneCall, Clock, Brain, Smile } from 'lucide-react';

// FlickeringGrid Component
const FlickeringGrid = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(0, 0, 0)",
  width,
  height,
  className,
  maxOpacity = 0.3,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (color) => {
      if (typeof window === "undefined") return `rgba(0, 0, 0,`;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 0, 0,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas, width, height) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity]
  );

  const updateSquares = useCallback(
    (squares, deltaTime) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity]
  );

  const drawGrid = useCallback(
    (ctx, width, height, cols, rows, squares, dpr) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx.fillStyle = `${memoizedColor}${opacity})`;
          ctx.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
    },
    [memoizedColor, squareSize, gridGap]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let gridParams;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      />
    </div>
  );
};

// Morphing Text Hook
const useMorphingText = (texts) => {
  const morphTime = 1.5;
  const cooldownTime = 0.5;
  
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  const setStyles = useCallback(
    (fraction) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;
      current2.style.filter = `blur(${Math.min(4 / fraction - 4, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.3) * 100}%`;
      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(4 / invertedFraction - 4, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;
      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;
    let fraction = morphRef.current / morphTime;
    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }
    setStyles(fraction);
    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;
      cooldownRef.current -= dt;
      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };
    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

// Morphing Title Component
const MorphingTitle = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  
  return (
    <div className="relative h-24 text-center text-6xl lg:text-7xl font-bold text-white [filter:url(#threshold)_blur(0.3px)]">
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
      <svg className="hidden">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// Metrics Data
const metrics = [
  {
    icon: PhoneCall,
    value: "60%",
    label: "Reduced Call Wait Time"
  },
  {
    icon: Clock,
    value: "85%",
    label: "Faster Claims Processing"
  },
  {
    icon: Brain,
    value: "98%",
    label: "Accurate Prioritization"
  },
  {
    icon: Smile,
    value: "92%",
    label: "Client Satisfaction"
  }
];

// Main Component
const Metrics = () => {
  const titleTexts = [
    "Your Donna",
    "Your Jarvis",
    "Your Samantha",
    "Your Cortana",
    "Your VIKI",
    "Your GLaDOS",
    "Your KITT",
    "Your Marvin",
    "Your TARS",
    "Your Ava",
    "Your Chappie",
    "Your EVE",
    "Your Red Queen",
    "Your Athena"
  ];
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-6 py-20">
      {/* FlickeringGrid Background */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="z-0 absolute inset-0 size-full"
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
      </div>

      {/* Enhanced Corner Gradients */}
      <div className="absolute right-0 top-0 h-[45rem] w-[45rem] blur-2xl bg-gradient-to-bl from-red-600/20 via-rose-500/20 to-transparent" />
      <div className="absolute bottom-0 left-0 h-[35rem] w-[35rem] blur-3xl bg-gradient-to-tr from-red-600/20 via-purple-500/20 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-4xl">
        <MorphingTitle texts={titleTexts} />
        
        <p className="mx-auto mb-12 mt-4 max-w-2xl text-center text-lg text-white/60">
          Revolutionizing claims processing with AI-powered intelligence and real-time analytics
        </p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="group relative transform rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:scale-105 hover:bg-white/10 backdrop-blur-sm"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all group-hover:bg-white/10">
                  <metric.icon className="h-8 w-8 text-red-400 transition-colors group-hover:text-red-300" />
                </div>
                
                <div className="mb-3 text-4xl font-bold text-white transition-colors group-hover:text-red-300">
                  {metric.value}
                </div>
                
                <div className="font-medium text-white/60 transition-colors group-hover:text-white/80">
                  {metric.label}
                </div>
              </div>
              
              <div className="absolute right-2 top-2 flex space-x-1">
                <div className="h-1 w-1 rounded-full bg-red-400/40" />
                <div className="h-1 w-1 rounded-full bg-red-400/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Metrics;