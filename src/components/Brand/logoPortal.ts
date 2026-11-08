// "Pull" portal intro for the header logo mark (logo lab variant 9).
// Light-speed streaks are pulled into a spinning orange portal, the C mark
// whirls out of it, and the portal collapses into the eye. The wordmark never
// moves. Pure SVG + rAF, works on the ClerkTreeLockup markup:
//   .ct-lockup-mark (mark group, mark coordinates) > .ct-lockup-ring (C, masked)
//   mask > .ct-lockup-dot (the eye cut-out)

const NS = 'http://www.w3.org/2000/svg';
const RING = { cx: 239.49, cy: 264.65, r: 203.23 };
const EYE = { x: 301.97, y: 181.84, r: 27.74 };
const ORANGE = '#FF4D00';
const DURATION = 1900;
const STREAKS = 36;

const running = new WeakSet<SVGSVGElement>();
let uid = 0;

function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 8; i++) {
      const cx = 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3 - x;
      const dx = 3 * x1 * (1 - u) ** 2 + 6 * (x2 - x1) * u * (1 - u) + 3 * (1 - x2) * u * u;
      if (Math.abs(cx) < 1e-6 || !dx) break;
      u -= cx / dx;
    }
    return 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
  };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const open = bezier(0.16, 1, 0.3, 1);
const shut = bezier(0.7, 0, 0.84, 0);
const emerge = bezier(0.2, 0.9, 0.3, 1);
const pull = bezier(0.55, 0, 0.9, 0.45);
const rand = (i: number) => ((Math.sin(i * 57.3) * 9301.7) % 1 + 1) % 1;

function make<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) {
  const node = document.createElementNS(NS, tag);
  for (const key in attrs) node.setAttribute(key, String(attrs[key]));
  parent.appendChild(node);
  return node;
}

const rotateAbout = (deg: number, k: number) =>
  `rotate(${deg} ${RING.cx} ${RING.cy}) translate(${RING.cx} ${RING.cy}) scale(${k}) translate(${-RING.cx} ${-RING.cy})`;

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Plays the portal intro on a ClerkTreeLockup SVG. Ignored while already playing or under reduced motion. */
export function playLogoPortal(svg: SVGSVGElement | null | undefined) {
  if (!svg || running.has(svg) || prefersReducedMotion()) return;
  const mark = svg.querySelector<SVGGElement>('.ct-lockup-mark');
  const ring = svg.querySelector<SVGPathElement>('.ct-lockup-ring');
  const hole = svg.querySelector<SVGPathElement>('.ct-lockup-dot');
  if (!mark || !ring) return;
  running.add(svg);

  const id = `ct-portal-${uid++}`;
  const defs = make('defs', {}, svg);
  const blur = (name: string, sd: number) => {
    const filter = make('filter', { id: `${id}-${name}`, x: '-80%', y: '-80%', width: '260%', height: '260%', 'color-interpolation-filters': 'sRGB' }, defs);
    return make('feGaussianBlur', { stdDeviation: sd }, filter);
  };
  blur('glow', 40);
  const ringBlur = blur('ring', 0);

  const fx = make('g', { 'aria-hidden': 'true' }, mark);
  const circle = (attrs: Record<string, string | number>) =>
    make('circle', { cx: RING.cx, cy: RING.cy, r: 0, fill: 'none', ...attrs }, fx);
  const glow = circle({ stroke: ORANGE, 'stroke-width': 110, filter: `url(#${id}-glow)` });
  const rim = circle({ stroke: ORANGE, 'stroke-width': 10 });
  const dashes = circle({ stroke: ORANGE, 'stroke-width': 8, 'stroke-dasharray': '10 34', 'stroke-linecap': 'round' });
  const streaks = Array.from({ length: STREAKS }, (_, i) => ({
    angle: (i / STREAKS) * Math.PI * 2 + rand(i) * 0.3,
    delay: rand(i + 3) * 0.14,
    length: 400 + rand(i + 5) * 700,
    line: make('line', {
      stroke: i % 3 ? 'currentColor' : ORANGE,
      'stroke-width': 8 + rand(i + 8) * 12,
      'stroke-linecap': 'round',
      opacity: 0,
    }, fx),
  }));

  ring.setAttribute('filter', `url(#${id}-ring)`);
  const start = performance.now();

  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION);
    const o = open(seg(t, 0, 0.3));
    const c = shut(seg(t, 0.62, 0.9));
    const cx = RING.cx + (EYE.x - RING.cx) * c;
    const cy = RING.cy + (EYE.y - RING.cy) * c;
    const radius = RING.r * 1.45 * o;
    const r = Math.max(0, radius + (EYE.r * 0.9 - radius) * c);

    for (const node of [glow, rim, dashes]) {
      node.setAttribute('cx', String(cx));
      node.setAttribute('cy', String(cy));
      node.setAttribute('r', String(r));
    }
    glow.setAttribute('opacity', String(0.9 * (1 - seg(t, 0.85, 1))));
    rim.setAttribute('opacity', String(1 - seg(t, 0.9, 1)));
    rim.setAttribute('stroke-width', String(10 + 18 * c));
    dashes.setAttribute('transform', `rotate(${t * 900} ${cx} ${cy})`);
    dashes.setAttribute('opacity', String(1 - c));

    for (const s of streaks) {
      const k = pull(seg(t, s.delay, s.delay + 0.42));
      const head = r * 0.95 + (2600 - r * 0.95) * (1 - k);
      const tail = head + s.length * (1 - k * 0.9);
      s.line.setAttribute('x1', String(cx + Math.cos(s.angle) * head));
      s.line.setAttribute('y1', String(cy + Math.sin(s.angle) * head));
      s.line.setAttribute('x2', String(cx + Math.cos(s.angle) * tail));
      s.line.setAttribute('y2', String(cy + Math.sin(s.angle) * tail));
      s.line.setAttribute('opacity', String(k > 0 && k < 1 ? 0.2 + 0.8 * k : 0));
    }

    const e = emerge(seg(t, 0.18, 0.7));
    ring.setAttribute('transform', rotateAbout(-720 * (1 - e), 0.15 + 0.85 * e));
    ring.setAttribute('opacity', String(seg(t, 0.18, 0.3)));
    ringBlur.setAttribute('stdDeviation', String(16 * (1 - e)));
    hole?.setAttribute('opacity', String(seg(t, 0.9, 1)));

    if (t < 1) {
      requestAnimationFrame(frame);
      return;
    }
    fx.remove();
    defs.remove();
    ring.removeAttribute('filter');
    ring.removeAttribute('transform');
    ring.removeAttribute('opacity');
    hole?.removeAttribute('opacity');
    running.delete(svg);
  };
  requestAnimationFrame(frame);
}

const SESSION_KEY = 'ct-logo-portal';

/** True until the intro has played once in this browser session. */
export function shouldPlayFirstVisitIntro() {
  if (prefersReducedMotion()) return false;
  try {
    return !window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

/** Plays the intro and records it, so later pages in the session skip it. */
export function playFirstVisitIntro(svg: SVGSVGElement | null | undefined) {
  if (!shouldPlayFirstVisitIntro()) return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Storage blocked: the intro may replay on the next page, which is harmless.
  }
  playLogoPortal(svg);
}
