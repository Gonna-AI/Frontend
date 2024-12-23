import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RainbowButton } from '../magicui/rainbow-button';
import { cn } from '../../utils/cn';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen flex items-center justify-center relative overflow-hidden">
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
          className="mb-8"
        >
          {/* Logo gradient */}
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
          className="flex justify-center"
        >
          <button 
            onClick={onGetStarted}
            className="bg-[rgb(10,10,10)] text-white/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors duration-200 rounded-[20px] px-8 py-3 text-sm font-medium tracking-wide"
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Bottom Text Only with Pulsating Dot */}
      <div className="fixed bottom-4 left-4 text-sm font-mono text-white/60 z-50 flex items-center gap-2">
        <span>Gonna.AI</span>
        <div className="relative flex h-1 w-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1 w-1 bg-purple-500"></span>
        </div>
      </div>
    </div>
  );
};

export default Hero;