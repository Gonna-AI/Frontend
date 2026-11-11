import { useEffect, useId, useState } from 'react';

/**
 * The Hive mark: three cells meeting at one point, three orbits, and the wordmark, drawn entirely
 * as vectors (no font, no image). `mark` drops the wordmark and the wide orbit for compact uses.
 * The orbiting points travel their orbits slowly; they rest for visitors who prefer reduced motion.
 * Standalone, static copies live in public/brand/hive-logo.svg and hive-mark.svg.
 */

type Dot = { orbit: string; r: number; path: string; dur: number; at: number; x: number; y: number };

const DOTS: Dot[] = [
  {
    orbit: 'a',
    r: 7.5,
    path: 'M1393.7 428.4 A562 130 -2 1 1 270.3 467.6 A562 130 -2 1 1 1393.7 428.4Z',
    dur: 70,
    at: 0.9971,
    x: 1392.7,
    y: 421.6
  },
  {
    orbit: 'a',
    r: 5,
    path: 'M1393.7 428.4 A562 130 -2 1 1 270.3 467.6 A562 130 -2 1 1 1393.7 428.4Z',
    dur: 70,
    at: 0.2253,
    x: 895.2,
    y: 575.2
  },
  {
    orbit: 'b',
    r: 7,
    path: 'M699.9 230.3 A262 98 -49 1 1 356.1 625.7 A262 98 -49 1 1 699.9 230.3Z',
    dur: 46,
    at: 0.9787,
    x: 676.9,
    y: 220.6
  },
  {
    orbit: 'c',
    r: 6.5,
    path: 'M731.7 525.0 A236 100 11 1 1 268.3 435.0 A236 100 11 1 1 731.7 525.0Z',
    dur: 38,
    at: 0.4463,
    x: 288.1,
    y: 488.2
  }
];

type Props = { className?: string; mark?: boolean; title?: string; animate?: boolean };

export default function HiveLogo({ className, mark = false, title = 'Hive by ClerkTree', animate = true }: Props) {
  const p = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMoving(true);
  }, [animate]);

  return (
    <svg className={className} viewBox={mark ? '250 190 520 470' : '250 190 1170 470'} role="img" aria-label={title} focusable="false" xmlns="http://www.w3.org/2000/svg">
      <defs>
    <radialGradient id={`${p}Edge`} gradientUnits="userSpaceOnUse" cx="532.0" cy="447.0" r="168">
      <stop offset="0" stopColor="#ffd089"/><stop offset=".22" stopColor="#ff9a2e"/><stop offset=".6" stopColor="#cfa57a"/><stop offset="1" stopColor="#cfcac2"/>
    </radialGradient>
    <radialGradient id={`${p}Face`} gradientUnits="userSpaceOnUse" cx="532.0" cy="447.0" r="120">
      <stop offset="0" stopColor="#ff8a1f" stopOpacity=".34"/><stop offset=".55" stopColor="#ff7a10" stopOpacity=".08"/><stop offset="1" stopColor="#fff" stopOpacity=".02"/>
    </radialGradient>
    <radialGradient id={`${p}Core`} gradientUnits="userSpaceOnUse" cx="532.0" cy="447.0" r="46">
      <stop offset="0" stopColor="#fffaf0"/><stop offset=".18" stopColor="#ffd58a"/><stop offset=".5" stopColor="#ff8a1f" stopOpacity=".55"/><stop offset="1" stopColor="#ff7a10" stopOpacity="0"/>
    </radialGradient>
    <radialGradient id={`${p}DotGlow`}><stop offset="0" stopColor="#ff9a2e" stopOpacity=".85"/><stop offset="1" stopColor="#ff9a2e" stopOpacity="0"/></radialGradient>
    <linearGradient id={`${p}OrbitA`} gradientUnits="userSpaceOnUse" x1="280" y1="0" x2="1400" y2="0">
      <stop offset="0" stopColor="#d9d4cb" stopOpacity=".55"/><stop offset=".55" stopColor="#d9d4cb" stopOpacity=".3"/><stop offset="1" stopColor="#ff9a2e" stopOpacity=".95"/>
    </linearGradient>
    <linearGradient id={`${p}OrbitB`} gradientUnits="userSpaceOnUse" x1="320" y1="590" x2="740" y2="270">
      <stop offset="0" stopColor="#ff9a2e" stopOpacity=".95"/><stop offset=".5" stopColor="#d9d4cb" stopOpacity=".45"/><stop offset="1" stopColor="#e8c9a0" stopOpacity=".75"/>
    </linearGradient>
    <linearGradient id={`${p}OrbitC`} gradientUnits="userSpaceOnUse" x1="270" y1="520" x2="760" y2="440">
      <stop offset="0" stopColor="#d9d4cb" stopOpacity=".5"/><stop offset=".5" stopColor="#ff9a2e" stopOpacity=".6"/><stop offset="1" stopColor="#d9d4cb" stopOpacity=".15"/>
    </linearGradient>
    <linearGradient id={`${p}Word`} gradientUnits="userSpaceOnUse" x1="790" y1="390" x2="1290" y2="505"><stop offset="0" stopColor="#f6f2ea"/><stop offset="1" stopColor="#d9d4cb"/></linearGradient>
    <filter id={`${p}Glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id={`${p}Halo`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  {/* warm halo behind the cluster */}
  <circle cx="532.0" cy="447.0" r="120" fill="#ff7a10" opacity=".16" filter={`url(#${p}Halo)`}/>
  {/* orbits */}
  <g fill="none" strokeWidth="1.6">
    {!mark && (<ellipse cx="832" cy="448" rx="562" ry="130" transform="rotate(-2 832 448)" stroke={`url(#${p}OrbitA)`}/>)}
    <ellipse cx="528" cy="428" rx="262" ry="98" transform="rotate(-49 528 428)" stroke={`url(#${p}OrbitB)`}/>
    <ellipse cx="500" cy="480" rx="236" ry="100" transform="rotate(11 500 480)" stroke={`url(#${p}OrbitC)`}/>
  </g>
  {/* the three cells */}
  <g fill={`url(#${p}Face)`} stroke="none"><path d="M539.8 293.0 Q532.0 288.5 524.2 293.0 L471.8 323.2 Q464.0 327.8 464.0 336.8 L464.0 397.2 Q464.0 406.2 471.8 410.8 L524.2 441.0 Q532.0 445.5 539.8 441.0 L592.2 410.8 Q600.0 406.3 600.0 397.3 L600.0 336.8 Q600.0 327.8 592.2 323.2 Z"/><path d="M470.5 413.0 Q462.7 408.5 454.9 413.0 L402.5 443.2 Q394.7 447.8 394.7 456.8 L394.7 517.2 Q394.7 526.2 402.5 530.8 L454.9 561.0 Q462.7 565.5 470.5 561.0 L522.9 530.8 Q530.7 526.2 530.7 517.2 L530.7 456.8 Q530.7 447.8 522.9 443.2 Z"/><path d="M609.1 413.0 Q601.3 408.5 593.5 413.0 L541.1 443.2 Q533.3 447.8 533.3 456.8 L533.3 517.2 Q533.3 526.2 541.1 530.8 L593.5 561.0 Q601.3 565.5 609.1 561.0 L661.5 530.8 Q669.3 526.2 669.3 517.2 L669.3 456.8 Q669.3 447.8 661.5 443.2 Z"/></g>
  <g fill="none" stroke="#ff8a1f" strokeWidth="5" opacity=".55" filter={`url(#${p}Glow)`}><path d="M539.8 293.0 Q532.0 288.5 524.2 293.0 L471.8 323.2 Q464.0 327.8 464.0 336.8 L464.0 397.2 Q464.0 406.2 471.8 410.8 L524.2 441.0 Q532.0 445.5 539.8 441.0 L592.2 410.8 Q600.0 406.3 600.0 397.3 L600.0 336.8 Q600.0 327.8 592.2 323.2 Z"/><path d="M470.5 413.0 Q462.7 408.5 454.9 413.0 L402.5 443.2 Q394.7 447.8 394.7 456.8 L394.7 517.2 Q394.7 526.2 402.5 530.8 L454.9 561.0 Q462.7 565.5 470.5 561.0 L522.9 530.8 Q530.7 526.2 530.7 517.2 L530.7 456.8 Q530.7 447.8 522.9 443.2 Z"/><path d="M609.1 413.0 Q601.3 408.5 593.5 413.0 L541.1 443.2 Q533.3 447.8 533.3 456.8 L533.3 517.2 Q533.3 526.2 541.1 530.8 L593.5 561.0 Q601.3 565.5 609.1 561.0 L661.5 530.8 Q669.3 526.2 669.3 517.2 L669.3 456.8 Q669.3 447.8 661.5 443.2 Z"/></g>
  <g fill="none" stroke={`url(#${p}Edge)`} strokeWidth="2.6" strokeLinejoin="round"><path d="M539.8 293.0 Q532.0 288.5 524.2 293.0 L471.8 323.2 Q464.0 327.8 464.0 336.8 L464.0 397.2 Q464.0 406.2 471.8 410.8 L524.2 441.0 Q532.0 445.5 539.8 441.0 L592.2 410.8 Q600.0 406.3 600.0 397.3 L600.0 336.8 Q600.0 327.8 592.2 323.2 Z"/><path d="M470.5 413.0 Q462.7 408.5 454.9 413.0 L402.5 443.2 Q394.7 447.8 394.7 456.8 L394.7 517.2 Q394.7 526.2 402.5 530.8 L454.9 561.0 Q462.7 565.5 470.5 561.0 L522.9 530.8 Q530.7 526.2 530.7 517.2 L530.7 456.8 Q530.7 447.8 522.9 443.2 Z"/><path d="M609.1 413.0 Q601.3 408.5 593.5 413.0 L541.1 443.2 Q533.3 447.8 533.3 456.8 L533.3 517.2 Q533.3 526.2 541.1 530.8 L593.5 561.0 Q601.3 565.5 609.1 561.0 L661.5 530.8 Q669.3 526.2 669.3 517.2 L669.3 456.8 Q669.3 447.8 661.5 443.2 Z"/></g>
  <g fill="none" stroke="#ff9a2e" strokeWidth="1" opacity=".38"><path d="M537.2 315.1 Q532.0 312.1 526.8 315.1 L489.6 336.5 Q484.4 339.5 484.4 345.5 L484.4 388.5 Q484.4 394.5 489.6 397.5 L526.8 418.9 Q532.0 421.9 537.2 418.9 L574.4 397.5 Q579.6 394.5 579.6 388.5 L579.6 345.5 Q579.6 339.5 574.4 336.5 Z"/><path d="M467.9 435.1 Q462.7 432.1 457.5 435.1 L420.3 456.5 Q415.1 459.5 415.1 465.5 L415.1 508.5 Q415.1 514.5 420.3 517.5 L457.5 539.0 Q462.7 542.0 467.9 539.0 L505.1 517.5 Q510.3 514.5 510.3 508.5 L510.3 465.5 Q510.3 459.5 505.1 456.5 Z"/><path d="M606.5 435.1 Q601.3 432.1 596.1 435.1 L558.9 456.5 Q553.7 459.5 553.7 465.5 L553.7 508.5 Q553.7 514.5 558.9 517.5 L596.1 539.0 Q601.3 542.0 606.5 539.0 L643.7 517.5 Q648.9 514.5 648.9 508.5 L648.9 465.5 Q648.9 459.5 643.7 456.5 Z"/></g>
  <g stroke="#ffb454" strokeWidth=".8" opacity=".35"><line x1="532.0" y1="447.0" x2="532.0" y2="447.0"/><line x1="532.0" y1="447.0" x2="532.0" y2="447.0"/><line x1="532.0" y1="447.0" x2="532.0" y2="447.0"/></g>
  <g fill="none" stroke="#ffc27a" strokeWidth=".9" strokeLinecap="round" opacity=".3"><path d="M532.0 447.0 Q550.9 385.0 544.6 323.0"/><path d="M532.0 447.0 Q515.8 385.0 521.2 323.0"/><path d="M532.0 447.0 Q468.9 461.6 418.3 498.1"/><path d="M532.0 447.0 Q486.4 492.0 430.0 518.4"/><path d="M532.0 447.0 Q576.2 494.4 633.1 519.9"/><path d="M532.0 447.0 Q593.8 464.0 644.8 499.6"/></g>
  {/* the shared vertex */}
  <circle cx="532.0" cy="447.0" r="46" fill={`url(#${p}Core)`}/>
  <g stroke="#fff3d9" strokeLinecap="round"><line x1="506.0" y1="447.0" x2="558.0" y2="447.0" strokeWidth="1.2" opacity=".7"/><line x1="532.0" y1="421.0" x2="532.0" y2="473.0" strokeWidth="1.2" opacity=".7"/></g>
  
  
{!mark && (<>
  <g fill="none" stroke={`url(#${p}Word)`} strokeWidth="7.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M800 396 V500 M800 454 Q800 431 823 431 H866 Q889 431 889 454 V500"/>
    <path d="M962 431 V500"/>
    <path d="M1031 431 L1073 500 L1115 431"/>
    <path d="M1193 467 H1279 V454 Q1279 431 1256 431 H1216 Q1193 431 1193 454 V477 Q1193 500 1216 500 H1279"/>
  </g>
  <rect x="955.5" y="395" width="13" height="13" rx="3.4" fill="#ff9a2e"/>
</>)}
      {DOTS.filter((d) => !(mark && d.orbit === 'a')).map((d) => (
        <g key={`${d.orbit}${d.at}`} transform={moving ? undefined : `translate(${d.x} ${d.y})`}>
          <circle r={d.r * 2.6} fill={`url(#${p}DotGlow)`} />
          <circle r={d.r} fill="#ffb454" />
          <circle r={d.r * 0.45} fill="#fff1d6" />
          {moving && <animateMotion dur={`${d.dur}s`} begin={`-${(d.at * d.dur).toFixed(2)}s`} repeatCount="indefinite" path={d.path} />}
        </g>
      ))}
    </svg>
  );
}
