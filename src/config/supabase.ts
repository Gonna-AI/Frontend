import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Hybrid storage: PKCE code verifiers go in sessionStorage (tab-scoped, avoids
// cross-tab verifier mismatch), everything else (session tokens) stays in
// localStorage so the user stays logged in across tabs.
const hybridStorage = {
    getItem: (key: string): string | null => {
        if (key.includes('code-verifier')) {
            return sessionStorage.getItem(key);
        }
        return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        if (key.includes('code-verifier')) {
            sessionStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key: string): void => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
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
