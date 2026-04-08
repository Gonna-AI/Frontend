// supabase/functions/google-oauth-callback/index.ts
// Called by Google redirect. No JWT — recovers user identity from state table.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { storeTokens } from "../_shared/google-client.ts";

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";

  const admin = createClient(supabaseUrl, serviceKey);

  const redirectToSettings = (err?: string) => {
    const dest = err
      ? `${siteUrl}/dashboard?tab=settings&google_error=${encodeURIComponent(err)}`
      : `${siteUrl}/dashboard?tab=settings&google_connected=1`;
    return Response.redirect(dest, 302);
  };

  if (errorParam) return redirectToSettings(errorParam);
  if (!code || !state) return redirectToSettings("missing_params");

  // Validate state (CSRF check + recover user_id)
  const { data: stateRow, error: stateErr } = await admin
    .from("google_oauth_states")
    .select("user_id, expires_at")
    .eq("state", state)
    .single();

  if (stateErr || !stateRow) return redirectToSettings("invalid_state");
  if (new Date(stateRow.expires_at) < new Date()) {
    await admin.from("google_oauth_states").delete().eq("state", state);
    return redirectToSettings("state_expired");
  }

  // Consume state (one-time use)
  await admin.from("google_oauth_states").delete().eq("state", state);

  const redirectUri = `${siteUrl}/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error("[google-oauth-callback] token exchange failed:", tokenJson);
    return redirectToSettings("token_exchange_failed");
  }

  // Fetch Google profile (email + avatar)
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
  );
  const profile = profileRes.ok ? await profileRes.json() : {};

  const scopes = (tokenJson.scope ?? "").split(" ").filter(Boolean);
  const expiryAt = new Date(Date.now() + (tokenJson.expires_in ?? 3600) * 1000);

  try {
    await storeTokens(
      stateRow.user_id,
      tokenJson.access_token,
      tokenJson.refresh_token ?? "",
      expiryAt,
      scopes,
      profile.email ?? "",
      profile.picture ?? "",
      admin,
    );
  } catch (err) {
    console.error("[google-oauth-callback] store failed:", err);
    return redirectToSettings("store_failed");
  }

  return redirectToSettings();
});
