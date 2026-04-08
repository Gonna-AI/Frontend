// supabase/functions/_shared/google-client.ts
// Shared helper: token loading, refresh, and Google API fetch.
// Works with the existing google_oauth_tokens table (service='workspace').
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryAt: Date;
  userId: string;
  googleEmail: string;
}

function encKey(): string {
  return Deno.env.get("GOOGLE_TOKEN_ENC_KEY") ?? "";
}

// ─── Token DB helpers ─────────────────────────────────────────────────────────

export async function loadTokens(
  userId: string,
  admin: SupabaseClient,
): Promise<GoogleTokens | null> {
  const { data, error } = await admin.rpc("get_google_tokens", {
    p_user_id: userId,
    p_enc_key: encKey(),
  });
  // rpc returning a table returns an array
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return null;
  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    expiryAt: new Date(row.expiry_at),
    userId,
    googleEmail: row.google_email ?? "",
  };
}

export async function storeTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryAt: Date,
  scopes: string[],
  googleEmail: string,
  avatarUrl: string,
  admin: SupabaseClient,
): Promise<void> {
  const { error } = await admin.rpc("upsert_google_tokens", {
    p_user_id: userId,
    p_access_token: accessToken,
    p_refresh_token: refreshToken,
    p_expiry_at: expiryAt.toISOString(),
    p_scopes: scopes,
    p_google_email: googleEmail,
    p_avatar_url: avatarUrl,
    p_enc_key: encKey(),
  });
  if (error) throw new Error(`Failed to store tokens: ${error.message}`);
}

export async function refreshIfExpired(
  tokens: GoogleTokens,
  admin: SupabaseClient,
): Promise<GoogleTokens> {
  // Give a 60-second buffer before actual expiry
  if (tokens.expiryAt.getTime() - Date.now() > 60_000) return tokens;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Token refresh failed: ${json.error}`);

  const newTokens: GoogleTokens = {
    accessToken: json.access_token,
    refreshToken: tokens.refreshToken, // refresh_token not always re-returned
    expiryAt: new Date(Date.now() + json.expires_in * 1000),
    userId: tokens.userId,
    googleEmail: tokens.googleEmail,
  };

  await admin.rpc("update_google_access_token", {
    p_user_id: tokens.userId,
    p_access_token: newTokens.accessToken,
    p_expiry_at: newTokens.expiryAt.toISOString(),
    p_enc_key: encKey(),
  });

  return newTokens;
}

// ─── Authenticated Google API fetch ──────────────────────────────────────────

export async function googleFetch(
  url: string,
  tokens: GoogleTokens,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

// ─── CORS + JSON helpers (same pattern as existing edge functions) ────────────

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  "https://clerktree.com",
  "https://www.clerktree.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://clerktree.netlify.app",
]);

const EXTRA = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",").map((o) => o.trim()).filter(Boolean);
for (const o of EXTRA) DEFAULT_ALLOWED_ORIGINS.add(o);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) return true;
    return (
      url.protocol === "https:" &&
      (url.hostname === "clerktree.com" ||
        url.hostname.endsWith(".clerktree.com"))
    );
  } catch {
    return false;
  }
}

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowed =
    origin && isAllowedOrigin(origin) ? origin : "https://clerktree.com";
  return {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Origin": allowed,
    Vary: "Origin",
  };
}

export function jsonRes(
  req: Request,
  status: number,
  payload: unknown,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeadersFor(req), "Content-Type": "application/json" },
  });
}
