-- États PULSE par enfant : un état par enfant et par jour.
CREATE TABLE public.pulse_child_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  state text NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, profile_id, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pulse_child_states TO authenticated;
GRANT ALL ON public.pulse_child_states TO service_role;

ALTER TABLE public.pulse_child_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own child pulse states"
ON public.pulse_child_states FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX pulse_child_states_profile_day_idx
ON public.pulse_child_states (profile_id, day DESC);

CREATE TRIGGER update_pulse_child_states_updated_at
BEFORE UPDATE ON public.pulse_child_states
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notes par enfant.
CREATE TABLE public.child_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL DEFAULT '',
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_notes TO authenticated;
GRANT ALL ON public.child_notes TO service_role;

ALTER TABLE public.child_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own child notes"
ON public.child_notes FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX child_notes_profile_idx
ON public.child_notes (profile_id, pinned DESC, updated_at DESC);

CREATE TRIGGER update_child_notes_updated_at
BEFORE UPDATE ON public.child_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();