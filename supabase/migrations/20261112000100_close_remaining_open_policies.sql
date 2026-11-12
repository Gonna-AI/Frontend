-- Follow-up to 20261111000100_tighten_row_level_security.sql, found when verifying it against production.

-- active_sessions: a second "everyone can see everything" SELECT policy (under a different name) was
-- still in place, so any signed-in user could read every user's sessions. Only the owner may read.
DROP POLICY IF EXISTS "Authenticated users can view active session counts" ON public.active_sessions;

-- knowledge_base_config: readable by the anonymous key, for every row. Nothing in the app reads it as
-- the anonymous role (edge functions use the service role, which bypasses RLS).
DROP POLICY IF EXISTS "Anyone can read kb config by user_id" ON public.knowledge_base_config;
