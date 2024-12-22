import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Landing from './components/Landing';
import { Dashboard, AISettings, Profile, Billing, Settings } from './components/Views';
import { useTheme } from './hooks/useTheme';
import { cn } from './utils/cn';
import { ViewType } from './types/navigation';

function App() {
  const { isDark } = useTheme();
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const handleSignOut = () => {
    setIsSignedIn(false);
  };

  const handleGetStarted = () => {
    setIsSignedIn(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-settings':
        return <AISettings />;
      case 'profile':
        return <Profile />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isSignedIn) {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      isDark ? (
        "bg-gradient-to-b from-gray-900 to-black"
      ) : (
        "bg-gradient-to-b from-gray-50 to-white"
      )
    )}>
      {/* Top gradient decoration */}
      <div className={cn(
        "fixed top-0 left-0 right-0 h-[40vh] pointer-events-none",
        isDark ? (
          "bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent"
        ) : (
          "bg-gradient-to-b from-blue-900/40 via-purple-200/30 to-transparent"
        )
      )} />

      <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onSignOut={handleSignOut}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="relative z-10 md:pr-20 overflow-y-auto h-[calc(100vh-3rem)] md:h-[calc(100vh-4rem)]">
        {renderView()}
      </main>
    </div>
  );
}

export default App;