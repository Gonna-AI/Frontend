import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar/index';
import Landing from './components/Landing';
import { Dashboard, AISettings, Profile, Billing, Settings } from './components/Views';
import { useTheme } from './hooks/useTheme';
import { cn } from './utils/cn';
import AuthPage from './components/Auth/AuthPage';
import { auth } from './services/auth';
import GoogleCallback from './components/Auth/GoogleCallback';
import ClientChat from './components/ClientChat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
// Create a client
const queryClient = new QueryClient();

function App() {
  const { isDark } = useTheme();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth state changes
    const handleAuthStateChange = (event: CustomEvent) => {
      setIsSignedIn(event.detail.isAuthenticated);
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange as EventListener);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange as EventListener);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await auth.checkAuth();
      setIsSignedIn(response.isAuthenticated);
    } catch (error) {
      setIsSignedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.logout();
      setIsSignedIn(false);
      setIsSidebarExpanded(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Add a proper loading component
  }

  // Protected Route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return isSignedIn ? <AuthenticatedLayout>{children}</AuthenticatedLayout> : <Navigate to="/auth" />;
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

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            isSignedIn ? 
              <Navigate to="/dashboard" /> : 
              <Landing />
          } />
          
          <Route path="/auth" element={
            isSignedIn ? 
              <Navigate to="/dashboard" /> : 
              <AuthPage setIsSignedIn={setIsSignedIn} />
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* Chat route - accessible without auth */}
          <Route path="/chat" element={<ClientChat />} />
          <Route path="/ai-settings" element={
            <ProtectedRoute>
              <AISettings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="privacy-policy" element={<PrivacyPolicy/>} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />

          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;