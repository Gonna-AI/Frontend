import { clientPortalSupabase } from '../config/clientPortalSupabase';
import type { ClickUpTask, NotionBlock } from '../types/clientPortal';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const INTEGRATIONS_URL = `${SUPABASE_URL}/functions/v1/portal-integrations`;

async function portalIntegrationFetch<T>(action: string, options?: { method?: string; body?: Record<string, unknown> }): Promise<T> {
    const { data: { session } } = await clientPortalSupabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const res = await fetch(`${INTEGRATIONS_URL}?action=${action}`, {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
        throw new Error(err.error ?? 'Request failed');
    }

    return res.json() as Promise<T>;
}

export async function sendSlackSupportMessage(message: string, senderName: string) {
    return portalIntegrationFetch<{ success: boolean }>('slack', {
        method: 'POST',
        body: { message, sender_name: senderName },
    });
}

export async function fetchNotionNotes() {
    return portalIntegrationFetch<{ blocks: NotionBlock[]; configured: boolean }>('notion');
}

export async function fetchClickUpTasks() {
    return portalIntegrationFetch<{ tasks: ClickUpTask[]; configured: boolean }>('clickup');
}
