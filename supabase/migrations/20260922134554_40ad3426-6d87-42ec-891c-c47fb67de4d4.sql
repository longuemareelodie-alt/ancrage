CREATE TABLE public.pulse_action_skips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_key text NOT NULL,
  source text NOT NULL,
  domain text,
  length_bucket smallint NOT NULL DEFAULT 0,
  brain_state text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.pulse_action_skips TO authenticated;
GRANT ALL ON public.pulse_action_skips TO service_role;

ALTER TABLE public.pulse_action_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own pulse skips" ON public.pulse_action_skips
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX pulse_action_skips_user_day_idx ON public.pulse_action_skips (user_id, created_at DESC);