ALTER TABLE public.family_medical_profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS diagnosis_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sensitivities text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS soothers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences text NOT NULL DEFAULT '';

CREATE TABLE public.child_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'autre',
  phone text,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_contacts TO authenticated;
GRANT ALL ON public.child_contacts TO service_role;
ALTER TABLE public.child_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own child contacts" ON public.child_contacts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER child_contacts_updated_at BEFORE UPDATE ON public.child_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX child_contacts_profile_idx ON public.child_contacts(profile_id);

CREATE TABLE public.autonomy_supports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid REFERENCES public.family_medical_profiles(id) ON DELETE SET NULL,
  support_type text NOT NULL,
  title text NOT NULL,
  description text,
  content jsonb NOT NULL DEFAULT '{"items": []}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.autonomy_supports TO authenticated;
GRANT ALL ON public.autonomy_supports TO service_role;
ALTER TABLE public.autonomy_supports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own autonomy supports" ON public.autonomy_supports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER autonomy_supports_updated_at BEFORE UPDATE ON public.autonomy_supports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX autonomy_supports_user_idx ON public.autonomy_supports(user_id, updated_at DESC);

CREATE TABLE public.personal_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'objectif',
  done boolean NOT NULL DEFAULT false,
  achieved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_goals TO authenticated;
GRANT ALL ON public.personal_goals TO service_role;
ALTER TABLE public.personal_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own goals" ON public.personal_goals
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER personal_goals_updated_at BEFORE UPDATE ON public.personal_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();