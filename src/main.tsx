import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import './index.css';

// Defer Sentry init to after first paint to reduce TBT
const initSentry = async () => {
  try {
    const Sentry = await import("@sentry/react");
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.0,
    });
  } catch (err) {
    console.error("Failed to load Sentry", err);
  }
};

if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(initSentry);
} else {
  setTimeout(initSentry, 2000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
