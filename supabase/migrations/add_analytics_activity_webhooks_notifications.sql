-- ═══════════════════════════════════════════════════════════════
-- Migration: Analytics, Activity Log, Webhooks, Notifications
-- ═══════════════════════════════════════════════════════════════

-- ─── Activity Log ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type  TEXT NOT NULL,  -- 'auth' | 'billing' | 'team' | 'api_keys' | 'config' | 'documents' | 'integrations'
    action      TEXT NOT NULL,  -- 'login' | 'logout' | 'payment_success' | 'key_created' | 'member_invited' ...
    description TEXT NOT NULL DEFAULT '',
    metadata    JSONB DEFAULT '{}'::jsonb,
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_event_type ON public.activity_log(event_type);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can read own activity" ON public.activity_log
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service role inserts activity" ON public.activity_log
        FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Webhooks ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhooks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    events      TEXT[] NOT NULL DEFAULT '{}',  -- ['call.completed', 'payment.success', 'team.member_joined', ...]
    secret      TEXT NOT NULL DEFAULT '',       -- signing secret for HMAC
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON public.webhooks(user_id);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own webhooks" ON public.webhooks
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Webhook Deliveries (delivery log) ──────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id  UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event       TEXT NOT NULL,
    payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
    status_code INT,
    response    TEXT,
    success     BOOLEAN NOT NULL DEFAULT false,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user_id ON public.webhook_deliveries(user_id);

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users read own deliveries" ON public.webhook_deliveries
        FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service role inserts deliveries" ON public.webhook_deliveries
        FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL,  -- 'info' | 'warning' | 'success' | 'error'
    title       TEXT NOT NULL,
    message     TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'system',  -- 'billing' | 'team' | 'security' | 'system' | 'calls'
    is_read     BOOLEAN NOT NULL DEFAULT false,
    action_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own notifications" ON public.notifications
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Notification Preferences ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email_low_credits   BOOLEAN NOT NULL DEFAULT true,
    email_payment       BOOLEAN NOT NULL DEFAULT true,
    email_team          BOOLEAN NOT NULL DEFAULT true,
    email_weekly_report BOOLEAN NOT NULL DEFAULT false,
    push_calls          BOOLEAN NOT NULL DEFAULT true,
    push_security       BOOLEAN NOT NULL DEFAULT true,
    push_billing        BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users manage own prefs" ON public.notification_preferences
        FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── User Profile Settings ──────────────────────────────────
-- Extends the existing user_settings table
DO $$ BEGIN
    ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS display_name TEXT;
    ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
    ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS company_name TEXT;
    ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
EXCEPTION WHEN undefined_table THEN
    CREATE TABLE public.user_settings (
        user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        credits_balance NUMERIC NOT NULL DEFAULT 50.0,
        display_name    TEXT,
        timezone        TEXT DEFAULT 'UTC',
        company_name    TEXT,
        phone           TEXT,
        updated_at      TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
END $$;
