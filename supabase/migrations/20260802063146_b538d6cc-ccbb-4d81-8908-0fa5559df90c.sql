ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS caregiver_role text,
  ADD COLUMN IF NOT EXISTS address_style text,
  ADD COLUMN IF NOT EXISTS address_custom text,
  ADD COLUMN IF NOT EXISTS challenges text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone;