import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Check, Cpu, Database, Radar, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';

import SEO from '../components/SEO';
import './Machina.css';

const R2 = 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/machina';

const gallery = [
  { name: 'machina.jpg', alt: 'Aircraft rising through a deep-blue atmosphere', className: 'machina-gallery__image--one' },
  { name: 'machina1.jpg', alt: 'A jet climbing above a glowing horizon', className: 'machina-gallery__image--two' },
  { name: 'machina2.jpg', alt: 'High-altitude aircraft in flight', className: 'machina-gallery__image--three' },
  { name: 'machina3.jpg', alt: 'Aircraft silhouette crossing blue sky', className: 'machina-gallery__image--four' },
  { name: 'machina4.jpg', alt: 'Star above a luminous industrial horizon', className: 'machina-gallery__image--five' },
  { name: 'machina5.jpg', alt: 'Machine intelligence visual system', className: 'machina-gallery__image--six' },
  { name: 'machina6.jpg', alt: 'Flight path over a blue atmosphere', className: 'machina-gallery__image--seven' },
  { name: 'machina7.jpg', alt: 'Jet telemetry and flight path traces', className: 'machina-gallery__image--eight' },
];

const models = [
  {
    number: '01',
    title: 'Machina Bearing Fault',
    kind: 'Signal classifier',
    description: 'A compact vibration classifier for bearing-health experiments and condition-monitoring pipelines.',
    metrics: ['CWRU benchmark', 'Macro-F1 0.9844', 'ONNX-ready'],
    href: 'https://huggingface.co/clerktree/machina-bearing-fault-onnx',
  },
  {
    number: '02',
    title: 'Machina RUL',
    kind: 'Remaining useful life',
    description: 'A regression baseline for estimating degradation trajectories from time-series sensor signals.',
    metrics: ['NASA CMAPSS', 'ONNX-ready', 'Edge baseline'],
    href: 'https://huggingface.co/clerktree/machina-rul-onnx',
  },
  {
    number: '03',
    title: 'Machina Quality',
    kind: 'Vision inference',
    description: 'A compact image-classification foundation for controlled quality-inspection experiments.',
    metrics: ['Image pipeline', 'ONNX-ready', 'Human review'],
    href: 'https://huggingface.co/clerktree/machina-quality-onnx',
  },
  {
    number: '04',
    title: 'Machina Agent',
    kind: 'Industrial reasoning',
    description: 'A Mistral-based instruction adapter for evidence-grounded diagnosis, tool selection, and operator handoff.',
    metrics: ['Tool-aware', 'Adapter weights', 'Review first'],
    href: 'https://huggingface.co/clerktree/machina-agent-mistral-7b',
  },
];

const principles = [
  ['Signals stay legible', 'Every prediction should preserve the source signal, confidence, and route to review.'],
  ['Models stay portable', 'Small, inspectable formats make edge experiments and controlled deployment practical.'],
  ['Actions stay governed', 'Machina recommends and orchestrates; humans remain the decision owner.'],
];

export default function Machina() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });
  const flightY = useTransform(scrollYProgress, [0, 0.75, 1], reducedMotion ? [0, 0, 0] : ['22vh', '-25vh', '-38vh']);
  const flightScale = useTransform(scrollYProgress, [0, 0.7, 1], reducedMotion ? [1, 1, 1] : [0.82, 1.08, 1.2]);
  const flightRotate = useTransform(scrollYProgress, [0, 1], reducedMotion ? [0, 0] : [-4, 3]);
  const titleY = useTransform(scrollYProgress, [0, 0.55], reducedMotion ? [0, 0] : [0, -70]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5, 0.75], [1, 1, 0]);

  return (
    <div className="machina-page">
      <SEO
        title="Machina — Machine Intelligence"
        description="Machina is ClerkTree's open machine-intelligence model family: portable signal, vision and agent systems for governed industrial AI experimentation."
        canonical="https://clerktree.com/machina"
        openGraph={{
          title: 'Machina — Machine Intelligence',
          description: 'Open, portable machine intelligence for industrial signal, vision, and governed agent workflows.',
          image: `${R2}/machina8.jpg`,
          url: 'https://clerktree.com/machina',
        }}
      />

      <header className="machina-nav">
        <a className="machina-brand" href="/" aria-label="ClerkTree home">
          <span>CLERKTREE</span>
          <i />
          <span>MACHINA</span>
        </a>
        <nav aria-label="Machina navigation">
          <a href="#model-family">Models</a>
          <a href="#operating-system">Approach</a>
          <a href="#access">Access</a>
        </nav>
        <a className="machina-nav__link" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">
          Model hub <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </header>

      <main>
        <section className="machina-hero" ref={heroRef}>
          <div className="machina-hero__sticky">
            <div className="machina-hero__grid" aria-hidden="true" />
            <div className="machina-hero__radar" aria-hidden="true" />
            <motion.div className="machina-hero__copy" style={{ y: titleY, opacity: titleOpacity }}>
              <p className="machina-eyebrow"><span /> MACHINE INTELLIGENCE / 01</p>
              <h1>Make every<br /><em>machine signal</em><br />actionable.</h1>
              <p className="machina-hero__lede">
                An open model family for understanding equipment signals, visual quality, and the operational context around them.
              </p>
              <a className="machina-button" href="#model-family">Explore Machina <ArrowDown size={16} aria-hidden="true" /></a>
            </motion.div>

            <motion.figure className="machina-flight" style={{ y: flightY, scale: flightScale, rotate: flightRotate }}>
              <img src={`${R2}/machina8.jpg`} alt="Jet rising through a vivid blue sky" />
              <figcaption>FLIGHT PATH / SIGNAL → UNDERSTANDING → ACTION</figcaption>
            </motion.figure>

            <div className="machina-hero__sidecopy">
              <span>CLERKTREE RESEARCH</span>
              <span>EUROPE / 2026</span>
            </div>
            <p className="machina-hero__scroll">SCROLL TO ASCEND <ArrowDown size={14} aria-hidden="true" /></p>
          </div>
        </section>

        <section className="machina-intro">
          <p className="machina-section-label">WHY MACHINA</p>
          <div>
            <p className="machina-intro__statement">
              Industrial intelligence is not one giant model. It is a <em>clear chain</em> from a physical signal to a reviewable next move.
            </p>
            <p className="machina-intro__detail">
              Machina brings that chain together: specialized edge-ready predictors, a model-aware agent layer, and an explicit human decision boundary.
            </p>
          </div>
        </section>

        <section className="machina-gallery" aria-label="Machina visual field">
          <div className="machina-gallery__heading">
            <p className="machina-section-label">THE SIGNAL FIELD</p>
            <p>Different sensors. One operational picture.</p>
          </div>
          <div className="machina-gallery__stage">
            {gallery.map((image, index) => (
              <motion.figure
                className={`machina-gallery__image ${image.className}`}
                key={image.name}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 46, rotate: reducedMotion ? 0 : index % 2 ? 3 : -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.7, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={`${R2}/${image.name}`} alt={image.alt} loading="lazy" />
              </motion.figure>
            ))}
            <div className="machina-gallery__line machina-gallery__line--one" aria-hidden="true" />
            <div className="machina-gallery__line machina-gallery__line--two" aria-hidden="true" />
            <span className="machina-gallery__coordinate machina-gallery__coordinate--one">48.1351° N</span>
            <span className="machina-gallery__coordinate machina-gallery__coordinate--two">11.5820° E</span>
          </div>
        </section>

        <section className="machina-models" id="model-family">
          <div className="machina-models__header">
            <div>
              <p className="machina-section-label">OPEN MODEL FAMILY</p>
              <h2>Designed for the <em>machine room.</em></h2>
            </div>
            <p>Small, task-specific components for teams building their own governed machine-intelligence stack.</p>
          </div>
          <div className="machina-model-grid">
            {models.map((model) => (
              <a className="machina-model-card" href={model.href} target="_blank" rel="noreferrer" key={model.title}>
                <div className="machina-model-card__top"><span>{model.number}</span><ArrowUpRight size={20} aria-hidden="true" /></div>
                <p className="machina-model-card__kind">{model.kind}</p>
                <h3>{model.title}</h3>
                <p className="machina-model-card__description">{model.description}</p>
                <ul>
                  {model.metrics.map((metric) => <li key={metric}><Check size={13} aria-hidden="true" /> {metric}</li>)}
                </ul>
              </a>
            ))}
          </div>
          <p className="machina-models__note">Benchmark metrics describe controlled evaluation, not a promise of field performance. Validate against your equipment, data, and safety case before operation.</p>
        </section>

        <section className="machina-architecture" id="operating-system">
          <div className="machina-architecture__art">
            <img src={`${R2}/machina7.jpg`} alt="Aircraft telemetry display with coloured flight paths" loading="lazy" />
            <div className="machina-architecture__reticle" aria-hidden="true"><span /><span /></div>
          </div>
          <div className="machina-architecture__copy">
            <p className="machina-section-label">OPERATING SYSTEM</p>
            <h2>Intelligence with an <em>evidence trail.</em></h2>
            <div className="machina-principles">
              {principles.map(([title, body], index) => {
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
          <span>OBSERVE</span><i /><span>INTERPRET</span><i /><span>VERIFY</span><i /><span>ACT</span>
        </section>

        <section className="machina-access" id="access">
          <div className="machina-access__image"><img src={`${R2}/machina4.jpg`} alt="Luminous star above a city-like field of light" loading="lazy" /></div>
          <div className="machina-access__content">
            <p className="machina-section-label">BUILD WITH MACHINA</p>
            <h2>Take the controls.</h2>
            <p>Explore the released weights, evaluation notes, and machine-intelligence experiments on the ClerkTree model hub.</p>
            <a className="machina-button machina-button--light" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">Visit the model hub <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a className="machina-access__repo" href="https://github.com/Clerktree/machina-intelligence" target="_blank" rel="noreferrer"><Database size={15} aria-hidden="true" /> Explore the open harness</a>
          </div>
        </section>
      </main>

      <footer className="machina-footer">
        <a className="machina-brand" href="/"><span>CLERKTREE</span><i /><span>MACHINA</span></a>
        <p>Machine intelligence for a world that must remain understandable.</p>
        <span>© {new Date().getFullYear()} CLERKTREE</span>
      </footer>
    </div>
  );
}
