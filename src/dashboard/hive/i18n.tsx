/**
 * Hive dashboard translations (German and English).
 *
 * How it works
 * - `t('English source text')` returns the German text from `de.ts` when German is active.
 *   A string missing from the catalog falls back to its English source and is reported once
 *   (`i18n.missing_key`: the key only, never user or plant data).
 * - Messages use `{name}` placeholders: `t('{n} open alarms', { n })`. Build user text with
 *   placeholders, never by concatenation, so German word order stays correct.
 * - Free text that comes from the API as data goes through `translateData`, never through the
 *   user's own input (user-entered text is not translated, and never sent to a translation service).
 * - Numbers, quantities, times and ages go through the formatters below, not toFixed or toLocaleString.
 *
 * Known deviation from the product spec: catalog keys are the English source strings rather than
 * `app.<module>.<screen>.<element>` keys, and plural forms use `tn()` with two messages instead of
 * ICU MessageFormat. Moving to the spec's key scheme is a mechanical follow-up.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { de } from './de';

export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];
const STORE_KEY = 'hive.dash.lang';
const TENANT_DEFAULT: Lang = 'de';

let current: Lang = 'en';
export const getLang = (): Lang => current;

const reported = new Set<string>();
/** German texts that were translated already (data text passed through t again is not a missing key). */
const deValues = new Set(Object.values(de));
/** Keys that were asked for in German but are missing from the catalog (dev tooling and metrics). */
export const missingKeys = (): string[] => [...reported];
if (import.meta.env.DEV && typeof window !== 'undefined') Object.assign(window, { __hiveMissing: missingKeys, __hiveCatalog: de });

function readStored(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v === 'de' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

/** Language order: ?lang= (displays and embeds), saved choice, device language, tenant default, de. */
export function resolveLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'de' || q === 'en') return q;
  } catch {
    /* no window */
  }
  const saved = readStored();
  if (saved) return saved;
  const device = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2).toLowerCase() : '';
  if (device === 'de' || device === 'en') return device;
  return TENANT_DEFAULT;
}

/* ---------- formatting ---------- */

const NBSP = ' ';
const MONTHS: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };

export function formatNumber(value: number, decimals = 1, lang: Lang = current): string {
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/** Value and unit with the locale decimal separator and a non-breaking space before the unit. */
export function formatQuantity(value: number, unit: string, decimals = 1, lang: Lang = current): string {
  const u = unit === '%' ? `${NBSP}%` : unit.startsWith('°') ? `${NBSP}${unit}` : `${NBSP}${unit}`;
  return `${formatNumber(value, decimals, lang)}${u}`;
}

/** A duration or state age: "21 min" / "21 Min.", "2 h" / "2 Std.". */
export function formatDuration(s: number, lang: Lang = current): string {
  const de = lang === 'de';
  if (s < 60) return `${Math.round(s)} s`;
  if (s < 3600) return `${Math.round(s / 60)} ${de ? 'Min.' : 'min'}`;
  if (s < 86400) return `${Math.round(s / 3600)} ${de ? 'Std.' : 'h'}`;
  return `${Math.round(s / 86400)} ${de ? 'T' : 'd'}`;
}

/** How old a value is: "4 s ago" / "vor 4 s". */
export function formatAgo(s: number, lang: Lang = current): string {
  return lang === 'de' ? `vor ${formatDuration(s, lang)}` : `${formatDuration(s, lang)} ago`;
}

/**
 * Turns the display formats of placeholder strings into German formats: dates (15 Nov, 2026 becomes
 * 15.11.2026), 24-hour times and decimal commas. English text is returned unchanged.
 */
export function localize(s: string, lang: Lang = current): string {
  if (lang !== 'de') return s;
  return s
    .replace(/(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),? (\d{4})/g, (_m, d: string, mo: string, y: string) => `${d.padStart(2, '0')}.${MONTHS[mo]}.${y}`)
    .replace(/(\d{1,2}):(\d{2}) (AM|PM)/g, (_m, h: string, mi: string, ap: string) => {
      let hh = parseInt(h, 10) % 12;
      if (ap === 'PM') hh += 12;
      return `${String(hh).padStart(2, '0')}:${mi}`;
    })
    .replace(/(\d+) (s|min|h|d) ago/g, (_m, n: string, u: string) => `vor ${n} ${u === 'min' ? 'Min.' : u === 'h' ? 'Std.' : u === 'd' ? 'T' : 's'}`)
    .replace(/\b\d{1,3}(?:,\d{3})+\b/g, (m) => m.replace(/,/g, '.'))
    .replace(/(?<![\d.,])(\d+)\.(\d+)(?![\d.])/g, '$1,$2');
}

/* ---------- translate ---------- */

function fill(msg: string, vars?: Record<string, string | number>): string {
  if (!vars) return msg;
  return msg.replace(/\{(\w+)\}/g, (_m, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export type TFn = (key: string, vars?: Record<string, string | number>) => string;
export type TnFn = (n: number, one: string, other: string, vars?: Record<string, string | number>) => string;

function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  if (lang === 'en') return fill(key, vars);
  const hit = de[key];
  if (hit === undefined) {
    if (deValues.has(key)) return fill(key, vars);
    if (!reported.has(key)) {
      reported.add(key);
      if (import.meta.env.DEV) console.warn(`[i18n.missing_key] ${key}`);
    }
    return fill(localize(key, lang), vars);
  }
  return fill(hit, vars);
}

/** Data strings (free text from the API): catalog hit or formatted pass-through, never reported. */
export function translateData(s: string, lang: Lang = current): string {
  if (lang === 'en') return s;
  return de[s] ?? localize(s, lang);
}

interface LangCtx {
  lang: Lang;
  /** Pass `{ persist: false }` for a one-off choice (a display's ?lang=) that must not become the saved preference. */
  setLang: (l: Lang, opts?: { persist?: boolean }) => void;
}
const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => undefined });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => resolveLang());
  current = lang;

  const setLang = useCallback((l: Lang, opts?: { persist?: boolean }) => {
    setLangState(l);
    if (opts?.persist === false) return;
    try {
      window.localStorage.setItem(STORE_KEY, l);
    } catch {
      /* the choice then lasts for this page only */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = (): LangCtx => useContext(Ctx);

/** The translate function for the active language. Re-renders the caller when the language changes. */
export function useT(): TFn {
  const { lang } = useContext(Ctx);
  return useCallback((key, vars) => translate(lang, key, vars), [lang]);
}

/** Plural helper: picks the one or other message by count and fills `{n}`. */
export function useTn(): TnFn {
  const { lang } = useContext(Ctx);
  return useCallback((n, one, other, vars) => translate(lang, n === 1 ? one : other, { n, ...vars }), [lang]);
}
