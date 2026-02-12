import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from "@sentry/react";
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN, // DSN pulled from environment variable
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions (adjust for production)
  // Session Replay - DISABLED due to high overhead with SVG animations
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
