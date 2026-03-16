// src/services/activityLogger.ts
import { supabase } from '../config/supabase';

const ACTIVITY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-activity-log`;

export type ActivityEventType =
  | 'auth'
  | 'billing'
  | 'team'
  | 'api_keys'
  | 'config'
  | 'documents'
  | 'integrations'
  | 'security'
  | 'system';

export interface ActivityPayload {
  event_type: ActivityEventType;
  action: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget activity log entry. Never throws.
 */
export async function logActivity(payload: ActivityPayload): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch(ACTIVITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        event_type: payload.event_type,
        action: payload.action,
        description: payload.description ?? '',
        metadata: payload.metadata ?? {},
      }),
    });
  } catch {
    // intentionally silent — activity logging is non-critical
  }
}
