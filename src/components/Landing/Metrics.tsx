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
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">
          Transforming BPO Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl text-center relative group transform hover:scale-105 transition-all bg-white/10 backdrop-blur-xl border border-white/20 glass-effect"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <metric.icon className="w-8 h-8 mx-auto mb-4 text-white/80" />
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {metric.value}
              </div>
              <div className="text-white/60">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}