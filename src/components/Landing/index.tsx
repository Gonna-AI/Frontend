import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useMouseGradient } from '../../hooks/useMouseGradient';
import Hero from './Hero';
import Features from './Features';
import Metrics from './Metrics';
import Conversation from './Conversation';
import ThreeBackground from './ThreeBackground';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { isDark } = useTheme();
  const { gradientStyle } = useMouseGradient();

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      <ThreeBackground />
      <div 
        className="fixed inset-0 opacity-30 mix-blend-overlay" 
        style={gradientStyle} 
      />
      <div className="relative z-10">
        <Hero onGetStarted={onGetStarted} />
        <Features />
        <Metrics />
        <Conversation />
      </div>
    </div>
  );
}