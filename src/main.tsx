import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';

import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import { reloadForNewBuild } from './utils/staleBuild.ts';
import { loadBundle, resolveInitialLanguage } from './i18n/index.ts';
import { initAnalytics } from './lib/analytics.ts';
import './index.css';

// Production prints nothing to the visitor's console: our own calls are stripped at build time,
// and this silences libraries that log on their own. Development keeps the console.
if (import.meta.env.PROD) {
  const silent = () => undefined;
  for (const method of ['log', 'debug', 'info', 'warn', 'error', 'trace', 'table', 'dir'] as const) {
    console[method] = silent;
  }
}

initAnalytics();

// A page opened before a deploy can still point at files the new build removed: reload to pick up
// the current build. The event is deliberately not cancelled: cancelling makes Vite resolve the
// failed import with nothing, which React then fails on ("reading 'default'"). Left alone, the
// import rejects and lazyWithRetry / the error screen handle it (see utils/staleBuild.ts).
window.addEventListener('vite:preloadError', () => { reloadForNewBuild(); });

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
