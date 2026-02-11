import { useState, useEffect } from 'react';
import { LayoutDashboard, Menu, MessageSquare, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSidebar from '../components/Layout/Sidebar/MobileSidebar';
import { cn } from '../utils/cn';
import { DemoCallProvider, useDemoCall } from '../contexts/DemoCallContext';
import { UnifiedChatInterface, UserPhoneInterface } from '../components/DemoCall';
import { useLanguage } from '../contexts/LanguageContext';

type InteractionMode = 'select' | 'chat' | 'call';

interface UserCallContentProps {
  initialMode?: InteractionMode;
}

function UserCallContent({ initialMode = 'select' }: UserCallContentProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<InteractionMode>(initialMode);
  const isDark = true;
  const { t } = useLanguage();
  const { currentCall, endCall } = useDemoCall();

  // Auto-start call when entering call mode
  const [shouldStartCall, setShouldStartCall] = useState(false);

  useEffect(() => {
    if (mode === 'call') {
      setShouldStartCall(true);
    } else {
      setShouldStartCall(false);
    }
  }, [mode]);

  const handleBackToSelection = async () => {
    // End any active call/chat before going back
    if (currentCall?.status === 'active') {
      await endCall();
    }
    setMode('select');
  };

  return (
    <div className={cn(
      "h-screen w-screen flex flex-col overflow-hidden",
      isDark
        ? "bg-black"
        : "bg-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl opacity-50" />
      </div>

      {/* Header - Hide in call mode as the call UI handles its own header/back button */}
      {mode !== 'call' && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-40",
          "py-3 px-4 sm:px-6",
          "transition-all duration-300",
          "backdrop-blur-md border-b",
          isDark
            ? "bg-[rgb(10,10,10)]/80 border-white/10"
            : "bg-white/80 border-black/10",
          "shadow-sm"
        )}>
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            {/* Left: Logo or Back button */}
            <div className="flex items-center gap-3">
              {mode !== 'select' && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handleBackToSelection}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDark
                      ? "hover:bg-white/10 text-white/80 hover:text-white"
                      : "hover:bg-black/10 text-black/80 hover:text-black"
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              )}
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 group hover:opacity-80 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 464 468"
                  className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity"
                  aria-label="ClerkTree Logo"
                >
                  <path
                    fill={isDark ? "white" : "black"}
                    d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                  />
                </svg>
                <span className={cn(
                  "font-semibold text-lg tracking-tight",
                  isDark ? "text-white" : "text-black"
                )}>
                  ClerkTree {t('userCall.aiAssistant')}
                </span>
              </button>
            </div>

            {/* Right: Settings & Hamburger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  isDark
                    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-white/10"
                    : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-black border-black/10"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('userCall.settings')}</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  isDark
                    ? "hover:bg-white/10 text-white/80 hover:text-white"
                    : "hover:bg-black/10 text-black/80 hover:text-black"
                )}
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 relative flex flex-col overflow-y-auto", // Changed min-h-0 to overflow-y-auto for better mobile scrolling in select mode
        mode !== 'call' && "pt-16" // Only add top padding when header is visible
      )}>
        <AnimatePresence mode="wait">
          {mode === 'select' && (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 py-10 md:py-0"
            >
              <div className="w-full max-w-4xl">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center mb-8 md:mb-16"
                >
                  <h1 className={cn(
                    "text-3xl md:text-6xl font-black mb-6 tracking-tight",
                    "bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent" // Modern text gradient
                  )}>
                    How would you like to connect?
                  </h1>
                  <p className={cn(
                    "text-lg md:text-xl font-medium",
                    isDark ? "text-white/40" : "text-gray-500"
                  )}>
                    Choose your preferred way to interact with our AI assistant
                  </p>
                </motion.div>

                {/* Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Chat Option */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    onClick={() => setMode('chat')}
                    className={cn(
                      "group relative p-6 md:p-10 rounded-[32px] overflow-hidden text-left w-full",
                      "border transition-all duration-500",
                      isDark
                        ? "bg-gradient-to-b from-white/[0.08] to-transparent border-white/[0.08]"
                        : "bg-white border-gray-100 shadow-xl shadow-gray-200/50",
                      "hover:translate-y-[-4px] hover:shadow-2xl"
                    )}
                  >
                    {/* Hover Glow - Blue */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-br from-blue-500/20 via-transparent to-transparent"
                    )} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={cn(
                        "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-8",
                        "bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
                        isDark
                          ? "from-blue-500/20 to-blue-600/5 border border-blue-500/20"
                          : "from-blue-50 to-blue-100 border border-blue-200"
                      )}>
                        <MessageSquare className={cn(
                          "w-6 h-6 md:w-8 md:h-8",
                          isDark ? "text-blue-400" : "text-blue-600"
                        )} />
                      </div>

                      <h2 className={cn(
                        "text-2xl md:text-3xl font-bold mb-4",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        Text Chat
                      </h2>
                      <p className={cn(
                        "text-base leading-relaxed max-w-xs",
                        isDark ? "text-white/50" : "text-gray-500"
                      )}>
                        Type your questions and get instant AI responses. Perfect for detailed inquiries.
                      </p>


                    </div>
                  </motion.button>

                  {/* Call Option */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    onClick={() => setMode('call')}
                    className={cn(
                      "group relative p-6 md:p-10 rounded-[32px] overflow-hidden text-left w-full",
                      "border transition-all duration-500",
                      isDark
                        ? "bg-gradient-to-b from-white/[0.08] to-transparent border-white/[0.08]"
                        : "bg-white border-gray-100 shadow-xl shadow-gray-200/50",
                      "hover:translate-y-[-4px] hover:shadow-2xl"
                    )}
                  >
                    {/* Hover Glow - Emerald */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      "bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent"
                    )} />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className={cn(
                        "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-8",
                        "bg-gradient-to-br transition-transform duration-500 group-hover:scale-110",
                        isDark
                          ? "from-emerald-500/20 to-emerald-600/5 border border-emerald-500/20"
                          : "from-emerald-50 to-emerald-100 border border-emerald-200"
                      )}>
                        <Phone className={cn(
                          "w-6 h-6 md:w-8 md:h-8",
                          isDark ? "text-emerald-400" : "text-emerald-600"
                        )} />
                      </div>

                      <h2 className={cn(
                        "text-2xl md:text-3xl font-bold mb-4",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        Voice Call
                      </h2>
                      <p className={cn(
                        "text-base leading-relaxed max-w-xs",
                        isDark ? "text-white/50" : "text-gray-500"
                      )}>
                        Speak directly with our AI agent. Natural, hands-free conversation experience.
                      </p>


                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'chat' && (
            <motion.div
              key="chat-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full flex flex-col pt-16"
            >
              <UnifiedChatInterface isDark={isDark} chatOnly={true} />
            </motion.div>
          )}

          {mode === 'call' && (
            <motion.div
              key="call-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full flex flex-col"
            >
              <UserPhoneInterface
                mode="fullscreen"
                autoStart={shouldStartCall}
                onBack={handleBackToSelection}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileSidebar
        currentView={'chatbot'}
        onViewChange={() => { }}
        onSignOut={() => navigate('/')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}

export default function UserCall({ initialMode }: UserCallContentProps = {}) {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId') || undefined;

  return (
    <DemoCallProvider initialAgentId={agentId}>
      <UserCallContent initialMode={initialMode} />
    </DemoCallProvider>
  );
}
