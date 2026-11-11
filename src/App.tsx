import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import { LanguageProvider, TranslationBundle } from './contexts/LanguageContext';
import { trackPageView } from './lib/analytics';
import { getConsent, onConsentSettingsRequest } from './lib/consent';
import { cancelIdle, runWhenIdle } from './utils/idle';
import { installIntentPrefetch } from './utils/intentPrefetch';
import { applyChromeColor } from './utils/browserChrome';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Every page is its own chunk (with auto-retry when a deploy replaced the chunk).

// Public site
const Landing = lazyWithRetry(() => import('./pages/LandingFramer'), 'Landing');
const About = lazyWithRetry(() => import('./pages/About'), 'About');
const Research = lazyWithRetry(() => import('./pages/Research'), 'Research');
const Machina = lazyWithRetry(() => import('./pages/Machina'), 'Machina');
const Careers = lazyWithRetry(() => import('./pages/Careers'), 'Careers');
const Brand = lazyWithRetry(() => import('./pages/Brand'), 'Brand');
const Hive = lazyWithRetry(() => import('./pages/hive/Hive'), 'Hive');
const Contact = lazyWithRetry(() => import('./pages/Contact'), 'Contact');
const SupportPage = lazyWithRetry(() => import('./pages/SupportPage'), 'SupportPage');
const Blog = lazyWithRetry(() => import('./pages/Blog'), 'Blog');
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost'), 'BlogPost');
const NotFound = lazyWithRetry(() => import('./pages/NotFound'), 'NotFound');

// Legal
const PrivacyPolicy = lazyWithRetry(() => import('./pages/legal/PrivacyPolicy'), 'PrivacyPolicy');
const TermsOfService = lazyWithRetry(() => import('./pages/legal/TermsOfService'), 'TermsOfService');
const CookiePolicy = lazyWithRetry(() => import('./pages/legal/CookiePolicy'), 'CookiePolicy');
const Imprint = lazyWithRetry(() => import('./pages/legal/Imprint'), 'Imprint');
const Security = lazyWithRetry(() => import('./pages/legal/Security'), 'Security');
const DataAccess = lazyWithRetry(() => import('./pages/legal/DataAccess'), 'DataAccess');

// Sign-in
const AuthRouteProvider = lazyWithRetry(() => import('./components/Auth/AuthRouteProvider'), 'AuthRouteProvider');
const ProtectedAuthRoute = lazyWithRetry(() => import('./components/Auth/ProtectedAuthRoute'), 'ProtectedAuthRoute');
const AuthPage = lazyWithRetry(() => import('./pages/AuthPage'), 'AuthPage');
const AuthCallback = lazyWithRetry(() => import('./pages/AuthCallback'), 'AuthCallback');
const AuthGoogleCallback = lazyWithRetry(() => import('./pages/AuthGoogleCallback'), 'AuthGoogleCallback');
const InvitePage = lazyWithRetry(() => import('./pages/InvitePage'), 'InvitePage');

// Client portal
const ClientPortalProviderRoute = lazyWithRetry(() => import('./components/client-portal/ClientPortalProviderRoute'), 'ClientPortalProviderRoute');
const ProtectedClientPortalRoute = lazyWithRetry(() => import('./components/client-portal/ProtectedClientPortalRoute'), 'ProtectedClientPortalRoute');
const ClientPortalLoginPage = lazyWithRetry(() => import('./pages/client-portal/ClientPortalLoginPage'), 'ClientPortalLoginPage');
const ClientPortalDashboard = lazyWithRetry(() => import('./pages/client-portal/ClientPortalDashboard'), 'ClientPortalDashboard');

// Workspace (signed-in dashboard)
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
const AISettings = lazyWithRetry(() => import('./components/AISettings'), 'AISettings');

const CookieConsent = lazyWithRetry(() => import('./components/CookieConsent'), 'CookieConsent');

/** Chunks worth fetching as soon as the visitor shows intent (hover, focus, touch) on a link. */
const routePrefetchers = {
  '/': () => import('./pages/LandingFramer'),
  '/about': () => import('./pages/About'),
  '/research': () => import('./pages/Research'),
  '/research/:topicSlug': () => import('./pages/Research'),
  '/careers': () => import('./pages/Careers'),
  '/brand': () => import('./pages/Brand'),
  '/hive': () => import('./pages/hive/Hive'),
  '/contact': () => import('./pages/Contact'),
  '/support': () => import('./pages/SupportPage'),
  '/machina': () => import('./pages/Machina'),
  '/blog': () => import('./pages/Blog'),
  '/blog/:slug': () => import('./pages/BlogPost'),
  '/login': () => import('./pages/AuthPage'),
  '/client/login': () => import('./pages/client-portal/ClientPortalLoginPage'),
  '/dashboard': () => import('./dashboard/layout/DashboardLayout'),
  '/terms-of-service': () => import('./pages/legal/TermsOfService'),
  '/privacy-policy': () => import('./pages/legal/PrivacyPolicy'),
  '/cookie-policy': () => import('./pages/legal/CookiePolicy'),
  '/imprint': () => import('./pages/legal/Imprint'),
  '/security': () => import('./pages/legal/Security'),
  '/data-access': () => import('./pages/legal/DataAccess'),
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

/** Signed-in and sign-in surfaces: dark shell, no public-site chrome, no consent banner. */
const WORKSPACE_PATH = /^\/(dashboard|auth|login|invite|client|mail|chat|ai-settings)(\/|$)/;
/** Paths answered by the server (edge redirects, functions), which the router must not swallow. */
const SERVER_PATH = /^\/(crm|api)(\/|$)/;
/** A path ending in a file extension is a static asset, not a page. */
const FILE_PATH = /\.[a-z0-9]{2,5}$/i;

function RouteLoadingFallback() {
  const { pathname } = useLocation();
  if (WORKSPACE_PATH.test(pathname)) return <LoadingScreen />;
  return <div aria-hidden="true" style={{ minHeight: '100vh', background: pathname === '/hive' ? '#0d0d0e' : '#f4f4f4' }} />;
}

/**
 * The site's markup uses plain <a href> links. This turns same-origin page
 * links into client-side navigations, so moving between pages swaps the route
 * in place instead of reloading the document and re-running the whole app.
 * Anything it is unsure about (new tab, downloads, files, other hosts) is left
 * to the browser.
 */
function InternalLinkNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || FILE_PATH.test(url.pathname) || SERVER_PATH.test(url.pathname)) return;
      // Same page: let the browser handle in-page anchors and no-op links natively.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      navigate(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  return null;
}

/** Per-navigation side effects: analytics page view and the light/dark page canvas. */
function RouteEffects() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageView();
  }, [pathname, search]);

  useEffect(() => {
    document.documentElement.classList.toggle('ct-site', !WORKSPACE_PATH.test(pathname));
    applyChromeColor(pathname);
  }, [pathname]);

  return null;
}

/**
 * Shows the consent banner on a first visit to the public site (after the page
 * has settled, so it never competes with first paint) and reopens the settings
 * whenever the visitor asks for them.
 */
function ConsentHost() {
  const { pathname, search } = useLocation();
  const [mode, setMode] = useState<'closed' | 'banner' | 'settings'>('closed');
  const isEmbedded = search.includes('preview=dashboard');
  const isWorkspace = WORKSPACE_PATH.test(pathname) || isEmbedded;

  useEffect(() => onConsentSettingsRequest(() => setMode('settings')), []);

  useEffect(() => {
    if (isWorkspace || getConsent()) return undefined;

    let idleHandle = 0;
    const timer = window.setTimeout(() => {
      idleHandle = runWhenIdle(() => setMode((current) => (current === 'closed' ? 'banner' : current)), 6000);
    }, 1200);

    return () => {
      window.clearTimeout(timer);
      if (idleHandle) cancelIdle(idleHandle);
    };
  }, [isWorkspace]);

  if (mode === 'closed' || (mode === 'banner' && isWorkspace)) return null;

  return (
    <Suspense fallback={null}>
      <CookieConsent key={mode} startInSettings={mode === 'settings'} onClose={() => setMode('closed')} />
    </Suspense>
  );
}

function Workspace({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedAuthRoute>
      <TranslationBundle name="dashboard" fallback={<LoadingScreen />}>
        {children}
      </TranslationBundle>
    </ProtectedAuthRoute>
  );
}

function App() {
  const isResearchHost = typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';

  useEffect(() => installIntentPrefetch(routePrefetchers), []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <InternalLinkNavigation />
          <ScrollToTop />
          <RouteEffects />
          <SEO
            title="ClerkTree – The World's Industrial Intelligence Layer"
            description="ClerkTree is an industrial AI harness for machine operations. Agents connect signals, technical knowledge and workflows to help teams understand issues and coordinate work."
          />
          <Suspense fallback={<RouteLoadingFallback />}>
            <div className="flex flex-1 flex-col">
              <Routes>
                {/* Public site */}
                <Route path="/" element={isResearchHost ? <Research /> : <Landing />} />
                <Route path="/:topicSlug" element={isResearchHost ? <Research /> : <NotFound />} />
                <Route path="/about" element={<About />} />
                <Route path="/research" element={<Research />} />
                <Route path="/research/:topicSlug" element={<Research />} />
                <Route path="/machina" element={<Machina />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/brand" element={<Brand />} />
                <Route path="/hive" element={<Hive />} />
                <Route path="/solutions" element={<Navigate to="/#solutions" replace />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/imprint" element={<Imprint />} />
                <Route path="/impressum" element={<Navigate to="/imprint" replace />} />
                <Route path="/security" element={<Security />} />
                <Route path="/data-access" element={<DataAccess />} />

                {/* Sign-in */}
                <Route path="/login" element={<AuthRouteProvider><AuthPage /></AuthRouteProvider>} />
                <Route path="/auth/callback" element={<AuthRouteProvider><AuthCallback /></AuthRouteProvider>} />
                <Route path="/auth/google/callback" element={<AuthRouteProvider><AuthGoogleCallback /></AuthRouteProvider>} />
                <Route path="/invite" element={<AuthRouteProvider><InvitePage /></AuthRouteProvider>} />

                {/* Client portal */}
                <Route path="/client/login" element={<ClientPortalProviderRoute><ClientPortalLoginPage /></ClientPortalProviderRoute>} />
                <Route path="/client" element={<ProtectedClientPortalRoute><ClientPortalDashboard /></ProtectedClientPortalRoute>} />

                {/* Workspace */}
                <Route path="/dashboard" element={<Workspace><DashboardLayout /></Workspace>}>
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
                {/* Full-screen apps the dashboard embeds through preview iframes */}
                <Route path="/mail" element={<Workspace><MailApp /></Workspace>} />
                <Route path="/chat" element={<Workspace><ChatApp /></Workspace>} />
                <Route path="/ai-settings" element={<Workspace><AISettings /></Workspace>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Suspense>
          <ConsentHost />
        </BrowserRouter>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
