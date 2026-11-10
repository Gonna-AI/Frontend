import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  isBundleLoaded,
  loadBundle,
  rememberLanguage,
  resolveInitialLanguage,
  translate,
  type Bundle,
  type Language,
} from '../i18n';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
  /** Makes a bundle available in the active language (and keeps it loaded across language switches). */
  requireBundle: (bundle: Bundle) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * The initial language's strings are loaded by main.tsx before the first
 * render, so the page never paints in one language and flips to another.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(resolveInitialLanguage);
  // Bumped whenever new strings arrive, so consumers re-render with them.
  const [revision, setRevision] = useState(0);
  const activeBundles = useRef(new Set<Bundle>(['site']));

  useEffect(() => {
    rememberLanguage(language);
    // Covers the rare start where the preload in main.tsx failed (offline, blocked chunk).
    if (!isBundleLoaded('site', language)) {
      loadBundle('site', language).then(() => setRevision((value) => value + 1)).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    try {
      await Promise.all([...activeBundles.current].map((bundle) => loadBundle(bundle, next)));
    } catch {
      return; // Keep the current language rather than show untranslated keys.
    }
    rememberLanguage(next);
    setLanguageState(next);
    window.dispatchEvent(new CustomEvent('language-change', { detail: next }));
  }, []);

  const requireBundle = useCallback(
    async (bundle: Bundle) => {
      activeBundles.current.add(bundle);
      const wanted = language === 'en' ? [loadBundle(bundle, 'en')] : [loadBundle(bundle, 'en'), loadBundle(bundle, language)];
      await Promise.all(wanted);
      setRevision((value) => value + 1);
    },
    [language],
  );

  const value = useMemo<LanguageContextType>(
    () => ({ language, setLanguage, requireBundle, t: (key: string) => translate(language, key) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language, revision, setLanguage, requireBundle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

/** Renders its children once a translation bundle is ready, e.g. the workspace strings around the dashboard. */
export function TranslationBundle({ name, fallback = null, children }: { name: Bundle; fallback?: ReactNode; children: ReactNode }) {
  const { language, requireBundle } = useLanguage();
  const ready = isBundleLoaded(name, 'en') && isBundleLoaded(name, language);

  useEffect(() => {
    if (!ready) requireBundle(name).catch(() => undefined);
  }, [name, ready, requireBundle]);

  return <>{ready ? children : fallback}</>;
}
