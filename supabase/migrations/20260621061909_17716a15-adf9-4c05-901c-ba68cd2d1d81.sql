
-- Policy storage : service_role seul
DROP POLICY IF EXISTS "sepa_service_role_all" ON storage.objects;
CREATE POLICY "sepa_service_role_all" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'sepa-batches')
  WITH CHECK (bucket_id = 'sepa-batches');

-- Colonnes additionnelles
ALTER TABLE public.ambassador_payouts
  ADD COLUMN IF NOT EXISTS sepa_xml_path text,
  ADD COLUMN IF NOT EXISTS iban_last4 text,
  ADD COLUMN IF NOT EXISTS holder_name text;

-- RPC : enregistrer son IBAN
CREATE OR REPLACE FUNCTION public.set_my_iban(_iban text, _holder_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _clean text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _iban IS NULL OR length(trim(_iban)) = 0 THEN
    RAISE EXCEPTION 'IBAN required';
  END IF;
  IF _holder_name IS NULL OR length(trim(_holder_name)) < 2 THEN
    RAISE EXCEPTION 'Holder name required';
  END IF;
  _clean := upper(regexp_replace(_iban, '\s', '', 'g'));
  IF _clean !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' THEN
    RAISE EXCEPTION 'Invalid IBAN format';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.ambassador_profiles WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'Not an ambassador';
  END IF;

  UPDATE public.ambassador_profiles
  SET iban_encrypted = _clean,
      iban_holder_name = trim(_holder_name),
      updated_at = now()
  WHERE user_id = _user_id;

  RETURN jsonb_build_object('success', true, 'iban_last4', right(_clean, 4));
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_my_iban(text, text) TO authenticated;

-- RPC admin : liste batchs
CREATE OR REPLACE FUNCTION public.list_payout_batches_admin()
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  SELECT COALESCE(jsonb_agg(t ORDER BY t.created_at DESC), '[]'::jsonb) INTO _result
  FROM (
    SELECT sepa_batch_id,
      COUNT(*) AS payout_count,
      SUM(amount_cents) AS total_cents,
      MIN(status) AS status_min, MAX(status) AS status_max,
      MAX(sepa_xml_path) AS sepa_xml_path,
      MAX(scheduled_for) AS scheduled_for,
      MAX(created_at) AS created_at,
      MAX(paid_at) AS paid_at
    FROM public.ambassador_payouts
    WHERE sepa_batch_id IS NOT NULL
    GROUP BY sepa_batch_id
  ) t;
  RETURN _result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_payout_batches_admin() TO authenticated;

-- RPC admin : détail d'un batch
CREATE OR REPLACE FUNCTION public.get_payout_batch_admin(_batch_id text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _result
  FROM (
    SELECT pa.id, pa.ambassador_user_id, p.email, ap.iban_holder_name,
           pa.iban_last4, pa.amount_cents, pa.referral_count, pa.status,
           pa.paid_at, pa.failure_reason
    FROM public.ambassador_payouts pa
    LEFT JOIN public.profiles p ON p.user_id = pa.ambassador_user_id
    LEFT JOIN public.ambassador_profiles ap ON ap.user_id = pa.ambassador_user_id
    WHERE pa.sepa_batch_id = _batch_id
    ORDER BY pa.amount_cents DESC
  ) t;
  RETURN _result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_payout_batch_admin(text) TO authenticated;

-- RPC admin : marquer batch payé
CREATE OR REPLACE FUNCTION public.mark_payout_batch_paid_admin(_batch_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _payouts_updated integer; _referrals_updated integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;

  WITH upd AS (
    UPDATE public.ambassador_payouts
    SET status = 'paid', paid_at = now(), updated_at = now()
    WHERE sepa_batch_id = _batch_id AND status IN ('pending_upload', 'uploaded')
    RETURNING id
  ) SELECT count(*) INTO _payouts_updated FROM upd;

  WITH upd2 AS (
    UPDATE public.ambassador_referrals
    SET status = 'paid', paid_at = now(), updated_at = now()
    WHERE payout_id IN (SELECT id FROM public.ambassador_payouts WHERE sepa_batch_id = _batch_id)
      AND status = 'validated'
    RETURNING id
  ) SELECT count(*) INTO _referrals_updated FROM upd2;

  RETURN jsonb_build_object('success', true,
    'payouts_updated', _payouts_updated,
    'referrals_updated', _referrals_updated);
END;
$$;
GRANT EXECUTE ON FUNCTION public.mark_payout_batch_paid_admin(text) TO authenticated;

-- RPC : destinataires d'un batch (admin + service_role)
CREATE OR REPLACE FUNCTION public.get_batch_recipients_admin(_batch_id text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND
     current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _result
  FROM (
    SELECT pa.ambassador_user_id, p.email, p.first_name,
           pa.amount_cents, pa.iban_last4
    FROM public.ambassador_payouts pa
    LEFT JOIN public.profiles p ON p.user_id = pa.ambassador_user_id
    WHERE pa.sepa_batch_id = _batch_id AND pa.status = 'paid'
  ) t;
  RETURN _result;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_batch_recipients_admin(text) TO authenticated;
