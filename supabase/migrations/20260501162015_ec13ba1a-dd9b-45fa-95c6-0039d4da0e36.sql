-- Fonction de nettoyage des pending_account_emails envoyés depuis > 90 jours
-- Les échecs (failed) et lignes en attente sont conservés indéfiniment pour analyse
CREATE OR REPLACE FUNCTION public.cleanup_pending_account_emails()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _deleted_sent integer := 0;
BEGIN
  WITH del AS (
    DELETE FROM public.pending_account_emails
    WHERE status = 'sent'
      AND COALESCE(sent_at, updated_at) < now() - interval '90 days'
    RETURNING 1
  )
  SELECT count(*) INTO _deleted_sent FROM del;

  RETURN jsonb_build_object(
    'deleted_sent', _deleted_sent,
    'ran_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_pending_account_emails() FROM PUBLIC, anon, authenticated;