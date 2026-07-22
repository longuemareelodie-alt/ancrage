CREATE TABLE public.family_medical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  event_type text NOT NULL DEFAULT 'consultation',
  title text NOT NULL,
  practitioner text,
  location text,
  description text,
  document_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_medical_events TO authenticated;
GRANT ALL ON public.family_medical_events TO service_role;

ALTER TABLE public.family_medical_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own family medical events"
ON public.family_medical_events FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_fme_profile_date ON public.family_medical_events(profile_id, event_date DESC);
CREATE INDEX idx_fme_user ON public.family_medical_events(user_id);

CREATE TRIGGER update_family_medical_events_updated_at
BEFORE UPDATE ON public.family_medical_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();