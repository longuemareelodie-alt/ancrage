CREATE TABLE IF NOT EXISTS public.webhook_alert_state (
  id text PRIMARY KEY,
  last_alert_at timestamptz NOT NULL DEFAULT now(),
  last_failure_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_alert_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages webhook_alert_state"
  ON public.webhook_alert_state FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_premium_activation_log_status_created
  ON public.premium_activation_log (status, created_at DESC);