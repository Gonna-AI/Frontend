/**
 * Embeddable components, catalogue `hive-embed/1`.
 *
 * A closed list of read-only components: machine-status, alarm-list, signal-values (at most six signals),
 * oee-summary and state-timeline. They contain no write path, never show an asset key, tenant or grantor
 * name (a share alias and its label only), show the age of every value, and keep every state visible:
 * loading, empty, stale, error, not available, revoked and session expired.
 *
 * The page is meant to run in an iframe. It accepts messages only from a registered origin, and sends
 * host-facing events that carry codes and status only (never values, names or tokens). A token arrives in the
 * URL fragment or by postMessage, is held in memory only and is never put in a query string or a cookie.
 *
 * Placeholder build: no token is verified and the data is the local dataset. The custom elements
 * (`<hive-machine-status>` and the others) and their versioned bundle are not published yet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { LiveValue, StateBadge } from './common';
import { formatAgo, formatNumber, useLang, useT } from './i18n';
import { STATE_LABEL, type MachineState } from './placeholder';
import { useHive } from './store';
import './embed.css';

export const EMBED_VERSION = 'hive-embed/1';
export const EMBED_COMPONENTS = ['machine-status', 'alarm-list', 'signal-values', 'oee-summary', 'state-timeline'] as const;
export type EmbedComponent = (typeof EMBED_COMPONENTS)[number];
export const EMBED_STATES = ['normal', 'loading', 'empty', 'stale', 'error', 'not-available', 'revoked', 'expired'] as const;
export type EmbedState = (typeof EMBED_STATES)[number];

/** Share aliases the demo knows. The real broker maps an alias to the grantor's asset; the embed never sees that. */
export const ALIASES: Record<string, { label: string; machineId: string }> = {
  alias_a1: { label: 'Machine A', machineId: 'ast_cnc07' },
  alias_a2: { label: 'Machine B', machineId: 'ast_press03' },
};

/* ---------- allowed origins (at most 20, exact https origins, no wildcard, no "null") ---------- */

const ORIGINS_KEY = 'hive.embed.origins';
export const MAX_ORIGINS = 20;

export function validateOrigin(v: string, sandbox = false): string | null {
  const s = v.trim();
  if (!s) return 'Enter an origin';
  if (s === 'null' || s.includes('*')) return 'No wildcards and no “null”';
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return 'Not a valid origin';
  }
  if (u.origin !== s) return 'Use the exact origin: scheme, host and port only';
  if (u.protocol !== 'https:' && !(sandbox && u.hostname === 'localhost')) return 'Only https origins are allowed';
  return null;
}

export function readOrigins(): string[] {
  try {
    const v = JSON.parse(window.localStorage.getItem(ORIGINS_KEY) ?? 'null') as unknown;
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string').slice(0, MAX_ORIGINS);
  } catch {
    /* fall through */
  }
  // Same origin only until a tenant registers others (the default is none from outside).
  return [window.location.origin];
}
export function writeOrigins(list: string[]) {
  try {
    window.localStorage.setItem(ORIGINS_KEY, JSON.stringify(list.slice(0, MAX_ORIGINS)));
  } catch {
    /* lasts for this page only */
  }
}

/* ---------- the components ---------- */

function Message({ title, text }: { title: string; text?: string }) {
  return (
    <div className="eb-msg" role="status">
      <b>{title}</b>
      {text && <small>{text}</small>}
    </div>
  );
}

function ComponentBody({ component, alias, ageS, signalsLimit }: { component: EmbedComponent; alias: string; ageS: number; signalsLimit: number }) {
  const t = useT();
  const { data } = useHive();
  const a = ALIASES[alias];
  const m = a && data.machines.find((x) => x.id === a.machineId);
  if (!a || !m) return <Message title={t('Not available')} />;
  const alarms = data.alarms.filter((x) => x.machineId === m.id && x.state !== 'Resolved');

  if (component === 'machine-status') {
    return (
      <div className="eb-card">
        <h3>{t(a.label)}</h3>
        <StateBadge state={m.state} ageS={m.stateAgeS + ageS} />
        <small>{t('Updated {age}', { age: formatAgo(ageS) })}</small>
      </div>
    );
  }
  if (component === 'alarm-list') {
    return (
      <div className="eb-card">
        <h3>{t(a.label)}</h3>
        {alarms.length === 0 ? (
          <small>{t('No open alarms')}</small>
        ) : (
          <ul className="eb-alarms">
            {alarms.map((x) => (
              <li key={x.id}>
                <span className={`hd-sev is-${x.severity}`}>{t(x.severity)}</span> {x.title} <small>· {t('since {time}', { time: x.time })}</small>
              </li>
            ))}
          </ul>
        )}
        <small>{t('Updated {age}', { age: formatAgo(ageS) })}</small>
      </div>
    );
  }
  if (component === 'signal-values') {
    return (
      <div className="eb-card">
        <h3>{t(a.label)}</h3>
        <div className="eb-signals">
          {m.signals.slice(0, Math.min(6, signalsLimit)).map((s) => (
            <div key={s.key}>
              <span>{t(s.label)}</span>
              <LiveValue value={s.value} unit={s.unit} decimals={s.decimals} limit={s.limit} quality={s.quality} ageS={s.ageS + ageS} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (component === 'oee-summary') {
    return (
      <div className="eb-card">
        <h3>{t(a.label)}</h3>
        <p className="eb-big">{m.oee ? `${formatNumber(m.oee, 1)} %` : '–'}</p>
        <small>
          {t('OEE {period}', { period: t('7 days') })} · {t('Updated {age}', { age: formatAgo(ageS + 720) })}
        </small>
      </div>
    );
  }
  const seg: { state: MachineState; w: number }[] = m.state === 'fault' ? [{ state: 'producing', w: 60 }, { state: 'idle', w: 10 }, { state: 'fault', w: 30 }] : [{ state: 'producing', w: 85 }, { state: 'idle', w: 15 }];
  return (
    <div className="eb-card">
      <h3>{t(a.label)}</h3>
      <div className="eb-bar" role="img" aria-label={t('State timeline')}>
        {seg.map((s, i) => (
          <span key={i} className={`is-${s.state}`} style={{ width: `${s.w}%` }} title={t(STATE_LABEL[s.state])} />
        ))}
      </div>
      <div className="eb-legend">
        {[...new Set(seg.map((s) => s.state))].map((s) => (
          <span key={s}>
            <i className={`is-${s}`} /> {t(STATE_LABEL[s])}
          </span>
        ))}
      </div>
      <small>{t('Updated {age}', { age: formatAgo(ageS) })}</small>
    </div>
  );
}

/* ---------- the iframe document ---------- */

export default function EmbedHost({ component }: { component: string }) {
  const t = useT();
  const { lang } = useLang();
  const [search] = useSearchParams();
  const [token, setToken] = useState<string | null>(() => {
    const m = /(?:^#|&)token=([^&]+)/.exec(window.location.hash);
    return m ? decodeURIComponent(m[1]) : null;
  });
  const [theme, setTheme] = useState(search.get('theme') === 'dark' ? 'dark' : search.get('theme') === 'hc' ? 'hc' : 'light');
  const [waited, setWaited] = useState(false);
  const [ageS, setAgeS] = useState(0);
  const parentOrigin = useRef<string | null>(null);
  const origins = useMemo(() => readOrigins(), []);
  const demo = (search.get('state') ?? 'normal') as EmbedState;
  const alias = search.get('alias') ?? 'alias_a1';
  const limit = Math.min(6, Math.max(1, parseInt(search.get('signals') ?? '6', 10) || 6));

  // Where host-facing events go: an explicit registered origin, never a wildcard.
  const send = useCallback((type: string, payload: Record<string, string> = {}) => {
    if (window.parent === window) return;
    const ref = document.referrer ? new URL(document.referrer).origin : null;
    const target = parentOrigin.current ?? (ref && origins.includes(ref) ? ref : origins[0]);
    if (target) window.parent.postMessage({ v: EMBED_VERSION, type, ...payload }, target);
  }, [origins]);

  // Messages are accepted only from a registered origin and only the two defined host-to-embed types.
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!origins.includes(e.origin)) return;
      const d = e.data as { v?: string; type?: string; token?: string; theme?: string } | null;
      if (!d || d.v !== EMBED_VERSION) return;
      parentOrigin.current = e.origin;
      if (d.type === 'hive:token' && typeof d.token === 'string') setToken(d.token);
      if (d.type === 'hive:config' && (d.theme === 'light' || d.theme === 'dark' || d.theme === 'hc')) setTheme(d.theme);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [origins]);

  // The token is not kept in the address bar.
  useEffect(() => {
    if (window.location.hash.includes('token=')) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, []);

  // Without a token for a few seconds the embed asks the host for one.
  useEffect(() => {
    if (token) return;
    const i = window.setTimeout(() => {
      setWaited(true);
      send('hive:token_request');
    }, 2500);
    return () => window.clearTimeout(i);
  }, [token, send]);

  // Polls no faster than every 15 seconds.
  useEffect(() => {
    const i = window.setInterval(() => setAgeS(0), 15000);
    const j = window.setInterval(() => setAgeS((x) => x + 1), 1000);
    return () => {
      window.clearInterval(i);
      window.clearInterval(j);
    };
  }, []);

  const known = (EMBED_COMPONENTS as readonly string[]).includes(component);
  const effective: EmbedState = !known ? 'not-available' : !token && waited ? 'expired' : !token ? 'loading' : demo === 'normal' && ageS >= 60 ? 'stale' : demo;

  useEffect(() => {
    const status: Record<EmbedState, string> = { normal: 'ready', loading: 'loading', empty: 'ready', stale: 'stale', error: 'error', 'not-available': 'error', revoked: 'revoked', expired: 'error' };
    send('hive:state', { status: status[effective] });
  }, [effective, send]);

  let body: React.ReactNode;
  switch (effective) {
    case 'loading':
      body = <Message title={t('Loading…')} />;
      break;
    case 'empty':
      body = <Message title={t('No data shared')} />;
      break;
    case 'error':
      body = <Message title={t('Something went wrong')} text={t('Try again later.')} />;
      break;
    case 'not-available':
      body = <Message title={t('Not available')} />;
      break;
    case 'revoked':
      body = <Message title={t('Share ended')} />;
      break;
    case 'expired':
      body = <Message title={t('Session expired')} text={t('The page that shows this needs to send a new token.')} />;
      break;
    default:
      body = (
        <>
          {effective === 'stale' && <div className="eb-stale">{t('Data is stale')}</div>}
          <ComponentBody component={component as EmbedComponent} alias={alias} ageS={ageS} signalsLimit={limit} />
        </>
      );
  }

  return (
    <div className={`hd-root eb-root${theme === 'dark' ? ' is-dark' : ''} is-${theme}`} lang={lang} data-embed={component}>
      {body}
    </div>
  );
}

