import {
  Bell,
  ChartBar,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  ClipboardList,
  Cpu,
  FileText,
  Home,
  Inbox,
  LayoutGrid,
  LayoutPanelLeft,
  Lightbulb,
  LogOut,
  Moon,
  Network,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  type LucideIcon,
} from 'lucide-react-dash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AdminView, SettingsView } from './admin';
import { AssistantView } from './assistant';
import { DocumentsView, FindingsView, PartsView, ReportsView, VendorsView } from './business';
import { PhoneCtx, useMediaQuery } from './common';
import { BrandProvider, brandStyle, useBrand } from './branding';
import EmbedHost from './embed';
import { LangProvider, useLang, useT } from './i18n';
import Kiosk, { BOARDS, type Board } from './kiosk';
import { GraphView } from './graph';
import { MachineDetail, MachinesView } from './machines';
import { BottomNav, MobileHeader, MobileHome, MobileMenu, type NavEntry } from './mobile';
import { ActivityView, AlarmsView, DetailDrawer, InboxView, WorkOrdersView } from './ops';
import OverviewView from './OverviewView';
import { HiveStoreProvider, useHive, type DetailRef } from './store';
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

interface SectionDef {
  title: string;
  keywords: string;
  icon: LucideIcon;
}

const SECTIONS: Record<string, SectionDef> = {
  '': { title: 'Home', keywords: 'overview dashboard attention', icon: Home },
  machines: { title: 'Machines', keywords: 'assets equipment lines state', icon: Cpu },
  alarms: { title: 'Alarms', keywords: 'alerts faults', icon: Bell },
  inbox: { title: 'Inbox', keywords: 'approvals notifications decisions', icon: Inbox },
  assistant: { title: 'Assistant', keywords: 'ai chat questions', icon: Sparkles },
  'work-orders': { title: 'Work orders', keywords: 'maintenance cmms erp', icon: ClipboardList },
  parts: { title: 'Parts', keywords: 'stock spare inventory', icon: Package },
  vendors: { title: 'Vendors and RFQs', keywords: 'procurement requisitions suppliers', icon: Store },
  documents: { title: 'Documents', keywords: 'manuals drawings sop search', icon: FileText },
  findings: { title: 'Findings', keywords: 'predictions models anomalies', icon: Lightbulb },
  reports: { title: 'Reports', keywords: 'oee kpi export csv', icon: ChartBar },
  graph: { title: 'Graph', keywords: 'relationships explorer', icon: Network },
  admin: { title: 'Admin', keywords: 'users roles connections gateways audit api keys', icon: ShieldCheck },
  activity: { title: 'Activity', keywords: 'feed history timeline', icon: LayoutGrid },
  settings: { title: 'Settings', keywords: 'preferences theme diagnostics', icon: Settings },
};

const TABS = ['', 'machines', 'alarms', 'inbox', 'assistant'] as const;
const RAIL = ['', 'work-orders', 'parts', 'vendors', 'documents', 'findings', 'reports', 'graph', 'admin'] as const;

const MENU_GROUPS: { heading: string; ids: string[] }[] = [
  { heading: 'Operate', ids: ['', 'machines', 'alarms', 'inbox', 'assistant'] },
  { heading: 'Work', ids: ['work-orders', 'parts', 'vendors', 'documents', 'findings', 'reports', 'graph'] },
  { heading: 'Manage', ids: ['activity', 'admin', 'settings'] },
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

/** The words people search by, in both languages, so a German search finds an English-named section too. */
const SECTION_TERMS_DE: Record<string, string> = {
  '': 'start übersicht', machines: 'maschinen anlagen', alarms: 'alarme störungen', inbox: 'posteingang genehmigungen', assistant: 'assistent ki',
  'work-orders': 'arbeitsaufträge instandhaltung', parts: 'ersatzteile lager', vendors: 'lieferanten anfragen bestellungen', documents: 'dokumente handbücher',
  findings: 'befunde prognosen', reports: 'berichte kennzahlen', graph: 'graph beziehungen', admin: 'verwaltung benutzer rollen', activity: 'aktivität verlauf', settings: 'einstellungen',
};

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
  extra?: string;
  run: () => void;
}

function SearchDialog({ onClose, go }: { onClose: () => void; go: (section: string) => void }) {
  const t = useT();
  const { data, openDetail } = useHive();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const hits = useMemo<Hit[]>(() => {
    const all: Hit[] = [
      ...Object.entries(SECTIONS).map(([id, s]) => ({ key: `s-${id}`, label: t(s.title), hint: t('Go to'), extra: `${s.title} ${s.keywords} ${SECTION_TERMS_DE[id] ?? ''}`, run: () => go(id) })),
      ...data.machines.map((m) => ({ key: m.id, label: m.key, hint: `${t('Machine')} · ${m.site}`, run: () => go(`machines/${m.id}`) })),
      ...data.alarms.map((a) => ({ key: a.id, label: a.title, hint: `${t('Alarm')} · ${a.machine} · ${a.id}`, run: () => { go('alarms'); openDetail({ kind: 'alarm', id: a.id }); } })),
      ...data.workOrders.map((w) => ({ key: w.id, label: w.title, hint: `${t('Work order')} · ${w.id}`, run: () => { go('work-orders'); openDetail({ kind: 'workOrder', id: w.id }); } })),
      ...data.documents.map((d) => ({ key: d.id, label: d.name, hint: `${t('Document')} · ${d.machine}`, run: () => { go('documents'); openDetail({ kind: 'document', id: d.id }); } })),
      ...data.parts.map((p) => ({ key: p.id, label: `${p.number} · ${p.name}`, hint: `${t('Part')} · ${p.machine}`, run: () => { go('parts'); openDetail({ kind: 'part', id: p.id }); } })),
    ];
    const needle = q.trim().toLowerCase();
    return (needle ? all.filter((h) => `${h.label} ${h.hint} ${h.extra ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())) : all.slice(0, 11)).slice(0, 12);
  }, [q, data, go, openDetail, t]);

  useEffect(() => setIdx(0), [q]);

  const choose = (h?: Hit) => {
    if (!h) return;
    onClose();
    h.run();
  };

  return (
    <div className="hd-drawer-wrap is-center" onClick={onClose}>
      <div className="hd-search-dialog" role="dialog" aria-modal="true" aria-label={t('Search Hive')} onClick={(e) => e.stopPropagation()}>
        <label className="hd-search-input">
          <Search size={16} aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('Search machines, alarms, work orders, documents, parts…')}
            aria-label={t('Search')}
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
          <kbd>{t('Esc')}</kbd>
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
          {hits.length === 0 && <li className="hd-empty">{t('Nothing found.')}</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- shell ---------- */

function Shell({ user, onSignOut, guest = false }: HiveDashboardProps) {
  const t = useT();
  const params = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { data, apiState, openDetail, toast, markRead } = useHive();
  const phone = useMediaQuery('(max-width: 760px)');
  const exitLabel = guest ? t('Sign in') : t('Sign out');
  const { lang, setLang } = useLang();
  const { applied: brand } = useBrand();

  const shownUser = guest ? { ...user, name: t('Guest'), email: t('Demo preview') } : user;

  const raw = (params['*'] ?? '').replace(/^\/+|\/+$/g, '');
  const [first, second] = raw.split('/');
  const section = first in SECTIONS ? first : null;

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
  const [profileOpen, setProfileOpen] = useState(false);
  const closeBell = useCallback(() => setBellOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const bellRef = useDismiss(bellOpen, closeBell);
  const profileRef = useDismiss(profileOpen, closeProfile);

  const go = useCallback(
    (target: string) => {
      openDetail(null);
      navigate(target ? `${BASE}/${target}` : BASE);
    },
    [navigate, openDetail],
  );

  // Old addresses keep working.
  useEffect(() => {
    const legacy: Record<string, string> = { assets: 'machines', approvals: 'inbox', gateways: 'admin/gateways', sites: '' };
    if (first in legacy) navigate(legacy[first] ? `${BASE}/${legacy[first]}` : BASE, { replace: true });
  }, [first, navigate]);

  // The page itself never scrolls: only the content area does.
  useEffect(() => {
    document.documentElement.classList.add('hd-lock');
    return () => document.documentElement.classList.remove('hd-lock');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        openDetail(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openDetail]);

  const def = section !== null ? SECTIONS[section] : undefined;
  useEffect(() => {
    document.title = `${def ? t(def.title) : brand.name} · ${brand.name}`;
  }, [def, t, lang, brand.name]);

  const openAlarms = data.alarms.filter((a) => a.state === 'Open');
  const unread = data.notifications.filter((n) => !n.read);
  const firstName = shownUser.name.split(/\s+/)[0] || shownUser.name;
  const open = (d: DetailRef) => {
    setBellOpen(false);
    openDetail(d);
  };

  let view: React.ReactNode;
  switch (section) {
    case '':
      view = phone ? <MobileHome go={go} /> : <OverviewView go={go} />;
      break;
    case 'machines':
      view = second ? <MachineDetail id={second} go={go} /> : <MachinesView go={go} site={search.get('site')} />;
      break;
    case 'alarms':
      view = <AlarmsView go={go} />;
      break;
    case 'inbox':
      view = <InboxView go={go} />;
      break;
    case 'assistant':
      view = <AssistantView />;
      break;
    case 'work-orders':
      view = <WorkOrdersView />;
      break;
    case 'parts':
      view = <PartsView />;
      break;
    case 'vendors':
      view = <VendorsView />;
      break;
    case 'documents':
      view = <DocumentsView />;
      break;
    case 'findings':
      view = <FindingsView />;
      break;
    case 'reports':
      view = <ReportsView />;
      break;
    case 'graph':
      view = <GraphView />;
      break;
    case 'admin':
      view = <AdminView area={second ?? 'tenant'} go={go} />;
      break;
    case 'activity':
      view = <ActivityView />;
      break;
    case 'settings':
      view = <SettingsView dark={dark} setDark={setDark} compact={compact} setCompact={setCompact} />;
      break;
    default:
      view = (
        <section className="hd-card hd-page">
          <h2 className="hd-card-title is-lg">{t('Page not found')}</h2>
          <p className="hd-muted">{t('There is no Hive page at this address.')}</p>
          <button type="button" className="hd-btn is-dark hd-btn-sm" onClick={() => go('')}>
            {t('Back to home')}
          </button>
        </section>
      );
  }

  const heading: React.ReactNode = section === '' || section === null ? (
    <>
      {t(greeting())}, <span className="hd-accent">{firstName}</span>
    </>
  ) : first === 'machines' && second ? (data.machines.find((m) => m.id === second)?.key ?? t('Machine')) : t(SECTIONS[section].title);
  const subtitle = section === '' || section === null ? t('Stay on top of your plant, monitor signals, and track alarms.') : `${data.plant.name} · ${t('placeholder data until the Hive API is connected')}`;

  const menuEntries = MENU_GROUPS.map((g) => ({ heading: t(g.heading), items: g.ids.map((id): NavEntry => ({ id, title: t(SECTIONS[id].title), icon: SECTIONS[id].icon })) }));
  const rootClass = `hd-root${dark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}${phone ? ' is-phone' : ''}`;

  const overlays = (
    <>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} go={go} />}
      <DetailDrawer go={go} />
      {toast && (
        <div className="hd-toast" role="status">
          {toast}
        </div>
      )}
    </>
  );

  /* ----- phone ----- */
  if (phone) {
    return (
      <PhoneCtx.Provider value={true}>
        <div className={rootClass} data-theme={dark ? 'dark' : 'light'} style={brandStyle(brand)}>
          <div className="hd-mshell">
            <MobileHeader title={section === '' ? t('Home') : heading} site="Musterwerk" onSearch={() => setSearchOpen(true)} />
            <div className="hd-mscroll">
              {section !== '' && (
                <span className={`hd-api is-${apiState}`} role="status">
                  <i /> {t(API_LABEL[apiState])}
                </span>
              )}
              {view}
            </div>
            <BottomNav section={first && first in SECTIONS ? first : ''} go={go} onMenu={() => setMenuOpen(true)} unread={unread.length > 0} />
          </div>
          {menuOpen && (
            <MobileMenu
              entries={menuEntries}
              section={section ?? ''}
              go={go}
              onClose={() => setMenuOpen(false)}
              dark={dark}
              setDark={setDark}
              user={shownUser}
              guest={guest}
              onExit={() => {
                setMenuOpen(false);
                onSignOut?.();
              }}
            />
          )}
          {overlays}
        </div>
      </PhoneCtx.Provider>
    );
  }

  /* ----- desktop ----- */
  return (
    <PhoneCtx.Provider value={false}>
      <div className={rootClass} data-theme={dark ? 'dark' : 'light'} style={brandStyle(brand)}>
        <div className="hd-shell">
          <header className="hd-top">
            <a
              className="hd-brand"
              href={BASE}
              aria-label={t('Hive home')}
              onClick={(e) => {
                e.preventDefault();
                go('');
              }}
            >
              <span className="hd-brand-mark">
                {brand.logoLight || brand.logoDark ? <img src={(dark ? brand.logoDark : brand.logoLight) ?? brand.logoLight ?? brand.logoDark} alt="" width={18} height={18} /> : <img src="/brand-mark-tile.svg" alt="" width={18} height={18} />}
              </span>
              <span className="hd-brand-name">{brand.name}</span>
            </a>

            <nav className="hd-tabs" aria-label={t('Hive sections')}>
              {TABS.map((id) => (
                <button key={id || 'home'} type="button" className={`hd-tab${section === id ? ' is-active' : ''}`} aria-current={section === id ? 'page' : undefined} onClick={() => go(id)}>
                  {t(SECTIONS[id].title)}
                  {id === 'inbox' && unread.length > 0 && <i className="hd-tab-dot" />}
                </button>
              ))}
            </nav>

            <div className="hd-tools">
              <div className="hd-tools-pill">
                <button type="button" className="hd-icon-btn" aria-label={t('Search (Ctrl K)')} title={t('Search (Ctrl K)')} onClick={() => setSearchOpen(true)}>
                  <Search size={16} />
                </button>
                <div className="hd-pop-anchor" ref={bellRef}>
                  <button type="button" className={`hd-icon-btn${openAlarms.length ? ' has-dot' : ''}`} aria-label={`Notifications, ${openAlarms.length} open alarms`} aria-expanded={bellOpen} onClick={() => setBellOpen((v) => !v)}>
                    <Bell size={16} />
                  </button>
                  {bellOpen && (
                    <div className="hd-pop" role="menu">
                      <div className="hd-pop-head">{t('Open alarms')}</div>
                      {openAlarms.slice(0, 4).map((a) => (
                        <button key={a.id} type="button" role="menuitem" className="hd-pop-item" onClick={() => { setBellOpen(false); go('alarms'); open({ kind: 'alarm', id: a.id }); }}>
                          <span className={`hd-sev is-${a.severity}`}>{t(a.severity)}</span>
                          <span>
                            {a.title}
                            <small>{a.machine} · {a.raisedAt}</small>
                          </span>
                        </button>
                      ))}
                      {openAlarms.length === 0 && <p className="hd-pop-empty">{t('All clear.')}</p>}
                      <div className="hd-pop-head">{t('Notifications')}</div>
                      {data.notifications.slice(0, 3).map((n) => (
                        <button key={n.id} type="button" role="menuitem" className="hd-pop-item" onClick={() => { markRead(n.id); setBellOpen(false); go(n.to.section); }}>
                          <span>
                            {n.text}
                            <small>{n.at}{n.read ? '' : ' · new'}</small>
                          </span>
                        </button>
                      ))}
                      <button type="button" className="hd-pop-foot" onClick={() => { setBellOpen(false); go('alarms'); }}>
                        {t('See all alarms')}
                      </button>
                    </div>
                  )}
                </div>
                <button type="button" className="hd-lang-btn" aria-label={t('Language')} title={t('Language')} onClick={() => setLang(lang === 'de' ? 'en' : 'de')}>
                  {lang === 'de' ? 'DE' : 'EN'}
                </button>
                <a className="hd-icon-btn" href="https://status.clerktree.com" target="_blank" rel="noreferrer" aria-label={t('Platform status')} title={t('Platform status')}>
                  <CircleAlert size={16} />
                </a>
              </div>

              <div className="hd-pop-anchor" ref={profileRef}>
                <button type="button" className="hd-profile" aria-label={t('Account menu')} aria-expanded={profileOpen} onClick={() => setProfileOpen((v) => !v)}>
                  <span className="hd-avatar">{shownUser.avatarUrl ? <img src={shownUser.avatarUrl} alt="" /> : initials(shownUser.name)}</span>
                  <span className="hd-profile-text">
                    <strong>{shownUser.name}</strong>
                    <small>{shownUser.email}</small>
                  </span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div className="hd-pop is-right" role="menu">
                    <button type="button" role="menuitem" className="hd-pop-item" onClick={() => { setProfileOpen(false); go('settings'); }}>
                      <Settings size={15} /> <span>{t('Settings')}</span>
                    </button>
                    <button type="button" role="menuitem" className="hd-pop-item" onClick={() => { setProfileOpen(false); go('activity'); }}>
                      <LayoutGrid size={15} /> <span>{t('Activity')}</span>
                    </button>
                    <a role="menuitem" className="hd-pop-item" href="/dashboard/default">
                      <LayoutPanelLeft size={15} /> <span>{t('Workspace dashboards')}</span>
                    </a>
                    <button type="button" role="menuitem" className="hd-pop-item" onClick={() => { setProfileOpen(false); onSignOut?.(); }}>
                      <LogOut size={15} /> <span>{exitLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="hd-body">
            <aside className="hd-rail" aria-label={t('Workspace')}>
              <div className="hd-rail-pill hd-theme" role="group" aria-label={t('Theme')}>
                <button type="button" className={!dark ? 'is-on' : ''} onClick={() => setDark(false)} aria-label={t('Light theme')} aria-pressed={!dark}>
                  <Sun size={15} />
                </button>
                <button type="button" className={dark ? 'is-on' : ''} onClick={() => setDark(true)} aria-label={t('Dark theme')} aria-pressed={dark}>
                  <Moon size={15} />
                </button>
              </div>

              <div className="hd-rail-pill hd-nav">
                {RAIL.map((id) => {
                  const Icon = SECTIONS[id].icon;
                  return (
                    <button key={id || 'home'} type="button" className={section === id ? 'is-on' : ''} aria-label={t(SECTIONS[id].title)} title={t(SECTIONS[id].title)} aria-current={section === id ? 'page' : undefined} onClick={() => go(id)}>
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>

              <div className="hd-rail-pill hd-foot">
                <a className="hd-rail-link" href="https://clerktree.com/contact" target="_blank" rel="noreferrer" aria-label={t('Help')} title={t('Help')}>
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
                  <h1>{heading}</h1>
                  <p>{subtitle}</p>
                </div>
                <span className={`hd-api is-${apiState}`} role="status">
                  <i /> {t(API_LABEL[apiState])}
                </span>
              </div>
              <div className="hd-scroll">{view}</div>
            </main>
          </div>
        </div>
        {overlays}
      </div>
    </PhoneCtx.Provider>
  );
}

/** Picks the screen: a shop-floor display, an embeddable component, or the console. */
function Root(props: HiveDashboardProps) {
  const params = useParams();
  const [kind, a, b] = (params['*'] ?? '').replace(/^\/+|\/+$/g, '').split('/');
  useEffect(() => {
    if (kind === 'kiosk' || kind === 'embed') document.documentElement.classList.add('hd-lock');
  }, [kind]);
  if (kind === 'kiosk') return BOARDS.includes(a as Board) ? <Kiosk board={a as Board} id={b ?? ''} /> : <KioskUnknown />;
  if (kind === 'embed') return <EmbedHost component={a ?? ''} />;
  return <Shell {...props} />;
}

function KioskUnknown() {
  const t = useT();
  return (
    <div className="kb-root is-hc is-far">
      <main className="kb-body">
        <div className="kb-center" role="status">
          <h2>{t('Not available')}</h2>
        </div>
      </main>
    </div>
  );
}

export default function HiveDashboard(props: HiveDashboardProps) {
  return (
    <LangProvider>
      <BrandProvider>
        <HiveStoreProvider>
          <Root {...props} />
        </HiveStoreProvider>
      </BrandProvider>
    </LangProvider>
  );
}
