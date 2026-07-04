import { runWhenIdle } from './idle';

type VitalMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
  route: string;
  url: string;
  ts: number;
};

const RATING_THRESHOLDS: Record<string, [number, number]> = {
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  INP: [200, 500],
  LCP: [2500, 4000],
  TTFB: [800, 1800],
  LONG_TASK: [50, 200],
};

const queue: VitalMetric[] = [];
let flushScheduled = false;
let initialized = false;
const sampleRate = Number(import.meta.env.VITE_PERF_SAMPLE_RATE ?? 0.1);
const isSampled = !import.meta.env.PROD || Math.random() < Math.max(0, Math.min(1, sampleRate));

function getRating(name: string, value: number): VitalMetric['rating'] {
  const [good, poor] = RATING_THRESHOLDS[name] ?? [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function getRoute() {
  return window.location.pathname || '/';
}

function enqueue(name: string, value: number, data: Partial<VitalMetric> = {}) {
  if (!Number.isFinite(value)) {
    return;
  }

  queue.push({
    name,
    value,
    rating: getRating(name, value),
    route: getRoute(),
    url: window.location.href,
    ts: Date.now(),
    ...data,
  });

  scheduleFlush();
}

function scheduleFlush() {
  if (flushScheduled) {
    return;
  }

  flushScheduled = true;
  runWhenIdle(() => {
    flushScheduled = false;
    flushVitals();
  }, 8000);
}

function flushVitals() {
  if (!queue.length) {
    return;
  }

  const endpoint = import.meta.env.VITE_PERF_ENDPOINT as string | undefined;
  const defaultEndpoint = import.meta.env.PROD ? '/api/perf-vitals' : undefined;
  const payload = JSON.stringify({
    app: 'clerktree-frontend',
    buildId: import.meta.env.VITE_BUILD_ID || undefined,
    metrics: queue.splice(0, queue.length),
  });

  const targetEndpoint = endpoint || defaultEndpoint;

  if (!targetEndpoint || !isSampled) {
    if (!import.meta.env.PROD) {
      console.table(JSON.parse(payload).metrics);
    }
    return;
  }

  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon(targetEndpoint, new Blob([payload], { type: 'application/json' }));
    if (sent) {
      return;
    }
  }

  fetch(targetEndpoint, {
    body: payload,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  }).catch(() => {
    // RUM must never affect the user path.
  });
}

function observePaints() {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        enqueue('FCP', entry.startTime);
      }
    }
  }).observe({ type: 'paint', buffered: true });
}

function observeLcp() {
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      enqueue('LCP', lastEntry.startTime, { id: lastEntry.id });
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
}

function observeCls() {
  let clsValue = 0;
  let sessionValue = 0;
  let sessionStart = 0;
  let lastEntryTime = 0;

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntryList & LayoutShift[]) {
      if (entry.hadRecentInput) {
        continue;
      }

      const now = entry.startTime;
      if (sessionStart === 0 || now - lastEntryTime > 1000 || now - sessionStart > 5000) {
        sessionStart = now;
        sessionValue = entry.value;
      } else {
        sessionValue += entry.value;
      }
      lastEntryTime = now;

      if (sessionValue > clsValue) {
        clsValue = sessionValue;
        enqueue('CLS', clsValue, { delta: entry.value });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
}

function observeInp() {
  let maxInteraction = 0;

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as PerformanceEntryList & PerformanceEventTiming[]) {
      if (!entry.interactionId) {
        continue;
      }

      const duration = entry.duration;
      if (duration > maxInteraction) {
        maxInteraction = duration;
        enqueue('INP', duration, { id: String(entry.interactionId) });
      }
    }
  }).observe({ type: 'event', buffered: true, durationThreshold: 40 });
}

function observeLongTasks() {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      enqueue('LONG_TASK', entry.duration, { id: entry.name });
    }
  }).observe({ type: 'longtask', buffered: true });
}

function reportTtfb() {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navEntry) {
    return;
  }

  enqueue('TTFB', navEntry.responseStart, {
    navigationType: navEntry.type,
  });
}

function markAppStart() {
  performance.mark('app:main-start');
  window.addEventListener('load', () => {
    performance.mark('app:window-load');
    performance.measure('app:main-to-load', 'app:main-start', 'app:window-load');
  }, { once: true });
}

export function initPerformanceVitals() {
  if (initialized || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  initialized = true;
  markAppStart();

  try { observePaints(); } catch { /* unsupported */ }
  try { observeLcp(); } catch { /* unsupported */ }
  try { observeCls(); } catch { /* unsupported */ }
  try { observeInp(); } catch { /* unsupported */ }
  try { observeLongTasks(); } catch { /* unsupported */ }
  reportTtfb();

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushVitals();
    }
  });

  window.addEventListener('pagehide', flushVitals);
}
