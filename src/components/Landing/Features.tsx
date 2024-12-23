import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Zap 
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Processing',
    description: 'Advanced machine learning algorithms for accurate and efficient claims processing.'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Comprehensive dashboards with actionable insights and performance metrics.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automated callback scheduling optimized for customer availability.'
  },
  {
    icon: MessageSquare,
    title: 'Sentiment Analysis',
    description: 'Real-time customer sentiment tracking for improved service quality.'
  },
  {
    icon: Clock,
    title: 'Quick Integration',
    description: 'Seamless integration with existing systems in under 24 hours.'
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'Streamlined processes with customizable automation rules.'
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-[rgb(10,10,10)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white/80 to-white/40 text-transparent bg-clip-text">
            Powerful Features
          </h2>
          <p className="mt-4 text-xl text-white/60">
            Everything you need to streamline your claims processing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
            >
              <feature.icon className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}