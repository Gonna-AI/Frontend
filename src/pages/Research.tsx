import type { ReactNode } from 'react';

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleDot,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Footer } from '../components/Landing/AgeroChrome';
import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingFramer.css';

type LocalizedText = { en: string; de: string };

type ResearchProject = {
  slug: string;
  number: string;
  status: LocalizedText;
  category: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  finding: LocalizedText;
  methods: LocalizedText[];
  tags: LocalizedText[];
  links?: { label: LocalizedText; href: string }[];
};

const text = (en: string, de: string = en): LocalizedText => ({ en, de });

const researchProjects: ResearchProject[] = [
  {
    slug: 'juris',
    number: '01',
    status: text('Current focus', 'Aktueller Fokus'),
    category: text('Agent systems', 'Agentensysteme'),
    title: text('Juris', 'Juris'),
    subtitle: text('Reliable task execution under real-world constraints.', 'Verlässliche Aufgabenausführung unter realen Bedingungen.'),
    summary: text(
      'A research programme for task-oriented agents that select the right action path, preserve structural correctness, and recover without creating new failure cascades.',
      'Ein Forschungsprogramm für aufgabenorientierte Agenten, die den richtigen Aktionspfad wählen, strukturelle Korrektheit bewahren und sich ohne neue Fehlerketten erholen.',
    ),
    finding: text(
      'Reliability is an orchestration problem as much as it is a model problem. Narrower action spaces and stronger interface alignment make agent behaviour more predictable.',
      'Verlässlichkeit ist ebenso ein Orchestrierungs- wie ein Modellproblem. Kleinere Aktionsräume und eine bessere Schnittstellenabstimmung machen Agenten vorhersehbarer.',
    ),
    methods: [
      text('Early action-space narrowing to reduce avoidable decision entropy.', 'Frühe Verengung des Aktionsraums, um vermeidbare Entscheidungsentropie zu reduzieren.'),
      text('Schema and interface alignment for valid, precise tool calls.', 'Schema- und Schnittstellenabgleich für gültige, präzise Tool-Aufrufe.'),
      text('External validation through the VAKRA tool-use benchmark.', 'Externe Validierung mit dem VAKRA-Tool-Use-Benchmark.'),
    ],
    tags: [text('Tool use', 'Tool Use'), text('Reliability', 'Verlässlichkeit'), text('Benchmarks', 'Benchmarks')],
    links: [
      { label: text('Benchmark context', 'Benchmark-Kontext'), href: 'https://www.ibm.com/new/announcements/introducing-vakra-benchmark' },
      { label: text('Leaderboard', 'Leaderboard'), href: 'https://huggingface.co/spaces/ibm-research/vakra' },
    ],
  },
  {
    slug: 'operations-intelligence',
    number: '02',
    status: text('Completed', 'Abgeschlossen'),
    category: text('Applied research', 'Angewandte Forschung'),
    title: text('Operations Intelligence & Hyper-Local AI', 'Operations Intelligence & Hyper-Local AI'),
    subtitle: text('A practical thesis on turning fragmented signals into useful action.', 'Eine praktische These darüber, wie fragmentierte Signale zu hilfreichen Aktionen werden.'),
    summary: text(
      'The ClerkTree white paper maps the opportunity between customer conversations, document-heavy operations, and local business workflows—where context is often lost between the signal and the decision.',
      'Das ClerkTree-Whitepaper untersucht die Schnittstelle zwischen Kundengesprächen, dokumentenlastigen Abläufen und lokalen Geschäftsprozessen – dort, wo Kontext zwischen Signal und Entscheidung verloren geht.',
    ),
    finding: text(
      'The highest-leverage AI systems do not only generate answers. They carry context across the workflow and make the next operational step easier to take.',
      'Die wirkungsvollsten KI-Systeme erzeugen nicht nur Antworten. Sie tragen Kontext durch den Workflow und machen den nächsten operativen Schritt einfacher.',
    ),
    methods: [
      text('Literature and product synthesis across voice, documents, and workflow automation.', 'Synthese aus Literatur und Produktarbeit zu Voice, Dokumenten und Workflow-Automatisierung.'),
      text('Design exploration of proactive engagement, sentiment routing, and shadow-mode learning.', 'Design-Exploration zu proaktivem Engagement, Sentiment-Routing und Shadow-Mode-Lernen.'),
      text('A deployment lens grounded in small and medium-sized business operations.', 'Eine Deployment-Perspektive mit Fokus auf Abläufe kleiner und mittlerer Unternehmen.'),
    ],
    tags: [text('OpsIntel', 'OpsIntel'), text('Voice AI', 'Voice AI'), text('Local business', 'Lokale Unternehmen')],
  },
  {
    slug: 'european-sovereign-ai',
    number: '03',
    status: text('Completed', 'Abgeschlossen'),
    category: text('Governance', 'Governance'),
    title: text('European Sovereign AI', 'European Sovereign AI'),
    subtitle: text('Sovereignty as a control plane, not a marketing claim.', 'Souveränität als Kontrollschicht, nicht als Marketingversprechen.'),
    summary: text(
      'This enterprise research brief defines a governed route from operational signal to trusted action: explicit data boundaries, accountable model choices, controlled permissions, and an evidence trail.',
      'Dieses Enterprise-Briefing definiert einen kontrollierten Weg vom operativen Signal zur vertrauenswürdigen Aktion: klare Datenräume, verantwortete Modellwahl, kontrollierte Berechtigungen und ein nachvollziehbarer Belegpfad.',
    ),
    finding: text(
      'European AI adoption needs a governance story as strong as its automation story. The customer should retain authority over data, models, actions, and review.',
      'Die Einführung europäischer KI braucht eine ebenso starke Governance-Erzählung wie Automatisierung. Der Kunde sollte die Hoheit über Daten, Modelle, Aktionen und Prüfung behalten.',
    ),
    methods: [
      text('Control-plane model spanning data, model, action, and evidence boundaries.', 'Kontrollschichten für Daten, Modelle, Aktionen und Nachweise.'),
      text('Risk-aware operating patterns for automotive, manufacturing, and enterprise services.', 'Risikobewusste Betriebsmuster für Automotive, Fertigung und Enterprise Services.'),
      text('Outcome scorecard: time-to-decision, cost per case, quality, escalation, and adoption.', 'Ergebnis-Scorecard: Entscheidungszeit, Fallkosten, Qualität, Eskalation und Nutzung.'),
    ],
    tags: [text('Sovereignty', 'Souveränität'), text('Governance', 'Governance'), text('Europe', 'Europa')],
  },
  {
    slug: 'governed-quality-ai',
    number: '04',
    status: text('Completed', 'Abgeschlossen'),
    category: text('Industrial AI', 'Industrielle KI'),
    title: text('Governed Quality AI', 'Governed Quality AI'),
    subtitle: text('A field study for quality workflows in industrial operations.', 'Eine Feldstudie für Qualitäts-Workflows in industriellen Abläufen.'),
    summary: text(
      'A research and solution study for Grote Industries Europe, focused on how governed AI agents can support quality work without hiding the evidence, the decision boundary, or the human owner.',
      'Eine Forschungs- und Lösungsstudie für Grote Industries Europe. Im Mittelpunkt steht die Frage, wie kontrollierte KI-Agenten Qualitätsarbeit unterstützen, ohne Nachweise, Entscheidungsspielräume oder menschliche Verantwortung zu verbergen.',
    ),
    finding: text(
      'In quality-critical workflows, acceleration only matters when every recommendation remains inspectable and every escalation has a clear owner.',
      'In qualitätskritischen Workflows zählt Beschleunigung nur dann, wenn jede Empfehlung prüfbar bleibt und jede Eskalation eine klare Verantwortung hat.',
    ),
    methods: [
      text('Workflow mapping from operational signal to reviewable quality action.', 'Workflow-Mapping vom operativen Signal zur prüfbaren Qualitätsaktion.'),
      text('Human-in-the-loop boundaries for exceptions and high-consequence decisions.', 'Human-in-the-loop-Grenzen für Ausnahmen und folgenreiche Entscheidungen.'),
      text('Governed AI agent patterns for industrial and manufacturing environments.', 'Muster für kontrollierte KI-Agenten in Industrie und Fertigung.'),
    ],
    tags: [text('Quality', 'Qualität'), text('Manufacturing', 'Fertigung'), text('Human approval', 'Menschliche Freigabe')],
  },
];

function getProject(slug?: string) {
  return researchProjects.find((project) => project.slug === slug);
}

function getResearchCanonical(slug?: string) {
  if (typeof window === 'undefined') return slug ? `https://research.clerktree.com/${slug}` : 'https://research.clerktree.com';
  const { hostname, origin } = window.location;
  if (hostname === 'research.clerktree.com') return slug ? `${origin}/${slug}` : origin;
  return slug ? `${origin}/research/${slug}` : `${origin}/research`;
}

function projectPath(slug: string, isResearchHost: boolean) {
  return isResearchHost ? `/${slug}` : `/research/${slug}`;
}

function ResearchHeader() {
  return (
    <header className="mx-4 mt-4 flex min-h-16 items-center justify-between rounded-full border border-black/10 bg-[#f4f1eb]/90 px-5 py-3 pr-20 backdrop-blur-md md:px-8 md:pr-32">
      <a href="https://clerktree.com" aria-label="ClerkTree home" className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        <ClerkTreeLogo markClassName="h-8 w-8" labelClassName="text-base font-semibold tracking-[-.04em]" registered />
      </a>
      <nav className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[.18em] text-black/55 md:flex" aria-label="Main navigation">
        <a className="transition-colors hover:text-[#ff4d00]" href="https://clerktree.com/solutions">Solutions</a>
        <a className="transition-colors hover:text-[#ff4d00]" href="https://clerktree.com/about">About</a>
        <a className="transition-colors hover:text-[#ff4d00]" href="https://clerktree.com/blog">Blog</a>
        <a className="transition-colors hover:text-[#ff4d00]" href="https://clerktree.com/contact">Contact</a>
      </nav>
    </header>
  );
}

function ResearchShell({ children }: { children: ReactNode }) {
  return (
    <div id="agero-works" className="agero-works min-h-screen overflow-x-hidden bg-[#f4f1eb] text-[#151515]">
      <div className="fixed right-5 top-5 z-50 flex h-14 min-w-[9rem] items-center justify-center rounded-full border border-black/10 bg-[#f4f1eb]/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,.18)] backdrop-blur-md md:right-8 md:top-8">
        <LanguageSwitcher isExpanded forceDark className="h-11 min-w-[7.5rem] rounded-full border-0 bg-[#252525] px-6 shadow-none" />
      </div>
      <ResearchHeader />
      <main className="relative z-10">{children}</main>
      <div className="relative z-10 mx-4 mb-4 overflow-hidden rounded-[2rem]"><Footer /></div>
    </div>
  );
}

function ProjectMeta({ project, language }: { project: ResearchProject; language: 'en' | 'de' }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50">
      <span className="text-[#ff4d00]">{project.number}</span>
      <span>{project.category[language]}</span>
      <span className="inline-flex items-center gap-2"><CircleDot className="h-3 w-3 text-[#ff4d00]" />{project.status[language]}</span>
    </div>
  );
}

function ResearchLanding({ isResearchHost }: { isResearchHost: boolean }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const featured = researchProjects[0];
  const copy = language === 'de';

  return (
    <>
      <SEO title={copy ? 'Forschung' : 'Research'} description={copy ? 'Abgeschlossene Forschungsarbeit von ClerkTree zu Agentensystemen, Operations Intelligence und souveräner KI.' : 'Completed ClerkTree research across agent systems, operations intelligence, and sovereign AI.'} canonical={getResearchCanonical()} />
      <ResearchShell>
        <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] bg-[#141414] px-6 pb-20 pt-20 text-[#f4f1eb] md:px-12 md:pb-28 md:pt-28">
          <div className="pointer-events-none absolute -right-24 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#ff4d00]/20 blur-3xl" />
          <div className="relative mx-auto max-w-[1440px]">
            <div className="mb-20 flex items-start justify-between gap-8">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/60"><FlaskConical className="h-4 w-4 text-[#ff4d00]" />ClerkTree / Research</div>
              <div className="hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/40 md:flex"><span className="h-2 w-2 rounded-full bg-[#ff4d00]" />{copy ? 'Öffentliches Archiv' : 'Public archive'}</div>
            </div>
            <div className="grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
              <div>
                <p className="mb-6 max-w-xl text-sm leading-6 text-white/50">{copy ? 'Forschung, die in die Arbeit zurückfließt.' : 'Research that feeds back into the work.'}</p>
                <h1 className="max-w-5xl text-6xl font-semibold leading-[.88] tracking-[-0.06em] md:text-8xl lg:text-[9.2rem]">{copy ? <>Systeme,<br /><span className="text-[#ff4d00]">die handeln.</span></> : <>Systems<br /><span className="text-[#ff4d00]">that act.</span></>}</h1>
              </div>
              <div className="max-w-md border-l border-white/20 pl-6 text-lg leading-8 text-white/65 md:text-xl lg:mt-[13rem]">{copy ? 'Eine offene Übersicht über ClerkTree-Arbeit zu verlässlichen Agenten, operativer Intelligenz und kontrollierter KI.' : 'An open record of ClerkTree work on reliable agents, operational intelligence, and governed AI.'}<div className="mt-8 flex gap-8 text-xs uppercase tracking-[0.2em] text-white/45"><span><strong className="mr-2 text-2xl font-normal text-white">04</strong>{copy ? 'Projekte' : 'Projects'}</span><span><strong className="mr-2 text-2xl font-normal text-white">01</strong>{copy ? 'Aktueller Fokus' : 'Current focus'}</span></div></div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d00]">01 / {copy ? 'Aktueller Fokus' : 'Current focus'}</p><h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{copy ? 'Die Leitfrage' : 'The leading question'}</h2></div><Sparkles className="hidden h-8 w-8 text-[#ff4d00] md:block" /></div>
            <button type="button" onClick={() => navigate(projectPath(featured.slug, isResearchHost))} className="group grid min-h-[32rem] w-full gap-10 rounded-[2rem] bg-white p-7 text-left shadow-[0_20px_60px_rgba(24,20,16,.08)] transition-transform duration-500 hover:-translate-y-1 md:p-12 lg:grid-cols-[.85fr_1.15fr]">
              <div className="flex min-h-[20rem] flex-col justify-between rounded-2xl bg-[#141414] p-7 text-white md:p-9"><ProjectMeta project={featured} language={language} /><div><span className="mb-5 block text-7xl font-semibold tracking-[-.08em] text-[#ff4d00]">J</span><p className="max-w-xs text-sm leading-6 text-white/55">{copy ? 'Wie bleibt ein Agent präzise, wenn die Welt um ihn herum nicht präzise ist?' : 'How does an agent stay precise when the world around it is not?'}</p></div></div>
              <div className="flex flex-col justify-center"><h3 className="max-w-2xl text-4xl font-semibold leading-[.95] tracking-[-.05em] md:text-6xl">{featured.subtitle[language]}</h3><p className="mt-7 max-w-xl text-base leading-7 text-black/60">{featured.summary[language]}</p><span className="mt-10 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#ff4d00]">{copy ? 'Projekt öffnen' : 'Open project'}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div>
            </button>
          </div>
        </section>

        <section className="border-t border-black/10 px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-[1440px]"><div className="mb-12 flex items-end justify-between"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d00]">02 / {copy ? 'Archiv' : 'Archive'}</p><h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{copy ? 'Abgeschlossene Arbeit' : 'Completed work'}</h2></div><span className="text-xs uppercase tracking-[.2em] text-black/40">{copy ? 'Alle Projekte' : 'All projects'} ↘</span></div>
            <div className="grid gap-4 md:grid-cols-3">{researchProjects.slice(1).map((project) => <button type="button" key={project.slug} onClick={() => navigate(projectPath(project.slug, isResearchHost))} className="group flex min-h-[24rem] flex-col justify-between rounded-[2rem] border border-black/10 bg-[#f4f1eb] p-7 text-left transition-colors hover:bg-white md:p-9"><ProjectMeta project={project} language={language} /><div><h3 className="max-w-sm text-3xl font-semibold leading-[.98] tracking-[-.05em]">{project.title[language]}</h3><p className="mt-5 text-sm leading-6 text-black/55">{project.subtitle[language]}</p><span className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff4d00]">{copy ? 'Mehr lesen' : 'Read more'}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></span></div></button>)}</div>
          </div>
        </section>

        <section className="mx-4 mb-4 rounded-[2rem] bg-[#ff4d00] px-6 py-16 md:px-12 md:py-24"><div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-10 md:flex-row md:items-end"><div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-black/55">03 / {copy ? 'Zusammenarbeit' : 'Collaboration'}</p><h2 className="max-w-3xl text-4xl font-semibold leading-[.92] tracking-[-.05em] md:text-6xl">{copy ? 'Ein gutes Forschungsprojekt endet mit einer besseren Entscheidung.' : 'Good research ends with a better decision.'}</h2></div><a href="mailto:team@erltkree" className="inline-flex shrink-0 items-center gap-3 border-b border-black pb-2 text-xs font-bold uppercase tracking-[.2em]">{copy ? 'Kontakt aufnehmen' : 'Start a conversation'}<ArrowUpRight className="h-4 w-4" /></a></div></section>
      </ResearchShell>
    </>
  );
}

function ResearchDetail({ project, isResearchHost }: { project: ResearchProject; isResearchHost: boolean }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'de';
  return <><SEO title={project.title[language]} description={project.summary[language]} canonical={getResearchCanonical(project.slug)} /><ResearchShell><article className="mx-4 mt-4 rounded-[2rem] bg-white px-6 pb-24 pt-16 md:px-12 md:pb-32 md:pt-24"><div className="mx-auto max-w-[1200px]"><button type="button" onClick={() => navigate(isResearchHost ? '/' : '/research')} className="mb-16 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-black/55 transition-colors hover:text-[#ff4d00]"><ArrowLeft className="h-4 w-4" />{copy ? 'Zurück zum Archiv' : 'Back to archive'}</button><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]"><aside><ProjectMeta project={project} language={language} /><div className="mt-14 hidden border-t border-black/10 pt-5 text-sm text-black/45 lg:block"><div className="mb-4 flex items-center gap-3"><BookOpen className="h-4 w-4 text-[#ff4d00]" />{copy ? 'Forschungsnotiz' : 'Research note'}</div><p className="max-w-xs leading-6">{copy ? 'Öffentliche Zusammenfassung der abgeschlossenen Arbeit.' : 'Public summary of the completed work.'}</p></div></aside><div><h1 className="max-w-5xl text-6xl font-semibold leading-[.88] tracking-[-.07em] md:text-8xl">{project.title[language]}</h1><p className="mt-9 max-w-3xl text-2xl leading-tight tracking-[-.03em] text-black/65 md:text-4xl">{project.subtitle[language]}</p><p className="mt-10 max-w-2xl text-base leading-8 text-black/60">{project.summary[language]}</p>{project.links && <div className="mt-10 flex flex-wrap gap-3">{project.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-white transition-colors hover:bg-[#ff4d00]">{link.label[language]}<ExternalLink className="h-3.5 w-3.5" /></a>)}</div>}</div></div><div className="my-20 grid gap-6 border-y border-black/10 py-12 md:grid-cols-[.8fr_1.2fr] md:py-16"><div className="flex items-start gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#ff4d00]"><GitBranch className="h-4 w-4" />{copy ? 'Was wir gelernt haben' : 'What we learned'}</div><p className="max-w-3xl text-3xl font-medium leading-tight tracking-[-.04em] md:text-5xl">{project.finding[language]}</p></div><div className="grid gap-10 md:grid-cols-[.8fr_1.2fr]"><div><p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-[#ff4d00]">{copy ? 'Methode' : 'Method'}</p><h2 className="text-3xl font-semibold tracking-[-.05em] md:text-4xl">{copy ? 'Wie wir gearbeitet haben' : 'How we worked'}</h2></div><div className="space-y-4">{project.methods.map((method) => <div key={method.en} className="flex gap-4 border-b border-black/10 pb-5 text-base leading-7 text-black/65"><Check className="mt-1 h-5 w-5 shrink-0 text-[#ff4d00]" />{method[language]}</div>)}</div></div><div className="mt-20 flex flex-wrap gap-3">{project.tags.map((tag) => <span key={tag.en} className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[.15em] text-black/55">{tag[language]}</span>)}</div></div></article></ResearchShell></>;
}

export default function Research() {
  const { topicSlug } = useParams<{ topicSlug?: string }>();
  const isResearchHost = typeof window !== 'undefined' && window.location.hostname === 'research.clerktree.com';
  const project = getProject(topicSlug);
  return project ? <ResearchDetail project={project} isResearchHost={isResearchHost} /> : <ResearchLanding isResearchHost={isResearchHost} />;
}
