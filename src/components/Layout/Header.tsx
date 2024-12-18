import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';
import DatePicker from '../DatePicker';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';

interface Particle {
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export default function Header() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const { isDark } = useTheme();
  const [particles, setParticles] = useState<Array<Particle>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const createParticle = (e: React.MouseEvent) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setParticles(prev => [
      ...prev,
      { x, y, scale: 1, opacity: 1 }
    ].slice(-5));

    setTimeout(() => {
      setParticles(prev => prev.slice(1));
    }, 1000);
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-20",
        "h-16 flex items-center justify-between px-6",
        "transition-all duration-300",
        "z-20",
        isDark ? "bg-black border-white/10" : "bg-white border-black/10",
        "border-b"
      )}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute inset-0 opacity-30",
            "bg-[radial-gradient(circle_at_50%_120%,var(--gradient-stops))]",
            isDark 
              ? "from-blue-500/20 via-purple-500/20 to-transparent"
              : "from-blue-300/20 via-purple-300/20 to-transparent"
          )} />
          
          <div className="absolute inset-0">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute h-[1px] w-full transform -translate-y-1/2",
                  "bg-gradient-to-r from-transparent via-current to-transparent",
                  isDark ? "text-white/5" : "text-black/5",
                  "animate-pulse"
                )}
                style={{
                  top: `${(i + 1) * 25}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        <div 
          className="relative select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={createParticle}
        >
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                transform: `scale(${particle.scale})`,
                opacity: particle.opacity,
                transition: 'all 1s ease-out',
              }}
            >
              <Star className="w-2 h-2 text-blue-400" />
            </div>
          ))}

          <div className="relative flex items-center">
            <span className={cn(
              "text-xl font-bold transition-all duration-500",
              "bg-clip-text text-transparent bg-gradient-to-r",
              isHovered ? "tracking-widest" : "tracking-normal",
              isDark 
                ? "from-white via-blue-400 to-purple-400"
                : "from-black via-blue-600 to-purple-600"
            )}>
              Gonna
            </span>
            <Zap className={cn(
              "w-6 h-6 transition-all duration-300 transform",
              isHovered ? "scale-125 rotate-12" : "scale-100 rotate-0",
              isDark ? "text-blue-400" : "text-blue-600"
            )} />
            <span className={cn(
              "text-xl font-bold transition-all duration-500",
              "bg-clip-text text-transparent bg-gradient-to-r",
              isHovered ? "tracking-widest" : "tracking-normal",
              isDark 
                ? "from-purple-400 via-blue-400 to-white"
                : "from-purple-600 via-blue-600 to-black"
            )}>
              AI
            </span>
          </div>

          <div className="absolute -top-1 -right-1">
            <Sparkles 
              className={cn(
                "w-3 h-3 transition-all duration-300",
                isHovered ? "opacity-100 translate-x-1" : "opacity-0 translate-x-0",
                isDark ? "text-blue-400" : "text-blue-600"
              )}
            />
          </div>
        </div>

        <div 
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "py-2 px-4 rounded-full cursor-pointer",
            "transition-all duration-300 transform hover:scale-110",
            "border border-transparent hover:border-current/10",
            isDark ? "text-white/70" : "text-black/70"
          )}
        >
          <div className="relative flex items-center space-x-2">
            <span className="relative font-mono text-lg">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Page Content Spacer */}
      <div className="h-16" /> {/* Same height as header */}

      {showCalendar && (
        <div className="fixed inset-0 flex items-start justify-center pt-20 z-[100]">
          <div 
            className={cn(
              "fixed inset-0",
              isDark ? "bg-black/80" : "bg-black/40"
            )}
            onClick={() => setShowCalendar(false)}
          />
          <div className={cn(
            "relative rounded-xl overflow-hidden",
            isDark ? "bg-black border-white/10" : "bg-white border-black/10",
            "border shadow-xl",
            "animate-in fade-in-0 slide-in-from-top-4"
          )}>
            <DatePicker onClose={() => setShowCalendar(false)} />
          </div>
        </div>
      )}
    </>
  );
}

// Layout.tsx - Wrap your app with this layout
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-16 pr-20">
        {children}
      </main>
    </div>
  );
}

// Add these to your tailwind.config.js if not already present
const tailwindConfig = {
  theme: {
    extend: {
      animation: {
        'slide-in-from-top-4': 'slide-in-from-top-4 0.3s ease-out',
        'fade-in-0': 'fade-in-0 0.2s ease-out',
      },
      keyframes: {
        'slide-in-from-top-4': {
          '0%': { transform: 'translateY(-1rem)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in-0': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
};