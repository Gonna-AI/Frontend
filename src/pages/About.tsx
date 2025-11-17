import { useNavigate } from 'react-router-dom';
import { Target, Lightbulb, Users, Building2, Shield, FileText, TrendingUp } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const industries = [
    { icon: Shield, name: 'Insurance', color: 'from-blue-400 to-cyan-500' },
    { icon: Building2, name: 'BFSI', color: 'from-emerald-400 to-teal-500' },
    { icon: Users, name: 'BPO', color: 'from-purple-400 to-pink-500' },
    { icon: TrendingUp, name: 'Operations', color: 'from-orange-400 to-red-500' },
    { icon: FileText, name: 'Document Processing', color: 'from-violet-400 to-purple-500' },
  ];

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      {/* Blue theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.25) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(29,78,216,0.5) 0%, rgba(29,78,216,0.2) 40%, transparent 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="md:hidden">
            <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium whitespace-nowrap">
              About Us
            </span>
          </div>
        </div>
      </header>
      
      <div className="relative z-10 py-12 px-6 pt-24">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                Building the Future of
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 text-transparent bg-clip-text">
                Operations Intelligence
              </span>
            </h1>
          </div>

          {/* Why We Built ClerkTree */}
          <div className="mb-20">
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-sm p-8 md:p-12">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">Why We Built ClerkTree</h2>
                  <p className="text-lg text-white/60 leading-relaxed">
                    Growing operations teams face a common challenge: <span className="text-blue-400 font-semibold">fragmented workflows</span> that slow them down. Document processing scattered across multiple tools, manual data entry consuming valuable time, and disconnected systems creating bottlenecks.
                  </p>
                  <p className="text-lg text-white/60 leading-relaxed mt-4">
                    We built ClerkTree to solve this. Our platform unifies AI-powered automation with human expertise, creating a seamless workflow that <span className="text-blue-400 font-semibold">reduces turnaround time by 40%</span> while maintaining the accuracy and judgment that only humans can provide.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-20">
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 text-transparent bg-clip-text" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white/90">Our Mission</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                To empower operations teams with intelligent automation that amplifies human capabilities, transforming tedious document-heavy processes into streamlined, efficient workflows that drive business growth.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] via-white/[0.01] to-transparent backdrop-blur-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white/90">Our Vision</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                To become the operating system for modern claims and back-office operations, where AI and humans work in perfect harmony to deliver unprecedented speed, accuracy, and customer satisfaction.
              </p>
            </div>
          </div>

          {/* Hybrid Human+AI Approach */}
          <div className="mb-20">
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                  The Hybrid Human+AI Approach
                </span>
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-6">
                We believe the future isn't about replacing humans with AI—it's about augmenting human intelligence with machine capabilities. Our platform is designed around this core philosophy:
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white/90">Industries We Serve</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {industries.map((industry, index) => {
                const Icon = industry.icon;
                return (
                  <div 
                    key={index}
                    className="group flex items-center gap-3 px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300"
                  >
                    <Icon className={`w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                    <span className="font-medium text-white/80 group-hover:text-white/95 transition-colors">
                      {industry.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-16 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              Join Us on This Journey
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              We're just getting started. Partner with us to transform your operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 text-white font-semibold hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-500/50 transition-all duration-300"
              >
                Get in Touch
              </button>
              <button
                onClick={() => navigate('/careers')}
                className="px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Join Our Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

