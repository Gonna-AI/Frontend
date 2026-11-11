/**
 * Visitor consent for optional technologies (TTDSG §25 / GDPR Art. 6(1)(a)).
 *
 * Nothing optional runs until the visitor opts in: analytics and embedded
 * third-party media both read their permission from here. The choice is kept
 * in localStorage (strictly necessary, so it needs no consent itself) and is
 * asked again after twelve months or when the categories change.
 */

export type ConsentCategory = 'analytics' | 'externalMedia';

export type ConsentRecord = Record<ConsentCategory, boolean> & {
  version: number;
  timestamp: string;
};

/** Bump when categories or their purposes change, so earlier choices are asked again. */
const CONSENT_VERSION = 2;
const STORAGE_KEY = 'clerktree_cookie_consent';
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const CHANGE_EVENT = 'clerktree:consent-change';
const OPEN_EVENT = 'clerktree:consent-open';

export function getConsent(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as Partial<ConsentRecord>;
    const age = Date.now() - new Date(stored.timestamp ?? 0).getTime();
    if (stored.version !== CONSENT_VERSION || !(age >= 0 && age < MAX_AGE_MS)) return null;

    return {
      version: CONSENT_VERSION,
      timestamp: stored.timestamp as string,
      analytics: stored.analytics === true,
      externalMedia: stored.externalMedia === true,
    };
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return getConsent()?.[category] === true;
}

export function saveConsent(choice: Record<ConsentCategory, boolean>): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    analytics: choice.analytics === true,
    externalMedia: choice.externalMedia === true,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }

  window.dispatchEvent(new CustomEvent<ConsentRecord>(CHANGE_EVENT, { detail: record }));
  return record;
}

/** Grant one category without touching the others (e.g. "load this map"). */
export function grantConsent(category: ConsentCategory): ConsentRecord {
  const current = getConsent();
  return saveConsent({
    analytics: current?.analytics ?? false,
    externalMedia: current?.externalMedia ?? false,
    [category]: true,
  });
}

export function onConsentChange(listener: (record: ConsentRecord) => void): () => void {
  const handler = (event: Event) => listener((event as CustomEvent<ConsentRecord>).detail);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** Reopen the settings dialog, e.g. from the footer link. */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onConsentSettingsRequest(listener: () => void): () => void {
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}
