import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

const Seo = ({
    title = 'ClerkTree – AI-powered legal automation',
    description = 'Transform your claims processing workflow with AI-driven automation, intelligent callback scheduling, and real-time sentiment analysis.',
    image = 'https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/logo.svg',
    url,
    type = 'website',
}: SeoProps) => {
    const siteUrl = import.meta.env.VITE_BASE_URL || 'https://clerktree.com';
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Canonical URL */}
            <link rel="canonical" href={fullUrl} />
        </Helmet>
    );
};

export default Seo;
