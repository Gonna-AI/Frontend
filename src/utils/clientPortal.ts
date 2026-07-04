const CLIENT_PORTAL_EMAIL_DOMAIN = 'clients.clerktree.app';

export function normalizePortalUsername(value: string) {
    return value.trim().toLowerCase();
}

export function isValidPortalUsername(value: string) {
    return /^[a-z0-9._-]+$/.test(normalizePortalUsername(value));
}

export function buildPortalEmail(username: string) {
    return `${normalizePortalUsername(username)}@${CLIENT_PORTAL_EMAIL_DOMAIN}`;
}

export function formatPortalDate(value: string | null) {
    if (!value) {
        return 'No due date';
    }

    const date = new Date(value);
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}
