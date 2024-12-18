import React from 'react';
import { Sparkles, PhoneCall, Brain, Clock, Users } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { useMouseGradient } from '../../hooks/useMouseGradient';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const { isDark } = useTheme();
  const { gradientStyle } = useMouseGradient();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gray-900">
      {/* Interactive Background Gradient */}
      <div className="absolute inset-0 animate-gradient opacity-50" style={gradientStyle} />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-6 animate-float">
          <Sparkles className="w-6 h-6 text-white" />
          <span className="text-lg font-semibold text-white">
            ClaimFlow.AI
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Revolutionizing BPO Claims Processing with AI
        </h1>

        <p className="text-xl mb-8 max-w-2xl mx-auto text-white/70">
          Empower your claims processing team with AI-driven automation, smart callback scheduling, and real-time sentiment analysis
        </p>

        <button
          onClick={onGetStarted}
          className="px-8 py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all transform hover:scale-105 shadow-xl animate-float glass-effect"
        >
          Transform Your Workflow
        </button>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: PhoneCall,
              title: "Smart Call Scheduling",
              description: "Automatically prioritize and schedule callbacks based on claim urgency and client needs"
            },
            {
              icon: Brain,
              title: "Sentiment Analysis",
              description: "Real-time analysis of client emotions to provide better support and escalation"
            },
            {
              icon: Clock,
              title: "Automated Workflows",
              description: "Streamline routine tasks and data entry across multiple systems"
            },
            {
              icon: Users,
              title: "Enhanced Client Experience",
              description: "Provide faster resolutions and personalized support for every claim"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl relative group cursor-pointer transform hover:scale-105 transition-all bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 glass-effect"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <feature.icon className="w-8 h-8 mb-4 text-white/80" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-white/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}