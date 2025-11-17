import React from 'react';
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

export default function HorizontalScroll() {
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
        {/* Globe Section */}
        <div className="mt-12 relative">
          <div className={`relative ${isMobile ? 'bg-black/20' : 'bg-black/10 backdrop-blur-2xl'} rounded-3xl p-8 border border-white/10 shadow-lg overflow-hidden min-h-[600px]`}>
            <div 
              className="absolute inset-0 opacity-30" 
              style={{ 
                transform: isMobile 
                  ? 'scale(1.2) translateY(15%)' 
                  : 'scale(2.0) translateY(25%)', 
                transformOrigin: 'center center' 
              }}
            >
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