import { useNavigate } from 'react-router-dom';
import { Target, Lightbulb, Users, Building2, Shield, FileText, TrendingUp } from 'lucide-react';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { Globe } from '../ui/globe';

export default function AboutSection() {
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetection();

  const industries = [
    { icon: Shield, name: 'Insurance', color: 'from-blue-400 to-cyan-500' },
    { icon: Building2, name: 'BFSI', color: 'from-emerald-400 to-teal-500' },
    { icon: Users, name: 'BPO & Contact Centers', color: 'from-purple-400 to-pink-500' },
    { icon: TrendingUp, name: 'Healthcare', color: 'from-orange-400 to-red-500' },
    { icon: FileText, name: 'Logistics & Supply Chain', color: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div className="relative pt-32 pb-20 px-4 sm:px-6 bg-[rgb(10,10,10)]" style={{ overflow: 'visible' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-20 relative min-h-[500px] md:min-h-[600px]" style={{ overflow: 'visible' }}>
          {/* Globe behind text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ overflow: 'visible', top: '-50px' }}>
            <div className="relative w-full h-full max-w-4xl mx-auto min-h-[500px] md:min-h-[600px]">
              <div 
                className="absolute inset-0 opacity-20"
                style={{ 
                  transform: 'scale(1.5) translateY(-10%)',
                  transformOrigin: 'center center'
                }}
              >
                <Globe className="w-full h-full" />
              </div>
              {/* Fade effect for lower half */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(10,10,10,0.5) 70%, rgb(10,10,10) 100%)'
                }}
              />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                About Us
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                Building the Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                Operations Intelligence
              </span>
            </h2>
          </div>
        </div>

        {/* Why We Built ClerkTree */}
        <div className="mb-20">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent p-6 sm:p-8 md:p-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">Why We Built ClerkTree</h3>
            <p className="text-lg text-white/60 leading-relaxed">
              Growing operations teams face a common challenge: <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent font-semibold">fragmented workflows</span> that slow them down. Document processing scattered across multiple tools, manual data entry consuming valuable time, and disconnected systems creating bottlenecks.
            </p>
            <p className="text-lg text-white/60 leading-relaxed mt-4">
              We built ClerkTree to solve this. Our platform unifies AI-powered automation with human expertise, creating a seamless workflow that <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 bg-clip-text text-transparent font-semibold">reduces turnaround time by 40%</span> while maintaining the accuracy and judgment that only humans can provide.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-20">
          <div className={`rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent ${isMobile ? '' : 'backdrop-blur-sm'} p-6 sm:p-8`}>
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-white/90">Our Mission</h3>
            </div>
            <p className="text-white/60 leading-relaxed">
              To empower operations teams with intelligent automation that amplifies human capabilities, transforming tedious document-heavy processes into streamlined, efficient workflows that drive business growth.
            </p>
          </div>

          <div className={`rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent ${isMobile ? '' : 'backdrop-blur-sm'} p-6 sm:p-8`}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-8 h-8 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold text-white/90">Our Vision</h3>
            </div>
            <p className="text-white/60 leading-relaxed">
              To become the operating system for modern claims and back-office operations, where AI and humans work in perfect harmony to deliver unprecedented speed, accuracy, and customer satisfaction.
            </p>
          </div>
        </div>

        {/* Hybrid Human+AI Approach */}
        <div className="mb-20">
          <div className={`rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 ${isMobile ? '' : 'backdrop-blur-sm'} p-6 sm:p-8 md:p-12`}>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                The Hybrid Human+AI Approach
              </span>
            </h3>
            <p className="text-lg text-white/70 leading-relaxed mb-6">
              We believe the future isn't about replacing humans with AI, it's about augmenting human intelligence with machine capabilities. Our platform is designed around this core philosophy:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white/90 mb-2">AI Handles Repetition</h4>
                <p className="text-sm text-white/60">Automated document extraction, data validation, and routine processing tasks</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white/90 mb-2">Humans Handle Complexity</h4>
                <p className="text-sm text-white/60">Complex decision-making, edge cases, and customer interactions requiring empathy</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-semibold text-white/90 mb-2">Seamless Handoffs</h4>
                <p className="text-sm text-white/60">Smart routing between AI and human agents based on task complexity and confidence levels</p>
              </div>
            </div>
          </div>
        </div>

        {/* Industries We Serve */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white/90">Industries We Serve</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <div 
                  key={index}
                  className={`group flex items-center gap-3 px-6 py-4 rounded-xl border border-white/10 bg-white/5 ${isMobile ? '' : 'backdrop-blur-sm'} hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-200`}
                >
                  <Icon className={`w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                  <span className="font-medium text-white/80 group-hover:text-white/95 transition-colors">
                    {industry.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className={`text-center py-12 sm:py-16 px-4 sm:px-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 ${isMobile ? '' : 'backdrop-blur-sm'}`}>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
            Join Us on This Journey
          </h3>
          <p className="text-white/60 mb-8 max-w-2xl mx-auto">
            We're just getting started. Partner with us to transform your operations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 text-white font-semibold hover:from-indigo-500/30 hover:to-purple-500/30 hover:border-indigo-500/50 transition-all duration-300"
            >
              Get in Touch
            </button>
            <button
              onClick={() => navigate('/careers')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Join Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

