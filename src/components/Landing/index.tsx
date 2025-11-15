import Hero from './Hero';
import AboutSection from './AboutSection';
import Metrics from './Metrics';
import Features from './Features';
import Conversation from './Conversation';
import FAQSection from './FAQSection';
import Footer from './Footer';

export default function Landing() {

  return (
    <div className="min-h-screen overflow-hidden relative bg-[rgb(10,10,10)]">
      <div className="relative z-10">
        <Hero />
        <AboutSection />
        <Metrics />
        <Features />
        <FAQSection />
        <Conversation />
        <Footer />
      </div>
    </div>
  );
}