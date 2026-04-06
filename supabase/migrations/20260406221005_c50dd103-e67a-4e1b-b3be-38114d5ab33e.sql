
CREATE OR REPLACE FUNCTION public.get_is_premium(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF _user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN COALESCE(
    (SELECT is_premium FROM public.profiles WHERE user_id = _user_id),
    false
  );
END;
$$;
