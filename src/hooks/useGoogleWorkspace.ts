import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export interface GoogleConnectionInfo {
  connected: boolean;
  googleEmail: string | null;
  avatarUrl: string | null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('No session');
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export function useGoogleWorkspace() {
  const [connection, setConnection] = useState<GoogleConnectionInfo>({
    connected: false,
    googleEmail: null,
    avatarUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [reconnectRequired, setReconnectRequired] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // Check for existing token row (email column from google_oauth_tokens)
      const { data } = await supabase
        .from('google_oauth_tokens')
        .select('email, updated_at')
        .eq('user_id', session.user.id)
        .eq('service', 'workspace')
        .maybeSingle();

      setConnection({
        connected: !!data,
        googleEmail: data?.email ?? null,
        avatarUrl: null, // google_oauth_tokens doesn't store avatar; fetched separately if needed
      });
    } catch {
      // not connected — ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkConnection(); }, [checkConnection]);

  const connect = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${FN_BASE}/google-oauth-init`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }, []);

  const disconnect = useCallback(async () => {
    const headers = await authHeaders();
    await fetch(`${FN_BASE}/google-oauth-disconnect`, { method: 'POST', headers });
    setConnection({ connected: false, googleEmail: null, avatarUrl: null });
    setReconnectRequired(false);
  }, []);

  // Generic authenticated fetch to any google-* edge function
  const gFetch = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<unknown> => {
    const headers = await authHeaders();
    const res = await fetch(`${FN_BASE}/${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
    });
    const json = await res.json().catch(() => ({}));
    if ((json as Record<string, unknown>)?.error === 'reconnect_required') {
      setReconnectRequired(true);
      throw new Error('reconnect_required');
    }
    if (!res.ok) {
      throw new Error(
        (json as Record<string, unknown>)?.error as string ?? `Request failed (${res.status})`,
      );
    }
    return json;
  }, []);

  return {
    connection,
    loading,
    reconnectRequired,
    connect,
    disconnect,
    gFetch,
    refetchConnection: checkConnection,
  };
}
