import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Bell,
  BellRing,
  Calendar,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Cpu,
  EllipsisVertical,
  FileText,
  Layers,
  LayoutGrid,
  LogOut,
  Mail,
  Moon,
  Plus,
  Radio,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Users,
  Wifi,
  CircleHelp,
  Thermometer,
  Unplug,
  Gauge,
  Wrench,
  Package,
  type LucideIcon,
} from 'lucide-react-dash';
import { useEffect, useMemo, useState } from 'react';

import { fetchHiveHealth, fetchHiveOverview, type HiveApiState } from './hiveApi';
import { placeholderOverview, type HiveEvent, type HiveOverview } from './placeholder';
import './hive-dashboard.css';

export interface HiveDashboardUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface HiveDashboardProps {
  user: HiveDashboardUser;
  onSignOut?: () => void;
}

const TABS = ['Overview', 'Activity', 'Assets', 'Alarms', 'Reports'] as const;

const RAIL: { icon: LucideIcon; label: string }[] = [
  { icon: LayoutGrid, label: 'Overview' },
  { icon: Calendar, label: 'Schedule' },
  { icon: Mail, label: 'Inbox' },
  { icon: FileText, label: 'Documents' },
  { icon: Users, label: 'People' },
  { icon: Layers, label: 'Graph' },
  { icon: Settings, label: 'Settings' },
];

const TILE_ICON: Record<HiveOverview['tiles'][number]['key'], LucideIcon> = {
  signals: Radio,
  alarms: BellRing,
  assets: Cpu,
  workOrders: ClipboardList,
};

const EVENT_ICON: Record<HiveEvent['kind'], LucideIcon> = {
  thermal: Thermometer,
  link: Unplug,
  quality: Gauge,
  maintenance: Wrench,
  stock: Package,
};

const STATUS_CLASS: Record<HiveEvent['status'], string> = {
  Resolved: 'is-done',
  Open: 'is-open',
  Acknowledged: 'is-progress',
};

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

function Delta({ up, children }: { up: boolean; children: React.ReactNode }) {
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`hd-delta ${up ? 'is-up' : 'is-down'}`}>
      <Icon size={11} strokeWidth={2.4} aria-hidden="true" />
      {children}
    </span>
  );
}

const API_LABEL: Record<HiveApiState, string> = {
  unconfigured: 'Placeholder data',
  checking: 'Placeholder data · checking API',
  online: 'Placeholder data · API online',
  offline: 'Placeholder data · API offline',
};

function AlarmChart({ data }: { data: HiveOverview['alarmVolume'] }) {
  const max = 50;
  const ticks = [50, 40, 30, 20, 10, 0];
  return (
    <div className="hd-chart" role="img" aria-label="Alarms raised and resolved per week, last eight weeks (placeholder)">
      <div className="hd-chart-head">
        <span>Raised and resolved</span>
        <span className="hd-legend">
          <i className="hd-dot is-orange" /> Raised
          <i className="hd-dot is-black" /> Resolved
        </span>
      </div>
      <div className="hd-chart-plot">
        <div className="hd-chart-axis" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t}>{t === 0 ? '00' : t}</span>
          ))}
        </div>
        <div className="hd-chart-area">
          <div className="hd-chart-grid" aria-hidden="true">
            {ticks.map((t) => (
              <i key={t} />
            ))}
          </div>
          <div className="hd-bars">
            {data.map((d) => (
              <div className="hd-bar-col" key={d.label}>
                <div className="hd-bar">
                  <span className="hd-bar-raised" style={{ height: `${(Math.max(d.raised - d.resolved, 0) / max) * 100}%` }} />
                  <span className="hd-bar-resolved" style={{ height: `${(d.resolved / max) * 100}%` }} />
                </div>
                <span className="hd-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HiveDashboard({ user, onSignOut }: HiveDashboardProps) {
  const [dark, setDark] = useState(false);
  const [overview, setOverview] = useState<HiveOverview>(placeholderOverview);
  const [apiState, setApiState] = useState<HiveApiState>('checking');
  const [query, setQuery] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set(['EVT_000073']));
  const [site, setSite] = useState(placeholderOverview.plant.name);

  useEffect(() => {
    let live = true;
    const ctrl = new AbortController();
    void fetchHiveOverview().then((o) => live && setOverview(o));
    void fetchHiveHealth(ctrl.signal).then((s) => live && setApiState(s));
    return () => {
      live = false;
      ctrl.abort();
    };
  }, []);

  const events = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return overview.events;
    return overview.events.filter((e) => [e.id, e.activity, e.asset, e.status].some((v) => v.toLowerCase().includes(q)));
  }, [overview.events, query]);

  const allChecked = events.length > 0 && events.every((e) => checked.has(e.id));
  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (allChecked) events.forEach((e) => next.delete(e.id));
      else events.forEach((e) => next.add(e.id));
      return next;
    });

  const firstName = user.name.split(/\s+/)[0] || user.name;
  const usedPct = Math.round((overview.bufferUsedGb / overview.bufferTotalGb) * 100);

  return (
    <div className={`hd-root${dark ? ' is-dark' : ''}`} data-theme={dark ? 'dark' : 'light'}>
      <div className="hd-shell">
        <header className="hd-top">
          <a className="hd-brand" href="/dashboard/hive" aria-label="Hive home">
            <span className="hd-brand-mark">
              <img src="/brand-mark-tile.svg" alt="" width={18} height={18} />
            </span>
            <span className="hd-brand-name">Hive</span>
          </a>

          <nav className="hd-tabs" aria-label="Hive sections">
            {TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`hd-tab${i === 0 ? ' is-active' : ''}`}
                aria-current={i === 0 ? 'page' : undefined}
                disabled={i !== 0}
                title={i === 0 ? undefined : 'Coming soon'}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="hd-tools">
            <div className="hd-tools-pill">
              <button type="button" className="hd-icon-btn" aria-label="Search">
                <Search size={16} />
              </button>
              <button type="button" className="hd-icon-btn has-dot" aria-label="Notifications">
                <Bell size={16} />
              </button>
              <button type="button" className="hd-icon-btn" aria-label="Status">
                <CircleAlert size={16} />
              </button>
            </div>
            <button type="button" className="hd-profile" aria-label="Account menu">
              <span className="hd-avatar">
                {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}
              </span>
              <span className="hd-profile-text">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="hd-body">
          <aside className="hd-rail" aria-label="Workspace">
            <div className="hd-rail-pill hd-theme" role="group" aria-label="Theme">
              <button type="button" className={!dark ? 'is-on' : ''} onClick={() => setDark(false)} aria-label="Light theme" aria-pressed={!dark}>
                <Sun size={15} />
              </button>
              <button type="button" className={dark ? 'is-on' : ''} onClick={() => setDark(true)} aria-label="Dark theme" aria-pressed={dark}>
                <Moon size={15} />
              </button>
            </div>

            <div className="hd-rail-pill hd-nav">
              {RAIL.map(({ icon: Icon, label }, i) => (
                <button key={label} type="button" className={i === 0 ? 'is-on' : ''} aria-label={label} title={label} aria-current={i === 0 ? 'page' : undefined}>
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <div className="hd-rail-pill hd-foot">
              <button type="button" aria-label="Help" title="Help">
                <CircleHelp size={16} />
              </button>
              <button type="button" aria-label="Sign out" title="Sign out" onClick={onSignOut}>
                <LogOut size={16} />
              </button>
            </div>
          </aside>

          <main className="hd-main">
            <div className="hd-heading">
              <div>
                <h1>
                  {greeting()}, {firstName}
                </h1>
                <p>Stay on top of your plant, monitor signals, and track alarms.</p>
              </div>
              <span className={`hd-api is-${apiState}`} role="status">
                <i /> {API_LABEL[apiState]}
              </span>
            </div>

            <div className="hd-grid">
              {/* Plant availability */}
              <section className="hd-card hd-balance" aria-labelledby="hd-plant">
                <div className="hd-row">
                  <span id="hd-plant" className="hd-label">
                    Plant availability
                  </span>
                  <label className="hd-select">
                    <select value={site} onChange={(e) => setSite(e.target.value)} aria-label="Site">
                      <option>{overview.plant.name}</option>
                    </select>
                    <ChevronDown size={12} aria-hidden="true" />
                  </label>
                </div>
                <div className="hd-big">{overview.plant.availability}</div>
                <div className="hd-sub">
                  <Delta up={overview.plant.deltaUp}>{overview.plant.delta}</Delta>
                  <span>than last week</span>
                </div>
                <div className="hd-actions">
                  <button type="button" className="hd-btn is-dark">
                    <ArrowLeftRight size={16} /> Open alarms
                  </button>
                  <button type="button" className="hd-btn is-light">
                    <ClipboardList size={16} /> Work order
                  </button>
                </div>
                <div className="hd-panel hd-wallets">
                  <div className="hd-panel-title">
                    <strong>Sites</strong>
                    <span>Total {overview.sites.length} sites</span>
                  </div>
                  <div className="hd-wallet-row">
                    {overview.sites.map((s) => (
                      <div className="hd-wallet" key={s.id}>
                        <div className="hd-wallet-top">
                          <span className="hd-site-chip">{s.name.slice(0, 1)}</span>
                          <b>{s.name}</b>
                          <EllipsisVertical size={12} aria-hidden="true" />
                        </div>
                        <div className="hd-wallet-amount">{s.oee}</div>
                        <small>{s.signals}</small>
                        <em className={s.state === 'Active' ? 'is-active' : 'is-inactive'}>{s.state}</em>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Tiles */}
              <section className="hd-tiles" aria-label="Key figures">
                {overview.tiles.map((t, i) => {
                  const Icon = TILE_ICON[t.key];
                  return (
                    <div className={`hd-tile${i === 0 ? ' is-accent' : ''}`} key={t.key}>
                      <div className="hd-row">
                        <span>{t.label}</span>
                        <span className="hd-tile-icon">
                          <Icon size={14} />
                        </span>
                      </div>
                      <div className="hd-tile-value">{t.value}</div>
                      <div className="hd-sub">
                        <Delta up={t.up}>{t.delta}</Delta>
                        <span>This month</span>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Chart */}
              <section className="hd-card hd-income" aria-labelledby="hd-alarms">
                <h2 id="hd-alarms">Alarm volume</h2>
                <p className="hd-muted">View alarms raised and resolved over the last eight weeks</p>
                <AlarmChart data={overview.alarmVolume} />
              </section>

              {/* Buffer */}
              <section className="hd-card hd-limit" aria-labelledby="hd-buffer">
                <h2 id="hd-buffer" className="hd-card-title">
                  Edge buffer usage
                </h2>
                <div
                  className="hd-progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={usedPct}
                  aria-label="Edge buffer used"
                >
                  <span style={{ width: `${usedPct}%` }} />
                </div>
                <div className="hd-progress-meta">
                  <b>{overview.bufferUsedGb.toFixed(1)} GB</b>
                  <small>used out of</small>
                  <span>{overview.bufferTotalGb.toFixed(1)} GB</span>
                </div>
              </section>

              {/* Gateways */}
              <section className="hd-card hd-cards" aria-labelledby="hd-gateways">
                <div className="hd-row">
                  <div className="hd-title-with-icon">
                    <span className="hd-ico-chip">
                      <Wifi size={15} />
                    </span>
                    <h2 id="hd-gateways" className="hd-card-title">
                      Gateways
                    </h2>
                  </div>
                  <button type="button" className="hd-ghost">
                    <Plus size={12} /> Enroll
                  </button>
                </div>
                <div className="hd-gw-row">
                  {overview.gateways.map((g, i) => (
                    <div className={`hd-gw ${i === 0 ? 'is-black' : 'is-orange'}`} key={g.id}>
                      <div className="hd-gw-top">
                        <Wifi size={13} aria-hidden="true" />
                        <span className="hd-gw-state">{g.state}</span>
                        {i === 0 ? (
                          <span className="hd-gw-logo" aria-hidden="true">
                            <i />
                            <i />
                          </span>
                        ) : (
                          <Sparkles size={22} className="hd-gw-spark" aria-hidden="true" />
                        )}
                      </div>
                      <div className="hd-gw-meta">
                        <div>
                          <small>Gateway ID</small>
                          <span>{g.id.replace(/.*· /, '**** **** ')}</span>
                        </div>
                        <div>
                          <small>Version</small>
                          <span>{g.version}</span>
                        </div>
                        <div>
                          <small>Uptime</small>
                          <span>{g.uptime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Events */}
              <section className="hd-card hd-activity" aria-labelledby="hd-events">
                <div className="hd-row">
                  <h2 id="hd-events" className="hd-card-title is-lg">
                    Recent events
                  </h2>
                  <div className="hd-act-tools">
                    <label className="hd-search">
                      <Search size={14} aria-hidden="true" />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search events" />
                    </label>
                    <button type="button" className="hd-filter">
                      Filter <SlidersHorizontal size={13} />
                    </button>
                  </div>
                </div>
                <div className="hd-table-wrap">
                  <table className="hd-table">
                    <thead>
                      <tr>
                        <th className="hd-col-check">
                          <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all events" />
                        </th>
                        <th>Event ID</th>
                        <th>Activity</th>
                        <th>Asset</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((e) => {
                        const Icon = EVENT_ICON[e.kind];
                        const on = checked.has(e.id);
                        return (
                          <tr key={e.id} className={on ? 'is-selected' : ''}>
                            <td className="hd-col-check">
                              <input type="checkbox" checked={on} onChange={() => toggle(e.id)} aria-label={`Select ${e.id}`} />
                            </td>
                            <td>{e.id}</td>
                            <td>
                              <span className="hd-act">
                                <span className="hd-act-icon">
                                  <Icon size={13} />
                                </span>
                                {e.activity}
                              </span>
                            </td>
                            <td>{e.asset}</td>
                            <td>
                              <span className={`hd-status ${STATUS_CLASS[e.status]}`}>
                                <i /> {e.status}
                              </span>
                            </td>
                            <td>{e.at}</td>
                            <td>
                              <button type="button" className="hd-more" aria-label={`Actions for ${e.id}`}>
                                <EllipsisVertical size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {events.length === 0 && (
                        <tr>
                          <td colSpan={7} className="hd-empty">
                            No events match “{query}”.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
