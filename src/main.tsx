import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import { loadBundle, resolveInitialLanguage } from './i18n/index.ts';
import { initAnalytics } from './lib/analytics.ts';
import { initPerformanceVitals } from './utils/performanceVitals.ts';
import './index.css';

initPerformanceVitals();
initAnalytics();

const language = resolveInitialLanguage();
document.documentElement.lang = language;

function render() {
  createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        <App />
      </ErrorBoundary>
    </HelmetProvider>,
  );
}

// Have the visitor's language ready before the first paint, so the page never
// renders in English and then flips to German. If the strings cannot be
// fetched, render anyway: English is bundled as the fallback.
loadBundle('site', language).then(render, render);
