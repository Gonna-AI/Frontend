import React, { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { Dashboard, AISettings, ComingSoon } from './components/Views';
import { useTheme } from './hooks/useTheme';
import { cn } from './utils/cn';
import { ViewType } from './types/navigation';

function App() {
  const { isDark } = useTheme();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'ai-settings':
        return <AISettings />;
      case 'profile':
        return <ComingSoon feature="User Profile" />;
      case 'billing':
        return <ComingSoon feature="Billing Management" />;
      case 'settings':
        return <ComingSoon feature="System Settings" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-200",
      isDark 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-900" 
        : "bg-gradient-to-br from-gray-100 via-white to-gray-100"
    )}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />
      <div className="pr-16">
        <Header />
        <main className="overflow-y-auto h-[calc(100vh-4rem)]">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;