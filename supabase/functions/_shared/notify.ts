/**
 * Shared notification helper for Supabase edge functions.
 *
 * Usage (from any edge function):
 *   import { insertNotification } from '../_shared/notify.ts';
 *   await insertNotification(adminClient, userId, {
 *     type: 'success',
 *     title: 'Payment successful',
 *     message: '500 credits added to your account.',
 *     category: 'billing',
 *   });
 *
 * Fire-and-forget — never throws, errors are logged only.
 * Designed for 1M-user scale: single INSERT per event, user-scoped.
 */

import { SupabaseClient } from "jsr:@supabase/supabase-js@2";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationCategory = 'billing' | 'team' | 'security' | 'calls' | 'system';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message?: string;
  category: NotificationCategory;
  action_url?: string;
}

/**
 * Insert a notification row for a user. Never throws — safe to await anywhere.
 */
export async function insertNotification(
  adminClient: SupabaseClient,
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  try {
    const { error } = await adminClient.from('notifications').insert({
      user_id: userId,
      type: payload.type,
      title: payload.title,
      message: payload.message ?? '',
      category: payload.category,
      action_url: payload.action_url ?? null,
      is_read: false,
    });
    if (error) console.error('[notify] insert error:', error.message);
  } catch (err) {
    console.error('[notify] unexpected error:', err);
  }
}
