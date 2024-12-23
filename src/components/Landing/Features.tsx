import React from 'react';
import { Brain, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay }: FeatureCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
    >
      <div>
        <Icon className="w-10 h-10 text-purple-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>
        <p className="text-white/60">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <div className="bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: "AI-Powered Analysis",
              description: "Advanced machine learning for accurate claim processing",
              delay: 0.2
            },
            {
              icon: Shield,
              title: "Secure Processing",
              description: "Enterprise-grade security for sensitive data",
              delay: 0.4
            },
            {
              icon: Zap,
              title: "Real-time Processing",
              description: "Instant analysis and automated decision making",
              delay: 0.6
            }
          ].map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;