-- Daily quick mood responses ("Je suis plutôt…")
CREATE TABLE public.mood_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  response_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'UTC')::date),
  mood text NOT NULL,
  adjust integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, response_date)
);

-- Validate mood value (use trigger, not CHECK, per guidelines flexibility)
CREATE OR REPLACE FUNCTION public.validate_mood_response()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.mood NOT IN ('calm','ok','tense','overflow') THEN
    RAISE EXCEPTION 'Invalid mood value: %', NEW.mood;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER mood_responses_validate
BEFORE INSERT OR UPDATE ON public.mood_responses
FOR EACH ROW EXECUTE FUNCTION public.validate_mood_response();

CREATE TRIGGER mood_responses_set_updated_at
BEFORE UPDATE ON public.mood_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mood_responses_user_date ON public.mood_responses (user_id, response_date DESC);

ALTER TABLE public.mood_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mood responses"
ON public.mood_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mood responses"
ON public.mood_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mood responses"
ON public.mood_responses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own mood responses"
ON public.mood_responses FOR DELETE
USING (auth.uid() = user_id);