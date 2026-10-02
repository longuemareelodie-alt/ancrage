ALTER TABLE public.family_medical_profiles
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS communication_modes text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS question_prefs text[] NOT NULL DEFAULT '{une-a-la-fois}',
  ADD COLUMN IF NOT EXISTS answer_prefs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS picto_mode text NOT NULL DEFAULT 'parfois',
  ADD COLUMN IF NOT EXISTS picto_show_text boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_choices integer;

ALTER TABLE public.child_contacts ADD COLUMN IF NOT EXISTS is_trusted boolean NOT NULL DEFAULT false;

CREATE TABLE public.child_situations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  template_key text,
  title text NOT NULL,
  context text,
  place text,
  occurred_on date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'ouverte',
  last_observed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_situations TO authenticated;
GRANT ALL ON public.child_situations TO service_role;
ALTER TABLE public.child_situations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages situations" ON public.child_situations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.family_medical_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
CREATE INDEX child_situations_profile_idx ON public.child_situations(profile_id, last_observed_at DESC);
CREATE TRIGGER child_situations_updated BEFORE UPDATE ON public.child_situations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.child_situation_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  situation_id uuid NOT NULL REFERENCES public.child_situations(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  emotions text[] NOT NULL DEFAULT '{}',
  child_words text,
  parent_note text,
  interpretation text,
  helped text,
  not_helped text,
  action_taken text,
  trusted_adult_id uuid REFERENCES public.child_contacts(id) ON DELETE SET NULL,
  felt_unsafe boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_situation_observations TO authenticated;
GRANT ALL ON public.child_situation_observations TO service_role;
ALTER TABLE public.child_situation_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages observations" ON public.child_situation_observations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.child_situations s WHERE s.id = situation_id AND s.user_id = auth.uid() AND s.profile_id = profile_id));
CREATE INDEX child_obs_situation_idx ON public.child_situation_observations(situation_id, created_at);