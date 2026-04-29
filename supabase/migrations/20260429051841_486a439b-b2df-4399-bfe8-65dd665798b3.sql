ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_style text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_style_synced_at timestamptz;