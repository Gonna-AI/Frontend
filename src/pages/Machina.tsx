import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Check, Cpu, Radar, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { siGithub, siHuggingface } from 'simple-icons';

import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import { Footer } from '../components/Landing/SiteChrome';
import SEO from '../components/SEO';
import { useLanguage } from '../contexts/LanguageContext';
import { SimpleIcon } from '../dashboard/components/simple-icon';
import './Machina.css';
import { MEDIA_BASE_URL } from '../config/media';

const R2 = `${MEDIA_BASE_URL}/machina`;

type ModelCopy = { kind: string; description: string; metrics: string[] };

const models = [
  { number: '01', title: 'Machina Bearing Fault', image: 'machina7.jpg', href: 'https://huggingface.co/clerktree/machina-cwru-bearing-fault' },
  { number: '02', title: 'Machina RUL', image: 'machina5.jpg', href: 'https://huggingface.co/clerktree/machina-cmapss-rul' },
  { number: '03', title: 'Machina Quality', image: 'machina6.jpg', href: 'https://huggingface.co/clerktree/machina-ai4i-quality' },
  { number: '04', title: 'Machina Agent', image: 'machina3.jpg', href: 'https://huggingface.co/clerktree/machina-agent-mistral-7b-lora' },
];

const COPY = {
  en: {
    seoTitle: 'Machina — Machine Intelligence',
    seoDescription: "Machina is ClerkTree's open machine-intelligence model family: portable signal, vision and agent systems for governed industrial AI experimentation.",
    ogDescription: 'Open, portable machine intelligence for industrial signal, vision, and governed agent workflows.',
    navLabel: 'Machina navigation', navModels: 'Models', navApproach: 'Approach', navAccess: 'Access', hub: 'Model hub',
    heroA: 'Make every', heroB: 'machine signal', heroC: 'actionable.',
    lede: 'An open model family for understanding equipment signals, visual quality, and the operational context around them.',
    explore: 'Explore Machina', side1: 'CLERKTREE RESEARCH', side2: 'EUROPE / 2026', scroll: 'SCROLL TO ASCEND',
    whyLabel: 'WHY MACHINA',
    statementA: 'Industrial intelligence is not one giant model. It is a ', statementEm: 'clear chain', statementB: ' from a physical signal to a reviewable next move.',
    detail: 'Machina brings that chain together: specialized edge-ready predictors, a model-aware agent layer, and an explicit human decision boundary.',
    familyLabel: 'OPEN MODEL FAMILY', designedA: 'Designed for the ', designedEm: 'machine room.',
    familyIntro: 'Small, task-specific components for teams building their own governed machine-intelligence stack.',
    note: 'Benchmark metrics describe controlled evaluation, not a promise of field performance. Validate against your equipment, data, and safety case before operation.',
    resLabel: 'FROM RESEARCH TO INTEGRATION', resTitle: 'Choose the layer you need.',
    resBody: 'Start with a released task model, inspect the evaluation record, or use the open harness as the control plane for machine-aware agent workflows.',
    hubLabel: '01 / MODEL HUB', hubTitle: ['Weights, cards,', 'and evaluations.'], hubAlt: 'Aircraft ascending through a blue atmosphere',
    repoLabel: '02 / OPEN HARNESS', repoTitle: ['The orchestration', 'layer is visible.'], repoAlt: 'Bright point of light above an illuminated horizon',
    osLabel: 'OPERATING SYSTEM', osTitleA: 'Intelligence with an ', osTitleEm: 'evidence trail.', osAlt: 'Aircraft in high-altitude flight',
    principles: [
      ['Signals stay legible', 'Every prediction should preserve the source signal, confidence, and route to review.'],
      ['Models stay portable', 'Small, inspectable formats make edge experiments and controlled deployment practical.'],
      ['Actions stay governed', 'Machina recommends and orchestrates; humans remain the decision owner.'],
    ],
    line: ['OBSERVE', 'INTERPRET', 'VERIFY', 'ACT'],
    accessLabel: 'BUILD WITH MACHINA', accessTitle: 'Take the controls.',
    accessBody: 'Explore the released weights, evaluation notes, and machine-intelligence experiments on the ClerkTree model hub.',
    visitHub: 'Visit the model hub', harness: 'Explore the open harness', accessAlt: 'Jet climbing above a glowing horizon',
    models: [
      { kind: 'Signal classifier', description: 'A compact vibration classifier for bearing-health experiments and condition-monitoring pipelines.', metrics: ['CWRU benchmark', 'Macro-F1 0.9844', 'ONNX-ready'] },
      { kind: 'Remaining useful life', description: 'A regression baseline for estimating degradation trajectories from time-series sensor signals.', metrics: ['NASA CMAPSS', 'ONNX-ready', 'Edge baseline'] },
      { kind: 'Vision inference', description: 'A compact image-classification foundation for controlled quality-inspection experiments.', metrics: ['Image pipeline', 'ONNX-ready', 'Human review'] },
      { kind: 'Industrial reasoning', description: 'A Mistral-based instruction adapter for evidence-grounded diagnosis, tool selection, and operator handoff.', metrics: ['Tool-aware', 'Adapter weights', 'Review first'] },
    ] as ModelCopy[],
  },
  de: {
    seoTitle: 'Machina — Maschinenintelligenz',
    seoDescription: 'Machina ist die offene Modellfamilie von ClerkTree für Maschinenintelligenz: portable Signal-, Bild- und Agentensysteme für kontrollierte Experimente mit industrieller KI.',
    ogDescription: 'Offene, portable Maschinenintelligenz für Industriesignale, Bildverarbeitung und kontrollierte Agenten-Workflows.',
    navLabel: 'Machina-Navigation', navModels: 'Modelle', navApproach: 'Ansatz', navAccess: 'Zugang', hub: 'Modell-Hub',
    heroA: 'Jedes', heroB: 'Maschinensignal', heroC: 'nutzbar machen.',
    lede: 'Eine offene Modellfamilie, die Maschinensignale, visuelle Qualität und den betrieblichen Kontext dazu verständlich macht.',
    explore: 'Machina entdecken', side1: 'CLERKTREE FORSCHUNG', side2: 'EUROPA / 2026', scroll: 'ZUM AUFSTEIGEN SCROLLEN',
    whyLabel: 'WARUM MACHINA',
    statementA: 'Industrielle Intelligenz ist kein einzelnes Riesenmodell. Sie ist eine ', statementEm: 'klare Kette', statementB: ' vom physikalischen Signal bis zum prüfbaren nächsten Schritt.',
    detail: 'Machina bringt diese Kette zusammen: spezialisierte, edge-fähige Prädiktoren, eine modellbewusste Agentenschicht und eine ausdrückliche Grenze für menschliche Entscheidungen.',
    familyLabel: 'OFFENE MODELLFAMILIE', designedA: 'Gebaut für den ', designedEm: 'Maschinenraum.',
    familyIntro: 'Kleine, aufgabenspezifische Bausteine für Teams, die ihren eigenen kontrollierten Machine-Intelligence-Stack aufbauen.',
    note: 'Benchmark-Kennzahlen beschreiben kontrollierte Auswertungen, kein Leistungsversprechen im Feld. Prüfen Sie gegen Ihre Anlagen, Daten und Ihr Sicherheitskonzept, bevor Sie in Betrieb gehen.',
    resLabel: 'VON DER FORSCHUNG ZUR INTEGRATION', resTitle: 'Wählen Sie die Schicht, die Sie brauchen.',
    resBody: 'Starten Sie mit einem veröffentlichten Aufgabenmodell, prüfen Sie die Auswertung oder nutzen Sie das offene Harness als Steuerungsebene für maschinenbewusste Agenten-Workflows.',
    hubLabel: '01 / MODELL-HUB', hubTitle: ['Gewichte, Karten', 'und Auswertungen.'], hubAlt: 'Flugzeug steigt durch eine blaue Atmosphäre',
    repoLabel: '02 / OFFENES HARNESS', repoTitle: ['Die Orchestrierung', 'ist einsehbar.'], repoAlt: 'Heller Lichtpunkt über einem erleuchteten Horizont',
    osLabel: 'BETRIEBSSYSTEM', osTitleA: 'Intelligenz mit ', osTitleEm: 'Belegspur.', osAlt: 'Flugzeug im Höhenflug',
    principles: [
      ['Signale bleiben lesbar', 'Jede Vorhersage soll das Quellsignal, die Konfidenz und den Weg zur Prüfung erhalten.'],
      ['Modelle bleiben portabel', 'Kleine, prüfbare Formate machen Edge-Experimente und kontrollierte Einführung praktikabel.'],
      ['Aktionen bleiben gesteuert', 'Machina empfiehlt und orchestriert; der Mensch bleibt Entscheider.'],
    ],
    line: ['BEOBACHTEN', 'DEUTEN', 'PRÜFEN', 'HANDELN'],
    accessLabel: 'BAUEN SIE MIT MACHINA', accessTitle: 'Übernehmen Sie die Steuerung.',
    accessBody: 'Entdecken Sie veröffentlichte Gewichte, Auswertungsnotizen und Machine-Intelligence-Experimente im ClerkTree Modell-Hub.',
    visitHub: 'Zum Modell-Hub', harness: 'Das offene Harness erkunden', accessAlt: 'Düsenjet steigt über einem leuchtenden Horizont',
    models: [
      { kind: 'Signalklassifikator', description: 'Ein kompakter Schwingungsklassifikator für Experimente zur Lagerzustandsüberwachung und Condition-Monitoring-Pipelines.', metrics: ['CWRU-Benchmark', 'Macro-F1 0,9844', 'ONNX-ready'] },
      { kind: 'Restnutzungsdauer', description: 'Eine Regressions-Baseline zur Schätzung von Degradationsverläufen aus Zeitreihen-Sensorsignalen.', metrics: ['NASA CMAPSS', 'ONNX-ready', 'Edge-Baseline'] },
      { kind: 'Bildinferenz', description: 'Eine kompakte Bildklassifikations-Grundlage für kontrollierte Experimente zur Qualitätsprüfung.', metrics: ['Bild-Pipeline', 'ONNX-ready', 'Menschliche Prüfung'] },
      { kind: 'Industrielles Schlussfolgern', description: 'Ein Mistral-basierter Instruktions-Adapter für belegbasierte Diagnose, Werkzeugauswahl und Übergabe an Bediener.', metrics: ['Werkzeugbewusst', 'Adapter-Gewichte', 'Erst prüfen'] },
    ] as ModelCopy[],
  },
} as const;

export default function Machina() {
  const { language } = useLanguage();
  const c = COPY[language === 'de' ? 'de' : 'en'];
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth > 850);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 851px)');
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });
  const flightY = useTransform(
    scrollYProgress,
    [0, 0.38, 0.84, 1],
    reducedMotion ? ['0%', '0%', '0%', '0%'] : isDesktop ? ['4%', '1%', '-8%', '-10%'] : ['4%', '2%', '-7%', '-9%'],
  );
  const flightScale = useTransform(
    scrollYProgress,
    [0, 0.42, 0.84, 1],
    reducedMotion ? [1, 1, 1, 1] : isDesktop ? [1, 1.01, 1.035, 1.045] : [1.01, 1.025, 1.055, 1.065],
  );
  const titleY = useTransform(scrollYProgress, [0, 0.58, 0.94], reducedMotion ? [0, 0, 0] : [0, -18, -48]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.58, 0.94, 1], [1, 1, 0.18, 0]);

  return (
    <div className="machina-page">
      <SEO
        title={c.seoTitle}
        description={c.seoDescription}
        canonical="https://clerktree.com/machina"
        openGraph={{
          title: c.seoTitle,
          description: c.ogDescription,
          image: `${R2}/machina8.jpg`,
          url: 'https://clerktree.com/machina',
        }}
      />

      <header className="machina-nav">
        <a className="machina-brand" href="/" aria-label={language === 'de' ? 'ClerkTree Startseite' : 'ClerkTree home'}>
          <ClerkTreeLogo markClassName="machina-brand__mark" labelClassName="machina-brand__sr" />
          <span className="machina-brand__wordmark">CLERKTREE</span>
          <i />
          <span>MACHINA</span>
        </a>
        <nav aria-label={c.navLabel}>
          <a href="#model-family">{c.navModels}</a>
          <a href="#operating-system">{c.navApproach}</a>
          <a href="#access">{c.navAccess}</a>
        </nav>
        <a className="machina-nav__link" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">
          <SimpleIcon icon={siHuggingface} className="machina-brand-icon" /> {c.hub} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <main>
        <section className="machina-hero" ref={heroRef}>
          <div className="machina-hero__sticky">
            <div className="machina-hero__background" aria-hidden="true">
              <motion.img className="machina-hero__background-media" src={`${R2}/machina8.jpg`} alt="" style={{ y: flightY, scale: flightScale }} />
            </div>
            <div className="machina-hero__grid" aria-hidden="true" />
            <div className="machina-hero__radar" aria-hidden="true" />
            <motion.div className="machina-hero__copy" style={{ y: titleY, opacity: titleOpacity }}>
              <h1>{c.heroA}<br /><em>{c.heroB}</em><br />{c.heroC}</h1>
              <p className="machina-hero__lede">
                {c.lede}
              </p>
              <a className="machina-button" href="#model-family">{c.explore} <ArrowDown size={16} aria-hidden="true" /></a>
            </motion.div>

            <div className="machina-hero__sidecopy">
              <span>{c.side1}</span>
              <span>{c.side2}</span>
            </div>
            <p className="machina-hero__scroll">{c.scroll} <ArrowDown size={14} aria-hidden="true" /></p>
          </div>
        </section>

        <section className="machina-intro">
          <p className="machina-section-label">{c.whyLabel}</p>
          <div>
            <p className="machina-intro__statement">
              {c.statementA}<em>{c.statementEm}</em>{c.statementB}
            </p>
            <p className="machina-intro__detail">
              {c.detail}
            </p>
          </div>
        </section>

        <section className="machina-models" id="model-family">
          <div className="machina-models__header">
            <div>
              <p className="machina-section-label">{c.familyLabel}</p>
              <h2>{c.designedA}<em>{c.designedEm}</em></h2>
            </div>
            <p>{c.familyIntro}</p>
          </div>
          <div className="machina-model-grid">
            {models.map((model, index) => {
              const copy = c.models[index];
              return (
              <a className="machina-model-card" href={model.href} target="_blank" rel="noreferrer" key={model.title}>
                <img className="machina-model-card__image" src={`${R2}/${model.image}`} alt="" loading="lazy" />
                <span className="machina-model-card__shade" aria-hidden="true" />
                <div className="machina-model-card__top"><span>{model.number}</span><ArrowUpRight size={20} aria-hidden="true" /></div>
                <p className="machina-model-card__kind">{copy.kind}</p>
                <h3>{model.title}</h3>
                <p className="machina-model-card__description">{copy.description}</p>
                <ul>
                  {copy.metrics.map((metric) => <li key={metric}><Check size={13} aria-hidden="true" /> {metric}</li>)}
                </ul>
              </a>
              );
            })}
          </div>
          <p className="machina-models__note">{c.note}</p>
        </section>

        <section className="machina-resources">
          <div className="machina-resources__intro">
            <p className="machina-section-label">{c.resLabel}</p>
            <h2>{c.resTitle}</h2>
            <p>{c.resBody}</p>
          </div>
          <div className="machina-resource-grid">
            <a className="machina-resource machina-resource--hub" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">
              <img src={`${R2}/machina.jpg`} alt={c.hubAlt} loading="lazy" />
              <span className="machina-resource__shade" aria-hidden="true" />
              <div><p>{c.hubLabel}</p><h3>{c.hubTitle[0]}<br />{c.hubTitle[1]}</h3><span><SimpleIcon icon={siHuggingface} className="machina-resource__icon" /> Hugging Face <ArrowUpRight size={16} aria-hidden="true" /></span></div>
            </a>
            <a className="machina-resource machina-resource--repo" href="https://github.com/Clerktree/machina-intelligence" target="_blank" rel="noreferrer">
              <img src={`${R2}/machina4.jpg`} alt={c.repoAlt} loading="lazy" />
              <span className="machina-resource__shade" aria-hidden="true" />
              <div><p>{c.repoLabel}</p><h3>{c.repoTitle[0]}<br />{c.repoTitle[1]}</h3><span><SimpleIcon icon={siGithub} className="machina-resource__icon" /> GitHub <ArrowUpRight size={16} aria-hidden="true" /></span></div>
            </a>
          </div>
        </section>

        <section className="machina-architecture" id="operating-system">
          <div className="machina-architecture__art">
            <img src={`${R2}/machina2.jpg`} alt={c.osAlt} loading="lazy" />
            <div className="machina-architecture__reticle" aria-hidden="true"><span /><span /></div>
          </div>
          <div className="machina-architecture__copy">
            <p className="machina-section-label">{c.osLabel}</p>
            <h2>{c.osTitleA}<em>{c.osTitleEm}</em></h2>
            <div className="machina-principles">
              {c.principles.map(([title, body], index) => {
                const Icon = [Radar, Cpu, ShieldCheck][index];
                return (
                  <article key={title}>
                    <Icon size={19} aria-hidden="true" />
                    <div><h3>{title}</h3><p>{body}</p></div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="machina-data-line">
          <span>{c.line[0]}</span><i /><span>{c.line[1]}</span><i /><span>{c.line[2]}</span><i /><span>{c.line[3]}</span>
        </section>

        <section className="machina-access" id="access">
          <div className="machina-access__image"><img src={`${R2}/machina1.jpg`} alt={c.accessAlt} loading="lazy" /></div>
          <div className="machina-access__content">
            <p className="machina-section-label">{c.accessLabel}</p>
            <h2>{c.accessTitle}</h2>
            <p>{c.accessBody}</p>
            <a className="machina-button machina-button--light" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer"><SimpleIcon icon={siHuggingface} className="machina-button__icon" /> {c.visitHub} <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a className="machina-access__repo" href="https://github.com/Clerktree/machina-intelligence" target="_blank" rel="noreferrer"><SimpleIcon icon={siGithub} className="machina-access__icon" /> {c.harness}</a>
          </div>
        </section>
      </main>

      <div className="machina-company-footer site-display-font">
        <img className="machina-company-footer__image" src={`${R2}/machina4.jpg`} alt="" loading="lazy" />
        <span className="machina-company-footer__shade" aria-hidden="true" />
        <Footer />
      </div>
    </div>
  );
}
