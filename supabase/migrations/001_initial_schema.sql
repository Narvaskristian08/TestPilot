-- =====================================================
-- TestPilot QA Automation - Supabase Database Schema
-- =====================================================

-- =====================================================
-- Users Table (extends Supabase auth.users)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = supabase_user_id);

-- =====================================================
-- Test Runs Table
-- =====================================================
CREATE TABLE test_runs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_id TEXT,
  url TEXT NOT NULL,
  browser TEXT DEFAULT 'chromium',
  status TEXT DEFAULT 'QUEUED' CHECK(status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  overall_status TEXT CHECK(overall_status IN ('PASSED', 'FAILED', 'WARNING')),
  test_mode TEXT DEFAULT 'quick',
  test_config JSONB,
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  duration_ms BIGINT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_runs_user ON test_runs(user_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_created ON test_runs(created_at DESC);

-- Enable RLS
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own test runs"
  ON test_runs FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR guest_id IS NOT NULL);

CREATE POLICY "Users can create test runs"
  ON test_runs FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR guest_id IS NOT NULL);

CREATE POLICY "Users can update own test runs"
  ON test_runs FOR UPDATE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR guest_id IS NOT NULL);

CREATE POLICY "Users can delete own test runs"
  ON test_runs FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR guest_id IS NOT NULL);

-- =====================================================
-- Test Results Table
-- =====================================================
CREATE TABLE test_results (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT REFERENCES test_runs(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PASSED', 'FAILED', 'WARNING', 'SKIPPED')),
  error_message TEXT,
  error_category TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  url TEXT,
  details JSONB,
  duration_ms BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_results_run ON test_results(run_id);
CREATE INDEX idx_test_results_status ON test_results(status);

-- Enable RLS
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view test results via test runs"
  ON test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = test_results.run_id
    AND (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = test_runs.user_id) OR test_runs.guest_id IS NOT NULL)
  ));

-- =====================================================
-- Test Artifacts Table (screenshots, traces, videos)
-- =====================================================
CREATE TABLE test_artifacts (
  id BIGSERIAL PRIMARY KEY,
  result_id BIGINT REFERENCES test_results(id) ON DELETE CASCADE,
  run_id BIGINT REFERENCES test_runs(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL CHECK(artifact_type IN ('SCREENSHOT', 'TRACE', 'LOG', 'VIDEO')),
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_artifacts_result ON test_artifacts(result_id);
CREATE INDEX idx_test_artifacts_run ON test_artifacts(run_id);

-- Enable RLS
ALTER TABLE test_artifacts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view artifacts via test runs"
  ON test_artifacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM test_runs
    WHERE test_runs.id = test_artifacts.run_id
    AND (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = test_runs.user_id) OR test_runs.guest_id IS NOT NULL)
  ));

-- =====================================================
-- Test Suites Table
-- =====================================================
CREATE TABLE test_suites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  test_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_suites_user ON test_suites(user_id);

-- Enable RLS
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own test suites"
  ON test_suites FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR user_id IS NULL);

CREATE POLICY "Users can create test suites"
  ON test_suites FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own test suites"
  ON test_suites FOR UPDATE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own test suites"
  ON test_suites FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- =====================================================
-- Test Cases Table
-- =====================================================
CREATE TABLE test_cases (
  id BIGSERIAL PRIMARY KEY,
  suite_id BIGINT REFERENCES test_suites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('AVAILABILITY', 'LINK_TEST', 'BUTTON_TEST', 'FORM_TEST', 'RESPONSIVE', 'CONSOLE_ERRORS', 'ACCESSIBILITY', 'SECURITY', 'PERFORMANCE')),
  description TEXT,
  config JSONB,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_cases_suite ON test_cases(suite_id);
CREATE INDEX idx_test_cases_user ON test_cases(user_id);

-- Enable RLS
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view test cases"
  ON test_cases FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id) OR user_id IS NULL);

CREATE POLICY "Users can create test cases"
  ON test_cases FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own test cases"
  ON test_cases FOR UPDATE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own test cases"
  ON test_cases FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- =====================================================
-- Schedules Table
-- =====================================================
CREATE TABLE schedules (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  suite_id BIGINT REFERENCES test_suites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  enabled BOOLEAN DEFAULT true,
  next_run TIMESTAMPTZ,
  last_run TIMESTAMPTZ,
  last_status TEXT CHECK(last_status IN ('success', 'failed', 'running')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_enabled ON schedules(enabled);
CREATE INDEX idx_schedules_next_run ON schedules(next_run);

-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- =====================================================
-- Environments Table
-- =====================================================
CREATE TABLE environments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'development' CHECK(type IN ('development', 'staging', 'production')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_environments_user ON environments(user_id);

-- Enable RLS
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own environments"
  ON environments FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create environments"
  ON environments FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can update own environments"
  ON environments FOR UPDATE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own environments"
  ON environments FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- =====================================================
-- Reports Table
-- =====================================================
CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,
  warning_tests INTEGER DEFAULT 0,
  pass_rate DECIMAL(5, 2) DEFAULT 0,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = (SELECT supabase_user_id FROM users WHERE id = user_id));

-- =====================================================
-- Guest Usage Tracking Table
-- =====================================================
CREATE TABLE guest_usage (
  id BIGSERIAL PRIMARY KEY,
  guest_id TEXT NOT NULL,
  ip_address TEXT,
  test_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id)
);

CREATE INDEX idx_guest_usage_guest ON guest_usage(guest_id);
CREATE INDEX idx_guest_usage_ip ON guest_usage(ip_address);

-- =====================================================
-- Daily Usage Tracking Table (for authenticated users)
-- =====================================================
CREATE TABLE daily_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE DEFAULT CURRENT_DATE,
  test_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

CREATE INDEX idx_daily_usage_user ON daily_usage(user_id);
CREATE INDEX idx_daily_usage_date ON daily_usage(usage_date);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_environments_updated_at BEFORE UPDATE ON environments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (supabase_user_id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
