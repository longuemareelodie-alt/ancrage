CREATE TABLE public.pulse_action_durations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  source text NOT NULL,
  domain text,
  length_bucket smallint NOT NULL DEFAULT 1,
  minutes numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pulse_action_durations TO authenticated;
GRANT ALL ON public.pulse_action_durations TO service_role;
ALTER TABLE public.pulse_action_durations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pulse durations" ON public.pulse_action_durations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX pulse_action_durations_user_idx ON public.pulse_action_durations (user_id, created_at DESC);

ALTER TABLE public.todo_items ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.family_medical_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.family_medical_profiles(id) ON DELETE SET NULL;