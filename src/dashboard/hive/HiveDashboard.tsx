import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react-dash";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/dashboard-ui/sidebar";
import { TooltipProvider } from "@/components/dashboard-ui/tooltip";
import { cn } from "@/lib/utils";
import "@/dashboard/styles/dashboard-theme.css";

import { AdminView, SettingsView } from "./admin";
import { AssistantView } from "./assistant";
import {
  DocumentsView,
  FindingsView,
  PartsView,
  ReportsView,
  VendorsView,
} from "./business";
import { PhoneCtx } from "./common";
import { BrandProvider, brandStyle, useBrand } from "./branding";
import EmbedHost from "./embed";
import HomeView from "./HomeView";
import { LangProvider, useT } from "./i18n";
import Kiosk, { BOARDS, type Board } from "./kiosk";
import { GraphView } from "./graph";
import { useLayout } from "./layout";
import { MachineDetail, MachinesView } from "./machines";
import ModuleView from "./modules";
import { NAV, MODULE_SECTIONS } from "./nav";
import {
  ActivityView,
  AlarmsView,
  DetailDrawer,
  InboxView,
  WorkOrdersView,
} from "./ops";
import { HiveSidebar, PageHeader, SiteHeader, SpecFooter } from "./shell";
import { HiveStoreProvider, useHive } from "./store";
import { Surface, SurfaceCtx } from "./ui";
import "./hive-dashboard.css";
import "./hive-shell.css";

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

const BASE = "/dashboard/hive";

function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function readPref(key: string, fallback: boolean): boolean {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
}
function writePref(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
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

function SearchDialog({
  onClose,
  go,
}: {
  onClose: () => void;
  go: (section: string) => void;
}) {
  const t = useT();
  const { data, openDetail } = useHive();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  const hits = useMemo<Hit[]>(() => {
    const all: Hit[] = [
      ...Object.entries(NAV).map(([id, s]) => ({
        key: `s-${id}`,
        label: t(s.title),
        hint: t("Go to"),
        extra: `${s.title} ${s.keywords} ${s.terms}`,
        run: () => go(id),
      })),
      ...data.machines.map((m) => ({
        key: m.id,
        label: m.key,
        hint: `${t("Machine")} · ${m.site}`,
        run: () => go(`machines/${m.id}`),
      })),
      ...data.alarms.map((a) => ({
        key: a.id,
        label: a.title,
        hint: `${t("Alarm")} · ${a.machine} · ${a.id}`,
        run: () => {
          go("alarms");
          openDetail({ kind: "alarm", id: a.id });
        },
      })),
      ...data.workOrders.map((w) => ({
        key: w.id,
        label: w.title,
        hint: `${t("Work order")} · ${w.id}`,
        run: () => {
          go("work-orders");
          openDetail({ kind: "workOrder", id: w.id });
        },
      })),
      ...data.documents.map((d) => ({
        key: d.id,
        label: d.name,
        hint: `${t("Document")} · ${d.machine}`,
        run: () => {
          go("documents");
          openDetail({ kind: "document", id: d.id });
        },
      })),
      ...data.parts.map((p) => ({
        key: p.id,
        label: `${p.number} · ${p.name}`,
        hint: `${t("Part")} · ${p.machine}`,
        run: () => {
          go("parts");
          openDetail({ kind: "part", id: p.id });
        },
      })),
    ];
    const needle = q.trim().toLowerCase();
    return (
      needle
        ? all.filter((h) =>
            `${h.label} ${h.hint} ${h.extra ?? ""}`
              .toLowerCase()
              .includes(q.trim().toLowerCase()),
          )
        : all.slice(0, 11)
    ).slice(0, 12);
  }, [q, data, go, openDetail, t]);

  useEffect(() => setIdx(0), [q]);

  const choose = (h?: Hit) => {
    if (!h) return;
    onClose();
    h.run();
  };

  return (
    <div className="hd-drawer-wrap is-center" onClick={onClose}>
      <div
        className="hd-search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t("Search Hive")}
        onClick={(e) => e.stopPropagation()}
      >
        <label className="hd-search-input">
          <Search size={16} aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(
              "Search machines, alarms, work orders, documents, parts…",
            )}
            aria-label={t("Search")}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(i + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") choose(hits[idx]);
            }}
          />
          <kbd>{t("Esc")}</kbd>
        </label>
        <ul className="hd-hits" role="listbox">
          {hits.map((h, i) => (
            <li key={h.key} role="option" aria-selected={i === idx}>
              <button
                type="button"
                className={i === idx ? "is-on" : ""}
                onMouseEnter={() => setIdx(i)}
                onClick={() => choose(h)}
              >
                <span>{h.label}</span>
                <small>{h.hint}</small>
              </button>
            </li>
          ))}
          {hits.length === 0 && (
            <li className="hd-empty">{t("Nothing found.")}</li>
          )}
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
  const phone = layout === "phone";
  const { applied: brand } = useBrand();

  const shownUser = guest
    ? { ...user, name: t("Guest"), email: t("Demo preview") }
    : user;

  const raw = (params["*"] ?? "").replace(/^\/+|\/+$/g, "");
  const [first, second] = raw.split("/");
  const section = first in NAV ? first : null;

  const [dark, setDarkState] = useState(() =>
    readPref("hive.dash.dark", false),
  );
  const [compact, setCompactState] = useState(() =>
    readPref("hive.dash.compact", false),
  );
  const setDark = (v: boolean) => {
    setDarkState(v);
    writePref("hive.dash.dark", v);
  };
  const setCompact = (v: boolean) => {
    setCompactState(v);
    writePref("hive.dash.compact", v);
  };

  const [searchOpen, setSearchOpen] = useState(false);

  const go = useCallback(
    (target: string) => {
      openDetail(null);
      navigate(target ? `${BASE}/${target}` : BASE);
      // A new screen starts at its top.
      window.scrollTo(0, 0);
    },
    [navigate, openDetail],
  );

  // Old addresses keep working.
  useEffect(() => {
    const legacy: Record<string, string> = {
      assets: "machines",
      approvals: "inbox",
      gateways: "admin/connections",
      sites: "",
    };
    if (first in legacy)
      navigate(legacy[first] ? `${BASE}/${legacy[first]}` : BASE, {
        replace: true,
      });
  }, [first, navigate]);

  // Menus, sheets and tooltips are drawn into <body>, outside this page's own tree. Giving <body> the same
  // theme class, dark class and brand colours while the dashboard is open keeps all of them in step with it.
  useEffect(() => {
    const body = document.body;
    const vars = Object.entries(brandStyle(brand)) as [string, string][];
    const added = ["dashboard-root"].filter((c) => !body.classList.contains(c));
    body.classList.add(...added);
    for (const [k, v] of vars) body.style.setProperty(k, String(v));
    return () => {
      body.classList.remove(...added);
      for (const [k] of vars) body.style.removeProperty(k);
    };
  }, [brand]);
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    return () => document.body.classList.remove("dark");
  }, [dark]);

  // The browser draws the status bar from the page: keep it matching the surface under it.
  useEffect(() => {
    const tag = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (!tag) return undefined;
    const before = tag.content;
    tag.content = dark ? "#252525" : "#fafafa";
    return () => {
      tag.content = before;
    };
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof Element &&
        e.target.closest("input, textarea, select, [contenteditable]");
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        openDetail(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openDetail]);

  const def = section !== null ? NAV[section] : undefined;
  useEffect(() => {
    document.title = `${def ? t(def.title) : brand.name} · ${brand.name}`;
  }, [def, t, brand.name]);

  const firstName = shownUser.name.split(/\s+/)[0] || shownUser.name;

  let view: React.ReactNode;
  if (section === "") view = <HomeView go={go} />;
  else if (section === "machines")
    view = second ? (
      <MachineDetail id={second} go={go} />
    ) : (
      <MachinesView go={go} site={search.get("site")} />
    );
  else if (section === "alarms") view = <AlarmsView go={go} />;
  else if (section === "inbox") view = <InboxView go={go} />;
  else if (section === "assistant") view = <AssistantView />;
  else if (section === "work-orders") view = <WorkOrdersView />;
  else if (section === "parts") view = <PartsView />;
  else if (section === "vendors") view = <VendorsView />;
  else if (section === "documents") view = <DocumentsView />;
  else if (section === "findings") view = <FindingsView />;
  else if (section === "reports") view = <ReportsView />;
  else if (section === "graph") view = <GraphView />;
  else if (section === "admin")
    view = <AdminView area={second ?? "tenant"} go={go} />;
  else if (section === "activity") view = <ActivityView />;
  else if (section === "settings")
    view = (
      <SettingsView
        dark={dark}
        setDark={setDark}
        compact={compact}
        setCompact={setCompact}
      />
    );
  else if (section && (MODULE_SECTIONS as readonly string[]).includes(section))
    view = <ModuleView id={section} area={second} go={go} />;
  else {
    view = (
      <section className="hd-card hd-page">
        <h2 className="hd-card-title is-lg">{t("Page not found")}</h2>
        <p className="hd-muted">
          {t("There is no Hive page at this address.")}
        </p>
        <button
          type="button"
          className="hd-btn is-dark hd-btn-sm"
          onClick={() => go("")}
        >
          {t("Back to home")}
        </button>
      </section>
    );
  }

  const onHome = section === "" || section === null;
  const machine =
    first === "machines" && second
      ? data.machines.find((m) => m.id === second)
      : undefined;
  const pageTitle = onHome
    ? t("Home")
    : machine
      ? machine.key
      : t(NAV[section].title);
  const title: React.ReactNode = onHome ? (
    <>
      {t(greeting())}, <span className="hd-accent">{firstName}</span>
    </>
  ) : (
    pageTitle
  );
  const about = onHome
    ? t("Stay on top of your plant, monitor signals, and track alarms.")
    : machine
      ? machine.name
      : t(NAV[section].about);
  const spec = section !== null && !machine ? NAV[section].spec : undefined;

  // Home, the module screens and Admin (which wraps its own old parts) are built from the shared components.
  const modern =
    section === "" ||
    section === "admin" ||
    (section !== null &&
      (MODULE_SECTIONS as readonly string[]).includes(section));
  const surfaceClass = `hd-root hx-app is-inset${dark ? " is-dark" : ""}${compact ? " is-compact" : ""}${phone ? " is-phone" : ""}`;
  const surfaceStyle = brandStyle(brand);

  return (
    <PhoneCtx.Provider value={phone}>
      <SurfaceCtx.Provider
        value={{ className: surfaceClass, style: surfaceStyle }}
      >
        <div
          className={cn("dashboard-root", dark && "dark")}
          data-font="geist"
          style={surfaceStyle}
        >
          <TooltipProvider>
            <SidebarProvider
              // Open beside the page on wide screens; on tablets and phones the page gets the full width and the trigger brings the sidebar in.
              defaultOpen={
                typeof window === "undefined" || window.innerWidth >= 1024
              }
              style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
            >
              <HiveSidebar
                section={section ?? ""}
                go={go}
                user={shownUser}
                guest={guest}
                onExit={onSignOut}
                dark={dark}
                setDark={setDark}
              />
              <SidebarInset className="min-w-0 overflow-x-clip">
                <a
                  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
                  href="#hx-main"
                >
                  {t("Skip to content")}
                </a>
                <SiteHeader
                  section={section}
                  title={pageTitle}
                  apiState={apiState}
                  openSearch={() => setSearchOpen(true)}
                  go={go}
                  open={openDetail}
                  dark={dark}
                  setDark={setDark}
                />
                <main
                  id="hx-main"
                  tabIndex={-1}
                  className={
                    "flex min-w-0 flex-1 flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] outline-none md:gap-6 md:p-6"
                  }
                >
                  <div className="flex min-w-0 flex-col gap-4 md:gap-6">
                    <PageHeader title={title} about={about} />
                    {modern ? view : <Surface>{view}</Surface>}
                    <SpecFooter spec={spec} />
                  </div>
                </main>
              </SidebarInset>
              <Surface>
                {searchOpen && (
                  <SearchDialog onClose={() => setSearchOpen(false)} go={go} />
                )}
                <DetailDrawer go={go} />
                {toast && (
                  <div className="hd-toast" role="status">
                    {toast}
                  </div>
                )}
              </Surface>
            </SidebarProvider>
          </TooltipProvider>
        </div>
      </SurfaceCtx.Provider>
    </PhoneCtx.Provider>
  );
}

/** Picks the screen: a shop-floor display, an embeddable component, or the console. */
function Root(props: HiveDashboardProps) {
  const params = useParams();
  const [kind, a, b] = (params["*"] ?? "").replace(/^\/+|\/+$/g, "").split("/");
  useEffect(() => {
    if (kind === "kiosk" || kind === "embed")
      document.documentElement.classList.add("hd-lock");
  }, [kind]);
  if (kind === "kiosk")
    return BOARDS.includes(a as Board) ? (
      <Kiosk board={a as Board} id={b ?? ""} />
    ) : (
      <KioskUnknown />
    );
  if (kind === "embed") return <EmbedHost component={a ?? ""} />;
  return <Shell {...props} />;
}

function KioskUnknown() {
  const t = useT();
  return (
    <div className="kb-root is-hc is-far">
      <main className="kb-body">
        <div className="kb-center" role="status">
          <h2>{t("Not available")}</h2>
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
