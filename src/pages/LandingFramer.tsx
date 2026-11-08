import { type CSSProperties, type VideoHTMLAttributes, Fragment, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { isSaveDataEnabled, shouldAutoplayMedia } from '../utils/idle';
import { Footer, Header } from '../components/Landing/AgeroChrome';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/SEO';
import CapabilityShowcase from './solutions/CapabilityShowcase';
import Grainient from '../components/Brand/Grainient';
import { CaseStudy, ConnectorPanel, HeroAgentCard, LogoStrip, ProofChart, Spotlight, StoryTabs } from './home/HomeStory';
import './LandingFramer.css';

const BASE = 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev';
const HOME_CONTACT_VIDEO_SRC = `${BASE}/hero.mov`;

const clientLogos = [
  { alt: 'BMW', src: '/client-logos/bmw.svg?v=2', width: 40, mobileWidth: 28 },
  { alt: 'Snowflake', src: `${BASE}/client-logos/snowflake.svg`, width: 150, mobileWidth: 80 },
  { alt: 'HAWE Hydraulik SE', src: '/client-logos/hawe.svg', width: 120, mobileWidth: 64 },
  { alt: 'PostHog', src: `${BASE}/client-logos/posthog.svg`, width: 160, mobileWidth: 80 },
  { alt: 'Dacia', src: '/client-logos/dacia.svg', width: 105, mobileWidth: 60 },
  { alt: 'Zendesk', src: `${BASE}/client-logos/zendesk.svg`, width: 56, mobileWidth: 39 },
  { alt: 'Amplitude', src: `${BASE}/client-logos/amplitude.svg`, width: 140, mobileWidth: 80 },
];

const testimonialImage = 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev/thdbuilding.jpg';

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

const flowerIcon =
  'https://framerusercontent.com/images/bPFUMYGmKDGU6pubiY2MFnjtBAk.svg?width=16&height=16';

const HOME_VIDEO_UPLOAD_DATE = '2026-06-29';

export default function LandingFramer() {
  useAgeroPageMotion();
  const { t } = useLanguage();

  return (
    <div className="agero-works agero-home-page" id="agero-works">
      <SEO
        title="ClerkTree – Industrial AI for Machine Operations"
        description="Industrial AI for machine operations. ClerkTree turns machine signals, manuals and RFQs into predictive maintenance and agent-driven work orders. Built in Bavaria."
        canonical="https://clerktree.com/"
        preloadVideos={[
          { href: HOME_CONTACT_VIDEO_SRC, type: 'video/quicktime' },
        ]}
        videos={[
          {
            name: t('home.contact.heading'),
            description: t('home.contact.tagline'),
            contentUrl: HOME_CONTACT_VIDEO_SRC,
            thumbnailUrl: 'https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=2048',
            uploadDate: HOME_VIDEO_UPLOAD_DATE,
          },
        ]}
      />
      <div className="agero-top-area">
        <Header />

        <div className="agero-home-hero-copy" data-agero-reveal="hero">
          <h1 className="agero-hero-title" id="agero-works-title" style={{ columnGap: "0.22em" }}>
            <span>{t('home.hero.word1')}</span>
            <span className="agero-orange">{t('home.hero.word2')}</span>
            <span>{t('home.hero.word3')}</span>
            <span>{t('home.hero.word4')}</span>
          </h1>
          <p className="agero-hero-copy">{t('home.hero.copy')}</p>
          <div className="agero-hero-actions">
            <a className="agero-button agero-hero-cta" href="/contact">
              <span>{t('home.hero.cta')}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <section className="agero-home-prelude" aria-label={t('home.showcase.aria')}>
          <div className="agero-hero-stage agero-hero-stage--home has-demo hs-hero-panel" data-agero-reveal="up">
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


function useAgeroPageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.classList.add('agero-page-active');

    if (reduceMotion || isSaveDataEnabled()) {
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
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
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

    const worksRoot = document.querySelector<HTMLElement>('.agero-works');
    const bgSections = worksRoot ? (Array.from(worksRoot.children) as HTMLElement[]) : [];
    const fallbackBg = worksRoot ? window.getComputedStyle(worksRoot).backgroundColor : 'rgb(244, 244, 244)';
    const sectionBgs = bgSections.map((section) => {
      // Contact/footer get their dark look from video/image layers, so their
      // backgroundColor computes transparent — pin them to the matching dark.
      if (section.classList.contains('agero-contact') || section.classList.contains('agero-footer')) {
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

      // iOS Safari tints its floating bar from the sampled body color, so the
      // body background must track the section currently at the bottom edge.
      const bottomEdge = viewportHeight - 1;
      for (let i = bgSections.length - 1; i >= 0; i -= 1) {
        const rect = bgSections[i].getBoundingClientRect();
        if (rect.top <= bottomEdge && rect.bottom > bottomEdge) {
          if (sectionBgs[i] !== currentBodyBg) {
            currentBodyBg = sectionBgs[i];
            document.body.style.setProperty('--agero-body-bg', currentBodyBg);
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

function LazyVideo({
  autoPlay = true,
  preload,
  src,
  ...props
}: VideoHTMLAttributes<HTMLVideoElement> & { src: string }) {
  const shouldPlay = shouldAutoplayMedia();

  return (
    <video
      {...props}
      autoPlay={autoPlay && shouldPlay}
      crossOrigin="anonymous"
      preload={preload || (shouldPlay ? 'auto' : 'metadata')}
      src={src}
    />
  );
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
    <section className="agero-pricing" id="pricing" aria-labelledby="agero-pricing-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        ({t('home.pricing.kicker')})
      </p>
      <h2
        className="agero-section-title"
        data-agero-reveal="title"
        id="agero-pricing-title"
        aria-label={pricingHeading}
      >
        <SplitText text={pricingHeading} />
      </h2>

      <div className="agero-plan-list" data-agero-pricing-stack>
        {localizedPlans.map((plan, index) => (
          <article
            className={`agero-plan-card${plan.featured ? ' agero-plan-card-featured' : ''}`}
            data-agero-reveal="up"
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
            <div className="agero-plan-left">
              <div className="agero-plan-tags">
                <span className="agero-plan-badge">{planMeta[language === 'de' ? 'de' : 'en'][index].badge}</span>
                {planMeta[language === 'de' ? 'de' : 'en'][index].chips.map((chip) => <span className="agero-plan-chip" key={chip}>{chip}</span>)}
              </div>
              <div>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>
              <div className="agero-delivery">
                <span>{t('home.pricing.setupLabel')}</span>
                <span>{t('home.pricing.setupValue')}</span>
              </div>
            </div>

            <div className="agero-plan-right">
              <div className="agero-price">
                {plan.prefix && <span>{plan.prefix}</span>}
                <strong>{plan.price}</strong>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <a className="agero-button agero-plan-button" href="/contact">
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
    <section className="agero-faq" aria-labelledby="agero-faq-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        ({t('home.faq.kicker')})
      </p>
      <h2 className="agero-section-title" data-agero-reveal="title" id="agero-faq-title">
        {t('home.faq.heading')}
      </h2>
      <p className="agero-faq-subtitle" data-agero-reveal="up">
        {t('home.faq.subtitle')}
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
                      <span aria-hidden="true" className="agero-faq-icon" />
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
  const { t } = useLanguage();
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

  const connectHeading = t('home.contact.heading');
  const subheading = t('home.contact.subheading');

  return (
    <section className="agero-contact" id="contact" aria-labelledby="agero-contact-title">
      <h2 className="sr-only" id="agero-contact-title">
        {connectHeading}
      </h2>

      <div className="agero-contact-panel" data-agero-reveal="up">
        <LazyVideo
          autoPlay
          loop
          muted
          playsInline
          className="agero-contact-bg-video"
          src={HOME_CONTACT_VIDEO_SRC}
        />
        <div className="agero-contact-top">
          <div className="agero-contact-copy">
            <h3 aria-label={subheading}>
              <SplitText text={subheading} />
            </h3>
            <p>{t('home.contact.tagline')}</p>
          </div>

          <form className="agero-contact-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label>
              <span>{t('home.contact.nameLabel')}</span>
              <input onChange={(e) => setName(e.target.value)} placeholder={t('home.contact.namePlaceholder')} type="text" value={name} />
            </label>
            <label>
              <span>{t('home.contact.emailLabel')}</span>
              <input onChange={(e) => setEmail(e.target.value)} placeholder={t('home.contact.emailPlaceholder')} type="email" value={email} />
            </label>
            <label>
              <span>{t('home.contact.messageLabel')}</span>
              <textarea onChange={(e) => setMessage(e.target.value)} placeholder={t('home.contact.messagePlaceholder')} value={message} />
            </label>
            <button className={`agero-submit-button is-${status}`} type="submit">
              <span>{status === 'sent' ? t('home.contact.sent') : status === 'error' ? t('home.contact.error') : t('home.contact.send')}</span>
              {status === 'sending' && <i aria-hidden="true" />}
            </button>
          </form>
        </div>

        <div className="agero-mail-ticker" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <a className="agero-mail-card" href="mailto:team@clerktree.com" key={index} tabIndex={-1}>
              <img alt="" decoding="async" loading="lazy" src={flowerIcon} />
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
