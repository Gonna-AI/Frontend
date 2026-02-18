import React from 'react';

/**
 * A wrapper around React.lazy() that gracefully handles chunk loading failures.
 * 
 * After a deploy, old cached HTML may reference JS chunks that no longer exist.
 * The server returns index.html (text/html) instead, causing:
 *   "'text/html' is not a valid JavaScript MIME type"
 * 
 * This utility:
 * 1. Retries the dynamic import once
 * 2. If retry fails, force-reloads the page to get fresh HTML with new chunk hashes
 * 3. Uses sessionStorage to prevent infinite reload loops
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    chunkName?: string
): React.LazyExoticComponent<T> {
    return React.lazy(() => {
        const storageKey = `chunk_retry_${chunkName || 'page'}_${window.location.pathname}`;

        return importFn().catch((error: Error) => {
            // Check if we've already tried reloading for this chunk
            const hasReloaded = sessionStorage.getItem(storageKey);

            if (!hasReloaded) {
                // Mark that we're about to reload so we don't loop infinitely
                sessionStorage.setItem(storageKey, '1');

                // Force reload from server (bypass cache)
                window.location.reload();

                // Return a never-resolving promise to prevent React from rendering an error
                // while the page is reloading
                return new Promise<{ default: T }>(() => { });
            }

            // We already reloaded once — clear the flag and throw the error
            // so the ErrorBoundary catches it
            sessionStorage.removeItem(storageKey);
            throw error;
        });
    });
}
