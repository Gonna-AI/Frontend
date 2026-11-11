import type { ReactNode } from 'react';

import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Header, Footer } from '../components/Landing/SiteChrome';
import Grainient from '../components/Brand/Grainient';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import './LandingFramer.css';
import './Research.css';


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

const RESEARCH_ORIGIN = 'https://research.clerktree.com';

function getResearchCanonical(slug?: string) {
  return slug ? `${RESEARCH_ORIGIN}/${slug}` : RESEARCH_ORIGIN;
}

function ResearchShell({ children, hero }: { children: ReactNode; hero: ReactNode }) {
  return (
    <div id="ct-works" className="ct-works rs-page">
      <div className="ct-top-area ct-top-area-with-hero">
        <Header linkBase="https://clerktree.com" />
        {hero}
      </div>
      <main>{children}</main>
      <Footer linkBase="https://clerktree.com" />
    </div>
  );
}

function ResearchLanding() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const featured = researchProjects[0];
  const archive = researchProjects.slice(1);
  const copy = language === 'de';
  const open = (slug: string) => navigate(`/${slug}`);

  return (
    <>
      <SEO title={copy ? 'Forschung' : 'Research'} description={copy ? 'Abgeschlossene Forschungsarbeit von ClerkTree zu Agentensystemen, Operations Intelligence und souveräner KI.' : 'Completed ClerkTree research across agent systems, operations intelligence, and sovereign AI.'} canonical={getResearchCanonical()} />
      <ResearchShell
        hero={
          <section className="ct-hero-stage rs-hero" aria-labelledby="research-title">
            <Grainient preset="silver" />
            <div className="rs-hero-inner">
              <p className="rs-hero-label">{copy ? 'ClerkTree Forschung' : 'ClerkTree Research'}</p>
              <h1 id="research-title">
                {copy ? <>Systeme, <span>die handeln.</span></> : <>Systems <span>that act.</span></>}
              </h1>
              <div className="rs-hero-foot">
                <p>{copy ? 'Eine offene Übersicht über unsere Arbeit an verlässlichen Agenten, operativer Intelligenz und kontrollierter KI.' : 'An open record of our work on reliable agents, operational intelligence, and governed AI.'}</p>
                <dl className="rs-hero-stats">
                  <div><dt>{copy ? 'Projekte' : 'Projects'}</dt><dd>{String(researchProjects.length).padStart(2, '0')}</dd></div>
                  <div><dt>{copy ? 'Aktueller Fokus' : 'Current focus'}</dt><dd>{featured.title[language]}</dd></div>
                  <div>
                    <dt>{copy ? 'Modelle' : 'Models'}</dt>
                    <dd><a href="https://huggingface.co/clerktree" target="_blank" rel="noopener noreferrer">Hugging Face<ArrowUpRight aria-hidden="true" /></a></dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>
        }
      >
        <section className="rs-band" aria-labelledby="rs-focus-title">
          <div className="rs-split">
            <header className="rs-section-head">
              <p className="rs-index">01</p>
              <h2 id="rs-focus-title">{copy ? 'Aktueller Fokus' : 'Current focus'}</h2>
              <p>{copy ? 'Die Frage, an der wir gerade arbeiten.' : 'The question we are working on right now.'}</p>
            </header>

            <button type="button" className="rs-feature" onClick={() => open(featured.slug)}>
              <span className="rs-feature-meta">
                <span>{featured.title[language]}</span>
                <span>{featured.category[language]}</span>
                <span className="rs-status is-live">{featured.status[language]}</span>
              </span>
              <span className="rs-feature-quote">
                {copy ? '„Wie bleibt ein Agent präzise, wenn die Welt um ihn herum nicht präzise ist?“' : '“How does an agent stay precise when the world around it is not?”'}
              </span>
              <span className="rs-feature-body">
                <span className="rs-feature-subtitle">{featured.subtitle[language]}</span>
                <span className="rs-feature-summary">{featured.summary[language]}</span>
              </span>
              <span className="rs-link">{copy ? 'Projekt lesen' : 'Read the project'}<ArrowUpRight aria-hidden="true" /></span>
            </button>
          </div>
        </section>

        <section className="rs-band" aria-labelledby="rs-archive-title">
          <div className="rs-split">
            <header className="rs-section-head">
              <p className="rs-index">02</p>
              <h2 id="rs-archive-title">{copy ? 'Abgeschlossene Arbeit' : 'Completed work'}</h2>
              <p>{copy ? 'Veröffentlichte Ergebnisse, jeweils mit dem, was wir gelernt haben.' : 'Published results, each with what we learned.'}</p>
            </header>

            <ol className="rs-list">
              {archive.map((project) => (
                <li key={project.slug}>
                  <button type="button" className="rs-row" onClick={() => open(project.slug)}>
                    <span className="rs-row-num">{project.number}</span>
                    <span className="rs-row-main">
                      <span className="rs-row-title">{project.title[language]}</span>
                      <span className="rs-row-sub">{project.subtitle[language]}</span>
                    </span>
                    <span className="rs-row-cat">{project.category[language]}</span>
                    <ArrowUpRight className="rs-row-arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rs-cta" aria-labelledby="rs-cta-title">
          <div className="rs-cta-inner">
            <h2 id="rs-cta-title">{copy ? 'Ein gutes Forschungsprojekt endet mit einer besseren Entscheidung.' : 'Good research ends with a better decision.'}</h2>
            <a className="rs-cta-button" href="mailto:team@clerktree.com">
              {copy ? 'Mit uns forschen' : 'Research with us'}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>
      </ResearchShell>
    </>
  );
}

function ResearchDetail({ project }: { project: ResearchProject }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const copy = language === 'de';

  return (
    <>
      <SEO title={project.title[language]} description={project.summary[language]} canonical={getResearchCanonical(project.slug)} />
      <ResearchShell
        hero={
          <section className="ct-hero-stage ct-page-hero" aria-labelledby="research-project-title">
            <Grainient preset="silver" />
            <div className="ct-hero-stage-content">
              <p className="ct-page-hero-eyebrow">{project.number} · {project.category[language]}</p>
              <h1 id="research-project-title">{project.title[language]}</h1>
              <p>{project.subtitle[language]}</p>
            </div>
          </section>
        }
      >
        <article className="rs-band">
          <div className="rs-split">
            <aside className="rs-aside">
              <button type="button" className="rs-back" onClick={() => navigate('/')}>
                <ArrowLeft aria-hidden="true" />
                {copy ? 'Alle Forschung' : 'All research'}
              </button>
              <dl className="rs-facts">
                <div><dt>{copy ? 'Status' : 'Status'}</dt><dd><span className={`rs-status${project.number === '01' ? ' is-live' : ''}`}>{project.status[language]}</span></dd></div>
                <div><dt>{copy ? 'Bereich' : 'Area'}</dt><dd>{project.category[language]}</dd></div>
                <div><dt>{copy ? 'Themen' : 'Topics'}</dt><dd>{project.tags.map((tag) => tag[language]).join(', ')}</dd></div>
              </dl>
            </aside>

            <div className="rs-article">
              <p className="rs-lead">{project.summary[language]}</p>
              {project.links && (
                <div className="rs-links">
                  {project.links.map((link) => (
                    <a key={link.href} className="rs-link" href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label[language]}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}

              <figure className="rs-finding">
                <figcaption>{copy ? 'Was wir gelernt haben' : 'What we learned'}</figcaption>
                <blockquote>{project.finding[language]}</blockquote>
              </figure>

              <h2 className="rs-subhead">{copy ? 'Wie wir gearbeitet haben' : 'How we worked'}</h2>
              <ol className="rs-method">
                {project.methods.map((method, index) => (
                  <li key={method.en}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <p>{method[language]}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </article>
      </ResearchShell>
    </>
  );
}

export default function Research() {
  const { topicSlug } = useParams<{ topicSlug?: string }>();
  const project = getProject(topicSlug);
  return project ? <ResearchDetail project={project} /> : <ResearchLanding />;
}
