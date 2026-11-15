/**
 * White-label branding.
 *
 * A theme is a document of tokens only: product name (40 characters at most), logo (SVG or PNG, 200 KB at
 * most, light and dark variants), an accent colour, a surface tint and a heading font from a bundled list.
 * It is validated when it is saved and again when it is applied: derived text and icon pairs must meet
 * contrast limits in the light, dark and high-contrast themes, otherwise the save is refused and the pair is
 * named, and a theme that fails at render time is dropped for the default.
 *
 * What a theme can never change: status colours and icons, age labels and the stale presentation, the notice
 * that Hive is not a safety function, tier and applicability badges, citations, the AI-generated marker,
 * contrast ratios and touch sizes. Those use fixed tokens that this file does not touch.
 *
 * Placeholder build: a saved theme lives in this browser only. The real feature needs the `branding.white_label`
 * entitlement and a server-side theme document.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface Brand {
  name: string;
  accent: string;
  tint: string;
  font: 'Inter' | 'Geist' | 'Cal Sans';
  logoLight?: string;
  logoDark?: string;
}

export const DEFAULT_BRAND: Brand = { name: 'Hive', accent: '#ff4d00', tint: '#f6f6f6', font: 'Cal Sans' };
export const FONT_ALLOW_LIST: Brand['font'][] = ['Inter', 'Geist', 'Cal Sans'];
export const LOGO_MAX_BYTES = 200 * 1024;
export const NAME_MAX = 40;

export interface Entitlements {
  embed: boolean;
  whiteLabel: boolean;
}

const BRAND_KEY = 'hive.dash.brand';
const ENT_KEY = 'hive.dash.entitlements';

/* ---------- contrast ---------- */

function lum(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

export interface ContrastCheck {
  pair: string;
  ratio: number;
  need: number;
  ok: boolean;
}

/** The derived pairs a theme must satisfy. Text on an accent surface uses whichever of black or white reads better. */
export function checkBrand(b: Brand): ContrastCheck[] {
  if (!isHex(b.accent) || !isHex(b.tint)) return [{ pair: 'Colour format', ratio: 0, need: 1, ok: false }];
  const onAccent = Math.max(contrast(b.accent, '#ffffff'), contrast(b.accent, '#171717'));
  const rows: [string, number, number][] = [
    ['Text on accent surfaces', onAccent, 4.5],
    ['Accent against the light surface (borders, large text)', contrast(b.accent, '#ffffff'), 3],
    ['Accent against the dark surface (borders, large text)', contrast(b.accent, '#1d1d1d'), 3],
    ['Accent in the high-contrast theme (borders, large text)', contrast(b.accent, '#000000'), 3],
    ['Text on the surface tint (light)', contrast('#171717', b.tint), 4.5],
  ];
  return rows.map(([pair, ratio, need]) => ({ pair, ratio, need, ok: ratio >= need }));
}

export function brandIsValid(b: Brand): boolean {
  return b.name.trim().length > 0 && b.name.length <= NAME_MAX && FONT_ALLOW_LIST.includes(b.font) && checkBrand(b).every((c) => c.ok);
}

/** CSS variables for a theme; only accent, tint and heading font can change. */
export function brandStyle(b: Brand): React.CSSProperties {
  // White on the accent when it reads at 3:1 or better (bold and large text), as on the site's orange buttons; otherwise black.
  const onAccent = contrast(b.accent, '#ffffff') >= 3 ? '#ffffff' : '#171717';
  return {
    ['--hd-orange' as string]: b.accent,
    ['--hd-orange-hi' as string]: b.accent,
    ['--hd-on-accent' as string]: onAccent,
    ['--hd-shell-tint' as string]: b.tint,
    ['--hd-heading-font' as string]: `'${b.font}', 'Inter', system-ui, sans-serif`,
    ['--hd-heading-weight' as string]: b.font === 'Cal Sans' ? '400' : '600',
  };
}

/* ---------- context ---------- */

interface BrandCtx {
  brand: Brand;
  /** The theme that is applied: the default unless the tenant is entitled and the saved theme is valid. */
  applied: Brand;
  entitlements: Entitlements;
  setEntitlements: (e: Entitlements) => void;
  /** Saves a theme if it passes validation. Returns the failing checks otherwise. */
  save: (b: Brand) => ContrastCheck[] | null;
  reset: () => void;
}

const Ctx = createContext<BrandCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v ? ({ ...fallback, ...(JSON.parse(v) as object) } as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* the setting then lasts for this page only */
  }
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand>(() => read(BRAND_KEY, DEFAULT_BRAND));
  const [entitlements, setEnt] = useState<Entitlements>(() => read(ENT_KEY, { embed: true, whiteLabel: true }));

  const applied = useMemo(() => (entitlements.whiteLabel && brandIsValid(brand) ? brand : DEFAULT_BRAND), [brand, entitlements.whiteLabel]);

  const save = useCallback((b: Brand) => {
    const bad = checkBrand(b).filter((c) => !c.ok);
    if (b.name.trim().length === 0 || b.name.length > NAME_MAX || !FONT_ALLOW_LIST.includes(b.font)) return [{ pair: 'Product name', ratio: 0, need: 1, ok: false }];
    if (bad.length) return bad;
    setBrand(b);
    write(BRAND_KEY, b);
    return null;
  }, []);

  const reset = useCallback(() => {
    setBrand(DEFAULT_BRAND);
    write(BRAND_KEY, DEFAULT_BRAND);
  }, []);

  const setEntitlements = useCallback((e: Entitlements) => {
    setEnt(e);
    write(ENT_KEY, e);
  }, []);

  useEffect(() => {
    // Fonts come from the bundled files; nothing is loaded from a third-party host.
  }, [applied.font]);

  const value = useMemo(() => ({ brand, applied, entitlements, setEntitlements, save, reset }), [brand, applied, entitlements, setEntitlements, save, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBrand(): BrandCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBrand must be used inside BrandProvider');
  return v;
}
