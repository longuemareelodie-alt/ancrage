-- Audit log for is_premium activations / payment events
CREATE TABLE public.premium_activation_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  payment_id text,
  status text NOT NULL,
  amount integer,
  source text NOT NULL DEFAULT 'mollie-webhook',
  message text,
  raw jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_premium_activation_log_user_id ON public.premium_activation_log(user_id);
CREATE INDEX idx_premium_activation_log_payment_id ON public.premium_activation_log(payment_id);
CREATE INDEX idx_premium_activation_log_created_at ON public.premium_activation_log(created_at DESC);
CREATE INDEX idx_premium_activation_log_status ON public.premium_activation_log(status);

ALTER TABLE public.premium_activation_log ENABLE ROW LEVEL SECURITY;

-- Lock down: clients cannot read, insert, update, or delete.
-- Only the service role (used by edge functions with the service key) can.
CREATE POLICY "No client select on premium_activation_log"
  ON public.premium_activation_log FOR SELECT TO authenticated
  USING (false);

CREATE POLICY "No client insert on premium_activation_log"
  ON public.premium_activation_log FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client update on premium_activation_log"
  ON public.premium_activation_log FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No client delete on premium_activation_log"
  ON public.premium_activation_log FOR DELETE TO authenticated
  USING (false);

CREATE POLICY "Service role can read premium_activation_log"
  ON public.premium_activation_log FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert premium_activation_log"
  ON public.premium_activation_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');