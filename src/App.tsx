import React from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import { useTheme } from './hooks/useTheme';
import { cn } from './utils/cn';

function App() {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-200",
      isDark 
        ? "bg-gradient-to-br from-gray-900 via-black to-gray-900" 
        : "bg-gradient-to-br from-gray-100 via-white to-gray-100"
    )}>
      <Sidebar />
      <div className="pr-16">
        <Header />
        <main className="overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}

export default App;