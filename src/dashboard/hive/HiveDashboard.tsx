import {
  Bell,
  Calendar,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  Factory,
  FileText,
  Layers,
  LayoutGrid,
  LayoutPanelLeft,
  LogOut,
  Mail,
  Moon,
  Search,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react-dash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import OverviewView from './OverviewView';
import { HiveStoreProvider, useHive, type DetailRef } from './store';
import {
  ActivityView,
  AlarmsView,
  ApprovalsView,
  AssetsView,
  DetailDrawer,
  DocumentsView,
  GatewaysView,
  ReportsView,
  SettingsView,
  SitesView,
  WorkOrdersView,
} from './views';
import type { HiveApiState } from './hiveApi';
import './hive-dashboard.css';

export interface HiveDashboardUser {
  name: string;
  email: string;
  avatarUrl?: string;
}

interface HiveDashboardProps {
  user: HiveDashboardUser;
  onSignOut?: () => void;
  /** True when nobody is signed in: the exit actions read "Sign in". */
  guest?: boolean;
}

const BASE = '/dashboard/hive';

const SECTIONS: Record<string, { title: string; keywords: string }> = {
  '': { title: 'Overview', keywords: 'home dashboard' },
  activity: { title: 'Activity', keywords: 'feed history timeline' },
  assets: { title: 'Assets', keywords: 'machines equipment graph' },
  alarms: { title: 'Alarms', keywords: 'alerts faults' },
  reports: { title: 'Reports', keywords: 'oee trends export csv' },
  'work-orders': { title: 'Work orders', keywords: 'maintenance cmms erp' },
  approvals: { title: 'Approvals', keywords: 'decisions pending' },
  documents: { title: 'Documents', keywords: 'manuals drawings sop' },
  sites: { title: 'Sites', keywords: 'plants halls' },
  gateways: { title: 'Gateways', keywords: 'edge devices enroll' },
  settings: { title: 'Settings', keywords: 'preferences theme' },
};

const TABS = ['', 'activity', 'assets', 'alarms', 'reports'] as const;

const RAIL: { id: string; icon: LucideIcon }[] = [
  { id: '', icon: LayoutGrid },
  { id: 'work-orders', icon: Calendar },
  { id: 'approvals', icon: Mail },
  { id: 'documents', icon: FileText },
  { id: 'sites', icon: Factory },
  { id: 'gateways', icon: Layers },
  { id: 'settings', icon: Settings },
];

const API_LABEL: Record<HiveApiState, string> = {
  unconfigured: 'Placeholder data',
  checking: 'Placeholder data · checking API',
  online: 'Placeholder data · API online',
  offline: 'Placeholder data · API offline',
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

function readPref(key: string, fallback: boolean): boolean {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? '1' : '0');
  } catch {
    /* storage can be blocked; the preference then lasts for this page only */
  }
}

/** Closes a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

/* ---------- command search ---------- */

interface Hit {
  key: string;
  label: string;
  hint: string;
  run: () => void;
}

function SearchDialog({ onClose, go }: { onClose: () => void; go: (section: string) => void }) {
  const { data, openDetail } = useHive();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const hits = useMemo<Hit[]>(() => {
    const all: Hit[] = [
      ...Object.entries(SECTIONS).map(([id, s]) => ({ key: `s-${id}`, label: s.title, hint: `Go to · ${s.keywords}`, run: () => go(id) })),
      ...data.assets.map((a) => ({ key: a.id, label: a.name, hint: `Asset · ${a.site}`, run: () => { go('assets'); openDetail({ kind: 'asset', id: a.id }); } })),
      ...data.alarms.map((a) => ({ key: a.id, label: a.title, hint: `Alarm · ${a.asset} · ${a.id}`, run: () => { go('alarms'); openDetail({ kind: 'alarm', id: a.id }); } })),
      ...data.workOrders.map((w) => ({ key: w.id, label: w.title, hint: `Work order · ${w.id}`, run: () => { go('work-orders'); openDetail({ kind: 'workOrder', id: w.id }); } })),
      ...data.documents.map((d) => ({ key: d.id, label: d.name, hint: `Document · ${d.asset}`, run: () => { go('documents'); openDetail({ kind: 'document', id: d.id }); } })),
    ];
    const t = q.trim().toLowerCase();
    return (t ? all.filter((h) => `${h.label} ${h.hint}`.toLowerCase().includes(t)) : all.slice(0, 11)).slice(0, 12);
  }, [q, data, go, openDetail]);

  useEffect(() => setIdx(0), [q]);

  const choose = (h?: Hit) => {
    if (!h) return;
    onClose();
    h.run();
  };

  return (
    <div className="hd-drawer-wrap is-center" onClick={onClose}>
      <div className="hd-search-dialog" role="dialog" aria-modal="true" aria-label="Search Hive" onClick={(e) => e.stopPropagation()}>
        <label className="hd-search-input">
          <Search size={16} aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search assets, alarms, work orders, documents…"
            aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, hits.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter') choose(hits[idx]);
            }}
          />
          <kbd>Esc</kbd>
        </label>
        <ul className="hd-hits" role="listbox">
          {hits.map((h, i) => (
            <li key={h.key} role="option" aria-selected={i === idx}>
              <button type="button" className={i === idx ? 'is-on' : ''} onMouseEnter={() => setIdx(i)} onClick={() => choose(h)}>
                <span>{h.label}</span>
                <small>{h.hint}</small>
              </button>
            </li>
          ))}
          {hits.length === 0 && <li className="hd-empty">Nothing found.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */

function Shell({ user, onSignOut, guest = false }: HiveDashboardProps) {
  const exitLabel = guest ? 'Sign in' : 'Sign out';
  const params = useParams();
  const navigate = useNavigate();
  const { data, apiState, openDetail } = useHive();

  const raw = (params['*'] ?? '').replace(/\/+$/, '');
  const section = raw in SECTIONS ? raw : null;

  const [dark, setDarkState] = useState(() => readPref('hive.dash.dark', false));
  const [compact, setCompactState] = useState(() => readPref('hive.dash.compact', false));
  const setDark = (v: boolean) => {
    setDarkState(v);
    writePref('hive.dash.dark', v);
  };
  const setCompact = (v: boolean) => {
    setCompactState(v);
    writePref('hive.dash.compact', v);
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeBell = useCallback(() => setBellOpen(false), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const bellRef = useDismiss(bellOpen, closeBell);
  const menuRef = useDismiss(menuOpen, closeMenu);

  const go = useCallback(
    (target: string) => {
      openDetail(null);
      navigate(target ? `${BASE}/${target}` : BASE);
    },
    [navigate, openDetail],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        openDetail(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openDetail]);

  useEffect(() => {
    document.title = `${SECTIONS[section ?? '']?.title ?? 'Hive'} · Hive`;
  }, [section]);

  const openAlarms = data.alarms.filter((a) => a.state === 'Open');
  const firstName = user.name.split(/\s+/)[0] || user.name;
  const { toast } = useHive();

  const open = (d: DetailRef) => {
    setBellOpen(false);
    openDetail(d);
  };

  let view: React.ReactNode;
  switch (section) {
    case '':
      view = <OverviewView go={go} />;
      break;
    case 'activity':
      view = <ActivityView />;
      break;
    case 'assets':
      view = <AssetsView />;
      break;
    case 'alarms':
      view = <AlarmsView />;
      break;
    case 'reports':
      view = <ReportsView />;
      break;
    case 'work-orders':
      view = <WorkOrdersView />;
      break;
    case 'approvals':
      view = <ApprovalsView />;
      break;
    case 'documents':
      view = <DocumentsView />;
      break;
    case 'sites':
      view = <SitesView go={go} />;
      break;
    case 'gateways':
      view = <GatewaysView />;
      break;
    case 'settings':
      view = <SettingsView dark={dark} setDark={setDark} compact={compact} setCompact={setCompact} />;
      break;
    default:
      view = (
        <section className="hd-card hd-page">
          <h2 className="hd-card-title is-lg">Page not found</h2>
          <p className="hd-muted">There is no Hive page at this address.</p>
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => go('')}>
            Back to overview
          </button>
        </section>
      );
  }

  return (
    <div className={`hd-root${dark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}`} data-theme={dark ? 'dark' : 'light'}>
      <div className="hd-shell">
        <header className="hd-top">
          <a
            className="hd-brand"
            href={BASE}
            aria-label="Hive overview"
            onClick={(e) => {
              e.preventDefault();
              go('');
            }}
          >
            <span className="hd-brand-mark">
              <img src="/brand-mark-tile.svg" alt="" width={18} height={18} />
            </span>
            <span className="hd-brand-name">Hive</span>
          </a>

          <nav className="hd-tabs" aria-label="Hive sections">
            {TABS.map((id) => (
              <button
                key={id || 'overview'}
                type="button"
                className={`hd-tab${section === id ? ' is-active' : ''}`}
                aria-current={section === id ? 'page' : undefined}
                onClick={() => go(id)}
              >
                {SECTIONS[id].title}
              </button>
            ))}
          </nav>

          <div className="hd-tools">
            <div className="hd-tools-pill">
              <button type="button" className="hd-icon-btn" aria-label="Search (Ctrl K)" title="Search (Ctrl K)" onClick={() => setSearchOpen(true)}>
                <Search size={16} />
              </button>
              <div className="hd-pop-anchor" ref={bellRef}>
                <button
                  type="button"
                  className={`hd-icon-btn${openAlarms.length ? ' has-dot' : ''}`}
                  aria-label={`Notifications, ${openAlarms.length} open alarms`}
                  aria-expanded={bellOpen}
                  onClick={() => setBellOpen((v) => !v)}
                >
                  <Bell size={16} />
                </button>
                {bellOpen && (
                  <div className="hd-pop" role="menu">
                    <div className="hd-pop-head">Open alarms</div>
                    {openAlarms.slice(0, 4).map((a) => (
                      <button key={a.id} type="button" role="menuitem" className="hd-pop-item" onClick={() => { setBellOpen(false); go('alarms'); open({ kind: 'alarm', id: a.id }); }}>
                        <span className={`hd-sev is-${a.severity}`}>{a.severity}</span>
                        <span>{a.title}<small>{a.asset} · {a.raisedAt}</small></span>
                      </button>
                    ))}
                    {openAlarms.length === 0 && <p className="hd-pop-empty">All clear.</p>}
                    <button type="button" className="hd-pop-foot" onClick={() => { setBellOpen(false); go('alarms'); }}>
                      See all alarms
                    </button>
                  </div>
                )}
              </div>
              <a className="hd-icon-btn" href="https://status.clerktree.com" target="_blank" rel="noreferrer" aria-label="Platform status" title="Platform status">
                <CircleAlert size={16} />
              </a>
            </div>

            <div className="hd-pop-anchor" ref={menuRef}>
              <button type="button" className="hd-profile" aria-label="Account menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
                <span className="hd-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}</span>
                <span className="hd-profile-text">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="hd-pop is-right" role="menu">
                  <button type="button" role="menuitem" className="hd-pop-item" onClick={() => { setMenuOpen(false); go('settings'); }}>
                    <Settings size={15} /> <span>Settings</span>
                  </button>
                  <a role="menuitem" className="hd-pop-item" href="/dashboard/default">
                    <LayoutPanelLeft size={15} /> <span>Workspace dashboards</span>
                  </a>
                  <button type="button" role="menuitem" className="hd-pop-item" onClick={() => { setMenuOpen(false); onSignOut?.(); }}>
                    <LogOut size={15} /> <span>{exitLabel}</span>
                  </button>
                </div>
              )}
            </div>
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
              {RAIL.map(({ id, icon: Icon }) => (
                <button
                  key={id || 'overview'}
                  type="button"
                  className={section === id ? 'is-on' : ''}
                  aria-label={SECTIONS[id].title}
                  title={SECTIONS[id].title}
                  aria-current={section === id ? 'page' : undefined}
                  onClick={() => go(id)}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <div className="hd-rail-pill hd-foot">
              <a className="hd-rail-link" href="https://clerktree.com/contact" target="_blank" rel="noreferrer" aria-label="Help" title="Help">
                <CircleHelp size={16} />
              </a>
              <button type="button" aria-label={exitLabel} title={exitLabel} onClick={onSignOut}>
                <LogOut size={16} />
              </button>
            </div>
          </aside>

          <main className="hd-main">
            <div className="hd-heading">
              <div>
                <h1>{section === '' || section === null ? `${greeting()}, ${firstName}` : SECTIONS[section].title}</h1>
                <p>
                  {section === '' || section === null
                    ? 'Stay on top of your plant, monitor signals, and track alarms.'
                    : `${data.plant.name} · placeholder data until the Hive API is connected`}
                </p>
              </div>
              <span className={`hd-api is-${apiState}`} role="status">
                <i /> {API_LABEL[apiState]}
              </span>
            </div>

            {view}
          </main>
        </div>
      </div>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} go={go} />}
      <DetailDrawer />
      {toast && (
        <div className="hd-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

export default function HiveDashboard(props: HiveDashboardProps) {
  return (
    <HiveStoreProvider>
      <Shell {...props} />
    </HiveStoreProvider>
  );
}
