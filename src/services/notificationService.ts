/**
 * Frontend notification service.
 *
 * Calls the api-notifications/create edge function to insert a notification
 * for the currently authenticated user. Used for events that originate on
 * the client side (call ended, knowledge base saved, settings updated, etc.).
 *
 * Fire-and-forget: never throws — errors are silently logged so a failed
 * notification never disrupts the user action that triggered it.
 */

import { supabase } from '../config/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'billing' | 'team' | 'security' | 'calls' | 'system';

export interface CreateNotificationPayload {
  type: NotificationType;
  title: string;
  message?: string;
  category: NotificationCategory;
  action_url?: string;
}

let _cachedToken: string | null = null;
let _tokenExpiry = 0;

supabase.auth.onAuthStateChange((_event, session) => {
  _cachedToken = session?.access_token ?? null;
  _tokenExpiry = session ? session.expires_at! * 1000 : 0;
});

async function getToken(): Promise<string | null> {
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

/**
 * Create a notification for the authenticated user.
 * Safe to fire-and-forget: `void createNotification(...)`.
 */
export async function createNotification(payload: CreateNotificationPayload): Promise<void> {
  try {
    const token = await getToken();
    if (!token) return; // Not authenticated — skip silently

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-notifications/create`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.warn('[notificationService] create failed:', res.status);
    }
  } catch (err) {
    console.warn('[notificationService] error:', err);
  }
}
