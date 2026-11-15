-- Public marketing contact submissions. Writes are restricted to the Edge Function,
-- which uses the service role after validating and rate-limiting the request.
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    interest TEXT NOT NULL,
    employee_count TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(lower(email));
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contacts FROM anon, authenticated;
