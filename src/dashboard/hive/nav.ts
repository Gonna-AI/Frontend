/**
 * One navigation model for the whole Hive dashboard: the sidebar, the tablet drawer, the phone menu
 * and the command search all read this, so a section can never be missing from one of them.
 *
 * The groups follow how work happens in a plant rather than how the API is organised:
 * Operate (what needs me now), Work (planning and doing), Knowledge (what we know),
 * Automate (agents and rules), Manage (people, connections, compliance).
 * `spec` names the Hive API module a screen is built for, so every placeholder screen can be traced to it.
 */
import {
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  ChartBar,
  ClipboardList,
  Code,
  Cpu,
  Factory,
  FileText,
  Home,
  Inbox,
  LayoutGrid,
  Lightbulb,
  Network,
  Package,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Workflow,
  type LucideIcon,
} from 'lucide-react-dash';

export interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Extra words people search by (English; German terms are in `terms`). */
  keywords: string;
  terms: string;
  /** What the screen is for, one sentence, shown under the title. */
  about: string;
  /** Hive API modules behind the screen. */
  spec?: string;
}

export const NAV: Record<string, NavItem> = {
  '': { id: '', title: 'Home', icon: Home, keywords: 'overview dashboard attention', terms: 'start übersicht', about: 'What is wrong, what is waiting for you, how the plant is doing.', spec: 'APP-HOME' },
  machines: { id: 'machines', title: 'Machines', icon: Cpu, keywords: 'assets equipment lines state', terms: 'maschinen anlagen', about: 'Every machine by area and line, with the age of each state.', spec: 'APP-MACHINE' },
  alarms: { id: 'alarms', title: 'Alarms', icon: Bell, keywords: 'alerts faults incidents', terms: 'alarme störungen', about: 'Open alarms by priority, and the incidents they roll up into.', spec: 'TEL-ALARM' },
  inbox: { id: 'inbox', title: 'Inbox', icon: Inbox, keywords: 'approvals notifications decisions', terms: 'posteingang genehmigungen', about: 'Decisions waiting for a person, and what changed since you looked.', spec: 'APP-APPROVE' },
  assistant: { id: 'assistant', title: 'Assistant', icon: Sparkles, keywords: 'ai chat questions', terms: 'assistent ki', about: 'Ask about a machine; every answer carries its sources.', spec: 'APP-ASSIST' },

  'work-orders': { id: 'work-orders', title: 'Work orders', icon: ClipboardList, keywords: 'maintenance cmms erp', terms: 'arbeitsaufträge instandhaltung', about: 'Plan, approve and follow maintenance work.', spec: 'BIZ-WO' },
  production: { id: 'production', title: 'Production', icon: Factory, keywords: 'oee orders schedule shift handover energy', terms: 'produktion fertigung schicht übergabe energie', about: 'Orders, the schedule, OEE and the shift handover, by line.', spec: 'BIZ-OEE · BIZ-PROD · BIZ-SCHED · BIZ-SHIFT' },
  quality: { id: 'quality', title: 'Quality', icon: ShieldCheck, keywords: 'traceability inspection nonconformity batch scrap', terms: 'qualität rückverfolgung prüfung abweichung charge ausschuss', about: 'Inspections, nonconformities and traceability from part to process values.', spec: 'BIZ-QUAL · BIZ-TRACE' },
  parts: { id: 'parts', title: 'Parts', icon: Package, keywords: 'stock spare inventory tooling', terms: 'ersatzteile lager werkzeuge', about: 'Parts and stock, with the age of every stock record.', spec: 'BIZ-PARTS · BIZ-TOOL' },
  vendors: { id: 'vendors', title: 'Vendors and RFQs', icon: Store, keywords: 'procurement requisitions suppliers purchase orders', terms: 'lieferanten anfragen bestellungen einkauf', about: 'Vendors, quote requests and the comparison of replies.', spec: 'BIZ-VENDOR · BIZ-RFQ · BIZ-PO' },

  documents: { id: 'documents', title: 'Documents', icon: FileText, keywords: 'manuals drawings sop search', terms: 'dokumente handbücher zeichnungen', about: 'Manuals, drawings and procedures, with what applies to your machine.', spec: 'DOC-INGEST · DOC-BIND' },
  findings: { id: 'findings', title: 'Findings', icon: Lightbulb, keywords: 'predictions models anomalies', terms: 'befunde prognosen modelle', about: 'What the models noticed, with confidence and evidence.', spec: 'ML-API' },
  graph: { id: 'graph', title: 'Graph', icon: Network, keywords: 'relationships explorer', terms: 'graph beziehungen', about: 'The plant as one graph: machines, parts, documents and work.', spec: 'APP-GRAPH' },
  reports: { id: 'reports', title: 'Reports', icon: ChartBar, keywords: 'oee kpi export csv', terms: 'berichte kennzahlen', about: 'KPIs by site, line or machine, never by person.', spec: 'BIZ-REPORT' },

  agents: { id: 'agents', title: 'Agents', icon: Bot, keywords: 'ai autonomy runs registry evals', terms: 'agenten autonomie läufe', about: 'Which agents exist, what they may do, and what they did.', spec: 'AI-REG · AI-AUTO · AI-EVAL' },
  automations: { id: 'automations', title: 'Automations', icon: Workflow, keywords: 'rules workflows commands control kill switch interlocks', terms: 'regeln abläufe befehle steuerung notaus', about: 'Rules, workflows and the commands that may reach a machine.', spec: 'TEL-RULE · TEL-WF · CMD-*' },

  admin: { id: 'admin', title: 'Admin', icon: SlidersHorizontal, keywords: 'users roles connections gateways audit api keys', terms: 'verwaltung benutzer rollen verbindungen', about: 'Tenant, access, connections, gateways, policies and branding.', spec: 'APP-ADMIN' },
  compliance: { id: 'compliance', title: 'Compliance', icon: BookOpen, keywords: 'gdpr nis2 ai act residency retention works council certificates', terms: 'datenschutz betriebsrat aufbewahrung zertifikate', about: 'Where data lives, how long it is kept, and what we can prove.', spec: 'CMP-*' },
  developer: { id: 'developer', title: 'Developer', icon: Code, keywords: 'api keys webhooks mcp sandbox sdk', terms: 'entwickler schnittstelle webhooks sandbox', about: 'API keys, webhooks, the MCP server and the simulated plant.', spec: 'DX-* · API-MCP' },
  activity: { id: 'activity', title: 'Activity', icon: LayoutGrid, keywords: 'feed history timeline', terms: 'aktivität verlauf', about: 'Everything that happened, newest first.', spec: 'API-RT' },
  settings: { id: 'settings', title: 'Settings', icon: Settings, keywords: 'preferences theme diagnostics', terms: 'einstellungen', about: 'Your language, theme and notifications.' },
};

export interface NavSection {
  id: string;
  title: string;
  icon: LucideIcon;
  ids: string[];
}

/** Always visible: the things a person looks at many times a day. */
export const NAV_PRIMARY = ['', 'machines', 'alarms', 'inbox', 'assistant'];

/** Collapsed until opened (the one holding the current screen opens by itself): everything else, by what it is for. */
export const NAV_SECTIONS: NavSection[] = [
  { id: 'work', title: 'Work', icon: Briefcase, ids: ['work-orders', 'production', 'quality', 'parts', 'vendors'] },
  { id: 'knowledge', title: 'Knowledge', icon: BookOpen, ids: ['documents', 'findings', 'graph', 'reports'] },
  { id: 'automation', title: 'Automation', icon: Workflow, ids: ['agents', 'automations'] },
  { id: 'organization', title: 'Organization', icon: Building2, ids: ['admin', 'compliance', 'developer', 'activity'] },
];

/** Which section a screen lives in (for the breadcrumb and for opening the right group). */
export function sectionOf(id: string): NavSection | undefined {
  return NAV_SECTIONS.find((s) => s.ids.includes(id));
}

/** The four destinations a phone keeps one tap away (the fifth is the menu). */
export const PHONE_TABS = ['', 'machines', 'inbox', 'assistant'] as const;

/** Sections that use the generic module screen (placeholder data until the API module ships). */
export const MODULE_SECTIONS = ['production', 'quality', 'agents', 'automations', 'compliance', 'developer'] as const;
