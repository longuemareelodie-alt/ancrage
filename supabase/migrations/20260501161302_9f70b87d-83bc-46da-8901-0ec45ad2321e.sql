-- Active RLS si pas déjà actif (idempotent)
ALTER TABLE public.pending_account_emails ENABLE ROW LEVEL SECURITY;

-- Service role : accès complet (nécessaire pour le webhook + cron worker)
DROP POLICY IF EXISTS "Service role manages pending_account_emails"
  ON public.pending_account_emails;
CREATE POLICY "Service role manages pending_account_emails"
  ON public.pending_account_emails
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admins : peuvent lire toute la file pour le tableau de bord
DROP POLICY IF EXISTS "Admins view pending_account_emails"
  ON public.pending_account_emails;
CREATE POLICY "Admins view pending_account_emails"
  ON public.pending_account_emails
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins : peuvent reset/cancel manuellement (status, attempts, next_attempt_at)
-- L'UPDATE complet est autorisé ; la edge function `retry-account-email-now`
-- limite les champs réellement modifiables côté serveur via la logique métier.
DROP POLICY IF EXISTS "Admins update pending_account_emails"
  ON public.pending_account_emails;
CREATE POLICY "Admins update pending_account_emails"
  ON public.pending_account_emails
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Aucune policy INSERT/DELETE pour authenticated : seul le service role
-- peut insérer (depuis le webhook Mollie) ou supprimer.
