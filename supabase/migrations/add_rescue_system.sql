-- ═══════════════════════════════════════════════════════════════
-- Rescue System: Playbooks, Settings, Actions, Audits, Reports
-- ═══════════════════════════════════════════════════════════════

-- ─── rescue_playbooks ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_playbooks (
  id              TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  channels        JSONB NOT NULL DEFAULT '[]'::JSONB,
  message_template TEXT NOT NULL DEFAULT '',
  voice_script    TEXT NOT NULL DEFAULT '',
  credit_amount_inr NUMERIC NOT NULL DEFAULT 0,
  discount_percent  NUMERIC NOT NULL DEFAULT 0,
  success_criteria  TEXT NOT NULL DEFAULT '',
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  ab_test_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  versions        JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rescue_playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own playbooks"
  ON rescue_playbooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own playbooks"
  ON rescue_playbooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playbooks"
  ON rescue_playbooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playbooks"
  ON rescue_playbooks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_rescue_playbooks_user ON rescue_playbooks(user_id);

-- ─── rescue_settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_threshold  NUMERIC NOT NULL DEFAULT 0.5,
  growth_threshold NUMERIC NOT NULL DEFAULT 0.2,
  automation_level TEXT NOT NULL DEFAULT 'manual'
    CHECK (automation_level IN ('manual', 'semi_auto', 'full_auto')),
  plan_tier       TEXT NOT NULL DEFAULT 'pro'
    CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  avg_monthly_revenue_per_customer_inr NUMERIC NOT NULL DEFAULT 12000,
  auto_rescue_max_potential_loss_inr   NUMERIC NOT NULL DEFAULT 200000,
  success_fee_percent NUMERIC NOT NULL DEFAULT 10,
  rescue_insurance_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  compliance      JSONB NOT NULL DEFAULT '{
    "maxCustomersPerRescue": 500,
    "maxRescuesPerCustomerPerMonth": 2,
    "requireManagerApprovalAboveInr": 500000,
    "optedOutCustomerIds": []
  }'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rescue_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON rescue_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON rescue_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON rescue_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── rescue_actions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_actions (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id    TEXT NOT NULL,
  cluster_id        TEXT NOT NULL,
  cluster_label     TEXT NOT NULL DEFAULT '',
  member_ids        JSONB NOT NULL DEFAULT '[]'::JSONB,
  member_names      JSONB NOT NULL DEFAULT '[]'::JSONB,
  member_count      INTEGER NOT NULL DEFAULT 0,
  playbook_id       TEXT NOT NULL,
  playbook_name     TEXT NOT NULL DEFAULT '',
  playbook_snapshot JSONB NOT NULL DEFAULT '{}'::JSONB,
  channels          JSONB NOT NULL DEFAULT '[]'::JSONB,
  trigger_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for     TIMESTAMPTZ,
  executed_at       TIMESTAMPTZ,
  status            TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'requires_approval', 'completed', 'cancelled')),
  estimated_cost_inr  NUMERIC NOT NULL DEFAULT 0,
  potential_loss_inr  NUMERIC NOT NULL DEFAULT 0,
  consent_status    TEXT NOT NULL DEFAULT 'pending'
    CHECK (consent_status IN ('verified', 'pending')),
  proof_id          TEXT NOT NULL DEFAULT '',
  proof_summary     TEXT NOT NULL DEFAULT '',
  dispatches        JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_by        TEXT NOT NULL DEFAULT 'user'
    CHECK (created_by IN ('user', 'automation')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rescue_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions"
  ON rescue_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own actions"
  ON rescue_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON rescue_actions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rescue_actions_user ON rescue_actions(user_id);
CREATE INDEX idx_rescue_actions_cluster ON rescue_actions(cluster_id);
CREATE INDEX idx_rescue_actions_status ON rescue_actions(status);
CREATE INDEX idx_rescue_actions_trigger ON rescue_actions(trigger_at DESC);

-- ─── rescue_audit_log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_audit_log (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor             TEXT NOT NULL DEFAULT 'system',
  action            TEXT NOT NULL,
  cluster_id        TEXT,
  rescue_action_id  TEXT,
  details           TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rescue_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON rescue_audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audits"
  ON rescue_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rescue_audit_user ON rescue_audit_log(user_id);
CREATE INDEX idx_rescue_audit_at ON rescue_audit_log(at DESC);

-- ─── rescue_reports ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescue_reports (
  id                TEXT PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_key         TEXT NOT NULL,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  headline          TEXT NOT NULL DEFAULT '',
  total_protected_inr NUMERIC NOT NULL DEFAULT 0,
  cluster_count     INTEGER NOT NULL DEFAULT 0,
  rows              JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month_key)
);

ALTER TABLE rescue_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON rescue_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON rescue_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON rescue_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rescue_reports_user ON rescue_reports(user_id);
CREATE INDEX idx_rescue_reports_month ON rescue_reports(month_key DESC);

-- ─── Grant service_role full access for edge functions ─────────
-- (Edge functions use the service role key, which bypasses RLS by default)
-- These grants ensure the admin client can perform all operations.
GRANT ALL ON rescue_playbooks TO service_role;
GRANT ALL ON rescue_settings TO service_role;
GRANT ALL ON rescue_actions TO service_role;
GRANT ALL ON rescue_audit_log TO service_role;
GRANT ALL ON rescue_reports TO service_role;
