CREATE OR REPLACE FUNCTION client_portal_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_client_deliverables_created_by
    ON client_deliverables(created_by);

CREATE INDEX IF NOT EXISTS idx_client_updates_created_by
    ON client_updates(created_by);

CREATE INDEX IF NOT EXISTS idx_client_updates_deliverable_id
    ON client_updates(deliverable_id);
