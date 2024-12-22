import React, { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

// Optimized BackgroundBeams with reduced paths for mobile
const BackgroundBeams = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile device on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reduce number of paths for mobile devices
  const paths = useMemo(() => {
    const allPaths = [
      "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
      "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
      "M-338 -237C-338 -237 -270 168 194 295C658 422 726 827 726 827",
      "M-317 -261C-317 -261 -249 144 215 271C679 398 747 803 747 803",
      "M-296 -285C-296 -285 -228 120 236 247C700 374 768 779 768 779",
      "M-275 -309C-275 -309 -207 96 257 223C721 350 789 755 789 755",
      "M-254 -333C-254 -333 -186 72 278 199C742 326 810 731 810 731",
      "M-233 -357C-233 -357 -165 48 299 175C763 302 831 707 831 707",
      "M-212 -381C-212 -381 -144 24 320 151C784 278 852 683 852 683",
      "M-191 -405C-191 -405 -123 0 341 127C805 254 873 659 873 659",
    ];

    // Return fewer paths for mobile
    return isMobile ? allPaths.filter((_, i) => i % 3 === 0) : allPaths;
  }, [isMobile]);

  // Skip animation if user prefers reduced motion
  const animationSettings = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        x1: "50%",
        x2: "50%",
        y1: "100%",
        y2: "100%",
      };
    }
    
    return {
      x1: ["0%", "100%"],
      x2: ["0%", "95%"],
      y1: ["0%", "100%"],
      y2: ["0%", "95%"],
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 [mask-size:40px] [mask-repeat:no-repeat] flex items-center justify-center",
        className
      )}
    >
      <svg
        className="z-0 h-full w-full pointer-events-none absolute"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={`path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
            initial={false}
          ></motion.path>
        ))}
        <defs>
          {paths.map((_, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`gradient-${index}`}
              initial={false}
              animate={animationSettings}
              transition={{
                duration: isMobile ? 20 : 10 + Math.random() * 5,
                ease: "linear",
                repeat: Infinity,
                delay: Math.random() * 5,
                repeatType: "reverse",
              }}
            >
              <stop stopColor="#18CCFC" stopOpacity="0"></stop>
              <stop stopColor="#18CCFC"></stop>
              <stop offset="32.5%" stopColor="#6344F5"></stop>
              <stop offset="100%" stopColor="#AE48FF" stopOpacity="0"></stop>
            </motion.linearGradient>
          ))}
          <radialGradient
            id="paint0_radial_242_278"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)"
          >
            <stop offset="0.0666667" stopColor="var(--neutral-300)"></stop>
            <stop offset="0.243243" stopColor="var(--neutral-300)"></stop>
            <stop offset="0.43594" stopColor="white" stopOpacity="0"></stop>
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

// Optimized form component with debounced input
const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Debounced email update
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmail(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    console.log("Submitted email:", email);
    setIsSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      {!isSubmitted ? (
        <div className="flex flex-col items-center gap-4">
          <input
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="hi@animeshmishra0567@gmail.com"
            className="w-full px-4 py-2 text-white bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors"
          >
            Join the waitlist
          </button>
        </div>
      ) : (
        <p className="text-white text-center">Thank you for joining the waitlist!</p>
      )}
    </form>
  );
};

// Main component with performance optimizations
const WaitlistWithBeams = () => {
  return (
    <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
      <div className="max-w-2xl mx-auto p-4 relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Join the waitlist
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center">
          Be among the first to experience how gonna.ai is revolutionizing claims processing. Our AI-powered platform is designed to make claims handling smarter, faster, and more human.
        </p>
        <div className="mt-8 w-full">
          <WaitlistForm />
        </div>
      </div>
      <BackgroundBeams />
    </div>
  );
};

export default WaitlistWithBeams;