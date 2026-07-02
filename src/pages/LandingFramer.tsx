import { type CSSProperties, Fragment, useEffect, useRef, useState } from 'react';
import { Compass, Globe2, MapPin, PanelTop, PenTool, Sparkles } from 'lucide-react';
import Lenis from 'lenis';
import './LandingFramer.css';

const BASE = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck';

const works = [
  {
    title: 'Predictive AI',
    accent: '#e8651a',
    description:
      'ClerkTree structures sensor feeds, log streams, and machine telemetry in one operational layer built for predictive industrial reliability.',
    page: '01',
    role: 'Predictive Ops',
    services: ['Anomaly Detection', 'Remaining Useful Life', 'Telemetry Harness', 'Autonomous Diagnostics'],
    bg: 'https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO1.mp4`,
    href: '/solutions',
  },
  {
    title: 'Process Health',
    accent: '#232323',
    description:
      'Deploy intelligent process control agents that monitor, adjust, and optimize mechanical workloads around the clock — zero unplanned downtime.',
    page: '02',
    role: 'OT / IT Bridge',
    services: ['Process Optimization', 'Yield Maximization', 'Closed-Loop Control', 'Real-time MES Sync'],
    bg: 'https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO2.mp4`,
    href: '/solutions',
  },
  {
    title: 'Custom Harness',
    accent: '#ffffff',
    description:
      'We design custom machine learning setups, physics-informed models, and agentic harness layers that fit your mechanical infrastructure.',
    page: '03',
    role: 'Industrial Deployment',
    services: ['Physics-Informed Models', 'Sensor Mesh Networks', 'Zero-Downtime Scaling', 'Edge Infrastructure'],
    bg: 'https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO3.mp4`,
    href: '/contact',
  },
];

const headerLinks = [
  ['Solutions', '/solutions'],
  ['About', '/about'],
  ['Blog', '/blog'],
  ['Docs', '/docs'],
];

const mobileHeaderLinks = [
  ['Solutions', '/solutions'],
  ['Docs', '/docs'],
  ['About', '/about'],
  ['Blog', '/blog'],
];

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerExploreLinks: FooterLink[] = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Docs', href: '/docs' },
  { label: 'About Us', href: '/about' },
  { label: 'Whitepaper', href: '/whitepaper' },
];

const footerSocialLinks: FooterLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/clerktree', external: true },
  { label: 'The X', href: 'https://x.com/teamclerktree', external: true },
  { label: 'Email', href: 'mailto:team@clerktree.com' },
];

const footerLegalLinks: FooterLink[] = [
  { label: 'Terms', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
];

const clientLogos = [
  { alt: 'THD', src: `${BASE}/THD.png`, width: 200 },
  { alt: 'TUM', src: `${BASE}/TUM1.svg`, width: 210 },
  { alt: 'GLUTH', src: `${BASE}/GLUTH.png`, width: 180 },
  { alt: 'Partner', src: `${BASE}/3cWSgJFsUVvZeOw9LdQmTOSVFhE.svg`, width: 120 },
];

const serviceRibbonItems = ['Predictive Maintenance', 'Operational Intelligence', 'Custom AI Harness'];
const metricRibbonItems = ['40% Downtime Reduction', 'Industrial Grade AI', '24/7 Machine Health'];

const showcaseImage = '/desktop1.png';

const introTags = [
  { label: 'Predictive Ops', Icon: Sparkles },
  { label: 'Sensor Networks', Icon: Globe2 },
  { label: 'Telemetry AI', Icon: Globe2 },
  { label: 'Process Health', Icon: PenTool },
  { label: 'Edge Control', Icon: PanelTop },
  { label: 'Physics AI', Icon: Compass },
];

const locationImage = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/munich.jpg';

const locationDetails = [
  ['Address', 'Industriestraße 2, 94315 Straubing'],
  ['Region', 'Bavaria, Germany'],
];

const testimonialStats = [
  ['26+', 'Industrial Plants'],
  ['40%', 'Downtime reduction'],
  ['24/7', 'Machine health monitoring'],
];

const testimonial = {
  image:
    'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/thdbuilding.jpg',
  quote: '"The predictive models handle our turbine load fluctuations flawlessly — zero missed failures."',
  name: 'Olivia Wagner',
  role: 'Plant Manager, THD GmbH',
};

const plans = [
  {
    name: 'Ops AI',
    description:
      'For industrial teams that need reliable asset monitoring. Telemetry analysis, predictive diagnostics, and process orchestration — all in one stack.',
    price: 'Get a Quote',
    features: [
      'Predictive Maintenance Engine',
      'Process & yield optimization',
      'SCADA, PLC & MES integrations',
      'Dedicated industrial engineering setup',
    ],
    featured: false,
  },
  {
    name: 'Custom Harness',
    description:
      'Custom-tailored deployment for complex industrial machinery and fleets. Custom models, edge/on-prem infrastructure, and SLA-backed support.',
    price: "Let's Talk",
    prefix: '',
    features: [
      'Custom model training & physics-informed AI',
      'Edge GPU & secure on-premise hardware',
      'Historian, MES & plant ERP integrations',
      '24/7 critical alert support + industrial SLA',
    ],
    featured: true,
  },
];

const faqs = [
  {
    question: 'How does ClerkTree integrate with our existing MES/SCADA systems?',
    answer:
      'ClerkTree connects directly to your existing historians, PLC controllers, and MES systems via industry standard protocols like OPC-UA, Modbus, and custom APIs, with zero rip-and-replace.',
  },
  {
    question: 'Can your AI models be deployed on the factory edge?',
    answer:
      'Yes. ClerkTree supports deployment of lightweight, high-frequency models directly on edge hardware next to your machines for ultra-low latency diagnostics and air-gapped security.',
  },
  {
    question: 'How is ClerkTree priced?',
    answer:
      'We offer flexible pricing based on your connected assets, data ingestion volume, and features. Contact our engineering team for a customized quote that fits your operations.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'A standard deployment takes 2 to 4 weeks depending on your data pipelines. We provide dedicated industrial engineering support to map your signals and validate the models.',
  },
  {
    question: 'Do you support physics-informed AI models?',
    answer:
      'Yes. For mechanical assets, we combine neural networks with first-principles physical models of wear and thermodynamic stress to increase predictive accuracy and eliminate false alarms.',
  },
  {
    question: 'Is our operational data kept private and secure?',
    answer:
      'Absolutely. We support fully isolated, on-premise, virtual private cloud, or air-gapped deployments. Your proprietary machinery and process data never leaves your secure network.',
  },
];

const flowerIcon =
  'https://framerusercontent.com/images/bPFUMYGmKDGU6pubiY2MFnjtBAk.svg?width=16&height=16';

const ribbonFlower = 'https://framerusercontent.com/images/InxDM6L8xjRn2ZsMquQwkLQ0VLA.svg';
const ribbonFlowerOrange = 'https://framerusercontent.com/images/7LCWzuhI2N54jKdu359awJ6cKLU.svg';

export default function LandingFramer() {
  useAgeroPageMotion();

  return (
    <div className="agero-works" id="agero-works">
      <div className="agero-top-area">
        <section className="agero-hero-panel">
          <Header />

          <div
            className="agero-hero-content"
            aria-labelledby="agero-works-title"
            data-agero-reveal="hero"
          >
            <h1 className="agero-hero-title" id="agero-works-title">
              <span>Orchestrating</span>
              <video
                autoPlay
                className="agero-hero-pill agero-hero-pill-desktop"
                loop
                muted
                playsInline
                src="/hero-logo-video.mp4"
              />
              <span className="agero-orange">Industrial</span>
              <span className="agero-muted">Machine</span>
              <video
                autoPlay
                className="agero-hero-pill agero-hero-pill-desktop"
                loop
                muted
                playsInline
                src={`${BASE}/HERO4.mp4`}
              />
              <span>Intelligence</span>
            </h1>

            <p className="agero-hero-copy">
              Transform how your machinery operates. We deploy custom-tailored AI/ML harness layers
              and robust predictive models designed to optimize operations, reduce downtime, and manage critical industrial assets.
            </p>

            <a className="agero-button agero-hero-cta" href="/contact">
              <span>Book Demo</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <HomePrelude />
      </div>

      <RibbonStage />
      <IntroStatement />
      <LocationIntro />
      <Testimonials />

      <section className="agero-portfolio" aria-labelledby="agero-portfolio-title">
        <p className="agero-section-kicker" data-agero-reveal="up">
          (What We Do)
        </p>
        <h2
          className="agero-portfolio-title"
          data-agero-reveal="title"
          id="agero-portfolio-title"
        >
          Our Solutions
        </h2>

        <div className="agero-work-list">
          {works.map((work, index) => (
            <WorkCard index={index} key={work.title} work={work} />
          ))}
        </div>
      </section>

      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
}

function HomePrelude() {
  const logoTrackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = logoTrackRef.current;
    if (!track) return;
    const firstSet = track.querySelector('.agero-client-logo-set') as HTMLElement | null;
    if (!firstSet) return;
    const update = () => track.style.setProperty('--ticker-offset', `-${firstSet.offsetWidth}px`);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <section className="agero-home-prelude" aria-label="Agero client showcase">
      <div className="agero-showcase-shell" data-agero-reveal="up">
        <div className="agero-showcase-media">
          <video
            autoPlay
            muted
            loop
            playsInline
            src="https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/entrybox.mov"
          />
        </div>

        <div className="agero-client-logo-strip">
          <div className="agero-client-logo-track" aria-label="Client logos" ref={logoTrackRef}>
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <div className="agero-client-logo-set" aria-hidden={groupIndex > 0} key={groupIndex}>
                {clientLogos.map((logo) => (
                  <img
                    alt={groupIndex === 0 ? logo.alt : ''}
                    height="32"
                    key={`${groupIndex}-${logo.src}`}
                    src={logo.src}
                    style={{ '--logo-width': `${logo.width}px`, ...(logo.natural ? { filter: 'none' } : {}) } as CSSProperties}
                    width={logo.width}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RibbonStage() {
  return (
    <section className="agero-ribbon-stage" aria-hidden="true">
      <RibbonRow items={metricRibbonItems} variant="black" />
      <RibbonRow items={serviceRibbonItems} variant="orange" />
    </section>
  );
}

function IntroStatement() {
  return (
    <section className="agero-about-intro" aria-labelledby="agero-about-intro-title">
      <div className="agero-hello" data-agero-reveal="up">
        <span aria-hidden="true">(</span>
        <span className="agero-hello-script">About Us</span>
        <span aria-hidden="true">)</span>
      </div>

      <h2
        className="agero-about-heading"
        data-agero-reveal="title"
        id="agero-about-intro-title"
      >
        We help industrial operators orchestrate machine intelligence systems — with{' '}
        <span>speed, precision,</span> and absolute reliability.
      </h2>

      <div className="agero-intro-tags" data-agero-reveal="up">
        {introTags.map(({ Icon, label }) => (
          <span className="agero-intro-tag" key={label}>
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function LocationIntro() {
  return (
    <section className="agero-founder" aria-labelledby="agero-founder-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        (Office)
      </p>
      <h2 className="agero-founder-watermark" data-agero-reveal="title">
        Our Location
      </h2>

      <div className="agero-founder-grid">
        <figure className="agero-founder-portrait" data-agero-reveal="up">
          <img alt="ClerkTree Straubing Headquarters" className="agero-founder-image" src={locationImage} />
          <div className="agero-founder-socials" aria-label="Office social links">
            <a
              aria-label="Open in Google Maps"
              href="https://maps.app.goo.gl/6p7fB1u5Qbk3fNB18"
              target="_blank"
              rel="noreferrer"
            >
              <MapPin aria-hidden="true" size={18} strokeWidth={1.8} />
            </a>
          </div>
        </figure>

        <div className="agero-founder-copy" data-agero-reveal="up">
          <div>
            <h3 id="agero-founder-title">Straubing Office</h3>
            <p>
              ClerkTree is based in the high-tech Bavarian town of Straubing, Germany. Our location on Industriestraße houses our core operations and machine intelligence research, close to academic and industrial partners at the Technical University of Munich (TUM) Straubing campus.
            </p>
          </div>

          <span className="agero-founder-rule" aria-hidden="true" />

          <div className="agero-founder-history">
            {locationDetails.map(([key, val]) => (
              <div className="agero-founder-history-row" key={key}>
                <span>{key}</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RibbonRow({ items, variant }: { items: string[]; variant: 'black' | 'orange' }) {
  const repeatedItems = Array.from({ length: 4 }).flatMap(() => items);

  return (
    <div className={`agero-diagonal-ribbon agero-ribbon-${variant}`}>
      <div className="agero-ribbon-track">
        {repeatedItems.map((item, index) => (
          <span className="agero-ribbon-item" key={`${variant}-${item}-${index}`}>
            <span>{item}</span>
            <img alt="" src={variant === 'orange' ? ribbonFlowerOrange : ribbonFlower} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="agero-testimonials" aria-labelledby="agero-testimonials-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        (Why clients choose ClerkTree)
      </p>
      <h2
        className="agero-testimonial-watermark"
        data-agero-reveal="title"
        id="agero-testimonials-title"
      >
        Testimonials
      </h2>

      <div className="agero-testimonial-grid">
        <aside className="agero-stats-card" data-agero-reveal="up">
          {testimonialStats.map(([value, label]) => (
            <div className="agero-stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </aside>

        <article
          className="agero-testimonial-card"
          data-agero-reveal="up"
          style={{ '--testimonial-image': `url("${testimonial.image}")` } as CSSProperties}
        >
          <img alt="THD GmbH plant" className="agero-testimonial-image" src={testimonial.image} />
          <div className="agero-testimonial-shade" aria-hidden="true" />
          <div className="agero-testimonial-content">
            <div className="agero-testimonial-bottom">
              <blockquote>{testimonial.quote}</blockquote>
              <div className="agero-testimonial-author">
                <span>{testimonial.name}</span>
                <span>{testimonial.role}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function useAgeroPageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('agero-page-active');

    if (reduceMotion) {
      document.body.classList.add('agero-reduced-motion');
      return () => {
        document.body.classList.remove('agero-page-active', 'agero-reduced-motion');
      };
    }

    const lenis = new Lenis({
      duration: 1,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);
    root.classList.add('lenis');

    const anchorHandlers: Array<() => void> = [];
    document.querySelectorAll<HTMLAnchorElement>('.agero-works a[href^="#"]').forEach((anchor) => {
      const handler = (event: MouseEvent) => {
        const hash = anchor.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: 0 });
      };
      anchor.addEventListener('click', handler);
      anchorHandlers.push(() => anchor.removeEventListener('click', handler));
    });

    return () => {
      cancelAnimationFrame(frame);
      anchorHandlers.forEach((cleanup) => cleanup());
      lenis.destroy();
      root.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.body.classList.remove('agero-page-active');
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>('.agero-works [data-agero-reveal]');
    const solRows = document.querySelectorAll<HTMLElement>('.agero-sol-row');
    const pricingCards = document.querySelectorAll<HTMLElement>('.agero-plan-card');

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          entry.target.setAttribute('data-agero-visible', 'true');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));

    let ticking = false;
    const updateCards = () => {
      const viewportHeight = window.innerHeight || 1;
      solRows.forEach((row, i) => {
        const rect = row.getBoundingClientRect();
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
        row.style.setProperty('--scroll-progress', progress.toFixed(4));

        if (i < solRows.length - 1) {
          const nextRow = solRows[i + 1];
          const nextRect = nextRow.getBoundingClientRect();
          const rowHeight = rect.height || 1;
          const stickyTop = Number.parseFloat(window.getComputedStyle(nextRow).top) || 56;
          const overlapProgress = clamp((stickyTop + rowHeight - nextRect.top) / rowHeight, 0, 1);
          row.style.setProperty('--sol-y', `${(-18 * overlapProgress).toFixed(2)}px`);
          row.style.setProperty('--sol-scale', (1 - overlapProgress * 0.035).toFixed(4));
          row.style.setProperty('--sol-opacity', (1 - overlapProgress * 0.28).toFixed(4));
        } else {
          row.style.setProperty('--sol-y', '0px');
          row.style.setProperty('--sol-scale', '1');
          row.style.setProperty('--sol-opacity', '1');
        }
      });

      if (pricingCards.length > 1) {
        const standardCard = pricingCards[0];
        const proCard = pricingCards[1];
        const standardHeight = standardCard.offsetHeight || 1;
        const proRect = proCard.getBoundingClientRect();
        const stickyTop = Number.parseFloat(window.getComputedStyle(proCard).top) || 50;
        const overlapProgress = clamp((stickyTop + standardHeight - proRect.top) / standardHeight, 0, 1);

        standardCard.style.setProperty('--plan-y', `${(-18 * overlapProgress).toFixed(2)}px`);
        standardCard.style.setProperty('--plan-scale', (1 - overlapProgress * 0.035).toFixed(4));
        standardCard.style.setProperty('--plan-opacity', (1 - overlapProgress * 0.28).toFixed(4));

        proCard.style.setProperty('--plan-y', '0px');
        proCard.style.setProperty('--plan-scale', '1');
        proCard.style.setProperty('--plan-opacity', '1');
      }

      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateCards);
    };

    updateCards();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatMunichTime() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin',
  }).format(new Date());
}

function useMunichTime() {
  const [time, setTime] = useState(() => formatMunichTime());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatMunichTime()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}

function SplitText({ text }: { text: string }) {
  let globalCharIndex = 0;
  const words = text.split(' ');
  return (
    <span className="agero-split" aria-hidden="true">
      {words.map((word, wordIdx) => {
        const chars = Array.from(word);
        const wordSpans = chars.map((letter) => {
          const charIndex = globalCharIndex++;
          return (
            <span
              className="agero-split-char"
              key={charIndex}
              style={{ '--char-index': charIndex } as CSSProperties}
            >
              {letter}
            </span>
          );
        });

        const spaceIndex = globalCharIndex++;

        return (
          <Fragment key={wordIdx}>
            <span className="agero-split-word">
              {wordSpans}
            </span>
            {wordIdx < words.length - 1 && (
              <span
                className="agero-split-char agero-split-space"
                key={`space-${spaceIndex}`}
                style={{ '--char-index': spaceIndex } as CSSProperties}
              >
                {'\u00A0'}
              </span>
            )}
          </Fragment>
        );
      })}
    </span>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="agero-header">
      <nav className="agero-nav" aria-label="Main navigation">
        <a className="agero-logo agero-logo-text" href="/" aria-label="ClerkTree home">
          <svg className="agero-logo-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 464 468" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"/>
          </svg>
          <span>ClerkTree</span>
        </a>

        <div className="agero-nav-links">
          {headerLinks.map(([label, href]) => (
            <a key={label} href={href}>
              {label}
            </a>
          ))}
        </div>

        <button
          aria-controls="agero-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={`agero-menu-button${isMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
        </button>
      </nav>

      {isMenuOpen && (
        <div className="agero-mobile-menu" id="agero-mobile-menu">
          <button
            aria-label="Close mobile menu"
            className="agero-mobile-menu-scrim"
            onClick={closeMenu}
            type="button"
          />

          <div className="agero-mobile-menu-panel" role="navigation" aria-label="Mobile navigation">
            <button aria-label="Close menu" className="agero-mobile-menu-close" onClick={closeMenu} type="button">
              ✕
            </button>
            <div className="agero-mobile-menu-top">
              <span>Menu</span>
            </div>

            <div className="agero-mobile-menu-links">
              {mobileHeaderLinks.map(([label, href]) => (
                <a href={href} key={label} onClick={closeMenu}>
                  {label}
                </a>
              ))}
            </div>

            <a className="agero-mobile-menu-cta" href="/contact" onClick={closeMenu}>
              <span>Book Demo</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function WorkCard({ index, work }: { index: number; work: (typeof works)[number] }) {
  return (
    <article
      className="agero-sol-row"
      data-agero-reveal="card"
      style={
        {
          '--accent': work.accent,
          '--card-index': String(index),
          '--reveal-delay': `${index * 150}ms`,
        } as CSSProperties
      }
    >
      <div className="agero-sol-header">
        <span className="agero-sol-year">2025</span>
        <span className="agero-sol-role">{work.role}</span>
      </div>

      <div className="agero-sol-body">
        <div className="agero-sol-title-row">
          <h3 className="agero-sol-title">{work.title}</h3>
          <a aria-label={`View ${work.title}`} className="agero-sol-arrow" href={work.href}>
            ↗
          </a>
        </div>
        <p className="agero-sol-desc">{work.description}</p>
        <div className="agero-sol-tags" aria-label="Services">
          {work.services.map((service) => (
            <span className="agero-sol-tag" key={service}>{service}</span>
          ))}
        </div>
      </div>

      <a aria-label={`See ${work.title} in action`} className="agero-sol-media" href={work.href}>
        <video
          autoPlay
          className="agero-sol-video"
          loop
          muted
          playsInline
          src={work.cover}
        />
      </a>
    </article>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="agero-meta-label">{label}</p>
      <p className="agero-meta-value">{value}</p>
    </div>
  );
}

function Pricing() {
  return (
    <section className="agero-pricing" id="pricing" aria-labelledby="agero-pricing-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        (Industrial Pricing)
      </p>
      <h2
        className="agero-section-title"
        data-agero-reveal="title"
        id="agero-pricing-title"
        aria-label="Built for Machinery Operations"
      >
        <SplitText text="Built for Machinery Operations" />
      </h2>

      <div className="agero-plan-list" data-agero-pricing-stack>
        {plans.map((plan, index) => (
          <article
            className={`agero-plan-card${plan.featured ? ' agero-plan-card-featured' : ''}`}
            data-agero-reveal="up"
            key={plan.name}
            style={
              {
                '--plan-index': String(index),
                '--plan-opacity': '1',
                '--plan-scale': '1',
                '--plan-y': '0px',
                '--reveal-delay': `${index * 120}ms`,
              } as CSSProperties
            }
          >
            <div className="agero-plan-left">
              <div className="agero-plan-icon" aria-hidden="true">
                {plan.featured ? '⌁' : '✦'}
              </div>
              <div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              <div className="agero-delivery">
                <span>Setup Time</span>
                <span>2-4 weeks</span>
              </div>
            </div>

            <div className="agero-plan-right">
              <div className="agero-price">
                {plan.prefix && <span>{plan.prefix}</span>}
                <strong>{plan.price}</strong>
                {plan.suffix && <em>{plan.suffix}</em>}
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a className="agero-button agero-plan-button" href="/contact">
                <span>Book a Discovery Call</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const faqColumns = [
    faqs.filter((_, index) => index % 2 === 0),
    faqs.filter((_, index) => index % 2 === 1),
  ];

  const toggleQuestion = (question: string) => {
    setOpenQuestion((currentQuestion) => (currentQuestion === question ? null : question));
  };

  return (
    <section className="agero-faq" aria-labelledby="agero-faq-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        (FAQs)
      </p>
      <h2 className="agero-section-title" data-agero-reveal="title" id="agero-faq-title">
        Your Questions, Answered
      </h2>
      <p className="agero-faq-subtitle" data-agero-reveal="up">
        Helping you understand how ClerkTree transforms your machinery operations.
      </p>

      <div className="agero-faq-grid">
        {faqColumns.map((column, columnIndex) => (
          <div className="agero-faq-column" key={`faq-column-${columnIndex}`}>
            {column.map((faq, itemIndex) => {
              const isOpen = openQuestion === faq.question;
              const revealIndex = itemIndex * 2 + columnIndex;

              return (
                <article
                  className={`agero-faq-item${isOpen ? ' is-open' : ''}`}
                  data-agero-reveal="up"
                  key={faq.question}
                  style={
                    {
                      '--reveal-delay': `${revealIndex * 55}ms`,
                      order: revealIndex,
                    } as CSSProperties
                  }
                >
                  <button
                    aria-expanded={isOpen}
                    className="agero-faq-toggle"
                    onClick={() => toggleQuestion(faq.question)}
                    type="button"
                  >
                    <span className="agero-faq-question">
                      <span>{faq.question}</span>
                      <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                    </span>
                    <span aria-hidden={!isOpen} className="agero-faq-answer">
                      <span>{faq.answer}</span>
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (status === 'sending' || !name || !email) return;
    setStatus('sending');
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/contact_submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPA_KEY,
          Authorization: `Bearer ${SUPA_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ full_name: name, email, message }),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      setName(''); setEmail(''); setMessage('');
      window.setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section className="agero-contact" id="contact" aria-labelledby="agero-contact-title">
      <h2
        aria-label="Let's Connect"
        className="agero-contact-watermark"
        data-agero-reveal="title"
        id="agero-contact-title"
      >
        <SplitText text="Let's Connect" />
      </h2>

      <div className="agero-contact-panel" data-agero-reveal="up">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="agero-contact-bg-video"
          src="https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/hero.mov"
        />
        <div className="agero-contact-top">
          <div className="agero-contact-copy">
            <h3 aria-label="Ready to optimize your machinery?">
              <SplitText text="Ready to optimize your machinery?" />
            </h3>
            <p>Let's build your industrial AI harness together</p>
          </div>

          <form className="agero-contact-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
              <span>Your Name</span>
              <input onChange={(e) => setName(e.target.value)} placeholder="Enter your Name" type="text" value={name} />
            </label>
            <label>
              <span>Your Email</span>
              <input onChange={(e) => setEmail(e.target.value)} placeholder="Enter the Email" type="email" value={email} />
            </label>
            <label>
              <span>Project Description</span>
              <textarea onChange={(e) => setMessage(e.target.value)} placeholder="Type Here..." value={message} />
            </label>
            <button className={`agero-submit-button is-${status}`} type="submit">
              <span>{status === 'sent' ? '✓ Sent!' : status === 'error' ? 'Try again' : 'Send Now!'}</span>
              {status === 'sending' && <i aria-hidden="true" />}
            </button>
          </form>
        </div>

        <div className="agero-mail-ticker" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <a className="agero-mail-card" href="mailto:team@clerktree.com" key={index} tabIndex={-1}>
              <img alt="" src={flowerIcon} />
              <span>
                team<b>@</b>clerktree.com
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const munichTime = useMunichTime();

  return (
    <footer className="agero-footer">
      <div className="agero-footer-inner">
        <div className="agero-footer-main">
          <div className="agero-footer-cta">
            <p>
              AI harness for
              <br />
              industrial machinery.
            </p>
            <a className="agero-footer-cta-button" href="/contact">
              <span aria-hidden="true">+</span>
              Get in touch
            </a>
          </div>

          <div className="agero-footer-columns">
            <FooterColumn title="Explore" links={footerExploreLinks} />
            <FooterColumn title="Socials" links={footerSocialLinks} />
          </div>
        </div>

        <div className="agero-footer-bottom">
          <div className="agero-footer-copyright">
            <p>© 2026 ClerkTree. All rights reserved.</p>
            <img alt="GDPR Compliant" src="/gdpr-compliant.webp" />
          </div>
          <div className="agero-footer-time" aria-label={`Munich time ${munichTime}`}>
            <span>Munich →</span>
            <time dateTime={munichTime}>{munichTime}</time>
          </div>
          <div className="agero-footer-bottom-right">
            {footerLegalLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
            <a className="agero-footer-back" href="#agero-works">
              Back to top
            </a>
          </div>
        </div>

        <div className="agero-footer-logo agero-footer-logo-text" aria-hidden="true">
          ClerkTree
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="agero-footer-column">
      <p>{title}</p>
      <ul>
        {links.map((link) => {
          const externalProps = link.external ? { rel: 'noopener noreferrer', target: '_blank' } : {};

          return (
            <li key={link.href}>
              <a href={link.href} {...externalProps}>
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
