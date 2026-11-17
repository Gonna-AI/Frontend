import { Bell, ChevronDown, CircleAlert, CircleHelp, LayoutGrid, LayoutPanelLeft, LogOut, Menu, Moon, Search, Settings, Sun } from 'lucide-react-dash';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useBrand } from './branding';
import { useLang, useT } from './i18n';
import { NAV, NAV_GROUPS } from './nav';
import type { HiveApiState } from './hiveApi';
import { useHive, type DetailRef } from './store';

/** Closes a popover on outside click or Escape. */
export function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);
  return ref;
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

export const API_LABEL: Record<HiveApiState, string> = {
  unconfigured: 'Placeholder data',
  checking: 'Placeholder data · checking API',
  online: 'Placeholder data · API online',
  offline: 'Placeholder data · API offline',
};

export function ApiStatus({ state }: { state: HiveApiState }) {
  const t = useT();
  return (
    <span className={`hx-status is-${state}`} role="status">
      <i aria-hidden="true" /> {t(API_LABEL[state])}
    </span>
  );
}

/* ---------- brand ---------- */

export function BrandMark({ go, compact = false }: { go: (s: string) => void; compact?: boolean }) {
  const t = useT();
  const { applied: brand } = useBrand();
  const logo = brand.logoLight ?? brand.logoDark;
  return (
    <a
      className={`hx-brand${compact ? ' is-compact' : ''}`}
      href="/dashboard/hive"
      aria-label={t('Hive home')}
      onClick={(e) => {
        e.preventDefault();
        go('');
      }}
    >
      <span className="hx-brand-mark">
        <img src={logo ?? '/brand-mark-tile.svg'} alt="" width={20} height={20} />
      </span>
      {!compact && <span className="hx-brand-name">{brand.name}</span>}
    </a>
  );
}

/* ---------- sidebar ---------- */

export function Sidebar({
  section,
  go,
  user,
  guest,
  onExit,
  dark,
  setDark,
  collapsed,
  setCollapsed,
}: {
  section: string;
  go: (s: string) => void;
  user: { name: string; email: string; avatarUrl?: string };
  guest: boolean;
  onExit?: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const t = useT();
  const { data } = useHive();
  const counts: Record<string, number> = {
    alarms: data.alarms.filter((a) => a.state === 'Open').length,
    inbox: data.approvals.filter((a) => a.state === 'Pending').length,
  };
  return (
    <aside className={`hx-side${collapsed ? ' is-collapsed' : ''}`} aria-label={t('Hive sections')}>
      <div className="hx-side-top">
        <BrandMark go={go} compact={collapsed} />
        <button type="button" className="hx-side-fold" aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')} aria-pressed={collapsed} onClick={() => setCollapsed(!collapsed)}>
          <Menu size={16} />
        </button>
      </div>

      <nav className="hx-nav">
        {NAV_GROUPS.map((group) => (
          <section key={group.id} className="hx-nav-group" aria-label={t(group.title)}>
            <h2>{t(group.title)}</h2>
            {group.ids.map((id) => {
              const item = NAV[id];
              const Icon = item.icon;
              const on = section === id;
              const n = counts[id] ?? 0;
              return (
                <button key={id || 'home'} type="button" className={`hx-nav-item${on ? ' is-on' : ''}`} aria-current={on ? 'page' : undefined} title={collapsed ? t(item.title) : undefined} onClick={() => go(id)}>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  <span>{t(item.title)}</span>
                  {n > 0 && <b className="hx-count" aria-label={`${n}`}>{n}</b>}
                </button>
              );
            })}
          </section>
        ))}
      </nav>

      <div className="hx-side-foot">
        <div className="hx-theme" role="group" aria-label={t('Theme')}>
          <button type="button" className={!dark ? 'is-on' : ''} aria-pressed={!dark} aria-label={t('Light theme')} onClick={() => setDark(false)}>
            <Sun size={15} />
          </button>
          <button type="button" className={dark ? 'is-on' : ''} aria-pressed={dark} aria-label={t('Dark theme')} onClick={() => setDark(true)}>
            <Moon size={15} />
          </button>
        </div>
        <div className="hx-user">
          <span className="hx-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}</span>
          <span className="hx-user-text">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </span>
          <button type="button" className="hx-user-exit" aria-label={guest ? t('Sign in') : t('Sign out')} title={guest ? t('Sign in') : t('Sign out')} onClick={onExit}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- top tools: search, notifications, language, account ---------- */

export function TopTools({
  go,
  openSearch,
  open,
  user,
  guest,
  onExit,
  withAccount,
}: {
  go: (s: string) => void;
  openSearch: () => void;
  open: (d: DetailRef) => void;
  user: { name: string; email: string; avatarUrl?: string };
  guest: boolean;
  onExit?: () => void;
  withAccount: boolean;
}) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { data, markRead } = useHive();
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const closeBell = useCallback(() => setBellOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const bellRef = useDismiss(bellOpen, closeBell);
  const profileRef = useDismiss(profileOpen, closeProfile);
  const openAlarms = data.alarms.filter((a) => a.state === 'Open');

  return (
    <div className="hx-tools">
      <button type="button" className="hx-searchbtn" onClick={openSearch} aria-label={t('Search (Ctrl K)')}>
        <Search size={16} aria-hidden="true" />
        <span>{t('Search')}</span>
        <kbd aria-hidden="true">⌘K</kbd>
      </button>

      <div className="hx-tool-group">
        <div className="hd-pop-anchor" ref={bellRef}>
          <button type="button" className={`hx-icon${openAlarms.length ? ' has-dot' : ''}`} aria-label={`${t('Notifications')}, ${openAlarms.length}`} aria-expanded={bellOpen} onClick={() => setBellOpen((v) => !v)}>
            <Bell size={17} />
          </button>
          {bellOpen && (
            <div className="hx-pop is-right" role="menu">
              <div className="hx-pop-head">{t('Open alarms')}</div>
              {openAlarms.slice(0, 4).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitem"
                  className="hx-pop-item"
                  onClick={() => {
                    setBellOpen(false);
                    go('alarms');
                    open({ kind: 'alarm', id: a.id });
                  }}
                >
                  <span className={`hd-sev is-${a.severity}`}>{t(a.severity)}</span>
                  <span>
                    {a.title}
                    <small>
                      {a.machine} · {a.raisedAt}
                    </small>
                  </span>
                </button>
              ))}
              {openAlarms.length === 0 && <p className="hx-pop-empty">{t('All clear.')}</p>}
              <div className="hx-pop-head">{t('Notifications')}</div>
              {data.notifications.slice(0, 3).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  role="menuitem"
                  className="hx-pop-item"
                  onClick={() => {
                    markRead(n.id);
                    setBellOpen(false);
                    go(n.to.section);
                  }}
                >
                  <span>
                    {n.text}
                    <small>
                      {n.at}
                      {n.read ? '' : ` · ${t('new')}`}
                    </small>
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="hx-pop-foot"
                onClick={() => {
                  setBellOpen(false);
                  go('alarms');
                }}
              >
                {t('See all alarms')}
              </button>
            </div>
          )}
        </div>
        <button type="button" className="hx-icon hx-lang" aria-label={t('Language')} title={t('Language')} onClick={() => setLang(lang === 'de' ? 'en' : 'de')}>
          {lang === 'de' ? 'DE' : 'EN'}
        </button>
        <a className="hx-icon" href="https://status.clerktree.com" target="_blank" rel="noreferrer" aria-label={t('Platform status')} title={t('Platform status')}>
          <CircleAlert size={17} />
        </a>
        <a className="hx-icon" href="https://clerktree.com/contact" target="_blank" rel="noreferrer" aria-label={t('Help')} title={t('Help')}>
          <CircleHelp size={17} />
        </a>
      </div>

      {withAccount && (
        <div className="hd-pop-anchor" ref={profileRef}>
          <button type="button" className="hx-profile" aria-label={t('Account menu')} aria-expanded={profileOpen} onClick={() => setProfileOpen((v) => !v)}>
            <span className="hx-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initials(user.name)}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </button>
          {profileOpen && (
            <div className="hx-pop is-right" role="menu">
              <div className="hx-pop-who">
                <b>{user.name}</b>
                <small>{user.email}</small>
              </div>
              <button type="button" role="menuitem" className="hx-pop-item is-row" onClick={() => { setProfileOpen(false); go('settings'); }}>
                <Settings size={15} /> <span>{t('Settings')}</span>
              </button>
              <button type="button" role="menuitem" className="hx-pop-item is-row" onClick={() => { setProfileOpen(false); go('activity'); }}>
                <LayoutGrid size={15} /> <span>{t('Activity')}</span>
              </button>
              <a role="menuitem" className="hx-pop-item is-row" href="/dashboard/default">
                <LayoutPanelLeft size={15} /> <span>{t('Workspace dashboards')}</span>
              </a>
              <button type="button" role="menuitem" className="hx-pop-item is-row" onClick={() => { setProfileOpen(false); onExit?.(); }}>
                <LogOut size={15} /> <span>{guest ? t('Sign in') : t('Sign out')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- page header ---------- */

export function PageHeader({ title, about, apiState, spec, lead }: { title: React.ReactNode; about?: string; apiState: HiveApiState; spec?: string; lead?: React.ReactNode }) {
  return (
    <div className="hx-head">
      <div className="hx-head-text">
        {lead}
        <h1>{title}</h1>
        {about && <p>{about}</p>}
      </div>
      <div className="hx-head-side">
        <ApiStatus state={apiState} />
        {spec && <code className="hx-spec" title="Hive API module">{spec}</code>}
      </div>
    </div>
  );
}
