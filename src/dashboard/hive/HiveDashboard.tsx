import { Menu, Search } from 'lucide-react-dash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AdminView, SettingsView } from './admin';
import { AssistantView } from './assistant';
import { DocumentsView, FindingsView, PartsView, ReportsView, VendorsView } from './business';
import { PhoneCtx } from './common';
import { BrandProvider, brandStyle, useBrand } from './branding';
import EmbedHost from './embed';
import { LangProvider, useT } from './i18n';
import Kiosk, { BOARDS, type Board } from './kiosk';
import { GraphView } from './graph';
import { useLayout } from './layout';
import { MachineDetail, MachinesView } from './machines';
import { BottomNav, MobileHome, MobileMenu, type NavEntry } from './mobile';
import ModuleView from './modules';
import { NAV, NAV_GROUPS, MODULE_SECTIONS } from './nav';
import { ActivityView, AlarmsView, DetailDrawer, InboxView, WorkOrdersView } from './ops';
import OverviewView from './OverviewView';
import { API_LABEL, BrandMark, PageHeader, Sidebar, TopTools } from './shell';
import { HiveStoreProvider, useHive, type DetailRef } from './store';
import './hive-dashboard.css';
import './hive-shell.css';

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

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
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
      ...Object.entries(NAV).map(([id, s]) => ({ key: `s-${id}`, label: t(s.title), hint: t('Go to'), extra: `${s.title} ${s.keywords} ${s.terms}`, run: () => go(id) })),
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
  const { data, apiState, openDetail, toast } = useHive();
  const layout = useLayout();
  const phone = layout === 'phone';
  const desktop = layout === 'desktop';
  const { applied: brand } = useBrand();

  const shownUser = guest ? { ...user, name: t('Guest'), email: t('Demo preview') } : user;

  const raw = (params['*'] ?? '').replace(/^\/+|\/+$/g, '');
  const [first, second] = raw.split('/');
  const section = first in NAV ? first : null;

  const [dark, setDarkState] = useState(() => readPref('hive.dash.dark', false));
  const [compact, setCompactState] = useState(() => readPref('hive.dash.compact', false));
  const [collapsed, setCollapsedState] = useState(() => readPref('hive.dash.side', false));
  const setDark = (v: boolean) => {
    setDarkState(v);
    writePref('hive.dash.dark', v);
  };
  const setCompact = (v: boolean) => {
    setCompactState(v);
    writePref('hive.dash.compact', v);
  };
  const setCollapsed = (v: boolean) => {
    setCollapsedState(v);
    writePref('hive.dash.side', v);
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const go = useCallback(
    (target: string) => {
      openDetail(null);
      setMenuOpen(false);
      navigate(target ? `${BASE}/${target}` : BASE);
      // A new screen starts at its top, in the window on phones and tablets and in the content frame on desktop.
      window.scrollTo(0, 0);
      document.querySelector('.hx-scroll')?.scrollTo(0, 0);
    },
    [navigate, openDetail],
  );

  // Old addresses keep working.
  useEffect(() => {
    const legacy: Record<string, string> = { assets: 'machines', approvals: 'inbox', gateways: 'admin/gateways', sites: '' };
    if (first in legacy) navigate(legacy[first] ? `${BASE}/${legacy[first]}` : BASE, { replace: true });
  }, [first, navigate]);

  // Only the desktop layout scrolls inside a frame. Phones and tablets scroll the page itself, so the
  // browser's own bars (iOS Safari's collapsing toolbars, Chrome's address bar) can tuck away as usual.
  useEffect(() => {
    if (!desktop) return undefined;
    document.documentElement.classList.add('hd-lock');
    return () => document.documentElement.classList.remove('hd-lock');
  }, [desktop]);

  // The browser draws the status bar from the page: keep it matching the surface under it.
  useEffect(() => {
    const tag = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!tag) return undefined;
    const before = tag.content;
    tag.content = dark ? '#0c0c0c' : '#f4f4f4';
    return () => {
      tag.content = before;
    };
  }, [dark]);

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

  // Leaving the tablet or phone layout closes the drawer.
  useEffect(() => {
    if (desktop) setMenuOpen(false);
  }, [desktop]);

  const def = section !== null ? NAV[section] : undefined;
  useEffect(() => {
    document.title = `${def ? t(def.title) : brand.name} · ${brand.name}`;
  }, [def, t, brand.name]);

  const unread = data.notifications.filter((n) => !n.read);
  const firstName = shownUser.name.split(/\s+/)[0] || shownUser.name;
  const open = (d: DetailRef) => openDetail(d);

  let view: React.ReactNode;
  if (section === '') view = phone ? <MobileHome go={go} /> : <OverviewView go={go} />;
  else if (section === 'machines') view = second ? <MachineDetail id={second} go={go} /> : <MachinesView go={go} site={search.get('site')} />;
  else if (section === 'alarms') view = <AlarmsView go={go} />;
  else if (section === 'inbox') view = <InboxView go={go} />;
  else if (section === 'assistant') view = <AssistantView />;
  else if (section === 'work-orders') view = <WorkOrdersView />;
  else if (section === 'parts') view = <PartsView />;
  else if (section === 'vendors') view = <VendorsView />;
  else if (section === 'documents') view = <DocumentsView />;
  else if (section === 'findings') view = <FindingsView />;
  else if (section === 'reports') view = <ReportsView />;
  else if (section === 'graph') view = <GraphView />;
  else if (section === 'admin') view = <AdminView area={second ?? 'tenant'} go={go} />;
  else if (section === 'activity') view = <ActivityView />;
  else if (section === 'settings') view = <SettingsView dark={dark} setDark={setDark} compact={compact} setCompact={setCompact} />;
  else if (section && (MODULE_SECTIONS as readonly string[]).includes(section)) view = <ModuleView id={section} area={second} go={go} />;
  else {
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

  const onHome = section === '' || section === null;
  const title: React.ReactNode = onHome ? (
    <>
      {t(greeting())}, <span className="hd-accent">{firstName}</span>
    </>
  ) : first === 'machines' && second ? (
    (data.machines.find((m) => m.id === second)?.key ?? t('Machine'))
  ) : (
    t(NAV[section].title)
  );
  const about = onHome
    ? t('Stay on top of your plant, monitor signals, and track alarms.')
    : first === 'machines' && second
      ? (data.machines.find((m) => m.id === second)?.name ?? '')
      : t(NAV[section].about);
  const spec = section !== null ? NAV[section].spec : undefined;

  const menuEntries = NAV_GROUPS.map((g) => ({ heading: t(g.title), items: g.ids.map((id): NavEntry => ({ id, title: t(NAV[id].title), icon: NAV[id].icon })) }));
  const rootClass = `hd-root hx-app is-${layout}${dark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}${phone ? ' is-phone' : ''}${desktop && collapsed ? ' is-folded' : ''}`;
  const exit = () => {
    setMenuOpen(false);
    onSignOut?.();
  };

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

  const menu = menuOpen && (
    <MobileMenu entries={menuEntries} section={section ?? ''} go={go} onClose={() => setMenuOpen(false)} dark={dark} setDark={setDark} user={shownUser} guest={guest} onExit={exit} />
  );

  /* ----- phone ----- */
  if (phone) {
    return (
      <PhoneCtx.Provider value={true}>
        <div className={rootClass} data-theme={dark ? 'dark' : 'light'} style={brandStyle(brand)}>
          <a className="hx-skip" href="#hx-main">
            {t('Skip to content')}
          </a>
          <header className="hx-mbar">
            <div className="hx-mbar-text">
              <small>{data.plant.name} · {t(API_LABEL[apiState])}</small>
              <h1>{onHome ? t('Home') : title}</h1>
            </div>
            <button type="button" className="hx-round" aria-label={t('Search')} onClick={() => setSearchOpen(true)}>
              <Search size={20} />
            </button>
          </header>
          <main className="hx-content" id="hx-main" tabIndex={-1}>
            {view}
          </main>
          <BottomNav section={section ?? ''} go={go} onMenu={() => setMenuOpen(true)} unread={unread.length > 0} />
          {menu}
          {overlays}
        </div>
      </PhoneCtx.Provider>
    );
  }

  /* ----- tablet: top bar and a drawer ----- */
  if (!desktop) {
    return (
      <PhoneCtx.Provider value={false}>
        <div className={rootClass} data-theme={dark ? 'dark' : 'light'} style={brandStyle(brand)}>
          <a className="hx-skip" href="#hx-main">
            {t('Skip to content')}
          </a>
          <header className="hx-bar">
            <button type="button" className="hx-icon is-lg" aria-label={t('Menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <BrandMark go={go} />
            <TopTools go={go} openSearch={() => setSearchOpen(true)} open={open} user={shownUser} guest={guest} onExit={onSignOut} withAccount />
          </header>
          <main className="hx-content" id="hx-main" tabIndex={-1}>
            <PageHeader title={title} about={about} apiState={apiState} spec={spec} />
            {view}
          </main>
          {menu}
          {overlays}
        </div>
      </PhoneCtx.Provider>
    );
  }

  /* ----- desktop: sidebar and a framed content area ----- */
  return (
    <PhoneCtx.Provider value={false}>
      <div className={rootClass} data-theme={dark ? 'dark' : 'light'} style={brandStyle(brand)}>
        <a className="hx-skip" href="#hx-main">
          {t('Skip to content')}
        </a>
        <Sidebar section={section ?? ''} go={go} user={shownUser} guest={guest} onExit={onSignOut} dark={dark} setDark={setDark} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="hx-main">
          <header className="hx-bar">
            <span className="hx-site">
              <i aria-hidden="true" /> {data.plant.name}
            </span>
            <TopTools go={go} openSearch={() => setSearchOpen(true)} open={open} user={shownUser} guest={guest} onExit={onSignOut} withAccount={false} />
          </header>
          <main className="hx-scroll" id="hx-main" tabIndex={-1}>
            <div className="hx-content">
              <PageHeader title={title} about={about} apiState={apiState} spec={spec} />
              {view}
            </div>
          </main>
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
