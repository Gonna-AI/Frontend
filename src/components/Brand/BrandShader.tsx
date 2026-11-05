import { lazy, Suspense, useEffect, useRef, useState } from 'react';

/*
 * BrandShader — the animated grain-gradient behind dark hero boxes.
 *
 * Rendered live on the GPU (WebGL via @paper-design/shaders), so there is no
 * video to download. Cost controls:
 *   - the shader code is code-split and only fetched when a box nears the viewport
 *   - it stops animating while off-screen (speed 0 keeps the last frame)
 *   - prefers-reduced-motion gets a single still frame
 *   - pixel count is capped so large/retina screens don't render 4K
 * The element underneath keeps its CSS gradient, which doubles as the fallback:
 * without WebGL the shader canvas stays transparent and the gradient shows.
 */

const GrainGradient = lazy(() => import('./BrandShaderCanvas'));

type Variant = 'stage' | 'ember';

const VARIANTS: Record<Variant, {
  colorBack: string;
  colors: string[];
  softness: number;
  intensity: number;
  noise: number;
  shape: 'corners' | 'wave' | 'blob';
  speed: number;
  scale: number;
}> = {
  // Graphite light drifting across black, a whisper of signal orange.
  stage: {
    colorBack: '#050505',
    colors: ['#101010', '#262626', '#3a3a3a', '#3b1a0b'],
    softness: 1,
    intensity: 0.22,
    noise: 0.38,
    shape: 'corners',
    speed: 0.3,
    scale: 1.2,
  },
  // Warmer: more orange, for a single emphasis moment.
  ember: {
    colorBack: '#050505',
    colors: ['#161616', '#2e2e2e', '#6a2a0e', '#1f1f1f'],
    softness: 0.85,
    intensity: 0.35,
    noise: 0.3,
    shape: 'blob',
    speed: 0.3,
    scale: 1.1,
  },
};

const MAX_PIXELS = 1_400_000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}

export default function BrandShader({ variant = 'stage', className = '' }: { variant?: Variant; className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === 'undefined') return undefined;

    // Start loading well before the box scrolls in, then track visibility to pause.
    const prefetch = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          prefetch.disconnect();
        }
      },
      { rootMargin: '150% 0px' },
    );
    const onScreen = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0 });

    prefetch.observe(host);
    onScreen.observe(host);
    return () => {
      prefetch.disconnect();
      onScreen.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    // Let the first frame paint before fading in, so the box never flashes.
    const timer = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(timer);
  }, [mounted]);

  const preset = VARIANTS[variant];
  const speed = reducedMotion || !visible ? 0 : preset.speed;

  return (
    <div ref={hostRef} className={`brand-shader${ready ? ' is-ready' : ''} ${className}`} aria-hidden="true">
      {mounted && (
        <Suspense fallback={null}>
          <GrainGradient
            className="brand-shader-canvas"
            width="100%"
            height="100%"
            colorBack={preset.colorBack}
            colors={preset.colors}
            softness={preset.softness}
            intensity={preset.intensity}
            noise={preset.noise}
            shape={preset.shape}
            scale={preset.scale}
            speed={speed}
            frame={reducedMotion ? 4200 : undefined}
            maxPixelCount={MAX_PIXELS}
            minPixelRatio={1}
          />
        </Suspense>
      )}
    </div>
  );
}
