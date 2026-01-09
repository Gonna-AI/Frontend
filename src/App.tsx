import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
import Security from './components/Legal/Security';
import CookiePolicy from './components/Legal/CookiePolicy';
import SmartContracts from './pages/SmartContracts';
import Documents from './pages/Documents';
import Contact from './pages/Contact';
import About from './pages/About';
import Careers from './pages/Careers';
import Solutions from './pages/Solutions';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Arbor from './pages/Arbor';
import Juris from './pages/Juris';
import Bioflow from './pages/Bioflow';
import DemoDashboard from './pages/DemoDashboard';
import UserCall from './pages/UserCall';
import UserChat from './pages/UserChat';
import UserVoiceCall from './pages/UserVoiceCall';
import { ViewType } from './types/navigation';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import AISettings from './components/AISettings';
import ScrollToTop from './components/ScrollToTop';
import DocsPage from './pages/DocsPage';
import CanonicalLink from './components/SEO/CanonicalLink';
import HreflangTags from './components/SEO/HreflangTags';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CanonicalLink />
          <HreflangTags />
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DemoDashboard />} />

            {/* User Call */}
            <Route path="/user" element={<UserCall />} />
            <Route path="/user/chat" element={<UserChat />} />
            <Route path="/user/call" element={<UserVoiceCall />} />
            <Route path="/ai-settings" element={
              <PrivateRoute>
                <AISettings />
              </PrivateRoute>
            } />
            <Route path="/arbor" element={<Arbor />} />
            <Route path="/juris" element={<Juris />} />
            <Route path="/bioflow" element={<Bioflow />} />

            {/* Company Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/contact" element={<Contact />} />

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
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;