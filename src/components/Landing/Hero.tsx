import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useDeviceDetection } from '../../hooks/useDeviceDetection';

const Logo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 464 468"
    className="w-20 h-20 md:w-24 md:h-24 -ml-2" // Reduced size from w-24/h-24 to w-20/h-20
    aria-label="ClerkTree Logo"
  >
    <path 
      fill="white"
      d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
    />
  </svg>
);

const Hero = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useDeviceDetection();

  // Simplified animation config for mobile/reduced motion
  const animationConfig = prefersReducedMotion || isMobile 
    ? { opacity: 1, y: 0 } 
    : { opacity: 0, y: 20 };
  
  const transitionConfig = prefersReducedMotion || isMobile
    ? { duration: 0 }
    : { duration: 0.6, delay: 0.2 };

  return (
    <>
      <div className="min-h-screen relative bg-[rgb(10,10,10)]">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto text-center px-6 relative z-10">
          <div className="mb-8 flex items-center justify-center">
            {/* Logo container with adjusted spacing for larger logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center">
                <Logo />
              </div>
              
              {/* Logo text white */}
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white">ClerkTree</h1>
            </div>
          </div>

          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            initial={animationConfig}
            animate={{ opacity: 1, y: 0 }}
            transition={transitionConfig}
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 text-transparent bg-clip-text">
                Revolutionizing
              </span>
              <br />
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                BPO Claims Processing
              </span>
            </h2>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12"
            initial={animationConfig}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion || isMobile ? { duration: 0 } : { duration: 0.6, delay: 0.3 }}
          >
            Transform your claims processing workflow with AI-driven automation,
            intelligent callback scheduling, and real-time sentiment analysis
          </motion.p>

          <motion.div 
            initial={animationConfig}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion || isMobile ? { duration: 0 } : { duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/contact')}
              className={cn(
                "relative group overflow-hidden",
                "w-full sm:w-auto",
                "px-8 py-4 rounded-[20px]",
                "text-base font-semibold tracking-wide",
                "transition-all duration-200",
                "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20",
                isMobile ? "" : "backdrop-blur-sm",
                "border-2 border-purple-500/30",
                "hover:bg-gradient-to-r hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-600/30",
                "hover:border-purple-500/50",
                "text-white"
              )}
            >
              <span className="relative z-10">Book Demo</span>
            </button>

            <button 
              onClick={() => navigate('/solutions')}
              className={cn(
                "relative group",
                "w-full sm:w-auto",
                "px-8 py-4 rounded-[20px]",
                "text-base font-semibold tracking-wide",
                "transition-all duration-200",
                "bg-white/10",
                isMobile ? "" : "backdrop-blur-sm",
                "border-2 border-white/20",
                "hover:bg-white/20 hover:border-white/30",
                "text-white"
              )}
            >
              <span className="relative z-10">See Solutions</span>
            </button>
          </motion.div>
        </div>
      </div>

      </div>
    </>
  );
};

export default Hero;