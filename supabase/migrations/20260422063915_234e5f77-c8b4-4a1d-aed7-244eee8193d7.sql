-- Appointments
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  appointment_at timestamptz NOT NULL,
  location text DEFAULT '',
  notes text DEFAULT '',
  reminder_24h_sent boolean NOT NULL DEFAULT false,
  reminder_1h_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_user ON public.appointments(user_id, appointment_at);
CREATE INDEX idx_appointments_reminder ON public.appointments(appointment_at) WHERE reminder_24h_sent = false OR reminder_1h_sent = false;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own appointments" ON public.appointments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medications
CREATE TABLE public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  dosage text DEFAULT '',
  frequency text DEFAULT '',
  schedule_times text[] NOT NULL DEFAULT '{}',
  start_date date,
  end_date date,
  notes text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_medications_user ON public.medications(user_id);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Medication reminder log (avoid duplicate sends per day per time slot)
CREATE TABLE public.medication_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reminder_date date NOT NULL,
  reminder_time text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (medication_id, reminder_date, reminder_time)
);
CREATE INDEX idx_med_reminder_log_user ON public.medication_reminder_log(user_id, reminder_date);
ALTER TABLE public.medication_reminder_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own med reminder log" ON public.medication_reminder_log FOR SELECT USING (auth.uid() = user_id);

-- Medical records (one per user)
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  public_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  birth_date date,
  blood_type text DEFAULT '',
  allergies text DEFAULT '',
  current_treatments text DEFAULT '',
  doctor_name text DEFAULT '',
  doctor_phone text DEFAULT '',
  emergency_contact_name text DEFAULT '',
  emergency_contact_phone text DEFAULT '',
  medical_history text DEFAULT '',
  social_security_number text DEFAULT '',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_medical_records_token ON public.medical_records(public_token) WHERE is_public = true;

ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own medical record" ON public.medical_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own medical record" ON public.medical_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own medical record" ON public.medical_records FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own medical record" ON public.medical_records FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public access to medical record via token (no auth required)
CREATE OR REPLACE FUNCTION public.get_medical_record_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _record public.medical_records;
BEGIN
  SELECT * INTO _record FROM public.medical_records
  WHERE public_token = _token AND is_public = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'first_name', _record.first_name,
    'last_name', _record.last_name,
    'birth_date', _record.birth_date,
    'blood_type', _record.blood_type,
    'allergies', _record.allergies,
    'current_treatments', _record.current_treatments,
    'doctor_name', _record.doctor_name,
    'doctor_phone', _record.doctor_phone,
    'emergency_contact_name', _record.emergency_contact_name,
    'emergency_contact_phone', _record.emergency_contact_phone,
    'medical_history', _record.medical_history,
    'updated_at', _record.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_medical_record_by_token(text) TO anon, authenticated;

-- Regenerate public token
CREATE OR REPLACE FUNCTION public.regenerate_medical_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_token text := encode(gen_random_bytes(24), 'hex');
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.medical_records
  SET public_token = _new_token
  WHERE user_id = auth.uid();

  RETURN _new_token;
END;
$$;