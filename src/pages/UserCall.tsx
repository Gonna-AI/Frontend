import React, { useState } from 'react';
import { ArrowLeft, LayoutDashboard, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileSidebar from '../components/Layout/Sidebar/MobileSidebar';
import { cn } from '../utils/cn';
import { DemoCallProvider } from '../contexts/DemoCallContext';
import { UnifiedChatInterface } from '../components/DemoCall';
import { useLanguage } from '../contexts/LanguageContext';

function UserCallContent() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = true;
  const { t } = useLanguage();

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

      {/* Header */}
      <header className={cn(
        "flex-shrink-0 px-4 py-3 border-b z-20",
        isDark
          ? "bg-black/80 border-white/5 backdrop-blur-xl"
          : "bg-white/80 border-black/5 backdrop-blur-xl"
      )}>
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={cn(
                "md:hidden p-2 -ml-2 rounded-lg transition-colors",
                isDark
                  ? "hover:bg-white/5 text-white/60 hover:text-white"
                  : "hover:bg-black/5 text-black/60 hover:text-black"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/')}
              className={cn(
                "hidden md:block p-2 -ml-2 rounded-full transition-colors",
                isDark
                  ? "hover:bg-white/5 text-white/60 hover:text-white"
                  : "hover:bg-black/5 text-black/60 hover:text-black"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 464 468" className="w-8 h-8">
                <path
                  fill={isDark ? "white" : "black"}
                  d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
                />
              </svg>
              <div className="flex flex-col">
                <span className={cn(
                  "text-lg font-bold leading-none",
                  isDark ? "text-white" : "text-black"
                )}>
                  ClerkTree
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  isDark ? "text-white/40" : "text-black/40"
                )}>
                  {t('userCall.aiAssistant')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/demo-dashboard')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              isDark
                ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-white/10"
                : "bg-black/5 text-black/60 hover:bg-black/10 hover:text-black border-black/10"
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('userCall.settings')}</span>
          </button>
        </div>
      </header>

      {/* Main content - Full width/height chat */}
      <main className="flex-1 relative flex flex-col min-h-0">
        <div className="absolute inset-0 max-w-5xl mx-auto w-full flex flex-col">
          <UnifiedChatInterface isDark={isDark} />
        </div>
      </main>

      <MobileSidebar
        currentView={'chatbot'}
        onViewChange={() => { }}
        onSignOut={() => navigate('/')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div >
  );
}

export default function UserCall() {
  return (
    <DemoCallProvider>
      <UserCallContent />
    </DemoCallProvider>
  );
}
