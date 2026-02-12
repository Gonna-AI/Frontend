import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    openGraph?: {
        title?: string;
        description?: string;
        image?: string;
        type?: 'website' | 'article';
        url?: string;
    };
    structuredData?: object;
}

export default function SEO({ title, description, canonical, openGraph, structuredData }: SEOProps) {
    const siteUrl = 'https://clerktree.com';
    const currentUrl = canonical || (openGraph?.url ?? siteUrl);
    const ogImage = openGraph?.image || 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/logo.svg';

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title} | ClerkTree</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

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
