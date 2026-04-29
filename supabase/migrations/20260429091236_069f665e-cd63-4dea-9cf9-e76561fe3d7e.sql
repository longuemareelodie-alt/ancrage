-- Fonction pour journaliser une anomalie d'audit avec déduplication temporelle
-- Empêche le spam : un même (kind + payment_id|user_id) ne sera pas re-loggé
-- avant la fin de la fenêtre _window_minutes (par défaut 60 min).
CREATE OR REPLACE FUNCTION public.log_audit_anomaly(
  _kind text,
  _target_user_id uuid,
  _payment_id text,
  _payload jsonb,
  _window_minutes integer DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id uuid := auth.uid();
  _ticket_id text;
  _existing_id uuid;
  _existing_ticket text;
  _existing_at timestamptz;
  _dedup_key text;
BEGIN
  -- Seuls les admins peuvent appeler
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _kind NOT IN ('paid_no_premium', 'premium_no_log', 'already_active') THEN
    RAISE EXCEPTION 'Invalid anomaly kind: %', _kind;
  END IF;

  -- Clé de dédup : payment_id si présent, sinon target_user_id, sinon kind seul
  _dedup_key := COALESCE(_payment_id, _target_user_id::text, _kind);

  -- Cherche un log similaire récent pour CETTE anomalie (même kind + même clé)
  SELECT id, ticket_id, created_at
    INTO _existing_id, _existing_ticket, _existing_at
  FROM public.support_logs
  WHERE source = 'admin_audit:' || _kind
    AND error_code = _kind
    AND created_at > now() - make_interval(mins => GREATEST(1, _window_minutes))
    AND (
      (_payment_id IS NOT NULL AND metadata->>'payment_id' = _payment_id)
      OR (_payment_id IS NULL AND _target_user_id IS NOT NULL
          AND metadata->>'target_user_id' = _target_user_id::text)
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'inserted', false,
      'reason', 'rate_limited',
      'existing_id', _existing_id,
      'existing_ticket', _existing_ticket,
      'existing_at', _existing_at,
      'window_minutes', _window_minutes,
      'dedup_key', _dedup_key
    );
  END IF;

  -- Génère un nouveau ticket et insère
  _ticket_id := 'AUDIT-' || upper(substr(_kind, 1, 3)) || '-'
                || upper(substr(COALESCE(_target_user_id::text, 'anon'), 1, 6))
                || '-' || upper(substr(md5(random()::text), 1, 4));

  INSERT INTO public.support_logs (
    user_id, source, ticket_id, error_code, error_message,
    last_state, url, user_agent, metadata
  ) VALUES (
    _admin_id,
    'admin_audit:' || _kind,
    _ticket_id,
    _kind,
    'Premium audit anomaly: ' || _kind,
    left(_payload::text, 500),
    _payload->>'url',
    _payload->>'user_agent',
    jsonb_build_object(
      'kind', _kind,
      'ticket_id', _ticket_id,
      'target_user_id', _target_user_id,
      'payment_id', _payment_id,
      'dedup_key', _dedup_key,
      'window_minutes', _window_minutes,
      'snapshot', _payload,
      'logged_by_admin', _admin_id,
      'logged_at', now()
    )
  );

  RETURN jsonb_build_object(
    'inserted', true,
    'ticket_id', _ticket_id,
    'dedup_key', _dedup_key,
    'window_minutes', _window_minutes
  );
END;
$$;

-- Index pour accélérer la recherche de dédup
CREATE INDEX IF NOT EXISTS idx_support_logs_audit_dedup
  ON public.support_logs (source, error_code, created_at DESC)
  WHERE source LIKE 'admin_audit:%';