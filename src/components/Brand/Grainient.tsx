// Grainient: animated warped gradient with film grain. WebGL2, no dependencies. Renders a canvas that
// fills its positioned parent; animates only while on screen; draws one still
// frame under reduced motion; hides itself if WebGL2 is unavailable so the
// parent's CSS gradient shows instead.
import { useEffect, useRef } from 'react';

import { cancelIdle, runWhenIdle } from '../../utils/idle';
import { frameInterval, isScrolling, onTierChange, pixelRatioFor, reportFrame, shouldRestDuringScroll } from '../../utils/perf';

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

export const GRAINIENT_PRESETS = {
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

export type GrainientPreset = keyof typeof GRAINIENT_PRESETS;

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


// One animation loop drives every Grainient on the page. Separate loops would each wake the browser
// every frame; one loop wakes it once, draws only the canvases that are on screen, keeps to the
// frame rate the device tier allows, and rests while a weaker device is scrolling.
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
  if (due && !(shouldRestDuringScroll() && isScrolling())) {
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

export default function Grainient({ preset = 'silver', still = false, className = '' }: GrainientProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return undefined;

    // The page has several of these. Setting one up (context, shader compile) costs main-thread
    // time, so none starts until its section is near the viewport and the browser is idle: the
    // first paint and the first interaction never wait for a background effect.
    let teardown: (() => void) | undefined;
    let idle = 0;
    const boot = (): (() => void) | undefined => {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    const fail = () => { canvas.style.display = 'none'; };
    if (!gl) { fail(); return undefined; }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      // Not checked here: asking for the compile status makes the browser wait for the compiler.
      // A failure shows up as a failed link below, once compiling has finished in the background.
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    // Compiling this shader takes tens to hundreds of milliseconds. With KHR_parallel_shader_compile
    // the browser does it on another thread, so the page keeps scrolling while it happens.
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    let waiting = 0;
    let running: (() => void) | undefined;

    const begin = (): (() => void) | undefined => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { fail(); return undefined; }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const { colors, settings } = GRAINIENT_PRESETS[preset];
    const values: Settings = { ...BASE, ...settings };
    (Object.keys(values) as (keyof Settings)[]).forEach((name) => gl.uniform1f(gl.getUniformLocation(program, name), values[name]));
    colors.forEach((color, i) => gl.uniform3fv(gl.getUniformLocation(program, `uColor${i + 1}`), hex(color)));
    const uTime = gl.getUniformLocation(program, 'iTime');
    const uRes = gl.getUniformLocation(program, 'iResolution');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frozen = still || reduced;
    let elapsed = frozen ? 6 : 0;
    let start = performance.now() - elapsed * 1000;
    let playing = false;
    let visible = false;

    const draw = (time: number) => { elapsed = time; gl.uniform1f(uTime, time); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = pixelRatioFor(1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
      draw(elapsed);
    };
    const paint = (now: number) => draw((now - start) / 1000);
    const play = () => {
      if (frozen || playing || !visible || document.hidden) return;
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
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) play(); else stop(); }, { rootMargin: '100px 0px' });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : play());
    document.addEventListener('visibilitychange', onVisibility);
    const onLost = (event: Event) => { event.preventDefault(); stop(); fail(); };
    canvas.addEventListener('webglcontextlost', onLost);
    // A tier change (the device proved slower than it reported) changes the internal resolution.
    const offTier = onTierChange(resize);
    resize();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      offTier();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    };

    const wait = () => {
      waiting = 0;
      if (!parallel || gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) running = begin();
      else waiting = window.setTimeout(wait, 16);
    };
    wait();

    return () => {
      window.clearTimeout(waiting);
      running?.();
      if (!running) gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
    };

    const gate = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gate.disconnect();
      idle = runWhenIdle(() => { teardown = boot(); }, 500);
    }, { rootMargin: '200px 0px' });
    gate.observe(host);

    return () => {
      gate.disconnect();
      cancelIdle(idle);
      teardown?.();
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
