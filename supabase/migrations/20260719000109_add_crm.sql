-- ═══════════════════════════════════════════════════════════════
-- CRM: Companies, Contacts, Pipelines, Deals, Activities
-- ═══════════════════════════════════════════════════════════════

-- ─── crm_companies ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name         TEXT NOT NULL,
  domain       TEXT,
  industry     TEXT,
  size         TEXT,
  logo_url     TEXT,
  website_url  TEXT,
  linkedin_url TEXT,
  address      TEXT,
  country      TEXT,
  notes        TEXT,
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_companies: owner full access"
  ON crm_companies FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── crm_contacts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL DEFAULT '',
  email        TEXT,
  phone        TEXT,
  job_title    TEXT,
  avatar_url   TEXT,
  linkedin_url TEXT,
  notes        TEXT,
  company_id   UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_contacts: owner full access"
  ON crm_contacts FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── crm_pipelines ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_pipelines (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name       TEXT NOT NULL DEFAULT 'Sales Pipeline',
  owner_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE crm_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_pipelines: owner full access"
  ON crm_pipelines FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── crm_pipeline_stages ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     UUID NOT NULL REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  color           TEXT NOT NULL DEFAULT '#6B7280',
  position        INTEGER NOT NULL DEFAULT 0,
  is_closed_won   BOOLEAN NOT NULL DEFAULT FALSE,
  is_closed_lost  BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_pipeline_stages: owner via pipeline"
  ON crm_pipeline_stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM crm_pipelines p
      WHERE p.id = pipeline_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_pipelines p
      WHERE p.id = pipeline_id AND p.owner_id = auth.uid()
    )
  );

-- ─── crm_deals ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_deals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name         TEXT NOT NULL,
  amount       NUMERIC,
  currency     TEXT NOT NULL DEFAULT 'USD',
  stage_id     UUID REFERENCES crm_pipeline_stages(id) ON DELETE SET NULL,
  company_id   UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  contact_id   UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  close_date   DATE,
  probability  INTEGER CHECK (probability BETWEEN 0 AND 100),
  notes        TEXT,
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_deals: owner full access"
  ON crm_deals FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── crm_activities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type        TEXT NOT NULL CHECK (type IN ('call','email','meeting','note','task')),
  title       TEXT,
  body        TEXT,
  deal_id     UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
  contact_id  UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES crm_companies(id) ON DELETE CASCADE,
  due_date    TIMESTAMPTZ,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crm_activities: owner full access"
  ON crm_activities FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── updated_at triggers ──────────────────────────────────────
CREATE OR REPLACE FUNCTION crm_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER crm_companies_updated_at  BEFORE UPDATE ON crm_companies  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();
CREATE TRIGGER crm_contacts_updated_at   BEFORE UPDATE ON crm_contacts   FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();
CREATE TRIGGER crm_deals_updated_at      BEFORE UPDATE ON crm_deals      FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();
CREATE TRIGGER crm_activities_updated_at BEFORE UPDATE ON crm_activities  FOR EACH ROW EXECUTE FUNCTION crm_set_updated_at();

-- ─── seed default pipeline for a user ─────────────────────────
CREATE OR REPLACE FUNCTION crm_seed_default_pipeline(p_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_pipeline_id UUID;
BEGIN
  INSERT INTO crm_pipelines (name, owner_id)
  VALUES ('Sales Pipeline', p_user_id)
  RETURNING id INTO v_pipeline_id;

  INSERT INTO crm_pipeline_stages (pipeline_id, name, color, position, is_closed_won, is_closed_lost) VALUES
    (v_pipeline_id, 'New Lead',      '#6366F1', 0, FALSE, FALSE),
    (v_pipeline_id, 'Qualified',     '#F59E0B', 1, FALSE, FALSE),
    (v_pipeline_id, 'Proposal Sent', '#FF8A5B', 2, FALSE, FALSE),
    (v_pipeline_id, 'Negotiation',   '#EC4899', 3, FALSE, FALSE),
    (v_pipeline_id, 'Closed Won',    '#10B981', 4, TRUE,  FALSE),
    (v_pipeline_id, 'Closed Lost',   '#6B7280', 5, FALSE, TRUE);

  RETURN v_pipeline_id;
END;
$$;
