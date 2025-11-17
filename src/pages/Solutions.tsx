import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Brain, FileCheck, Clock, BarChart3, Shield, ArrowRight } from 'lucide-react';

export default function Solutions() {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const solutions = [
    {
      icon: Brain,
      title: 'AI-Powered Document Processing',
      description: 'Automatically extract, classify, and validate information from claims documents using advanced machine learning models.',
      features: ['OCR & Data Extraction', 'Document Classification', 'Auto-validation'],
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconGradient: 'from-emerald-400 to-teal-500',
      borderColor: 'emerald-500/30'
    },
    {
      icon: Zap,
      title: 'Intelligent Workflow Automation',
      description: 'Streamline your claims process with smart routing, automated decision-making, and seamless handoffs between AI and human agents.',
      features: ['Smart Task Routing', 'Automated Approvals', 'Process Optimization'],
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconGradient: 'from-blue-400 to-indigo-500',
      borderColor: 'blue-500/30'
    },
    {
      icon: FileCheck,
      title: 'Claims Triage & Prioritization',
      description: 'Automatically categorize and prioritize incoming claims based on urgency, complexity, and potential fraud indicators.',
      features: ['Urgency Detection', 'Complexity Analysis', 'Priority Scoring'],
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconGradient: 'from-purple-400 to-pink-500',
      borderColor: 'purple-500/30'
    },
    {
      icon: Clock,
      title: 'Real-Time Status Tracking',
      description: 'Provide complete visibility into claim status with automated updates, notifications, and comprehensive audit trails.',
      features: ['Live Status Updates', 'Automated Notifications', 'Full Audit Trail'],
      gradient: 'from-orange-500/10 to-red-500/10',
      iconGradient: 'from-orange-400 to-red-500',
      borderColor: 'orange-500/30'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Gain actionable insights with comprehensive dashboards, custom reports, and predictive analytics for better decision-making.',
      features: ['Custom Dashboards', 'Predictive Analytics', 'Performance Metrics'],
      gradient: 'from-cyan-500/10 to-blue-500/10',
      iconGradient: 'from-cyan-400 to-blue-500',
      borderColor: 'cyan-500/30'
    },
    {
      icon: Shield,
      title: 'Compliance & Security',
      description: 'Ensure regulatory compliance with built-in security features, audit logging, and automated compliance checks.',
      features: ['Data Encryption', 'Compliance Monitoring', 'Access Controls'],
      gradient: 'from-violet-500/10 to-purple-500/10',
      iconGradient: 'from-violet-400 to-purple-500',
      borderColor: 'violet-500/30'
    }
  ];

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Purple theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.6) 0%, rgba(147,51,234,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(109,40,217,0.5) 0%, rgba(109,40,217,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-4 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg 
              viewBox="0 0 464 468"
              className="w-10 h-10 md:w-12 md:h-12"
            >
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                Our Solutions
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                Built for Modern
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                Claims Operations
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-4xl mx-auto">
              Transform your workflow with enterprise-grade automation, powered by cutting-edge AI technology.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              
              return (
                <div 
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`group relative rounded-2xl backdrop-blur-sm transition-all duration-500 cursor-pointer ${
                    hoveredIndex === index 
                      ? `border border-${solution.borderColor.split('/')[0]}/40 bg-gradient-to-br ${solution.gradient} shadow-lg` 
                      : 'border border-white/5 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent'
                  }`}
                  onClick={() => navigate('/contact')}
                >
                  {/* Glow effect on hover */}
                  <div 
                    className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-3xl -z-10 bg-gradient-to-br ${solution.iconGradient}`}
                  />
                  
                  {/* Multi-layer gradient overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${solution.iconGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tl from-white/[0.02] to-transparent opacity-30`} />
                  
                  <div className="relative z-10 p-8 space-y-6 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`w-10 h-10 bg-gradient-to-br ${solution.iconGradient} text-transparent bg-clip-text drop-shadow-lg`} strokeWidth={1.5} />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white/90 group-hover:text-white transition-colors">
                      {solution.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-white/50 leading-relaxed group-hover:text-white/70 transition-colors flex-grow">
                      {solution.description}
                    </p>
                    
                    {/* Features */}
                    <div className="space-y-2.5 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${solution.iconGradient} group-hover:scale-125 transition-transform`} />
                          <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="relative rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-sm overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10" />
            
            <div className="relative z-10 text-center py-16 px-8">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                  Start Your Journey
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-white/90 text-transparent bg-clip-text">
                  Ready to Transform
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 text-transparent bg-clip-text">
                  Your Operations?
                </span>
              </h2>
              
              <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                Schedule a personalized demo to see how our AI-powered solutions can reduce turnaround time by <span className="text-purple-400 font-semibold">40%</span> and dramatically improve accuracy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 border-2 border-purple-500/30 text-white font-semibold hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-600/30 hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Book a Demo</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

