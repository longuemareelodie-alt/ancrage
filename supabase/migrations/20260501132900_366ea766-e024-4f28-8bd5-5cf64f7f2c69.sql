ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_type text,
  ADD COLUMN IF NOT EXISTS parent_type_synced_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_parent_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_parent_type_check
  CHECK (parent_type IS NULL OR parent_type IN ('maman','papa'));