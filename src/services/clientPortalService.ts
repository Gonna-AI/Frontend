import { clientPortalSupabase } from '../config/clientPortalSupabase';
import type {
    ClientDeliverable,
    ClientDeliverableInput,
    ClientUpdate,
    ClientUpdateInput,
} from '../types/clientPortal';

export async function fetchClientPortalData() {
    const [{ data: deliverables, error: deliverablesError }, { data: updates, error: updatesError }] = await Promise.all([
        clientPortalSupabase
            .from('client_deliverables')
            .select('*')
            .order('due_date', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: false }),
        clientPortalSupabase
            .from('client_updates')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('posted_at', { ascending: false }),
    ]);

    if (deliverablesError) {
        throw deliverablesError;
    }

    if (updatesError) {
        throw updatesError;
    }

    return {
        deliverables: (deliverables ?? []) as ClientDeliverable[],
        updates: (updates ?? []) as ClientUpdate[],
    };
}

export async function createDeliverable(clientId: string, userId: string, input: ClientDeliverableInput) {
    const { data, error } = await clientPortalSupabase
        .from('client_deliverables')
        .insert({
            client_id: clientId,
            created_by: userId,
            title: input.title,
            summary: input.summary,
            status: input.status,
            priority: input.priority,
            progress: input.progress,
            due_date: input.due_date,
            owner_label: input.owner_label || null,
            category: input.category,
            resource_label: input.resource_label || null,
            resource_url: input.resource_url || null,
            notes: input.notes || null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as ClientDeliverable;
}

export async function updateDeliverable(deliverableId: string, input: Partial<ClientDeliverableInput>) {
    const payload = {
        ...input,
        owner_label: input.owner_label?.trim() ? input.owner_label : null,
        resource_label: input.resource_label?.trim() ? input.resource_label : null,
        resource_url: input.resource_url?.trim() ? input.resource_url : null,
        notes: input.notes?.trim() ? input.notes : null,
        due_date: input.due_date || null,
    };

    const { data, error } = await clientPortalSupabase
        .from('client_deliverables')
        .update(payload)
        .eq('id', deliverableId)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as ClientDeliverable;
}

export async function createUpdate(clientId: string, userId: string, input: ClientUpdateInput) {
    const { data, error } = await clientPortalSupabase
        .from('client_updates')
        .insert({
            client_id: clientId,
            created_by: userId,
            deliverable_id: input.deliverable_id,
            title: input.title,
            body: input.body,
            kind: input.kind,
            posted_by: input.posted_by,
            is_pinned: input.is_pinned,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as ClientUpdate;
}
