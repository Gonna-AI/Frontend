import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Check, Cpu, Radar, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { siGithub, siHuggingface } from 'simple-icons';

import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import { Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import { SimpleIcon } from '../dashboard/components/simple-icon';
import './Machina.css';

const R2 = 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/machina';

const models = [
  {
    number: '01',
    title: 'Machina Bearing Fault',
    kind: 'Signal classifier',
    description: 'A compact vibration classifier for bearing-health experiments and condition-monitoring pipelines.',
    metrics: ['CWRU benchmark', 'Macro-F1 0.9844', 'ONNX-ready'],
    image: 'machina7.jpg',
    href: 'https://huggingface.co/clerktree/machina-bearing-fault-onnx',
  },
  {
    number: '02',
    title: 'Machina RUL',
    kind: 'Remaining useful life',
    description: 'A regression baseline for estimating degradation trajectories from time-series sensor signals.',
    metrics: ['NASA CMAPSS', 'ONNX-ready', 'Edge baseline'],
    image: 'machina5.jpg',
    href: 'https://huggingface.co/clerktree/machina-rul-onnx',
  },
  {
    number: '03',
    title: 'Machina Quality',
    kind: 'Vision inference',
    description: 'A compact image-classification foundation for controlled quality-inspection experiments.',
    metrics: ['Image pipeline', 'ONNX-ready', 'Human review'],
    image: 'machina6.jpg',
    href: 'https://huggingface.co/clerktree/machina-quality-onnx',
  },
  {
    number: '04',
    title: 'Machina Agent',
    kind: 'Industrial reasoning',
    description: 'A Mistral-based instruction adapter for evidence-grounded diagnosis, tool selection, and operator handoff.',
    metrics: ['Tool-aware', 'Adapter weights', 'Review first'],
    image: 'machina3.jpg',
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
          <ClerkTreeLogo markClassName="machina-brand__mark" labelClassName="machina-brand__sr" />
          <span className="machina-brand__wordmark">CLERKTREE</span>
          <i />
          <span>MACHINA</span>
        </a>
        <nav aria-label="Machina navigation">
          <a href="#model-family">Models</a>
          <a href="#operating-system">Approach</a>
          <a href="#access">Access</a>
        </nav>
        <a className="machina-nav__link" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">
          <SimpleIcon icon={siHuggingface} className="machina-brand-icon" /> Model hub <ArrowUpRight size={15} aria-hidden="true" />
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
              <p className="machina-eyebrow"><span /> MACHINE INTELLIGENCE / 01</p>
              <h1>Make every<br /><em>machine signal</em><br />actionable.</h1>
              <p className="machina-hero__lede">
                An open model family for understanding equipment signals, visual quality, and the operational context around them.
              </p>
              <a className="machina-button" href="#model-family">Explore Machina <ArrowDown size={16} aria-hidden="true" /></a>
            </motion.div>

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
                <img className="machina-model-card__image" src={`${R2}/${model.image}`} alt="" loading="lazy" />
                <span className="machina-model-card__shade" aria-hidden="true" />
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

        <section className="machina-resources">
          <div className="machina-resources__intro">
            <p className="machina-section-label">FROM RESEARCH TO INTEGRATION</p>
            <h2>Choose the layer you need.</h2>
            <p>Start with a released task model, inspect the evaluation record, or use the open harness as the control plane for machine-aware agent workflows.</p>
          </div>
          <div className="machina-resource-grid">
            <a className="machina-resource machina-resource--hub" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer">
              <img src={`${R2}/machina.jpg`} alt="Aircraft ascending through a blue atmosphere" loading="lazy" />
              <span className="machina-resource__shade" aria-hidden="true" />
              <div><p>01 / MODEL HUB</p><h3>Weights, cards,<br />and evaluations.</h3><span><SimpleIcon icon={siHuggingface} className="machina-resource__icon" /> Hugging Face <ArrowUpRight size={16} aria-hidden="true" /></span></div>
            </a>
            <a className="machina-resource machina-resource--repo" href="https://github.com/Clerktree/machina-intelligence" target="_blank" rel="noreferrer">
              <img src={`${R2}/machina4.jpg`} alt="Bright point of light above an illuminated horizon" loading="lazy" />
              <span className="machina-resource__shade" aria-hidden="true" />
              <div><p>02 / OPEN HARNESS</p><h3>The orchestration<br />layer is visible.</h3><span><SimpleIcon icon={siGithub} className="machina-resource__icon" /> GitHub <ArrowUpRight size={16} aria-hidden="true" /></span></div>
            </a>
          </div>
        </section>

        <section className="machina-architecture" id="operating-system">
          <div className="machina-architecture__art">
            <img src={`${R2}/machina2.jpg`} alt="Aircraft in high-altitude flight" loading="lazy" />
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
          <div className="machina-access__image"><img src={`${R2}/machina1.jpg`} alt="Jet climbing above a glowing horizon" loading="lazy" /></div>
          <div className="machina-access__content">
            <p className="machina-section-label">BUILD WITH MACHINA</p>
            <h2>Take the controls.</h2>
            <p>Explore the released weights, evaluation notes, and machine-intelligence experiments on the ClerkTree model hub.</p>
            <a className="machina-button machina-button--light" href="https://huggingface.co/clerktree" target="_blank" rel="noreferrer"><SimpleIcon icon={siHuggingface} className="machina-button__icon" /> Visit the model hub <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a className="machina-access__repo" href="https://github.com/Clerktree/machina-intelligence" target="_blank" rel="noreferrer"><SimpleIcon icon={siGithub} className="machina-access__icon" /> Explore the open harness</a>
          </div>
        </section>
      </main>

      <div className="machina-company-footer">
        <img className="machina-company-footer__image" src={`${R2}/machina4.jpg`} alt="" loading="lazy" />
        <span className="machina-company-footer__shade" aria-hidden="true" />
        <Footer />
      </div>
    </div>
  );
}
