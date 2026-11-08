import { useEffect, useState } from 'react';
import { runWhenIdle, yieldToMain } from '../../utils/idle';
import { sanitizeTrustedHtml } from '../../utils/sanitizeHtml';
import { PageHero, Footer } from '../Landing/AgeroChrome';
import SEO from '../SEO';
import '../../pages/LandingFramer.css';
import './LegalPage.css';

type LegalHtmlPageProps = {
  description: string;
  htmlUrl: string;
  title: string;
};

export default function LegalHtmlPage({ description, htmlUrl, title }: LegalHtmlPageProps) {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setHtml('');

    fetch(htmlUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load legal document: ${response.status}`);
        }
        return response.text();
      })
      .then(async (rawHtml) => {
        await yieldToMain();
        if (controller.signal.aborted) {
          return;
        }

        // Replace any outgoing Termly DSAR request URLs with our local /data-access page
        const processedHtml = rawHtml.replace(
          /https:\/\/app\.termly\.io\/dsar\/[a-zA-Z0-9-]+/g,
          '/data-access'
        );

        runWhenIdle(() => {
          if (controller.signal.aborted) {
            return;
          }

          setHtml(sanitizeTrustedHtml(processedHtml));
          setStatus('ready');
        }, 1200);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [htmlUrl]);

  return (
    <div className="agero-works" id="agero-works">
      <SEO title={title} description={description} />

      <PageHero eyebrow="Legal" title={title} description={description} titleId="legal-page-title" />

      <div className="agero-legal-page-container">

        {/* ── Content Card ── */}
        <main className="agero-legal-content-wrap" id="main-content">
          <div className="agero-legal-card">
            {status === 'loading' && (
              <div className="agero-legal-skeleton" aria-label="Loading legal document" />
            )}
            {status === 'error' && (
              <p className="agero-legal-error">
                This document could not be loaded. Please refresh the page and try again.
              </p>
            )}
            {status === 'ready' && (
              <div
                className="legal-content"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
