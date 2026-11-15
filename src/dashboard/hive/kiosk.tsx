/**
 * Shop-floor displays (the kiosk routes).
 *
 * Rules this screen follows: no shell, navigation or settings; no personal data of any kind; no command,
 * approval, assistant, note or admin function; the only writes are, inside a badge session on a terminal,
 * acknowledging an alarm and entering a downtime reason (a category code, never free text). Boards never
 * blink or flash. Every value shows its age. Configuration comes from the URL query only, validated
 * with bounds, unknown parameters ignored; a tenant, a credential or a token is never read from the URL.
 *
 * This is the placeholder build: data comes from the same local dataset as the console, there is no
 * display authentication yet (a real display authenticates as a service account) and the badge reader
 * is simulated by a clearly labelled demo button.
 */
import { CalendarClock, CircleCheck, CircleHelp, OctagonAlert, Pause, Power, TriangleAlert, Wrench, type LucideIcon } from 'lucide-react-dash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { formatDuration, formatNumber, useLang, useT, useTn } from './i18n';
import { MACHINE_STATES, STATE_LABEL, type HiveAlarm, type HiveMachine, type MachineState } from './placeholder';
import { useHive } from './store';
import './kiosk.css';

type Board = 'line' | 'site' | 'alarms' | 'machine' | 'terminal';
const BOARDS: Board[] = ['line', 'site', 'alarms', 'machine', 'terminal'];

export interface KioskConfig {
  pages: Board[];
  rotate: number;
  lang: 'de' | 'en' | null;
  mode: 'board' | 'terminal';
  density: 'far' | 'near';
  theme: 'hc' | 'light' | 'dark';
  period: '24h' | '7d';
  max: number;
  burnin: boolean;
  simulate: 'stale' | 'offline' | null;
  badge: boolean;
}

/** Reads and validates the display configuration. Unknown parameters are ignored. */
export function parseKioskConfig(search: URLSearchParams, board: Board): KioskConfig {
  const num = (k: string, lo: number, hi: number, d: number) => {
    const v = parseInt(search.get(k) ?? '', 10);
    return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  };
  const pagesRaw = (search.get('pages') ?? '').split(',').map((s) => s.trim()).filter((s): s is Board => BOARDS.includes(s as Board));
  const mode = search.get('mode') === 'terminal' || board === 'terminal' ? 'terminal' : 'board';
  const theme = search.get('theme');
  const lang = search.get('lang');
  return {
    pages: pagesRaw.length ? [...new Set(pagesRaw)] : [board],
    rotate: num('rotate', 10, 60, 20),
    lang: lang === 'de' || lang === 'en' ? lang : null,
    mode,
    density: search.get('density') === 'near' || mode === 'terminal' ? 'near' : 'far',
    theme: theme === 'light' || theme === 'dark' ? theme : 'hc',
    period: search.get('period') === '7d' ? '7d' : '24h',
    max: num('max', 1, 20, 8),
    burnin: search.get('burnin') === '1',
    simulate: search.get('simulate') === 'stale' ? 'stale' : search.get('simulate') === 'offline' ? 'offline' : null,
    badge: search.get('badge') === 'demo',
  };
}

const STATE_ICON: Record<MachineState, LucideIcon> = {
  producing: CircleCheck,
  idle: Pause,
  setup: Wrench,
  planned_stop: CalendarClock,
  unplanned_stop: OctagonAlert,
  fault: TriangleAlert,
  off: Power,
  unknown: CircleHelp,
};

const SEV_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;
const OPEN_STATES = ['Open', 'Acknowledged'] as const;

/** Downtime reason categories only: the terminal never takes free text. */
const REASONS = ['Waiting for material', 'Changeover', 'Tool change', 'Maintenance', 'Quality check', 'No order', 'Breakdown'] as const;

const lineSlug = (l: string) => l.toLowerCase().replace(/\s+/g, '-');
const siteSlug = 'musterwerk';

function siteTime(d = new Date()): string {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/* ---------- boards ---------- */

function StateMark({ state }: { state: MachineState }) {
  const t = useT();
  const Icon = STATE_ICON[state];
  return (
    <span className={`kb-state is-${state}`}>
      <Icon aria-hidden="true" /> {t(STATE_LABEL[state])}
    </span>
  );
}

function NotAvailable() {
  const t = useT();
  return (
    <div className="kb-center" role="status">
      <h2>{t('Not available')}</h2>
    </div>
  );
}

function sinceText(ageS: number, t: ReturnType<typeof useT>): string {
  const since = new Date(Date.now() - ageS * 1000);
  return t('since {time} · {dur}', { time: siteTime(since), dur: formatDuration(ageS) });
}

function LineBoard({ id, machines, alarms }: { id: string; machines: HiveMachine[]; alarms: HiveAlarm[] }) {
  const t = useT();
  const tn = useTn();
  const line = machines.find((m) => m.lineId === id)?.line;
  if (!line) return <NotAvailable />;
  const ms = machines.filter((m) => m.line === line);
  return (
    <div className="kb-tiles">
      {ms.map((m) => {
        const open = alarms.filter((a) => a.machineId === m.id && OPEN_STATES.includes(a.state as 'Open')).length;
        return (
          <section key={m.id} className={`kb-tile is-${m.state}`} aria-label={`${m.key}: ${t(STATE_LABEL[m.state])}`}>
            <h3>{m.key}</h3>
            <StateMark state={m.state} />
            <p className="kb-since">{sinceText(m.stateAgeS, t)}</p>
            <p className="kb-count">{open ? tn(open, '{n} open alarm', '{n} open alarms') : t('No open alarms')}</p>
          </section>
        );
      })}
    </div>
  );
}

function SiteBoard({ machines, alarms, period }: { machines: HiveMachine[]; alarms: HiveAlarm[]; period: '24h' | '7d' }) {
  const t = useT();
  const lines = [...new Set(machines.map((m) => m.line))];
  return (
    <table className="kb-table">
      <caption className="kb-sr">{t('Lines of the site')}</caption>
      <thead>
        <tr>
          <th>{t('Line')}</th>
          <th>{t('Machine states')}</th>
          <th>{t('Open alarms')}</th>
          <th>{t('OEE {period}', { period: period === '24h' ? t('24 hours') : t('7 days') })}</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => {
          const ms = machines.filter((m) => m.line === l);
          const oees = ms.filter((m) => m.oee > 0).map((m) => m.oee);
          const oee = oees.length ? oees.reduce((a, b) => a + b, 0) / oees.length : null;
          const open = alarms.filter((a) => ms.some((m) => m.id === a.machineId) && a.state !== 'Resolved');
          return (
            <tr key={l}>
              <th scope="row">{t(l)}</th>
              <td>
                {MACHINE_STATES.filter((s) => ms.some((m) => m.state === s)).map((s) => (
                  <span key={s} className={`kb-chipstate is-${s}`}>
                    {ms.filter((m) => m.state === s).length} {t(STATE_LABEL[s])}
                  </span>
                ))}
              </td>
              <td>{(['critical', 'high', 'medium'] as const).map((p) => `${open.filter((a) => a.severity === p).length} ${t(p)}`).join(' · ')}</td>
              <td>{oee === null ? '–' : `${formatNumber(oee, 1)} %`}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const SEV_ICON: Record<HiveAlarm['severity'], LucideIcon> = { critical: TriangleAlert, high: OctagonAlert, medium: CircleHelp, low: CircleHelp };

function AlarmBoard({ alarms, max }: { alarms: HiveAlarm[]; max: number }) {
  const t = useT();
  const tn = useTn();
  const open = alarms
    .filter((a) => a.state !== 'Resolved')
    .sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity])
    .slice(0, max);
  if (!open.length) {
    return (
      <div className="kb-center" role="status">
        <h2>{t('Nothing open')}</h2>
      </div>
    );
  }
  return (
    <ol className="kb-alarms">
      {open.map((a) => {
        const Icon = SEV_ICON[a.severity];
        const unacked = a.state === 'Open';
        return (
          <li key={a.id} className={`kb-alarm is-${a.severity}${unacked && (a.severity === 'critical' || a.severity === 'high') ? ' is-thick' : ''}`}>
            <Icon aria-hidden="true" />
            <span className="kb-alarm-main">
              <b>
                {a.machine} · {a.title}
              </b>
              <small>
                {t(a.severity)} · {t('since {time}', { time: a.time.replace(/ (AM|PM)$/, '') })} · {unacked ? t('not acknowledged') : t('acknowledged')}
              </small>
            </span>
          </li>
        );
      })}
      <li className="kb-sr">{tn(open.length, '{n} open alarm', '{n} open alarms')}</li>
    </ol>
  );
}

function MachineBoard({ id, machines }: { id: string; machines: HiveMachine[] }) {
  const t = useT();
  const tn = useTn();
  const { data } = useHive();
  const m = machines.find((x) => x.id === id);
  if (!m) return <NotAvailable />;
  const open = data.alarms.filter((a) => a.machineId === m.id && a.state !== 'Resolved');
  return (
    <div className="kb-machine">
      <h2>{m.key}</h2>
      <StateMark state={m.state} />
      <p className="kb-since">{sinceText(m.stateAgeS, t)}</p>
      <p className="kb-count">{open.length ? tn(open.length, '{n} open alarm', '{n} open alarms') : t('No open alarms')}</p>
      <ul className="kb-signals">
        {m.signals.slice(0, 4).map((s) => (
          <li key={s.key}>
            <span>{t(s.label)}</span>
            <b>
              {formatNumber(s.value, s.decimals)}&nbsp;{s.unit}
            </b>
            <small>{t('{age} ago', { age: formatDuration(s.ageS) })}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- operator terminal (badge session) ---------- */

const IDLE_S = 120;
const AFTER_ACTION_S = 60;
const ABSOLUTE_S = 300;

function Terminal({ id, machines, badgeDemo }: { id: string; machines: HiveMachine[]; badgeDemo: boolean }) {
  const t = useT();
  const { data, setAlarmState, notify } = useHive();
  const [session, setSession] = useState<{ until: number; hard: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [reason, setReason] = useState<string>('');
  const m = machines.find((x) => x.id === id);

  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, []);

  const touch = useCallback(() => setSession((s) => (s ? { ...s, until: Math.min(Date.now() + IDLE_S * 1000, s.hard) } : s)), []);
  const afterAction = useCallback(() => setSession((s) => (s ? { ...s, until: Math.min(Date.now() + AFTER_ACTION_S * 1000, s.hard) } : s)), []);

  // The session ends on its own; ending clears all of its state.
  useEffect(() => {
    if (session && now >= Math.min(session.until, session.hard)) {
      setSession(null);
      setReason('');
    }
  }, [now, session]);

  if (!m) return <NotAvailable />;
  const open = data.alarms.filter((a) => a.machineId === m.id && a.state !== 'Resolved');
  const left = session ? Math.max(0, Math.ceil((Math.min(session.until, session.hard) - now) / 1000)) : 0;

  return (
    <div className="kb-terminal" onPointerDown={touch}>
      <h2>{m.key}</h2>
      <StateMark state={m.state} />
      <p className="kb-since">{sinceText(m.stateAgeS, t)}</p>

      <h3>{t('Open alarms')}</h3>
      {open.length === 0 && <p className="kb-count">{t('No open alarms')}</p>}
      <ul className="kb-alarms">
        {open.map((a) => (
          <li key={a.id} className={`kb-alarm is-${a.severity}`}>
            <span className="kb-alarm-main">
              <b>{a.title}</b>
              <small>
                {t(a.severity)} · {a.state === 'Open' ? t('not acknowledged') : t('acknowledged')}
              </small>
            </span>
            {session && a.state === 'Open' && (
              <button type="button" className="kb-btn" onClick={() => { setAlarmState(a.id, 'Acknowledged'); afterAction(); }}>
                {t('Acknowledge')}
              </button>
            )}
          </li>
        ))}
      </ul>

      {!session ? (
        <div className="kb-login">
          {badgeDemo ? (
            <>
              <p>{t('Hold your badge to the reader to act on this machine.')}</p>
              <button type="button" className="kb-btn" onClick={() => setSession({ until: Date.now() + IDLE_S * 1000, hard: Date.now() + ABSOLUTE_S * 1000 })}>
                {t('Demo: simulate a badge read')}
              </button>
              <small>{t('Placeholder: a real reader sends the badge to the server, which returns a short session. The badge number is never kept.')}</small>
            </>
          ) : (
            <p>{t('Badge login is off. You can read this screen, but nothing can be changed here.')}</p>
          )}
        </div>
      ) : (
        <div className="kb-session">
          <p className="kb-badge-on" role="status">
            {t('Signed in')} · {t('ends in {n} s', { n: left })}
          </p>
          <h3>{t('Downtime reason')}</h3>
          <div className="kb-reasons" role="group" aria-label={t('Downtime reason')}>
            {REASONS.map((r) => (
              <button key={r} type="button" className={`kb-btn${reason === r ? ' is-on' : ''}`} aria-pressed={reason === r} onClick={() => setReason(r)}>
                {t(r)}
              </button>
            ))}
          </div>
          <div className="kb-row">
            <button
              type="button"
              className="kb-btn is-primary"
              disabled={!reason}
              onClick={() => {
                notify(t('Downtime reason saved (placeholder, not saved)'));
                setReason('');
                afterAction();
              }}
            >
              {t('Save reason')}
            </button>
            <button type="button" className="kb-btn" onClick={() => { setSession(null); setReason(''); }}>
              {t('Sign out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- the display ---------- */

const TITLES: Record<Board, string> = { line: 'Line board', site: 'Site board', alarms: 'Alarm board', machine: 'Machine board', terminal: 'Operator terminal' };

export default function Kiosk({ board, id }: { board: Board; id: string }) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { data, toast } = useHive();
  const [search] = useSearchParams();
  const cfg = useMemo(() => parseKioskConfig(search, board), [search, board]);
  const [page, setPage] = useState(0);
  const [pinnedUntil, setPinnedUntil] = useState(0);
  const [lastData, setLastData] = useState(() => Date.now() - (cfg.simulate === 'stale' ? 90_000 : cfg.simulate === 'offline' ? 6 * 60_000 : 0));
  const [tick, setTick] = useState(0);
  const shift = useRef(0);

  useEffect(() => {
    if (cfg.lang && cfg.lang !== lang) setLang(cfg.lang, { persist: false });
  }, [cfg.lang, lang, setLang]);

  // Data arrives every 5 seconds; the simulate parameter holds it back to show the stale states.
  useEffect(() => {
    const i = window.setInterval(() => {
      setTick((x) => x + 1);
      if (!cfg.simulate) setLastData(Date.now());
    }, 5000);
    return () => window.clearInterval(i);
  }, [cfg.simulate]);

  // Screen wake lock where the browser supports it.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => undefined);
    return () => void lock?.release();
  }, []);

  const criticalOpen = data.alarms.filter((a) => a.severity === 'critical' && a.state === 'Open').length;
  const pages = useMemo(() => (cfg.pages.length ? cfg.pages : [board]), [cfg.pages, board]);

  // A new critical alarm pins the alarm page for at least a minute; pages otherwise rotate (dwell at least 8 s).
  const lastCritical = useRef(criticalOpen);
  useEffect(() => {
    if (criticalOpen > lastCritical.current && pages.includes('alarms')) {
      setPage(pages.indexOf('alarms'));
      setPinnedUntil(Date.now() + 60_000);
    }
    lastCritical.current = criticalOpen;
  }, [criticalOpen, pages]);

  useEffect(() => {
    if (pages.length < 2) return;
    const i = window.setInterval(() => {
      if (Date.now() < pinnedUntil) return;
      setPage((p) => (p + 1) % pages.length);
    }, Math.max(8, cfg.rotate) * 1000);
    return () => window.clearInterval(i);
  }, [pages.length, cfg.rotate, pinnedUntil]);

  // Burn-in protection: shift the layout by at most 8 px once per hour.
  useEffect(() => {
    if (!cfg.burnin) return;
    const i = window.setInterval(() => { shift.current = (shift.current + 4) % 12; setTick((x) => x + 1); }, 3_600_000);
    return () => window.clearInterval(i);
  }, [cfg.burnin]);

  const ageS = (Date.now() - lastData) / 1000;
  const stale = ageS >= 60 && ageS < 300;
  const dead = ageS >= 300;
  const since = siteTime(new Date(lastData));
  const current = pages[Math.min(page, pages.length - 1)];

  let body: React.ReactNode;
  if (dead) {
    body = (
      <div className="kb-center" role="alert">
        <h2>{t('No current data since {time}', { time: since })}</h2>
      </div>
    );
  } else {
    switch (current) {
      case 'line':
        body = <LineBoard id={board === 'line' ? id : data.machines[0].lineId} machines={data.machines} alarms={data.alarms} />;
        break;
      case 'site':
        body = <SiteBoard machines={data.machines} alarms={data.alarms} period={cfg.period} />;
        break;
      case 'alarms':
        body = <AlarmBoard alarms={data.alarms} max={cfg.max} />;
        break;
      case 'machine':
        body = <MachineBoard id={board === 'machine' ? id : 'ast_cnc07'} machines={data.machines} />;
        break;
      default:
        body = <Terminal id={board === 'terminal' ? id : 'ast_cnc07'} machines={data.machines} badgeDemo={cfg.badge} />;
    }
  }

  const known = board === 'site' || board === 'alarms' ? id === siteSlug : true;
  void tick;

  return (
    <div className={`kb-root is-${cfg.theme} is-${cfg.density}`} style={cfg.burnin ? { transform: `translate(${shift.current - 4}px, ${shift.current - 4}px)` } : undefined} data-board={current}>
      <header className="kb-head">
        <h1>{t(TITLES[current])}</h1>
        <div className="kb-meta">
          {pages.length > 1 && <span>{t('Page {n} of {total}', { n: Math.min(page, pages.length - 1) + 1, total: pages.length })}</span>}
          <span className="kb-clock" aria-label={t('Time')}>
            {siteTime()}
          </span>
        </div>
      </header>
      {stale && !dead && (
        <div className="kb-banner" role="alert">
          {t('Data is stale since {time}', { time: since })}
        </div>
      )}
      <main className="kb-body">{known ? body : <NotAvailable />}</main>
      <footer className="kb-foot">
        <span>{t('Placeholder data · not a replacement for the plant’s safety systems')}</span>
        <span>{t('Updated {age}', { age: formatDuration(ageS) })}</span>
      </footer>
      {toast && (
        <div className="kb-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export { BOARDS, lineSlug, siteSlug };
export type { Board };
