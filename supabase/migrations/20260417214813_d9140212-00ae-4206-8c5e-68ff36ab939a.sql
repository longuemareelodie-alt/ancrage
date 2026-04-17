-- Table to log emergency button uses (for daily quota tracking)
CREATE TABLE IF NOT EXISTS public.emergency_uses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  used_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date
);

CREATE INDEX IF NOT EXISTS idx_emergency_uses_user_date
  ON public.emergency_uses (user_id, used_date);

ALTER TABLE public.emergency_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emergency uses"
  ON public.emergency_uses FOR SELECT
  USING (auth.uid() = user_id);

-- No client inserts: only the security-definer function may insert
CREATE POLICY "No client inserts on emergency_uses"
  ON public.emergency_uses FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client updates on emergency_uses"
  ON public.emergency_uses FOR UPDATE
  TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client deletes on emergency_uses"
  ON public.emergency_uses FOR DELETE
  TO authenticated
  USING (false);

-- Get current usage for today (no increment)
CREATE OR REPLACE FUNCTION public.get_emergency_usage()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _plan text;
  _used_today integer;
  _limit integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT plan_type INTO _plan
  FROM public.profiles
  WHERE user_id = _user_id;

  SELECT count(*) INTO _used_today
  FROM public.emergency_uses
  WHERE user_id = _user_id
    AND used_date = (now() AT TIME ZONE 'UTC')::date;

  IF _plan = 'subscription' THEN
    _limit := -1; -- unlimited
  ELSIF _plan = 'lifetime' THEN
    _limit := 3;
  ELSE
    _limit := 0;
  END IF;

  RETURN jsonb_build_object(
    'plan_type', COALESCE(_plan, 'none'),
    'used_today', _used_today,
    'daily_limit', _limit,
    'unlimited', _limit = -1,
    'remaining', CASE WHEN _limit = -1 THEN -1 ELSE GREATEST(0, _limit - _used_today) END
  );
END;
$$;

-- Increment usage if quota allows
CREATE OR REPLACE FUNCTION public.use_emergency()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _plan text;
  _used_today integer;
  _limit integer;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT plan_type INTO _plan
  FROM public.profiles
  WHERE user_id = _user_id;

  SELECT count(*) INTO _used_today
  FROM public.emergency_uses
  WHERE user_id = _user_id
    AND used_date = (now() AT TIME ZONE 'UTC')::date;

  IF _plan = 'subscription' THEN
    _limit := -1;
  ELSIF _plan = 'lifetime' THEN
    _limit := 3;
  ELSE
    _limit := 0;
  END IF;

  IF _limit <> -1 AND _used_today >= _limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'plan_type', COALESCE(_plan, 'none'),
      'used_today', _used_today,
      'daily_limit', _limit,
      'remaining', 0
    );
  END IF;

  INSERT INTO public.emergency_uses (user_id) VALUES (_user_id);
  _used_today := _used_today + 1;

  RETURN jsonb_build_object(
    'allowed', true,
    'plan_type', COALESCE(_plan, 'none'),
    'used_today', _used_today,
    'daily_limit', _limit,
    'unlimited', _limit = -1,
    'remaining', CASE WHEN _limit = -1 THEN -1 ELSE GREATEST(0, _limit - _used_today) END
  );
END;
$$;