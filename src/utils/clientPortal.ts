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

export function statusLabel(value: string) {
    switch (value) {
        case 'in_progress':
            return 'In progress';
        default:
            return value.replace('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    }
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

export function daysUntil(dateValue: string | null) {
    if (!dateValue) {
        return null;
    }

    const target = new Date(`${dateValue}T00:00:00`);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
