/**
 * Translation catalogue, split into bundles so each visitor downloads only
 * what their pages need:
 *   - "site": the public website (English ships with the app as the fallback,
 *     German is fetched when selected);
 *   - "dashboard": the signed-in workspace, fetched with the dashboard.
 */
import { en } from './en';

export type Language = 'en' | 'de';
export type Bundle = 'site' | 'dashboard';
type Dictionary = Record<string, string>;

const LANGUAGE_STORAGE_KEY = 'app-language';
// English is what the prerendered pages (and so search engines and the first paint) are written in.
const DEFAULT_LANGUAGE: Language = 'en';

const loaders: Record<Bundle, Record<Language, () => Promise<Dictionary>>> = {
  site: {
    en: async () => en,
    de: async () => (await import('./de')).de,
  },
  dashboard: {
    en: async () => (await import('./en/dashboard')).enDashboard,
    de: async () => (await import('./de/dashboard')).deDashboard,
  },
};

const dictionaries: Record<Language, Dictionary> = { en: { ...en }, de: {} };
const loaded = new Set<string>(['site:en']);
const pending = new Map<string, Promise<void>>();

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'de';
}

/** German browsers get German; every other browser gets English. */
function languageFromBrowser(): Language {
  const preferred = [...(navigator.languages ?? []), navigator.language].find((tag) => /^(de|en)(-|$)/i.test(tag ?? ''));
  return preferred?.toLowerCase().startsWith('de') ? 'de' : DEFAULT_LANGUAGE;
}

/** Explicit ?lang= wins, then the visitor's saved choice, then the browser's language. */
export function resolveInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const fromUrl = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(fromUrl)) return fromUrl;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage blocked: fall through to the browser's language.
  }
  return languageFromBrowser();
}

export function rememberLanguage(language: Language) {
  document.documentElement.lang = language;
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Storage blocked: the choice lasts for this page view.
  }
}

export function isBundleLoaded(bundle: Bundle, language: Language) {
  return loaded.has(`${bundle}:${language}`);
}

/** Fetches a bundle once; concurrent callers share the same request. */
export function loadBundle(bundle: Bundle, language: Language): Promise<void> {
  const id = `${bundle}:${language}`;
  if (loaded.has(id)) return Promise.resolve();

  let request = pending.get(id);
  if (!request) {
    request = loaders[bundle][language]()
      .then((dictionary) => {
        Object.assign(dictionaries[language], dictionary);
        loaded.add(id);
      })
      .finally(() => pending.delete(id));
    pending.set(id, request);
  }
  return request;
}

/** Looks a key up in the active language, then English, then returns the key itself. */
export function translate(language: Language, key: string): string {
  return dictionaries[language][key] || dictionaries.en[key] || key;
}
