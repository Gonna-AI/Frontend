// Homepage story, in narrative order:
// hero (video + agent card + logo strip) → how it works (tabs) → spotlight → case study →
// proof chart → connector panel.
import { type CSSProperties, type RefObject, useEffect, useRef, useState } from 'react';
import { Activity, ArrowRight, BookOpen, ClipboardList, Cpu, History, Package, Wrench } from 'lucide-react';
import Grainient from '../../components/Brand/Grainient';
import ClerkTreeLogo from '../../components/Brand/ClerkTreeLogo';
import { siClaude, siDeepseek, siGooglegemini, siMoonshotai, siX, type SimpleIcon } from 'simple-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import AssetGraph from './AssetGraph';
import ClerkTreeLockup from '../../components/Brand/ClerkTreeLockup';
import { STORY_SCENES } from './StoryScenes';
import SourceGraph, { ANSWER_MARKS, ANSWER_MS, AnswerCard, CHAIN_MS, CausalChain, GRAPH_MS, graphSlot, type AnswerCopy, type ChainGraphCopy, type GraphCopy } from './SourceGraph';
import './HomeStory.css';
import { decorPaused } from '../../utils/perf';

const copy = {
  en: {
    seed: 'CNC-07 spindle vibration alarm',
    orchestrating: 'Orchestrating 5 agents',
    done: 'Work order ready',
    chain: [
      { icon: 'signal', agent: 'Signal agent', tool: 'query_historian(CNC-07, 24h)', wait: 'reading', value: '7.8 mm/s RMS, up 3.7× in 6 h', src: 'OPC UA' },
      { icon: 'book', agent: 'Manual agent', tool: 'search_manuals("6205-2RS")', wait: 'searching', value: 'Outer-race wear, manual §4.3', src: 'Manual' },
      { icon: 'history', agent: 'History agent', tool: 'similar_incidents()', wait: 'matching', value: '2 matching failures, last in March', src: 'CMMS' },
      { icon: 'parts', agent: 'Parts agent', tool: 'check_stock("6205-2RS")', wait: 'checking', value: '4 in stock, bay B-12', src: 'SAP MM' },
      { icon: 'plan', agent: 'Planner agent', tool: 'draft_work_order()', wait: 'drafting', value: 'WO-2291, Tue 06:00 shift, 1.5 h', src: 'Work order' },
    ],
    cited: '5 agents · 9 sources cited',
    graphLabels: { building: 'Building source graph', tracing: 'Tracing citations', verified: '9/9 claims cited' },
    graphFoot: '9 sources · 13 links',
    graph: {
      answer: 'WO-2291 · Replace spindle bearing',
      answerSub: 'Tue 06:00 shift · 1.5 h',
      verified: 'Every claim traced to a source',
      sources: { sig: 'Signal · OPC UA', man: 'Manual · §4.3', his: 'History · CMMS', par: 'Parts · SAP MM' },
      leaves: ['7.8 mm/s RMS', 'Temp 71 °C', 'p.212 Bearing wear', 'Torque table p.88', 'WO-1874 · March', 'WO-1502 · Nov', 'Shift note A', '6205-2RS · B-12', 'Supplier quote'],
      manual: { head: 'Manual §4.3 · p.212', before: 'Rising RMS at the bearing defect frequency indicates ', mark: 'outer-race wear', after: '. Replace above 7.1 mm/s.' },
      signal: { head: 'OPC UA · CNC-07 spindle · 24 h', value: '7.8 mm/s RMS · limit 4.5' },
      history: { head: 'CMMS · WO-1874 · March', body: 'Same alarm on CNC-07. Bearing 6205-2RS replaced in 1.4 h, fault cleared.' },
    } as GraphCopy,
    answerLabels: { ready: 'Answer ready', approved: 'Approved', followup: 'Asking a follow-up' },
    answer: {
      label: 'Answer', meta: '9 sources',
      parts: ['Outer-race wear on the CNC-07 spindle bearing', 1, 2, '. Same fault as WO-1874 in March', 3, '. Replace 6205-2RS from bay B-12', 4, ' on the Tue 06:00 shift.'],
      wo: { id: 'WO-2291', title: 'Replace spindle bearing', when: 'Tue 06:00 · 1.5 h · 1 technician' },
      approve: 'Approve', approved: 'Approved · sent to SAP PM',
    } as AnswerCopy,
    followUp: {
      seed: 'Why did Line 2 OEE drop 8% this week?',
      cited: '5 agents · 7 sources cited',
      foot: '7 sources · 4 causal links',
      labels: { building: 'Tracing cause and effect', tracing: 'Root cause found', verified: '7/7 claims cited' },
      chain: [
        { icon: 'signal', agent: 'Production agent', tool: 'query_mes(line_2, 7d)', wait: 'reading', value: 'OEE 71%, down 8 pts, changeovers +22 min', src: 'MES' },
        { icon: 'history', agent: 'Shift agent', tool: 'read_shift_notes(line_2)', wait: 'reading', value: 'New torque tool TQ-40 since Monday', src: 'Shift log' },
        { icon: 'book', agent: 'Quality agent', tool: 'scrap_by_cause(7d)', wait: 'grouping', value: 'Scrap 3.1%, thread torque out of spec', src: 'QMS' },
        { icon: 'parts', agent: 'Tooling agent', tool: 'compare_spec("TQ-40")', wait: 'comparing', value: 'Preset 18 Nm, spec 22 Nm', src: 'Tool DB' },
        { icon: 'plan', agent: 'Planner agent', tool: 'draft_actions()', wait: 'drafting', value: 'Recalibrate TQ-40, update changeover SOP', src: 'Action plan' },
      ],
      graph: {
        nodes: ['OEE 71% · down 8 pts', 'Changeovers +22 min', 'Scrap 3.1% · thread torque', 'TQ-40 preset 18 Nm, spec 22'],
        root: 'Root cause', fix: 'Recalibrate TQ-40 · update SOP',
        chips: ['MES · 7 days', 'Changeover log', 'Shift note · Mon', 'QMS · 214 parts', 'Tool DB · TQ-40', 'Torque spec rev. C'],
      } as ChainGraphCopy,
      answer: {
        label: 'Answer', meta: '7 sources',
        parts: ['The new TQ-40 torque tool is preset to 18 Nm, below the 22 Nm spec', 1, 2, '. Under-torqued threads drive the scrap', 3, ' and the longer changeovers', 4, '. Recalibrate TQ-40 and update the changeover SOP.'],
        wo: { id: 'ACT-118', title: 'Recalibrate TQ-40', when: 'Today · Line 2 · quality lead' },
        approve: 'Approve', approved: 'Approved · assigned',
      } as AnswerCopy,
    },
    storyTitle: ['Work that follows', 'the signal'],
    steps: [
      { icon: 'activity', scene: 'signal', title: 'Start with any machine signal', body: 'Vibration, temperature, an alarm or a note from the floor. ClerkTree connects to the line and notices when something changes.' },
      { icon: 'book', scene: 'docs', title: 'Reason across your knowledge', body: 'Agents read manuals, service history, parts records and production data to explain what is most likely happening.' },
      { icon: 'wrench', scene: 'agent', title: 'Act with a cited work order', body: 'Get a work order with the evidence, parts and people attached, ready for your team to approve.' },
    ],
    spotPill: 'Introducing',
    spotTag: 'Hive',
    spotTitle: 'See how your plant connects',
    spotLink: 'Explore Hive',
    spotBody: 'ClerkTree links every machine to its components, incidents, parts and suppliers, so a single fault shows its full chain of causes and the people who can fix it.',
    caseTitle: ['Proven on the line,', 'in their words'],
    caseIntro: 'See how plant teams use ClerkTree to catch failures early, plan maintenance and keep lines running.',
    proofEyebrow: 'Internal evaluation',
    proofTitle: ['Leading fault', 'diagnosis accuracy'],
    proofBody: 'How often a system names the right root cause for a real machine fault, given the same signals, manuals and maintenance history.',
    proofStats: [['79.1%', 'diagnosis accuracy'], ['+29.5 pts', 'over the next best model'], ['11', 'systems compared']],
    proofMetric: 'Fault diagnosis accuracy',
    proofAxis: 'Correct root cause, % of incidents',
    proofNote: 'Internal evaluation on historical maintenance incidents. Methodology available on request.',
    proofCta: 'Ask for the evaluation',
    bars: [
      ['ClerkTree Agent', 79.1, true, 'clerktree'],
      ['Claude Opus 5.5', 49.6, false, 'claude'],
      ['GPT-6 Astra (max)', 49.1, false, 'openai'],
      ['Gemini 4 Argon', 48.4, false, 'gemini'],
      ['Claude Sonnet 5.5', 47.2, false, 'claude'],
      ['GPT-6 Sol', 46.5, false, 'openai'],
      ['Grok 4.7', 45.8, false, 'grok'],
      ['GPT-6.1 Terra', 44.3, false, 'openai'],
      ['Kimi K3', 43.0, false, 'kimi'],
      ['DeepSeek V4.1 Flash', 42.1, false, 'deepseek'],
      ['GPT-6 Luna', 40.6, false, 'openai'],
    ] as [string, number, boolean, string][],
    apiTitle: ['One connection.', 'Every machine signal.'],
    apiBody: 'Connect historians, PLCs and MES over OPC UA, Modbus or REST. ClerkTree maps each signal to its asset and keeps that context with every finding.',
    apiCta: 'Talk to engineering',
    apiWindow: 'Example connector',
  },
  de: {
    seed: 'CNC-07 Alarm Spindelvibration',
    orchestrating: '5 Agenten koordinieren',
    done: 'Auftrag bereit',
    chain: [
      { icon: 'signal', agent: 'Signal-Agent', tool: 'query_historian(CNC-07, 24h)', wait: 'liest', value: '7,8 mm/s RMS, 3,7× in 6 h', src: 'OPC UA' },
      { icon: 'book', agent: 'Handbuch-Agent', tool: 'search_manuals("6205-2RS")', wait: 'sucht', value: 'Verschleiß Außenring, Handbuch §4.3', src: 'Handbuch' },
      { icon: 'history', agent: 'Historie-Agent', tool: 'similar_incidents()', wait: 'gleicht ab', value: '2 ähnliche Ausfälle, zuletzt im März', src: 'CMMS' },
      { icon: 'parts', agent: 'Teile-Agent', tool: 'check_stock("6205-2RS")', wait: 'prüft', value: '4 auf Lager, Fach B-12', src: 'SAP MM' },
      { icon: 'plan', agent: 'Planungs-Agent', tool: 'draft_work_order()', wait: 'erstellt', value: 'WO-2291, Di 06:00 Schicht, 1,5 h', src: 'Auftrag' },
    ],
    cited: '5 Agenten · 9 Quellen belegt',
    graphLabels: { building: 'Quellengraph entsteht', tracing: 'Belege werden geprüft', verified: '9/9 Aussagen belegt' },
    graphFoot: '9 Quellen · 13 Verbindungen',
    graph: {
      answer: 'WO-2291 · Spindellager tauschen',
      answerSub: 'Di 06:00 Schicht · 1,5 h',
      verified: 'Jede Aussage mit Quelle belegt',
      sources: { sig: 'Signal · OPC UA', man: 'Handbuch · §4.3', his: 'Historie · CMMS', par: 'Teile · SAP MM' },
      leaves: ['7,8 mm/s RMS', 'Temp. 71 °C', 'S. 212 Lagerverschleiß', 'Drehmomente S. 88', 'WO-1874 · März', 'WO-1502 · Nov.', 'Schichtnotiz A', '6205-2RS · B-12', 'Lieferantenangebot'],
      manual: { head: 'Handbuch §4.3 · S. 212', before: 'Steigender RMS-Wert bei der Lagerschadensfrequenz zeigt ', mark: 'Verschleiß am Außenring', after: '. Tausch ab 7,1 mm/s.' },
      signal: { head: 'OPC UA · CNC-07 Spindel · 24 h', value: '7,8 mm/s RMS · Grenze 4,5' },
      history: { head: 'CMMS · WO-1874 · März', body: 'Gleicher Alarm an CNC-07. Lager 6205-2RS in 1,4 h getauscht, Fehler behoben.' },
    } as GraphCopy,
    answerLabels: { ready: 'Antwort bereit', approved: 'Freigegeben', followup: 'Folgefrage' },
    answer: {
      label: 'Antwort', meta: '9 Quellen',
      parts: ['Verschleiß am Außenring des Spindellagers von CNC-07', 1, 2, '. Gleicher Fehler wie WO-1874 im März', 3, '. 6205-2RS aus Fach B-12 tauschen', 4, ', Schicht Di 06:00.'],
      wo: { id: 'WO-2291', title: 'Spindellager tauschen', when: 'Di 06:00 · 1,5 h · 1 Techniker' },
      approve: 'Freigeben', approved: 'Freigegeben · an SAP PM',
    } as AnswerCopy,
    followUp: {
      seed: 'Warum fiel die OEE von Linie 2 um 8 %?',
      cited: '5 Agenten · 7 Quellen belegt',
      foot: '7 Quellen · 4 Ursachen',
      labels: { building: 'Ursachenkette entsteht', tracing: 'Ursache gefunden', verified: '7/7 Aussagen belegt' },
      chain: [
        { icon: 'signal', agent: 'Produktions-Agent', tool: 'query_mes(line_2, 7d)', wait: 'liest', value: 'OEE 71 %, minus 8 Pkt., Rüsten +22 min', src: 'MES' },
        { icon: 'history', agent: 'Schicht-Agent', tool: 'read_shift_notes(line_2)', wait: 'liest', value: 'Neues Drehmomentwerkzeug TQ-40 seit Montag', src: 'Schichtbuch' },
        { icon: 'book', agent: 'Qualitäts-Agent', tool: 'scrap_by_cause(7d)', wait: 'gruppiert', value: 'Ausschuss 3,1 %, Gewindemoment außer Toleranz', src: 'QMS' },
        { icon: 'parts', agent: 'Werkzeug-Agent', tool: 'compare_spec("TQ-40")', wait: 'vergleicht', value: 'Voreinstellung 18 Nm, Vorgabe 22 Nm', src: 'Werkzeug-DB' },
        { icon: 'plan', agent: 'Planungs-Agent', tool: 'draft_actions()', wait: 'erstellt', value: 'TQ-40 kalibrieren, Rüst-SOP anpassen', src: 'Maßnahmen' },
      ],
      graph: {
        nodes: ['OEE 71 % · minus 8 Pkt.', 'Rüsten +22 min', 'Ausschuss 3,1 % · Gewinde', 'TQ-40 18 Nm statt 22'],
        root: 'Ursache', fix: 'TQ-40 kalibrieren · SOP anpassen',
        chips: ['MES · 7 Tage', 'Rüstprotokoll', 'Schichtnotiz · Mo', 'QMS · 214 Teile', 'Werkzeug-DB · TQ-40', 'Drehmoment-Vorgabe C'],
      } as ChainGraphCopy,
      answer: {
        label: 'Antwort', meta: '7 Quellen',
        parts: ['Das neue Werkzeug TQ-40 ist auf 18 Nm eingestellt, unter der Vorgabe von 22 Nm', 1, 2, '. Zu schwach angezogene Gewinde treiben den Ausschuss', 3, ' und die längeren Rüstzeiten', 4, '. TQ-40 kalibrieren und die Rüst-SOP anpassen.'],
        wo: { id: 'ACT-118', title: 'TQ-40 kalibrieren', when: 'Heute · Linie 2 · Qualitätsleitung' },
        approve: 'Freigeben', approved: 'Freigegeben · zugewiesen',
      } as AnswerCopy,
    },
    storyTitle: ['Arbeit, die dem', 'Signal folgt'],
    steps: [
      { icon: 'activity', scene: 'signal', title: 'Mit jedem Maschinensignal starten', body: 'Vibration, Temperatur, ein Alarm oder eine Notiz aus der Halle. ClerkTree ist mit der Linie verbunden und erkennt Veränderungen.' },
      { icon: 'book', scene: 'docs', title: 'Über Ihr Wissen hinweg folgern', body: 'Agenten lesen Handbücher, Servicehistorie, Teiledaten und Produktionsdaten und erklären die wahrscheinlichste Ursache.' },
      { icon: 'wrench', scene: 'agent', title: 'Mit belegtem Auftrag handeln', body: 'Ein Arbeitsauftrag mit Belegen, Teilen und Zuständigen, bereit zur Freigabe durch Ihr Team.' },
    ],
    spotPill: 'Neu',
    spotTag: 'Hive',
    spotTitle: 'Sehen, wie Ihr Werk zusammenhängt',
    spotLink: 'Hive entdecken',
    spotBody: 'ClerkTree verknüpft jede Maschine mit Komponenten, Störungen, Teilen und Lieferanten. So zeigt ein einzelner Fehler die ganze Ursachenkette und wer ihn beheben kann.',
    caseTitle: ['Bewährt an der Linie,', 'in ihren Worten'],
    caseIntro: 'So nutzen Werksteams ClerkTree, um Ausfälle früh zu erkennen, Wartung zu planen und Linien am Laufen zu halten.',
    proofEyebrow: 'Interne Auswertung',
    proofTitle: ['Führend bei der', 'Fehlerdiagnose'],
    proofBody: 'Wie oft ein System bei einem echten Maschinenfehler die richtige Ursache nennt, mit denselben Signalen, Handbüchern und Wartungsdaten.',
    proofStats: [['79,1 %', 'Diagnosegenauigkeit'], ['+29,5 Pkt.', 'vor dem nächstbesten Modell'], ['11', 'Systeme verglichen']],
    proofMetric: 'Genauigkeit der Fehlerdiagnose',
    proofAxis: 'Richtige Ursache, % der Störungen',
    proofNote: 'Interne Auswertung auf historischen Wartungsfällen. Methodik auf Anfrage.',
    proofCta: 'Auswertung anfragen',
    bars: [
      ['ClerkTree Agent', 79.1, true, 'clerktree'],
      ['Claude Opus 5.5', 49.6, false, 'claude'],
      ['GPT-6 Astra (max)', 49.1, false, 'openai'],
      ['Gemini 4 Argon', 48.4, false, 'gemini'],
      ['Claude Sonnet 5.5', 47.2, false, 'claude'],
      ['GPT-6 Sol', 46.5, false, 'openai'],
      ['Grok 4.7', 45.8, false, 'grok'],
      ['GPT-6.1 Terra', 44.3, false, 'openai'],
      ['Kimi K3', 43.0, false, 'kimi'],
      ['DeepSeek V4.1 Flash', 42.1, false, 'deepseek'],
      ['GPT-6 Luna', 40.6, false, 'openai'],
    ] as [string, number, boolean, string][],
    apiTitle: ['Eine Verbindung.', 'Jedes Maschinensignal.'],
    apiBody: 'Historians, SPS und MES über OPC UA, Modbus oder REST anbinden. ClerkTree ordnet jedes Signal seiner Anlage zu und behält den Kontext bei jedem Befund.',
    apiCta: 'Mit Engineering sprechen',
    apiWindow: 'Beispiel-Connector',
  },
};

function useHomeCopy() {
  const { language } = useLanguage();
  return copy[language === 'de' ? 'de' : 'en'];
}

/* ---------------- Hero: agent chain on a CRT card over a silver Grainient ---------------- */

const chainIcon = { signal: Activity, book: BookOpen, history: History, parts: Package, plan: ClipboardList };
const TYPE_MS = 34;
const ROW_MS = 950;
const HOLD_MS = 1300;

function useChainClock(total: number, ref: RefObject<HTMLElement | null>, still: number) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setMs(still); return undefined; }
    let timer = 0;
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    if (ref.current) observer.observe(ref.current);
    timer = window.setInterval(() => { if (visible && !document.hidden && !(decorPaused())) setMs((v) => (v + 50) % total); }, 50);
    return () => { window.clearInterval(timer); observer.disconnect(); };
  }, [total, ref, still]);
  return ms;
}

/** Scales the card down so it always fits inside the hero stage, whatever the screen. */
function useFitToStage(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current;
    const stage = card?.parentElement;
    if (!card || !stage) return undefined;
    const fit = () => {
      const cs = getComputedStyle(stage);
      const availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const scale = Math.min(1, availH / card.offsetHeight, availW / card.offsetWidth);
      card.style.setProperty('--hs-fit', String(Math.max(0.4, scale)));
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(card);
    fit();
    return () => ro.disconnect();
  }, [ref]);
}

type ChainRow = { icon: string; agent: string; tool: string; wait: string; value: string; src: string };

/** One question's timeline: type → agents → graph → answer (ending with the question erased). */
function timeline(seed: string, rows: number, graphMs: number) {
  const typeEnd = seed.length * TYPE_MS + 300;
  const chainEnd = typeEnd + rows * ROW_MS;
  const graphAt = chainEnd + HOLD_MS;
  const answerAt = graphAt + graphMs;
  return { typeEnd, chainEnd, graphAt, answerAt, total: answerAt + ANSWER_MS };
}

export function HeroAgentCard() {
  const c = useHomeCopy();
  const f = c.followUp;
  const ref = useRef<HTMLDivElement>(null);
  const scenes = [
    { seed: c.seed, chain: c.chain as ChainRow[], cited: c.cited, foot: c.graphFoot, labels: c.graphLabels, answer: c.answer, t: timeline(c.seed, c.chain.length, GRAPH_MS), verifiedAt: 6600 },
    { seed: f.seed, chain: f.chain as ChainRow[], cited: f.cited, foot: f.foot, labels: f.labels, answer: f.answer, t: timeline(f.seed, f.chain.length, CHAIN_MS), verifiedAt: 4500 },
  ];
  const cycle = scenes[0].t.total + scenes[1].t.total;
  useFitToStage(ref);
  const clock = useChainClock(cycle, ref, scenes[0].t.chainEnd + 400);
  const idx = clock < scenes[0].t.total ? 0 : 1;
  const sc = scenes[idx];
  const { t } = sc;
  const ms = idx === 0 ? clock : clock - scenes[0].t.total;

  const gms = ms - t.graphAt;
  const ams = ms - t.answerAt;
  const inGraph = gms >= 0 && ams < 0;
  const inAnswer = ams >= 0;
  const runMs = ms - t.typeEnd;
  const active = runMs < 0 ? -1 : Math.min(sc.chain.length, Math.floor(runMs / ROW_MS));
  const within = runMs - active * ROW_MS;
  const done = active >= sc.chain.length;

  // The question types in, and at the end of the answer it is erased for the next one.
  const erase = inAnswer ? Math.min(1, Math.max(0, (ams - ANSWER_MARKS.erase) / 500)) : 0;
  const typed = erase > 0 ? sc.seed.slice(0, Math.round(sc.seed.length * (1 - erase))) : sc.seed.slice(0, Math.floor(ms / TYPE_MS));
  const caret = runMs < 0 || erase > 0;

  const chainSlot = (gm: number) => (gm < (idx === 0 ? 2700 : 3100) ? sc.labels.building : gm < sc.verifiedAt ? sc.labels.tracing : sc.labels.verified);
  let slot: string;
  if (inAnswer) slot = ams >= ANSWER_MARKS.erase ? c.answerLabels.followup : ams >= ANSWER_MARKS.done ? c.answerLabels.approved : c.answerLabels.ready;
  else if (inGraph) slot = idx === 0 ? graphSlot(gms, sc.labels) : chainSlot(gms);
  else slot = done ? c.done : active < 0 ? c.orchestrating : `${sc.chain[active].agent}: ${sc.chain[active].wait}`;
  const slotDone = inAnswer ? ams < ANSWER_MARKS.erase : inGraph ? gms >= sc.verifiedAt : done;
  const progress = inAnswer ? 1 - erase : inGraph ? Math.min(1, gms / sc.verifiedAt) : done ? 1 : Math.max(0, runMs / (sc.chain.length * ROW_MS));

  return (
    <div className={`hs-crt${inGraph || inAnswer ? ' is-graph' : ''}`} ref={ref} aria-hidden="true">
      <div className="hs-seed">
        <span className="hs-seed-ico"><Cpu size={14} strokeWidth={1.75} /></span>
        <span className="hs-seed-id">{typed}<span className={`hs-caret${caret ? '' : ' is-hidden'}`} /></span>
        <span className={`hs-slot${slotDone ? ' is-done' : ''}`} key={slot}>
          <span className="hs-slot-label">{slot}</span>
          <span className="hs-slot-dot" />
        </span>
      </div>
      <div className="hs-rows">
      {sc.chain.map((row, i) => {
        const Icon = chainIcon[row.icon as keyof typeof chainIcon];
        const state = i < active ? 'is-done' : i === active ? (within > ROW_MS * 0.62 ? 'is-done is-active' : 'is-active') : '';
        const resolved = state.includes('is-done');
        return (
          <div className={`hs-row ${state}`} key={`${idx}-${row.agent}`} style={{ '--row': i } as CSSProperties}>
            <svg className="hs-row-branch" viewBox="0 0 30 42" aria-hidden="true">
              <path d={i === 0 ? 'M9 0V15Q9 21 15 21H30' : 'M9 -6V15Q9 21 15 21H30'} pathLength={1} />
            </svg>
            <div className="hs-row-box">
              <span className="hs-row-ico"><Icon size={14} strokeWidth={1.75} /></span>
              <span className="hs-row-text">
                <span className="hs-row-k">{row.agent}<em>{row.tool}</em></span>
                <span className="hs-row-v">
                  {!resolved && (
                    <span className="hs-loader">
                      <span className="hs-loader-grid">{[1, 2, 3, 0, 1, 2, 1, 2, 3].map((d, k) => <i key={k} style={{ '--pixel-delay': `${d * 90}ms` } as CSSProperties} />)}</span>
                      {row.wait}
                    </span>
                  )}
                  <span className="hs-row-val">{row.value}</span>
                </span>
              </span>
              <span className="hs-row-src">{row.src}</span>
            </div>
          </div>
        );
      })}
      {inGraph && idx === 0 && <SourceGraph copy={c.graph} gms={gms} />}
      {inGraph && idx === 1 && <CausalChain copy={f.graph} gms={gms} />}
      {inAnswer && <AnswerCard ams={ams} copy={sc.answer} key={idx} />}
      </div>
      <div className={`hs-crt-foot${slotDone ? ' is-done' : ''}`}>
        <span className="hs-crt-progress"><i style={{ transform: `scaleX(${progress})` }} /></span>
        <span className="hs-crt-cited">{inGraph || inAnswer ? sc.foot : sc.cited}</span>
      </div>
    </div>
  );
}

/* ---------------- Logo wall ---------------- */

export type ClientLogo = { alt: string; src: string; width: number; mobileWidth: number };

/** Endless client-logo strip under the hero: three copies scroll as one track. */
export function LogoStrip({ logos, label }: { logos: ClientLogo[]; label: string }) {
  return (
    <div className="hs-strip" aria-label={label} role="region">
      <div className="hs-strip-track">
        {[0, 1, 2].map((group) => (
          <div className="hs-logo-set" aria-hidden={group > 0} key={group}>
            {logos.map((logo) => (
              <img
                alt={group === 0 ? logo.alt : ''}
                decoding="async"
                height="28"
                key={`${group}-${logo.src}`}
                src={logo.src}
                style={{ '--logo-width': `${logo.width}px`, '--logo-mobile-width': `${logo.mobileWidth}px` } as CSSProperties}
                width={logo.width}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- How it works: step tabs + live scene ---------------- */

const STEP_MS = 9000;
const stepIcon = { activity: Activity, book: BookOpen, wrench: Wrench };

export function StoryTabs() {
  const c = useHomeCopy();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!inView || paused) return undefined;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % c.steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [active, inView, paused, c.steps.length]);
  // Keep the outgoing scene mounted while it fades out, so scenes cross-fade.
  const last = useRef(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  useEffect(() => {
    if (last.current === active) return undefined;
    setLeaving(last.current);
    last.current = active;
    const timer = window.setTimeout(() => setLeaving(null), 750);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <section className="hs-section hs-story" aria-labelledby="hs-story-title" ref={ref}>
      <div className="hs-story-copy">
        <h2 id="hs-story-title" data-ct-reveal="up">{c.storyTitle[0]}<br />{c.storyTitle[1]}</h2>
        <div className="hs-steps" role="group" aria-label={c.storyTitle.join(' ')} onMouseEnter={() => setPaused(true)} onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setPaused(false); }} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
          {c.steps.map((step, i) => {
            const Icon = stepIcon[step.icon as keyof typeof stepIcon];
            const on = i === active;
            return (
              <button
                aria-pressed={on}
                className={`hs-step${on ? ' is-active' : ''}${on && inView && !paused ? ' is-running' : ''}`}
                key={step.title}
                onClick={() => setActive(i)}
                style={{ '--step-ms': `${STEP_MS}ms` } as CSSProperties}
                type="button"
              >
                <span className="hs-step-ico" aria-hidden="true"><Icon size={16} strokeWidth={1.6} /></span>
                <span className="hs-step-text">
                  <strong>{step.title}</strong>
                  <span className="hs-step-body"><span>{step.body}</span></span>
                </span>
                <span className="hs-step-progress" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
      <div className="hs-story-stage hs-visual" data-ct-reveal="up">
        <Grainient preset="silver" still />
        {c.steps.map((step, i) => {
          const Scene = STORY_SCENES[i];
          return (
            <div className={`hs-story-scene${i === active ? ' is-active' : ''}`} key={step.scene}>
              {(i === active || i === leaving) && <Scene />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Spotlight (dark panel) ---------------- */

export function Spotlight() {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-panel hs-dark hs-spot" aria-labelledby="hs-spot-title">
      <Grainient preset="black" />
      <div className="hs-spot-copy" data-ct-reveal="up">
        <span className="hs-pill">{c.spotPill}<b>{c.spotTag}</b></span>
        <h2 id="hs-spot-title">{c.spotTitle}</h2>
        <p>{c.spotBody}</p>
        <a className="hs-spot-link" href="/hive">{c.spotLink}<span aria-hidden="true">→</span></a>
      </div>
      <div className="hs-spot-stage" data-ct-reveal="up">
        <AssetGraph />
      </div>
    </section>
  );
}

/* ---------------- Case study (silver panel) ---------------- */

type CaseStudyProps = {
  quote: string;
  name: string;
  role: string;
  image: string;
  stats: [string, string][];
};

export function CaseStudy({ quote, name, role, image, stats }: CaseStudyProps) {
  const c = useHomeCopy();
  return (
    <section className="hs-section hs-panel hs-silver hs-case" aria-labelledby="hs-case-title">
      <Grainient preset="silver" />
      <div className="hs-case-head" data-ct-reveal="up">
        <h2 id="hs-case-title">{c.caseTitle[0]}<br />{c.caseTitle[1]}</h2>
        <p>{c.caseIntro}</p>
      </div>
      <article className="hs-case-card" data-ct-reveal="up">
        <div className="hs-case-quote">
          <div className="hs-case-brands">
            <ClerkTreeLockup className="hs-case-lockup" title="ClerkTree" />
            <span aria-hidden="true" />
            <strong>THD GmbH</strong>
          </div>
          <span className="hs-case-mark" aria-hidden="true">“</span>
          <blockquote>{quote.replace(/^["“]|["”]$/g, '')}</blockquote>
          <div className="hs-case-author">
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>
        <div className="hs-case-media">
          <img alt="THD GmbH plant" decoding="async" loading="lazy" src={image} />
        </div>
      </article>
      <dl className="hs-case-stats" data-ct-reveal="up">
        {stats.map(([value, label]) => (
          <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
        ))}
      </dl>
    </section>
  );
}

/* ---------------- Proof chart (dark panel) ---------------- */

const MODEL_ICONS: Record<string, SimpleIcon> = { claude: siClaude, gemini: siGooglegemini, grok: siX, kimi: siMoonshotai, deepseek: siDeepseek };
// Mark for the GPT rows.
const OPENAI_PATH = 'M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z';
const MODEL_MONOGRAMS: Record<string, string> = {};

function ModelMark({ id }: { id: string }) {
  if (id === 'clerktree') return <span className="hs-model is-ours"><ClerkTreeLogo markClassName="hs-model-svg" labelClassName="sr-only" /></span>;
  if (id === 'openai') return <span className="hs-model"><svg className="hs-model-svg" viewBox="0 0 24 24" aria-hidden="true"><path d={OPENAI_PATH} fill="currentColor" fillRule="evenodd" /></svg></span>;
  const icon = MODEL_ICONS[id];
  if (icon) return <span className="hs-model"><svg className="hs-model-svg" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor" /></svg></span>;
  return <span className="hs-model is-mono">{MODEL_MONOGRAMS[id] ?? '·'}</span>;
}

export function ProofChart() {
  const c = useHomeCopy();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setShown(true); }, { threshold: 0.25 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="hs-section hs-panel hs-dark hs-proof" aria-labelledby="hs-proof-title">
      <Grainient preset="black" />
      <div className="hs-proof-copy" data-ct-reveal="up">
        <span className="hs-eyebrow">{c.proofEyebrow}</span>
        <h2 id="hs-proof-title">{c.proofTitle[0]}<br />{c.proofTitle[1]}</h2>
        <p>{c.proofBody}</p>
        <dl className="hs-proof-stats">
          {c.proofStats.map(([value, label]) => (
            <div key={label}><dt>{value}</dt><dd>{label}</dd></div>
          ))}
        </dl>
        <p className="hs-proof-note">{c.proofNote}</p>
        <a className="hs-btn hs-btn-light" href="/contact">{c.proofCta}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className={`hs-chart${shown ? ' is-in' : ''}`} ref={ref} data-ct-reveal="up">
        <div className="hs-chart-head">
          <span>{c.proofMetric}</span>
        </div>
        <ol className="hs-bars">
          {c.bars.map(([label, value, ours, model], i) => (
            <li className={ours ? 'is-ours' : undefined} key={label} style={{ '--v': value / 100, '--i': i } as CSSProperties}>
              <span className="hs-bar-label"><ModelMark id={model} />{label}</span>
              <span className="hs-bar-track"><span className="hs-bar-fill" /></span>
              <span className="hs-bar-value">{value.toFixed(1)}%</span>
            </li>
          ))}
        </ol>
        <div className="hs-chart-axis" aria-hidden="true">
          <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
        <p className="hs-chart-caption">{c.proofAxis}</p>
      </div>
    </section>
  );
}

/* ---------------- Connector panel (silver) ---------------- */

const SNIPPETS = {
  'OPC UA': `source: opc-ua
endpoint: opc.tcp://line-2.plant.local:4840
security: SignAndEncrypt
assets:
  - id: CNC-07
    signals:
      spindle.vibration: ns=2;s=CNC07.Spindle.VibRMS
      spindle.temperature: ns=2;s=CNC07.Spindle.Temp
sample_every: 500ms`,
  Modbus: `source: modbus-tcp
host: 10.20.4.17
port: 502
unit_id: 3
registers:
  - name: press.hydraulic_pressure
    address: 40021
    type: float32
    scale: 0.1
poll_every: 1s`,
  REST: `POST /v1/signals
{
  "asset": "CNC-07",
  "signal": "spindle.vibration",
  "value": 7.8,
  "unit": "mm/s",
  "at": "2026-11-08T09:41:12Z"
}`,
};

function highlight(line: string) {
  const m = line.match(/^(\s*-?\s*)([\w."]+)(:)(.*)$/);
  if (!m) return <>{line}</>;
  return <>{m[1]}<span className="hs-k">{m[2]}</span>{m[3]}<span className="hs-v">{m[4]}</span></>;
}

export function ConnectorPanel() {
  const c = useHomeCopy();
  const tabs = Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[];
  const [tab, setTab] = useState<keyof typeof SNIPPETS>('OPC UA');
  return (
    <section className="hs-section hs-panel hs-silver hs-api" aria-labelledby="hs-api-title">
      <Grainient preset="silver" />
      <div className="hs-api-copy" data-ct-reveal="up">
        <h2 id="hs-api-title">{c.apiTitle[0]}<br />{c.apiTitle[1]}</h2>
        <p>{c.apiBody}</p>
        <a className="hs-btn hs-btn-light" href="/contact">{c.apiCta}<ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <div className="hs-code" data-ct-reveal="up">
        <div className="hs-code-bar">
          <strong>{c.apiWindow}</strong>
          <div className="hs-code-tabs" role="tablist">
            {tabs.map((name) => (
              <button aria-selected={tab === name} className={tab === name ? 'is-active' : undefined} key={name} onClick={() => setTab(name)} role="tab" type="button">{name}</button>
            ))}
          </div>
        </div>
        <pre><code>{SNIPPETS[tab].split('\n').map((line, i) => (
          <span className="hs-line" key={`${tab}-${i}`}><i>{i + 1}</i>{highlight(line)}{'\n'}</span>
        ))}</code></pre>
      </div>
    </section>
  );
}
