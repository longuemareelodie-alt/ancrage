ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS access_code text;

CREATE OR REPLACE FUNCTION public.gen_medical_access_code()
RETURNS text LANGUAGE plpgsql VOLATILE SET search_path = public AS $$
DECLARE alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; b bytea := extensions.gen_random_bytes(8); r text := ''; i int;
BEGIN
  FOR i IN 0..7 LOOP r := r || substr(alphabet, (get_byte(b,i) % 31) + 1, 1); END LOOP;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.ensure_medical_token()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.public_token IS NULL OR length(NEW.public_token) < 32 THEN
    IF TG_OP = 'UPDATE' AND OLD.public_token IS NOT NULL AND length(OLD.public_token) >= 32 THEN
      NEW.public_token := OLD.public_token;
    ELSE
      NEW.public_token := encode(extensions.gen_random_bytes(24), 'hex');
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.public_token IS DISTINCT FROM OLD.public_token THEN
    NEW.access_code := public.gen_medical_access_code();
  ELSIF NEW.access_code IS NULL OR length(NEW.access_code) < 8 THEN
    IF TG_OP = 'UPDATE' AND OLD.access_code IS NOT NULL AND length(OLD.access_code) >= 8 THEN
      NEW.access_code := OLD.access_code;
    ELSE
      NEW.access_code := public.gen_medical_access_code();
    END IF;
  END IF;
  RETURN NEW;
END; $$;

-- Invalide l'ancien lien (et donne un code à chaque fiche)
UPDATE public.medical_records SET public_token = encode(extensions.gen_random_bytes(24), 'hex');

DROP FUNCTION IF EXISTS public.get_medical_record_by_token(text);

CREATE OR REPLACE FUNCTION public.get_medical_record_by_token(_token text, _code text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _record public.medical_records;
BEGIN
  IF _token IS NULL OR length(_token) < 32 OR _code IS NULL OR length(trim(_code)) < 8 THEN RETURN NULL; END IF;
  SELECT * INTO _record FROM public.medical_records
  WHERE public_token = _token AND is_public = true
    AND access_code IS NOT NULL AND length(access_code) >= 8
    AND access_code = upper(trim(_code))
  LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'first_name', _record.first_name, 'last_name', _record.last_name,
    'birth_date', _record.birth_date, 'blood_type', _record.blood_type,
    'allergies', _record.allergies, 'current_treatments', _record.current_treatments,
    'doctor_name', _record.doctor_name, 'doctor_phone', _record.doctor_phone,
    'emergency_contact_name', _record.emergency_contact_name,
    'emergency_contact_phone', _record.emergency_contact_phone,
    'medical_history', _record.medical_history, 'updated_at', _record.updated_at);
END; $function$;

GRANT EXECUTE ON FUNCTION public.get_medical_record_by_token(text, text) TO anon, authenticated;