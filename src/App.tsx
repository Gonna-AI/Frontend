import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  // Layout wrapper for authenticated routes
  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
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
              {children}
            </div>
          </main>
          
          <Sidebar 
            currentPath={window.location.pathname}
            onSignOut={handleSignOut}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onExpandedChange={setIsSidebarExpanded}
          />
        </div>
      </div>
    );
  };

  // Protected Route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isSignedIn ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isSignedIn ? <Navigate to="/dashboard" /> : <Landing onGetStarted={handleGetStarted} />
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/ai-settings" element={
          <ProtectedRoute><AISettings /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute><Billing /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;