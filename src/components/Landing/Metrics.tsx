import React from 'react';
import { PhoneCall, Clock, Brain, Smile } from 'lucide-react';
import { cn } from '../../utils/cn';

const metrics = [
  {
    icon: PhoneCall,
    value: "60%",
    label: "Reduced Call Wait Time"
  },
  {
    icon: Clock,
    value: "85%",
    label: "Faster Claims Processing"
  },
  {
    icon: Brain,
    value: "98%",
    label: "Accurate Prioritization"
  },
  {
    icon: Smile,
    value: "92%",
    label: "Client Satisfaction"
  }
];

export default function Metrics() {
  return (
    <div className="relative py-20 px-6 bg-black min-h-screen overflow-hidden">
      {/* Enhanced Corner Gradients */}
      <div className="absolute top-0 right-0 w-[45rem] h-[45rem] bg-gradient-to-bl from-red-600/20 via-rose-500/20 to-transparent blur-2xl" />
      <div className="absolute bottom-0 left-0 w-[35rem] h-[35rem] bg-gradient-to-tr from-red-600/20 via-purple-500/20 to-transparent blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-white">
          Transforming BPO Operations
        </h2>
        <p className="text-white/60 text-center mb-12 text-lg max-w-2xl mx-auto">
          Revolutionizing claims processing with AI-powered intelligence and real-time analytics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl text-center relative group transform hover:scale-105 transition-all bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-rose-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all border border-white/10">
                  <metric.icon className="w-8 h-8 text-red-400 group-hover:text-red-300 transition-colors" />
                </div>
                
                <div className="text-4xl font-bold mb-3 text-white group-hover:text-red-300 transition-colors">
                  {metric.value}
                </div>
                
                <div className="text-white/60 group-hover:text-white/80 transition-colors font-medium">
                  {metric.label}
                </div>
              </div>

              {/* Decorative dots */}
              <div className="absolute top-2 right-2 flex space-x-1">
                <div className="w-1 h-1 rounded-full bg-red-400/40" />
                <div className="w-1 h-1 rounded-full bg-red-400/40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}