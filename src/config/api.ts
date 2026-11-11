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
  // Authentication is a bearer token (below), not a cookie, so no ambient credentials are sent.
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

// Retry only requests that are safe to repeat. Repeating a POST after a timeout can create the
// same record twice (two users double-clicking, a flaky connection), so writes are never retried.
const MAX_RETRIES = 3;
const BASE_DELAY = 500;
const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options']);

let redirectingToLogin = false;
function redirectToLogin() {
  if (redirectingToLogin || window.location.pathname.startsWith('/login')) return;
  redirectingToLogin = true;
  window.location.assign('/login');
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    if (error.response?.status === 401) {
      // The cached token is no longer valid; drop it so the next sign-in starts clean.
      _cachedToken = null;
      _tokenExpiry = 0;
      redirectToLogin();
      return Promise.reject(error);
    }

    const retriable = IDEMPOTENT_METHODS.has(String(config.method ?? 'get').toLowerCase());
    const isServerError = error.response?.status >= 500;
    const isNetworkError = !error.response && error.code !== 'ERR_CANCELED';
    config._retryCount = config._retryCount || 0;

    if (retriable && (isServerError || isNetworkError) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;
      // Exponential backoff with jitter, so many clients recovering from one outage do not retry in lockstep.
      const delay = BASE_DELAY * Math.pow(2, config._retryCount - 1) * (0.5 + Math.random());
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
