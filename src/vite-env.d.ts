/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AMPLITUDE_API_KEY?: string;
  readonly VITE_MEDIA_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Scroll-linked animations (Chrome, Edge, Safari 26): not in TypeScript's DOM typings yet. */
declare class ScrollTimeline extends AnimationTimeline {
  constructor(options?: { source?: Element | null; axis?: 'block' | 'inline' | 'x' | 'y' });
}
