CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS client_accounts (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    accent_color TEXT NOT NULL DEFAULT '#4EC4B6',
    surface_color TEXT NOT NULL DEFAULT '#2C3F49',
    summary TEXT,
    support_email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT client_accounts_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE TABLE IF NOT EXISTS client_portal_directory (
    username TEXT PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    welcome_label TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT client_portal_directory_username_format CHECK (username ~ '^[a-z0-9._-]+$')
);

CREATE TABLE IF NOT EXISTS client_portal_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE REFERENCES client_portal_directory(username) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client_admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT client_portal_users_role_check CHECK (role IN ('client_admin', 'client_member'))
);

CREATE TABLE IF NOT EXISTS client_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'planned',
    priority TEXT NOT NULL DEFAULT 'medium',
    progress INTEGER NOT NULL DEFAULT 0,
    due_date DATE,
    owner_label TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    resource_label TEXT,
    resource_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES client_portal_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT client_deliverables_status_check CHECK (status IN ('planned', 'in_progress', 'review', 'blocked', 'done')),
    CONSTRAINT client_deliverables_priority_check CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT client_deliverables_progress_check CHECK (progress BETWEEN 0 AND 100),
    CONSTRAINT client_deliverables_client_title_unique UNIQUE (client_id, title)
);

CREATE TABLE IF NOT EXISTS client_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    deliverable_id UUID REFERENCES client_deliverables(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'update',
    posted_by TEXT NOT NULL DEFAULT 'ClerkTree',
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES client_portal_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT client_updates_kind_check CHECK (kind IN ('update', 'milestone', 'risk', 'note')),
    CONSTRAINT client_updates_client_title_unique UNIQUE (client_id, title)
);

CREATE INDEX IF NOT EXISTS idx_client_portal_directory_client_id
    ON client_portal_directory(client_id);

CREATE INDEX IF NOT EXISTS idx_client_portal_users_client_id
    ON client_portal_users(client_id);

CREATE INDEX IF NOT EXISTS idx_client_deliverables_client_id_due_date
    ON client_deliverables(client_id, due_date);

CREATE INDEX IF NOT EXISTS idx_client_updates_client_id_posted_at
    ON client_updates(client_id, posted_at DESC);

CREATE OR REPLACE FUNCTION client_portal_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS client_accounts_updated_at ON client_accounts;
CREATE TRIGGER client_accounts_updated_at
    BEFORE UPDATE ON client_accounts
    FOR EACH ROW
    EXECUTE FUNCTION client_portal_set_updated_at();

DROP TRIGGER IF EXISTS client_portal_directory_updated_at ON client_portal_directory;
CREATE TRIGGER client_portal_directory_updated_at
    BEFORE UPDATE ON client_portal_directory
    FOR EACH ROW
    EXECUTE FUNCTION client_portal_set_updated_at();

DROP TRIGGER IF EXISTS client_portal_users_updated_at ON client_portal_users;
CREATE TRIGGER client_portal_users_updated_at
    BEFORE UPDATE ON client_portal_users
    FOR EACH ROW
    EXECUTE FUNCTION client_portal_set_updated_at();

DROP TRIGGER IF EXISTS client_deliverables_updated_at ON client_deliverables;
CREATE TRIGGER client_deliverables_updated_at
    BEFORE UPDATE ON client_deliverables
    FOR EACH ROW
    EXECUTE FUNCTION client_portal_set_updated_at();

DROP TRIGGER IF EXISTS client_updates_updated_at ON client_updates;
CREATE TRIGGER client_updates_updated_at
    BEFORE UPDATE ON client_updates
    FOR EACH ROW
    EXECUTE FUNCTION client_portal_set_updated_at();

ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portal directory is public" ON client_accounts;
CREATE POLICY "Portal directory is public"
    ON client_accounts FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Portal usernames are public" ON client_portal_directory;
CREATE POLICY "Portal usernames are public"
    ON client_portal_directory FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "Portal users can read their own profile" ON client_portal_users;
CREATE POLICY "Portal users can read their own profile"
    ON client_portal_users FOR SELECT
    TO authenticated
    USING (id = auth.uid() AND is_active = TRUE);

DROP POLICY IF EXISTS "Portal users can update their own profile" ON client_portal_users;
CREATE POLICY "Portal users can update their own profile"
    ON client_portal_users FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Portal members can read deliverables" ON client_deliverables;
CREATE POLICY "Portal members can read deliverables"
    ON client_deliverables FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_deliverables.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can insert deliverables" ON client_deliverables;
CREATE POLICY "Portal members can insert deliverables"
    ON client_deliverables FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_deliverables.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can update deliverables" ON client_deliverables;
CREATE POLICY "Portal members can update deliverables"
    ON client_deliverables FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_deliverables.client_id
              AND client_portal_users.is_active = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_deliverables.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can delete deliverables" ON client_deliverables;
CREATE POLICY "Portal members can delete deliverables"
    ON client_deliverables FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_deliverables.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can read updates" ON client_updates;
CREATE POLICY "Portal members can read updates"
    ON client_updates FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_updates.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can insert updates" ON client_updates;
CREATE POLICY "Portal members can insert updates"
    ON client_updates FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_updates.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can update updates" ON client_updates;
CREATE POLICY "Portal members can update updates"
    ON client_updates FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_updates.client_id
              AND client_portal_users.is_active = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_updates.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "Portal members can delete updates" ON client_updates;
CREATE POLICY "Portal members can delete updates"
    ON client_updates FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM client_portal_users
            WHERE client_portal_users.id = auth.uid()
              AND client_portal_users.client_id = client_updates.client_id
              AND client_portal_users.is_active = TRUE
        )
    );

GRANT SELECT ON client_accounts TO anon, authenticated;
GRANT SELECT ON client_portal_directory TO anon, authenticated;
GRANT SELECT, UPDATE ON client_portal_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_deliverables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_updates TO authenticated;

INSERT INTO client_accounts (
    id,
    slug,
    name,
    logo_url,
    accent_color,
    surface_color,
    summary,
    support_email
) VALUES (
    '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
    'gluth',
    'Gluth System Technik',
    '/client-logos/gluth.webp',
    '#4EC4B6',
    '#2C3F49',
    'Client portal for deliverables, milestones, and operating updates.',
    'client-success@clerktree.com'
)
ON CONFLICT (id) DO UPDATE
SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    accent_color = EXCLUDED.accent_color,
    surface_color = EXCLUDED.surface_color,
    summary = EXCLUDED.summary,
    support_email = EXCLUDED.support_email,
    is_active = TRUE;

INSERT INTO client_portal_directory (
    username,
    client_id,
    welcome_label,
    is_active
) VALUES (
    'gluth',
    '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
    'Gluth delivery workspace',
    TRUE
)
ON CONFLICT (username) DO UPDATE
SET
    client_id = EXCLUDED.client_id,
    welcome_label = EXCLUDED.welcome_label,
    is_active = TRUE;

INSERT INTO client_deliverables (
    id,
    client_id,
    title,
    summary,
    status,
    priority,
    progress,
    due_date,
    owner_label,
    category,
    resource_label,
    resource_url,
    notes
) VALUES
    (
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901001',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'Client portal launch',
        'Ship the first branded workspace for Gluth with secure sign-in and live deliverable tracking.',
        'in_progress',
        'high',
        72,
        DATE '2026-06-18',
        'ClerkTree product team',
        'Portal',
        'Launch scope',
        'https://clerktree.com/docs',
        'Includes two-step username recognition, Supabase-backed data, and a branded dashboard.'
    ),
    (
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901002',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'Operations handoff blueprint',
        'Document the first automation surfaces and shared workflows for Gluth operations.',
        'review',
        'medium',
        88,
        DATE '2026-06-24',
        'Solutions engineering',
        'Enablement',
        'Working notes',
        'https://clerktree.com/solutions',
        'Prepared for Linear and Notion syncing once integrations are switched on.'
    ),
    (
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901003',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'Weekly executive digest',
        'Create a clean rhythm for client-visible updates, blockers, and milestone callouts.',
        'planned',
        'medium',
        20,
        DATE '2026-06-27',
        'Delivery management',
        'Reporting',
        'Digest template',
        'https://clerktree.com/blog',
        'Will later ingest Linear and Notion events into the same timeline.'
    ),
    (
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901004',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'Client success playbook',
        'Package support contacts, escalation rules, and operating norms inside the portal.',
        'done',
        'low',
        100,
        DATE '2026-06-08',
        'Customer success',
        'Support',
        'Support notes',
        'mailto:client-success@clerktree.com',
        'Initial support workflows are already documented for the Gluth team.'
    )
ON CONFLICT (id) DO UPDATE
SET
    summary = EXCLUDED.summary,
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    progress = EXCLUDED.progress,
    due_date = EXCLUDED.due_date,
    owner_label = EXCLUDED.owner_label,
    category = EXCLUDED.category,
    resource_label = EXCLUDED.resource_label,
    resource_url = EXCLUDED.resource_url,
    notes = EXCLUDED.notes;

INSERT INTO client_updates (
    id,
    client_id,
    deliverable_id,
    title,
    body,
    kind,
    posted_by,
    posted_at,
    is_pinned
) VALUES
    (
        'd469a709-2aa8-4c9d-a7ff-8b0694dd1001',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901001',
        'Portal foundation is live',
        'The Gluth workspace is now structured around branded authentication, active deliverables, and a single place to review milestones.',
        'milestone',
        'ClerkTree',
        TIMESTAMPTZ '2026-06-06 09:00:00+00',
        TRUE
    ),
    (
        'd469a709-2aa8-4c9d-a7ff-8b0694dd1002',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        'cb8cb6ab-9680-42e0-bf2a-4c1c78901002',
        'Integration lane reserved',
        'The schema and dashboard are prepared for Linear and Notion syncs so those systems can later publish directly into the same updates stream.',
        'note',
        'ClerkTree',
        TIMESTAMPTZ '2026-06-06 11:15:00+00',
        FALSE
    ),
    (
        'd469a709-2aa8-4c9d-a7ff-8b0694dd1003',
        '9fe0f880-8f60-4b41-8dc2-3f57dc991001',
        NULL,
        'Client review checkpoint',
        'Next review focuses on deliverable prioritization, executive visibility, and the first integration handoff path.',
        'update',
        'ClerkTree',
        TIMESTAMPTZ '2026-06-06 14:30:00+00',
        FALSE
    )
ON CONFLICT (id) DO UPDATE
SET
    deliverable_id = EXCLUDED.deliverable_id,
    body = EXCLUDED.body,
    kind = EXCLUDED.kind,
    posted_by = EXCLUDED.posted_by,
    posted_at = EXCLUDED.posted_at,
    is_pinned = EXCLUDED.is_pinned;
