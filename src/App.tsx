import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import CanonicalLink from './components/CanonicalLink';
import HreflangTags from './components/HreflangTags';
import { cancelIdle, runWhenIdle } from './utils/idle';
import { installIntentPrefetch } from './utils/intentPrefetch';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy load pages (with auto-retry on chunk load failure after deploys)
const PrivacyPolicy = lazyWithRetry(() => import('./components/Legal/PrivacyPolicy'), 'PrivacyPolicy');
const TermsOfService = lazyWithRetry(() => import('./components/Legal/TermsOfService'), 'TermsOfService');
const Security = lazyWithRetry(() => import('./components/Legal/Security'), 'Security');
const CookiePolicy = lazyWithRetry(() => import('./components/Legal/CookiePolicy'), 'CookiePolicy');
const Contact = lazyWithRetry(() => import('./pages/Contact'), 'Contact');
const About = lazyWithRetry(() => import('./pages/About'), 'About');
const Research = lazyWithRetry(() => import('./pages/Research'), 'Research');
const Careers = lazyWithRetry(() => import('./pages/Careers'), 'Careers');
const Solutions = lazyWithRetry(() => import('./pages/Solutions'), 'Solutions');
const Blog = lazyWithRetry(() => import('./pages/Blog'), 'Blog');
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'), 'BlogPost');

// New shadcn-admin-style dashboard shell
const AuthRouteProvider = lazyWithRetry(() => import('./components/Auth/AuthRouteProvider'), 'AuthRouteProvider');
const ProtectedAuthRoute = lazyWithRetry(() => import('./components/Auth/ProtectedAuthRoute'), 'ProtectedAuthRoute');
const ClientPortalProviderRoute = lazyWithRetry(() => import('./components/client-portal/ClientPortalProviderRoute'), 'ClientPortalProviderRoute');
const ProtectedClientPortalRoute = lazyWithRetry(() => import('./components/client-portal/ProtectedClientPortalRoute'), 'ProtectedClientPortalRoute');
const DashboardLayout = lazyWithRetry(() => import('./dashboard/layout/DashboardLayout'), 'DashboardLayout');
const DashboardDefault = lazyWithRetry(() => import('./dashboard/pages/default/page'), 'DashboardDefault');
const DashboardCrm = lazyWithRetry(() => import('./dashboard/pages/crm/page'), 'DashboardCrm');
const DashboardFinance = lazyWithRetry(() => import('./dashboard/pages/finance/page'), 'DashboardFinance');
const DashboardAnalytics = lazyWithRetry(() => import('./dashboard/pages/analytics/page'), 'DashboardAnalytics');
const DashboardProductivity = lazyWithRetry(() => import('./dashboard/pages/productivity/page'), 'DashboardProductivity');
const DashboardEcommerce = lazyWithRetry(() => import('./dashboard/pages/ecommerce/page'), 'DashboardEcommerce');
const DashboardAcademy = lazyWithRetry(() => import('./dashboard/pages/academy/page'), 'DashboardAcademy');
const DashboardLogistics = lazyWithRetry(() => import('./dashboard/pages/logistics/page'), 'DashboardLogistics');
const DashboardInfrastructure = lazyWithRetry(() => import('./dashboard/pages/infrastructure/page'), 'DashboardInfrastructure');
const DashboardMailPreview = lazyWithRetry(() => import('./dashboard/pages/mail/page'), 'DashboardMailPreview');
const DashboardChatPreview = lazyWithRetry(() => import('./dashboard/pages/chat/page'), 'DashboardChatPreview');
const DashboardCalendar = lazyWithRetry(() => import('./dashboard/pages/calendar/page'), 'DashboardCalendar');
const DashboardKanban = lazyWithRetry(() => import('./dashboard/pages/kanban/page'), 'DashboardKanban');
const DashboardTasks = lazyWithRetry(() => import('./dashboard/pages/tasks/page'), 'DashboardTasks');
const DashboardInvoice = lazyWithRetry(() => import('./dashboard/pages/invoice/page'), 'DashboardInvoice');
const DashboardUsers = lazyWithRetry(() => import('./dashboard/pages/users/page'), 'DashboardUsers');
const DashboardRoles = lazyWithRetry(() => import('./dashboard/pages/roles/page'), 'DashboardRoles');
const DashboardAnalyticsV1 = lazyWithRetry(() => import('./dashboard/pages/legacy/analytics-v1/page'), 'DashboardAnalyticsV1');
const DashboardComingSoon = lazyWithRetry(() => import('./dashboard/pages/coming-soon/page'), 'DashboardComingSoon');
const MailApp = lazyWithRetry(() => import('./dashboard/standalone/mail/MailApp'), 'MailApp');
const ChatApp = lazyWithRetry(() => import('./dashboard/standalone/chat/ChatApp'), 'ChatApp');
const AuthV1Login = lazyWithRetry(() => import('./dashboard/auth/v1/login/page'), 'AuthV1Login');
const AuthV1Register = lazyWithRetry(() => import('./dashboard/auth/v1/register/page'), 'AuthV1Register');
const AuthV2Layout = lazyWithRetry(() => import('./dashboard/auth/v2/AuthV2Layout'), 'AuthV2Layout');
const AuthV2Login = lazyWithRetry(() => import('./dashboard/auth/v2/login/page'), 'AuthV2Login');
const AuthV2Register = lazyWithRetry(() => import('./dashboard/auth/v2/register/page'), 'AuthV2Register');
const AISettings = lazyWithRetry(() => import('./components/AISettings'), 'AISettings');
const DocsPage = lazyWithRetry(() => import('./pages/DocsPage'), 'DocsPage');
const SupportPage = lazyWithRetry(() => import('./pages/SupportPage'), 'SupportPage');
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'), 'AuthPage');
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'), 'AuthCallback');
const AuthGoogleCallback = lazyWithRetry(() => import('./pages/AuthGoogleCallback'), 'AuthGoogleCallback');
const InvitePage = lazyWithRetry(() => import('./pages/InvitePage'), 'InvitePage');
const CRM = lazyWithRetry(() => import('./pages/CRM'), 'CRM');
const LandingFramer = lazyWithRetry(() => import('./pages/LandingFramer'), 'LandingFramer');
const ClientPortalLoginPage = lazyWithRetry(() => import('./pages/client-portal/ClientPortalLoginPage'), 'ClientPortalLoginPage');
const ClientPortalDashboard = lazyWithRetry(() => import('./pages/client-portal/ClientPortalDashboard'), 'ClientPortalDashboard');
const CookieConsent = lazyWithRetry(() => import('./components/CookieConsent'), 'CookieConsent');

const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');
import LoadingScreen from './components/LoadingScreen';

const routePrefetchers = {
  '/': () => import('./pages/LandingFramer'),
  '/reddit-industrial-ai': () => import('./pages/LandingFramer'),
  '/about': () => import('./pages/About'),
  '/research': () => import('./pages/Research'),
  '/research/:topicSlug': () => import('./pages/Research'),
  '/careers': () => import('./pages/Careers'),
  '/solutions': () => import('./pages/Solutions'),
  '/contact': () => import('./pages/Contact'),
  '/support': () => import('./pages/SupportPage'),
  '/blog': () => import('./pages/Blog'),
  '/blog/:slug': () => import('./pages/BlogPost'),
  '/docs': () => import('./pages/DocsPage'),
  '/login': () => import('./pages/AuthPage'),
  '/client/login': () => import('./pages/client-portal/ClientPortalLoginPage'),
  '/dashboard': () => import('./dashboard/layout/DashboardLayout'),
  '/terms-of-service': () => import('./components/Legal/TermsOfService'),
  '/privacy-policy': () => import('./components/Legal/PrivacyPolicy'),
  '/cookie-policy': () => import('./components/Legal/CookiePolicy'),
  '/security': () => import('./components/Legal/Security'),
};

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
  const isResearchHost =
    typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';

  useEffect(() => installIntentPrefetch(routePrefetchers), []);

  return (
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
            <main className="flex-1 flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={isResearchHost ? <Research /> : <LandingFramer />} />
                <Route path="/reddit-industrial-ai" element={isResearchHost ? <Research /> : <LandingFramer />} />
                <Route path="/:topicSlug" element={isResearchHost ? <Research /> : <NotFound />} />

                {/* Auth Routes */}
                <Route path="/login" element={<AuthRouteProvider><AuthPage /></AuthRouteProvider>} />
                <Route path="/auth/callback" element={<AuthRouteProvider><AuthCallback /></AuthRouteProvider>} />
                <Route path="/auth/google/callback" element={<AuthRouteProvider><AuthGoogleCallback /></AuthRouteProvider>} />
                <Route path="/invite" element={<AuthRouteProvider><InvitePage /></AuthRouteProvider>} />

                {/* Client Portal Routes */}
                <Route path="/client/login" element={<ClientPortalProviderRoute><ClientPortalLoginPage /></ClientPortalProviderRoute>} />
                <Route path="/client" element={
                  <ProtectedClientPortalRoute>
                    <ClientPortalDashboard />
                  </ProtectedClientPortalRoute>
                } />

                {/* Protected Dashboard shell (shadcn-admin style) */}
                <Route path="/dashboard" element={
                  <ProtectedAuthRoute>
                    <DashboardLayout />
                  </ProtectedAuthRoute>
                }>
                  <Route index element={<Navigate to="/dashboard/default" replace />} />
                  <Route path="default" element={<DashboardDefault />} />
                  <Route path="crm" element={<DashboardCrm />} />
                  <Route path="finance" element={<DashboardFinance />} />
                  <Route path="analytics" element={<DashboardAnalytics />} />
                  <Route path="productivity" element={<DashboardProductivity />} />
                  <Route path="ecommerce" element={<DashboardEcommerce />} />
                  <Route path="academy" element={<DashboardAcademy />} />
                  <Route path="logistics" element={<DashboardLogistics />} />
                  <Route path="infrastructure" element={<DashboardInfrastructure />} />
                  <Route path="mail" element={<DashboardMailPreview />} />
                  <Route path="chat" element={<DashboardChatPreview />} />
                  <Route path="calendar" element={<DashboardCalendar />} />
                  <Route path="kanban" element={<DashboardKanban />} />
                  <Route path="tasks" element={<DashboardTasks />} />
                  <Route path="invoice" element={<DashboardInvoice />} />
                  <Route path="users" element={<DashboardUsers />} />
                  <Route path="roles" element={<DashboardRoles />} />
                  <Route path="analytics-v1" element={<DashboardAnalyticsV1 />} />
                  <Route path="coming-soon" element={<DashboardComingSoon />} />
                </Route>

                {/* Standalone full-screen apps embedded in the dashboard via preview iframes */}
                <Route path="/mail" element={
                  <ProtectedAuthRoute>
                    <MailApp />
                  </ProtectedAuthRoute>
                } />
                <Route path="/chat" element={
                  <ProtectedAuthRoute>
                    <ChatApp />
                  </ProtectedAuthRoute>
                } />

                {/* Dashboard template's own auth screen showcase (design demos, not wired to real auth) */}
                <Route path="/auth/v1/login" element={<AuthV1Login />} />
                <Route path="/auth/v1/register" element={<AuthV1Register />} />
                <Route path="/auth/v2" element={<AuthV2Layout />}>
                  <Route path="login" element={<AuthV2Login />} />
                  <Route path="register" element={<AuthV2Register />} />
                </Route>

                <Route path="/ai-settings" element={
                  <ProtectedAuthRoute>
                    <AISettings />
                  </ProtectedAuthRoute>
                } />

                {/* Company Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/research" element={<Research />} />
                <Route path="/research/:topicSlug" element={<Research />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<SupportPage />} />
                {/* CRM App (auth-gated) */}
                <Route path="/crm" element={<CRM />} />

                {/* Blog */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Documentation */}
                <Route path="/docs" element={<DocsPage />} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/security" element={<Security />} />

                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </Suspense>
          <ConditionalCookieConsent />
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

function ConditionalCookieConsent() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.localStorage.getItem('clerktree_cookie_consent')) return undefined;

    let idleHandle = 0;
    const loadTimer = window.setTimeout(() => {
      idleHandle = runWhenIdle(() => setShouldRender(true), 6000);
    }, 1200);

    return () => {
      window.clearTimeout(loadTimer);
      if (idleHandle) cancelIdle(idleHandle);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <Suspense fallback={null}>
      <CookieConsent />
    </Suspense>
  );
}

export default App;
