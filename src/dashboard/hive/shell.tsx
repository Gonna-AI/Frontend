/**
 * The Hive dashboard frame, built the way shadcn's dashboard-01 block is: an inset sidebar with grouped
 * navigation, a slim header with a trigger, breadcrumb and tools, and one scrolling page.
 * The pieces are the same primitives the workspace dashboards use (components/dashboard-ui).
 */
import { Bell, ChevronRight, ChevronsUpDown, CircleHelp, LayoutPanelLeft, LogOut, Moon, Search, Settings, Sun } from 'lucide-react-dash';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboard-ui/avatar';
import { Badge } from '@/components/dashboard-ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/dashboard-ui/breadcrumb';
import { Button } from '@/components/dashboard-ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/dashboard-ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/dashboard-ui/dropdown-menu';
import { Separator } from '@/components/dashboard-ui/separator';
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
  SidebarTrigger,
  useSidebar,
} from '@/components/dashboard-ui/sidebar';

import { useBrand } from './branding';
import { useLang, useT } from './i18n';
import { BottomNav } from './mobile';
import { NAV, NAV_PRIMARY, NAV_SECTIONS, sectionOf } from './nav';
import type { HiveApiState } from './hiveApi';
import { useHive, type DetailRef } from './store';

const BASE = '/dashboard/hive';

export const API_LABEL: Record<HiveApiState, string> = {
  unconfigured: 'Placeholder data',
  checking: 'Placeholder data · checking API',
  online: 'Placeholder data · API online',
  offline: 'Placeholder data · API offline',
};

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
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnPhone = () => {
    if (isMobile) setOpenMobile(false);
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
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a {...linkProps('', go, closeOnPhone)} aria-label={t('Hive home')}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--hd-orange,#ff4d00)]">
                  <img src={logo ?? '/brand-mark-tile.svg'} alt="" width={18} height={18} />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold" style={{ fontFamily: 'var(--hx-font-head)', fontWeight: 'var(--hx-head-weight)', fontSize: 17 }}>
                    {brand.name}
                  </span>
                  <span className="truncate text-muted-foreground text-xs">{data.plant.name}</span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('Operate')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_PRIMARY.map((id) => {
                const item = NAV[id];
                const Icon = item.icon;
                const n = counts[id] ?? 0;
                return (
                  <SidebarMenuItem key={id || 'home'}>
                    <SidebarMenuButton asChild isActive={section === id} tooltip={t(item.title)}>
                      <a {...linkProps(id, go, closeOnPhone)} aria-current={section === id ? 'page' : undefined}>
                        <Icon />
                        <span>{t(item.title)}</span>
                      </a>
                    </SidebarMenuButton>
                    {n > 0 && <SidebarMenuBadge className="rounded-full bg-[var(--hd-orange,#ff4d00)] px-1.5 text-[11px] text-[var(--hd-on-accent,#fff)]">{n}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('Explore')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SECTIONS.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <Collapsible key={group.id} asChild open={!!open[group.id]} onOpenChange={(v) => setOpen((o) => ({ ...o, [group.id]: v }))} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={t(group.title)}>
                          <GroupIcon />
                          <span>{t(group.title)}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.ids.map((id) => (
                            <SidebarMenuSubItem key={id}>
                              <SidebarMenuSubButton asChild isActive={section === id}>
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={section === 'settings'} size="sm">
              <a {...linkProps('settings', go, closeOnPhone)}>
                <Settings />
                <span>{t('Settings')}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <a href="https://clerktree.com/contact" target="_blank" rel="noreferrer">
                <CircleHelp />
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
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatarUrl} alt="" />
                <AvatarFallback className="rounded-lg">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-muted-foreground text-xs">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? 'top' : 'right'} align="end" sideOffset={6}>
            <DropdownMenuLabel className="font-normal">
              <span className="grid text-sm leading-tight">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">{user.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => go('settings')}>
              <Settings /> {t('Settings')}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/default">
                <LayoutPanelLeft /> {t('Workspace dashboards')}
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onExit?.()}>
              <LogOut /> {guest ? t('Sign in') : t('Sign out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* ---------- header: trigger, where you are, tools ---------- */

export function SiteHeader({
  section,
  title,
  apiState,
  openSearch,
  go,
  open,
  dark,
  setDark,
}: {
  section: string | null;
  title: string;
  apiState: HiveApiState;
  openSearch: () => void;
  go: (s: string) => void;
  open: (d: DetailRef) => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  const t = useT();
  const { lang, setLang } = useLang();
  const { data, markRead } = useHive();
  const group = section !== null ? sectionOf(section) : undefined;
  const openAlarms = data.alarms.filter((a) => a.state === 'Open');

  return (
    <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center gap-2 rounded-t-[inherit] border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex w-full min-w-0 items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" aria-label={t('Menu')} />
          <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              {group && (
                <>
                  <BreadcrumbItem className="hidden sm:inline-flex">{t(group.title)}</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden sm:block" />
                </>
              )}
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Badge variant="outline" className="mr-1 hidden h-6 gap-1.5 px-2.5 font-normal text-muted-foreground lg:inline-flex" title={t(API_LABEL[apiState])}>
            <span className={`size-1.5 rounded-full ${apiState === 'online' ? 'bg-emerald-500' : apiState === 'offline' ? 'bg-red-500' : 'bg-amber-500'}`} />
            {t('Placeholder data')}
          </Badge>
          <Button variant="outline" size="sm" className="hidden w-44 justify-start gap-2 font-normal text-muted-foreground md:inline-flex" onClick={openSearch} aria-label={t('Search (Ctrl K)')}>
            <Search className="size-4" />
            <span className="flex-1 text-left">{t('Search')}</span>
            <kbd className="rounded border bg-muted px-1.5 text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={openSearch} aria-label={t('Search')}>
            <Search />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label={`${t('Notifications')}, ${openAlarms.length}`}>
                <Bell />
                {openAlarms.length > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-[var(--hd-orange,#ff4d00)] ring-2 ring-background" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-1.5rem)]">
              <DropdownMenuLabel>{t('Open alarms')}</DropdownMenuLabel>
              {openAlarms.slice(0, 4).map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  className="items-start"
                  onSelect={() => {
                    go('alarms');
                    open({ kind: 'alarm', id: a.id });
                  }}
                >
                  <span className="grid text-sm leading-tight">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {a.machine} · {a.raisedAt}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
              {openAlarms.length === 0 && <p className="px-2 py-1.5 text-muted-foreground text-sm">{t('All clear.')}</p>}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('Notifications')}</DropdownMenuLabel>
              {data.notifications.slice(0, 3).map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="items-start"
                  onSelect={() => {
                    markRead(n.id);
                    go(n.to.section);
                  }}
                >
                  <span className="grid text-sm leading-tight">
                    <span className={n.read ? '' : 'font-medium'}>{n.text}</span>
                    <span className="text-muted-foreground text-xs">{n.at}</span>
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => go('alarms')} className="justify-center font-medium">
                {t('See all alarms')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'de' ? 'en' : 'de')} aria-label={t('Language')} title={t('Language')} className="text-xs font-semibold">
            {lang === 'de' ? 'DE' : 'EN'}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label={dark ? t('Light theme') : t('Dark theme')} aria-pressed={dark}>
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ---------- page header and footer ---------- */

export function PageHeader({ title, about, actions }: { title: React.ReactNode; about?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-balance text-2xl leading-tight md:text-3xl" style={{ fontFamily: 'var(--hx-font-head)', fontWeight: 'var(--hx-head-weight)' }}>
          {title}
        </h1>
        {about && <p className="mt-1.5 max-w-prose text-pretty text-muted-foreground text-sm">{about}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SpecFooter({ spec }: { spec?: string }) {
  const t = useT();
  if (!spec) return null;
  return (
    <p className="pt-2 text-muted-foreground text-xs">
      {t('Built for the Hive API module')}: <code className="font-mono">{spec}</code>
    </p>
  );
}

/* ---------- phone: the four places people go all day, one tap away ---------- */

export function PhoneTabs({ section, go, unread }: { section: string; go: (s: string) => void; unread: boolean }) {
  const { setOpenMobile } = useSidebar();
  return <BottomNav section={section} go={go} onMenu={() => setOpenMobile(true)} unread={unread} />;
}
