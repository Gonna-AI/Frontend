// Source graph shown on the hero card after the agents finish: the cited sources
// assemble around the work order, then the camera flies to individual citations
// and pulls back as evidence flows into the answer.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Activity, BookOpen, ClipboardList, History, Package } from 'lucide-react';

export type GraphCopy = {
  answer: string;
  answerSub: string;
  verified: string;
  sources: Record<'sig' | 'man' | 'his' | 'par', string>;
  leaves: string[];
  manual: { head: string; before: string; mark: string; after: string };
  signal: { head: string; value: string };
  history: { head: string; body: string };
};

const W = 1000;
const H = 440;
// Positions are authored on a 600-tall grid and flattened to fit the wide card.
const fy = (y: number) => Math.round(220 + (y - 300) * 0.7);
export const GRAPH_MS = 8700;
// Stage starts within the graph phase (ms).
const STAGES = [650, 1500, 2700, 4000, 5300, 6600, 8150];

type Pt = { x: number; y: number };
const ANSWER: Pt = { x: 500, y: fy(300) };
const SOURCES = {
  sig: { x: 255, y: fy(150), Icon: Activity },
  man: { x: 745, y: fy(145), Icon: BookOpen },
  his: { x: 760, y: fy(455), Icon: History },
  par: { x: 245, y: fy(460), Icon: Package },
} as const;
type SourceId = keyof typeof SOURCES;
const LEAVES: { p: SourceId; x: number; y: number }[] = [
  { p: 'sig', x: 115, y: fy(55) }, { p: 'sig', x: 105, y: fy(255) },
  { p: 'man', x: 885, y: fy(50) }, { p: 'man', x: 900, y: fy(250) },
  { p: 'his', x: 905, y: fy(390) }, { p: 'his', x: 880, y: fy(560) }, { p: 'his', x: 610, y: fy(555) },
  { p: 'par', x: 100, y: fy(385) }, { p: 'par', x: 140, y: fy(560) },
];

/** Measures the card area the camera frames. */
function useViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 260 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/** Centre the world on c at scale s, optionally rolled by r degrees around the viewport centre. */
const camera = (size: { w: number; h: number }, c: Pt, s: number, r = 0): CSSProperties => ({
  transform: `translate(${size.w / 2}px, ${size.h / 2}px) rotate(${r}deg) scale(${s}) translate(${-c.x}px, ${-c.y}px)`,
});

const curve = (a: Pt, b: Pt) => {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y}Q${mx + (b.y - a.y) * 0.14} ${my - (b.x - a.x) * 0.14} ${b.x} ${b.y}`;
};

export default function SourceGraph({ gms, copy }: { gms: number; copy: GraphCopy }) {
  const [ref, size] = useViewport();
  const stage = STAGES.filter((t) => gms >= t).length;
  const fit = Math.min(size.w / (W + 60), size.h / (H + 30));
  const zoom = Math.min(1, fit * 2.1);
  const cams: [Pt, number][] = [
    [ANSWER, Math.min(1, fit * 2.4)],
    [ANSWER, fit],
    [{ x: 500, y: ANSWER.y + 4 }, fit * 1.04],
    [{ x: SOURCES.man.x, y: SOURCES.man.y + 60 }, zoom],
    [{ x: SOURCES.sig.x, y: SOURCES.sig.y + 62 }, zoom],
    [{ x: SOURCES.his.x + 40, y: SOURCES.his.y - 80 }, zoom],
    [ANSWER, fit],
    [ANSWER, 1.6],
  ];
  const [c, s] = cams[Math.min(stage, cams.length - 1)];
  const world = camera(size, c, s);

  const focus: SourceId | null = stage === 3 ? 'man' : stage === 4 ? 'sig' : stage === 5 ? 'his' : null;
  const dim = (id: SourceId) => (focus && focus !== id ? ' is-dim' : '');
  const flowing = stage >= 6;

  return (
    <div className={`hs-graph${stage >= 7 ? ' is-out' : ''}`} ref={ref}>
      <div className="hs-gw" style={world}>
        <svg className="hs-gedges" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {(Object.keys(SOURCES) as SourceId[]).map((id) => {
            const d = curve(SOURCES[id], ANSWER);
            return (
              <g className={`hs-ge${stage >= 1 ? ' is-in' : ''}${dim(id)}`} key={id}>
                <path d={d} pathLength={1} />
                <path className="hs-gp" d={d} pathLength={1} style={{ animationDelay: `${Object.keys(SOURCES).indexOf(id) * -0.4}s` }} />
              </g>
            );
          })}
          {LEAVES.map((l, i) => {
            const d = curve(l, SOURCES[l.p]);
            return (
              <g className={`hs-ge is-leaf${stage >= 2 ? ' is-in' : ''}${dim(l.p)}${flowing ? ' is-flow' : ''}`} key={i} style={{ '--d': `${i * 45}ms` } as CSSProperties}>
                <path d={d} pathLength={1} />
                <path className="hs-gp" d={d} pathLength={1} style={{ animationDelay: `${i * -0.23}s` }} />
              </g>
            );
          })}
        </svg>

        {LEAVES.map((l, i) => (
          <span className={`hs-gn is-leaf${stage >= 2 ? ' is-in' : ''}${dim(l.p)}`} key={i} style={{ left: l.x, top: l.y, '--d': `${120 + i * 45}ms` } as CSSProperties}>
            <i />{copy.leaves[i]}
          </span>
        ))}
        {(Object.keys(SOURCES) as SourceId[]).map((id, i) => {
          const { x, y, Icon } = SOURCES[id];
          return (
            <span className={`hs-gn is-src${stage >= 1 ? ' is-in' : ''}${focus === id ? ' is-focus' : ''}${dim(id)}`} key={id} style={{ left: x, top: y, '--d': `${i * 70}ms` } as CSSProperties}>
              <b><Icon size={15} strokeWidth={1.75} /></b>{copy.sources[id]}
            </span>
          );
        })}
        <span className={`hs-gn is-answer is-in${flowing ? ' is-ok' : ''}${focus ? ' is-dim' : ''}`} style={{ left: ANSWER.x, top: ANSWER.y }}>
          <b><ClipboardList size={17} strokeWidth={1.75} /></b>
          <span>{copy.answer}<small>{flowing ? copy.verified : copy.answerSub}</small></span>
        </span>

        <div className={`hs-gc${stage === 3 ? ' is-in' : ''}`} style={{ left: SOURCES.man.x, top: SOURCES.man.y + 42 }}>
          <em>{copy.manual.head}</em>
          <p>{copy.manual.before}<mark>{copy.manual.mark}</mark>{copy.manual.after}</p>
        </div>
        <div className={`hs-gc${stage === 4 ? ' is-in' : ''}`} style={{ left: SOURCES.sig.x, top: SOURCES.sig.y + 42 }}>
          <em>{copy.signal.head}</em>
          <svg className="hs-gspark" viewBox="0 0 240 54" aria-hidden="true">
            <path className="hs-glimit" d="M0 30H240" />
            <path d="M0 46L20 45L40 47L60 44L80 45L100 42L120 43L140 38L160 33L180 27L200 19L220 12L240 7" pathLength={1} />
          </svg>
          <p><strong>{copy.signal.value}</strong></p>
        </div>
        <div className={`hs-gc${stage === 5 ? ' is-in' : ''}`} style={{ left: SOURCES.his.x + 70, top: SOURCES.his.y - 185 }}>
          <em>{copy.history.head}</em>
          <p>{copy.history.body}</p>
        </div>
      </div>
    </div>
  );
}

/** Seed-bar label for the graph phase. */
export function graphSlot(gms: number, labels: { building: string; tracing: string; verified: string }) {
  if (gms < STAGES[2]) return labels.building;
  if (gms < STAGES[5]) return labels.tracing;
  return labels.verified;
}

/* ---------------- Follow-up scene: a cause-and-effect chain the camera tracks along ---------------- */

export type ChainGraphCopy = {
  nodes: [string, string, string, string];
  root: string;
  fix: string;
  chips: string[];
};

export const CHAIN_MS = 7600;
const CHAIN_STAGES = [900, 2000, 3100, 4500, 6300, 7100];
const CW = 1270;
const CH = 440;
const LINKS: Pt[] = [{ x: 160, y: 220 }, { x: 465, y: 220 }, { x: 770, y: 220 }, { x: 1075, y: 220 }];
const FIX: Pt = { x: 1075, y: 385 };
const CHIPS: { p: number; x: number; y: number }[] = [
  { p: 0, x: 160, y: 85 }, { p: 1, x: 420, y: 360 }, { p: 1, x: 540, y: 80 },
  { p: 2, x: 770, y: 360 }, { p: 3, x: 960, y: 75 }, { p: 3, x: 1170, y: 95 },
];
const CHIP_STAGE = [1, 2, 2, 3, 4, 4];

export function CausalChain({ gms, copy }: { gms: number; copy: ChainGraphCopy }) {
  const [ref, size] = useViewport();
  const stage = CHAIN_STAGES.filter((t) => gms >= t).length;
  const fit = Math.min(size.w / (CW + 60), size.h / (CH + 30));
  const zoom = Math.min(1, fit * 2.3);
  const cams: [Pt, number, number][] = [
    [LINKS[0], zoom, -3],
    [LINKS[1], zoom, 2.5],
    [LINKS[2], zoom, -2.5],
    [{ x: LINKS[3].x, y: 200 }, zoom * 1.05, 0],
    [{ x: CW / 2, y: CH / 2 }, fit, 0],
    [FIX, 1.5, 0],
    [FIX, 1.5, 0],
  ];
  const [c, s, r] = cams[Math.min(stage, cams.length - 1)];
  const flowing = stage >= 4;

  return (
    <div className={`hs-graph is-chain${stage >= 6 ? ' is-out' : ''}`} ref={ref}>
      <div className="hs-gw is-wide" style={camera(size, c, s, r)}>
        <svg className="hs-gedges" viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} aria-hidden="true">
          {LINKS.slice(1).map((b, i) => {
            const d = curve(LINKS[i], b);
            return (
              <g className={`hs-ge is-link${stage >= i + 1 ? ' is-in' : ''}${flowing ? ' is-flow' : ''}`} key={i}>
                <path d={d} pathLength={1} />
                <path className="hs-gp" d={d} pathLength={1} style={{ animationDelay: `${i * -0.5}s` }} />
              </g>
            );
          })}
          {CHIPS.map((chip, i) => {
            const d = curve(chip, LINKS[chip.p]);
            return (
              <g className={`hs-ge is-leaf${stage >= CHIP_STAGE[i] ? ' is-in' : ''}${flowing ? ' is-flow' : ''}`} key={`c${i}`}>
                <path d={d} pathLength={1} />
                <path className="hs-gp" d={d} pathLength={1} style={{ animationDelay: `${i * -0.3}s` }} />
              </g>
            );
          })}
          <g className={`hs-ge is-fix${stage >= 4 ? ' is-in' : ''}`}>
            <path d={`M${LINKS[3].x} ${LINKS[3].y}V${FIX.y}`} pathLength={1} />
          </g>
        </svg>

        {CHIPS.map((chip, i) => (
          <span className={`hs-gn is-leaf${stage >= CHIP_STAGE[i] ? ' is-in' : ''}`} key={i} style={{ left: chip.x, top: chip.y, '--d': `${200 + (i % 2) * 120}ms` } as CSSProperties}>
            <i />{copy.chips[i]}
          </span>
        ))}
        {LINKS.map((p, i) => (
          <span
            className={`hs-gn is-src is-step${stage >= i ? ' is-in' : ''}${stage === i ? ' is-focus' : ''}${i === 3 ? ' is-root' : ''}${i === 3 && stage >= 3 ? ' is-hit' : ''}`}
            key={i}
            style={{ left: p.x, top: p.y, '--d': `${i ? 380 : 0}ms` } as CSSProperties}
          >
            <b>{String(i + 1).padStart(2, '0')}</b>{copy.nodes[i]}
            {i === 3 && <em className="hs-gtag">{copy.root}</em>}
          </span>
        ))}
        <span className={`hs-gn is-src is-fixnode${stage >= 4 ? ' is-in' : ''}`} style={{ left: FIX.x, top: FIX.y, '--d': '450ms' } as CSSProperties}>
          <b><ClipboardList size={15} strokeWidth={1.75} /></b>{copy.fix}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Answer: streamed with citations, then approved ---------------- */

export type AnswerCopy = {
  label: string;
  meta: string;
  parts: (string | number)[];
  wo: { id: string; title: string; when: string };
  approve: string;
  approved: string;
};

export const ANSWER_MS = 5600;
const STREAM_AT = 350;
const STREAM_MS = 2000;
export const ANSWER_MARKS = { card: 2300, aim: 2900, click: 3500, done: 3700, erase: 4500, out: 4800 };

export function AnswerCard({ ams, copy }: { ams: number; copy: AnswerCopy }) {
  const total = copy.parts.reduce<number>((n, p) => n + (typeof p === 'string' ? p.length : 1), 0);
  let budget = Math.floor(Math.min(1, Math.max(0, (ams - STREAM_AT) / STREAM_MS)) * total);
  const streaming = budget < total;
  const M = ANSWER_MARKS;
  return (
    <div className={`hs-answer-card${ams >= M.out ? ' is-out' : ''}`}>
      <div className="hs-ac-head"><i />{copy.label}<span>{copy.meta}</span></div>
      <p className="hs-ac-text">
        {copy.parts.map((p, i) => {
          if (budget <= 0) return null;
          if (typeof p === 'number') { budget -= 1; return <sup className="hs-cite" key={i}>{p}</sup>; }
          const shown = p.slice(0, budget);
          budget -= p.length;
          return <span key={i}>{shown}</span>;
        })}
        {streaming && <span className="hs-ac-caret" />}
      </p>
      <div className={`hs-ac-wo${ams >= M.card ? ' is-in' : ''}`}>
        <span className="hs-ac-wo-ico"><ClipboardList size={15} strokeWidth={1.75} /></span>
        <span className="hs-ac-wo-text"><b>{copy.wo.id} · {copy.wo.title}</b><small>{copy.wo.when}</small></span>
        <span className={`hs-ac-btn${ams >= M.click && ams < M.done ? ' is-press' : ''}${ams >= M.done ? ' is-ok' : ''}`}>
          {ams >= M.done ? copy.approved : copy.approve}
          <svg className={`hs-ac-cursor${ams >= M.aim ? ' is-aim' : ''}${ams >= M.done + 300 ? ' is-gone' : ''}`} viewBox="0 0 16 20" aria-hidden="true">
            <path d="M1 1L1 16L5 12L8 19L11 17.6L8 11L13.5 11Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
