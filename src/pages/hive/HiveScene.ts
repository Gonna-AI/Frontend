// Hive scene. Everything is drawn into one grid of glyphs:
//   scene pass  – a sphere of hexagonal cells (raymarched) with arcs and a comet, which
//                 morphs into a flat card; dust that gathers around graph nodes.
//   glyph pass  – maps scene brightness to a character ramp, then draws text, dotted
//                 card borders and connection lines with pulses on the same grid.
// Scroll progress (0..1) scrubs the story: plant → question → agents → findings.
// WebGL2 only, no dependencies.

import { decorHeld, frameInterval, pixelRatioFor, reportFrame } from '../../utils/perf';

const RAMP = ' .:;-=+xX80S#@';
const SHEET = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~·→—äöüÄÖÜß`;
const SHEET_CHARS = [...SHEET];
const SHEET_INDEX = new Map(SHEET_CHARS.map((ch, i) => [ch, i]));
const RAMP_INDEX = [...RAMP].map((ch) => SHEET_INDEX.get(ch) ?? 0);
const SCRAMBLE = '.:;-=+xX80S#@';
const ARCS = 4;
const ARC_PTS = 13;
const MAX_BOX = 8;
const MAX_LINE = 16;

const QUAD_VS = `#version 300 es
const vec2 P[3]=vec2[3](vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
void main(){ gl_Position=vec4(P[gl_VertexID],0.,1.); }`;

const SCENE_FS = `#version 300 es
precision highp float;
uniform vec2 uRes, uBoxC, uBoxW;
uniform float uCellAspect, uFit, uTime, uAngle, uMorph, uCam, uComet, uSphere, uArcA, uDust, uCosmos, uResolve, uBlast, uExtra;
uniform vec3 uArc[${ARCS * ARC_PTS}];
uniform vec2 uNode[6];
out vec4 outColor;
const vec2 HS = vec2(1.0, 1.7320508);
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 hexCoords(vec2 uv){
  vec4 hC = floor(vec4(uv, uv - vec2(0.5, 1.0)) / HS.xyxy) + 0.5;
  vec4 h = vec4(uv - hC.xy * HS, uv - (hC.zw + 0.5) * HS);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + 0.5);
}
float hexEdge(vec2 p){ p = abs(p); return max(dot(p, HS * 0.5), p.x); }
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
float sdRBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - r; }
float map(vec3 p){
  float ds = length(p) - 1.0;
  float db = sdRBox(p - vec3(uBoxC, 0.), vec3(uBoxW, 0.03), 0.02);
  return mix(ds, db, uMorph);
}
vec3 normalAt(vec3 p){
  vec2 e = vec2(0.002, 0.);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0., 1.); return length(pa - ba * h); }
vec3 cometPos(float t){ return rotX(-0.42) * vec3(cos(t) * 1.42, sin(t) * 0.3, sin(t) * 1.42); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv.x *= uCellAspect;
  uv *= uFit;
  float px = uFit / uRes.y;
  vec2 g = floor(gl_FragCoord.xy / 2.);
  float h0 = hash(g);
  float lum = 0.; float acc = 0.;

  // dust, gathering around graph nodes
  float dens = 0.006;
  for (int i = 0; i < 6; i++){ vec2 d = uv - uNode[i]; dens += uDust * 0.42 * exp(-dot(d, d) / 0.012); }
  lum += step(1. - dens, h0) * (0.2 + 0.14 * sin(uTime * 1.4 + h0 * 60.));

  // A restrained orbital system develops out of the same investigation.
  // Everything is rendered in the same glyph field as the evidence cards.
  if (uCosmos > 0.001) {
    vec2 cp = uv - vec2(0., -0.015);
    float core = length(cp);
    float gravity = smoothstep(.01, .15, uExtra) * (1. - smoothstep(.22, .34, uExtra));
    float aurora = smoothstep(.18, .32, uExtra) * (1. - smoothstep(.44, .58, uExtra));
    float wave = smoothstep(.43, .55, uExtra) * (1. - smoothstep(.69, .82, uExtra));
    float reform = smoothstep(.71, .9, uExtra);
    float halo = exp(-core * core / .005) * .22 + exp(-core * core / .0003) * .62;
    lum += halo * uCosmos;
    acc = max(acc, exp(-core * core / .001) * .35 * uCosmos);
    vec2 globe = cp / (.14 + .055 * uResolve);
    float globeR = dot(globe, globe);
    if (globeR < 1.) {
      float depth = sqrt(max(0., 1. - globeR));
      vec3 normal = normalize(vec3(globe, depth));
      vec3 world = rotY(-uTime * .16) * normal;
      float longitude = atan(world.z, world.x);
      float latitude = asin(clamp(world.y, -1., 1.));
      float land = sin(longitude * 3. + sin(latitude * 5.) * 1.4) + cos(latitude * 8. - longitude * 2.);
      float coast = smoothstep(.15, .55, land);
      float longitudeGrid = 1. - smoothstep(.015, .045, abs(sin(longitude * 6.)));
      float latitudeGrid = 1. - smoothstep(.015, .045, abs(sin(latitude * 8.)));
      float light = .25 + .55 * max(0., dot(normal, normalize(vec3(-.45, .65, .75))));
      float rim = pow(1. - depth, 2.5);
      lum += (light * (.32 + coast * .48) + max(longitudeGrid, latitudeGrid) * .18 + rim * .35) * uCosmos * (1. - gravity * .96);
      acc = max(acc, coast * light * .13 * uCosmos);
    }
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float tilt = -.88 + fi * .43;
      float c = cos(tilt), s = sin(tilt);
      vec2 o = vec2(c * cp.x + s * cp.y, -s * cp.x + c * cp.y);
      float flatten = .42 + fi * .07;
      vec2 orbit = vec2(o.x, o.y / flatten);
      float radius = (.16 + fi * .043) * (1. + .18 * uResolve);
      float edge = abs(length(orbit) - radius);
      lum += exp(-edge * edge / .000035) * (.24 - fi * .025) * uCosmos;
      float angle = uTime * (.26 - fi * .035) + fi * 2.1;
      vec2 planet = vec2(cos(angle) * radius, sin(angle) * radius * flatten);
      vec2 before = vec2(cos(angle - .16) * radius, sin(angle - .16) * radius * flatten);
      float d = length(o - planet);
      float star = exp(-d * d / .00004) * 1.1 + exp(-d * d / .00045) * .3;
      star += exp(-pow(segD(o, before, planet), 2.) / .000025) * .16;
      lum += star * uCosmos;
      if (i == 1) acc = max(acc, star * .72 * uCosmos);
    }
    vec2 starCell = floor((uv + .7) * 42.);
    float seed = hash(starCell);
    float twinkle = .3 + .18 * sin(uTime * (1.1 + seed) + seed * 35.);
    lum += step(.992, seed) * twinkle * uCosmos;
    float flight = fract(uTime * .095);
    vec2 head = vec2(-.62 + flight * 1.24, .34 - flight * .48);
    vec2 tail = head + vec2(-.07, .027);
    float meteor = exp(-pow(segD(uv, head, tail), 2.) / .000007) * (1. - smoothstep(.82, .98, flight)) * smoothstep(.02, .16, flight);
    lum += meteor * .45 * uCosmos;
    float flight2 = fract(uTime * .071 + .47);
    vec2 head2 = vec2(.55 - flight2 * 1.1, .23 - flight2 * .6);
    float meteor2 = exp(-pow(segD(uv, head2, head2 + vec2(.055, .03)), 2.) / .000009) * (1. - smoothstep(.82, .98, flight2)) * smoothstep(.02, .16, flight2);
    lum += meteor2 * .3 * uCosmos;

    // The collapsing geometric orbit releases a scroll-driven shockwave.
    // Rays and debris have fixed trajectories, so reversing scroll also reverses
    // the event instead of introducing a disconnected, random frame.
    float energy = sin(3.14159265 * clamp(uBlast, 0., 1.));
    if (energy > .001) {
      float distanceFromCore = length(cp);
      float shockRadius = .08 + .55 * uBlast;
      float shockWidth = .008 + .012 * uBlast;
      float shock = exp(-pow((distanceFromCore - shockRadius) / shockWidth, 2.));
      float innerShock = exp(-pow((distanceFromCore - shockRadius * .68) / (shockWidth * 1.5), 2.));
      float flash = exp(-distanceFromCore * distanceFromCore / (.006 + .016 * energy));
      lum += (shock * .8 + innerShock * .32 + flash * .65) * energy * uCosmos;
      acc = max(acc, (shock * .55 + flash * .4) * energy * uCosmos);

      float polar = atan(cp.y, cp.x) + 3.14159265;
      float spokeId = floor(polar * 5.1);
      float spokeSeed = hash(vec2(spokeId, 19.7));
      float spokeAngle = (spokeId + .15 + spokeSeed * .7) / 5.1 - 3.14159265;
      vec2 direction = vec2(cos(spokeAngle), sin(spokeAngle));
      float headDist = (.14 + spokeSeed * .48) * uBlast;
      vec2 sparkHead = direction * headDist;
      vec2 sparkTail = direction * max(.02, headDist - .035 - .04 * spokeSeed);
      float streak = exp(-pow(segD(cp, sparkHead, sparkTail), 2.) / .000035);
      float spark = exp(-dot(cp - sparkHead, cp - sparkHead) / .00013);
      lum += (streak * .55 + spark * .9) * energy * uCosmos;
      acc = max(acc, spark * .75 * energy * uCosmos);
    }

    // 07: The planet contracts into an event horizon. A tilted accretion disc
    // keeps the same orbit and momentum as the planetary system before it.
    if (gravity > .001) {
      float horizon = 1. - smoothstep(.065, .077, core);
      lum *= 1. - horizon * gravity;
      acc *= 1. - horizon * gravity;
      float ring = exp(-pow((core - .079) / .007, 2.));
      vec2 disc = vec2(cp.x + cp.y * .38, cp.y * 3.4);
      float discRadius = length(disc);
      float discBand = exp(-pow((discRadius - .16) / .043, 2.));
      float discGaps = .55 + .45 * sin(atan(disc.y, disc.x) * 8. - uTime * 1.4 + discRadius * 28.);
      float lens = exp(-pow((core - .115) / .012, 2.)) * .25;
      lum += (ring * 1.2 + discBand * discGaps * .7 + lens) * gravity;
      acc = max(acc, (ring * .65 + discBand * .42) * gravity);
    }

    // 08: The disc stretches into moving light curtains and a spiral nebula.
    if (aurora > .001) {
      float curtain = 0.;
      for (int i = 0; i < 5; i++) {
        float f = float(i);
        float waveY = -.16 + f * .075 + .052 * sin(cp.x * (8. + f) + uTime * (.35 + f * .06) + f);
        float band = exp(-pow((cp.y - waveY) / (.018 + f * .002), 2.));
        curtain += band * exp(-cp.x * cp.x / .3) * (.22 + .05 * f);
      }
      float a = atan(cp.y, cp.x);
      float spiral = .5 + .5 * cos(a * 3. - core * 35. + uTime * .5);
      float nebula = exp(-pow((core - .22) / .13, 2.)) * pow(spiral, 8.);
      lum += (curtain + nebula * .36) * aurora;
      acc = max(acc, (curtain * .25 + nebula * .24) * aurora);
    }

    // 09: Concentric wavefronts expand through the same particles.
    if (wave > .001) {
      float phase = clamp((uExtra - .43) / .37, 0., 1.);
      float front = .06 + phase * .64;
      float rings = 0.;
      for (int i = 0; i < 3; i++) {
        float radius = front - float(i) * .065;
        rings += exp(-pow((core - radius) / (.009 + .004 * float(i)), 2.)) * (1. - float(i) * .2);
      }
      float polar = atan(cp.y, cp.x);
      float filaments = pow(max(0., cos(polar * 16. + sin(polar * 5.) * 2.)), 18.);
      float shockBody = exp(-pow((core - front * .72) / .12, 2.));
      lum += (rings * .65 + filaments * shockBody * .45) * wave;
      acc = max(acc, (rings * .36 + filaments * shockBody * .2) * wave);
    }

    // 10: A lattice of fine links and glints reforms around the central globe.
    if (reform > .001) {
      vec2 space = (cp + .8) * 5.;
      vec2 cell = floor(space);
      vec2 local = fract(space);
      vec2 a = vec2(.18 + hash(cell) * .22, .2 + hash(cell + 8.7) * .3);
      vec2 b = vec2(.68 + hash(cell + 4.1) * .22, .58 + hash(cell + 3.3) * .22);
      float thread = exp(-pow(segD(local, a, b) / .025, 2.));
      float glint = exp(-dot(local - a, local - a) / .002) * (1. + .3 * sin(uTime + hash(cell) * 20.));
      float edgeFade = exp(-core * core / .4) * smoothstep(.13, .24, core);
      float lattice = (thread * .23 + glint * .55) * edgeFade;
      lum += lattice * reform;
      acc = max(acc, glint * .24 * edgeFade * reform);
    }
  }

  vec3 ro = vec3(0., 0., uCam);
  vec3 rd = normalize(vec3(uv * 0.92, -1.6));
  float t = 0.; float hit = 0.;
  if (uSphere > 0.01){
    for (int i = 0; i < 48; i++){
      float d = map(ro + rd * t);
      if (d < 0.0015){ hit = 1.; break; }
      t += d;
      if (t > 9.) break;
    }
  }
  if (hit > 0.5){
    vec3 p = ro + rd * t;
    vec3 n = normalAt(p);
    vec3 qs = normalize(rotY(-uAngle) * p);
    float lat = asin(clamp(qs.y, -1., 1.));
    float lon = atan(-qs.z, qs.x);
    vec2 suv = vec2(lon * cos(lat), lat) * 3.1;
    vec2 puv = (p.xy - uBoxC) * 3.4;
    vec4 hx = hexCoords(mix(suv, puv, uMorph));
    float inside = 1. - smoothstep(0.34, 0.43, hexEdge(hx.xy));
    vec3 L = normalize(vec3(-0.5, 0.62, 0.62));
    float diff = clamp(dot(n, L) * 0.85 + 0.15, 0., 1.);
    float spec = pow(max(dot(reflect(-L, n), -rd), 0.), 14.);
    float rim = pow(1. - max(0., dot(n, -rd)), 3.);
    float h = hash(hx.zw);
    float machine = step(0.72, h) * (0.5 + 0.5 * sin(uTime * 1.6 + h * 40.));
    float alert = (1. - smoothstep(0.35, 0.6, length(hx.zw * HS) / 1.7320508)) * (1. - uMorph);
    float cellL = (0.1 + 0.6 * diff + 0.5 * spec + 0.18 * machine) * mix(1., 0.5, uMorph) + alert * (0.4 + 0.2 * sin(uTime * 5.));
    float l = mix(0.03 + 0.05 * diff, cellL, inside) + rim * 0.24 * (1. - uMorph);
    lum = mix(lum, l, uSphere);
    acc = inside * alert * uSphere;
  }

  // arcs between machines, lifted off the surface
  if (uArcA > 0.01){
    float w = 2.4 * px;
    for (int a = 0; a < ${ARCS}; a++){
      for (int k = 0; k < ${ARC_PTS - 1}; k++){
        vec3 P0 = uArc[a * ${ARC_PTS} + k], P1 = uArc[a * ${ARC_PTS} + k + 1];
        if (P0.z > 0. && P1.z > 0.){
          float d = segD(uv, P0.xy, P1.xy);
          float v = exp(-d * d / (w * w)) * min(P0.z, P1.z) * uArcA;
          lum += v * 0.9;
          if (a == 0) acc = max(acc, v);
        }
        if (k == 0 && P0.z > 0.){ vec2 d = uv - P0.xy; lum += exp(-dot(d, d) / (w * w * 4.)) * P0.z * uArcA; }
      }
    }
  }

  // comet with a tail, hidden behind the sphere
  if (uComet > 0.01){
    float glow = 0.;
    for (int k = 0; k < 14; k++){
      float fk = float(k);
      vec3 cp = cometPos(uTime * 0.7 - fk * 0.04);
      vec3 w = cp - ro; float along = dot(w, rd);
      float dd = length(w - rd * along);
      float behind = (hit > 0.5 && along > t) ? 0. : 1.;
      glow += behind * exp(-dd * dd / (0.0005 + fk * 0.0003)) * (1. - fk / 14.);
    }
    lum += glow * uComet * 1.3;
  }
  outColor = vec4(clamp(lum, 0., 1.), clamp(acc, 0., 1.), 0., 1.);
}`;

const GLYPH_FS = `#version 300 es
precision highp float;
uniform sampler2D tCells, tSheet, tText;
uniform vec2 uGrid, uCell, uRes;
uniform float uN, uTime, uDpr, uHeroDim;
uniform float uRamp[${RAMP.length}];
uniform vec4 uBox[${MAX_BOX}]; uniform vec4 uBoxP[${MAX_BOX}];
uniform vec4 uLine[${MAX_LINE}]; uniform vec4 uLineP[${MAX_LINE}];
out vec4 outColor;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float sdRect(vec2 p, vec4 r){ vec2 c = (r.xy + r.zw) * .5, h = (r.zw - r.xy) * .5; vec2 q = abs(p - c) - h; return length(max(q, 0.)) + min(max(q.x, q.y), 0.); }
float segD(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0., 1.); return length(pa - ba * h); }
void main(){
  vec2 p = gl_FragCoord.xy;
  vec2 cell = floor(p / uCell);
  vec2 local = fract(p / uCell);
  vec4 cs = texture(tCells, (cell + .5) / uGrid);
  vec4 tx = texelFetch(tText, ivec2(cell), 0);
  float ex = clamp((cs.r - .045) / .955, 0., 1.);
  float ev = ex > 0. ? pow(ex, .78) : 0.;
  int ri = ev <= 0. ? 0 : int(min(${RAMP.length - 1}., 1. + floor(ev * ${RAMP.length - 1}.)));
  float idx = uRamp[ri];
  float bright = .3 + .7 * ev;
  float acc = clamp(cs.g * 1.4, 0., 1.);
  vec3 silver = vec3(.92, .93, .95), orange = vec3(1., .36, .08);

  // cards: dim what is behind them, dotted border with solid corners
  float fillDim = 0., inside = 0., border = 0., bacc = 0.;
  for (int i = 0; i < ${MAX_BOX}; i++){
    vec4 r = uBox[i], q = uBoxP[i];
    if (q.x <= 0.) continue;
    float d = sdRect(p, r);
    if (d < 0.){ fillDim = max(fillDim, q.x * q.z); inside = max(inside, q.x); }
    vec2 c = (r.xy + r.zw) * .5, hh = (r.zw - r.xy) * .5;
    vec2 e = hh - abs(p - c);
    float corner = step(e.x, 7. * uDpr) * step(e.y, 7. * uDpr);
    float dots = step(.5, fract((p.x + p.y) / (3. * uDpr)));
    float b = (1. - smoothstep(.45 * uDpr, 1.05 * uDpr, abs(d + .5 * uDpr))) * mix(dots, 1., corner) * q.x;
    if (b > border){ border = b; bacc = q.y; }
  }
  bright *= 1. - fillDim * .94;
  acc *= 1. - fillDim;
  vec2 qn = (p / uRes - .5) * vec2(uRes.x / uRes.y, 1.);
  bright *= 1. - uHeroDim * .72 * exp(-dot(qn * vec2(.9, 1.5), qn * vec2(.9, 1.5)) * 6.);
  if (tx.r > 0.){ idx = floor(tx.r * 255. + .5); bright = tx.g; acc = tx.b; }
  float a = texture(tSheet, vec2((idx + local.x) / uN, local.y)).r;
  vec3 col = mix(silver, orange, acc) * bright * a;

  // connections: dotted lines that grow, with a pulse travelling inward
  for (int i = 0; i < ${MAX_LINE}; i++){
    vec4 L = uLine[i], q = uLineP[i];
    if (q.x <= 0.) continue;
    vec2 A = L.xy, B = mix(L.xy, L.zw, q.y);
    float d = segD(p, A, B);
    vec2 dir = normalize(L.zw - L.xy + 1e-4);
    float dots = step(.5, fract(dot(p - A, dir) / (4. * uDpr)));
    float open = 1. - step(.01, inside);
    col += mix(silver, orange, q.w) * (1. - smoothstep(.4 * uDpr, 1.1 * uDpr, d)) * dots * q.x * .6 * open;
    if (q.z >= 0. && q.y > .99){
      vec2 dp = p - mix(L.zw, L.xy, fract(q.z));
      col += orange * exp(-dot(dp, dp) / (7. * uDpr * uDpr)) * q.x * open * 1.4;
    }
  }
  col = mix(col, mix(silver * .8, orange, bacc), border);

  vec2 uvn = p / uRes;
  vec3 bg = vec3(.052, .052, .056) + .035 * exp(-dot(uvn - vec2(.5, .55), uvn - vec2(.5, .55)) * 3.5);
  bg += (hash(p + fract(uTime * 7.) * 91.) - .5) * .022;
  bg += inside * .01;
  outColor = vec4(bg + col, 1.);
}`;

export type HiveCopy = {
  card: [string, string, string];
  center: string;
  nodes: { label: string; short: string; long: string }[];
  title: [string, string];
  draft: [string, string];
};

type V3 = [number, number, number];
type Arc = { a: V3; b: V3; t0: number; dur: number; lift: number };
type Rect = { c: number; r: number; w: number; h: number };
type Box = { rect: Rect; alpha: number; accent: number; fill: number };
type Line = { a: [number, number]; b: [number, number]; alpha: number; prog: number; pulse: number; accent: number };

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({ c: lerp(a.c, b.c, t), r: lerp(a.r, b.r, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
const randUnit = (): V3 => {
  const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), u, s * Math.sin(th)];
};
const label = (s: string) => s.padEnd(9, ' ');

export class HiveScene {
  private gl: WebGL2RenderingContext;
  private scene!: WebGLProgram;
  private glyph!: WebGLProgram;
  private fbo!: WebGLFramebuffer;
  private cellsTex!: WebGLTexture;
  private sheetTex!: WebGLTexture;
  private textTex!: WebGLTexture;
  private text = new Uint8Array(4);
  private locs = new Map<string, WebGLUniformLocation | null>();
  private frame = 0;
  private last = 0;
  private time = 0;
  private angle = 0.4;
  private built = false;
  private grid = { w: 1, h: 1, cw: 7, ch: 12, dpr: 1 };
  private arcs: Arc[] = [];
  private arcBuf = new Float32Array(ARCS * ARC_PTS * 3);
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private copy: HiveCopy | null = null;
  progress = 0;
  private targetProgress = 0;
  ok = false;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) { this.gl = null as unknown as WebGL2RenderingContext; return; }
    this.gl = gl;
    const scene = this.program(SCENE_FS);
    const glyph = this.program(GLYPH_FS);
    if (!scene || !glyph) return;
    this.scene = scene;
    this.glyph = glyph;
    gl.bindVertexArray(gl.createVertexArray());
    this.fbo = gl.createFramebuffer()!;
    this.cellsTex = gl.createTexture()!;
    this.sheetTex = gl.createTexture()!;
    this.textTex = gl.createTexture()!;
    for (let i = 0; i < ARCS; i++) this.arcs.push(this.newArc(-i * 0.7));
    this.ok = true;
  }

  setCopy(copy: HiveCopy) { this.copy = copy; if (!this.frame) this.draw(); }

  private program(fs: string) {
    const gl = this.gl;
    const make = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const v = make(gl.VERTEX_SHADER, QUAD_VS), f = make(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  private loc(prog: WebGLProgram, name: string) {
    const key = (prog === this.scene ? 's:' : 'g:') + name;
    if (!this.locs.has(key)) this.locs.set(key, this.gl.getUniformLocation(prog, name));
    return this.locs.get(key)!;
  }

  private params(tex: WebGLTexture, filter: number) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  resize(width: number, height: number) {
    if (!this.ok) return;
    const gl = this.gl;
    const dpr = pixelRatioFor(1.25, { mid: 1, low: 0.75 });
    const W = Math.max(1, Math.round(width * dpr)), H = Math.max(1, Math.round(height * dpr));
    // Rebuilding the textures is the expensive part; a resize that changes nothing (the mobile address
    // bar sliding, a tier re-check) must not pay for it.
    if (this.built && W === this.canvas.width && H === this.canvas.height) return;
    this.built = true;
    this.canvas.width = W; this.canvas.height = H;
    const small = width < 640;
    const cw = Math.round((small ? 5 : 7) * dpr), ch = Math.round((small ? 9 : 12) * dpr);
    const gw = Math.ceil(W / cw), gh = Math.ceil(H / ch);
    this.grid = { w: gw, h: gh, cw, ch, dpr };

    gl.bindTexture(gl.TEXTURE_2D, this.cellsTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gw * 2, gh * 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    this.params(this.cellsTex, gl.LINEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.cellsTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.text = new Uint8Array(gw * gh * 4);
    gl.bindTexture(gl.TEXTURE_2D, this.textTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gw, gh, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.text);
    this.params(this.textTex, gl.NEAREST);

    const sheet = document.createElement('canvas');
    sheet.width = cw * SHEET_CHARS.length; sheet.height = ch;
    const ctx = sheet.getContext('2d')!;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `500 ${Math.round(ch * 0.78)}px "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    SHEET_CHARS.forEach((chr, i) => { if (i) ctx.fillText(chr, i * cw + cw / 2, ch * 0.54); });
    gl.bindTexture(gl.TEXTURE_2D, this.sheetTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    this.params(this.sheetTex, gl.LINEAR);
    this.draw();
  }

  // ---------- geometry (grid cells, top-left origin) ----------

  private get fit() { return Math.max(1, 1.1 / (this.canvas.width / Math.max(1, this.canvas.height))); }
  private readonly cam = 4.15;
  private get small() { return this.grid.w < 90; }
  private get centerY() { return this.grid.h * (this.small ? 0.58 : 0.54); }

  /** Grid position (cell units) to scene uv. */
  private toUv(x: number, y: number): [number, number] {
    const { w, h, cw, ch } = this.grid;
    return [((2 * x - w) / (2 * h)) * (cw / ch) * this.fit, ((h - 2 * y) / (2 * h)) * this.fit];
  }

  private project([x, y, z]: V3): [number, number] {
    const k = 1.6 / (0.92 * (this.cam - z));
    return [x * k, y * k];
  }

  private newArc(t0: number): Arc {
    const a = randUnit();
    let b = randUnit();
    while (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] > 0.6) b = randUnit();
    return { a, b, t0, dur: 3.2 + Math.random() * 1.6, lift: 0.18 + Math.random() * 0.2 };
  }

  private fillArcs(alpha: number) {
    const buf = this.arcBuf, cam = this.cam, ca = Math.cos(this.angle), sa = Math.sin(this.angle);
    this.arcs.forEach((arc0, i) => {
      let arc = arc0;
      let age = (this.time - arc.t0) / arc.dur;
      if (age > 1) { arc = this.newArc(this.time); this.arcs[i] = arc; age = 0; }
      const grow = Math.min(1, Math.max(0, age / 0.45));
      const fade = 1 - Math.min(1, Math.max(0, (age - 0.72) / 0.28));
      const dot = Math.min(1, arc.a[0] * arc.b[0] + arc.a[1] * arc.b[1] + arc.a[2] * arc.b[2]);
      const om = Math.acos(dot), so = Math.sin(om) || 1;
      for (let k = 0; k < ARC_PTS; k++) {
        const o = (i * ARC_PTS + k) * 3;
        const t = k / (ARC_PTS - 1);
        if (age < 0 || t > grow) { buf[o + 2] = 0; continue; }
        const wa = Math.sin((1 - t) * om) / so, wb = Math.sin(t * om) / so;
        const lift = 1 + arc.lift * Math.sin(Math.PI * t);
        const ox = (arc.a[0] * wa + arc.b[0] * wb) * lift, oy = (arc.a[1] * wa + arc.b[1] * wb) * lift, oz = (arc.a[2] * wa + arc.b[2] * wb) * lift;
        const P: V3 = [ca * ox + sa * oz, oy, -sa * ox + ca * oz];
        // hidden when the sphere sits between the camera and the point
        const dx = P[0], dy = P[1], dz = P[2] - cam;
        const len = Math.hypot(dx, dy, dz);
        const b = (cam * dz) / len, c = cam * cam - 1, disc = b * b - c;
        const tHit = disc > 0 ? -b - Math.sqrt(disc) : -1;
        const occluded = tHit > 0 && tHit < len - 0.02;
        const [ux, uy] = this.project(P);
        buf[o] = ux; buf[o + 1] = uy; buf[o + 2] = occluded ? 0 : fade * alpha * (0.55 + 0.45 * t);
      }
    });
  }

  // ---------- text grid ----------

  private put(col: number, row: number, str: string, k: number, bright: number, accent: number, maxW = Infinity) {
    const { w, h } = this.grid;
    const r = Math.round(row), c0 = Math.round(col);
    if (r < 0 || r >= h || k <= 0) return;
    const chars = [...str].slice(0, Math.max(0, Math.floor(maxW)));
    const shown = k * (chars.length + 3);
    const rowBase = (h - 1 - r) * w;
    chars.forEach((chr, i) => {
      const c = c0 + i;
      if (c < 0 || c >= w || chr === ' ' || i >= shown) return;
      const real = i < shown - 3;
      const glyph = real ? chr : SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
      const o = (rowBase + c) * 4;
      this.text[o] = SHEET_INDEX.get(glyph) ?? (SHEET_INDEX.get('?') as number);
      this.text[o + 1] = Math.round((real ? bright : bright * 0.6) * 255);
      this.text[o + 2] = real ? Math.round(accent * 255) : 0;
    });
  }

  private cardWidth() {
    const copy = this.copy;
    return copy ? Math.min(this.grid.w - 4, Math.max(...copy.card.map((s) => s.length)) + 8) : 40;
  }

  // ---------- story layout ----------

  private layout(p: number) {
    const { w: gw, h: gh, cw, ch } = this.grid;
    const copy = this.copy;
    const boxes: Box[] = [];
    const lines: Line[] = [];
    const nodes: [number, number][] = [];
    this.text.fill(0);
    if (!copy) return { boxes, lines, nodes };

    // The first investigation occupies the opening two thirds of the journey.
    // The remaining scroll follows the evidence into the wider plant and handoff.
    const journey = p;
    p = Math.min(1, p / 0.62);

    const small = this.small;
    const cx = gw / 2, cy = this.centerY;
    const rect = (c: number, r: number, w: number, h: number): Rect => ({ c: c - w / 2, r: r - h / 2, w, h });
    const px = (x: number, y: number): [number, number] => [x * cw, (gh - y) * ch];
    const mid = (r: Rect): [number, number] => [r.c + r.w / 2, r.r + r.h / 2];

    const cardRect = rect(cx, cy, this.cardWidth(), 7);
    const centerRect = rect(cx, cy, copy.center.length + 4, 3);

    const angles = [155, 25, -25, -155, 90];
    const rx = gw * (small ? 0.25 : 0.29), ry = gh * (small ? 0.22 : 0.3);
    const graphRects = copy.nodes.map((n, i) => {
      const a = (angles[i] * Math.PI) / 180;
      return rect(cx + Math.cos(a) * rx, cy - Math.sin(a) * ry, n.short.length + 4, 3);
    });

    const rows = [copy.title, ...copy.nodes.map((n) => [n.label, n.long] as [string, string]), copy.draft];
    const stackW = Math.min(gw - 2, Math.max(...rows.map(([a, b]) => label(a).length + b.length)) + 4);
    const valueW = stackW - 13;
    const pitch = 4;
    const top = cy - (rows.length * pitch) / 2 + 0.5;
    const stackRect = (i: number): Rect => ({ c: cx - stackW / 2, r: top + i * pitch, w: stackW, h: 3 });

    // question card → centre node → title row
    const cardIn = ss(0.2, 0.25, p);
    const toCenter = ss(0.4, 0.47, p);
    const toStack0 = ss(0.66, 0.72, p);
    const cRect = toStack0 > 0 ? lerpRect(centerRect, stackRect(0), toStack0) : lerpRect(cardRect, centerRect, toCenter);
    if (cardIn > 0) boxes.push({ rect: cRect, alpha: cardIn, accent: toCenter * (1 - toStack0), fill: 1 });
    const cardK = 1 - ss(0.4, 0.44, p);
    if (cardK > 0) {
      const tx = cardRect.c + 4, maxW = cardRect.w - 6;
      this.put(tx, cardRect.r + 1, copy.card[0], ss(0.23, 0.27, p) * cardK, 0.5, 1, maxW);
      this.put(tx, cardRect.r + 3, copy.card[1], ss(0.25, 0.33, p) * cardK, 1, 0, maxW);
      if (p > 0.33 && cardK > 0.5 && Math.floor(this.time * 2.4) % 2 === 0) this.put(tx + Math.min(copy.card[1].length, maxW) + 1, cardRect.r + 3, '_', 1, 1, 1);
      this.put(tx, cardRect.r + 5, copy.card[2], ss(0.31, 0.36, p) * cardK, 0.5, 0, maxW);
    }
    if (toStack0 < 0.5) {
      this.put(cRect.c + 2, cRect.r + 1, copy.center, ss(0.44, 0.48, p) * (1 - toStack0 * 2), 1, 1);
    } else {
      const k = (toStack0 - 0.5) * 2;
      this.put(cRect.c + 2, cRect.r + 1, label(copy.title[0]), k, 1, 1);
      this.put(cRect.c + 11, cRect.r + 1, copy.title[1], k, 1, 0, valueW);
    }
    const cMid = mid(cRect);
    nodes.push(this.toUv(...cMid));

    // agents: lines grow out of the centre, cards develop, then everything files into a list
    const linesOut = 1 - ss(0.64, 0.69, p);
    copy.nodes.forEach((n, i) => {
      const d = i * 0.025;
      const grow = ss(0.46 + d, 0.52 + d, p);
      const boxA = ss(0.5 + d, 0.53 + d, p);
      const toStack = ss(0.66 + i * 0.03, 0.74 + i * 0.03, p);
      const r = lerpRect(graphRects[i], stackRect(i + 1), toStack);
      if (grow > 0 && linesOut > 0) {
        lines.push({ a: px(...cMid), b: px(...mid(graphRects[i])), alpha: linesOut, prog: grow, pulse: this.time * 0.45 + i * 0.37, accent: 0 });
      }
      if (boxA > 0) boxes.push({ rect: r, alpha: boxA, accent: 0, fill: 1 });
      if (toStack < 0.5) {
        this.put(r.c + 2, r.r + 1, n.short, ss(0.51 + d, 0.56 + d, p) * (1 - toStack * 2), 0.92, 0);
      } else {
        const k = (toStack - 0.5) * 2;
        this.put(r.c + 2, r.r + 1, label(n.label), k, 0.5, 0);
        this.put(r.c + 11, r.r + 1, n.long, k, 0.95, 0, valueW);
      }
      nodes.push(this.toUv(...mid(r)));
    });

    // links between agents
    const extra = ss(0.58, 0.63, p);
    if (extra > 0 && linesOut > 0) {
      [[0, 4], [2, 3], [1, 4]].forEach(([a, b], j) => {
        lines.push({ a: px(...mid(graphRects[a])), b: px(...mid(graphRects[b])), alpha: linesOut * 0.7, prog: extra, pulse: -1, accent: j === 0 ? 1 : 0 });
      });
    }

    // the decision
    const draftA = ss(0.84, 0.88, p);
    if (draftA > 0) {
      const r = stackRect(rows.length - 1);
      boxes.push({ rect: r, alpha: draftA, accent: 1, fill: 1 });
      const k = ss(0.85, 0.91, p);
      this.put(r.c + 2, r.r + 1, label(copy.draft[0]), k, 1, 1);
      this.put(r.c + 11, r.r + 1, copy.draft[1], k, 1, 0, valueW);
    }
    if (journey >= 0.60) {
      boxes.length = 0; lines.length = 0; nodes.length = 0; this.text.fill(0);
      const fold = ss(0.60, 0.64, journey);
      const gather = ss(0.64, 0.72, journey);
      const diamond = ss(0.70, 0.77, journey);
      const square = ss(0.77, 0.84, journey);
      const release = ss(0.84, 0.97, journey);
      const radius = Math.min(gw * cw * .25, gh * ch * .25);
      const short = [copy.title[0], ...copy.nodes.map((n) => n.label), copy.draft[0]];
      const orbitPoint = (angle: number): [number, number] => {
        const x = Math.cos(angle), y = Math.sin(angle);
        const d = 1 / (Math.abs(x) + Math.abs(y));
        const q = 1 / Math.max(Math.abs(x), Math.abs(y));
        const scale = lerp(lerp(1, d * 1.12, diamond), q * .83, square);
        return [cx + x * radius * scale * (1. - .7 * release) / cw, cy + y * radius * scale * (1. - .7 * release) / ch];
      };
      const positions = short.map((text, i) => {
        const angle = -Math.PI / 2 + i * Math.PI * 2 / short.length + diamond * .3;
        const [x, y] = orbitPoint(angle);
        const orbit = rect(x, y, Math.min(gw * .28, text.length + 4), 3);
        const source = stackRect(i);
        const compact = rect(cx, source.r + source.h / 2, orbit.w, source.h);
        return lerpRect(lerpRect(source, compact, fold), orbit, gather);
      });
      const perimeter = ss(.35, .9, gather) * (1 - release);
      if (perimeter > 0) {
        for (let i = 0; i < MAX_LINE; i++) {
          const angle = -Math.PI / 2 + i * Math.PI * 2 / MAX_LINE + diamond * .3;
          const next = -Math.PI / 2 + (i + 1) * Math.PI * 2 / MAX_LINE + diamond * .3;
          lines.push({ a: px(...orbitPoint(angle)), b: px(...orbitPoint(next)), alpha: perimeter * .65, prog: 1, pulse: this.time * .38 + i * .12, accent: i === 0 ? 1 : 0 });
        }
      }
      positions.forEach((current, i) => {
        boxes.push({ rect: current, alpha: 1 - fold, accent: i === 6 ? 1 : 0, fill: 1 });
        if (fold < .5) {
          const k = 1 - fold * 2;
          this.put(current.c + 2, current.r + 1, label(rows[i][0]), 1, .55 * k, i === 6 ? k : 0, 9);
          this.put(current.c + 11, current.r + 1, rows[i][1], 1, .95 * k, 0, current.w - 13);
        }
        nodes.push(this.toUv(...mid(current)));
      });
    }
    return { boxes, lines, nodes };
  }

  private draw() {
    if (!this.ok) return;
    const gl = this.gl, progress = this.progress, { w, h, cw, ch, dpr } = this.grid;
    const p = Math.min(1, progress / .58);
    const core = Math.min(1, p / .62);
    const morph = ss(0.08, 0.2, core);
    const sphere = 1 - ss(0.2, 0.25, core);
    const arcA = 1 - ss(0.04, 0.12, core);
    const { boxes, lines, nodes } = this.layout(p);
    if (arcA > 0) this.fillArcs(arcA);

    // the flattened sphere lands exactly where the question card appears
    const cardW = this.cardWidth(), cy = this.centerY, k = (0.92 * this.cam) / 1.6;
    const [ux0, uy0] = this.toUv(w / 2 - cardW / 2, cy - 3.5), [ux1, uy1] = this.toUv(w / 2 + cardW / 2, cy + 3.5);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, w * 2, h * 2);
    gl.useProgram(this.scene);
    const s = (n: string) => this.loc(this.scene, n);
    gl.uniform2f(s('uRes'), w * 2, h * 2);
    gl.uniform1f(s('uCellAspect'), cw / ch);
    gl.uniform1f(s('uFit'), this.fit);
    gl.uniform1f(s('uTime'), this.time);
    gl.uniform1f(s('uAngle'), this.angle);
    gl.uniform1f(s('uMorph'), morph);
    gl.uniform1f(s('uCam'), this.cam);
    gl.uniform1f(s('uSphere'), sphere);
    gl.uniform1f(s('uComet'), 1 - ss(0.03, 0.1, core));
    gl.uniform1f(s('uArcA'), arcA);
    gl.uniform1f(s('uDust'), Math.max(ss(0.46, 0.56, core) * (1 - ss(0.68, 0.78, core)), ss(.67, .73, p) * (1 - ss(.85, .94, p))));
    gl.uniform1f(s('uCosmos'), ss(.60, .71, p));
    gl.uniform1f(s('uResolve'), ss(.84, .97, p));
    gl.uniform1f(s('uBlast'), ss(.84, .97, p));
    gl.uniform1f(s('uExtra'), Math.max(0, Math.min(1, (progress - .58) / .42)));
    gl.uniform2f(s('uBoxC'), ((ux0 + ux1) / 2) * k, ((uy0 + uy1) / 2) * k);
    gl.uniform2f(s('uBoxW'), (Math.abs(ux1 - ux0) / 2) * k, (Math.abs(uy1 - uy0) / 2) * k);
    gl.uniform3fv(s('uArc'), this.arcBuf);
    const nb = new Float32Array(12).fill(9);
    nodes.slice(0, 6).forEach(([x, y], i) => { nb[i * 2] = x; nb[i * 2 + 1] = y; });
    gl.uniform2fv(s('uNode'), nb);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.glyph);
    const g = (n: string) => this.loc(this.glyph, n);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.cellsTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.sheetTex);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, this.textTex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, this.text);
    gl.uniform1i(g('tCells'), 0); gl.uniform1i(g('tSheet'), 1); gl.uniform1i(g('tText'), 2);
    gl.uniform2f(g('uGrid'), w, h);
    gl.uniform2f(g('uCell'), cw, ch);
    gl.uniform2f(g('uRes'), this.canvas.width, this.canvas.height);
    gl.uniform1f(g('uN'), SHEET_CHARS.length);
    gl.uniform1f(g('uTime'), this.time);
    gl.uniform1f(g('uDpr'), dpr);
    gl.uniform1f(g('uHeroDim'), 1 - ss(0.02, 0.08, core));
    gl.uniform1fv(g('uRamp'), new Float32Array(RAMP_INDEX));
    const bx = new Float32Array(MAX_BOX * 4), bp = new Float32Array(MAX_BOX * 4);
    boxes.slice(0, MAX_BOX).forEach(({ rect: r, alpha, accent, fill }, i) => {
      const c0 = Math.round(r.c), r0 = Math.round(r.r), bw = Math.round(r.w), bh = Math.round(r.h);
      bx.set([c0 * cw, (h - r0 - bh) * ch, (c0 + bw) * cw, (h - r0) * ch], i * 4);
      bp.set([alpha, accent, fill, 0], i * 4);
    });
    gl.uniform4fv(g('uBox'), bx); gl.uniform4fv(g('uBoxP'), bp);
    const lx = new Float32Array(MAX_LINE * 4), lp = new Float32Array(MAX_LINE * 4);
    lines.slice(0, MAX_LINE).forEach((l, i) => {
      lx.set([l.a[0], l.a[1], l.b[0], l.b[1]], i * 4);
      lp.set([l.alpha, l.prog, l.pulse, l.accent], i * 4);
    });
    gl.uniform4fv(g('uLine'), lx); gl.uniform4fv(g('uLineP'), lp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private lastRaf = 0;

  private tick = (now: number) => {
    this.frame = 0;
    // Report the real frame spacing (so a device that cannot keep up is noticed), then keep to the
    // frame rate its tier allows: a steady 30 fps looks smoother than an uneven 45.
    if (this.lastRaf) reportFrame(now - this.lastRaf);
    this.lastRaf = now;
    if (decorHeld()) { this.last = 0; this.frame = requestAnimationFrame(this.tick); return; }
    const interval = frameInterval();
    if (interval && this.last && now - this.last < interval - 2) { this.frame = requestAnimationFrame(this.tick); return; }
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    this.time += dt;
    this.angle += dt * 0.16;
    this.progress += (this.targetProgress - this.progress) * (1 - Math.exp(-dt * 14));
    this.draw();
    this.frame = requestAnimationFrame(this.tick);
  };

  start() {
    if (!this.ok) return;
    if (this.reduced) { this.time = 2; this.draw(); return; }
    if (!this.frame) { this.last = 0; this.lastRaf = 0; this.frame = requestAnimationFrame(this.tick); }
  }

  stop() { if (this.frame) cancelAnimationFrame(this.frame); this.frame = 0; }

  setProgress(p: number) {
    this.targetProgress = p;
    if (this.reduced || !this.frame) { this.progress = p; this.draw(); }
  }

  dispose() {
    this.stop();
    if (!this.gl) return;
    this.gl.deleteProgram(this.scene);
    this.gl.deleteProgram(this.glyph);
    this.gl.deleteFramebuffer(this.fbo);
    this.gl.deleteTexture(this.cellsTex);
    this.gl.deleteTexture(this.sheetTex);
    this.gl.deleteTexture(this.textTex);
  }
}
