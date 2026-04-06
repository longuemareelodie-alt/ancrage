
-- Function to award badges securely (only for the calling user)
CREATE OR REPLACE FUNCTION public.award_badges(_badge_keys text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_badges (user_id, badge_key)
  SELECT auth.uid(), unnest(_badge_keys)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Function to upsert user progress securely
CREATE OR REPLACE FUNCTION public.upsert_user_progress(_completed_phases integer[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, completed_phases)
  VALUES (auth.uid(), _completed_phases)
  ON CONFLICT (user_id) DO UPDATE SET completed_phases = _completed_phases, updated_at = now();
END;
$$;
