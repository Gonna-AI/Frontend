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

// A page opened before a deploy can still point at files the new build removed.
// Reload once to pick up the current build instead of showing a broken page.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    if (window.sessionStorage.getItem('ct-preload-reload')) return;
    window.sessionStorage.setItem('ct-preload-reload', '1');
  } catch {
    return;
  }
  window.location.reload();
});

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
