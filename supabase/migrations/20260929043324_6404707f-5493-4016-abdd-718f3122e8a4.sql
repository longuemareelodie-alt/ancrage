CREATE OR REPLACE FUNCTION public.regenerate_medical_token()
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _new_token text := encode(extensions.gen_random_bytes(24), 'hex');
  _last_regen timestamptz;
  _cooldown_seconds integer := 300;
  _elapsed integer;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT last_token_regen_at INTO _last_regen FROM public.medical_records WHERE user_id = _user_id;
  IF _last_regen IS NOT NULL THEN
    _elapsed := EXTRACT(EPOCH FROM (now() - _last_regen))::integer;
    IF _elapsed < _cooldown_seconds THEN
      RETURN jsonb_build_object('success', false, 'retry_after_seconds', _cooldown_seconds - _elapsed, 'cooldown_seconds', _cooldown_seconds);
    END IF;
  END IF;
  UPDATE public.medical_records SET public_token = _new_token, last_token_regen_at = now() WHERE user_id = _user_id;
  RETURN jsonb_build_object('success', true, 'token', _new_token, 'cooldown_seconds', _cooldown_seconds);
END;
$function$;