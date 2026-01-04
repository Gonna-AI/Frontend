import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CanonicalLink = () => {
    const location = useLocation();

    useEffect(() => {
        // Determine the canonical URL
        const baseUrl = 'https://clerktree.com';
        const path = location.pathname === '/' ? '' : location.pathname.replace(/\/$/, '');
        const canonicalUrl = `${baseUrl}${path}`;

        // Update the link tag
        let link = document.querySelector("link[rel='canonical']");

        // If it doesn't exist (it should from index.html), create it
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }

        link.setAttribute('href', canonicalUrl);
    }, [location]);

    return null;
};

export default CanonicalLink;
