"use client";

import { useState } from "react";
import { Sparkles, Brain, Zap, Shield, ArrowRight } from "lucide-react";

// Utility function to merge classnames
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface RetroGridProps {
  className?: string;
  angle?: number;
  cellSize?: number;
  opacity?: number;
  lightLineColor?: string;
  darkLineColor?: string;
}

const RetroGrid = ({
  className,
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}: RetroGridProps) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
        className,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  );
};

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
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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

interface HeroProps {
  onGetStarted: () => void;
  onJoinWaitlist: () => void;
}

const Hero = ({ onGetStarted, onJoinWaitlist }: HeroProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-black">
      {/* Background with both RetroGrid and gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <RetroGrid />
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(-45deg, #ee775233, #e73c7e33, #23a6d533, #23d5ab33)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite'
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="relative">
            <Brain className="w-12 h-12 text-purple-400" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">
            Gonna.AI
          </span>
        </div>

        <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white">
          Revolutionizing BPO Claims
          <br />
          Processing with AI
        </h1>

        <p className="text-xl mb-12 text-white/70 max-w-3xl mx-auto leading-relaxed">
          Transform your claims processing workflow with AI-driven automation,
          intelligent callback scheduling, and real-time sentiment analysis
        </p>

        <div className="flex items-center justify-center space-x-6">
          <RainbowButton onClick={onGetStarted}>
            <span className="text-lg font-semibold text-white">Get Started</span>
            <Zap className="w-5 h-5 text-white" />
          </RainbowButton>
          
          <InteractiveHoverButton 
            text="Join Waitlist" 
            onClick={onJoinWaitlist}
          />
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

      <style jsx global>{`
        @keyframes grid {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(var(--cell-size) * -1)); }
        }
        
        .animate-grid {
          animation: grid 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Hero;