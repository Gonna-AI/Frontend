import { Helmet } from 'react-helmet-async';

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
}

export default function SEO({ title, description, canonical, preloadVideos, openGraph, structuredData }: SEOProps) {
    const siteUrl = 'https://clerktree.com';
    const currentUrl = canonical || (openGraph?.url ?? siteUrl);
    // og:image/twitter:image must be absolute URLs per spec — social crawlers don't resolve relative paths.
    const ogImage = openGraph?.image || `${siteUrl}/media/logo.svg`;
    const faviconHref = `${siteUrl}/favicon.svg`;
    const manifestHref = `${siteUrl}/site.webmanifest`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title} | ClerkTree</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />
            <link rel="icon" type="image/svg+xml" href={faviconHref} />
            <link rel="shortcut icon" href={faviconHref} />
            <link rel="apple-touch-icon" href={faviconHref} />
            <link rel="manifest" href={manifestHref} />
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
        </Helmet>
    );
}
