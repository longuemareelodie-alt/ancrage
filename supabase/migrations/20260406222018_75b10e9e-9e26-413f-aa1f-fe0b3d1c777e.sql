
CREATE OR REPLACE FUNCTION public.award_badges(_badge_keys text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _streak integer;
  _total bigint;
  _valid_keys text[];
BEGIN
  -- Get current streak from profile
  SELECT current_streak INTO _streak
  FROM public.profiles
  WHERE user_id = _user_id;

  -- Count total checkins
  SELECT count(*) INTO _total
  FROM public.emotion_checkins
  WHERE user_id = _user_id;

  -- Filter only badges the user actually qualifies for
  SELECT array_agg(k) INTO _valid_keys
  FROM unnest(_badge_keys) AS k
  WHERE
    (k = 'first_checkin' AND _total >= 1) OR
    (k = 'streak_3'     AND _streak >= 3) OR
    (k = 'streak_7'     AND _streak >= 7) OR
    (k = 'streak_14'    AND _streak >= 14) OR
    (k = 'streak_30'    AND _streak >= 30) OR
    (k = 'checkins_10'  AND _total >= 10) OR
    (k = 'checkins_50'  AND _total >= 50);

  IF _valid_keys IS NOT NULL THEN
    INSERT INTO public.user_badges (user_id, badge_key)
    SELECT _user_id, unnest(_valid_keys)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
