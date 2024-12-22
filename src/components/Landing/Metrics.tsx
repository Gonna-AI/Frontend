"use client"

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const BackgroundGradientAnimation = ({ children }) => {
  const containerRef = useRef(null);
  const gradientOpacity = useMotionValue(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        gradientOpacity.set(entry.isIntersecting ? 1 : 0.1);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], rootMargin: '-10% 0px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0 w-full h-full" style={{ opacity: gradientOpacity }}>
        <div className="absolute h-full w-full z-10 backdrop-blur-[100px]" />
        <div className="absolute top-0 z-[1] w-full h-full">
          <div className="absolute inset-0">
            <motion.div style={{ opacity: gradientOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[45rem] w-[45rem] bg-red-500/40 rounded-full blur-3xl animate-first" />
            <motion.div style={{ opacity: gradientOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] bg-purple-500/40 rounded-full blur-3xl animate-second" />
            <motion.div style={{ opacity: gradientOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] bg-rose-500/40 rounded-full blur-3xl animate-third" />
            <motion.div style={{ opacity: gradientOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] bg-red-500/40 rounded-full blur-3xl animate-fourth" />
            <motion.div style={{ opacity: gradientOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[25rem] w-[25rem] bg-purple-500/40 rounded-full blur-3xl animate-fifth" />
          </div>
        </div>
      </motion.div>
      {children}
    </div>
  );
};

const ParallaxText = React.memo(({ children, baseVelocity = 100, className }) => {
  const baseX = useMotionValue(0);
  const [repetitions, setRepetitions] = useState(1);
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;
        const newRepetitions = Math.ceil(containerWidth / textWidth) + 2;
        setRepetitions(newRepetitions);
      }
    };

    const debouncedCalculate = () => {
      window.requestAnimationFrame(calculateRepetitions);
    };

    calculateRepetitions();
    window.addEventListener('resize', debouncedCalculate);
    return () => window.removeEventListener('resize', debouncedCalculate);
  }, [children]);

  const x = useTransform(baseX, (v) => `${wrap(-100 / repetitions, 0, v)}%`);

  useAnimationFrame((t, delta) => {
    baseX.set(baseX.get() + baseVelocity * (delta / 1000));
  });

  return (
    <div className="w-full overflow-hidden whitespace-nowrap" ref={containerRef}>
      <motion.div className={cn("inline-block", className)} style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <span key={i} ref={i === 0 ? textRef : null}>
            {children}{" "}
          </span>
        ))}
      </motion.div>
    </div>
  );
});

const VelocityScroll = React.memo(({ text, default_velocity = 5, className }) => {
  return (
    <section className="relative w-full">
      <ParallaxText baseVelocity={default_velocity} className={className}>
        {text}
      </ParallaxText>
      <ParallaxText baseVelocity={-default_velocity} className={className}>
        {text}
      </ParallaxText>
    </section>
  );
});

const CARDS = [
  {
    id: 0,
    name: "AI Assistant",
    designation: "Natural Language Processing",
    content: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          60%
        </div>
        <p className="text-sm md:text-base text-center text-white/80">
          Faster response time with <br/> 98% accuracy in intent recognition
        </p>
      </div>
    ),
  },
  {
    id: 1,
    name: "Claims Processor",
    designation: "Automated Processing",
    content: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          85%
        </div>
        <p className="text-sm md:text-base text-center text-white/80">
          Reduction in manual processing time<br/>with enhanced accuracy
        </p>
      </div>
    ),
  },
  {
    id: 2,
    name: "Customer Service",
    designation: "Support Enhancement",
    content: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          92%
        </div>
        <p className="text-sm md:text-base text-center text-white/80">
          Client satisfaction rate with<br/>AI-powered assistance
        </p>
      </div>
    ),
  },
];

const Card = ({ card }) => {
  return (
    <div className="flex-shrink-0 w-64 h-80 bg-white/10 rounded-xl p-4 mr-4 backdrop-blur-sm border border-white/20">
      <div className="h-full flex flex-col justify-between">
        <div className="font-normal text-white dark:text-neutral-200">
          {card.content}
        </div>
        <div>
          <p className="text-white font-medium dark:text-white">
            {card.name}
          </p>
          <p className="text-white/60 font-normal dark:text-neutral-200">
            {card.designation}
          </p>
        </div>
      </div>
    </div>
  );
};

const HorizontalScrollContainer = () => {
  return (
    <div className="w-full max-w-full overflow-x-auto pb-4">
      <div className="flex">
        {CARDS.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

const EnhancedAnimation = () => {
  return (
    <BackgroundGradientAnimation>
      <div className="relative z-50 w-full h-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4">
            <VelocityScroll 
              text="Gonna.ai"
              default_velocity={5}
              className="font-display text-center text-3xl font-bold tracking-[-0.02em] text-white drop-shadow-sm md:text-5xl md:leading-[4rem] mb-4 overflow-hidden"
            />
            
            <p className="text-center text-sm md:text-base text-white/60 max-w-2xl mb-8">
              Revolutionizing claims processing with AI-powered intelligence and real-time analytics
            </p>
            
            <HorizontalScrollContainer />
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default EnhancedAnimation;

