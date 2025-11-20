import Hero from './Hero';
import AboutSection from './AboutSection';
import ProductsSection from './ProductsSection';
import Metrics from './Metrics';
import Features from './Features';
import Conversation from './Conversation';
import FAQSection from './FAQSection';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileMenuOpen(false);
    navigate('/about');
  };

  const handleContactClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/contact');
  };

  const handleSolutionsClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/solutions');
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-[rgb(10,10,10)]">
      {/* Glassy Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and Text on Left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
              aria-label="Go to home"
            >
              <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
                <path fill="white" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z" />
              </svg>
              <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors leading-none">
                ClerkTree
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="hidden md:block ml-8 font-medium leading-none self-center bg-transparent border-none outline-none"
              style={{
                fontSize: '16px',
                fontFamily: 'Urbanist, sans-serif',
                color: 'oklch(0.9 0 0 / 0.5)',
                transform: 'translateY(1px)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.5)'}
            >
              Blog
            </button>
            <button
              type="button"
              onClick={handleAboutClick}
              className="hidden md:block ml-8 font-medium leading-none self-center bg-transparent border-none outline-none"
              style={{
                fontSize: '16px',
                fontFamily: 'Urbanist, sans-serif',
                color: 'oklch(0.9 0 0 / 0.5)',
                transform: 'translateY(1px)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.9 0 0 / 0.5)'}
            >
              About
            </button>
          </div>

          {/* Desktop Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={handleContactClick}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 backdrop-blur-md bg-white/5 border-white/10 text-white/90 hover:text-white hover:bg-white/10"
              style={{
                fontFamily: 'Urbanist, sans-serif',
              }}
            >
              Contact Us
            </button>
          </nav>

          {/* Mobile Hamburger Menu Button - Visible only on Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Floating Bar */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Floating Bar Below Header */}
          <div className="fixed top-[70px] left-0 right-0 z-40 md:hidden px-4 pt-4">
            <div className="max-w-7xl mx-auto">
              <div className="backdrop-blur-md bg-[rgb(10,10,10)]/80 border border-white/10 rounded-2xl shadow-lg">
                <nav className="flex flex-col items-center justify-center gap-4 p-6">
                  <button
                    onClick={handleAboutClick}
                    className="text-white/80 hover:text-white transition-colors text-base font-medium px-4 py-2 w-full text-center"
                  >
                    About
                  </button>
                  <div className="h-px w-3/4 bg-white/10" />
                  <button
                    onClick={handleSolutionsClick}
                    className="text-white/80 hover:text-white transition-colors text-base font-medium px-4 py-2 w-full text-center"
                  >
                    Solutions
                  </button>
                  <div className="h-px w-3/4 bg-white/10" />
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/blog');
                    }}
                    className="text-white/80 hover:text-white transition-colors text-base font-medium px-4 py-2 w-full text-center"
                  >
                    Blog
                  </button>
                  <div className="h-px w-3/4 bg-white/10" />
                  <button
                    onClick={handleContactClick}
                    className="text-white/80 hover:text-white transition-colors text-base font-medium px-4 py-2 w-full text-center"
                  >
                    Contact Us
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="relative z-10">
        <Hero />

        <div id="about-section">
          <AboutSection />
        </div>
        <ProductsSection />
        <Metrics />
        <Features />
        <FAQSection />
        <Conversation />
        <Footer />
      </div>
    </div>
  );
}