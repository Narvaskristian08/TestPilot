-- Guest runs are accessed through the backend, which validates the guest
-- fingerprint and IP before using its service-role client. Do not expose all
-- guest rows through the public Supabase Data API.

DROP POLICY IF EXISTS "Users can view own test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can create test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can update own test runs" ON public.test_runs;
DROP POLICY IF EXISTS "Users can delete own test runs" ON public.test_runs;

CREATE POLICY "Users can view own test runs"
  ON public.test_runs FOR SELECT
  USING (
    auth.uid() = (
      SELECT supabase_user_id FROM public.users WHERE public.users.id = public.test_runs.user_id
    )
  );

CREATE POLICY "Users can create test runs"
  ON public.test_runs FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT supabase_user_id FROM public.users WHERE public.users.id = public.test_runs.user_id
    )
  );

CREATE POLICY "Users can update own test runs"
  ON public.test_runs FOR UPDATE
  USING (
    auth.uid() = (
      SELECT supabase_user_id FROM public.users WHERE public.users.id = public.test_runs.user_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT supabase_user_id FROM public.users WHERE public.users.id = public.test_runs.user_id
    )
  );

CREATE POLICY "Users can delete own test runs"
  ON public.test_runs FOR DELETE
  USING (
    auth.uid() = (
      SELECT supabase_user_id FROM public.users WHERE public.users.id = public.test_runs.user_id
    )
  );

DROP POLICY IF EXISTS "Users can view test results via test runs" ON public.test_results;

CREATE POLICY "Users can view test results via test runs"
  ON public.test_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_runs
      WHERE public.test_runs.id = public.test_results.run_id
        AND auth.uid() = (
          SELECT supabase_user_id
          FROM public.users
          WHERE public.users.id = public.test_runs.user_id
        )
    )
  );

DROP POLICY IF EXISTS "Users can view artifacts via test runs" ON public.test_artifacts;

CREATE POLICY "Users can view artifacts via test runs"
  ON public.test_artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.test_runs
      WHERE public.test_runs.id = public.test_artifacts.run_id
        AND auth.uid() = (
          SELECT supabase_user_id
          FROM public.users
          WHERE public.users.id = public.test_runs.user_id
        )
    )
  );
