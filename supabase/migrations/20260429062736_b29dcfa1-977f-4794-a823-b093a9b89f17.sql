-- 1) Drop the OLD CHECK constraint first so we can write the new value
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_plan_type_check;

-- 2) Drop the duplicate protect trigger (we keep protect_is_premium_trigger)
DROP TRIGGER IF EXISTS protect_premium_trigger ON public.profiles;

-- 3) Loosen protect trigger temporarily to allow the data migration UPDATE
CREATE OR REPLACE FUNCTION public.protect_is_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    -- Allow legacy → canonical migration to flow through
    IF NOT (NEW.plan_type IN ('paid', 'none') AND OLD.plan_type NOT IN ('paid', 'none')) THEN
      IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
        NEW.is_premium := OLD.is_premium;
      END IF;
      IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
        NEW.plan_type := OLD.plan_type;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 4) Normalise data
UPDATE public.profiles
SET plan_type = CASE WHEN is_premium = true THEN 'paid' ELSE 'none' END
WHERE plan_type NOT IN ('none', 'paid');

-- 5) Apply the new tight CHECK constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_plan_type_check
CHECK (plan_type IN ('none', 'paid'));

-- 6) Restore strict protection
CREATE OR REPLACE FUNCTION public.protect_is_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_premium IS DISTINCT FROM OLD.is_premium THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.is_premium := OLD.is_premium;
    END IF;
  END IF;
  IF NEW.plan_type IS DISTINCT FROM OLD.plan_type THEN
    IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
      NEW.plan_type := OLD.plan_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 7) Simplify get_emergency_usage: any paying user gets unlimited use
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

  SELECT plan_type INTO _plan FROM public.profiles WHERE user_id = _user_id;

  SELECT count(*) INTO _used_today
  FROM public.emergency_uses
  WHERE user_id = _user_id
    AND used_date = (now() AT TIME ZONE 'UTC')::date;

  IF _plan = 'paid' THEN _limit := -1; ELSE _limit := 0; END IF;

  RETURN jsonb_build_object(
    'plan_type', COALESCE(_plan, 'none'),
    'used_today', _used_today,
    'daily_limit', _limit,
    'unlimited', _limit = -1,
    'remaining', CASE WHEN _limit = -1 THEN -1 ELSE GREATEST(0, _limit - _used_today) END
  );
END;
$$;

-- 8) Simplify use_emergency
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

  SELECT plan_type INTO _plan FROM public.profiles WHERE user_id = _user_id;

  SELECT count(*) INTO _used_today
  FROM public.emergency_uses
  WHERE user_id = _user_id
    AND used_date = (now() AT TIME ZONE 'UTC')::date;

  IF _plan = 'paid' THEN _limit := -1; ELSE _limit := 0; END IF;

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