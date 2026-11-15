-- SECURITY: privileged (SECURITY DEFINER) functions were executable by the public
-- `anon` role. They take a user id as an argument and never check the caller, so
-- anyone holding the public anon key could, for example, call get_google_tokens(uuid)
-- and read another user's decrypted Google tokens, or add_user_credits(uuid, n).
--
-- Every caller is an edge function using the service-role client (see
-- supabase/functions/_shared/google-client.ts), and the frontend makes no .rpc()
-- calls, so access is restricted to service_role.
--
-- validate_access_code() checks auth.uid() itself and stays callable.

DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proname <> 'validate_access_code'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.sig);
    -- Pin the search path so a caller cannot shadow objects the function uses.
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', fn.sig);
  END LOOP;
END
$$;

-- Functions created later must not be public by default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;
