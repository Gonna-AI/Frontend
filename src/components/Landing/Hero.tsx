"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Sparkles, Brain, Zap, Shield, ArrowRight } from "lucide-react";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { svgToDataUri } from "mini-svg-data-uri";

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

// Tailwind Configuration
const addVariablesForColors = ({ addBase, theme }: any) => {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );
  addBase({
    ":root": newVars,
  });
};

// Add to your tailwind.config.js plugins array
const dotPattern = ({ matchUtilities, theme }: any) => {
  matchUtilities(
    {
      "bg-dot-thick": (value: any) => ({
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
        )}")`,
      }),
    },
    { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
  );
};

// Hero Highlight Component
const HeroHighlight = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    if (!currentTarget) return;
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "relative min-h-screen flex items-center bg-white dark:bg-black justify-center w-full group",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-dot-thick-neutral-300 dark:bg-dot-thick-neutral-800 pointer-events-none" />
      <motion.div
        className="pointer-events-none bg-dot-thick-indigo-500 dark:bg-dot-thick-indigo-500 absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
          maskImage: useMotionTemplate`
            radial-gradient(
              200px circle at ${mouseX}px ${mouseY}px,
              black 0%,
              transparent 100%
            )
          `,
        }}
      />
      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};

// Highlight Component
const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 2, ease: "linear", delay: 0.5 }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        "relative inline-block pb-1 px-1 rounded-lg bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-500 dark:to-purple-500",
        className
      )}
    >
      {children}
    </motion.span>
  );
};

// Rainbow Button Component
const RainbowButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative px-8 py-4 rounded-xl overflow-visible transition-all duration-300"
      style={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
        boxShadow: `
          0 0 5px rgba(238, 119, 82, 0.5),
          0 0 10px rgba(231, 60, 126, 0.3),
          0 0 15px rgba(35, 166, 213, 0.3)
        `
      }}
    >
      <div 
        className="absolute -inset-0.5 rounded-xl blur-sm transition-opacity duration-500 opacity-50"
        style={{
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite'
        }}
      />
      <div className="relative flex items-center space-x-2">
        {children}
      </div>
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .dark {
          color-scheme: dark;
        }
        
        @keyframes grid {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(var(--cell-size) * -1)); }
        }
        
        .animate-grid {
          animation: grid 20s linear infinite;
        }
        
        @keyframes glow {
          0% { 
            box-shadow: 
              0 0 5px rgba(238, 119, 82, 0.5),
              0 0 10px rgba(231, 60, 126, 0.3),
              0 0 15px rgba(35, 166, 213, 0.3);
          }
          50% { 
            box-shadow: 
              0 0 8px rgba(35, 166, 213, 0.3),
              0 0 12px rgba(231, 60, 126, 0.3),
              0 0 18px rgba(238, 119, 82, 0.5);
          }
          100% { 
            box-shadow: 
              0 0 5px rgba(238, 119, 82, 0.5),
              0 0 10px rgba(231, 60, 126, 0.3),
              0 0 15px rgba(35, 166, 213, 0.3);
          }
        }

        button {
          animation: gradient 15s ease infinite, glow 3s ease-in-out infinite !important;
        }

        button:hover {
          animation: none !important;
          background: #000 !important;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.3) !important;
        }

        button:hover span {
          color: white !important;
        }
      `}</style>
    </button>
  );
};

// Interactive Hover Button Component
const InteractiveHoverButton = ({ text = "Button", onClick }: { text?: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="group relative w-40 cursor-pointer overflow-hidden rounded-full border border-white/10 bg-transparent p-4 text-center font-semibold"
    >
      <span className="inline-block transition-all duration-300 group-hover:opacity-0 text-white/70">
        {text}
      </span>
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100">
        <span className="text-white transition-colors duration-300">{text}</span>
        <ArrowRight className="w-5 h-5 text-white transition-colors duration-300" />
      </div>
      <div className="absolute inset-0 bg-purple-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </button>
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
    <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
      <div className="relative z-10">
        <Icon className="w-10 h-10 text-purple-400 mb-4 transition-transform duration-300 group-hover:scale-110" />
        <h3 className="text-xl font-semibold text-white mb-2 transition-colors duration-300 group-hover:text-purple-300">
          {title}
        </h3>
        <p className="text-white/60 transition-colors duration-300 group-hover:text-white/80">
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
    <HeroHighlight containerClassName="bg-black">
      <div className="max-w-5xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center space-x-2 mb-8"
        >
          <div className="relative">
            <Brain className="w-12 h-12 text-purple-400" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
            Gonna.AI
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center space-y-6 mb-6"
        >
          <h1 className="text-4xl font-bold flex flex-col items-center">
            <span className="mb-4">
              <Highlight className="text-black dark:text-white">
                Revolutionizing
              </Highlight>
            </span>
            <span className="text-neutral-700 dark:text-white/90">
              BPO Claims Processing
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl mb-12 text-neutral-700 dark:text-white/70 max-w-3xl mx-auto leading-relaxed"
        >
          Transform your claims processing workflow with AI-driven automation,
          intelligent callback scheduling, and real-time sentiment analysis
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center justify-center space-x-6"
        >
          <RainbowButton onClick={onGetStarted}>
            <span className="text-lg font-semibold text-white">Learn More</span>
            <Zap className="w-5 h-5 text-white" />
          </RainbowButton>
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
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
        </motion.div>
      </div>
    </HeroHighlight>
  );
};

// Export configuration for Tailwind
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
      keyframes: {
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)",
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)",
          },
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(180deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)",
          },
          "50%": {
            transform: "translateY(50%)",
          },
          "100%": {
            transform: "translateY(-50%)",
          },
        },
        grid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(calc(var(--cell-size) * -1))" },
        }
      },
    },
  },
  plugins: [
    addVariablesForColors,
    dotPattern,
    // Add any additional plugins here
  ],
};

// Export main component and config
export { Hero as default, config as tailwindConfig };