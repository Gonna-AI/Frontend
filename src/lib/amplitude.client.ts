const AMPLITUDE_API_KEY = 'f0fed0214c13f93e476cc2669b00b8a7';
const MAX_QUEUED_EVENTS = 50;

type EventProperties = Record<string, string | number | boolean | null | undefined>;
type AmplitudeModule = typeof import('@amplitude/unified');
type QueuedEvent = {
  name: string;
  properties: EventProperties;
};

let amplitudeClient: AmplitudeModule | null = null;
let amplitudeImportPromise: Promise<AmplitudeModule> | null = null;
let queuedEvents: QueuedEvent[] = [];

declare global {
  interface Window {
    __clerktreeAmplitudeInitialized?: boolean;
    __clerktreeAmplitudeReady?: boolean;
    __clerktreeAmplitudeInteractionsInstalled?: boolean;
  }
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim().slice(0, 120) || undefined;
}

function getElementLabel(element: HTMLElement) {
  return (
    cleanText(element.getAttribute('aria-label')) ||
    cleanText(element.getAttribute('title')) ||
    cleanText(element.getAttribute('data-analytics-label')) ||
    cleanText(element.textContent) ||
    element.tagName.toLowerCase()
  );
}

function getRouteProperties(): EventProperties {
  if (!isBrowser()) return {};

  return {
    path: window.location.pathname,
    search: window.location.search || undefined,
    title: document.title,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  };
}

export function trackAmplitudeEvent(eventName: string, eventProperties: EventProperties = {}) {
  if (!isBrowser() || !window.__clerktreeAmplitudeInitialized) return;

  const enrichedProperties = {
    ...getRouteProperties(),
    ...eventProperties,
  };

  if (!window.__clerktreeAmplitudeReady || !amplitudeClient) {
    queuedEvents = [...queuedEvents.slice(-(MAX_QUEUED_EVENTS - 1)), { name: eventName, properties: enrichedProperties }];
    return;
  }

  amplitudeClient.track(eventName, enrichedProperties);
}

function installInteractionTracking() {
  if (!isBrowser() || window.__clerktreeAmplitudeInteractionsInstalled) return;

  window.__clerktreeAmplitudeInteractionsInstalled = true;

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const actionable = target.closest<HTMLElement>('a, button, [role="button"], [data-analytics-event]');
      if (!actionable) return;

      const link = actionable instanceof HTMLAnchorElement ? actionable : actionable.closest<HTMLAnchorElement>('a');
      const label = getElementLabel(actionable);
      const href = link?.getAttribute('href') || undefined;
      const eventOverride = actionable.getAttribute('data-analytics-event');
      const isCta =
        actionable.matches('[data-analytics-cta]') ||
        /demo|book|login|contact|submit|send|dashboard|apply|start/i.test(label || '');

      trackAmplitudeEvent(eventOverride || (isCta ? 'cta_click' : 'ui_click'), {
        label,
        href,
        element_type: actionable.tagName.toLowerCase(),
        external: href ? /^https?:\/\//i.test(href) && !href.includes(window.location.hostname) : undefined,
      });
    },
    { capture: true },
  );

  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      trackAmplitudeEvent('form_submit', {
        form_id: form.id || undefined,
        form_name: form.getAttribute('name') || form.getAttribute('aria-label') || undefined,
        action: form.getAttribute('action') || undefined,
      });
    },
    { capture: true },
  );

  document.addEventListener(
    'play',
    (event) => {
      const media = event.target;
      if (!(media instanceof HTMLMediaElement)) return;

      trackAmplitudeEvent('media_play', {
        media_type: media.tagName.toLowerCase(),
        src: media.currentSrc || media.getAttribute('src') || undefined,
      });
    },
    { capture: true },
  );
}

export function trackPageView() {
  trackAmplitudeEvent('page_view');
}

function loadAmplitude() {
  if (!amplitudeImportPromise) {
    amplitudeImportPromise = import('@amplitude/unified');
  }

  return amplitudeImportPromise;
}

function flushQueuedEvents() {
  if (!amplitudeClient || !queuedEvents.length) return;

  for (const event of queuedEvents) {
    amplitudeClient.track(event.name, event.properties);
  }
  queuedEvents = [];
}

export function initAmplitude() {
  if (!isBrowser() || window.__clerktreeAmplitudeInitialized) return;

  window.__clerktreeAmplitudeInitialized = true;
  window.__clerktreeAmplitudeReady = false;

  const startAmplitude = () => {
    loadAmplitude()
      .then(async (amplitude) => {
        amplitudeClient = amplitude;
        await amplitude.initAll(AMPLITUDE_API_KEY, {
          serverZone: 'EU',
          analytics: { autocapture: true },
          sessionReplay: { sampleRate: 1 },
        });
        window.__clerktreeAmplitudeReady = true;
        flushQueuedEvents();
      })
      .catch((error) => {
        window.__clerktreeAmplitudeInitialized = false;
        window.__clerktreeAmplitudeReady = false;
        amplitudeClient = null;
        queuedEvents = [];
        console.warn('Amplitude failed to initialize', error);
      });
  };

  window.setTimeout(startAmplitude, 0);

  installInteractionTracking();
}
