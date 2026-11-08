// The three "Work that follows the signal" scenes, in the hero card's language:
// CRT card, typed query, live agent status, streamed reasoning, cited output.
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { Activity, BookOpen, Check, FileText, History, ScanSearch, Wrench } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const TYPE_MS = 34;

/** Looping clock in ms that only advances while the scene is on screen. */
function useLoop(total: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setMs(total - 2000); return undefined; }
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    if (ref.current) io.observe(ref.current);
    const timer = window.setInterval(() => { if (visible && !document.hidden) setMs((v) => (v + 50) % total); }, 50);
    return () => { window.clearInterval(timer); io.disconnect(); };
  }, [total]);
  return [ms, ref] as const;
}

const at = (ms: number, start: number, span = 1) => Math.min(1, Math.max(0, (ms - start) / span));

function Seed({ icon, text, ms, slot, slotState = '' }: { icon: ReactNode; text: string; ms: number; slot: string; slotState?: string }) {
  const typed = text.slice(0, Math.floor(ms / TYPE_MS));
  const typing = typed.length < text.length;
  return (
    <div className="hs-seed">
      <span className="hs-seed-ico">{icon}</span>
      <span className="hs-seed-id">{typed}<span className={`hs-caret${typing ? '' : ' is-hidden'}`} /></span>
      <span className={`hs-slot ${slotState}`} key={slot}><span className="hs-slot-label">{slot}</span><span className="hs-slot-dot" /></span>
    </div>
  );
}

const copy = {
  en: {
    signal: {
      seed: 'CNC-07 spindle, live', streaming: 'Signal agent: streaming 3 signals', alert: 'Anomaly detected',
      rows: [['Vibration RMS', 'mm/s'], ['Bearing temperature', '°C'], ['Spindle load', '%']],
      finding: 'Vibration 3.7× baseline at 147 Hz, the outer-race frequency of bearing 6205-2RS',
    },
    reason: {
      seed: 'Why is CNC-07 vibrating?', working: 'Reasoning across 4 sources', done: 'Root cause found',
      thinking: 'Thinking',
      thoughts: [
        'Comparing the 147 Hz peak with bearing failure frequencies',
        'Checking the last service of this spindle',
        'Ruling out imbalance: no 1× rotation peak',
      ],
      sources: [
        ['Manual, §4.3', 'Outer-race wear shows as a peak near 147 Hz with rising temperature.'],
        ['Work order WO-1874', 'Bearing 6205-2RS replaced 14 months ago, rated for 12.'],
        ['Sensor spec', 'Accelerometer on drive end, sampled at 2 kHz.'],
      ],
      answer: 'Likely outer-race wear on bearing 6205-2RS',
      confidence: '82% confidence',
    },
    order: {
      seed: 'Draft a work order for CNC-07', working: 'Planner agent: drafting', done: 'Approved',
      title: 'Work order WO-2291',
      fields: [
        ['Asset', 'CNC-07, spindle drive end'],
        ['Task', 'Replace bearing 6205-2RS'],
        ['Parts', '1 × 6205-2RS, bay B-12, reserved'],
        ['Assignee', 'M. Huber, maintenance'],
        ['Window', 'Tue 06:00 shift, 1.5 h'],
      ],
      evidence: 'Evidence',
      approve: 'Approve work order',
      approved: 'Approved, sent to CMMS',
    },
  },
  de: {
    signal: {
      seed: 'CNC-07 Spindel, live', streaming: 'Signal-Agent: 3 Signale live', alert: 'Anomalie erkannt',
      rows: [['Vibration RMS', 'mm/s'], ['Lagertemperatur', '°C'], ['Spindellast', '%']],
      finding: 'Vibration 3,7× über Basis bei 147 Hz, der Außenring-Frequenz von Lager 6205-2RS',
    },
    reason: {
      seed: 'Warum vibriert CNC-07?', working: 'Folgert über 4 Quellen', done: 'Ursache gefunden',
      thinking: 'Denkt nach',
      thoughts: [
        'Vergleicht den 147-Hz-Peak mit Lager-Fehlerfrequenzen',
        'Prüft die letzte Wartung dieser Spindel',
        'Schließt Unwucht aus: kein 1×-Drehzahlpeak',
      ],
      sources: [
        ['Handbuch, §4.3', 'Außenringverschleiß zeigt sich als Peak nahe 147 Hz bei steigender Temperatur.'],
        ['Auftrag WO-1874', 'Lager 6205-2RS vor 14 Monaten getauscht, ausgelegt für 12.'],
        ['Sensordaten', 'Beschleunigungssensor am Antrieb, 2 kHz Abtastung.'],
      ],
      answer: 'Wahrscheinlich Außenringverschleiß an Lager 6205-2RS',
      confidence: '82 % Konfidenz',
    },
    order: {
      seed: 'Arbeitsauftrag für CNC-07 erstellen', working: 'Planungs-Agent: erstellt', done: 'Freigegeben',
      title: 'Arbeitsauftrag WO-2291',
      fields: [
        ['Anlage', 'CNC-07, Spindel Antriebsseite'],
        ['Aufgabe', 'Lager 6205-2RS tauschen'],
        ['Teile', '1 × 6205-2RS, Fach B-12, reserviert'],
        ['Zuständig', 'M. Huber, Instandhaltung'],
        ['Zeitfenster', 'Di 06:00 Schicht, 1,5 h'],
      ],
      evidence: 'Belege',
      approve: 'Auftrag freigeben',
      approved: 'Freigegeben, an CMMS gesendet',
    },
  },
};

function useSceneCopy() {
  const { language } = useLanguage();
  return copy[language === 'de' ? 'de' : 'en'];
}

/* ---------- 1. Live signal monitor ---------- */

const SPARK_POINTS = 64;
function sparkPath(seed: number, spikeFrom: number, spikeGain: number) {
  let d = '';
  for (let i = 0; i < SPARK_POINTS; i++) {
    const x = (i / (SPARK_POINTS - 1)) * 300;
    const base = 26 + Math.sin(i * 0.9 + seed) * 4 + Math.sin(i * 2.3 + seed * 2) * 2.5;
    const spike = i > spikeFrom ? Math.sin(i * 1.7 + seed) * spikeGain * ((i - spikeFrom) / (SPARK_POINTS - spikeFrom)) - spikeGain * 0.35 * ((i - spikeFrom) / (SPARK_POINTS - spikeFrom)) : 0;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${(base + spike).toFixed(1)}`;
  }
  return d;
}
const SPARKS = [sparkPath(0, 38, 18), sparkPath(2, 44, 7), sparkPath(4, 60, 1)];
const VALUES: [number, number][] = [[2.1, 7.8], [62, 84], [71, 74]];

export function SignalMonitorScene() {
  const c = useSceneCopy().signal;
  const total = 9000;
  const [ms, ref] = useLoop(total);
  const start = c.seed.length * TYPE_MS + 250;
  const draw = at(ms, start, 4200);
  const alert = draw > 0.68;
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<Activity size={14} strokeWidth={1.75} />} text={c.seed} ms={ms} slot={alert ? c.alert : c.streaming} slotState={alert ? 'is-hot' : ''} />
      <div className="hs-sig">
        {c.rows.map(([label, unit], i) => {
          const hot = alert && i < 2;
          const [from, to] = VALUES[i];
          const v = from + (to - from) * Math.max(0, (draw - 0.55) / 0.45);
          return (
            <div className={`hs-sig-row${hot ? ' is-hot' : ''}`} key={label}>
              <div className="hs-sig-head">
                <span>{label}</span>
                <strong>{v.toFixed(i === 0 ? 1 : 0)}<small>{unit}</small></strong>
              </div>
              <svg viewBox="0 0 300 52" preserveAspectRatio="none" aria-hidden="true">
                <path className="hs-sig-grid" d="M0 26H300" />
                <path className="hs-sig-line" d={SPARKS[i]} pathLength={1} style={{ strokeDashoffset: 1 - draw } as CSSProperties} />
              </svg>
            </div>
          );
        })}
      </div>
      <div className={`hs-sig-finding${alert ? ' is-in' : ''}`}><ScanSearch size={14} strokeWidth={1.75} />{c.finding}</div>
    </div>
  );
}

/* ---------- 2. Reasoning across knowledge ---------- */

export function ReasoningScene() {
  const c = useSceneCopy().reason;
  const total = 10500;
  const [ms, ref] = useLoop(total);
  const start = c.seed.length * TYPE_MS + 250;
  const thought = Math.floor((ms - start) / 900);
  const srcStart = start + c.thoughts.length * 900;
  const src = Math.floor((ms - srcStart) / 650);
  const answered = ms > srcStart + c.sources.length * 650 + 300;
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<BookOpen size={14} strokeWidth={1.75} />} text={c.seed} ms={ms} slot={answered ? c.done : c.working} slotState={answered ? 'is-done' : ''} />
      <div className="hs-think">
        <span className="hs-think-label">{c.thinking}</span>
        {c.thoughts.map((t, i) => (
          <p className={`hs-think-line${i < thought ? ' is-past' : i === thought ? ' is-now' : ''}`} key={t}>{t}</p>
        ))}
      </div>
      <div className="hs-srcs">
        {c.sources.map(([name, text], i) => (
          <div className={`hs-src${i < src ? ' is-in' : ''}`} key={name}>
            <span className="hs-src-n">{i + 1}</span>
            <span className="hs-src-body"><strong>{i === 1 ? <History size={12} /> : <FileText size={12} />}{name}</strong><span><mark>{text}</mark></span></span>
          </div>
        ))}
      </div>
      <div className={`hs-answer${answered ? ' is-in' : ''}`}>
        <strong>{c.answer}</strong>
        <span>{c.confidence}<i>1</i><i>2</i><i>3</i></span>
      </div>
    </div>
  );
}

/* ---------- 3. Work order, drafted and approved ---------- */

export function WorkOrderScene() {
  const c = useSceneCopy().order;
  const total = 10000;
  const [ms, ref] = useLoop(total);
  const start = c.seed.length * TYPE_MS + 250;
  const FIELD_MS = 620;
  const filled = Math.floor((ms - start) / FIELD_MS);
  const fieldsEnd = start + c.fields.length * FIELD_MS;
  const ready = ms > fieldsEnd + 200;
  const approved = ms > fieldsEnd + 1700;
  return (
    <div className="hs-crt hs-scene" ref={ref}>
      <Seed icon={<Wrench size={14} strokeWidth={1.75} />} text={c.seed} ms={ms} slot={approved ? c.done : c.working} slotState={approved ? 'is-done' : ''} />
      <div className="hs-wo">
        <div className="hs-wo-title"><span>{c.title}</span><em>{ready ? 'P2' : '…'}</em></div>
        {c.fields.map(([k, v], i) => {
          const local = ms - start - i * FIELD_MS;
          const shown = i < filled ? v : i === filled ? v.slice(0, Math.max(0, Math.floor(local / 18))) : '';
          return (
            <div className={`hs-wo-field${i <= filled ? ' is-in' : ''}`} key={k}>
              <span>{k}</span>
              <strong>{shown}{i === filled && shown.length < v.length && <span className="hs-caret" />}</strong>
            </div>
          );
        })}
        <div className={`hs-wo-evidence${ready ? ' is-in' : ''}`}>
          <span>{c.evidence}</span>
          <i>1</i><i>2</i><i>3</i>
        </div>
        <div className={`hs-wo-approve${ready ? ' is-ready' : ''}${approved ? ' is-done' : ''}`}>
          {approved ? <><Check size={14} strokeWidth={2} />{c.approved}</> : c.approve}
        </div>
      </div>
    </div>
  );
}

export const STORY_SCENES = [SignalMonitorScene, ReasoningScene, WorkOrderScene];
