import axios from 'axios';
import { supabase } from './supabase';

// API Base URL - MUST be configured via environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('❌ VITE_API_BASE_URL is not configured! API calls will fail.');
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// ── Token cache — avoids a Supabase auth read on every request ───────────────
// At scale (1M users × N requests/s) calling getSession() per request is
// prohibitively expensive. Cache the token and only refresh when near expiry.
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

supabase.auth.onAuthStateChange((_event, session) => {
  _cachedToken = session?.access_token ?? null;
  _tokenExpiry = session ? session.expires_at! * 1000 : 0;
});

async function getCachedToken(): Promise<string | null> {
  // Return cached token if it won't expire in the next 60 seconds
  if (_cachedToken && Date.now() < _tokenExpiry - 60_000) return _cachedToken;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    _cachedToken = session?.access_token ?? null;
    _tokenExpiry = session ? session.expires_at! * 1000 : 0;
  } catch {
    _cachedToken = null;
  }
  return _cachedToken;
}

// Inject Supabase auth token into every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getCachedToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Silently proceed without token if auth check fails
  }
  return config;
});

// Add an interceptor to handle retries for 5xx / network errors + 401 redirects
const MAX_RETRIES = 3;
const BASE_DELAY = 500;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Don't retry if config is missing or already exceeded max retries
    if (!config || config._retryCount >= MAX_RETRIES) {
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Redirect on 401 immediately (no retry)
    if (error.response?.status === 401) {
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry on 5xx or network errors
    const isServerError = error.response?.status >= 500;
    const isNetworkError = !error.response && error.code !== 'ERR_CANCELED';

    if (isServerError || isNetworkError) {
      config._retryCount = (config._retryCount || 0) + 1;
      const delay = BASE_DELAY * Math.pow(2, config._retryCount - 1);
      console.warn(`[api] Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}) in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
