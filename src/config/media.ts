/**
 * Where marketing images (team photos, logos, Machina artwork) are served from.
 *
 * media.clerktree.com is the R2 bucket behind Cloudflare's cache. The bucket's own
 * r2.dev address still works but is rate-limited and uncached, so it is only a
 * fallback. Override with VITE_MEDIA_BASE_URL if the media ever moves.
 */
export const MEDIA_BASE_URL = (import.meta.env?.VITE_MEDIA_BASE_URL || 'https://media.clerktree.com').replace(/\/$/, '');
