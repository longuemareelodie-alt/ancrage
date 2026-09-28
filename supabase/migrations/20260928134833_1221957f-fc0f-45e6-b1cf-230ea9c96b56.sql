ALTER TABLE public.medical_records
  ADD COLUMN IF NOT EXISTS shared_fields text[] NOT NULL DEFAULT ARRAY['first_name','last_name','blood_type','allergies','current_treatments','medical_history','emergency_notes','emergency_contact']::text[],
  ADD COLUMN IF NOT EXISTS emergency_notes text;

CREATE TABLE public.medical_record_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid REFERENCES public.medical_records(id) ON DELETE CASCADE,
  event text NOT NULL,
  ip_hash text,
  accessed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.medical_record_access_log (record_id, accessed_at DESC);
CREATE INDEX ON public.medical_record_access_log (ip_hash, accessed_at DESC);
GRANT SELECT ON public.medical_record_access_log TO authenticated;
GRANT ALL ON public.medical_record_access_log TO service_role;
ALTER TABLE public.medical_record_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads own emergency access log" ON public.medical_record_access_log
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.medical_records m WHERE m.id = record_id AND m.user_id = auth.uid()));

DROP FUNCTION IF EXISTS public.get_medical_record_by_token(text, text);

CREATE OR REPLACE FUNCTION public.get_emergency_sheet(_token text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.medical_records; f text[]; _ip text; _hash text; _n int; out jsonb;
BEGIN
  BEGIN
    _ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  EXCEPTION WHEN others THEN _ip := ''; END;
  _hash := encode(extensions.digest('eclosia-sos:' || coalesce(_ip,''), 'sha256'), 'hex');

  SELECT count(*) INTO _n FROM public.medical_record_access_log
   WHERE ip_hash = _hash AND accessed_at > now() - interval '10 minutes';
  IF _n >= 30 THEN
    RETURN jsonb_build_object('status','rate_limited');
  END IF;

  IF _token IS NULL OR length(_token) < 32 OR _token !~ '^[a-f0-9]+$' THEN
    INSERT INTO public.medical_record_access_log(record_id, event, ip_hash) VALUES (NULL, 'invalid', _hash);
    RETURN jsonb_build_object('status','invalid');
  END IF;

  SELECT * INTO r FROM public.medical_records WHERE public_token = _token LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO public.medical_record_access_log(record_id, event, ip_hash) VALUES (NULL, 'invalid', _hash);
    RETURN jsonb_build_object('status','invalid');
  END IF;
  IF NOT r.is_public THEN
    INSERT INTO public.medical_record_access_log(record_id, event, ip_hash) VALUES (r.id, 'disabled', _hash);
    RETURN jsonb_build_object('status','disabled');
  END IF;

  f := r.shared_fields;
  out := jsonb_build_object('status','ok','updated_at', r.updated_at);
  IF 'first_name' = ANY(f) THEN out := out || jsonb_build_object('first_name', r.first_name); END IF;
  IF 'last_name' = ANY(f) THEN out := out || jsonb_build_object('last_name', r.last_name); END IF;
  IF 'birth_date' = ANY(f) THEN out := out || jsonb_build_object('birth_date', r.birth_date); END IF;
  IF 'blood_type' = ANY(f) THEN out := out || jsonb_build_object('blood_type', r.blood_type); END IF;
  IF 'allergies' = ANY(f) THEN out := out || jsonb_build_object('allergies', r.allergies); END IF;
  IF 'current_treatments' = ANY(f) THEN out := out || jsonb_build_object('current_treatments', r.current_treatments); END IF;
  IF 'medical_history' = ANY(f) THEN out := out || jsonb_build_object('medical_history', r.medical_history); END IF;
  IF 'emergency_notes' = ANY(f) THEN out := out || jsonb_build_object('emergency_notes', r.emergency_notes); END IF;
  IF 'emergency_contact' = ANY(f) THEN out := out || jsonb_build_object('emergency_contact_name', r.emergency_contact_name, 'emergency_contact_phone', r.emergency_contact_phone); END IF;
  IF 'doctor' = ANY(f) THEN out := out || jsonb_build_object('doctor_name', r.doctor_name, 'doctor_phone', r.doctor_phone); END IF;

  INSERT INTO public.medical_record_access_log(record_id, event, ip_hash) VALUES (r.id, 'view', _hash);
  RETURN out;
END; $$;

REVOKE ALL ON FUNCTION public.get_emergency_sheet(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_emergency_sheet(text) TO anon, authenticated;