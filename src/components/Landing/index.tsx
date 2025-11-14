import { useTheme } from '../../hooks/useTheme';
import { useMouseGradient } from '../../hooks/useMouseGradient';
import Hero from './Hero';
import AboutSection from './AboutSection';
import Features from './Features';
import Metrics from './Metrics';
import Conversation from './Conversation';
import FAQSection from './FAQSection';
import Footer from './Footer';
import ThreeBackground from './ThreeBackground';

export default function Landing() {
  const { isDark } = useTheme();
  const { gradientStyle } = useMouseGradient();

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Unified gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[rgb(10,10,10)] via-[rgb(15,15,30)] to-[rgb(10,10,20)]" />
      
      {/* Ambient blue gradient accents */}
      <div className="fixed inset-0">
        <div 
          className="absolute top-0 right-0 w-[800px] h-[800px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(29,78,216,0.2) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute bottom-1/4 left-0 w-[600px] h-[600px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(59,130,246,0.2) 50%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
      </div>
      
      <ThreeBackground />
      <div 
        className="fixed inset-0 opacity-20 mix-blend-overlay" 
        style={gradientStyle} 
      />
      <div className="relative z-10">
        <Hero />
        <AboutSection />
        <Features />
        <Metrics />
        <Conversation />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}