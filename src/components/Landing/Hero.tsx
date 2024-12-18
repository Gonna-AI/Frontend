import React from 'react';
import { Sparkles, PhoneCall, Brain, Clock, Users } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-black">
      {/* Enhanced Corner Gradient */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-gradient-to-bl from-purple-6220/20 via-purple-500/90 to-transparent blur-2xl animate-pulse" />
      <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-gradient-to-bl from-indigo-600/30 via-purple-400/20 to-transparent blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-6 animate-float">
          <Sparkles className="w-6 h-6 text-white" />
          <span className="text-lg font-semibold text-white">
            Gonna.AI
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-6 text-white">
          Revolutionizing BPO Claims Processing with AI
        </h1>

        <p className="text-xl mb-8 max-w-2xl mx-auto text-white/70">
          Empower your claims processing team with AI-driven automation, smart callback scheduling, and real-time sentiment analysis
        </p>

        <button
          className="px-8 py-4 rounded-2xl font-semibold text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all transform hover:scale-105 relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">Transform Your Workflow</span>
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
              className="p-6 rounded-2xl relative group cursor-pointer transform hover:scale-105 transition-all bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10"
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