import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PhoneCall, Clock, Brain, Smile } from 'lucide-react';

// Background Gradient Animation Component
const BackgroundGradientAnimation = ({ children }) => {
  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-black">
        <div className="absolute h-full w-full z-10 backdrop-blur-[100px]" />
        <div className="absolute top-0 z-[1] w-full h-full">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] bg-red-500/30 rounded-full blur-3xl animate-first" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] bg-purple-500/30 rounded-full blur-3xl animate-second" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] bg-rose-500/30 rounded-full blur-3xl animate-third" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[25rem] w-[25rem] bg-red-500/30 rounded-full blur-3xl animate-fourth" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[20rem] w-[20rem] bg-purple-500/30 rounded-full blur-3xl animate-fifth" />
          </div>
        </div>
      </div>
      {children}
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

// Glassmorphic Card Component
const GlassmorphicCard = ({ icon: Icon, value, label }) => {
  return (
    <div className="group relative transform rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all hover:scale-105 hover:bg-white/10 backdrop-blur-sm">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all group-hover:bg-white/10">
          <Icon className="h-8 w-8 text-red-400 transition-colors group-hover:text-red-300" />
        </div>
        
        <div className="mb-3 text-4xl font-bold text-white transition-colors group-hover:text-red-300">
          {value}
        </div>
        
        <div className="font-medium text-white/60 transition-colors group-hover:text-white/80">
          {label}
        </div>
      </div>
      
      <div className="absolute right-2 top-2 flex space-x-1">
        <div className="h-1 w-1 rounded-full bg-red-400/40" />
        <div className="h-1 w-1 rounded-full bg-red-400/40" />
      </div>
    </div>
  );
};

// Main Component
const GlassmorphicMetrics = () => {
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
    <BackgroundGradientAnimation>
      <div className="relative z-50 mx-auto max-w-4xl px-6 py-20">
        <MorphingTitle texts={titleTexts} />
        
        <p className="mx-auto mb-12 mt-4 max-w-2xl text-center text-lg text-white/60">
          Revolutionizing claims processing with AI-powered intelligence and real-time analytics
        </p>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <GlassmorphicCard
              key={index}
              icon={metric.icon}
              value={metric.value}
              label={metric.label}
            />
          ))}
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default GlassmorphicMetrics;