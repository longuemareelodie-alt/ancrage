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
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS ensure_medical_token ON public.medical_records;
CREATE TRIGGER ensure_medical_token BEFORE INSERT OR UPDATE ON public.medical_records
FOR EACH ROW EXECUTE FUNCTION public.ensure_medical_token();

UPDATE public.medical_records SET public_token = encode(extensions.gen_random_bytes(24), 'hex')
WHERE public_token IS NULL OR length(public_token) < 32;

CREATE OR REPLACE FUNCTION public.get_medical_record_by_token(_token text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _record public.medical_records;
BEGIN
  IF _token IS NULL OR length(_token) < 32 THEN RETURN NULL; END IF;
  SELECT * INTO _record FROM public.medical_records
  WHERE public_token = _token AND is_public = true LIMIT 1;
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