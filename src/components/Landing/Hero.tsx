import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, FileCode2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Logo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 464 468"
    className="w-20 h-20 md:w-24 md:h-24 -ml-2" // Reduced size from w-24/h-24 to w-20/h-20
    aria-label="ClerkTree Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#34d399' }} /> {/* emerald-400 */}
        <stop offset="50%" style={{ stopColor: '#3b82f6' }} /> {/* blue-500 */}
        <stop offset="100%" style={{ stopColor: '#9333ea' }} /> {/* purple-600 */}
      </linearGradient>
    </defs>
    <path 
      fill="url(#logoGradient)"
      d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
    />
  </svg>
);

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  const navigate = useNavigate();

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist-section');
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-hidden">
      {/* Support Ticket and Smart Contracts Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => navigate('/smart-contracts')}
          className={cn(
            "relative group",
            "md:px-8 md:py-3 p-3 rounded-[20px]",
            "text-sm font-medium tracking-wide",
            "transition-all duration-200",
            "bg-gradient-to-r from-blue-500/20 via-blue-500/30 to-blue-400/20",
            "hover:from-blue-500/30 hover:via-blue-500/40 hover:to-blue-400/30",
            "border border-blue-500/30",
            "text-blue-300",
            "overflow-hidden",
            "flex items-center gap-2"
          )}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500/20 to-blue-400/20 blur-xl group-hover:opacity-75 transition-opacity opacity-0" />
          <FileCode2 className="w-5 h-5 md:w-6 md-6" />
          <span className="relative z-10 hidden md:inline">Smart Contracts</span>
        </button>

        <button 
          onClick={() => navigate('/chat')}
          className={cn(
            "relative group",
            "md:px-8 md:py-3 p-3 rounded-[20px]",
            "text-sm font-medium tracking-wide",
            "transition-all duration-200",
            "bg-gradient-to-r from-emerald-500/20 via-emerald-500/30 to-emerald-400/20",
            "hover:from-emerald-500/30 hover:via-emerald-500/40 hover:to-emerald-400/30",
            "border border-emerald-500/30",
            "text-emerald-300",
            "overflow-hidden",
            "flex items-center gap-2"
          )}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 blur-xl group-hover:opacity-75 transition-opacity opacity-0" />
          <LifeBuoy className="w-5 h-5 md:w-6 md-6" />
          <span className="relative z-10 hidden md:inline">Support Ticket</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        {/* Gradient Spotlight */}
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] opacity-[0.25] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.8) 0%, rgba(147,51,234,0.3) 40%, transparent 100%)',
            filter: 'blur(40px)',
          }}
        />

        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex items-center justify-center"
          >
            {/* Logo container with adjusted spacing for larger logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <Logo className="w-20 h-20 md:w-24 md:h-24" />
              </div>
              
              {/* Logo text gradient */}
              <div className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight">ClerkTree</h1>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="inline-block mb-4">
                <span className="bg-gradient-to-r from-white to-white/90 text-black px-6 py-2 rounded-2xl">
                  Revolutionizing
                </span>
              </span>
              <br />
              <span className="bg-gradient-to-r from-white/80 to-white/40 text-transparent bg-clip-text">
                BPO Claims Processing
              </span>
            </h2>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform your claims processing workflow with AI-driven automation,
            intelligent callback scheduling, and real-time sentiment analysis
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={scrollToWaitlist}
              className="bg-[rgb(10,10,10)] text-white/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200 rounded-[20px] px-8 py-3 text-sm font-medium tracking-wide"
            >
              Request a demo
            </button>

            <button 
              onClick={() => navigate('/auth')}
              className="bg-purple-500/20 text-white border border-purple-500/30 hover:bg-purple-500/30 transition-colors duration-200 rounded-[20px] px-8 py-3 text-sm font-medium tracking-wide"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom Text with Pulsating Dot */}
      <div className="fixed bottom-4 left-4 text-sm font-mono text-white/60 z-50 flex items-center gap-2">
        <span>ClerkTree</span>
        <div className="relative flex h-1 w-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1 w-1 bg-purple-500"></span>
        </div>
      </div>
    </div>
  );
};

export default Hero;