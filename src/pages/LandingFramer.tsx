import { type CSSProperties, Fragment, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { ArrowRight } from 'lucide-react';
import { isSaveDataEnabled } from '../utils/idle';
import { Footer, Header } from '../components/Landing/SiteChrome';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CapabilityShowcase from './solutions/CapabilityShowcase';
import Grainient from '../components/Brand/Grainient';
import { CaseStudy, ConnectorPanel, HeroAgentCard, LogoStrip, ProofChart, Spotlight, StoryTabs } from './home/HomeStory';
import './LandingFramer.css';
import { MEDIA_BASE_URL } from '../config/media';

const BASE = MEDIA_BASE_URL;

const clientLogos = [
  { alt: 'BMW', src: '/client-logos/bmw.svg?v=2', width: 40, mobileWidth: 28 },
  { alt: 'Snowflake', src: `${BASE}/client-logos/snowflake.svg`, width: 150, mobileWidth: 80 },
  { alt: 'HAWE Hydraulik SE', src: '/client-logos/hawe.svg', width: 120, mobileWidth: 64 },
  { alt: 'PostHog', src: `${BASE}/client-logos/posthog.svg`, width: 160, mobileWidth: 80 },
  { alt: 'Dacia', src: '/client-logos/dacia.svg', width: 105, mobileWidth: 60 },
  { alt: 'Zendesk', src: `${BASE}/client-logos/zendesk.svg`, width: 56, mobileWidth: 39 },
  { alt: 'Amplitude', src: `${BASE}/client-logos/amplitude.svg`, width: 140, mobileWidth: 80 },
];

const testimonialImage = `${MEDIA_BASE_URL}/thdbuilding.jpg`;

const plans = [
  {
    key: 'plan1' as const,
    featured: false,
  },
  {
    key: 'plan2' as const,
    prefix: '',
    featured: true,
  },
];

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;


export default function LandingFramer() {
  useCtPageMotion();
  const { t, language } = useLanguage();

  return (
    <div className="ct-works ct-home-page" id="ct-works">
      <SEO
        title="ClerkTree – The World's Industrial Intelligence Layer"
        description="ClerkTree is an industrial AI harness for machine operations. Agents connect signals, technical knowledge and workflows to help teams understand issues and coordinate work."
        canonical="https://clerktree.com/"
      />
      <div className="ct-top-area">
        <Header />

        <div className="ct-home-hero-copy" data-ct-reveal="hero">
          <h1 className="ct-hero-title" id="ct-works-title" style={{ columnGap: "0.22em" }}>
            <span>{t('home.hero.word1')}</span>
            <span className={language === 'de' ? 'ct-hero-accent' : undefined}>{t('home.hero.word2')}</span>
            <span className={language === 'en' ? 'ct-hero-accent' : undefined}>{t('home.hero.word3')}</span>
            <span>{t('home.hero.word4')}</span>
          </h1>
          <p className="ct-hero-copy">{t('home.hero.copy')}</p>
          <div className="ct-hero-actions">
            <a className="hs-cta" href="#solutions">
              <span>{language === 'de' ? 'Mehr erfahren' : 'Learn more'}</span>
              <span className="hs-cta-icon" aria-hidden="true">
                <span className="hs-cta-track">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </span>
            </a>
          </div>
        </div>

        <section className="ct-home-prelude" aria-label={t('home.showcase.aria')}>
          <div className="ct-hero-stage ct-hero-stage--home has-demo hs-hero-panel" data-ct-reveal="up">
            <Grainient preset="silver" />
            <HeroAgentCard />
          </div>
          <LogoStrip logos={clientLogos} label={t('home.showcase.logosAria')} />
        </section>
      </div>

      <StoryTabs />
      <Spotlight />
      <CaseStudy
        quote={t('home.testimonial.quote')}
        name={t('home.testimonial.name')}
        role={t('home.testimonial.role')}
        image={testimonialImage}
        stats={[1, 2, 3].map((n) => [t(`home.testimonials.stat${n}Value`), t(`home.testimonials.stat${n}Label`)] as [string, string])}
      />
      <ProofChart />
      <CapabilityShowcase />
      <ConnectorPanel />

      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
}


function useCtPageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('ct-page-active');

    if (reduceMotion || isSaveDataEnabled()) {
      document.body.classList.add('ct-reduced-motion');
      return () => {
        document.body.classList.remove('ct-page-active', 'ct-reduced-motion');
      };
    }

    // Smooth-scroll easing is for wheels and trackpads. Touch screens already have the operating
    // system's own momentum scrolling, which is smoother than anything done in script, so phones
    // and tablets skip the library (and its per-frame scroll reads) entirely.
    const smoothing = window.matchMedia('(pointer: fine)').matches;
    const lenis = smoothing
      ? new Lenis({ duration: 1, easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)) })
      : null;

    let frame = 0;
    const raf = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(raf);
    };

    if (lenis) {
      frame = requestAnimationFrame(raf);
      root.classList.add('lenis');
    }

    const anchorHandlers: Array<() => void> = [];
    document.querySelectorAll<HTMLAnchorElement>('.ct-works a[href^="#"]').forEach((anchor) => {
      const handler = (event: MouseEvent) => {
        const hash = anchor.getAttribute('href');
        if (!hash || hash === '#') return;
        const target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: 0 });
        else (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      anchor.addEventListener('click', handler);
      anchorHandlers.push(() => anchor.removeEventListener('click', handler));
    });

    return () => {
      cancelAnimationFrame(frame);
      anchorHandlers.forEach((cleanup) => cleanup());
      lenis?.destroy();
      root.classList.remove('lenis', 'lenis-smooth', 'lenis-scrolling', 'lenis-stopped');
      document.body.classList.remove('ct-page-active');
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll<HTMLElement>('.ct-works [data-ct-reveal]');
    const solRows = document.querySelectorAll<HTMLElement>('.ct-sol-row');
    const pricingCards = document.querySelectorAll<HTMLElement>('.ct-plan-card');

    const worksRoot = document.querySelector<HTMLElement>('.ct-works');
    const bgSections = worksRoot ? (Array.from(worksRoot.children) as HTMLElement[]) : [];
    const fallbackBg = worksRoot ? window.getComputedStyle(worksRoot).backgroundColor : 'rgb(244, 244, 244)';
    const sectionBgs = bgSections.map((section) => {
      // Contact/footer get their dark look from video/image layers, so their
      // backgroundColor computes transparent — pin them to the matching dark.
      if (section.classList.contains('ct-contact') || section.classList.contains('ct-footer')) {
        return 'rgb(13, 13, 13)';
      }
      const color = window.getComputedStyle(section).backgroundColor;
      return color === 'transparent' || color === 'rgba(0, 0, 0, 0)' ? fallbackBg : color;
    });
    let currentBodyBg = '';

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          entry.target.setAttribute('data-ct-visible', 'true');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));

    // Looping animations (agent pulses, packets, shimmers, tickers) only need to run while their
    // section can be seen. Off screen they would still cost style work on every frame.
    const sectionObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { (entry.target as HTMLElement).dataset.offscreen = entry.isIntersecting ? 'false' : 'true'; }),
      { rootMargin: '200px 0px' },
    );
    bgSections.forEach((section) => sectionObserver.observe(section));

    // Sticky offsets come from CSS and only change with the viewport, so read them once per resize
    // instead of asking the browser to compute styles on every scroll frame.
    let solStickyTops: number[] = [];
    let planStickyTop = 50;
    const measureStickyTops = () => {
      solStickyTops = Array.from(solRows).map((row) => Number.parseFloat(window.getComputedStyle(row).top) || 56);
      if (pricingCards.length > 1) planStickyTop = Number.parseFloat(window.getComputedStyle(pricingCards[1]).top) || 50;
    };
    measureStickyTops();

    // Only write a custom property when its value changed: a write invalidates style even if equal.
    const applied = new WeakMap<HTMLElement, Record<string, string>>();
    const setVar = (element: HTMLElement, name: string, value: string) => {
      let known = applied.get(element);
      if (!known) { known = {}; applied.set(element, known); }
      if (known[name] === value) return;
      known[name] = value;
      element.style.setProperty(name, value);
    };

    let ticking = false;
    const updateCards = () => {
      // Phase 1: read every measurement. Reads and writes are never interleaved, so the browser
      // lays the page out once per frame instead of once per element.
      const viewportHeight = window.innerHeight || 1;
      const rowRects = Array.from(solRows, (row) => row.getBoundingClientRect());
      const standardHeight = pricingCards.length > 1 ? pricingCards[0].offsetHeight || 1 : 1;
      const proRect = pricingCards.length > 1 ? pricingCards[1].getBoundingClientRect() : null;
      const sectionRects = bgSections.map((section) => section.getBoundingClientRect());

      // Phase 2: write.
      solRows.forEach((row, i) => {
        const rect = rowRects[i];
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);
        setVar(row, '--scroll-progress', progress.toFixed(4));

        if (i < solRows.length - 1) {
          const rowHeight = rect.height || 1;
          const overlapProgress = clamp((solStickyTops[i + 1] + rowHeight - rowRects[i + 1].top) / rowHeight, 0, 1);
          setVar(row, '--sol-y', `${(-18 * overlapProgress).toFixed(2)}px`);
          setVar(row, '--sol-scale', (1 - overlapProgress * 0.035).toFixed(4));
          setVar(row, '--sol-opacity', (1 - overlapProgress * 0.28).toFixed(4));
        } else {
          setVar(row, '--sol-y', '0px');
          setVar(row, '--sol-scale', '1');
          setVar(row, '--sol-opacity', '1');
        }
      });

      if (proRect) {
        const standardCard = pricingCards[0];
        const proCard = pricingCards[1];
        const overlapProgress = clamp((planStickyTop + standardHeight - proRect.top) / standardHeight, 0, 1);

        setVar(standardCard, '--plan-y', `${(-18 * overlapProgress).toFixed(2)}px`);
        setVar(standardCard, '--plan-scale', (1 - overlapProgress * 0.035).toFixed(4));
        setVar(standardCard, '--plan-opacity', (1 - overlapProgress * 0.28).toFixed(4));
        setVar(proCard, '--plan-y', '0px');
        setVar(proCard, '--plan-scale', '1');
        setVar(proCard, '--plan-opacity', '1');
      }

      // iOS Safari tints its floating bar from the sampled body color, so the
      // body background must track the section currently at the bottom edge.
      const bottomEdge = viewportHeight - 1;
      for (let i = bgSections.length - 1; i >= 0; i -= 1) {
        const rect = sectionRects[i];
        if (rect.top <= bottomEdge && rect.bottom > bottomEdge) {
          // At the very top the same colour also tints the status bar above the page, which should
          // match the canvas around the hero card rather than the white card itself.
          const wanted = window.scrollY < 6 ? fallbackBg : sectionBgs[i];
          if (wanted !== currentBodyBg) {
            currentBodyBg = wanted;
            document.body.style.setProperty('--ct-body-bg', currentBodyBg);
          }
          break;
        }
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
    const onResize = () => { measureStickyTops(); requestUpdate(); };
    window.addEventListener('resize', onResize);

    return () => {
      revealObserver.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', onResize);
    };
  }, []);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SplitText({ text }: { text: string }) {
  let globalCharIndex = 0;
  const words = text.split(' ');
  return (
    <span className="ct-split" aria-hidden="true">
      {words.map((word, wordIdx) => {
        const chars = Array.from(word);
        const wordSpans = chars.map((letter) => {
          const charIndex = globalCharIndex++;
          return (
            <span
              className="ct-split-char"
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
            <span className="ct-split-word">
              {wordSpans}
            </span>
            {wordIdx < words.length - 1 && (
              <span
                className="ct-split-char ct-split-space"
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

const planMeta = {
  en: [
    { badge: 'Standard', chips: ['Cloud or VPC', 'Live in 2–4 weeks'] },
    { badge: 'Custom', chips: ['On-prem or edge', 'Custom models'] },
  ],
  de: [
    { badge: 'Standard', chips: ['Cloud oder VPC', 'Live in 2–4 Wochen'] },
    { badge: 'Individuell', chips: ['On-Prem oder Edge', 'Eigene Modelle'] },
  ],
};

function Pricing() {
  const { t, language } = useLanguage();
  const localizedPlans = plans.map((plan) => ({
    ...plan,
    name: t(`home.${plan.key}.name`),
    description: t(`home.${plan.key}.description`),
    price: t(`home.${plan.key}.price`),
    features: [1, 2, 3, 4].map((n) => t(`home.${plan.key}.feature${n}`)),
  }));
  const pricingHeading = t('home.pricing.heading');

  return (
    <section className="ct-pricing" id="pricing" aria-labelledby="ct-pricing-title">
      <p className="ct-section-kicker" data-ct-reveal="up">
        ({t('home.pricing.kicker')})
      </p>
      <h2
        className="ct-section-title"
        data-ct-reveal="title"
        id="ct-pricing-title"
        aria-label={pricingHeading}
      >
        <SplitText text={pricingHeading} />
      </h2>

      <div className="ct-plan-list" data-ct-pricing-stack>
        {localizedPlans.map((plan, index) => (
          <article
            className={`ct-plan-card${plan.featured ? ' ct-plan-card-featured' : ''}`}
            data-ct-reveal="up"
            key={plan.key}
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
            <div className="ct-plan-left">
              <div className="ct-plan-tags">
                <span className="ct-plan-badge">{planMeta[language === 'de' ? 'de' : 'en'][index].badge}</span>
                {planMeta[language === 'de' ? 'de' : 'en'][index].chips.map((chip) => <span className="ct-plan-chip" key={chip}>{chip}</span>)}
              </div>
              <div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              <div className="ct-delivery">
                <span>{t('home.pricing.setupLabel')}</span>
                <span>{t('home.pricing.setupValue')}</span>
              </div>
            </div>

            <div className="ct-plan-right">
              <div className="ct-price">
                {plan.prefix && <span>{plan.prefix}</span>}
                <strong>{plan.price}</strong>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a className="ct-button ct-plan-button" href="/contact">
                <span>{t('home.pricing.bookCall')}</span>
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
  const { t } = useLanguage();
  const faqs = faqKeys.map((key, i) => ({
    question: t(`home.faq.${key}`),
    answer: t(`home.faq.a${i + 1}`),
  }));
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const faqColumns = [
    faqs.filter((_, index) => index % 2 === 0),
    faqs.filter((_, index) => index % 2 === 1),
  ];

  const toggleQuestion = (question: string) => {
    setOpenQuestion((currentQuestion) => (currentQuestion === question ? null : question));
  };

  return (
    <section className="ct-faq" aria-labelledby="ct-faq-title">
      <p className="ct-section-kicker" data-ct-reveal="up">
        ({t('home.faq.kicker')})
      </p>
      <h2 className="ct-section-title" data-ct-reveal="title" id="ct-faq-title">
        {t('home.faq.heading')}
      </h2>
      <p className="ct-faq-subtitle" data-ct-reveal="up">
        {t('home.faq.subtitle')}
      </p>

      <div className="ct-faq-grid">
        {faqColumns.map((column, columnIndex) => (
          <div className="ct-faq-column" key={`faq-column-${columnIndex}`}>
            {column.map((faq, itemIndex) => {
              const isOpen = openQuestion === faq.question;
              const revealIndex = itemIndex * 2 + columnIndex;

              return (
                <article
                  className={`ct-faq-item${isOpen ? ' is-open' : ''}`}
                  data-ct-reveal="up"
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
                    className="ct-faq-toggle"
                    onClick={() => toggleQuestion(faq.question)}
                    type="button"
                  >
                    <span className="ct-faq-question">
                      <span>{faq.question}</span>
                      <span aria-hidden="true" className="ct-faq-icon" />
                    </span>
                    <span aria-hidden={!isOpen} className="ct-faq-answer">
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

function Contact() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (status === 'sending' || !name || !email) return;
    setStatus('sending');
    try {
      // Same endpoint as the contact page and the data request form: it validates the input and
      // stores it server-side. This short form asks for less, so the rest is filled in plainly.
      const res = await fetch(`${SUPA_URL}/functions/v1/api-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          message: message.trim() || '(No message)',
          companyName: 'Not provided',
          phone: 'Not provided',
          interest: 'Website (home page)',
          employeeCount: 'Not provided',
        }),
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

  const connectHeading = t('home.contact.heading');
  const subheading = t('home.contact.subheading');

  return (
    <section className="ct-contact" id="contact" aria-labelledby="ct-contact-title">
      <h2 className="sr-only" id="ct-contact-title">
        {connectHeading}
      </h2>

      <div className="ct-contact-panel" data-ct-reveal="up">
        <Grainient preset="black" />
        <div className="ct-contact-top">
          <div className="ct-contact-copy">
            <h3 aria-label={subheading}>
              <SplitText text={subheading} />
            </h3>
            <p>{t('home.contact.tagline')}</p>
          </div>

          <form className="ct-contact-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
              <span>{t('home.contact.nameLabel')}</span>
              <input autoComplete="name" name="name" onChange={(e) => setName(e.target.value)} placeholder={t('home.contact.namePlaceholder')} required type="text" value={name} />
            </label>
            <label>
              <span>{t('home.contact.emailLabel')}</span>
              <input autoComplete="email" name="email" onChange={(e) => setEmail(e.target.value)} placeholder={t('home.contact.emailPlaceholder')} required type="email" value={email} />
            </label>
            <label>
              <span>{t('home.contact.messageLabel')}</span>
              <textarea name="message" onChange={(e) => setMessage(e.target.value)} placeholder={t('home.contact.messagePlaceholder')} value={message} />
            </label>
            <button className={`ct-submit-button is-${status}`} type="submit">
              <span>{status === 'sent' ? t('home.contact.sent') : status === 'error' ? t('home.contact.error') : t('home.contact.send')}</span>
              {status === 'idle' && <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />}
              {status === 'sending' && <i aria-hidden="true" />}
            </button>
          </form>
        </div>

        <div className="ct-mail-ticker" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <a className="ct-mail-card" href="mailto:team@clerktree.com" key={index} tabIndex={-1}>
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
