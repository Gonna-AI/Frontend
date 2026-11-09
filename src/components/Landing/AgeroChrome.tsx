import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Activity, ArrowUpRight, Briefcase, ChevronDown, ChevronRight, Factory, FlaskConical, Mail, Scale, Shapes, Users, Wrench } from 'lucide-react';
import { siX } from 'simple-icons';
import { NavigationMenu } from 'radix-ui';

import ClerkTreeLockup from '../Brand/ClerkTreeLockup';
import { shouldPlayFirstVisitIntro } from '../Brand/logoPortal';
import { cancelIdle, runWhenIdle } from '../../utils/idle';
import Grainient from '../Brand/Grainient';
import FooterAscii from './FooterAscii';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../pages/LandingFramer.css';
import '../../pages/SiteSystem.css';
import './FooterDesign.css';

const RESEARCH_URL = 'https://research.clerktree.com';

type NavMenuItem = { label: string; href: string; icon: ReactNode; desc?: string };
type NavEntry = { label: string; href: string; items?: NavMenuItem[] };

function buildDesktopNav(language: string, t: (key: string) => string, linkBase: string): NavEntry[] {
  const de = language === 'de';
  const local = (path: string) => `${linkBase}${path}`;
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
        { label: t('nav.research'), href: RESEARCH_URL, icon: <FlaskConical />, desc: de ? 'Paper und Benchmarks' : 'Papers and benchmarks' },
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

const footerCompanyLinks: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Research', href: RESEARCH_URL },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Brand', href: '/brand' },
];

const footerProductLinks: FooterLink[] = [
  { label: 'Hive', href: '/hive' },
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
  const contactHref = `${linkBase}/contact`;
  const desktopNav = buildDesktopNav(language, t, linkBase);

  useEffect(() => {
    if (!isMenuOpen) return;

    // Freeze the page behind the menu (works on iOS and with smooth scrolling):
    // pin the body at the current offset and restore it exactly on close.
    const { body, documentElement: html } = document;
    const y = window.scrollY;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: html.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    html.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      html.style.overflow = prev.overflow;
      const behavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = behavior;
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
    closeTimer.current = window.setTimeout(() => { setIsMenuOpen(false); setClosing(false); }, 620);
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
    <header className={`agero-shell-header${isMenuOpen && !closing ? ' is-menu-open' : ''}`}>
      <a className={`agero-shell-logo is-${logoChrome.phase}`} href={linkBase || '/'} aria-label={t('home.brand.aria')} ref={logoRef}
        onPointerEnter={(event) => { if (event.pointerType === 'mouse') playLogo(); }}
        onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) playLogo(); }}>
        <ClerkTreeLockup className="agero-shell-lockup" title={null} />
        <span className="agero-logo-chrome" aria-hidden="true">
          {logoChrome.loaded && (
            <Suspense fallback={null}>
              <LiquidMetalMark className="agero-logo-chrome-canvas" scale={1} colorBack="#00000000" repetition={2.6} dispersion={0} speed={logoChrome.phase === 'idle' ? 0 : 2.4} contour={0.7} softness={0} pixelRatio={20} />
            </Suspense>
          )}
        </span>
        {/* Maps the metal's tones onto the brand orange: deep orange shadows, orange body, light-gold glints. */}
        <svg className="agero-logo-filter" width="0" height="0" aria-hidden="true" focusable="false">
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

      <NavigationMenu.Root className="agero-shell-nav" aria-label={t('home.nav.aria')} delayDuration={120} skipDelayDuration={300}>
        <NavigationMenu.List className="agero-nav-list">
        {desktopNav.map((entry) => entry.items ? (
          <NavigationMenu.Item className="agero-nav-item" key={entry.label}>
            <NavigationMenu.Trigger className="agero-nav-trigger">
              {(['is-left', 'is-right'] as const).map((side) => (
                <svg className={`agero-nav-shoulder ${side}`} key={side} viewBox="0 0 12 12" aria-hidden="true">
                  <path className="fill" d="M0 11.5A11.5 11.5 0 0 0 11.5 0H12V12H0Z" />
                  <path className="line" d="M0 11.5A11.5 11.5 0 0 0 11.5 0" />
                </svg>
              ))}
              <Roll>{entry.label}</Roll>
              <ChevronDown className="agero-nav-caret" aria-hidden="true" />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content className="agero-nav-panel">
                {entry.items.map((item, index) => (
                  <NavigationMenu.Link className="agero-nav-menu-item" href={item.href} key={item.href} style={{ '--i': index } as CSSProperties}>
                    <span className="agero-nav-menu-ico" aria-hidden="true">{item.icon}</span>
                    <Roll>{item.label}</Roll>
                  </NavigationMenu.Link>
                ))}
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ) : (
          <NavigationMenu.Item key={entry.label}>
            <NavigationMenu.Link className="agero-nav-link" href={entry.href}><Roll>{entry.label}</Roll></NavigationMenu.Link>
          </NavigationMenu.Item>
        ))}
        </NavigationMenu.List>
      </NavigationMenu.Root>

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
          onClick={openMenu}
          ref={menuButtonRef}
          type="button"
        >
          <span />
          <span />
        </button>
      </div>

      {isMenuOpen && (
        <div className={`ct-mnav${closing ? ' is-closing' : ''}`} data-lenis-prevent="" id="agero-mobile-menu">
          <button aria-label={t('home.menu.closeMobile')} className="ct-mnav-scrim" onClick={closeMenu} type="button" />
          <nav className="ct-mnav-sheet" aria-label={t('home.menu.navAria')} ref={sheetRef} style={sheetGeo}>
            <div className="ct-mnav-top">
              <a className="ct-mnav-logo" href={linkBase || '/'} aria-label={t('home.brand.aria')} onClick={closeMenu}>
                <ClerkTreeLockup className="agero-shell-lockup" title={null} />
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
    <div className="agero-top-area agero-top-area-with-hero">
      <Header linkBase={linkBase} />

      <section className="agero-hero-stage agero-page-hero" aria-labelledby={titleId}>
        <Grainient preset="silver" />
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

function FooterColumn({ title, links, social = false }: { title: string; links: FooterLink[]; social?: boolean }) {
  return (
    <div className={`agero-footer-column${social ? ' agero-footer-social' : ''}`}>
      <p>{title}</p>
      <ul>
        {links.map((link) => {
          const externalProps = link.external ? { rel: 'noopener noreferrer', target: '_blank' } : {};

          return (
            <li key={link.href}>
              <a href={link.href} {...externalProps}>
                {social && <span className="agero-footer-social-icon" aria-hidden="true">
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
        {isFooterNearViewport && (
          <>
            <div className="agero-footer-grain" aria-hidden="true"><Grainient preset="footer" /></div>
          </>
        )}
        <div className="agero-footer-main">
          <div className="agero-footer-cta">
            <a className="agero-footer-brand" href="/" aria-label="ClerkTree home"><ClerkTreeLockup title={null} /></a>
            <p>
              {language === 'de' ? <>KI-Harness für<br />Industriemaschinen.</> : <>Industrial AI harness<br />for machinery.</>}
            </p>
            <a className="agero-footer-cta-button" href="/contact">
              {language === 'de' ? 'Kontakt aufnehmen' : 'Get in touch'}
              <ArrowUpRight aria-hidden="true" size={16} />
            </a>
          </div>

          <div className="agero-footer-columns">
            <FooterColumn title="Company" links={footerCompanyLinks} />
            <FooterColumn title="Product" links={footerProductLinks} />
            <FooterColumn title="Socials" links={footerSocialLinks} social />
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
          {isFooterNearViewport && <FooterAscii />}
          <span>ClerkTree</span>
        </div>
      </div>
    </footer>
  );
}
