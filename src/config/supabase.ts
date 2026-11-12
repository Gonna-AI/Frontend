import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Hybrid storage: PKCE code verifiers go in sessionStorage (tab-scoped, avoids
// cross-tab verifier mismatch), everything else (session tokens) stays in
// localStorage so the user stays logged in across tabs.
// Browsers can refuse storage altogether (some private modes, blocked site data): every access is
// guarded, and the session then lives in memory for the page's lifetime instead of crashing sign-in.
const memory = new Map<string, string>();
const area = (key: string) => (key.includes('code-verifier') ? 'sessionStorage' : 'localStorage');
const hybridStorage = {
    getItem: (key: string): string | null => {
        try {
            return window[area(key)].getItem(key) ?? memory.get(key) ?? null;
        } catch {
            return memory.get(key) ?? null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            window[area(key)].setItem(key, value);
            memory.delete(key);
        } catch {
            memory.set(key, value);
        }
    },
    removeItem: (key: string): void => {
        memory.delete(key);
        for (const name of ['sessionStorage', 'localStorage'] as const) {
            try { window[name].removeItem(key); } catch { /* storage unavailable: nothing to remove */ }
        }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: hybridStorage,
    },
});
