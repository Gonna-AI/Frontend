// Grainient: animated warped gradient with film grain. WebGL2, no dependencies. Renders a canvas that
// fills its positioned parent; animates only while on screen; draws one still
// frame under reduced motion; hides itself if WebGL2 is unavailable so the
// parent's CSS gradient shows instead.
//
// All instances share ONE WebGL context. Each one owns an ordinary 2D canvas that the shared renderer
// paints into. That has two consequences that matter on phones: browsers allow only a handful of live
// WebGL contexts (the oldest is dropped when the limit is hit, which used to blank backgrounds that had
// already been seen), and every section scrolled past keeps its last picture in its own canvas, so
// scrolling back always shows exactly what was there, with nothing to re-render.
import { useEffect, useRef } from 'react';

import { cancelIdle, runWhenIdle } from '../../utils/idle';
import { decorPaused, frameInterval, onTierChange, pixelRatioFor, reportFrame } from '../../utils/perf';

type Settings = {
  uTimeSpeed: number; uColorBalance: number; uWarpStrength: number; uWarpFrequency: number;
  uWarpSpeed: number; uWarpAmplitude: number; uBlendAngle: number; uBlendSoftness: number;
  uRotationAmount: number; uNoiseScale: number; uGrainAmount: number; uGrainScale: number;
  uGrainAnimated: number; uContrast: number; uGamma: number; uSaturation: number; uZoom: number;
};

const BASE: Settings = {
  uTimeSpeed: 1.6, uColorBalance: -0.4, uWarpStrength: 1, uWarpFrequency: 3.9,
  uWarpSpeed: 2, uWarpAmplitude: 50, uBlendAngle: -47, uBlendSoftness: 0.47,
  uRotationAmount: 500, uNoiseScale: 1.1, uGrainAmount: 0.1, uGrainScale: 2,
  uGrainAnimated: 0, uContrast: 1.5, uGamma: 1, uSaturation: 1, uZoom: 0.9,
};

const GRAINIENT_PRESETS = {
  silver: { colors: ['#1a1919', '#939393', '#f8f8f8'], settings: {} },
  // Dark panels: deep base with a soft silver light drifting through it.
  black: {
    colors: ['#6e6e70', '#0b0b0b', '#2c2c2e'],
    settings: { uTimeSpeed: 1.3, uColorBalance: 0.3, uWarpFrequency: 6, uContrast: 1.2 },
  },
  footer: {
    colors: ['#777779', '#161618', '#343436'],
    settings: { uTimeSpeed: 0.6, uColorBalance: -0.1, uWarpFrequency: 5, uContrast: 1.05, uGrainAmount: 0.13 },
  },
} as const;

type GrainientPreset = keyof typeof GRAINIENT_PRESETS;

const VERTEX = `#version 300 es
const vec2 P[3]=vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
void main(){gl_Position=vec4(P[gl_VertexID],0.,1.);}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 iResolution;uniform float iTime;
uniform float uTimeSpeed,uColorBalance,uWarpStrength,uWarpFrequency,uWarpSpeed,uWarpAmplitude,
uBlendAngle,uBlendSoftness,uRotationAmount,uNoiseScale,uGrainAmount,uGrainScale,uGrainAnimated,
uContrast,uGamma,uSaturation,uZoom;
uniform vec3 uColor1,uColor2,uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
float n=mix(mix(dot(-1.+2.*hash(i),f),dot(-1.+2.*hash(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),
mix(dot(-1.+2.*hash(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(-1.+2.*hash(i+vec2(1.,1.)),f-vec2(1.,1.)),u.x),u.y);return .5+.5*n;}
void main(){
 vec2 C=gl_FragCoord.xy;float t=iTime*uTimeSpeed;vec2 uv=C/iResolution.xy;float ratio=iResolution.x/iResolution.y;
 vec2 tuv=(uv-.5)/max(uZoom,.001);
 float degree=noise(vec2(t*.1,tuv.x*tuv.y)*uNoiseScale);
 tuv.y*=1./ratio;tuv*=Rot(radians((degree-.5)*uRotationAmount+180.));tuv.y*=ratio;
 float amplitude=uWarpAmplitude/max(uWarpStrength,.001);float wt=t*uWarpSpeed;
 tuv.x+=sin(tuv.y*uWarpFrequency+wt)/amplitude;tuv.y+=sin(tuv.x*(uWarpFrequency*1.5)+wt)/(amplitude*.5);
 float b=uColorBalance,s=max(uBlendSoftness,0.);float bx=(tuv*Rot(radians(uBlendAngle))).x;
 float e0=-.3-b-s,e1=.2-b+s,v0=.5-b+s,v1=-.3-b-s;
 vec3 l1=mix(uColor3,uColor2,S(e0,e1,bx));vec3 l2=mix(uColor2,uColor1,S(e0,e1,bx));
 vec3 col=mix(l1,l2,S(v0,v1,tuv.y));
 vec2 g=uv*max(uGrainScale,.001);if(uGrainAnimated>.5){g+=vec2(iTime*.05);}
 float grain=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);
 col+=(grain-.5)*uGrainAmount;col=(col-.5)*uContrast+.5;
 float luma=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(luma),col,uSaturation);
 col=pow(max(col,0.),vec3(1./max(uGamma,.001)));fragColor=vec4(clamp(col,0.,1.),1.);
}`;

const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);

type GrainientProps = {
  preset?: GrainientPreset;
  /** Draw one frame and stop. */
  still?: boolean;
  className?: string;
};

// ---- The shared renderer ----------------------------------------------------------------------

type Shared = {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  uTime: WebGLUniformLocation | null;
  uRes: WebGLUniformLocation | null;
  appliedPreset: string;
};

const MAX_SIDE = 4096;
let shared: Shared | null = null;
let state: 'idle' | 'compiling' | 'ready' | 'failed' = 'idle';
const waiting = new Set<(ok: boolean) => void>();

function settle(ok: boolean) {
  waiting.forEach((callback) => callback(ok));
  waiting.clear();
}

function startRenderer() {
  if (state !== 'idle') return;
  state = 'compiling';

  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) { state = 'failed'; settle(false); return; }

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // Status is not read here: asking makes the browser wait for the compiler. A failure shows up as a
    // failed link below, once compiling has finished in the background.
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);

  // With KHR_parallel_shader_compile the browser compiles on another thread, so scrolling carries on.
  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const finish = () => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { state = 'failed'; settle(false); return; }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());
    shared = { canvas, gl, program, uTime: gl.getUniformLocation(program, 'iTime'), uRes: gl.getUniformLocation(program, 'iResolution'), appliedPreset: '' };
    state = 'ready';
    settle(true);
  };
  const poll = () => {
    if (!parallel || gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) finish();
    else window.setTimeout(poll, 16);
  };
  poll();

  // If the browser drops the context, every instance keeps the picture it already has; the renderer
  // is rebuilt the next time one of them needs a new frame.
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    shared = null;
    state = 'idle';
  });
}

/** Calls back once the shared renderer is ready (or known to be unavailable). */
function whenRenderer(callback: (ok: boolean) => void) {
  if (state === 'ready') { callback(true); return; }
  if (state === 'failed') { callback(false); return; }
  waiting.add(callback);
  startRenderer();
}

/** Paints one frame of a preset into a 2D canvas. Returns false if there is no renderer right now. */
function renderInto(target: CanvasRenderingContext2D, width: number, height: number, preset: GrainientPreset, time: number): boolean {
  if (state === 'idle') startRenderer();
  if (!shared || state !== 'ready') return false;
  const { gl, canvas, program } = shared;

  if (canvas.width < width || canvas.height < height) {
    canvas.width = Math.min(MAX_SIDE, Math.max(canvas.width, width));
    canvas.height = Math.min(MAX_SIDE, Math.max(canvas.height, height));
  }
  gl.viewport(0, 0, width, height);

  if (shared.appliedPreset !== preset) {
    shared.appliedPreset = preset;
    const { colors, settings } = GRAINIENT_PRESETS[preset];
    const values: Settings = { ...BASE, ...settings };
    (Object.keys(values) as (keyof Settings)[]).forEach((name) => gl.uniform1f(gl.getUniformLocation(program, name), values[name]));
    colors.forEach((color, i) => gl.uniform3fv(gl.getUniformLocation(program, `uColor${i + 1}`), hex(color)));
  }
  gl.uniform2f(shared.uRes, width, height);
  gl.uniform1f(shared.uTime, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // The frame is copied out before it is presented. WebGL's origin is the bottom-left corner.
  target.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, width, height);
  return true;
}

// ---- One animation loop for every Grainient on the page ---------------------------------------
//
// Separate loops would each wake the browser every frame; one loop wakes it once, draws only the
// canvases that are on screen, keeps to the frame rate the device tier allows, and holds still while
// something else needs the frame (a weaker device scrolling, the menu animating).

const jobs = new Set<(now: number) => void>();
let loopHandle = 0;
let lastRaf = 0;
let lastDraw = 0;

function loop(now: number) {
  loopHandle = 0;
  if (!jobs.size) { lastRaf = 0; return; }
  if (lastRaf) reportFrame(now - lastRaf);
  lastRaf = now;

  const due = now - lastDraw >= frameInterval() - 2;
  if (due && !decorPaused()) {
    lastDraw = now;
    jobs.forEach((draw) => draw(now));
  }
  loopHandle = requestAnimationFrame(loop);
}

function addJob(draw: (now: number) => void) {
  jobs.add(draw);
  if (!loopHandle) loopHandle = requestAnimationFrame(loop);
}

function removeJob(draw: (now: number) => void) {
  jobs.delete(draw);
  if (!jobs.size && loopHandle) { cancelAnimationFrame(loopHandle); loopHandle = 0; lastRaf = 0; }
}

// ---- The component ----------------------------------------------------------------------------

export default function Grainient({ preset = 'silver', still = false, className = '' }: GrainientProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;
    const target = canvas.getContext('2d'); // transparent until the first frame, so the section's own background shows meanwhile
    if (!target) { canvas.style.display = 'none'; return undefined; }

    const frozen = still || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let elapsed = frozen ? 6 : 0;
    let start = performance.now() - elapsed * 1000;
    let width = 0;
    let height = 0;
    let ready = false;
    let playing = false;
    let visible = false;
    let cancelled = false;
    let idle = 0;

    const draw = (time: number) => {
      elapsed = time;
      if (!renderInto(target, width, height, preset, time)) {
        // The renderer was lost: ask for a new one, and keep the picture that is already here.
        ready = false;
        whenRenderer((ok) => { if (ok && !cancelled) { ready = true; draw(elapsed); } });
      }
    };
    const paint = (now: number) => draw((now - start) / 1000);

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const ratio = pixelRatioFor(1.5);
      const w = Math.min(MAX_SIDE, Math.max(1, Math.round(rect.width * ratio)));
      const h = Math.min(MAX_SIDE, Math.max(1, Math.round(rect.height * ratio)));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w; // resizing clears a canvas, so a frame is painted straight away
      canvas.height = h;
      if (ready) draw(elapsed);
    };

    const play = () => {
      if (frozen || playing || !visible || !ready || document.hidden) return;
      start = performance.now() - elapsed * 1000;
      playing = true;
      addJob(paint);
    };
    const stop = () => {
      if (!playing) return;
      playing = false;
      removeJob(paint);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // Nothing is set up until the section is near the viewport and the browser is idle, so first paint
    // and first interaction never wait for a background effect.
    const gate = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gate.disconnect();
      idle = runWhenIdle(() => {
        whenRenderer((ok) => {
          if (cancelled) return;
          if (!ok) { canvas.style.display = 'none'; return; }
          ready = true;
          draw(elapsed);
          play();
        });
      }, 500);
    }, { rootMargin: '200px 0px' });
    gate.observe(host);

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else stop(); }, { rootMargin: '100px 0px' });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : play());
    document.addEventListener('visibilitychange', onVisibility);
    // A tier change (the device proved slower than it reported) changes the internal resolution.
    const offTier = onTierChange(resize);

    return () => {
      cancelled = true;
      stop();
      cancelIdle(idle);
      gate.disconnect();
      io.disconnect();
      ro.disconnect();
      offTier();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [preset, still]);

  // Positioned inline so the canvas never joins the layout (it sizes itself from its parent).
  return (
    <canvas
      ref={ref}
      className={`grainient ${className}`}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
