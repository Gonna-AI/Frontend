/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_AMPLITUDE_API_KEY?: string;
  readonly VITE_MEDIA_BASE_URL?: string;
  readonly VITE_PERF_ENDPOINT?: string;
  readonly VITE_PERF_SAMPLE_RATE?: string;
  readonly VITE_BUILD_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
