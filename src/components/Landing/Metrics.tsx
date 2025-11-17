import React from 'react';
import { Phone, Clock, Database, MessageSquare } from 'lucide-react';
import { Globe } from '../ui/globe';

const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
};

interface CardProps {
  type: string;
  title?: string;
  image?: string;
  hasAction?: boolean;
  isMobile: boolean;
}

const Card = ({ type, title, image, hasAction, isMobile }: CardProps) => {
  const renderContent = () => {
    switch (type) {
      case 'analytics':
        return (
          <div className={`h-full w-full ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-8 border border-white/10`}>
            <h2 className="text-white text-5xl font-display mt-36">AI ANALYTICS</h2>
            <p className="text-gray-400 mt-4">Real-time sentiment analysis and call metrics</p>
          </div>
        );
      
      case 'sections':
        return (
          <div className={`h-full w-full ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-6 text-white relative border border-white/10`}>
            <h2 className="text-4xl font-display mb-4">CLAIM CATEGORIES</h2>
            <div className="flex flex-wrap gap-2">
              {['Health Insurance', 'Auto Claims', 'Property Damage', 'Life Insurance', 'Workers Comp', 'Liability', 'Emergency', 'Routine', 'Appeals', 'Documentation', 'Follow-ups'].map((item, i) => (
                <span key={i} className={`${isMobile ? 'bg-black/30' : 'bg-black/20 backdrop-blur-sm'} border border-white/10 text-white rounded-full px-3 py-1 text-sm whitespace-nowrap`}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'callbacks':
      case 'knowledge':
        return (
          <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10">
            <img 
              src={type === 'callbacks' ? 
                "https://images.unsplash.com/photo-1521791136064-7986c2920216" : 
                "https://images.unsplash.com/photo-1553877522-43269d4ea984"} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className={`absolute inset-0 ${isMobile ? 'bg-black/50' : 'bg-black/30 backdrop-blur-2xl'} p-8 flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                <h2 className="text-4xl font-display text-white">{title}</h2>
                {hasAction && (
                  <div className="flex gap-3">
                    {type === 'callbacks' ? (
                      <Phone className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Database className="w-6 h-6 text-purple-400" />
                    )}
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                )}
              </div>
              <p className="text-gray-400 mt-4">
                {type === 'callbacks' ? 
                  'AI-powered scheduling system for priority-based follow-ups' :
                  'Smart knowledge base with instant solution suggestions'}
              </p>
            </div>
          </div>
        );
      
      case 'efficiency':
        return (
          <div className={`h-full w-full ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-8 text-white relative border border-white/10`}>
            <div className="absolute right-8 top-8">
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <p className="mt-36 text-lg text-gray-400">
              Automated workflow optimization and performance tracking
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-w-[360px] h-[400px] rounded-3xl">
      {renderContent()}
    </div>
  );
};

export default function HorizontalScroll() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isMobile } = useDeviceDetection();

  return (
    <div className="min-h-screen py-20 relative overflow-hidden bg-[rgb(10,10,10)]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        
        .font-display {
          font-family: 'Bebas Neue', sans-serif;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-6xl md:text-7xl font-display text-white">
          AI That Works as Hard as You Do
          </h1>
        </div>

        <div className={`relative ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-8 border border-white/10 shadow-lg`}>
          <div 
            ref={containerRef}
            className="flex overflow-x-auto hide-scrollbar gap-6 pb-6"
          >
            <Card type="analytics" isMobile={isMobile} />
            <Card 
              type="callbacks"
              title="SMART CALLBACKS"
              hasAction={true}
              isMobile={isMobile}
            />
            <Card type="sections" isMobile={isMobile} />
            <Card 
              type="knowledge"
              title="KNOWLEDGE BASE"
              hasAction={true}
              isMobile={isMobile}
            />
            <Card type="efficiency" isMobile={isMobile} />
          </div>
        </div>

        {/* Globe Section */}
        <div className="mt-12 relative">
          <div className={`relative ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-8 border border-white/10 shadow-lg overflow-hidden min-h-[600px]`}>
            <div className="absolute inset-0 opacity-30" style={{ transform: 'scale(2.5) translateY(25%)', transformOrigin: 'center center' }}>
              <Globe className="w-full h-full" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
                Global Reach, Local Impact
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl">
                Serving clients worldwide with AI-powered solutions that adapt to your local needs and regulations.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-lg text-gray-400 max-w-2xl">
          AI-powered workflow optimization for enhanced claims processing efficiency and customer satisfaction.
        </div>
      </div>
    </div>
  );
}