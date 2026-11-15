import { Check, Copy, Search, X, type LucideIcon } from 'lucide-react-dash';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { formatAgo, formatDuration, formatNumber, useT } from './i18n';
import { STATE_LABEL, type Applicability, type MachineState, type Severity } from './placeholder';

/* ---------- phone mode ---------- */

export const PhoneCtx = createContext(false);
export const usePhone = () => useContext(PhoneCtx);

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* ---------- small pieces ---------- */

export const includes = (q: string, ...vals: string[]) => !q.trim() || vals.some((v) => v.toLowerCase().includes(q.trim().toLowerCase()));

export function Chips<T extends string>({ options, value, onChange, counts, labels }: { options: readonly T[]; value: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>>; labels?: Partial<Record<T, string>> }) {
  const t = useT();
  return (
    <div className="hd-chips" role="group">
      {options.map((o) => (
        <button key={o} type="button" className={`hd-chip${o === value ? ' is-on' : ''}`} aria-pressed={o === value} onClick={() => onChange(o)}>
          <span>{t(labels?.[o] ?? o)}</span>
          {counts && counts[o] !== undefined && <small>{counts[o]}</small>}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const t = useT();
  return (
    <label className="hd-search">
      <Search size={14} aria-hidden="true" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('Search')} aria-label={label} />
    </label>
  );
}

export function Sev({ s }: { s: Severity }) {
  const t = useT();
  return <span className={`hd-sev is-${s}`}>{t(s)}</span>;
}

export type Tone = 'green' | 'red' | 'amber' | 'gray' | 'orange' | 'black';
export function Pill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = useT();
  return <span className={`hd-pillx is-${tone}`}>{typeof children === 'string' ? t(children) : children}</span>;
}

const STATE_TONE: Record<MachineState, Tone> = { producing: 'green', idle: 'amber', setup: 'orange', planned_stop: 'gray', unplanned_stop: 'red', fault: 'red', off: 'gray', unknown: 'gray' };

export const formatAge = formatDuration;

/** State of a machine with the age of that state. Unknown is shown as unknown, never as off. */
export function StateBadge({ state, ageS }: { state: MachineState; ageS?: number }) {
  const t = useT();
  return (
    <Pill tone={STATE_TONE[state]}>
      {t(STATE_LABEL[state])}
      {ageS !== undefined && <em className="hd-age"> · {formatAge(ageS)}</em>}
    </Pill>
  );
}

const APPLIC_LABEL: Record<Applicability, string> = { applies: 'Applies', does_not_apply: 'Does not apply', unknown: 'Unknown' };
const APPLIC_TONE: Record<Applicability, Tone> = { applies: 'green', does_not_apply: 'red', unknown: 'amber' };

/** Every document passage and citation carries this verdict. */
export function ApplicabilityBadge({ verdict, reason }: { verdict: Applicability; reason?: string }) {
  const t = useT();
  return (
    <span title={reason ? t('Reason: {reason}', { reason: t(reason) }) : undefined}>
      <Pill tone={APPLIC_TONE[verdict]}>
        {t(APPLIC_LABEL[verdict])}
        {reason ? ` · ${t(reason)}` : ''}
      </Pill>
    </span>
  );
}

export function CitationChip({ label, locator, applicability, reason }: { label: string; locator: string; applicability: Applicability; reason?: string }) {
  const t = useT();
  const unsupported = applicability !== 'applies';
  return (
    <span className={`hd-cite${unsupported ? ' is-unsupported' : ''}`}>
      <b>{t(label)}</b>
      <small>{t(locator)}</small>
      {unsupported && <small className="hd-cite-flag">{applicability === 'unknown' ? t('not confirmed for this machine') : t('not supported: {reason}', { reason: t(reason ?? 'does not apply') })}</small>}
    </span>
  );
}

export function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="hd-kv">
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

/** A live value with its age; quality markers show for estimated or stale readings. */
export function LiveValue({ value, unit, decimals, limit, quality, ageS }: { value: number; unit: string; decimals: number; limit?: number; quality: 'good' | 'estimated' | 'stale'; ageS: number }) {
  const t = useT();
  const over = limit !== undefined && value > limit;
  return (
    <span className={`hd-live${over ? ' is-over' : ''}${quality === 'stale' ? ' is-stale' : ''}`}>
      <b>
        {formatNumber(value, decimals)}&nbsp;<small>{unit}</small>
      </b>
      <i>
        {quality !== 'good' && <em>{t(quality)}</em>}
        {limit !== undefined && <em>{t('limit {n}', { n: formatNumber(limit, 0) })}</em>}
        <span>{formatAgo(ageS)}</span>
      </i>
    </span>
  );
}

/* ---------- layout pieces ---------- */

export function PageCard({ title, subtitle, actions, children, flush }: { title?: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; flush?: boolean }) {
  return (
    <section className={`hd-card hd-page${flush ? ' is-flush' : ''}`}>
      {(title || actions) && (
        <div className="hd-row hd-page-head">
          <div>
            {title && <h2 className="hd-card-title is-lg">{title}</h2>}
            {subtitle && <p className="hd-muted">{subtitle}</p>}
          </div>
          {actions && <div className="hd-act-tools">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatRow({ items }: { items: { label: string; value: string; tone?: 'orange' }[] }) {
  return (
    <div className="hd-statrow">
      {items.map((i) => (
        <div key={i.label} className={`hd-stat${i.tone === 'orange' ? ' is-accent' : ''}`}>
          <span>{i.label}</span>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  );
}

export function Note({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="hd-note" role="note">
      <Icon size={16} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* ---------- tables that become cards on a phone ---------- */

export interface Col<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  sort?: (a: T, b: T) => number;
}

export interface CardSpec {
  icon?: LucideIcon;
  title: React.ReactNode;
  sub?: React.ReactNode;
  pill?: React.ReactNode;
  meta?: React.ReactNode;
  time?: string;
}

function TimeCol({ time }: { time?: string }) {
  if (!time) return null;
  const [hm, ap] = time.split(' ');
  return (
    <div className="hd-mtime">
      <b>{hm}</b>
      <small>{ap}</small>
    </div>
  );
}

export function MobileCard({ spec, onClick }: { spec: CardSpec; onClick?: () => void }) {
  const Icon = spec.icon;
  return (
    <div className="hd-mrow">
      <TimeCol time={spec.time} />
      <button type="button" className="hd-mcard" onClick={onClick}>
        <span className="hd-mcard-top">
          {Icon && (
            <span className="hd-mcard-icon">
              <Icon size={18} />
            </span>
          )}
          <span className="hd-mcard-text">
            <b>{spec.title}</b>
            {spec.sub && <small>{spec.sub}</small>}
          </span>
        </span>
        {(spec.pill || spec.meta) && (
          <span className="hd-mcard-bottom">
            <span>{spec.pill}</span>
            <small>{spec.meta}</small>
          </span>
        )}
      </button>
    </div>
  );
}

export function DataTable<T extends { id: string }>({ rows, cols, onOpen, empty, card }: { rows: T[]; cols: Col<T>[]; onOpen: (row: T) => void; empty: string; card?: (row: T) => CardSpec }) {
  const phone = usePhone();
  const [sortIdx, setSortIdx] = useState<number | null>(null);
  const [desc, setDesc] = useState(false);
  const sorted = useMemo(() => {
    if (sortIdx === null || !cols[sortIdx]?.sort) return rows;
    const cmp = cols[sortIdx].sort!;
    return [...rows].sort((a, b) => (desc ? -cmp(a, b) : cmp(a, b)));
  }, [rows, cols, sortIdx, desc]);

  if (phone) {
    return (
      <div className="hd-mlist">
        {sorted.map((r) => (
          <MobileCard
            key={r.id}
            onClick={() => onOpen(r)}
            spec={card ? card(r) : { title: cols[0].render(r), sub: cols[1]?.render(r), meta: cols[2]?.render(r) }}
          />
        ))}
        {sorted.length === 0 && <p className="hd-empty">{empty}</p>}
      </div>
    );
  }

  return (
    <div className="hd-table-wrap">
      <table className="hd-table">
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={c.header} aria-sort={sortIdx === i ? (desc ? 'descending' : 'ascending') : undefined}>
                {c.sort ? (
                  <button
                    type="button"
                    className="hd-th-btn"
                    onClick={() => {
                      if (sortIdx === i) setDesc((d) => !d);
                      else {
                        setSortIdx(i);
                        setDesc(false);
                      }
                    }}
                  >
                    {c.header}
                    {sortIdx === i ? (desc ? ' ↓' : ' ↑') : ''}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              className="is-clickable"
              tabIndex={0}
              onClick={() => onOpen(r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpen(r);
              }}
            >
              {cols.map((c) => (
                <td key={c.header}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={cols.length} className="hd-empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- show-once secret dialog ---------- */

/** A secret is shown once, kept only in this dialog's memory, and cleared when it closes. */
export function SecretDialog({ title, secret, hint, onClose }: { title: string; secret: string; hint?: string; onClose: () => void }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="hd-drawer-wrap is-center" onClick={onClose}>
      <div className="hd-search-dialog hd-secret" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="hd-drawer-head">
          <div>
            <h3>{title}</h3>
            <small>{t('This value is shown once and cannot be shown again.')}</small>
          </div>
          <button type="button" className="hd-icon-btn" aria-label={t('Close')} onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="hd-secret-body">
          <code>{secret}</code>
          {hint && <p className="hd-muted">{hint}</p>}
          <button
            type="button"
            className="hd-btn is-dark hd-btn-sm"
            onClick={() => {
              void navigator.clipboard?.writeText(secret).then(() => setCopied(true)).catch(() => undefined);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
