import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useMouseGradient } from '../../hooks/useMouseGradient';
import Hero from './Hero';
import Metrics from './Metrics';
import Conversation from './Conversation';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { isDark } = useTheme();
  const { gradientStyle } = useMouseGradient();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="fixed inset-0" style={gradientStyle} />
      <div className="relative z-10">
        <Hero onGetStarted={onGetStarted} />
        <Metrics />
        <Conversation />
      </div>
    </div>
  );
}