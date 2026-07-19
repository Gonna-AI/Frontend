import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { runWhenIdle, yieldToMain } from '../../utils/idle';
import { sanitizeTrustedHtml } from '../../utils/sanitizeHtml';
import { Footer } from '../Landing/AgeroChrome';
import SEO from '../SEO';
import '../../pages/LandingFramer.css';

type LegalHtmlPageProps = {
  description: string;
  htmlUrl: string;
  title: string;
};

const legalStyles = `
  .legal-content {
    color: rgba(19, 19, 19, 0.78);
    content-visibility: auto;
    contain-intrinsic-size: auto 4000px;
    font-size: 0.95rem;
    line-height: 1.85;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    text-align: left;
  }
  .legal-content * { background-color: transparent !important; }
  .legal-content div,
  .legal-content p,
  .legal-content span,
  .legal-content h1,
  .legal-content h2,
  .legal-content h3,
  .legal-content h4 {
    text-align: left !important;
  }
  .legal-content h1,
  .legal-content h2,
  .legal-content h3,
  .legal-content h4 {
    color: rgb(19, 19, 19) !important;
    font-family: "Cal Sans", "Inter Display", "Inter", system-ui, sans-serif !important;
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .legal-content h1 { font-size: 1.75rem; margin-top: 1.6rem; margin-bottom: 0.8rem; }
  .legal-content h2 { font-size: 1.35rem; margin-top: 1.5rem; margin-bottom: 0.6rem; }
  .legal-content h3 { font-size: 1.1rem; margin-top: 1.25rem; margin-bottom: 0.5rem; }
  .legal-content p,
  .legal-content span,
  .legal-content li { color: rgba(19, 19, 19, 0.72) !important; }
  .legal-content a {
    color: rgb(255, 77, 0) !important;
    text-decoration: underline;
    text-underline-offset: 4px;
    transition: opacity 150ms ease;
  }
  .legal-content a:hover { opacity: 0.72; }
  .legal-content strong { color: rgb(19, 19, 19) !important; font-weight: 600; }
  .legal-content ul,
  .legal-content ol { padding-left: 1.25rem; margin-top: 0.6rem; margin-bottom: 0.8rem; }
  .legal-content li { margin-bottom: 0.4rem; }
  .legal-content hr {
    border: none;
    border-top: 1px solid rgba(19, 19, 19, 0.1);
    margin: 1.75rem 0;
  }
  .legal-content table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; }
  .legal-content th,
  .legal-content td {
    border: 1px solid rgba(19, 19, 19, 0.12);
    padding: 0.65rem 0.8rem;
    vertical-align: top;
    color: rgba(19, 19, 19, 0.72) !important;
  }
  .legal-content th {
    color: rgb(19, 19, 19) !important;
    background: rgba(19, 19, 19, 0.04) !important;
    text-align: left;
    font-weight: 600;
  }
`;

export default function LegalHtmlPage({ description, htmlUrl, title }: LegalHtmlPageProps) {
  const navigate = useNavigate();
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
      <SEO title={`${title} — ClerkTree`} description={description} />

      <div className="agero-legal-page-container">
        {/* ── Hero / title block ── */}
        <section className="agero-legal-hero" aria-labelledby="legal-page-title">
          <button
            onClick={() => navigate('/')}
            className="agero-legal-back-btn"
            type="button"
          >
            <ArrowLeft className="agero-legal-back-icon" aria-hidden="true" />
            Back
          </button>

          {/* Orange eyebrow — bold, identical to how other pages use the accent colour */}
          <p className="agero-legal-eyebrow">Legal</p>

          <h1 id="legal-page-title" className="agero-legal-title">{title}</h1>
          <p className="agero-legal-description">{description}</p>
        </section>

        {/* ── Content Card ── */}
        <main className="agero-legal-content-wrap" id="main-content">
          <div className="agero-legal-card">
            <style>{legalStyles}</style>

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
