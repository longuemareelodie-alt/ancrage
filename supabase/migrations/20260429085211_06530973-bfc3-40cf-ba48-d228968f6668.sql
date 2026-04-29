CREATE TABLE public.support_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  ticket_id text NOT NULL,
  source text NOT NULL DEFAULT 'payment_pending',
  error_code text,
  error_message text,
  last_state text,
  attempts integer,
  url text,
  user_agent text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_logs_user_id ON public.support_logs(user_id);
CREATE INDEX idx_support_logs_created_at ON public.support_logs(created_at DESC);
CREATE INDEX idx_support_logs_ticket_id ON public.support_logs(ticket_id);

ALTER TABLE public.support_logs ENABLE ROW LEVEL SECURITY;

-- Users can insert their own logs (user_id must match or be null for anonymous fallback)
CREATE POLICY "Users insert own support logs"
ON public.support_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can read their own logs
CREATE POLICY "Users view own support logs"
ON public.support_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all logs
CREATE POLICY "Admins view all support logs"
ON public.support_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- No client updates / deletes
CREATE POLICY "No client updates on support_logs"
ON public.support_logs
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "No client deletes on support_logs"
ON public.support_logs
FOR DELETE
TO authenticated
USING (false);