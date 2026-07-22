
CREATE TABLE public.quiz_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('result_view','pdf_download','cta_click')),
  score integer,
  max_score integer,
  verdict_badge text,
  first_name text,
  session_id text,
  user_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX quiz_events_type_created_idx ON public.quiz_events (event_type, created_at DESC);
CREATE INDEX quiz_events_session_idx ON public.quiz_events (session_id);

GRANT INSERT ON public.quiz_events TO anon, authenticated;
GRANT SELECT ON public.quiz_events TO authenticated;
GRANT ALL ON public.quiz_events TO service_role;

ALTER TABLE public.quiz_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz events"
  ON public.quiz_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read quiz events"
  ON public.quiz_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
