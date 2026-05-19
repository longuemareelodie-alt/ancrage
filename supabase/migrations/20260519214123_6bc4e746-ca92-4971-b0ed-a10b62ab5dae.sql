
-- Family medical profiles
CREATE TABLE public.family_medical_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  first_name text NOT NULL DEFAULT '',
  relation text NOT NULL DEFAULT '',
  birth_date date,
  blood_type text NOT NULL DEFAULT '',
  allergies text NOT NULL DEFAULT '',
  diagnoses text NOT NULL DEFAULT '',
  current_treatments text NOT NULL DEFAULT '',
  medical_history text NOT NULL DEFAULT '',
  doctor_name text NOT NULL DEFAULT '',
  doctor_phone text NOT NULL DEFAULT '',
  emergency_contact_name text NOT NULL DEFAULT '',
  emergency_contact_phone text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.family_medical_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own family profiles"
ON public.family_medical_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own family profiles"
ON public.family_medical_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own family profiles"
ON public.family_medical_profiles FOR UPDATE
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own family profiles"
ON public.family_medical_profiles FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_family_profiles_user ON public.family_medical_profiles(user_id);

CREATE TRIGGER update_family_medical_profiles_updated_at
BEFORE UPDATE ON public.family_medical_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Documents attached
CREATE TABLE public.family_medical_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL DEFAULT '',
  size_bytes integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'autre',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.family_medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own family docs"
ON public.family_medical_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own family docs"
ON public.family_medical_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own family docs"
ON public.family_medical_documents FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_family_docs_profile ON public.family_medical_documents(profile_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-medical-docs', 'family-medical-docs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users view own family medical docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'family-medical-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own family medical docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'family-medical-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own family medical docs"
ON storage.objects FOR DELETE
USING (bucket_id = 'family-medical-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
