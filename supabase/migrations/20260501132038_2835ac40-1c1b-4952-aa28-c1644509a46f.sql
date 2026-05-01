-- Fallback queue for account-activation emails (welcome-initiation with action_link)
-- when the initial send from the Mollie webhook fails or returns no actionLink.
CREATE TABLE public.pending_account_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  payment_id text NOT NULL,
  user_id uuid,
  template_name text NOT NULL DEFAULT 'welcome-initiation',
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 6,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pending_account_emails_status_chk
    CHECK (status IN ('pending', 'sent', 'failed'))
);

-- One pending row per (payment_id, template_name) — webhook can safely upsert.
CREATE UNIQUE INDEX pending_account_emails_payment_template_uniq
  ON public.pending_account_emails (payment_id, template_name);

-- Hot path for the cron worker
CREATE INDEX pending_account_emails_due_idx
  ON public.pending_account_emails (status, next_attempt_at)
  WHERE status = 'pending';

-- Auto-touch updated_at
CREATE TRIGGER pending_account_emails_set_updated_at
  BEFORE UPDATE ON public.pending_account_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lock down: no client/anon access. Only service_role (via Edge Functions)
-- can touch this table. RLS enabled with NO policies → effectively private.
ALTER TABLE public.pending_account_emails ENABLE ROW LEVEL SECURITY;