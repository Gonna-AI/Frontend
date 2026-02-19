import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';


const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
              <span itemScope itemType="https://schema.org/Brand">
                <h1 className="sr-only" itemProp="name">ClerkTree</h1>
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 text-left break-words hyphens-auto">
                <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                  {t('hero.revolutionizing')}
                </span>
                <br />
                <span className="bg-gradient-to-br from-white via-white/90 to-white/50 text-transparent bg-clip-text whitespace-normal md:whitespace-nowrap">
                  {t('hero.bpoClaims')}
                </span>
              </h2>
            </motion.div>

            {/* Subheadline (Paragraph) - Matching description style */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-2xl text-white w-full lg:w-[115%] max-w-none mb-12 leading-relaxed font-normal text-left whitespace-pre-line"
            >
              {t('hero.description')}
            </motion.p>

            {/* Buttons - Matching "Request a demo" & "Read customer stories" */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center sm:items-center w-full sm:w-auto gap-4 sm:gap-8"
            >
              {/* Primary Button: White bg, Black text */}
              <button
                onClick={() => navigate('/contact')}
                className="bg-[#E5E5E5] hover:bg-white text-black transition-colors px-8 h-[52px] rounded-lg font-medium font-urbanist text-base tracking-tight flex items-center justify-center w-full sm:w-auto"
              >
                {t('nav.bookDemo')}
              </button>

              {/* Secondary Link: Plain text, no icon initially to match ref "Read customer stories" */}
              <button
                onClick={() => navigate('/solutions')}
                className="bg-[#FF4D00] hover:bg-[#CC3D00] text-white px-8 h-[52px] rounded-lg font-medium font-urbanist text-base tracking-tight transition-colors flex items-center justify-center w-full sm:w-auto"
              >
                {t('nav.seeSolutions')}
              </button>
            </motion.div>
          </div>

          {/* Right Column: Image */}
          <div
            className="relative hidden lg:block"
          >
            {/* 
                Visual Scale: 3x size (Gigantic).
                Constraint: In Frame (max-h-screen, max-w-screen).
                Position: Centered/Left-shifted to avoid cutoff.
            */}
            <div className="relative w-[275%] -ml-[80%] h-[100vh] flex items-center justify-center -mt-[45%]">
              <img
                src="/hero-dashboard-graphic.png"
                alt="Hero Graphic"
                fetchPriority="high"
                loading="eager"
                width="1200"
                height="800"
                className="w-full h-full object-contain scale-140"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;