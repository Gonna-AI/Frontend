/**
 * Device performance tiers and frame pacing.
 *
 * The site's motion (WebGL backgrounds, the Hive scene, the footer text video) is the same on every
 * device; what changes is how much of the machine it asks for. A fast device gets everything at full
 * rate. A slow one gets the same picture at a lower internal resolution and a steadier frame rate,
 * and effects that only decorate stand still while the page is being scrolled, so scrolling itself
 * is never the thing that stutters.
 *
 *   high  full resolution, native frame rate
 *   mid   internal resolution up to 1.25x, 30 fps, decorative effects rest during scroll
 *   low   internal resolution 1x, 24 fps, decorative effects rest during scroll, no blur reveals
 *
 * The starting tier comes from what the device reports; it is then corrected by measurement: if frames
 * keep arriving late while an effect is running, the tier steps down for the rest of the visit.
 */

export type Tier = 'high' | 'mid' | 'low';

const ORDER: Tier[] = ['high', 'mid', 'low'];
const listeners = new Set<(tier: Tier) => void>();

function detectTier(): Tier {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'high';

  // ?perf=low|mid|high forces a tier, to check the lower ones on a fast machine.
  const forced = new URLSearchParams(window.location.search).get('perf');
  if (forced === 'low' || forced === 'mid' || forced === 'high') return forced;

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8; // not reported by Safari/Firefox: assume capable
  if (nav.connection?.saveData || memory <= 2 || cores <= 2) return 'low';
  const touch = window.matchMedia('(pointer: coarse)').matches;
  if (memory <= 4 || (cores <= 4 && touch)) return 'mid';
  return 'high';
}

let tier: Tier = detectTier();

function applyTier() {
  if (typeof document !== 'undefined') document.documentElement.dataset.perf = tier;
}
applyTier();

export function getTier(): Tier {
  return tier;
}

export function onTierChange(listener: (tier: Tier) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setTier(next: Tier) {
  if (next === tier) return;
  tier = next;
  applyTier();
  listeners.forEach((listener) => listener(tier));
}

/** Internal render resolution for a canvas: never above what the screen can show, lower on weaker tiers. */
export function pixelRatioFor(highTierCap: number, caps: { mid: number; low: number } = { mid: 1.25, low: 1 }): number {
  const device = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  // The defaults suit fine film grain, which turns blocky below about 1 pixel per CSS pixel. Content
  // that is built from large cells (the Hive glyph grid) can go lower without any visible change.
  const cap = tier === 'high' ? highTierCap : Math.min(highTierCap, tier === 'mid' ? caps.mid : caps.low);
  return Math.min(device, cap);
}

/** Minimum milliseconds between redraws of a continuously animated canvas. */
export function frameInterval(): number {
  return tier === 'high' ? 0 : tier === 'mid' ? 1000 / 30 : 1000 / 24;
}

/** Decorative animation (background gradients, text video) rests while the page scrolls on weaker tiers. */
export function shouldRestDuringScroll(): boolean {
  return tier !== 'high';
}

let lastScroll = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { lastScroll = performance.now(); }, { passive: true, capture: true });
}

/** True while the page is being scrolled (and for a moment after). */
export function isScrolling(): boolean {
  return performance.now() - lastScroll < 140;
}

// ---- Measurement ---------------------------------------------------------------------------

const LATE_FRAME_MS = 34; // average slower than about 30 fps
const SAMPLES_NEEDED = 45;
let average = 16.7;
let lateSamples = 0;
let lastStep = performance.now();
const startedAt = performance.now();

/**
 * Feed the time between two animation frames (milliseconds) from any loop that is running.
 * Sustained lateness steps the tier down; it never steps back up, so quality does not flicker.
 */
export function reportFrame(deltaMs: number) {
  const now = performance.now();
  // Ignore the first moments (page start-up is busy by nature) and tab switches (huge gaps).
  if (now - startedAt < 1500 || deltaMs > 120 || document.hidden || tier === 'low') return;

  average = average * 0.9 + deltaMs * 0.1;
  lateSamples = average > LATE_FRAME_MS ? lateSamples + 1 : 0;

  if (lateSamples >= SAMPLES_NEEDED && now - lastStep > 2500) {
    lastStep = now;
    lateSamples = 0;
    average = 16.7;
    setTier(ORDER[ORDER.indexOf(tier) + 1]);
  }
}
