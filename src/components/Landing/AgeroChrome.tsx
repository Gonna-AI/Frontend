import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Activity, Briefcase, ChevronDown, Factory, FlaskConical, Scale, Shapes, Users, Wrench } from 'lucide-react';

import ClerkTreeLockup from '../Brand/ClerkTreeLockup';
import { playFirstVisitIntro, playLogoPortal, shouldPlayFirstVisitIntro } from '../Brand/logoPortal';
import BrandShader from '../Brand/BrandShader';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../pages/LandingFramer.css';
import '../../pages/SiteSystem.css';

const RESEARCH_URL = 'https://research.clerktree.com';

const headerLinkPaths = [
  ['nav.solutions', '/solutions'],
  ['nav.about', '/about'],
  ['nav.research', RESEARCH_URL],
  ['nav.blog', '/blog'],
] as const;

type NavMenuItem = { label: string; href: string; icon: ReactNode };
type NavEntry = { label: string; href: string; items?: NavMenuItem[] };

function buildDesktopNav(language: string, t: (key: string) => string, linkBase: string): NavEntry[] {
  const de = language === 'de';
  const local = (path: string) => `${linkBase}${path}`;
  return [
    {
      label: t('nav.solutions'),
      href: local('/solutions'),
      items: [
        { label: t('solutions.card1Title'), href: local('/solutions#cx-signal'), icon: <Activity /> },
        { label: t('solutions.card2Title'), href: local('/solutions#cx-agent'), icon: <Wrench /> },
        { label: de ? 'Lieferantenentscheidungen' : 'Supplier decisions', href: local('/solutions#cx-rfq'), icon: <Scale /> },
        { label: t('solutions.card5Title'), href: local('/solutions#cx-production'), icon: <Factory /> },
      ],
    },
    {
      label: de ? 'Unternehmen' : 'Company',
      href: local('/about'),
      items: [
        { label: t('nav.about'), href: local('/about'), icon: <Users /> },
        { label: t('nav.research'), href: RESEARCH_URL, icon: <FlaskConical /> },
        { label: de ? 'Karriere' : 'Careers', href: local('/careers'), icon: <Briefcase /> },
        { label: 'Brand', href: local('/brand'), icon: <Shapes /> },
      ],
    },
    { label: de ? 'Sicherheit' : 'Security', href: local('/security') },
    { label: t('nav.blog'), href: local('/blog') },
  ];
}

/** Text that rolls up to a copy of itself on hover (pure CSS, see .ct-roll). */
function Roll({ children }: { children: ReactNode }) {
  return (
    <span className="ct-roll">
      <span className="ct-roll-inner">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerCompanyLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Research', href: RESEARCH_URL },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Brand', href: '/brand' },
];

const footerProductLinks: FooterLink[] = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Security', href: '/security' },
  { label: 'Contact', href: '/contact' },
];

const footerSocialLinks: FooterLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/clerktree', external: true },
  { label: 'X', href: 'https://x.com/teamclerktree', external: true },
  { label: 'Email', href: 'mailto:team@clerktree.com' },
];

const footerLegalLinks: FooterLink[] = [
  { label: 'Terms', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
];

function formatMunichTime() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin',
  }).format(new Date());
}

function useMunichTime(active = true) {
  const [time, setTime] = useState(() => formatMunichTime());

  useEffect(() => {
    if (!active) return undefined;

    setTime(formatMunichTime());
    const timer = window.setInterval(() => setTime(formatMunichTime()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return time;
}

type HeaderProps = {
  /** Prefix for every link, e.g. "https://clerktree.com" when rendered on another host. */
  linkBase?: string;
};

export function Header({ linkBase = '' }: HeaderProps = {}) {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerLinks = headerLinkPaths.map(([key, href]) => [
    t(key),
    href.startsWith('http') ? href : `${linkBase}${href}`,
  ] as const);
  const contactHref = `${linkBase}/contact`;
  const desktopNav = buildDesktopNav(language, t, linkBase);

  useEffect(() => {
    if (!isMenuOpen) return;

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
  const logoRef = useRef<HTMLAnchorElement>(null);
  const playLogo = () => playLogoPortal(logoRef.current?.querySelector('svg'));

  // First page of a visit: the portal intro plays once, after the page fades in.
  useEffect(() => {
    if (!shouldPlayFirstVisitIntro()) return undefined;
    const timer = window.setTimeout(() => playFirstVisitIntro(logoRef.current?.querySelector('svg')), 450);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <header className={`agero-shell-header${isMenuOpen ? ' is-menu-open' : ''}`}>
      <a className="agero-shell-logo" href={linkBase || '/'} aria-label={t('home.brand.aria')} ref={logoRef}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') playLogo(); }}
        onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) playLogo(); }}>
        <ClerkTreeLockup className="agero-shell-lockup" title={null} />
      </a>

      <nav className="agero-shell-nav" aria-label={t('home.nav.aria')}>
        {desktopNav.map((entry) => entry.items ? (
          <div className="agero-nav-item" key={entry.label}>
            <button className="agero-nav-trigger" type="button" aria-haspopup="true">
              <Roll>{entry.label}</Roll>
              <ChevronDown className="agero-nav-caret" aria-hidden="true" />
            </button>
            <div className="agero-nav-menu">
              <div className="agero-nav-panel">
                {entry.items.map((item, index) => (
                  <a className="agero-nav-menu-item" href={item.href} key={item.href} style={{ '--i': index } as CSSProperties}>
                    <span className="agero-nav-menu-ico" aria-hidden="true">{item.icon}</span>
                    <Roll>{item.label}</Roll>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <a href={entry.href} key={entry.label}>
            <Roll>{entry.label}</Roll>
          </a>
        ))}
      </nav>

      <div className="agero-shell-actions">
        <button
          aria-label={language === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English'}
          className="agero-shell-lang"
          onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
          type="button"
        >
          <span className={language === 'en' ? 'is-active' : undefined}>EN</span>
          <span className={language === 'de' ? 'is-active' : undefined}>DE</span>
        </button>
        <a className="agero-shell-cta" href={contactHref}>
          <span className="agero-shell-cta-label">{t('home.menu.cta')}</span>
          <span className="agero-shell-cta-icon" aria-hidden="true">
            <span className="agero-shell-cta-track">
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </span>
        </a>
        <button
          aria-controls="agero-mobile-menu"
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
              <LanguageSwitcher isExpanded forceLight />
            </div>

            <div className="agero-mobile-menu-links">
              {headerLinks.map(([label, href]) => (
                <a href={href} key={href} onClick={closeMenu}>
                  {label}
                </a>
              ))}
            </div>

            <a className="agero-mobile-menu-cta" href={contactHref} onClick={closeMenu}>
              <span>{t('home.menu.cta')}</span>
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

type PageHeroProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Extra hero content under the description (meta, actions). */
  children?: ReactNode;
  titleId?: string;
  linkBase?: string;
};

/** The standard page opening: shared header plus the dark rounded hero box. */
export function PageHero({ title, eyebrow, description, children, titleId = 'page-hero-title', linkBase }: PageHeroProps) {
  return (
    <div className="agero-top-area agero-top-area-with-hero">
      <Header linkBase={linkBase} />

      <section className="agero-hero-stage agero-page-hero" aria-labelledby={titleId}>
        <BrandShader />
        <div className="agero-hero-stage-content">
          {eyebrow && <p className="agero-page-hero-eyebrow">{eyebrow}</p>}
          <h1 id={titleId}>{title}</h1>
          {description && <p>{description}</p>}
          {children}
        </div>
      </section>
    </div>
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

export function Footer() {
  const { language } = useLanguage();
  const footerRef = useRef<HTMLElement>(null);
  const [isFooterNearViewport, setIsFooterNearViewport] = useState(false);
  const munichTime = useMunichTime(isFooterNearViewport);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsFooterNearViewport(true);
        }
      },
      { rootMargin: '600px 0px', threshold: 0 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="agero-footer" ref={footerRef}>
      <div className="agero-footer-inner">
        <div className="agero-footer-main">
          <div className="agero-footer-cta">
            <p>
              {language === 'de' ? <>KI-Harness für<br />Industriemaschinen.</> : <>Industrial AI harness<br />for machinery.</>}
            </p>
            <a className="agero-footer-cta-button" href="/contact">
              <span aria-hidden="true">+</span>
              {language === 'de' ? 'Kontakt aufnehmen' : 'Get in touch'}
            </a>
          </div>

          <div className="agero-footer-columns">
            <FooterColumn title="Company" links={footerCompanyLinks} />
            <FooterColumn title="Product" links={footerProductLinks} />
            <FooterColumn title="Socials" links={footerSocialLinks} />
          </div>
        </div>

        <div className="agero-footer-bottom">
          <div className="agero-footer-copyright">
            <p>© 2026 ClerkTree. All rights reserved.</p>
            <img alt="GDPR Compliant" decoding="async" loading="lazy" src="/gdpr-compliant.webp" />
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
