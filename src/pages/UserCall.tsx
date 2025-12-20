import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { DemoCallProvider } from '../contexts/DemoCallContext';
import { UnifiedChatInterface } from '../components/DemoCall';

function UserCallContent() {
  const navigate = useNavigate();
  const isDark = true;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex flex-col",
      isDark
        ? "bg-[rgb(10,10,10)]"
        : "bg-gradient-to-br from-gray-50 to-white"
    )}>
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] bg-gradient-radial from-blue-500/8 via-purple-500/4 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-gradient-radial from-purple-500/6 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className={cn(
        "relative z-50 px-4 py-3 backdrop-blur-md border-b",
        isDark
          ? "bg-[rgb(10,10,10)]/80 border-white/10"
          : "bg-white/80 border-black/10"
      )}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isDark
                  ? "hover:bg-white/10 text-white/60 hover:text-white"
                  : "hover:bg-black/10 text-black/60 hover:text-black"
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
              <span className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-black"
              )}>
                ClerkTree
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/demo-dashboard')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              isDark
                ? "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                : "bg-black/10 text-black/80 hover:bg-black/20 border border-black/10"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl"
        >
          <UnifiedChatInterface isDark={isDark} />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={cn(
        "relative z-10 py-4 text-center",
        isDark ? "text-white/30" : "text-black/30"
      )}>
        <p className="text-xs">
          Powered by ClerkTree AI
        </p>
      </footer>
    </div>
  );
}

export default function UserCall() {
  return (
    <DemoCallProvider>
      <UserCallContent />
    </DemoCallProvider>
  );
}
