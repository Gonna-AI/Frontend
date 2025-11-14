import { useTheme } from '../../hooks/useTheme';
import { useMouseGradient } from '../../hooks/useMouseGradient';
import Hero from './Hero';
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
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      <ThreeBackground />
      <div 
        className="fixed inset-0 opacity-30 mix-blend-overlay" 
        style={gradientStyle} 
      />
      <div className="relative z-10">
        <Hero />
        <Features />
        <Metrics />
        <Conversation />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}