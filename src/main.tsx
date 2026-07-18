import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';

import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorFallback from './components/ErrorFallback.tsx';
import { initAmplitude } from './lib/amplitude.client.ts';
import { initPerformanceVitals } from './utils/performanceVitals.ts';
import './index.css';

initPerformanceVitals();
initAmplitude();

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
