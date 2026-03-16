import { useState, useEffect } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSidebar from '../components/Layout/Sidebar/MobileSidebar';
import { cn } from '../utils/cn';
import { DemoCallProvider, useDemoCall } from '../contexts/DemoCallContext';
import { UnifiedChatInterface, UserPhoneInterface } from '../components/DemoCall';

import SharedHeader from '../components/Layout/SharedHeader';

type InteractionMode = 'select' | 'chat' | 'call';

interface UserCallContentProps {
  initialMode?: InteractionMode;
  isEmbed?: boolean;
}

function UserCallContent({ initialMode = 'select', isEmbed = false }: UserCallContentProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<InteractionMode>(initialMode);
  const isDark = true;

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
      "h-[100dvh] w-screen flex flex-col overflow-hidden",
      isDark
        ? "bg-black"
        : "bg-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent blur-3xl opacity-50" />
      </div>

      {mode !== 'call' && !isEmbed && (
        <SharedHeader />
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 relative flex flex-col overflow-y-auto",
        mode !== 'call' && !isEmbed && "pt-16"
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
                    onClick={async () => {
                      // If switching to chat but we have an active VOICE call, end it first
                      // so we start a clean text session
                      if (currentCall?.status === 'active' && currentCall?.type === 'voice') {
                        console.log('🔄 Ending active voice call before starting chat session...');
                        await endCall();
                      }
                      setMode('chat');
                    }}
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
                    onClick={async () => {
                      // If switching to call but we have an active TEXT session, end it first
                      // so we start a clean voice session
                      if (currentCall?.status === 'active' && currentCall?.type === 'text') {
                        console.log('🔄 Ending active text session before starting voice call...');
                        await endCall();
                      }
                      setMode('call');
                    }}
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
              className="absolute inset-0 w-full flex flex-col pt-4 md:pt-16"
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

      {!isEmbed && (
        <MobileSidebar
          currentView={'chatbot'}
          onViewChange={() => { }}
          onSignOut={() => navigate('/')}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default function UserCall({ initialMode }: UserCallContentProps = {}) {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId') || undefined;
  const isEmbed = searchParams.get('embed') === 'true';

  return (
    <DemoCallProvider initialAgentId={agentId}>
      <UserCallContent initialMode={isEmbed ? 'chat' : initialMode} isEmbed={isEmbed} />
    </DemoCallProvider>
  );
}
