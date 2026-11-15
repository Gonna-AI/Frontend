import { Bell, Cpu, Home, Inbox, LayoutPanelLeft, LogOut, Menu, Moon, Search, Sparkles, Sun, X, Factory, type LucideIcon } from 'lucide-react-dash';
import { useMemo } from 'react';

import { MobileCard, StateBadge } from './common';
import { useAttention } from './OverviewView';
import { MACHINE_STATES, STATE_LABEL } from './placeholder';
import { useHive } from './store';

export interface NavEntry {
  id: string;
  title: string;
  icon: LucideIcon;
}

/* ---------- home on a phone ---------- */

export function MobileHome({ go }: { go: (section: string) => void }) {
  const { data } = useHive();
  const { attention, waiting } = useAttention(go);
  const critical = attention.filter((a) => a.tone === 'red').length;
  const open = data.alarms.filter((a) => a.state === 'Open').length;
  const faults = data.machines.filter((m) => m.state === 'fault' || m.state === 'unplanned_stop').length;

  const tiles: { label: string; value: number; sub: string; to: string; hot?: boolean }[] = [
    { label: 'Critical', value: critical, sub: critical === 1 ? 'alarm' : 'alarms', to: 'alarms', hot: critical > 0 },
    { label: 'Alarms', value: open, sub: 'open', to: 'alarms' },
    { label: 'Inbox', value: waiting, sub: 'waiting', to: 'inbox' },
    { label: 'Faults', value: faults, sub: 'machines', to: 'machines' },
    { label: 'Online', value: data.machines.filter((m) => m.state !== 'unknown' && m.state !== 'off').length, sub: `of ${data.machines.length}`, to: 'machines' },
  ];

  const lines = useMemo(() => {
    const map = new Map<string, typeof data.machines>();
    for (const m of data.machines) map.set(m.line, [...(map.get(m.line) ?? []), m]);
    return [...map.entries()];
  }, [data]);

  return (
    <>
      <div className="hd-daystrip">
        {tiles.map((t) => (
          <button key={t.label} type="button" className={`hd-daytile${t.hot ? ' is-hot' : ''}`} onClick={() => go(t.to)}>
            <small>{t.label}</small>
            <b>{t.value}</b>
            <em>{t.sub}</em>
          </button>
        ))}
      </div>

      <h3 className="hd-msection">Needs attention</h3>
      <div className="hd-mlist">
        {attention.slice(0, 6).map((a) => (
          <MobileCard
            key={a.key}
            onClick={a.open}
            spec={{
              icon: a.label === 'connection' ? Factory : Bell,
              title: a.title,
              sub: a.where,
              time: a.time,
              pill: <span className={`hd-pillx is-${a.tone === 'red' ? 'red' : a.tone === 'orange' ? 'orange' : 'gray'}`}>{a.label}</span>,
            }}
          />
        ))}
        {attention.length === 0 && <p className="hd-empty">Nothing needs attention. Last checked just now.</p>}
        <button type="button" className="hd-dashed" onClick={() => go('alarms')}>
          <span>＋</span> See all alarms{attention.length > 6 ? ` · ${attention.length - 6} more` : ''}
        </button>
      </div>

      <h3 className="hd-msection">Plant overview</h3>
      <div className="hd-state-row">
        {MACHINE_STATES.filter((st) => data.machines.some((m) => m.state === st)).map((st) => (
          <span className="hd-state-count" key={st}>
            <i className={`hd-sdot is-${st}`} /> {STATE_LABEL[st]} <b>{data.machines.filter((m) => m.state === st).length}</b>
          </span>
        ))}
      </div>
      {lines.map(([line, ms]) => (
        <div key={line} className="hd-group">
          <h3>{line}</h3>
          <div className="hd-mlist">
            {ms.map((m) => (
              <MobileCard key={m.id} onClick={() => go(`machines/${m.id}`)} spec={{ icon: Cpu, title: m.key, sub: m.type, pill: <StateBadge state={m.state} ageS={m.stateAgeS} />, meta: m.openAlarms ? `${m.openAlarms} open` : '' }} />
            ))}
          </div>
        </div>
      ))}
      <p className="hd-muted hd-fine">Alarms shown here are not a replacement for the plant’s safety systems.</p>
    </>
  );
}

/* ---------- bottom navigation and menu ---------- */

export function BottomNav({ section, go, onMenu, unread }: { section: string; go: (s: string) => void; onMenu: () => void; unread: boolean }) {
  const items: { id: string; label: string; icon: LucideIcon; dot?: boolean }[] = [
    { id: '', label: 'Home', icon: Home },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'inbox', label: 'Inbox', icon: Inbox, dot: unread },
    { id: 'assistant', label: 'Assistant', icon: Sparkles },
  ];
  return (
    <nav className="hd-bottomnav" aria-label="Main">
      {items.map(({ id, label, icon: Icon, dot }) => {
        const on = section === id;
        return (
          <button key={id || 'home'} type="button" className={`hd-bn${on ? ' is-on' : ''}`} aria-label={label} aria-current={on ? 'page' : undefined} onClick={() => go(id)}>
            <Icon size={20} />
            {on && <span>{label}</span>}
            {dot && !on && <i className="hd-bn-dot" />}
          </button>
        );
      })}
      <button type="button" className="hd-bn" aria-label="Menu" onClick={onMenu}>
        <Menu size={20} />
      </button>
    </nav>
  );
}

export function MobileMenu({
  entries,
  section,
  go,
  onClose,
  dark,
  setDark,
  user,
  guest,
  onExit,
}: {
  entries: { heading: string; items: NavEntry[] }[];
  section: string;
  go: (s: string) => void;
  onClose: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  user: { name: string; email: string };
  guest: boolean;
  onExit: () => void;
}) {
  return (
    <div className="hd-menu-wrap" onClick={onClose}>
      <aside className="hd-menu" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
        <header className="hd-menu-head">
          <div className="hd-menu-user">
            <span className="hd-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </span>
          </div>
          <button type="button" className="hd-icon-btn" aria-label="Close menu" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="hd-menu-body">
          {entries.map((g) => (
            <section key={g.heading}>
              <h4>{g.heading}</h4>
              {g.items.map(({ id, title, icon: Icon }) => (
                <button key={id || 'home'} type="button" className={`hd-menu-item${section === id ? ' is-on' : ''}`} onClick={() => { go(id); onClose(); }}>
                  <Icon size={18} /> <span>{title}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
        <footer className="hd-menu-foot">
          <div className="hd-theme-row" role="group" aria-label="Theme">
            <button type="button" className={!dark ? 'is-on' : ''} aria-pressed={!dark} onClick={() => setDark(false)}><Sun size={15} /> Light</button>
            <button type="button" className={dark ? 'is-on' : ''} aria-pressed={dark} onClick={() => setDark(true)}><Moon size={15} /> Dark</button>
          </div>
          <a className="hd-menu-item" href="/dashboard/default"><LayoutPanelLeft size={18} /> <span>Workspace dashboards</span></a>
          <button type="button" className="hd-menu-item" onClick={onExit}><LogOut size={18} /> <span>{guest ? 'Sign in' : 'Sign out'}</span></button>
        </footer>
      </aside>
    </div>
  );
}

export function MobileHeader({ title, site, onSearch }: { title: string; site: string; onSearch: () => void }) {
  return (
    <header className="hd-mhd">
      <h1>{title}</h1>
      <div className="hd-mhd-tools">
        <span className="hd-sitepill">
          <Factory size={15} /> {site}
        </span>
        <button type="button" className="hd-roundbtn" aria-label="Search" onClick={onSearch}>
          <Search size={20} />
        </button>
      </div>
    </header>
  );
}
