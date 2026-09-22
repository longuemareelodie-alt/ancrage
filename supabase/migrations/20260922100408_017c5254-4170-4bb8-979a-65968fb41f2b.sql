CREATE TABLE public.pulse_daily_states (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  state text NOT NULL CHECK (state IN ('go','moyen','sature','ko')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pulse_daily_states TO authenticated;
GRANT ALL ON public.pulse_daily_states TO service_role;

ALTER TABLE public.pulse_daily_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own pulse states"
ON public.pulse_daily_states FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_pulse_daily_states_updated_at
BEFORE UPDATE ON public.pulse_daily_states
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.todo_items ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE public.agenda_events ADD COLUMN IF NOT EXISTS domain text;