/**
 * The Hive dashboard frame: the shadcn dashboard-01 structure (inset sidebar, header, one scrolling page),
 * dressed for people who work in it all day. Everything is labelled in words, targets are large, the text
 * size is the user's to change, and the brand colours carry the structure: an ink header with an orange
 * edge, an ink banner on every page, orange where something needs a person.
 */
import { Bell, ChevronRight, ChevronsUpDown, CircleHelp, LayoutPanelLeft, LogOut, Menu, Moon, Search, Settings, Sun, Type, type LucideIcon } from 'lucide-react-dash';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard-ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/dashboard-ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/dashboard-ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/dashboard-ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/dashboard-ui/sidebar';

import { useBrand } from './branding';
import { useLang, useT } from './i18n';
import { NAV, NAV_PRIMARY, NAV_SECTIONS, sectionOf } from './nav';
import type { HiveApiState } from './hiveApi';
import { useHive, type DetailRef } from './store';
import { GhostOnInk } from './ui';

const BASE = '/dashboard/hive';

export const API_LABEL: Record<HiveApiState, string> = {
  unconfigured: 'Placeholder data',
  checking: 'Placeholder data · checking API',
  online: 'Placeholder data · API online',
  offline: 'Placeholder data · API offline',
};

export type TextSize = 'standard' | 'comfortable' | 'large';
export const TEXT_SIZES: TextSize[] = ['standard', 'comfortable', 'large'];
export const TEXT_LABEL: Record<TextSize, string> = { standard: 'Standard', comfortable: 'Comfortable', large: 'Large' };
/** The page's root font size, so everything built in rem (the whole frame) grows together. */
export const TEXT_PERCENT: Record<TextSize, number> = { standard: 100, comfortable: 112.5, large: 125 };

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

/** A link that routes inside the app but still opens in a new tab when asked to. */
function linkProps(id: string, go: (s: string) => void, after?: () => void) {
  return {
    href: id ? `${BASE}/${id}` : BASE,
    onClick: (e: React.MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      go(id);
      after?.();
    },
  };
}

/** The section's icon on a soft orange tile; on the current page the tile is solid. */
function NavIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="hx-navicon grid size-8 shrink-0 place-items-center rounded-lg">
      <Icon className="size-[1.1rem]" strokeWidth={1.9} />
    </span>
  );
}

/* ---------- sidebar ---------- */

export function HiveSidebar({
  section,
  go,
  user,
  guest,
  onExit,
}: {
  section: string;
  go: (s: string) => void;
  user: { name: string; email: string; avatarUrl?: string };
  guest: boolean;
  onExit?: () => void;
}) {
  const t = useT();
  const { data } = useHive();
  const { applied: brand } = useBrand();
  const { isMobile, setOpenMobile, setOpen: setSidebarOpen } = useSidebar();
  // Choosing a place closes the sidebar wherever it covers or squeezes the page.
  const closeOnPhone = () => {
    if (isMobile) setOpenMobile(false);
    else if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const counts: Record<string, number> = {
    alarms: data.alarms.filter((a) => a.state === 'Open').length,
    inbox: data.approvals.filter((a) => a.state === 'Pending').length,
  };

  // The group that holds the current screen is open; the others stay closed until asked.
  const current = sectionOf(section)?.id;
  const [open, setOpen] = useState<Record<string, boolean>>(() => (current ? { [current]: true } : {}));
  useEffect(() => {
    if (current) setOpen((o) => (o[current] ? o : { ...o, [current]: true }));
  }, [current]);

  const logo = brand.logoLight ?? brand.logoDark;

  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="hx-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-14">
              <a {...linkProps('', go, closeOnPhone)} aria-label={t('Hive home')}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--hd-orange,#ff4d00)] shadow-sm">
                  <img src={logo ?? '/brand-mark-tile.svg'} alt="" width={22} height={22} />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate" style={{ fontFamily: 'var(--hx-font-head)', fontWeight: 'var(--hx-head-weight)', fontSize: '1.25rem' }}>
                    {brand.name}
                  </span>
                  <span className="truncate text-muted-foreground text-sm">{data.plant.name}</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-[0.75rem] uppercase tracking-wider">{t('Operate')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_PRIMARY.map((id) => {
                const item = NAV[id];
                const n = counts[id] ?? 0;
                return (
                  <SidebarMenuItem key={id || 'home'}>
                    <SidebarMenuButton asChild isActive={section === id} tooltip={t(item.title)} className="hx-navbtn h-12 gap-3 text-[0.9375rem]">
                      <a {...linkProps(id, go, closeOnPhone)} aria-current={section === id ? 'page' : undefined}>
                        <NavIcon icon={item.icon} />
                        <span>{t(item.title)}</span>
                      </a>
                    </SidebarMenuButton>
                    {n > 0 && <SidebarMenuBadge className="top-3! right-3! h-6 min-w-6 rounded-full bg-[var(--hd-orange,#ff4d00)] text-[0.75rem] font-semibold text-[var(--hd-on-accent,#fff)]!">{n}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-semibold text-[0.75rem] uppercase tracking-wider">{t('Explore')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_SECTIONS.map((group) => (
                <Collapsible key={group.id} asChild open={!!open[group.id]} onOpenChange={(v) => setOpen((o) => ({ ...o, [group.id]: v }))} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={t(group.title)} className="hx-navbtn h-12 gap-3 text-[0.9375rem]">
                        <NavIcon icon={group.icon} />
                        <span>{t(group.title)}</span>
                        <ChevronRight className="ml-auto size-4! transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="mt-1 gap-0.5">
                        {group.ids.map((id) => (
                          <SidebarMenuSubItem key={id}>
                            <SidebarMenuSubButton asChild isActive={section === id} className="hx-subbtn h-11 text-[0.9375rem]">
                              <a {...linkProps(id, go, closeOnPhone)} aria-current={section === id ? 'page' : undefined}>
                                <span>{t(NAV[id].title)}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={section === 'settings'} className="hx-navbtn h-11 gap-3 text-[0.9375rem]">
              <a {...linkProps('settings', go, closeOnPhone)}>
                <NavIcon icon={Settings} />
                <span>{t('Settings')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hx-navbtn h-11 gap-3 text-[0.9375rem]">
              <a href="https://clerktree.com/contact" target="_blank" rel="noreferrer">
                <NavIcon icon={CircleHelp} />
                <span>{t('Help')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <AccountMenu user={user} guest={guest} onExit={onExit} go={go} />
      </SidebarFooter>
    </Sidebar>
  );
}

function AccountMenu({ user, guest, onExit, go }: { user: { name: string; email: string; avatarUrl?: string }; guest: boolean; onExit?: () => void; go: (s: string) => void }) {
  const t = useT();
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="h-14 data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-10 rounded-xl">
                <AvatarImage src={user.avatarUrl} alt="" />
                <AvatarFallback className="rounded-xl bg-neutral-950 text-white">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium text-[0.9375rem]">{user.name}</span>
                <span className="truncate text-muted-foreground text-sm">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl" side={isMobile ? 'top' : 'right'} align="end" sideOffset={6}>
            <DropdownMenuLabel className="font-normal">
              <span className="grid leading-tight">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground text-sm">{user.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="h-11 text-[0.9375rem]" onSelect={() => go('settings')}>
              <Settings /> {t('Settings')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="h-11 text-[0.9375rem]">
              <a href="/dashboard/default">
                <LayoutPanelLeft /> {t('Workspace dashboards')}
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="h-11 text-[0.9375rem]" onSelect={() => onExit?.()}>
              <LogOut /> {guest ? t('Sign in') : t('Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* ---------- header: where you are, search, the two numbers that matter, tools ---------- */

export function SiteHeader({
  section,
  title,
  apiState,
  openSearch,
  go,
  open,
  dark,
  setDark,
  textSize,
  setTextSize,
}: {
  section: string | null;
  title: string;
  apiState: HiveApiState;
  openSearch: () => void;
  go: (s: string) => void;
  open: (d: DetailRef) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
  textSize: TextSize;
  setTextSize: (v: TextSize) => void;
}) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { data, markRead } = useHive();
  const { toggleSidebar } = useSidebar();
  const group = section !== null ? sectionOf(section) : undefined;
  const openAlarms = data.alarms.filter((a) => a.state === 'Open');
  const waiting = data.approvals.filter((a) => a.state === 'Pending').length;
  const nextSize = TEXT_SIZES[(TEXT_SIZES.indexOf(textSize) + 1) % TEXT_SIZES.length];

  return (
    <header className="sticky top-0 z-30 shrink-0 rounded-t-[inherit] border-b-[3px] border-b-[var(--hd-orange,#ff4d00)] bg-neutral-950 pt-[env(safe-area-inset-top)] text-white">
      <div className="flex h-16 w-full min-w-0 items-center gap-2 px-3 md:gap-3 lg:px-6">
        <GhostOnInk className="shrink-0 gap-2 px-3 text-[0.9375rem]" onClick={toggleSidebar} aria-label={t('Menu')}>
          <Menu className="size-5" />
          <span>{t('Menu')}</span>
        </GhostOnInk>

        <Breadcrumb className={`hidden min-w-0 shrink-0 ${group ? '2xl:block' : ''}`}>
          <BreadcrumbList className="flex-nowrap text-[0.9375rem] text-white/65 sm:gap-2">
            {group && (
              <>
                <BreadcrumbItem>{t(group.title)}</BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate text-white">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <button
          type="button"
          onClick={openSearch}
          aria-label={t('Search (Ctrl K)')}
          className="mx-auto hidden h-11 w-full max-w-xl min-w-0 items-center gap-3 rounded-xl bg-white/10 px-4 text-left text-[0.9375rem] text-white/75 ring-1 ring-white/15 transition-colors hover:bg-white/15 hover:text-white md:flex"
        >
          <Search className="size-[1.1rem] shrink-0" />
          <span className="min-w-0 flex-1 truncate">{t('Search machines, alarms, work orders, documents, parts…')}</span>
          <kbd className="hidden rounded-md bg-white/10 px-2 py-0.5 text-[0.7rem] lg:block">⌘K</kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <GhostOnInk className="size-11 md:hidden" onClick={openSearch} aria-label={t('Search')}>
            <Search className="size-5" />
          </GhostOnInk>

          {/* The two things to look at most, one tap away from anywhere. */}
          <button
            type="button"
            onClick={() => go('alarms')}
            className={`hidden h-11 items-center gap-2 rounded-xl px-3.5 font-medium text-[0.9375rem] transition-colors xl:inline-flex ${openAlarms.length ? 'bg-[var(--hd-orange,#ff4d00)] text-[var(--hd-on-accent,#fff)] hover:brightness-110' : 'bg-white/10 text-white/85 hover:bg-white/15'}`}
          >
            {t('Alarms')}
            <span className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[0.8rem] font-semibold ${openAlarms.length ? 'bg-black/25' : 'bg-white/15'}`}>{openAlarms.length}</span>
          </button>
          <button type="button" onClick={() => go('inbox')} className="hidden h-11 items-center gap-2 rounded-xl bg-white/10 px-3.5 font-medium text-[0.9375rem] text-white/90 transition-colors hover:bg-white/15 xl:inline-flex">
            {t('Inbox')}
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/15 px-1.5 text-[0.8rem] font-semibold">{waiting}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <GhostOnInk className="relative size-11" aria-label={`${t('Notifications')}, ${openAlarms.length}`}>
                <Bell className="size-5" />
                {openAlarms.length > 0 && <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full bg-[var(--hd-orange,#ff4d00)] ring-2 ring-neutral-950" />}
              </GhostOnInk>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-w-[calc(100vw-1.5rem)] rounded-xl">
              <DropdownMenuLabel>{t('Open alarms')}</DropdownMenuLabel>
              {openAlarms.slice(0, 4).map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  className="items-start py-2.5"
                  onSelect={() => {
                    go('alarms');
                    open({ kind: 'alarm', id: a.id });
                  }}
                >
                  <span className="grid leading-tight">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-muted-foreground text-sm">
                      {a.machine} · {a.raisedAt}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
              {openAlarms.length === 0 && <p className="px-2 py-1.5 text-muted-foreground">{t('All clear.')}</p>}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('Notifications')}</DropdownMenuLabel>
              {data.notifications.slice(0, 3).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="items-start py-2.5"
                  onSelect={() => {
                    markRead(n.id);
                    go(n.to.section);
                  }}
                >
                  <span className="grid leading-tight">
                    <span className={n.read ? '' : 'font-medium'}>{n.text}</span>
                    <span className="text-muted-foreground text-sm">{n.at}</span>
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => go('alarms')} className="h-11 justify-center font-medium">
                {t('See all alarms')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <GhostOnInk className="hidden h-11 gap-1.5 px-3 sm:inline-flex" onClick={() => setTextSize(nextSize)} aria-label={`${t('Text size')}: ${t(TEXT_LABEL[textSize])}`} title={`${t('Text size')}: ${t(TEXT_LABEL[textSize])}`}>
            <Type className="size-5" />
            <span className="hidden text-[0.9375rem] lg:inline">{t(TEXT_LABEL[textSize])}</span>
          </GhostOnInk>
          <GhostOnInk className="h-11 min-w-11 px-3 font-semibold" onClick={() => setLang(lang === 'de' ? 'en' : 'de')} aria-label={t('Language')} title={t('Language')}>
            {lang === 'de' ? 'DE' : 'EN'}
          </GhostOnInk>
          <GhostOnInk className="size-11" onClick={() => setDark(!dark)} aria-label={dark ? t('Light theme') : t('Dark theme')} aria-pressed={dark}>
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </GhostOnInk>
        </div>
      </div>
      <span className="sr-only">{t(API_LABEL[apiState])}</span>
    </header>
  );
}

/* ---------- page banner: what this is, in plain words ---------- */

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function PageBanner({ icon: Icon, title, about, actions, apiState, children }: { icon: LucideIcon; title: React.ReactNode; about?: string; actions?: React.ReactNode; apiState: HiveApiState; children?: React.ReactNode }) {
  const t = useT();
  return (
    <section
      className="relative isolate overflow-hidden rounded-2xl bg-neutral-950 px-5 py-6 text-white shadow-sm md:px-8 md:py-7"
      style={{ backgroundImage: 'radial-gradient(70% 150% at 100% 0%, color-mix(in srgb, var(--hd-orange,#ff4d00) 44%, transparent), transparent 62%), radial-gradient(55% 110% at 0% 100%, rgb(255 255 255 / 0.06), transparent 60%)' }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-50 mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--hd-orange,#ff4d00)] text-[var(--hd-on-accent,#fff)] shadow-lg sm:size-12 md:size-14">
            <Icon className="size-6 md:size-7" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <h1 className="text-balance text-[1.5rem] leading-tight sm:text-[1.75rem] md:text-[2.25rem]" style={{ fontFamily: 'var(--hx-font-head)', fontWeight: 'var(--hx-head-weight)' }}>
              {title}
            </h1>
            {about && <p className="mt-1 max-w-prose text-pretty text-[1rem] text-white/75 leading-snug">{about}</p>}
          </div>
        </div>
        {actions && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
      <p className="mt-4 flex items-center gap-2 text-[0.8rem] text-white/50">
        <span className={`size-1.5 rounded-full ${apiState === 'online' ? 'bg-emerald-400' : apiState === 'offline' ? 'bg-red-400' : 'bg-amber-400'}`} aria-hidden="true" />
        {t(API_LABEL[apiState])}
      </p>
    </section>
  );
}

export function SpecFooter({ spec }: { spec?: string }) {
  const t = useT();
  if (!spec) return null;
  return (
    <p className="pt-2 text-muted-foreground text-sm">
      {t('Built for the Hive API module')}: <code className="font-mono">{spec}</code>
    </p>
  );
}

