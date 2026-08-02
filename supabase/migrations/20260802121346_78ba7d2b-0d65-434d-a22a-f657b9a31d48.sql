CREATE OR REPLACE FUNCTION public.accept_family_invitation(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _my_email text;
  _inv public.family_invitations;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(email) INTO _my_email FROM public.profiles WHERE user_id = _user_id;

  SELECT * INTO _inv FROM public.family_invitations WHERE token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('accepted', false, 'reason', 'not_found');
  END IF;

  IF _inv.status = 'accepted' THEN
    RETURN jsonb_build_object('accepted', true, 'reason', 'already_accepted');
  END IF;

  IF _inv.status <> 'pending' OR _inv.expires_at < now() THEN
    RETURN jsonb_build_object('accepted', false, 'reason', 'not_valid');
  END IF;

  IF _my_email IS NULL OR _my_email <> lower(_inv.email) THEN
    RETURN jsonb_build_object('accepted', false, 'reason', 'email_mismatch');
  END IF;

  UPDATE public.family_invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_user_id = _user_id
  WHERE id = _inv.id;

  RETURN jsonb_build_object('accepted', true, 'reason', 'ok');
END;
$$;