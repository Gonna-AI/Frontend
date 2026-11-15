import { Info, Plus, X } from 'lucide-react-dash';
import { useEffect, useMemo, useRef, useState } from 'react';

import { brandStyle, checkBrand, DEFAULT_BRAND, FONT_ALLOW_LIST, LOGO_MAX_BYTES, NAME_MAX, useBrand, type Brand, type ContrastCheck } from './branding';
import { Chips, Field, Note, PageCard, Pill } from './common';
import { EMBED_COMPONENTS, EMBED_STATES, EMBED_VERSION, ALIASES, MAX_ORIGINS, readOrigins, validateOrigin, writeOrigins, type EmbedComponent, type EmbedState } from './embed';
import { formatNumber, useT } from './i18n';
import { BOARDS, siteSlug, type Board } from './kiosk';
import { useHive } from './store';

const BASE = '/dashboard/hive';

function NotEntitled({ feature }: { feature: string }) {
  const t = useT();
  return (
    <PageCard title={t('Not included in your plan')}>
      <Note icon={Info}>
        {t('This feature needs the “{feature}” entitlement (403 feature_not_entitled). The console keeps the default Hive look and offers no embeds.', { feature })}
      </Note>
    </PageCard>
  );
}

/* ---------- shop-floor displays ---------- */

const BOARD_LABEL: Record<Board, string> = { line: 'Line board', site: 'Site board', alarms: 'Alarm board', machine: 'Machine board', terminal: 'Operator terminal' };

export function DisplaysArea() {
  const t = useT();
  const { data, notify } = useHive();
  const [board, setBoard] = useState<Board>('line');
  const [lineId, setLineId] = useState('line-2');
  const [machineId, setMachineId] = useState('ast_cnc07');
  const [pages, setPages] = useState<Board[]>([]);
  const [rotate, setRotate] = useState(20);
  const [density, setDensity] = useState<'far' | 'near'>('far');
  const [theme, setTheme] = useState<'hc' | 'light' | 'dark'>('hc');
  const [lang, setLang] = useState<'' | 'de' | 'en'>('');
  const [max, setMax] = useState(8);
  const [burnin, setBurnin] = useState(false);
  const [badge, setBadge] = useState(false);

  const lines = [...new Map(data.machines.map((m) => [m.lineId, m.line])).entries()];
  const id = board === 'line' ? lineId : board === 'machine' || board === 'terminal' ? machineId : siteSlug;
  const url = useMemo(() => {
    const q = new URLSearchParams();
    if (pages.length) q.set('pages', pages.join(','));
    if (pages.length > 1) q.set('rotate', String(rotate));
    q.set('density', board === 'terminal' ? 'near' : density);
    if (theme !== 'hc') q.set('theme', theme);
    if (lang) q.set('lang', lang);
    if (board === 'alarms' || pages.includes('alarms')) q.set('max', String(max));
    if (burnin) q.set('burnin', '1');
    if (board === 'terminal' && badge) q.set('badge', 'demo');
    const s = q.toString();
    return `${BASE}/kiosk/${board}/${id}${s ? `?${s}` : ''}`;
  }, [board, id, pages, rotate, density, theme, lang, max, burnin, badge]);

  const full = `${window.location.origin}${url}`;
  const togglePage = (p: Board) => setPages((x) => (x.includes(p) ? x.filter((y) => y !== p) : [...x, p]));

  return (
    <>
      <Note icon={Info}>
        {t('Displays show no personal data and offer no commands, approvals, notes or admin functions. The only writes are, on terminals inside a badge session, acknowledging an alarm and entering a downtime reason from a fixed list.')}
      </Note>
      <PageCard title={t('Shop-floor displays')} subtitle={t('Build the address for a wall display or a terminal. Configuration lives in the address only; it never holds a tenant or a credential.')}>
        <Chips options={BOARDS} value={board} onChange={setBoard} labels={BOARD_LABEL} />
        <div className="hd-form">
          {board === 'line' && (
            <label>
              <span>{t('Line')}</span>
              <select value={lineId} onChange={(e) => setLineId(e.target.value)}>
                {lines.map(([lid, l]) => (
                  <option key={lid} value={lid}>{l}</option>
                ))}
              </select>
            </label>
          )}
          {(board === 'machine' || board === 'terminal') && (
            <label>
              <span>{t('Machine')}</span>
              <select value={machineId} onChange={(e) => setMachineId(e.target.value)}>
                {data.machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.key}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            <span>{t('Density')}</span>
            <select value={board === 'terminal' ? 'near' : density} disabled={board === 'terminal'} onChange={(e) => setDensity(e.target.value as 'far' | 'near')}>
              <option value="far">{t('Far (readable from 5 m)')}</option>
              <option value="near">{t('Near (touch)')}</option>
            </select>
          </label>
          <label>
            <span>{t('Theme')}</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as 'hc' | 'light' | 'dark')}>
              <option value="hc">{t('High contrast')}</option>
              <option value="dark">{t('Dark theme')}</option>
              <option value="light">{t('Light theme')}</option>
            </select>
          </label>
          <label>
            <span>{t('Language')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as '' | 'de' | 'en')}>
              <option value="">{t('Default')}</option>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <label>
            <span>{t('Rows on the alarm board')}</span>
            <input type="number" min={1} max={20} value={max} onChange={(e) => setMax(Math.min(20, Math.max(1, Number(e.target.value) || 8)))} />
          </label>
        </div>
        <h4 className="hd-subhead">{t('Rotate pages')}</h4>
        <div className="hd-chips" role="group" aria-label={t('Rotate pages')}>
          {BOARDS.filter((b) => b !== 'terminal').map((p) => (
            <button key={p} type="button" className={`hd-chip${pages.includes(p) ? ' is-on' : ''}`} aria-pressed={pages.includes(p)} onClick={() => togglePage(p)}>
              {t(BOARD_LABEL[p])}
            </button>
          ))}
        </div>
        {pages.length > 1 && (
          <label className="hd-form-inline">
            <span>{t('Seconds per page (10 to 60)')}</span>
            <input type="number" min={10} max={60} value={rotate} onChange={(e) => setRotate(Math.min(60, Math.max(10, Number(e.target.value) || 20)))} />
          </label>
        )}
        <label className="hd-check">
          <input type="checkbox" checked={burnin} onChange={(e) => setBurnin(e.target.checked)} /> {t('Shift the layout by a few pixels each hour (burn-in protection)')}
        </label>
        {board === 'terminal' && (
          <label className="hd-check">
            <input type="checkbox" checked={badge} onChange={(e) => setBadge(e.target.checked)} /> {t('Demo: allow a simulated badge read (real badge login needs a works agreement reference)')}
          </label>
        )}
        <div className="hd-url">
          <code>{full}</code>
          <div className="hd-approval-actions">
            <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => void navigator.clipboard?.writeText(full).then(() => notify(t('Address copied'))).catch(() => undefined)}>
              {t('Copy')}
            </button>
            <a className="hd-btn is-dark hd-btn-sm hd-btn-arrow" href={url} target="_blank" rel="noreferrer">
              {t('Open display')}
            </a>
          </div>
        </div>
        <p className="hd-muted hd-fine">
          {t('Demo addresses: add ?simulate=stale to see the stale banner and ?simulate=offline to see the no-data state.')}
        </p>
      </PageCard>
      <PageCard title={t('Pairing')} subtitle={t('A display signs in as a service account with a read-only role limited to its line or hall.')}>
        <Field k={t('Step 1')} v={t('The display creates a key pair in the browser and shows its fingerprint')} />
        <Field k={t('Step 2')} v={t('An administrator registers it as a service account with a read-only role')} />
        <Field k={t('Step 3')} v={t('The display signs in with it; nothing secret is ever in the address')} />
        <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => notify(t('Pairing needs the service-account API (placeholder)'))}>
          {t('Pair a display')}
        </button>
      </PageCard>
    </>
  );
}

/* ---------- embeds ---------- */

interface LogLine {
  at: string;
  text: string;
}

export function EmbedArea() {
  const t = useT();
  const { entitlements } = useBrand();
  const [component, setComponent] = useState<EmbedComponent>('machine-status');
  const [alias, setAlias] = useState('alias_a1');
  const [state, setState] = useState<EmbedState>('normal');
  const [theme, setTheme] = useState<'light' | 'dark' | 'hc'>('light');
  const [lang, setLang] = useState<'de' | 'en'>('de');
  const [signals, setSignals] = useState(6);
  const [withToken, setWithToken] = useState(true);
  const [origins, setOrigins] = useState<string[]>(() => readOrigins());
  const [origin, setOrigin] = useState('');
  const [originError, setOriginError] = useState<string | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const frame = useRef<HTMLIFrameElement>(null);

  const src = `${BASE}/embed/${component}?alias=${alias}&lang=${lang}&theme=${theme}&state=${state}&signals=${signals}${withToken ? '#token=demo-token-not-real' : ''}`;
  const key = `${component}|${alias}|${state}|${theme}|${lang}|${signals}|${withToken}`;

  // Host-side listener: shows the events the embed sends (codes and status only).
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { v?: string; type?: string; status?: string } | null;
      if (!d || d.v !== EMBED_VERSION || !d.type) return;
      setLog((l) => [{ at: new Date().toLocaleTimeString('de-DE'), text: `${d.type}${d.status ? ` · ${d.status}` : ''}` }, ...l].slice(0, 8));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!entitlements.embed) return <NotEntitled feature="embed.enabled" />;

  const post = (message: Record<string, string>) => frame.current?.contentWindow?.postMessage({ v: EMBED_VERSION, ...message }, window.location.origin);

  const addOrigin = () => {
    const err = validateOrigin(origin);
    if (err) return setOriginError(err);
    if (origins.includes(origin.trim())) return setOriginError('Already in the list');
    if (origins.length >= MAX_ORIGINS) return setOriginError(`At most ${MAX_ORIGINS} origins`);
    const next = [...origins, origin.trim()];
    setOrigins(next);
    writeOrigins(next);
    setOrigin('');
    setOriginError(null);
  };

  const wc = `<script type="module" src="https://embed.example.com/v1/1.0.0/hive-embed.js"\n  integrity="sha384-…" crossorigin="anonymous"></script>\n<hive-${component} alias="${alias}" lang="${lang}"></hive-${component}>`;
  const ifr = `<iframe src="https://embed.example.com${src.replace(BASE, '')}"\n  title="Hive" loading="lazy" referrerpolicy="no-referrer"\n  sandbox="allow-scripts allow-same-origin"></iframe>`;

  return (
    <>
      <Note icon={Info}>
        {t('Embeds are read-only. They show a share alias and its label, never an asset key, tenant or grantor name. A partner’s backend mints the token; it goes to the embed in the address fragment or by message, never in a query string or cookie.')}
      </Note>
      <PageCard title={t('Embeddable components')} subtitle={t('Catalogue {v}: a closed list. Anything else cannot be embedded.', { v: EMBED_VERSION })}>
        <Chips options={EMBED_COMPONENTS} value={component} onChange={setComponent} />
        <div className="hd-form">
          <label>
            <span>{t('Share alias')}</span>
            <select value={alias} onChange={(e) => setAlias(e.target.value)}>
              {Object.entries(ALIASES).map(([k, v]) => (
                <option key={k} value={k}>{t(v.label)}</option>
              ))}
              <option value="alias_unknown">{t('(unknown alias)')}</option>
            </select>
          </label>
          <label>
            <span>{t('Language')}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as 'de' | 'en')}>
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <label>
            <span>{t('Theme')}</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'hc')}>
              <option value="light">{t('Light theme')}</option>
              <option value="dark">{t('Dark theme')}</option>
              <option value="hc">{t('High contrast')}</option>
            </select>
          </label>
          <label>
            <span>{t('Show state')}</span>
            <select value={state} onChange={(e) => setState(e.target.value as EmbedState)}>
              {EMBED_STATES.map((s) => (
                <option key={s} value={s}>{t(s)}</option>
              ))}
            </select>
          </label>
          {component === 'signal-values' && (
            <label>
              <span>{t('Signals (at most 6)')}</span>
              <input type="number" min={1} max={6} value={signals} onChange={(e) => setSignals(Math.min(6, Math.max(1, Number(e.target.value) || 6)))} />
            </label>
          )}
        </div>
        <label className="hd-check">
          <input type="checkbox" checked={withToken} onChange={(e) => setWithToken(e.target.checked)} /> {t('Send a token with the address (demo token, not real)')}
        </label>
        <div className="hd-embed-preview">
          <iframe key={key} ref={frame} src={src} title={t('Embed preview')} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
        </div>
        <div className="hd-approval-actions">
          <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => post({ type: 'hive:token', token: 'demo-token-not-real' })}>
            {t('Send token by message')}
          </button>
          <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => post({ type: 'hive:config', theme: theme === 'light' ? 'dark' : 'light' })}>
            {t('Send theme by message')}
          </button>
        </div>
        <h4 className="hd-subhead">{t('Events from the embed')}</h4>
        {log.length === 0 && <p className="hd-muted hd-fine">{t('None yet. Events carry codes and status only, never values or names.')}</p>}
        <ul className="hd-log">
          {log.map((l, i) => (
            <li key={i}>
              <time>{l.at}</time> <code>{l.text}</code>
            </li>
          ))}
        </ul>
      </PageCard>

      <PageCard title={t('Add it to a page')} subtitle={t('The custom-element bundle is planned; the address form below works in this build.')}>
        <h4 className="hd-subhead">iframe</h4>
        <pre className="hd-code">{ifr}</pre>
        <h4 className="hd-subhead">{t('Custom element (planned)')}</h4>
        <pre className="hd-code">{wc}</pre>
      </PageCard>

      <PageCard title={t('Allowed origins')} subtitle={t('At most {n}. Exact https origins only: no wildcards, no “null”.', { n: MAX_ORIGINS })}>
        <ul className="hd-origins">
          {origins.map((o) => (
            <li key={o}>
              <code>{o}</code>
              <button type="button" className="hd-icon-btn" aria-label={t('Remove {o}', { o })} onClick={() => { const next = origins.filter((x) => x !== o); setOrigins(next); writeOrigins(next); }}>
                <X size={14} />
              </button>
            </li>
          ))}
          {origins.length === 0 && <li className="hd-muted">{t('None: no page may embed.')}</li>}
        </ul>
        <div className="hd-inline-form">
          <input value={origin} onChange={(e) => { setOrigin(e.target.value); setOriginError(null); }} placeholder="https://portal.example.com" aria-label={t('Origin')} onKeyDown={(e) => { if (e.key === 'Enter') addOrigin(); }} />
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={addOrigin}>
            <Plus size={14} /> {t('Add')}
          </button>
        </div>
        {originError && <p className="hd-error" role="alert">{t(originError.replace(/At most \d+ origins/, 'At most {n}'), { n: MAX_ORIGINS })}</p>}
        <p className="hd-muted hd-fine">{t('Changes need the security administrator or tenant administrator role. They set the frame-ancestors, CORS and token origin checks.')}</p>
      </PageCard>
    </>
  );
}

/* ---------- white-label branding ---------- */

export function BrandingArea() {
  const t = useT();
  const { brand, applied, save, reset, entitlements } = useBrand();
  const { notify } = useHive();
  const [draft, setDraft] = useState<Brand>(brand);
  const [failed, setFailed] = useState<ContrastCheck[] | null>(null);
  const checks = useMemo(() => checkBrand(draft), [draft]);

  useEffect(() => setDraft(brand), [brand]);

  if (!entitlements.whiteLabel) return <NotEntitled feature="branding.white_label" />;

  const onFile = (which: 'logoLight' | 'logoDark', f?: File) => {
    if (!f) return;
    if (!/^image\/(svg\+xml|png)$/.test(f.type)) return notify(t('Logo must be SVG or PNG'));
    if (f.size > LOGO_MAX_BYTES) return notify(t('Logo must be 200 KB or smaller'));
    const r = new FileReader();
    r.onload = () => setDraft((d) => ({ ...d, [which]: String(r.result) }));
    r.readAsDataURL(f);
  };

  return (
    <>
      <Note icon={Info}>
        {t('A theme changes the name, logo, accent colour, surface tint and heading font only. Status colours and icons, age labels, safety notices, tier and applicability badges, citations and the AI-generated marker cannot be themed.')}
      </Note>
      <PageCard title={t('Branding')} subtitle={t('White label: replace the Hive name and logo in this console')}>
        <div className="hd-form">
          <label>
            <span>{t('Product name')} <small>({draft.name.length}/{NAME_MAX})</small></span>
            <input value={draft.name} maxLength={NAME_MAX} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label>
            <span>{t('Accent colour')}</span>
            <span className="hd-colour">
              <input type="color" value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} aria-label={t('Accent colour')} />
              <input value={draft.accent} onChange={(e) => setDraft({ ...draft, accent: e.target.value })} aria-label={t('Accent colour (hex)')} />
            </span>
          </label>
          <label>
            <span>{t('Surface tint')}</span>
            <span className="hd-colour">
              <input type="color" value={draft.tint} onChange={(e) => setDraft({ ...draft, tint: e.target.value })} aria-label={t('Surface tint')} />
              <input value={draft.tint} onChange={(e) => setDraft({ ...draft, tint: e.target.value })} aria-label={t('Surface tint (hex)')} />
            </span>
          </label>
          <label>
            <span>{t('Heading font')}</span>
            <select value={draft.font} onChange={(e) => setDraft({ ...draft, font: e.target.value as Brand['font'] })}>
              {FONT_ALLOW_LIST.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{t('Logo, light (SVG or PNG, 200 KB)')}</span>
            <input type="file" accept="image/svg+xml,image/png" onChange={(e) => onFile('logoLight', e.target.files?.[0])} />
          </label>
          <label>
            <span>{t('Logo, dark (SVG or PNG, 200 KB)')}</span>
            <input type="file" accept="image/svg+xml,image/png" onChange={(e) => onFile('logoDark', e.target.files?.[0])} />
          </label>
        </div>

        <h4 className="hd-subhead">{t('Contrast checks')}</h4>
        <ul className="hd-checks">
          {checks.map((c) => (
            <li key={c.pair} className={c.ok ? 'is-ok' : 'is-bad'}>
              <Pill tone={c.ok ? 'green' : 'red'}>{c.ok ? t('Pass') : t('Fail')}</Pill>
              <span>{t(c.pair)}</span>
              <b>{formatNumber(c.ratio, 1)}:1</b>
              <small>{t('needs {n}:1', { n: formatNumber(c.need, 1) })}</small>
            </li>
          ))}
        </ul>
        {failed && (
          <p className="hd-error" role="alert">
            {t('Not saved. This pair is too low: {pair}', { pair: failed.map((f) => t(f.pair)).join(', ') })}
          </p>
        )}
        <div className="hd-approval-actions">
          <button type="button" className="hd-btn is-light hd-btn-sm" onClick={() => { reset(); setDraft(DEFAULT_BRAND); setFailed(null); notify(t('Back to the default Hive look')); }}>
            {t('Reset to default')}
          </button>
          <button
            type="button"
            className="hd-btn is-accent hd-btn-sm"
            onClick={() => {
              const bad = save(draft);
              setFailed(bad);
              if (!bad) notify(t('Branding saved in this browser (placeholder)'));
            }}
          >
            {t('Save')}
          </button>
        </div>
      </PageCard>
      <PageCard title={t('Preview')}>
        <div className="hd-brand-preview" style={brandStyle(draft)}>
          <span className="hd-brand-mark">{draft.logoLight ? <img src={draft.logoLight} alt="" width={20} height={20} /> : <img src="/brand-mark-tile.svg" alt="" width={18} height={18} />}</span>
          <b style={{ fontFamily: `'${draft.font}', Inter, sans-serif` }}>{draft.name || '—'}</b>
          <span className="hd-btn is-dark hd-btn-sm" style={{ background: draft.accent, color: contrastOn(draft.accent) }}>{t('Primary action')}</span>
        </div>
        <Field k={t('Applied now')} v={applied.name} />
      </PageCard>
    </>
  );
}

function contrastOn(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const l = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return l > 0.5 ? '#171717' : '#ffffff';
}

