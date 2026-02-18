import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';
import CanonicalLink from './components/SEO/CanonicalLink';
import CookieConsent from './components/CookieConsent';
import HreflangTags from './components/SEO/HreflangTags';
import SEO from './components/SEO/SEO';
import { lazyWithRetry } from './utils/lazyWithRetry';


// Lazy load pages (with auto-retry on chunk load failure after deploys)
const Landing = lazyWithRetry(() => import('./components/Landing'), 'Landing');
const PrivacyPolicy = lazyWithRetry(() => import('./components/Legal/PrivacyPolicy'), 'PrivacyPolicy');
const TermsOfService = lazyWithRetry(() => import('./components/Legal/TermsOfService'), 'TermsOfService');
const Security = lazyWithRetry(() => import('./components/Legal/Security'), 'Security');
const CookiePolicy = lazyWithRetry(() => import('./components/Legal/CookiePolicy'), 'CookiePolicy');
const SmartContracts = lazyWithRetry(() => import('./pages/SmartContracts'), 'SmartContracts');
const Documents = lazyWithRetry(() => import('./pages/Documents'), 'Documents');
const Contact = lazyWithRetry(() => import('./pages/Contact'), 'Contact');
const About = lazyWithRetry(() => import('./pages/About'), 'About');
const Careers = lazyWithRetry(() => import('./pages/Careers'), 'Careers');
const Solutions = lazyWithRetry(() => import('./pages/Solutions'), 'Solutions');
const Blog = lazyWithRetry(() => import('./pages/Blog'), 'Blog');
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'), 'BlogPost');
const Bioflow = lazyWithRetry(() => import('./pages/Bioflow'), 'Bioflow');
const DemoDashboard = lazyWithRetry(() => import('./pages/DemoDashboard'), 'DemoDashboard');
const UserCall = lazyWithRetry(() => import('./pages/UserCall'), 'UserCall');
const UserChat = lazyWithRetry(() => import('./pages/UserChat'), 'UserChat');
const UserVoiceCall = lazyWithRetry(() => import('./pages/UserVoiceCall'), 'UserVoiceCall');
const AISettings = lazyWithRetry(() => import('./components/AISettings'), 'AISettings');
const DocsPage = lazyWithRetry(() => import('./pages/DocsPage'), 'DocsPage');
const SupportPage = lazyWithRetry(() => import('./pages/SupportPage'), 'SupportPage');
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'), 'AuthPage');
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'), 'AuthCallback');
const InvitePage = lazyWithRetry(() => import('./pages/InvitePage'), 'InvitePage');

import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CanonicalLink />
            <HreflangTags />
            <ScrollToTop />
            <SEO
              title="ClerkTree"
              description="AI-powered workflow automation for claims and back-office operations. Transform your operations with intelligent automation that reduces turnaround time by 40%."
            />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />

                {/* Auth Routes */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/invite" element={<InvitePage />} />

                {/* Protected Dashboard */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <DemoDashboard />
                  </PrivateRoute>
                } />

                {/* User Call */}
                <Route path="/user" element={<UserCall />} />
                <Route path="/user/chat" element={<UserChat />} />
                <Route path="/user/call" element={<UserVoiceCall />} />
                <Route path="/ai-settings" element={
                  <PrivateRoute>
                    <AISettings />
                  </PrivateRoute>
                } />

                <Route path="/bioflow" element={<Bioflow />} />

                {/* Company Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<SupportPage />} />

                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Documentation */}
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/smart-contracts" element={<SmartContracts />} />
                <Route path="/documents" element={<Documents />} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/security" element={<Security />} />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <CookieConsent />
          </BrowserRouter>
        </QueryClientProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}


export default App;