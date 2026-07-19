-- Free-plan guardrails for ClerkTree Production.
-- Keep the features the app uses, while preventing accidental public data access,
-- unbounded document uploads, and runaway database requests.

-- The app currently uses Realtime only for active_sessions. Keep that publication
-- narrow; adding every table would increase event traffic and egress.

-- Restrict the knowledge-base bucket to documents the app can process and cap
-- individual uploads at 10 MiB. R2 remains the primary media store.
UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
WHERE id = 'kb-documents';

-- Tables introduced for team and Google workspace support must not be exposed
-- without ownership checks.
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team owners can view teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can update teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can delete teams" ON public.teams;

CREATE POLICY "Team owners can view teams" ON public.teams
  FOR SELECT TO authenticated USING ((select auth.uid()) = owner_id);
CREATE POLICY "Team owners can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = owner_id);
CREATE POLICY "Team owners can update teams" ON public.teams
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);
CREATE POLICY "Team owners can delete teams" ON public.teams
  FOR DELETE TO authenticated USING ((select auth.uid()) = owner_id);

ALTER TABLE public.google_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own Google tasks" ON public.google_tasks;
DROP POLICY IF EXISTS "Users can create own Google tasks" ON public.google_tasks;
DROP POLICY IF EXISTS "Users can update own Google tasks" ON public.google_tasks;
DROP POLICY IF EXISTS "Users can delete own Google tasks" ON public.google_tasks;

CREATE POLICY "Users can view own Google tasks" ON public.google_tasks
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create own Google tasks" ON public.google_tasks
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own Google tasks" ON public.google_tasks
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own Google tasks" ON public.google_tasks
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

ALTER TABLE public.google_calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own Google calendar events" ON public.google_calendar_events;
DROP POLICY IF EXISTS "Users can create own Google calendar events" ON public.google_calendar_events;
DROP POLICY IF EXISTS "Users can update own Google calendar events" ON public.google_calendar_events;
DROP POLICY IF EXISTS "Users can delete own Google calendar events" ON public.google_calendar_events;

CREATE POLICY "Users can view own Google calendar events" ON public.google_calendar_events
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can create own Google calendar events" ON public.google_calendar_events
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own Google calendar events" ON public.google_calendar_events
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own Google calendar events" ON public.google_calendar_events
  FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

-- Bound query execution protects the free database from accidental unbounded
-- requests. Service-role Edge Function work is intentionally not constrained.
ALTER ROLE anon SET statement_timeout = '10s';
ALTER ROLE authenticated SET statement_timeout = '15s';
