import type { ReactNode } from 'react';

import { Footer, PageHero } from '../../components/Landing/SiteChrome';
import SEO from '../../components/SEO';
import { LEGAL_LAST_UPDATED, SITE_URL } from '../../config/company';
import { useLanguage } from '../../contexts/LanguageContext';
import '../LandingFramer.css';
import './Legal.css';

type LegalLayoutProps = {
  title: string;
  description: string;
  /** Show the shared "last updated" line under the title. */
  dated?: boolean;
  /** Hero label; defaults to "Legal". */
  eyebrow?: string;
  /** Let search engines index the page (legal boilerplate is kept out by default). */
  indexable?: boolean;
  canonicalPath?: string;
  children: ReactNode;
};

/** Shared frame for the legal documents and the security page: hero, readable content card, footer. */
export default function LegalLayout({ title, description, dated = true, eyebrow, indexable = false, canonicalPath, children }: LegalLayoutProps) {
  const { language } = useLanguage();
  const updated = new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', { dateStyle: 'long' }).format(
    new Date(`${LEGAL_LAST_UPDATED}T12:00:00Z`),
  );

  return (
    <div className="ct-works" id="ct-works">
      <SEO title={title} description={description} noindex={!indexable} canonical={canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined} />
      <PageHero eyebrow={eyebrow ?? (language === 'de' ? 'Rechtliches' : 'Legal')} title={title} description={description} titleId="legal-page-title" />

      <div className="ct-legal-page-container">
        <main className="ct-legal-card" id="main-content">
          <article className="legal-content">
            {dated && (
              <p className="legal-updated">
                {language === 'de' ? 'Stand: ' : 'Last updated: '}
                <time dateTime={LEGAL_LAST_UPDATED}>{updated}</time>
              </p>
            )}
            {children}
          </article>
        </main>
      </div>

      <Footer />
    </div>
  );
}
