import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar/index';
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const handleSignOut = () => {
    setIsSignedIn(false);
    setIsSidebarExpanded(false);
  };

  const handleGetStarted = () => {
    setIsSignedIn(true);
    setIsSidebarExpanded(false);
  };

  useEffect(() => {
    setIsSidebarExpanded(false);
  }, [isSignedIn]);

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
      isDark ? "bg-gradient-to-b from-gray-900 to-black" : "bg-gradient-to-b from-gray-50 to-white"
    )}>
      <div className={cn(
        "fixed top-0 left-0 right-0 h-[40vh] pointer-events-none",
        isDark ? "bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent"
             : "bg-gradient-to-b from-blue-900/40 via-purple-200/30 to-transparent"
      )} />

      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onMobileMenuClick={() => setIsMobileMenuOpen(true)} />
      </div>
      
      <div className="flex pt-16 md:pt-20 fixed inset-0">
        <main className={cn(
          "relative flex-1 overflow-y-auto",
          "transition-all duration-300 ease-in-out",
          "border border-white/10 rounded-tr-2xl",
          "bg-white/5 backdrop-blur-sm",
          isSidebarExpanded ? "md:mr-[280px]" : "md:mr-[72px]"
        )}>
          <div className="p-6">
            {renderView()}
          </div>
        </main>
        
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
          onSignOut={handleSignOut}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onExpandedChange={setIsSidebarExpanded}
        />
      </div>
    </div>
  );
}

export default App;