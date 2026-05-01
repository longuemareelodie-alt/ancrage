-- Idempotency lock for premium activations.
-- A successful Mollie payment (status='paid') must be activated AT MOST ONCE
-- per payment_id, even if Mollie retries the webhook concurrently.
-- We enforce this at the database level so no application-side race can ever
-- create two paid activations for the same payment.
CREATE UNIQUE INDEX IF NOT EXISTS premium_activation_log_paid_payment_id_key
  ON public.premium_activation_log (payment_id)
  WHERE status = 'paid' AND payment_id IS NOT NULL;