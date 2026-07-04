import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ClientPortalProvider } from './contexts/ClientPortalContext';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { ClientPortalRoute } from './components/client-portal/ClientPortalRoute';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import CanonicalLink from './components/CanonicalLink';
import CookieConsent from './components/CookieConsent';
import HreflangTags from './components/HreflangTags';
import { lazyWithRetry } from './utils/lazyWithRetry';


import Landing from './components/Landing';

// Lazy load pages (with auto-retry on chunk load failure after deploys)
const PrivacyPolicy = lazyWithRetry(() => import('./components/Legal/PrivacyPolicy'), 'PrivacyPolicy');
const TermsOfService = lazyWithRetry(() => import('./components/Legal/TermsOfService'), 'TermsOfService');
const Security = lazyWithRetry(() => import('./components/Legal/Security'), 'Security');
const CookiePolicy = lazyWithRetry(() => import('./components/Legal/CookiePolicy'), 'CookiePolicy');
const SmartContracts = lazyWithRetry(() => import('./pages/SmartContracts'), 'SmartContracts');
const Documents = lazyWithRetry(() => import('./pages/Documents'), 'Documents');
const Contact = lazyWithRetry(() => import('./pages/Contact'), 'Contact');
const About = lazyWithRetry(() => import('./pages/About'), 'About');
const Research = lazyWithRetry(() => import('./pages/Research'), 'Research');
const Careers = lazyWithRetry(() => import('./pages/Careers'), 'Careers');
const Solutions = lazyWithRetry(() => import('./pages/Solutions'), 'Solutions');
const Blog = lazyWithRetry(() => import('./pages/Blog'), 'Blog');
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'), 'BlogPost');
const Bioflow = lazyWithRetry(() => import('./pages/Bioflow'), 'Bioflow');
const DemoDashboard = lazyWithRetry(() => import('./pages/DemoDashboard'), 'DemoDashboard');

// New shadcn-admin-style dashboard shell
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
const DashboardDefaultV1 = lazyWithRetry(() => import('./dashboard/pages/legacy/default-v1/page'), 'DashboardDefaultV1');
const DashboardCrmV1 = lazyWithRetry(() => import('./dashboard/pages/legacy/crm-v1/page'), 'DashboardCrmV1');
const DashboardFinanceV1 = lazyWithRetry(() => import('./dashboard/pages/legacy/finance-v1/page'), 'DashboardFinanceV1');
const DashboardAnalyticsV1 = lazyWithRetry(() => import('./dashboard/pages/legacy/analytics-v1/page'), 'DashboardAnalyticsV1');
const DashboardComingSoon = lazyWithRetry(() => import('./dashboard/pages/coming-soon/page'), 'DashboardComingSoon');
const MailApp = lazyWithRetry(() => import('./dashboard/standalone/mail/MailApp'), 'MailApp');
const ChatApp = lazyWithRetry(() => import('./dashboard/standalone/chat/ChatApp'), 'ChatApp');
const AuthV1Login = lazyWithRetry(() => import('./dashboard/auth/v1/login/page'), 'AuthV1Login');
const AuthV1Register = lazyWithRetry(() => import('./dashboard/auth/v1/register/page'), 'AuthV1Register');
const AuthV2Layout = lazyWithRetry(() => import('./dashboard/auth/v2/AuthV2Layout'), 'AuthV2Layout');
const AuthV2Login = lazyWithRetry(() => import('./dashboard/auth/v2/login/page'), 'AuthV2Login');
const AuthV2Register = lazyWithRetry(() => import('./dashboard/auth/v2/register/page'), 'AuthV2Register');
const UserCall = lazyWithRetry(() => import('./pages/UserCall'), 'UserCall');
const UserChat = lazyWithRetry(() => import('./pages/UserChat'), 'UserChat');
const UserVoiceCall = lazyWithRetry(() => import('./pages/UserVoiceCall'), 'UserVoiceCall');
const AISettings = lazyWithRetry(() => import('./components/AISettings'), 'AISettings');
const DocsPage = lazyWithRetry(() => import('./pages/DocsPage'), 'DocsPage');
const SupportPage = lazyWithRetry(() => import('./pages/SupportPage'), 'SupportPage');
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'), 'AuthPage');
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'), 'AuthCallback');
const AuthGoogleCallback = lazyWithRetry(() => import('./pages/AuthGoogleCallback'), 'AuthGoogleCallback');
const InvitePage = lazyWithRetry(() => import('./pages/InvitePage'), 'InvitePage');
const WhitePaper = lazyWithRetry(() => import('./pages/WhitePaper'), 'WhitePaper');
const CRM = lazyWithRetry(() => import('./pages/CRM'), 'CRM');
const LandingFramer = lazyWithRetry(() => import('./pages/LandingFramer'), 'LandingFramer');
const ClientPortalLoginPage = lazyWithRetry(() => import('./pages/client-portal/ClientPortalLoginPage'), 'ClientPortalLoginPage');
const ClientPortalDashboard = lazyWithRetry(() => import('./pages/client-portal/ClientPortalDashboard'), 'ClientPortalDashboard');
const ThdShowcase = lazyWithRetry(() => import('./pages/ThdShowcase'), 'ThdShowcase');

const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');
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
  const isResearchHost =
    typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';

  return (
    <AuthProvider>
      <ClientPortalProvider>
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
                    <Route path="/legacy" element={<Landing />} />
                    <Route path="/thd" element={<ThdShowcase />} />
                    <Route path="/:topicSlug" element={isResearchHost ? <Research /> : <NotFound />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
                    <Route path="/invite" element={<InvitePage />} />

                    {/* Client Portal Routes */}
                    <Route path="/client/login" element={<ClientPortalLoginPage />} />
                    <Route path="/client" element={
                      <ClientPortalRoute>
                        <ClientPortalDashboard />
                      </ClientPortalRoute>
                    } />

                    {/* Protected Dashboard shell (shadcn-admin style) */}
                    <Route path="/dashboard" element={
                      <PrivateRoute>
                        <DashboardLayout />
                      </PrivateRoute>
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
                      <Route path="default-v1" element={<DashboardDefaultV1 />} />
                      <Route path="crm-v1" element={<DashboardCrmV1 />} />
                      <Route path="finance-v1" element={<DashboardFinanceV1 />} />
                      <Route path="analytics-v1" element={<DashboardAnalyticsV1 />} />
                      <Route path="coming-soon" element={<DashboardComingSoon />} />
                    </Route>

                    {/* AI Agent section — the existing AI receptionist product, folded in as one section */}
                    <Route path="/dashboard/ai/*" element={
                      <PrivateRoute>
                        <DemoDashboard />
                      </PrivateRoute>
                    } />

                    {/* Standalone full-screen apps embedded in the dashboard via preview iframes */}
                    <Route path="/mail" element={
                      <PrivateRoute>
                        <MailApp />
                      </PrivateRoute>
                    } />
                    <Route path="/chat" element={
                      <PrivateRoute>
                        <ChatApp />
                      </PrivateRoute>
                    } />

                    {/* Dashboard template's own auth screen showcase (design demos, not wired to real auth) */}
                    <Route path="/auth/v1/login" element={<AuthV1Login />} />
                    <Route path="/auth/v1/register" element={<AuthV1Register />} />
                    <Route path="/auth/v2" element={<AuthV2Layout />}>
                      <Route path="login" element={<AuthV2Login />} />
                      <Route path="register" element={<AuthV2Register />} />
                    </Route>

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
                    <Route path="/research" element={<Research />} />
                    <Route path="/research/:topicSlug" element={<Research />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/solutions" element={<Solutions />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/whitepaper" element={<WhitePaper />} />
                    {/* CRM App (auth-gated) */}
                    <Route path="/crm" element={<CRM />} />

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

                    {/* Framer template test */}
                    <Route path="/framer-test" element={<LandingFramer />} />

                    {/* Catch all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </Suspense>
              <ConditionalCookieConsent />
            </BrowserRouter>
          </QueryClientProvider>
        </LanguageProvider>
      </ClientPortalProvider>
    </AuthProvider>
  );
}

function ConditionalCookieConsent() {
  const { pathname } = useLocation();
  const isAgeroPreview = pathname === '/framer-test' || pathname === '/works';

  if (isAgeroPreview) {
    return null;
  }

  return <CookieConsent />;
}

export default App;
