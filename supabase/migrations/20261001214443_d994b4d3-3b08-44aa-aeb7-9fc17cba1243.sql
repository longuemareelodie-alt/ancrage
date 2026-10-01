ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active_spaces text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_needs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS organization_goal text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS personalization_version integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS personalization_prefs jsonb NOT NULL DEFAULT '{}'::jsonb;