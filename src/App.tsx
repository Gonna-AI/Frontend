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


// Lazy load pages
const Landing = React.lazy(() => import('./components/Landing'));
const PrivacyPolicy = React.lazy(() => import('./components/Legal/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./components/Legal/TermsOfService'));
const Security = React.lazy(() => import('./components/Legal/Security'));
const CookiePolicy = React.lazy(() => import('./components/Legal/CookiePolicy'));
const SmartContracts = React.lazy(() => import('./pages/SmartContracts'));
const Documents = React.lazy(() => import('./pages/Documents'));
const Contact = React.lazy(() => import('./pages/Contact'));
const About = React.lazy(() => import('./pages/About'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Solutions = React.lazy(() => import('./pages/Solutions'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Bioflow = React.lazy(() => import('./pages/Bioflow'));
const DemoDashboard = React.lazy(() => import('./pages/DemoDashboard'));
const UserCall = React.lazy(() => import('./pages/UserCall'));
const UserChat = React.lazy(() => import('./pages/UserChat'));
const UserVoiceCall = React.lazy(() => import('./pages/UserVoiceCall'));
const AISettings = React.lazy(() => import('./components/AISettings'));
const DocsPage = React.lazy(() => import('./pages/DocsPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const InvitePage = React.lazy(() => import('./pages/InvitePage'));

// Create a client
const queryClient = new QueryClient();

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
            <Suspense fallback={null}>
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
                <Route path="*" element={<Navigate to="/" />} />
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