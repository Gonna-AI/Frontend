import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorFallbackProps {
    error: Error;
    resetErrorBoundary: () => void;
}

/**
 * Detects if the error is a chunk/module load failure (common after deploys).
 */
function isChunkLoadError(error: Error): boolean {
    const msg = error.message || '';
    return (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading chunk') ||
        msg.includes('Loading CSS chunk') ||
        msg.includes("'text/html' is not a valid JavaScript MIME type") ||
        msg.includes('Importing a module script failed')
    );
}

/**
 * Hard-reloads the page with cache busting after clearing SW caches.
 */
async function hardReload() {
    try {
        // Clear all caches (service worker runtime caches)
        if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
        }

        // Unregister service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
        }
    } catch {
        // Swallow — we'll still reload
    }

    // Navigate with a cache-busting param to defeat any HTTP cache
    const url = new URL(window.location.href);
    url.searchParams.set('_cb', Date.now().toString());
    window.location.replace(url.toString());
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
    const [autoReloading, setAutoReloading] = useState(false);

    // Auto-reload once for chunk load errors (deploy mismatch)
    useEffect(() => {
        if (isChunkLoadError(error)) {
            const reloadKey = 'error_boundary_reload';
            const hasReloaded = sessionStorage.getItem(reloadKey);

            if (!hasReloaded) {
                sessionStorage.setItem(reloadKey, '1');
                setAutoReloading(true);
                hardReload();
            } else {
                // Already reloaded once — clear the flag so future visits work
                sessionStorage.removeItem(reloadKey);
            }
        }
    }, [error]);

    if (autoReloading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
                <div className="max-w-md w-full text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-zinc-400">Updating to the latest version…</p>
                </div>
            </div>
        );
    }

    const chunkError = isChunkLoadError(error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-white">
                    {chunkError ? 'New Update Available' : 'Something went wrong'}
                </h1>
                <p className="text-zinc-400 mb-6">
                    {chunkError
                        ? 'A new version of the app has been deployed. Please reload to get the latest version.'
                        : 'We apologize for the inconvenience. The application encountered an unexpected error.'}
                </p>

                {!chunkError && (
                    <div className="bg-black/50 rounded-lg p-4 mb-6 text-left overflow-auto max-h-32 border border-zinc-800">
                        <p className="font-mono text-sm text-red-400 break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                <button
                    onClick={chunkError ? () => hardReload() : resetErrorBoundary}
                    className="w-full py-3 px-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCcw className="w-4 h-4" />
                    {chunkError ? 'Reload Page' : 'Try Again'}
                </button>
            </div>
        </div>
    );
};

export default ErrorFallback;
