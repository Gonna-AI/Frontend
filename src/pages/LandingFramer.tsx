import { type CSSProperties, type ReactNode, type VideoHTMLAttributes, Fragment, useEffect, useRef, useState } from 'react';
import { Compass, Globe2, MapPin, PanelTop, PenTool, Sparkles } from 'lucide-react';
import Lenis from 'lenis';
import { isSaveDataEnabled, shouldAutoplayMedia } from '../utils/idle';
import { Footer } from '../components/Landing/AgeroChrome';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import SEO from '../components/SEO';
import './LandingFramer.css';

const BASE = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck';
const HOME_HERO_VIDEO_SRC = `${BASE}/entrybox.mov`;
const HOME_CONTACT_VIDEO_SRC = `${BASE}/hero.mov`;

const works = [
  {
    key: 'work1' as const,
    accent: '#e8651a',
    page: '01',
    bg: 'https://framerusercontent.com/images/x3RMizQqFhQ9G8jF5dqqcbxY8M.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO1.mp4`,
    href: '/solutions',
  },
  {
    key: 'work2' as const,
    accent: '#232323',
    page: '02',
    bg: 'https://framerusercontent.com/images/MHwFX5PK3mWp7JJNseH8110qdg.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO2.mp4`,
    href: '/solutions',
  },
  {
    key: 'work3' as const,
    accent: '#ffffff',
    page: '03',
    bg: 'https://framerusercontent.com/images/jXErNhJ75aLqKEeFiIYT76adrM8.png?scale-down-to=2048',
    cover: `${BASE}/VIDEO3.mp4`,
    href: '/contact',
  },
];

const clientLogos = [
  { alt: 'THD', src: `${BASE}/THD.png`, width: 200 },
  { alt: 'TUM', src: `${BASE}/TUM1.svg`, width: 210 },
  { alt: 'Partner', src: `${BASE}/3cWSgJFsUVvZeOw9LdQmTOSVFhE.svg`, width: 120 },
];

const showcaseImage = '/desktop1.png';

const shellLinkPaths = [
  ['nav.solutions', '/solutions'],
  ['nav.about', '/about'],
  ['nav.blog', '/blog'],
  ['nav.docs', '/docs'],
  ['home.nav.contact', '/contact'],
] as const;

const shellMobileLinkPaths = [
  ['nav.solutions', '/solutions'],
  ['nav.docs', '/docs'],
  ['nav.about', '/about'],
  ['nav.blog', '/blog'],
] as const;

const introTagsBase = [
  { key: 'tag1' as const, Icon: Sparkles },
  { key: 'tag2' as const, Icon: Globe2 },
  { key: 'tag3' as const, Icon: Globe2 },
  { key: 'tag4' as const, Icon: PenTool },
  { key: 'tag5' as const, Icon: PanelTop },
  { key: 'tag6' as const, Icon: Compass },
];

const locationImage = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/munich.jpg';

const testimonialImage = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/thdbuilding.jpg';

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

type LocalizedWork = (typeof works)[number] & {
  title: string;
  role: string;
  description: string;
  services: string[];
};

const flowerIcon =
  'https://framerusercontent.com/images/bPFUMYGmKDGU6pubiY2MFnjtBAk.svg?width=16&height=16';

const ribbonFlower = 'https://framerusercontent.com/images/InxDM6L8xjRn2ZsMquQwkLQ0VLA.svg';
const ribbonFlowerOrange = 'https://framerusercontent.com/images/7LCWzuhI2N54jKdu359awJ6cKLU.svg';

export default function LandingFramer() {
  useAgeroPageMotion();
  const { t } = useLanguage();

  return (
    <div className="agero-works" id="agero-works">
      <SEO
        title="ClerkTree"
        description="AI-powered workflow automation for claims and back-office operations. Transform your operations with intelligent automation that reduces turnaround time by 40%."
        canonical="https://clerktree.com/"
        preloadVideos={[
          { href: HOME_HERO_VIDEO_SRC, type: 'video/quicktime' },
          { href: works[0].cover },
          { href: works[1].cover },
          { href: works[2].cover },
          { href: HOME_CONTACT_VIDEO_SRC, type: 'video/quicktime' },
        ]}
      />
      <div className="agero-top-area">
        <ShellHeader />

        <HomePrelude
          heroContent={
            <div
              className="agero-hero-stage-content agero-hero-stage-content--home"
              aria-labelledby="agero-works-title"
              data-agero-reveal="hero"
            >
              <h1 className="agero-hero-title" id="agero-works-title">
                <span>{t('home.hero.word1')}</span>
                <span className="agero-orange">{t('home.hero.word2')}</span>
                <span className="agero-muted">{t('home.hero.word3')}</span>
                <span>{t('home.hero.word4')}</span>
              </h1>

              <p className="agero-hero-copy">
                {t('home.hero.copy')}
              </p>

              <a className="agero-button agero-hero-cta" href="/contact">
                <span>{t('home.hero.cta')}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          }
        />
      </div>

      <RibbonStage />
      <IntroStatement />
      <LocationIntro />
      <Testimonials />

      <Portfolio />

      <Pricing />
      <Faq />
      <Contact />
      <Footer />
    </div>
  );
}

function Portfolio() {
  const { t } = useLanguage();
  const localizedWorks = works.map((work) => ({
    ...work,
    title: t(`home.${work.key}.title`),
    role: t(`home.${work.key}.role`),
    description: t(`home.${work.key}.description`),
    services: [1, 2, 3, 4].map((n) => t(`home.${work.key}.service${n}`)),
  }));

  return (
    <section className="agero-portfolio" aria-labelledby="agero-portfolio-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        ({t('home.portfolio.kicker')})
      </p>
      <h2
        className="agero-portfolio-title"
        data-agero-reveal="title"
        id="agero-portfolio-title"
      >
        {t('home.portfolio.heading')}
      </h2>

      <div className="agero-work-list">
        {localizedWorks.map((work, index) => (
          <WorkCard index={index} key={work.key} work={work} />
        ))}
      </div>
    </section>
  );
}

function ShellHeader() {
  const { t } = useLanguage();
  const shellLinks = shellLinkPaths.map(([key, href]) => [t(key), href] as const);
  const shellMobileLinks = shellMobileLinkPaths.map(([key, href]) => [t(key), href] as const);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const shouldLockScroll = window.matchMedia('(max-width: 767px)').matches;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (shouldLockScroll) {
        document.body.style.overflow = previousOverflow;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`agero-shell-header${isMenuOpen ? ' is-menu-open' : ''}`}>
      <a className="agero-shell-logo" href="/" aria-label={t('home.brand.aria')}>
        <ClerkTreeLogo markClassName="agero-shell-logo-mark" registered />
      </a>
      <div className="agero-shell-actions">
        <nav className="agero-shell-nav" id="agero-shell-nav" aria-label={t('home.nav.aria')}>
          {shellLinks.map(([label, href]) => (
            <a href={href} key={label} onClick={closeMenu}>
              {label}
            </a>
          ))}
        </nav>
        <div className="agero-shell-lang">
          <LanguageSwitcher isExpanded forceDark={false} />
        </div>
        <button
          aria-controls="agero-shell-nav agero-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? t('home.menu.close') : t('home.menu.open')}
          className={`agero-shell-menu${isMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && (
        <div className="agero-mobile-menu" id="agero-mobile-menu">
          <button
            aria-label={t('home.menu.closeMobile')}
            className="agero-mobile-menu-scrim"
            onClick={closeMenu}
            type="button"
          />

          <button
            aria-label={t('home.menu.close')}
            className="agero-mobile-menu-close-fab"
            onClick={closeMenu}
            type="button"
          >
            <span />
            <span />
          </button>

          <div className="agero-mobile-menu-panel" role="navigation" aria-label={t('home.menu.navAria')}>
            <div className="agero-mobile-menu-top">
              <span>{t('home.menu.title')}</span>
              <LanguageSwitcher isExpanded forceDark={false} />
            </div>

            <div className="agero-mobile-menu-links">
              {shellMobileLinks.map(([label, href]) => (
                <a href={href} key={label} onClick={closeMenu}>
                  {label}
                </a>
              ))}
            </div>

            <a className="agero-mobile-menu-cta" href="/contact" onClick={closeMenu}>
              <span>{t('home.menu.cta')}</span>
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePrelude({ heroContent }: { heroContent: ReactNode }) {
  const { t } = useLanguage();
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
    <section className="agero-home-prelude" aria-label={t('home.showcase.aria')}>
      <div className="agero-showcase-shell" data-agero-reveal="up">
        <div className="agero-hero-stage agero-hero-stage--home">
          <LazyVideo
            className="agero-hero-stage-media"
            muted
            loop
            playsInline
            src={HOME_HERO_VIDEO_SRC}
          />
          <div className="agero-hero-stage-scrim" aria-hidden="true" />
          {heroContent}
        </div>

        <div className="agero-client-logo-strip">
          <div className="agero-client-logo-track" aria-label={t('home.showcase.logosAria')} ref={logoTrackRef}>
            {Array.from({ length: 2 }).map((_, groupIndex) => (
              <div className="agero-client-logo-set" aria-hidden={groupIndex > 0} key={groupIndex}>
                {clientLogos.map((logo) => (
                  <img
                    alt={groupIndex === 0 ? logo.alt : ''}
                    decoding="async"
                    height="32"
                    key={`${groupIndex}-${logo.src}`}
                    loading="lazy"
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
  const { t } = useLanguage();
  const metricItems = [1, 2, 3].map((n) => t(`home.ribbon.metric${n}`));
  const serviceItems = [1, 2, 3].map((n) => t(`home.ribbon.service${n}`));

  return (
    <section className="agero-ribbon-stage" aria-hidden="true">
      <RibbonRow items={metricItems} variant="black" />
      <RibbonRow items={serviceItems} variant="orange" />
    </section>
  );
}

function IntroStatement() {
  const { t } = useLanguage();
  const introTags = introTagsBase.map(({ key, Icon }) => ({ Icon, label: t(`home.about.${key}`) }));

  return (
    <section className="agero-about-intro" aria-labelledby="agero-about-intro-title">
      <div className="agero-hello" data-agero-reveal="up">
        <span aria-hidden="true">(</span>
        <span className="agero-hello-script">{t('home.about.kicker')}</span>
        <span aria-hidden="true">)</span>
      </div>

      <h2
        className="agero-about-heading"
        data-agero-reveal="title"
        id="agero-about-intro-title"
      >
        {t('home.about.headingPre')}{' '}
        <span>{t('home.about.headingEmphasis')}</span> {t('home.about.headingPost')}
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
  const { t } = useLanguage();
  const locationDetails = [
    [t('home.office.addressLabel'), t('home.office.address')],
    [t('home.office.regionLabel'), t('home.office.region')],
  ];

  return (
    <section className="agero-founder" aria-labelledby="agero-founder-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        ({t('home.office.kicker')})
      </p>
      <h2 className="agero-founder-watermark" data-agero-reveal="title">
        {t('home.office.heading')}
      </h2>

      <div className="agero-founder-grid">
        <figure className="agero-founder-portrait" data-agero-reveal="up">
          <img alt={t('home.office.imageAlt')} className="agero-founder-image" decoding="async" loading="lazy" src={locationImage} />
          <div className="agero-founder-socials" aria-label={t('home.office.socialAria')}>
            <a
              aria-label={t('home.office.mapAria')}
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
            <h3 id="agero-founder-title">{t('home.office.title')}</h3>
            <p>
              {t('home.office.desc')}
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
            <img alt="" decoding="async" loading="lazy" src={variant === 'orange' ? ribbonFlowerOrange : ribbonFlower} />
          </span>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const { t } = useLanguage();
  const testimonialStats = [1, 2, 3].map((n) => [t(`home.testimonials.stat${n}Value`), t(`home.testimonials.stat${n}Label`)]);
  const testimonial = {
    quote: t('home.testimonial.quote'),
    name: t('home.testimonial.name'),
    role: t('home.testimonial.role'),
  };

  return (
    <section className="agero-testimonials" aria-labelledby="agero-testimonials-title">
      <p className="agero-section-kicker" data-agero-reveal="up">
        ({t('home.testimonials.kicker')})
      </p>
      <h2
        className="agero-testimonial-watermark"
        data-agero-reveal="title"
        id="agero-testimonials-title"
      >
        {t('home.testimonials.heading')}
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
          style={{ '--testimonial-image': `url("${testimonialImage}")` } as CSSProperties}
        >
          <img alt="THD GmbH plant" className="agero-testimonial-image" decoding="async" loading="lazy" src={testimonialImage} />
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

    const worksRoot = document.querySelector<HTMLElement>('.agero-works');
    const bgSections = worksRoot ? (Array.from(worksRoot.children) as HTMLElement[]) : [];
    const fallbackBg = worksRoot ? window.getComputedStyle(worksRoot).backgroundColor : 'rgb(220, 220, 220)';
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


function WorkCard({ index, work }: { index: number; work: LocalizedWork }) {
  const { t } = useLanguage();
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
        <span className="agero-sol-role">{work.role}</span>
      </div>

      <div className="agero-sol-body">
        <div className="agero-sol-title-row">
          <h3 className="agero-sol-title">{work.title}</h3>
          <a aria-label={t('home.work.viewAria').replace('{title}', work.title)} className="agero-sol-arrow" href={work.href}>
            ↗
          </a>
        </div>
        <p className="agero-sol-desc">{work.description}</p>
        <div className="agero-sol-tags" aria-label={t('home.work.servicesAria')}>
          {work.services.map((service) => (
            <span className="agero-sol-tag" key={service}>{service}</span>
          ))}
        </div>
      </div>

      <a aria-label={t('home.work.seeActionAria').replace('{title}', work.title)} className="agero-sol-media" href={work.href}>
        <LazyVideo
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
  const { t } = useLanguage();
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
              <div className="agero-plan-icon" aria-hidden="true">
                {plan.featured ? '⌁' : '✦'}
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
      <h2
        aria-label={connectHeading}
        className="agero-contact-watermark"
        data-agero-reveal="title"
        id="agero-contact-title"
      >
        <SplitText text={connectHeading} />
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
