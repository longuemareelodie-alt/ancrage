
CREATE TABLE IF NOT EXISTS public.family_vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_given date,
  next_due_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_vaccinations TO authenticated;
GRANT ALL ON public.family_vaccinations TO service_role;

ALTER TABLE public.family_vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own family vaccinations"
  ON public.family_vaccinations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_family_vaccinations_user ON public.family_vaccinations(user_id, profile_id);
CREATE INDEX IF NOT EXISTS idx_family_vaccinations_next_due ON public.family_vaccinations(user_id, next_due_date) WHERE next_due_date IS NOT NULL;

CREATE TRIGGER trg_update_family_vaccinations_updated_at
  BEFORE UPDATE ON public.family_vaccinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
