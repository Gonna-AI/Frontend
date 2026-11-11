

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
    calendly_url: string | null;
    slack_channel_id: string | null;
    notion_page_id: string | null;
    clickup_list_id: string | null;
}

// ─── Notion ───────────────────────────────────────────────────────────────────

export interface NotionRichText {
    plain_text: string;
    href: string | null;
    annotations: { bold: boolean; italic: boolean; strikethrough: boolean; code: boolean };
}

export interface NotionBlock {
    id: string;
    type: string;
    has_children: boolean;
    paragraph?: { rich_text: NotionRichText[] };
    heading_1?: { rich_text: NotionRichText[] };
    heading_2?: { rich_text: NotionRichText[] };
    heading_3?: { rich_text: NotionRichText[] };
    bulleted_list_item?: { rich_text: NotionRichText[] };
    numbered_list_item?: { rich_text: NotionRichText[] };
    to_do?: { rich_text: NotionRichText[]; checked: boolean };
    callout?: { rich_text: NotionRichText[]; icon?: { emoji?: string } };
}

// ─── ClickUp ──────────────────────────────────────────────────────────────────

export interface ClickUpTask {
    id: string;
    name: string;
    description?: string;
    status: { status: string; color: string; type: string };
    priority: { priority: string; color: string } | null;
    due_date: string | null;
    date_updated: string;
    url: string;
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
