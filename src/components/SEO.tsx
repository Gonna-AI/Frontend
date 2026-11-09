import { Helmet } from 'react-helmet-async';
import socialImages from '../data/socialImages.json';

interface VideoMeta {
    name: string;
    description: string;
    contentUrl: string;
    thumbnailUrl: string;
    uploadDate: string;
    durationSeconds?: number;
}

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    preloadVideos?: Array<{
        href: string;
        type?: string;
    }>;
    openGraph?: {
        title?: string;
        description?: string;
        image?: string;
        type?: 'website' | 'article';
        url?: string;
    };
    structuredData?: object;
    /** VideoObject schema for every <video> embedded on the page — Google Search
     * Console won't index a video without a thumbnailUrl in structured data. */
    videos?: VideoMeta[];
    /** Keep the page out of search results (legal pages). */
    noindex?: boolean;
}

export default function SEO({ title, description, canonical, preloadVideos, openGraph, structuredData, videos, noindex }: SEOProps) {
    const siteUrl = 'https://clerktree.com';
    // Pages may already carry the brand ("Terms — ClerkTree", or the bare "ClerkTree" default); never print it twice.
    const fullTitle = /clerktree/i.test(title) ? title : `${title} | ClerkTree`;
    const currentUrl = canonical || (openGraph?.url ?? siteUrl);
    // og:image/twitter:image must be absolute URLs per spec — social crawlers don't resolve relative paths.
    const imagePath = socialImages[(new URL(currentUrl).pathname.replace(/\/$/, '') || '/') as keyof typeof socialImages];
    const ogImage = openGraph?.image || (imagePath ? `${siteUrl}${imagePath}` : `${siteUrl}/og-image.png`);

    const videoSchemas = videos?.map((video) => ({
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.name,
        description: video.description,
        thumbnailUrl: [video.thumbnailUrl],
        uploadDate: video.uploadDate,
        contentUrl: video.contentUrl,
        ...(video.durationSeconds ? { duration: `PT${video.durationSeconds}S` } : {}),
    }));

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />
            {noindex && <meta name="robots" content="noindex, follow" />}
            {preloadVideos?.map((video) => (
                <link
                    key={video.href}
                    rel="preload"
                    as="video"
                    href={video.href}
                    type={video.type || 'video/mp4'}
                />
            ))}

            {/* Open Graph */}
            <meta property="og:type" content={openGraph?.type || 'website'} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={openGraph?.title || title} />
            <meta property="og:description" content={openGraph?.description || description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={openGraph?.title || title} />
            <meta name="twitter:description" content={openGraph?.description || description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}

            {videoSchemas?.map((schema) => (
                <script key={schema.contentUrl} type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            ))}
        </Helmet>
    );
}
