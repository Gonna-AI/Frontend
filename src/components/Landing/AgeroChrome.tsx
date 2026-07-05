import { useEffect, useRef, useState } from 'react';

import '../../pages/LandingFramer.css';

const headerLinks = [
  ['Solutions', '/solutions'],
  ['About', '/about'],
  ['Blog', '/blog'],
  ['Docs', '/docs'],
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          <button
            aria-label="Close menu"
            className="agero-mobile-menu-close-fab"
            onClick={closeMenu}
            type="button"
          >
            <span />
            <span />
          </button>

          <div className="agero-mobile-menu-panel" role="navigation" aria-label="Mobile navigation">
            <div className="agero-mobile-menu-top">
              <span>Menu</span>
            </div>

            <div className="agero-mobile-menu-links">
              {headerLinks.map(([label, href]) => (
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
