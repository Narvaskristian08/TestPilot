-- Keep the hosted guest usage schema aligned with the backend model layer.
-- This is idempotent so it can be applied to projects at different stages.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'guest_usage'
      AND column_name = 'guest_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'guest_usage'
      AND column_name = 'guest_identifier'
  ) THEN
    ALTER TABLE public.guest_usage RENAME COLUMN guest_id TO guest_identifier;
  END IF;
END $$;

ALTER TABLE public.guest_usage
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.guest_usage
SET last_used_at = COALESCE(last_used_at, created_at)
WHERE last_used_at IS NULL;

-- Guest and daily usage are accessed through the backend service role. Keep
-- them out of the public Data API so one user cannot inspect another user's
-- usage records.
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
