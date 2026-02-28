import Hero from './Hero';
import SEO from '../SEO';
import { lazy, Suspense } from 'react';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../Layout/LanguageSwitcher';

import { useLanguage } from '../../contexts/LanguageContext';

import { useDeviceDetection } from '../../hooks/useDeviceDetection';

// Lazy-load below-the-fold sections to reduce initial JS bundle
const AboutSection = lazy(() => import('./AboutSection'));
const CodeDemoSection = lazy(() => import('./CodeDemoSection'));
const Metrics = lazy(() => import('./Metrics'));
const Features = lazy(() => import('./Features'));
const Conversation = lazy(() => import('./Conversation'));
const FAQ = lazy(() => import('./FAQ'));

export default function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();
  const { isMobile } = useDeviceDetection();
  const [bannerVisible, setBannerVisible] = useState(true);

  const handleBannerVisibility = useCallback((visible: boolean) => {
    setBannerVisible(visible);
  }, []);

  // Track scroll position to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileMenuOpen(false);
    navigate('/about');
  };



  const handleSolutionsClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/solutions');
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-[rgb(10,10,10)]">
      <SEO
        title="Autonomous AI Voice & Reception Agents"
        description="Stop losing revenue to missed calls. ClerkTree provides autonomous, human-sounding AI Voice Agents that handle Gäubodenvolksfest crowds, reservations, and customer support. State-subsidized up to 50% for Bavarian SMEs."
        canonical="https://clerktree.com"
      />
      {/* Announcement Banner */}
      <AnnouncementBanner onVisibilityChange={handleBannerVisibility} />

      {/* Header - Dark background fading to transparent on right for corner glow, solid when scrolled */}
      <header
        className={`fixed left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 overflow-hidden transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl' : ''}`}
        style={{ top: bannerVisible ? '44px' : '0' }}
      >
        {/* Dark-to-transparent gradient background with fading bottom edge - or solid when scrolled */}
        <div
          className="absolute inset-0 -z-10 transition-all duration-300"
          style={(isScrolled || isMobile) ? {
            background: 'rgb(10,10,10)',
            opacity: 0.95,
            boxShadow: 'inset 0 -1px 0 0 rgba(255,255,255,0.1)',
          } : {
            background: 'linear-gradient(to right, rgb(10,10,10) 0%, rgb(10,10,10) 50%, transparent 85%)',
            boxShadow: 'inset 0 -1px 0 0 rgba(255,255,255,0.05)',
            maskImage: 'linear-gradient(to right, black 0%, black 40%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 40%, transparent 70%)',
          }}
        />
        <div className="w-full max-w-[90%] md:max-w-screen-2xl mx-auto flex items-center justify-between pl-0 md:pl-8">
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
              {t('nav.blog')}
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
              {t('nav.about')}
            </button>
          </div>

          {/* Desktop Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={() => navigate('/docs')}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 backdrop-blur-md bg-white/5 border-white/10 text-white/90 hover:text-white hover:bg-white/10"
              style={{
                fontFamily: 'Urbanist, sans-serif',
              }}
            >
              {t('nav.docs')}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            {/* Login Button - dark bordered style */}
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all h-8 rounded-md px-4"
              style={{
                fontFamily: 'Urbanist, sans-serif',
                background: 'rgba(255, 255, 255, 0.95)',
                color: 'rgb(10, 10, 10)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              {t('nav.login')}
            </button>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="w-[100px]">
              <LanguageSwitcher isExpanded={true} forceDark={true} />
            </div>
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

      {/* Mobile Menu Overlay - offset top when banner is visible */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Glassy Popup Menu */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-4 right-4 z-50 md:hidden"
              style={{ top: bannerVisible ? '108px' : '64px' }}
            >
              <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
                <nav className="flex flex-col p-2">
                  <button
                    onClick={handleAboutClick}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <span className="text-base font-medium font-urbanist">{t('nav.about')}</span>
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </button>

                  <div className="h-px bg-white/5 mx-2" />

                  <button
                    onClick={handleSolutionsClick}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <span className="text-base font-medium font-urbanist">{t('nav.solutions')}</span>
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </button>

                  <div className="h-px bg-white/5 mx-2" />

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/blog');
                    }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <span className="text-base font-medium font-urbanist">{t('nav.blog')}</span>
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </button>

                  <div className="h-px bg-white/5 mx-2" />

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/docs');
                    }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-all group"
                  >
                    <span className="text-base font-medium font-urbanist">{t('nav.docs')}</span>
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                  </button>

                  <div className="h-px bg-white/5 mx-2 my-1" />

                  <div className="p-2">
                    <LanguageSwitcher isExpanded={true} forceDark={true} />
                  </div>

                  <div className="h-px bg-white/5 mx-2" />

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="flex items-center justify-center mx-2 my-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      fontFamily: 'Urbanist, sans-serif',
                      background: 'rgba(255, 255, 255, 0.95)',
                      color: 'rgb(10, 10, 10)',
                    }}
                  >
                    {t('nav.login')}
                  </button>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <Hero />

        <Suspense fallback={null}>
          <div id="about-section">
            <AboutSection />
          </div>
          <CodeDemoSection />
          <Metrics />
          <Features />
          <Conversation />
          <FAQ />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}