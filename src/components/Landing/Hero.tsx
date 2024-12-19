import React, { useState } from 'react';
import { Sparkles, Brain, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
      
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto text-center"
      >
        {/* Logo Section */}
        <motion.div 
          variants={item}
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

        {/* Main Heading */}
        <motion.h1 
          variants={item}
          className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white"
        >
          Revolutionizing BPO Claims
          <br />
          Processing with AI
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={item}
          className="text-xl mb-12 text-white/70 max-w-3xl mx-auto leading-relaxed"
        >
          Transform your claims processing workflow with AI-driven automation,
          intelligent callback scheduling, and real-time sentiment analysis
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={item}>
          <button
            onClick={onGetStarted}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative px-8 py-4 rounded-2xl overflow-hidden transition-all duration-300"
          >
            {/* Button Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            {/* Animated Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-0'}`} />

            {/* Button Content */}
            <div className="relative flex items-center space-x-2">
              <span className="text-lg font-semibold text-white">Get Started</span>
              <Zap className="w-5 h-5 text-white" />
            </div>
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={item}
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
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <feature.icon className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}