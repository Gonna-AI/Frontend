-- Close row-level-security gaps found in the production review.
-- Edge functions use the service role, which bypasses RLS, so none of the policies
-- removed or narrowed below is needed by them.

-- 1. These INSERT policies had no role, so they applied to everyone (including the
--    public anon key): anybody could write audit-log and webhook-delivery rows for any user.
DROP POLICY IF EXISTS "Service role inserts activity" ON public.activity_log;
DROP POLICY IF EXISTS "Service role inserts deliveries" ON public.webhook_deliveries;

-- 2. active_sessions held every user's sessions (caller name, user agent) and was readable
--    by any signed-in user, and by the anonymous key. Each user may read only their own.
DROP POLICY IF EXISTS "Anon can view active session counts" ON public.active_sessions;
DROP POLICY IF EXISTS "Authenticated users can view active sessions" ON public.active_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.active_sessions;
CREATE POLICY "Users can view own sessions"
    ON public.active_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- 3. The remaining per-user policies are written with auth.uid(), which is NULL for anonymous
--    requests, so they never match. Make that explicit instead of relying on it.
DO $$
DECLARE
    policy record;
BEGIN
    FOR policy IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND roles = '{public}'
          AND (qual ILIKE '%auth.uid()%' OR with_check ILIKE '%auth.uid()%')
    LOOP
        EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated', policy.policyname, policy.schemaname, policy.tablename);
    END LOOP;
END $$;
