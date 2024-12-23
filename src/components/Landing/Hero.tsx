import React from 'react';
import { motion } from 'framer-motion';
import { Particles } from './Particles';
import { RainbowButton } from '../../components/magicui/rainbow-button';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center relative overflow-hidden">
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={50}
        ease={50}
        color="#ffffff"
      />
      
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 -top-24 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob" />
        <div className="absolute -right-4 -top-24 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000" />
      </div>

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
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-2xl">
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
        >
          <RainbowButton onClick={onGetStarted}>
            Learn More
          </RainbowButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;