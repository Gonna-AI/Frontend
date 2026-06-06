export type ClientDeliverableStatus = 'planned' | 'in_progress' | 'review' | 'blocked' | 'done';
export type ClientDeliverablePriority = 'low' | 'medium' | 'high';
export type ClientUpdateKind = 'update' | 'milestone' | 'risk' | 'note';

export interface ClientAccount {
    id: string;
    slug: string;
    name: string;
    logo_url: string;
    accent_color: string;
    surface_color: string;
    summary: string | null;
    support_email: string | null;
    is_active?: boolean;
}

export interface ClientPortalDirectoryEntry {
    username: string;
    client_id: string;
    welcome_label: string;
    is_active: boolean;
    client_accounts: ClientAccount | null;
}

export interface ClientPortalProfile {
    id: string;
    client_id: string;
    username: string;
    display_name: string;
    role: 'client_admin' | 'client_member';
    is_active: boolean;
    last_login_at: string | null;
    client_accounts: ClientAccount | null;
}

export interface ClientDeliverable {
    id: string;
    client_id: string;
    title: string;
    summary: string;
    status: ClientDeliverableStatus;
    priority: ClientDeliverablePriority;
    progress: number;
    due_date: string | null;
    owner_label: string | null;
    category: string;
    resource_label: string | null;
    resource_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface ClientUpdate {
    id: string;
    client_id: string;
    deliverable_id: string | null;
    title: string;
    body: string;
    kind: ClientUpdateKind;
    posted_by: string;
    posted_at: string;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}

export interface ClientDeliverableInput {
    title: string;
    summary: string;
    status: ClientDeliverableStatus;
    priority: ClientDeliverablePriority;
    progress: number;
    due_date: string | null;
    owner_label: string;
    category: string;
    resource_label: string;
    resource_url: string;
    notes: string;
}

export interface ClientUpdateInput {
    title: string;
    body: string;
    kind: ClientUpdateKind;
    deliverable_id: string | null;
    posted_by: string;
    is_pinned: boolean;
}
