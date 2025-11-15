import React from 'react';
import { ChevronLeft, ChevronRight, Phone, Clock, Database, MessageSquare } from 'lucide-react';

const Card = ({ type, title, image, hasAction }) => {
  const renderContent = () => {
    switch (type) {
      case 'analytics':
        return (
          <div className="h-full w-full bg-black/80 backdrop-blur-md rounded-3xl p-8 border border-gray-800">
            <h2 className="text-white text-5xl font-display mt-36">AI ANALYTICS</h2>
            <p className="text-gray-300 mt-4">Real-time sentiment analysis and call metrics</p>
          </div>
        );
      
      case 'sections':
        return (
          <div className="h-full w-full bg-black/80 backdrop-blur-md rounded-3xl p-6 text-white relative border border-gray-800">
            <h2 className="text-4xl font-display mb-4">CLAIM CATEGORIES</h2>
            <div className="flex flex-wrap gap-2">
              {['Health Insurance', 'Auto Claims', 'Property Damage', 'Life Insurance', 'Workers Comp', 'Liability', 'Emergency', 'Routine', 'Appeals', 'Documentation', 'Follow-ups'].map((item, i) => (
                <span key={i} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white rounded-full px-3 py-1 text-sm whitespace-nowrap">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'callbacks':
      case 'knowledge':
        return (
          <div className="relative h-full w-full rounded-3xl overflow-hidden border border-gray-800">
            <img 
              src={type === 'callbacks' ? 
                "https://images.unsplash.com/photo-1521791136064-7986c2920216" : 
                "https://images.unsplash.com/photo-1553877522-43269d4ea984"} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/70 p-8 flex flex-col justify-between backdrop-blur-md">
              <div className="flex justify-between items-start">
                <h2 className="text-4xl font-display text-white">{title}</h2>
                {hasAction && (
                  <div className="flex gap-3">
                    {type === 'callbacks' ? (
                      <Phone className="w-6 h-6 text-purple-300" />
                    ) : (
                      <Database className="w-6 h-6 text-purple-300" />
                    )}
                    <MessageSquare className="w-6 h-6 text-purple-300" />
                  </div>
                )}
              </div>
              <p className="text-gray-300 mt-4">
                {type === 'callbacks' ? 
                  'AI-powered scheduling system for priority-based follow-ups' :
                  'Smart knowledge base with instant solution suggestions'}
              </p>
            </div>
          </div>
        );
      
      case 'efficiency':
        return (
          <div className="h-full w-full bg-black/80 backdrop-blur-md rounded-3xl p-8 text-white relative border border-gray-800">
            <div className="absolute right-8 top-8">
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-purple-300" />
              </div>
            </div>
            <p className="mt-36 text-lg">
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

const ScrollButton = ({ direction, onClick }) => {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center
                  rounded-full transition-all bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm
                  border border-purple-500/30 text-white`}
      style={{ [direction]: '-24px' }}
    >
      <Icon size={16} />
    </button>
  );
};

export default function HorizontalScroll() {
  const containerRef = React.useRef(null);
  
  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-20 relative overflow-hidden bg-[rgb(10,10,10)]">

      <style jsx global>{`
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

        <div className="relative bg-black/50 backdrop-blur-lg rounded-3xl p-8 border border-gray-800">
          <div 
            ref={containerRef}
            className="flex overflow-x-auto hide-scrollbar gap-6 pb-6"
          >
            <Card type="analytics" />
            <Card 
              type="callbacks"
              title="SMART CALLBACKS"
              hasAction={true}
            />
            <Card type="sections" />
            <Card 
              type="knowledge"
              title="KNOWLEDGE BASE"
              hasAction={true}
            />
            <Card type="efficiency" />
          </div>
          
          <div className="absolute bottom-8 right-8">
            <div className="flex items-center">
              <div className="relative right-10">
                <ScrollButton direction="left" onClick={() => scroll('left')} />
              </div>
              <ScrollButton direction="right" onClick={() => scroll('right')} />
            </div>
          </div>
        </div>

        <div className="mt-8 text-lg text-gray-300 max-w-2xl">
          AI-powered workflow optimization for enhanced claims processing efficiency and customer satisfaction.
        </div>
      </div>
    </div>
  );
}