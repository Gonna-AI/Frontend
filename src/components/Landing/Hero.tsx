import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';
import { useLanguage } from '../../contexts/LanguageContext';


const Hero = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useDeviceDetection();
  const { t } = useLanguage();

  const shouldReduceMotion = prefersReducedMotion || isMobile;

  return (
    <div className="min-h-screen relative bg-[rgb(10,10,10)] overflow-x-hidden flex items-center">
      {/* TOP-RIGHT CORNER SUNRAY EFFECT */}
      {/* Simulation of a diagonal sunray coming from behind the logo position */}

      {/* 1. Core Light Source (Behind Logo) */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[80%] h-[100%] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)',
          filter: 'blur(40px)'
        }}
      />

      {/* 2. Diagonal "Ray" wash across the screen */}
      <div
        className="absolute top-0 right-0 w-full h-full pointer-events-none z-0"
        style={{
          background: 'linear-gradient(215deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 40%, transparent 65%)',
        }}
      />

      <div className="w-full max-w-[90%] md:max-w-screen-2xl mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-[55%_45%] gap-8 items-center">

          {/* Left Column: Content */}
          <div className="relative z-10 max-w-4xl pt-20">

            {/* Main Headline - Matching "Build your own / AI Scouts" style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 font-urbanist"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tighter text-white leading-[0.95] mb-2 text-left">
                {t('hero.revolutionizing')}
              </h1>
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-semibold tracking-tighter text-white leading-[0.95] text-left whitespace-nowrap">
                {t('hero.bpoClaims')}
              </h1>
            </motion.div>

            {/* Subheadline (Paragraph) - Matching description style */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-white max-w-xl mb-12 leading-relaxed font-normal text-left"
            >
              {t('hero.description')}
            </motion.p>

            {/* Buttons - Matching "Request a demo" & "Read customer stories" */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
            >
              {/* Primary Button: White bg, Black text */}
              <button
                onClick={() => navigate('/contact')}
                className="bg-[#E5E5E5] hover:bg-white text-black transition-colors px-8 py-3.5 rounded-lg font-medium text-base tracking-tight"
              >
                {t('nav.bookDemo')}
              </button>

              {/* Secondary Link: Plain text, no icon initially to match ref "Read customer stories" */}
              <button
                onClick={() => navigate('/solutions')}
                className="text-white hover:text-neutral-300 transition-colors font-medium text-base flex items-center gap-2"
              >
                {t('nav.seeSolutions')}
              </button>
            </motion.div>
          </div>

          {/* Right Column: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            {/* 
                Visual Scale: 3x size (Gigantic).
                Constraint: In Frame (max-h-screen, max-w-screen).
                Position: Centered/Left-shifted to avoid cutoff.
            */}
            <div className="relative w-[275%] -ml-[70%] h-[100vh] flex items-center justify-center -mt-[45%]">
              <img
                src="/Untitled - Copy@1-1470x748-2.png"
                alt="Hero Graphic"
                className="w-full h-full object-contain scale-140"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
                }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Hero;