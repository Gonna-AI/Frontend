/**
 * Where marketing images (team photos, logos, Machina artwork) are served from.
 *
 * The bucket's public r2.dev address works but is rate-limited and not served
 * through Cloudflare's cache, so it is the slow option. Attach a custom domain
 * to the bucket (for example media.clerktree.com, in the Cloudflare R2 dashboard)
 * and set VITE_MEDIA_BASE_URL to it: every image then comes from the CDN.
 */
export const MEDIA_BASE_URL = (import.meta.env?.VITE_MEDIA_BASE_URL || 'https://pub-0f804855178c4f4e8184c4fef3bd5b2a.r2.dev').replace(/\/$/, '');
