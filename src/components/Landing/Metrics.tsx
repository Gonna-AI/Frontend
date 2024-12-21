import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Clock, Brain, Smile } from 'lucide-react';

type BackgroundProps = {
  children: ReactNode;
};

type HighlightProps = {
  children: ReactNode;
  className?: string;
};

type Card = {
  id: number;
  name: string;
  designation: string;
  content: ReactNode;
};

type CardStackProps = {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
};

// Utility function to combine class names
const cn = (...inputs: string[]) => {
  return inputs.filter(Boolean).join(' ');
};

// Background Gradient Animation Component
const BackgroundGradientAnimation = ({ children }: BackgroundProps) => {
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
const useMorphingText = (texts: string[]) => {
  const morphTime = 1.5;
  const cooldownTime = 0.5;
  
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
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
    let animationFrameId: number;
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
const MorphingTitle = ({ texts }: { texts: string[] }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  
  return (
    <div className="relative w-full text-center h-32">
      <div className="relative text-5xl sm:text-6xl md:text-7xl font-bold text-white [filter:url(#threshold)_blur(0.3px)] z-50 mx-auto pt-4">
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 w-full"
          ref={text1Ref}
        />
        <span
          className="absolute left-1/2 top-0 -translate-x-1/2 w-full"
          ref={text2Ref}
        />
      </div>
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

// Highlight Component
const Highlight = ({ children, className }: HighlightProps) => {
  return (
    <span 
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className || ""
      )}
    >
      {children}
    </span>
  );
};

// Card Stack Component
const CardStack = ({ items, offset = 10, scaleFactor = 0.06 }: CardStackProps) => {
  const [cards, setCards] = useState(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-80 w-80 md:h-96 md:w-[32rem] lg:h-[28rem] lg:w-[40rem]">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute dark:bg-black bg-white/10 h-80 w-80 md:h-96 md:w-[32rem] lg:h-[28rem] lg:w-[40rem] rounded-3xl p-4 shadow-xl border border-neutral-200/20 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between backdrop-blur-sm"
          style={{
            transformOrigin: "top center",
          }}
          animate={{
            top: index * -offset,
            scale: 1 - index * scaleFactor,
            zIndex: items.length - index,
          }}
        >
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
        </motion.div>
      ))}
    </div>
  );
};

// Card Data
const CARDS: Card[] = [
  {
    id: 0,
    name: "AI Assistant",
    designation: "Natural Language Processing",
    content: (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          60%
        </div>
        <p className="text-lg md:text-xl text-center text-white/80">
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
        <div className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          85%
        </div>
        <p className="text-lg md:text-xl text-center text-white/80">
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
        <div className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          92%
        </div>
        <p className="text-lg md:text-xl text-center text-white/80">
          Client satisfaction rate with<br/>AI-powered assistance
        </p>
      </div>
    ),
  },
];

// Main Component
const GlassmorphicCardStack = () => {
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
      <div className="relative z-50 w-full h-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4">
            <MorphingTitle texts={titleTexts} />
            
            <p className="text-center text-sm md:text-base text-white/60 max-w-2xl">
              Revolutionizing claims processing with AI-powered intelligence and real-time analytics
            </p>
            
            <div className="mt-4">
              <CardStack items={CARDS} />
            </div>
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default GlassmorphicCardStack;

