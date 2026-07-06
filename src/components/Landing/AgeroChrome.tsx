import { useEffect, useRef, useState } from 'react';

import ClerkTreeLogo from '../Brand/ClerkTreeLogo';
import LanguageSwitcher from '../Layout/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../pages/LandingFramer.css';

const headerLinkPaths = [
  ['nav.solutions', '/solutions'],
  ['nav.about', '/about'],
  ['nav.blog', '/blog'],
  ['nav.docs', '/docs'],
  ['home.nav.contact', '/contact'],
] as const;

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerExploreLinks: FooterLink[] = [
  { label: 'Solutions', href: '/solutions' },
  { label: 'Docs', href: '/docs' },
  { label: 'About Us', href: '/about' },
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

export function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerLinks = headerLinkPaths.map(([key, href]) => [t(key), href] as const);
  const mobileLinks = headerLinks.filter(([, href]) => href !== '/contact');

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

  return (
    <header className={`agero-shell-header${isMenuOpen ? ' is-menu-open' : ''}`}>
      <a className="agero-shell-logo" href="/" aria-label={t('home.brand.aria')}>
        <ClerkTreeLogo markClassName="agero-shell-logo-mark" registered />
      </a>
      <div className="agero-shell-actions">
        <nav className="agero-shell-nav" id="agero-shell-nav" aria-label={t('home.nav.aria')}>
          {headerLinks.map(([label, href]) => (
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
    </header>
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
