import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { SITE_URL } from '../config/company';
import socialImages from '../data/socialImages.json';

interface SEOProps {
  title: string;
  description: string;
  /** Absolute canonical URL. Defaults to the current path on the production origin. */
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: 'website' | 'article';
    url?: string;
  };
  structuredData?: object;
  /** Keep the page out of search results (legal boilerplate, error pages). */
  noindex?: boolean;
}

/**
 * Per-page head tags. The canonical always points at the production origin,
 * never at a preview deploy, so previews cannot compete with the live site.
 */
export default function SEO({ title, description, canonical, openGraph, structuredData, noindex }: SEOProps) {
  const { pathname } = useLocation();
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const currentUrl = canonical || openGraph?.url || `${SITE_URL}${path}`;
  // Pages may already carry the brand ("Terms — ClerkTree", or the bare "ClerkTree" default); never print it twice.
  const fullTitle = /clerktree/i.test(title) ? title : `${title} | ClerkTree`;
  // og:image/twitter:image must be absolute URLs: social crawlers do not resolve relative paths.
  const imagePath = socialImages[(new URL(currentUrl).pathname.replace(/\/$/, '') || '/') as keyof typeof socialImages];
  const ogImage = openGraph?.image || `${SITE_URL}${imagePath ?? '/og-image.png'}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />

      <meta property="og:type" content={openGraph?.type || 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={openGraph?.title || fullTitle} />
      <meta property="og:description" content={openGraph?.description || description} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={openGraph?.title || fullTitle} />
      <meta name="twitter:description" content={openGraph?.description || description} />
      <meta name="twitter:image" content={ogImage} />

      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  );
}
