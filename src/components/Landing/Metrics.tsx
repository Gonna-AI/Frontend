import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { PhoneCall, Clock, Brain, Smile } from 'lucide-react';

// Utility function to combine class names
const cn = (...inputs) => {
  return inputs.filter(Boolean).join(' ');
};

// Wrap function for scroll animation
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// Enhanced Background Gradient Animation Component
const BackgroundGradientAnimation = ({ children }) => {
  const { scrollY } = useScroll();
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef(null);
  const gradientOpacity = useSpring(1, {
    stiffness: 100,
    damping: 30,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        // Reverse the opacity logic - high when in view, low when out
        gradientOpacity.set(entry.isIntersecting ? 1 : 0.1);
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        rootMargin: '-10% 0px',
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Inverse scroll progress - increase intensity as element comes into view
  const scrollProgress = useTransform(
    scrollY,
    [0, window.innerHeight],
    [0.1, 1]
  );

  const combinedOpacity = useTransform(
    [gradientOpacity, scrollProgress],
    ([opacity, scroll]) => Math.max(opacity, scroll)
  );

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      <motion.div 
        className="absolute inset-0 w-full h-full bg-black"
        style={{ opacity: combinedOpacity }}
      >
        <div className="absolute h-full w-full z-10 backdrop-blur-[100px]" />
        <div className="absolute top-0 z-[1] w-full h-full">
          <div className="absolute inset-0">
            <motion.div 
              style={{ opacity: combinedOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[45rem] w-[45rem] bg-red-500/40 rounded-full blur-3xl animate-first"
            />
            <motion.div 
              style={{ opacity: combinedOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] bg-purple-500/40 rounded-full blur-3xl animate-second"
            />
            <motion.div 
              style={{ opacity: combinedOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35rem] w-[35rem] bg-rose-500/40 rounded-full blur-3xl animate-third"
            />
            <motion.div 
              style={{ opacity: combinedOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[30rem] bg-red-500/40 rounded-full blur-3xl animate-fourth"
            />
            <motion.div 
              style={{ opacity: combinedOpacity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[25rem] w-[25rem] bg-purple-500/40 rounded-full blur-3xl animate-fifth"
            />
          </div>
        </div>
      </motion.div>
      {children}
    </div>
  );
};

// ParallaxText Component - Optimized with useCallback and memo
const ParallaxText = React.memo(({ children, baseVelocity = 100, className }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

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
  const directionFactor = useRef(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
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

// VelocityScroll Component
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

// Optimized Card Stack Component
const CardStack = React.memo(({ items, offset = 10, scaleFactor = 0.06 }) => {
  const [cards, setCards] = useState(items);
  const isVisible = useRef(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    const interval = setInterval(() => {
      if (isVisible.current) {
        setCards((prevCards) => {
          const newArray = [...prevCards];
          newArray.unshift(newArray.pop());
          return newArray;
        });
      }
    }, 5000);

    const container = document.querySelector('.card-stack-container');
    if (container) observer.observe(container);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="card-stack-container relative h-80 w-80 md:h-96 md:w-[32rem] lg:h-[28rem] lg:w-[40rem]">
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
          initial={false}
          layoutScroll
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
});

// Card Data
const CARDS = [
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
const EnhancedAnimation = () => {
  return (
    <BackgroundGradientAnimation>
      <div className="relative z-50 w-full h-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl px-4">
          <div className="flex flex-col items-center gap-4">
            <VelocityScroll 
              text="Gonna.ai"
              default_velocity={5}
              className="font-display text-center text-4xl font-bold tracking-[-0.02em] text-white drop-shadow-sm md:text-7xl md:leading-[5rem] mb-8"
            />
            
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

export default EnhancedAnimation;