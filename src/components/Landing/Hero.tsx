import React from 'react';
import { motion } from 'framer-motion';
import { RainbowButton } from '../magicui/rainbow-button';
import { cn } from '../../utils/cn';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient Spotlight - increased brightness and opacity */}
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
          className="mb-8"
        >
          {/* Logo with enhanced gradient */}
          <div className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight">gonna.ai</h1>
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
          <RainbowButton onClick={onGetStarted}>
            Learn More
          </RainbowButton>
          <RainbowButton 
            onClick={() => window.location.href = '/schedule-demo'}
            className={cn(
              "!bg-[linear-gradient(#000,#000),linear-gradient(to_right,#FF6B6B,#4ECDC4,#45B7D1,#FF6B6B)]",
              "!text-white",
              "dark:!bg-[linear-gradient(#000,#000),linear-gradient(to_right,#FF6B6B,#4ECDC4,#45B7D1,#FF6B6B)]",
              "dark:!text-white",
              "before:!bg-[linear-gradient(to_right,#FF6B6B,#4ECDC4,#45B7D1,#FF6B6B)]",
              "hover:!shadow-lg hover:!shadow-blue-500/20",
              "[--speed:3s]",
              "!border-[3px]",
              "!bg-[length:300%]",
              "!animate-[rainbow_3s_linear_infinite]"
            )}
          >
            Schedule Demo
          </RainbowButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;