import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../contexts/LanguageContext';
import { Footer } from '../components/Landing/AgeroChrome';
import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import LanguageSwitcher from '../components/Layout/LanguageSwitcher';
import { shouldAutoplayMedia } from '../utils/idle';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Solutions.css';

const SOLUTIONS_HERO_VIDEO_SRC =
  'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/solutiosboagevidoe.mp4';

const solutionsNavLinkPaths = [
  ['nav.solutions', '/solutions'],
  ['nav.about', '/about'],
  ['nav.blog', '/blog'],
  ['nav.docs', '/docs'],
  ['home.nav.contact', '/contact'],
] as const;

export default function Solutions() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const shouldPlayVideo = shouldAutoplayMedia();
  const solutionsNavLinks = solutionsNavLinkPaths.map(([key, href]) => [t(key), href] as const);
  const mobileLinks = solutionsNavLinks.filter(([, href]) => href !== '/contact');
  const closeMenu = () => setIsMenuOpen(false);

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

  const heroServices = [
    t('solutions.card1Title'),
    t('solutions.card2Title'),
    t('solutions.card3Title'),
    t('solutions.card5Title'),
  ];

  const capabilityCards = [
    {
      title: t('solutions.card1Title'),
      description: t('solutions.card1Desc'),
      features: [t('solutions.card1Feat1'), t('solutions.card1Feat2'), t('solutions.card1Feat3')],
    },
    {
      title: t('solutions.card2Title'),
      description: t('solutions.card2Desc'),
      features: [t('solutions.card2Feat1'), t('solutions.card2Feat2'), t('solutions.card2Feat3')],
    },
    {
      title: t('solutions.card3Title'),
      description: t('solutions.card3Desc'),
      features: [t('solutions.card3Feat1'), t('solutions.card3Feat2'), t('solutions.card3Feat3')],
    },
    {
      title: t('solutions.card4Title'),
      description: t('solutions.card4Desc'),
      features: [t('solutions.card4Feat1'), t('solutions.card4Feat2'), t('solutions.card4Feat3')],
    },
    {
      title: t('solutions.card5Title'),
      description: t('solutions.card5Desc'),
      features: [t('solutions.card5Feat1'), t('solutions.card5Feat2'), t('solutions.card5Feat3')],
    },
    {
      title: t('solutions.card6Title'),
      description: t('solutions.card6Desc'),
      features: [t('solutions.card6Feat1'), t('solutions.card6Feat2'), t('solutions.card6Feat3')],
    },
  ];

  return (
    <div className="agero-works clerktree-solutions-page">
      <SEO
        title="Solutions"
        description="Explore ClerkTree's industrial machine intelligence layer for telemetry, predictive maintenance, production analytics, and maintenance workflow orchestration."
        canonical="https://clerktree.com/solutions"
        preloadVideos={[{ href: SOLUTIONS_HERO_VIDEO_SRC }]}
      />
      <main className="clerktree-solutions-main">
        <section className="fabric-solution-shell" aria-labelledby="solutions-title">
          <header className={`fabric-solution-topbar agero-shell-header${isMenuOpen ? ' is-menu-open' : ''}`}>
            <a className="agero-shell-logo" href="/" aria-label={t('home.brand.aria')}>
              <ClerkTreeLogo markClassName="agero-shell-logo-mark" registered />
            </a>

            <div className="agero-shell-actions">
              <nav className="agero-shell-nav" id="agero-shell-nav" aria-label={t('home.nav.aria')}>
                {solutionsNavLinks.map(([label, href]) => (
                  <a href={href} key={label} onClick={closeMenu}>
                    {label}
                  </a>
                ))}
              </nav>
              <div className="agero-shell-lang">
                <LanguageSwitcher isExpanded forceLight />
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
          </header>

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
                  <LanguageSwitcher isExpanded forceLight />
                </div>

                <div className="agero-mobile-menu-links">
                  {mobileLinks.map(([label, href]) => (
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

          <div className="fabric-solution-stage">
            {SOLUTIONS_HERO_VIDEO_SRC ? (
              <video
                className="fabric-solution-video"
                src={SOLUTIONS_HERO_VIDEO_SRC}
                autoPlay={shouldPlayVideo}
                loop
                muted
                playsInline
                preload={shouldPlayVideo ? 'auto' : 'metadata'}
                crossOrigin="anonymous"
                aria-label="ClerkTree solutions video"
              />
            ) : (
              <div className="fabric-solution-video-placeholder" aria-hidden="true" />
            )}

            <div className="fabric-solution-grain" aria-hidden="true" />
            <div className="fabric-solution-shadow" aria-hidden="true" />

            <div className="fabric-solution-brand fabric-solution-brand--single">
              <h1 id="solutions-title">{t('solutions.eyebrow')}</h1>
            </div>

            <ul className="fabric-solution-list" aria-label="ClerkTree solution capabilities">
              {heroServices.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>

            <span className="fabric-solution-plus plus-one" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-two" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-three" aria-hidden="true">+</span>
            <span className="fabric-solution-plus plus-four" aria-hidden="true">+</span>

            <p className="fabric-solution-copy">{t('solutions.subtitle')}</p>
            <p className="fabric-solution-copyright">© 2026 ClerkTree Systems</p>
          </div>
        </section>

        <section className="fabric-capabilities" aria-labelledby="solutions-capabilities-title">
          <div className="fabric-capabilities-heading">
            <p>{t('solutions.capabilitiesEyebrow')}</p>
            <h2 id="solutions-capabilities-title">{t('solutions.capabilitiesTitle')}</h2>
          </div>

          <div className="fabric-capabilities-grid">
            {capabilityCards.map((card, index) => (
              <article className="fabric-capability-card" key={card.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <ul>
                  {card.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="fabric-solution-cta" aria-labelledby="solutions-cta-title">
          <p>{t('solutions.ctaBadge')}</p>
          <h2 id="solutions-cta-title">
            {t('solutions.ctaTitle1')} {t('solutions.ctaTitle2')}
          </h2>
          <span>
            {t('solutions.ctaDesc')} {t('solutions.ctaDescHighlight')} {t('solutions.ctaDescEnd')}
          </span>
          <button type="button" onClick={() => navigate('/contact')}>
            {t('solutions.bookDemo')}
            <ArrowRight aria-hidden="true" size={20} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
