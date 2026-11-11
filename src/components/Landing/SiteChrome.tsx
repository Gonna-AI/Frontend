import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Activity, ArrowUpRight, Briefcase, ChevronDown, ChevronRight, Factory, FlaskConical, Mail, Scale, Shapes, Users, Wrench } from 'lucide-react';
import { siX } from 'simple-icons';
import { NavigationMenu } from 'radix-ui';

import ClerkTreeLockup from '../Brand/ClerkTreeLockup';
import { shouldPlayFirstVisitIntro } from '../Brand/logoPortal';
import { cancelIdle, runWhenIdle } from '../../utils/idle';
import { pauseDecor } from '../../utils/perf';
import Grainient from '../Brand/Grainient';
import FooterAscii from './FooterAscii';
import { COMPANY } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import { openConsentSettings } from '../../lib/consent';
import '../../pages/LandingFramer.css';
import '../../pages/SiteSystem.css';
import './FooterDesign.css';

const RESEARCH_URL = 'https://research.clerktree.com';

/**
 * Links that leave this origin (to the research or main site) cannot share localStorage, so the
 * visitor's language travels in the URL instead and the other site starts in the same language.
 */
function crossSite(url: string, language: string): string {
  try {
    const target = new URL(url, window.location.origin);
    if (target.origin === window.location.origin) return url;
    target.searchParams.set('lang', language);
    return target.href;
  } catch {
    return url;
  }
}

type NavMenuItem = { label: string; href: string; icon: ReactNode; desc?: string };
type NavEntry = { label: string; href: string; items?: NavMenuItem[] };

function buildDesktopNav(language: string, t: (key: string) => string, linkBase: string): NavEntry[] {
  const de = language === 'de';
  const local = (path: string) => (linkBase ? crossSite(`${linkBase}${path}`, language) : path);
  return [
    {
      label: t('nav.solutions'),
      href: local('/#solutions'),
      items: [
        { label: t('solutions.card1Title'), href: local('/#cx-signal'), icon: <Activity />, desc: de ? 'Veränderungen an der Linie früh erkennen' : 'Catch changes on the line early' },
        { label: t('solutions.card2Title'), href: local('/#cx-agent'), icon: <Wrench />, desc: de ? 'Aufträge mit Belegen planen' : 'Plan work orders with evidence' },
        { label: de ? 'Lieferantenentscheidungen' : 'Supplier decisions', href: local('/#cx-rfq'), icon: <Scale />, desc: de ? 'Angebote und Risiken vergleichen' : 'Compare quotes and risk' },
        { label: t('solutions.card5Title'), href: local('/#cx-production'), icon: <Factory />, desc: de ? 'Ausstoß, Ausschuss und Stillstand' : 'Output, scrap and downtime' },
      ],
    },
    {
      label: de ? 'Unternehmen' : 'Company',
      href: local('/about'),
      items: [
        { label: t('nav.about'), href: local('/about'), icon: <Users />, desc: de ? 'Team und Mission' : 'Team and mission' },
        { label: t('nav.research'), href: crossSite(RESEARCH_URL, language), icon: <FlaskConical />, desc: de ? 'Paper und Benchmarks' : 'Papers and benchmarks' },
        { label: de ? 'Karriere' : 'Careers', href: local('/careers'), icon: <Briefcase />, desc: de ? 'Offene Stellen' : 'Open roles' },
        { label: 'Brand', href: local('/brand'), icon: <Shapes />, desc: de ? 'Logos und Richtlinien' : 'Logos and guidelines' },
      ],
    },
    { label: 'Hive', href: local('/hive') },
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

function buildFooter(de: boolean) {
  return {
    company: {
      title: de ? 'Unternehmen' : 'Company',
      links: [
        { label: de ? 'Über uns' : 'About Us', href: '/about' },
        { label: de ? 'Forschung' : 'Research', href: RESEARCH_URL },
        { label: 'Blog', href: '/blog' },
        { label: de ? 'Karriere' : 'Careers', href: '/careers' },
        { label: 'Brand', href: '/brand' },
      ] satisfies FooterLink[],
    },
    product: {
      title: de ? 'Produkt' : 'Product',
      links: [
        { label: 'Hive', href: '/hive' },
        { label: de ? 'Sicherheit' : 'Security', href: '/security' },
        { label: de ? 'Kontakt' : 'Contact', href: '/contact' },
      ] satisfies FooterLink[],
    },
    social: {
      title: de ? 'Soziale Medien' : 'Socials',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/clerktree', external: true },
        { label: 'X', href: 'https://x.com/teamclerktree', external: true },
        { label: de ? 'E-Mail' : 'Email', href: `mailto:${COMPANY.email}` },
      ] satisfies FooterLink[],
    },
    legal: [
      { label: de ? 'Impressum' : 'Imprint', href: '/imprint' },
      { label: de ? 'Datenschutz' : 'Privacy', href: '/privacy-policy' },
      { label: de ? 'Nutzungsbedingungen' : 'Terms', href: '/terms-of-service' },
      { label: 'Cookies', href: '/cookie-policy' },
    ] satisfies FooterLink[],
    cookieSettings: de ? 'Cookie-Einstellungen' : 'Cookie settings',
    rights: de ? 'Alle Rechte vorbehalten.' : 'All rights reserved.',
    backToTop: de ? 'Nach oben' : 'Back to top',
    munich: de ? 'München' : 'Munich',
  };
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

const loadLiquidMetalMark = () => import('../Brand/LiquidMetalMark');
const LiquidMetalMark = lazy(loadLiquidMetalMark);
const LOGO_INTRO_KEY = 'ct-logo-portal';

/**
 * Logo moment: the mark flows into liquid metal, then the metal fades back off the solid mark.
 * phase: idle → chrome (metal flowing) → cooling (metal fades over the mark) → idle.
 */
function useLogoChrome() {
  const [phase, setPhase] = useState<'idle' | 'chrome' | 'cooling'>('idle');
  const [loaded, setLoaded] = useState(false);
  const timers = useRef<number[]>([]);
  const play = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timers.current.forEach((id) => window.clearTimeout(id));
    setLoaded(true);
    setPhase('chrome');
    timers.current = [
      window.setTimeout(() => setPhase('cooling'), 2600),
      window.setTimeout(() => setPhase('idle'), 3300),
    ];
  };
  useEffect(() => {
    // Fetch the shader ahead of time so the first hover starts instantly.
    const handle = runWhenIdle(() => { void loadLiquidMetalMark(); });
    return () => {
      cancelIdle(handle);
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);
  return { phase, loaded, play };
}

export function Header({ linkBase = '' }: HeaderProps = {}) {
  const { t, language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sheetGeo, setSheetGeo] = useState<CSSProperties>({});
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const headHeight = useRef(64);
  const closeTimer = useRef(0);
  const contactHref = linkBase ? crossSite(`${linkBase}/contact`, language) : '/contact';
  const desktopNav = buildDesktopNav(language, t, linkBase);

  useEffect(() => {
    if (!isMenuOpen) return;

    // Freeze the page behind the menu. A class on <html> (see LandingFramer.css) stops scrolling
    // without moving or re-laying-out the page, so opening costs nothing on a long page and closing
    // needs no scroll position to be restored. The page's own animations hold still meanwhile, so
    // the menu animates alone.
    const html = document.documentElement;
    html.classList.add('ct-menu-open');
    const releaseDecor = pauseDecor();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      html.classList.remove('ct-menu-open');
      releaseDecor();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // The sheet grows out of the header: it starts at the header's height and
  // expands to fit, and closing shrinks it back before it unmounts.
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const closeMenu = () => {
    const sheet = sheetRef.current;
    if (!sheet || reduceMotion()) { setIsMenuOpen(false); return; }
    if (closing) return;
    sheet.classList.remove('is-settled');
    sheet.style.height = `${sheet.offsetHeight}px`;
    void sheet.offsetHeight;
    sheet.style.height = `${headHeight.current}px`;
    setClosing(true);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => { setIsMenuOpen(false); setClosing(false); }, 440);
  };
  const closeRef = useRef(closeMenu);
  closeRef.current = closeMenu;
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  useLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!isMenuOpen || !sheet) return undefined;
    if (reduceMotion()) { sheet.classList.add('is-settled'); return undefined; }
    const target = Math.min(sheet.scrollHeight, window.innerHeight - 16);
    sheet.style.height = `${headHeight.current}px`;
    void sheet.offsetHeight;
    sheet.style.height = `${target}px`;
    const done = (event: TransitionEvent) => {
      if (event.propertyName !== 'height' || event.target !== sheet) return;
      sheet.style.height = '';
      sheet.classList.add('is-settled');
      sheet.removeEventListener('transitionend', done);
    };
    sheet.addEventListener('transitionend', done);
    return () => sheet.removeEventListener('transitionend', done);
  }, [isMenuOpen]);
  // The sheet's top row reuses the closed header's exact geometry, so the
  // close button lands where the menu button was and the logo does not move.
  const openMenu = () => {
    const logo = logoRef.current?.getBoundingClientRect();
    const btn = menuButtonRef.current?.getBoundingClientRect();
    if (logo && btn && btn.top >= 0) {
      const edge = 8;
      const pt = Math.max(10, btn.top - edge);
      headHeight.current = Math.round(pt * 2 + btn.height);
      setSheetGeo({
        '--mnav-pt': `${pt}px`,
        '--mnav-pl': `${Math.max(14, logo.left - edge)}px`,
        '--mnav-pr': `${Math.max(14, window.innerWidth - btn.right - edge)}px`,
        '--mnav-row': `${btn.height}px`,
      } as CSSProperties);
    } else {
      headHeight.current = 64;
      setSheetGeo({});
    }
    setOpenSection(null);
    setIsMenuOpen(true);
  };
  const logoRef = useRef<HTMLAnchorElement>(null);
  const logoChrome = useLogoChrome();
  const playLogo = logoChrome.play;

  // First page of a visit: the chrome moment plays once, after the page fades in.
  useEffect(() => {
    if (!shouldPlayFirstVisitIntro()) return undefined;
    const timer = window.setTimeout(() => {
      try { window.sessionStorage.setItem(LOGO_INTRO_KEY, '1'); } catch { /* storage blocked: harmless */ }
      playLogo();
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className={`ct-shell-header${isMenuOpen && !closing ? ' is-menu-open' : ''}`}>
      <a className={`ct-shell-logo is-${logoChrome.phase}`} href={linkBase ? crossSite(linkBase, language) : '/'} aria-label={t('home.brand.aria')} ref={logoRef}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') playLogo(); }}
        onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) playLogo(); }}>
        <ClerkTreeLockup className="ct-shell-lockup" title={null} />
        <span className="ct-logo-chrome" aria-hidden="true">
          {logoChrome.loaded && (
            <Suspense fallback={null}>
              <LiquidMetalMark className="ct-logo-chrome-canvas" scale={1} colorBack="#00000000" repetition={2.6} dispersion={0} speed={logoChrome.phase === 'idle' ? 0 : 2.4} contour={0.7} softness={0} pixelRatio={20} />
            </Suspense>
          )}
        </span>
        {/* Maps the metal's tones onto the brand orange: deep orange shadows, orange body, light-gold glints. */}
        <svg className="ct-logo-filter" width="0" height="0" aria-hidden="true" focusable="false">
          <filter id="ct-logo-orange" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues=".3 .78 1 1 1" />
              <feFuncG type="table" tableValues=".05 .17 .3 .55 .88" />
              <feFuncB type="table" tableValues="0 0 0 .12 .66" />
            </feComponentTransfer>
          </filter>
        </svg>
      </a>

      <NavigationMenu.Root className="ct-shell-nav" aria-label={t('home.nav.aria')} delayDuration={120} skipDelayDuration={300}>
        <NavigationMenu.List className="ct-nav-list">
        {desktopNav.map((entry) => entry.items ? (
          <NavigationMenu.Item className="ct-nav-item" key={entry.label}>
            <NavigationMenu.Trigger className="ct-nav-trigger">
              {(['is-left', 'is-right'] as const).map((side) => (
                <svg className={`ct-nav-shoulder ${side}`} key={side} viewBox="0 0 12 12" aria-hidden="true">
                  <path className="fill" d="M0 11.5A11.5 11.5 0 0 0 11.5 0H12V12H0Z" />
                  <path className="line" d="M0 11.5A11.5 11.5 0 0 0 11.5 0" />
                </svg>
              ))}
              <Roll>{entry.label}</Roll>
              <ChevronDown className="ct-nav-caret" aria-hidden="true" />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="ct-nav-panel">
                {entry.items.map((item, index) => (
                  <NavigationMenu.Link className="ct-nav-menu-item" href={item.href} key={item.href} style={{ '--i': index } as CSSProperties}>
                    <span className="ct-nav-menu-ico" aria-hidden="true">{item.icon}</span>
                    <Roll>{item.label}</Roll>
                  </NavigationMenu.Link>
                ))}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ) : (
          <NavigationMenu.Item key={entry.label}>
            <NavigationMenu.Link className="ct-nav-link" href={entry.href}><Roll>{entry.label}</Roll></NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div className="ct-shell-actions">
        <button
          aria-label={language === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English'}
          className="ct-shell-lang"
          onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
          type="button"
        >
          <span className={language === 'en' ? 'is-active' : undefined}>EN</span>
          <span className={language === 'de' ? 'is-active' : undefined}>DE</span>
        </button>
        <a className="ct-shell-cta" href={contactHref}>
          <span className="ct-shell-cta-label">{t('home.menu.cta')}</span>
          <span className="ct-shell-cta-icon" aria-hidden="true">
            <span className="ct-shell-cta-track">
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <svg viewBox="0 0 16 16" fill="none"><path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </span>
        </a>
        <button
          aria-controls="ct-mobile-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? t('home.menu.close') : t('home.menu.open')}
          className={`ct-shell-menu${isMenuOpen ? ' is-open' : ''}`}
          onClick={openMenu}
          ref={menuButtonRef}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && (
        <div className={`ct-mnav${closing ? ' is-closing' : ''}`} data-lenis-prevent="" id="ct-mobile-menu">
          <button aria-label={t('home.menu.closeMobile')} className="ct-mnav-scrim" onClick={closeMenu} type="button" />
          <nav className="ct-mnav-sheet" aria-label={t('home.menu.navAria')} ref={sheetRef} style={sheetGeo}>
            <div className="ct-mnav-top">
              <a className="ct-mnav-logo" href={linkBase ? crossSite(linkBase, language) : '/'} aria-label={t('home.brand.aria')} onClick={closeMenu}>
                <ClerkTreeLockup className="ct-shell-lockup" title={null} />
              </a>
              <button
                aria-label={language === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English'}
                className="ct-mnav-lang"
                onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                type="button"
              >
                <span className={language === 'en' ? 'is-active' : undefined}>EN</span>
                <span className={language === 'de' ? 'is-active' : undefined}>DE</span>
              </button>
              <button aria-label={t('home.menu.close')} className="ct-mnav-close" onClick={closeMenu} type="button">
                <span />
                <span />
              </button>
            </div>

            <ul className="ct-mnav-primary">
              {desktopNav.map((entry, i) => {
                const open = openSection === entry.label;
                return (
                  <li className={entry.items ? `has-sub${open ? ' is-open' : ''}` : undefined} key={entry.label} style={{ '--i': i } as CSSProperties}>
                    {entry.items ? (
                      <>
                        <button aria-expanded={open} className="ct-mnav-row" onClick={() => setOpenSection(open ? null : entry.label)} type="button">
                          {entry.label}
                          <span aria-hidden="true"><ChevronDown /></span>
                        </button>
                        <div aria-hidden={!open} className="ct-mnav-sub">
                          <div className="ct-mnav-clip">
                          <div className="ct-mnav-list">
                            {entry.items.map((item, k) => (
                              <a href={item.href} key={item.href} onClick={closeMenu} style={{ '--k': k } as CSSProperties} tabIndex={open ? undefined : -1}>
                                <span className="ct-mnav-ico" aria-hidden="true">{item.icon}</span>
                                <span className="ct-mnav-txt"><b>{item.label}</b>{item.desc && <small>{item.desc}</small>}</span>
                                <ChevronRight className="ct-mnav-go" aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <a className="ct-mnav-row" href={entry.href} onClick={closeMenu}>
                        {entry.label}
                        <span aria-hidden="true"><ChevronRight /></span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>

            <a className="ct-mnav-cta" href={contactHref} onClick={closeMenu} style={{ '--i': desktopNav.length } as CSSProperties}>
              {t('home.menu.cta')}
              <span aria-hidden="true"><ChevronRight /></span>
            </a>
          </nav>
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
    <div className="ct-top-area ct-top-area-with-hero">
      <Header linkBase={linkBase} />

      <section className="ct-hero-stage ct-page-hero" aria-labelledby={titleId}>
        <Grainient preset="silver" />
        <div className="ct-hero-stage-content">
          {eyebrow && <p className="ct-page-hero-eyebrow">{eyebrow}</p>}
          <h1 id={titleId}>{title}</h1>
          {description && <p>{description}</p>}
          {children}
        </div>
      </section>
    </div>
  );
}

function FooterColumn({ title, links, social = false }: { title: string; links: FooterLink[]; social?: boolean }) {
  return (
    <div className={`ct-footer-column${social ? ' ct-footer-social' : ''}`}>
      <p>{title}</p>
      <ul>
        {links.map((link) => {
          const externalProps = link.external ? { rel: 'noopener noreferrer', target: '_blank' } : {};

          return (
            <li key={link.href}>
              <a href={link.href} {...externalProps}>
                {social && <span className="ct-footer-social-icon" aria-hidden="true">
                  {link.label === 'LinkedIn' ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.26 2.37 4.26 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" /></svg> : link.label === 'X' ? <svg viewBox="0 0 24 24" fill="currentColor"><path d={siX.path} /></svg> : <Mail />}
                </span>}
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer({ linkBase = '' }: { linkBase?: string } = {}) {
  const { language } = useLanguage();
  const footer = buildFooter(language === 'de');
  // On another site (research.clerktree.com) the footer's own-site paths must lead back to the main
  // site, and every cross-site link carries the visitor's language.
  const href = (path: string) => (path.startsWith('/') && linkBase ? crossSite(`${linkBase}${path}`, language) : crossSite(path, language));
  const withBase = (links: FooterLink[]): FooterLink[] => links.map((link) => (link.external ? link : { ...link, href: href(link.href) }));
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
    <footer className="ct-footer" ref={footerRef}>
      <div className="ct-footer-inner">
        {isFooterNearViewport && (
          <>
            <div className="ct-footer-grain" aria-hidden="true"><Grainient preset="footer" /></div>
          </>
        )}
        <div className="ct-footer-main">
          <div className="ct-footer-cta">
            <a className="ct-footer-brand" href={href('/')} aria-label={language === 'de' ? 'ClerkTree Startseite' : 'ClerkTree home'}><ClerkTreeLockup title={null} /></a>
            <p>
              {language === 'de' ? <>KI-Harness für<br />Industriemaschinen.</> : <>Industrial AI harness<br />for machinery.</>}
            </p>
            <a className="ct-footer-cta-button" href={href('/contact')}>
              {language === 'de' ? 'Kontakt aufnehmen' : 'Get in touch'}
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>

          <div className="ct-footer-columns">
            <FooterColumn title={footer.company.title} links={withBase(footer.company.links)} />
            <FooterColumn title={footer.product.title} links={withBase(footer.product.links)} />
            <FooterColumn title={footer.social.title} links={footer.social.links} social />
          </div>
        </div>

        <div className="ct-footer-bottom">
          <div className="ct-footer-copyright">
            <p>© {new Date().getFullYear()} ClerkTree. {footer.rights}</p>
          </div>
          <div className="ct-footer-time" aria-label={`${footer.munich} ${munichTime}`}>
            <span>{footer.munich} →</span>
            <time>{munichTime}</time>
          </div>
          <div className="ct-footer-bottom-right">
            {footer.legal.map((link) => (
              <a href={href(link.href)} key={link.href}>
                {link.label}
              </a>
            ))}
            <button className="ct-footer-link-button" onClick={openConsentSettings} type="button">
              {footer.cookieSettings}
            </button>
            <a className="ct-footer-back" href="#ct-works">
              {footer.backToTop}
            </a>
          </div>
        </div>

        <div className="ct-footer-logo ct-footer-logo-text" aria-hidden="true">
          {isFooterNearViewport && <FooterAscii />}
          <span>ClerkTree</span>
        </div>
      </div>
    </footer>
  );
}
