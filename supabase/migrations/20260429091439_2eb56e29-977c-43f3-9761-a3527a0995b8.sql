-- 1. Table des anomalies consolidées
CREATE TABLE IF NOT EXISTS public.webhook_anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('paid_no_premium', 'premium_no_log', 'already_active', 'webhook_failure', 'other')),
  severity text NOT NULL DEFAULT 'critical' CHECK (severity IN ('critical', 'warning', 'info')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'ignored')),
  target_user_id uuid,
  payment_id text,
  message text,
  snapshot jsonb,
  ticket_id text,
  occurrences integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_anomalies_status ON public.webhook_anomalies (status, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_anomalies_kind ON public.webhook_anomalies (kind, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_anomalies_dedup ON public.webhook_anomalies (kind, payment_id, target_user_id);

-- 2. RLS
ALTER TABLE public.webhook_anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view anomalies"
  ON public.webhook_anomalies FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update anomalies"
  ON public.webhook_anomalies FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No client inserts on webhook_anomalies"
  ON public.webhook_anomalies FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No client deletes on webhook_anomalies"
  ON public.webhook_anomalies FOR DELETE
  TO authenticated
  USING (false);

CREATE POLICY "Service role manages anomalies"
  ON public.webhook_anomalies FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Trigger updated_at
CREATE TRIGGER set_webhook_anomalies_updated_at
  BEFORE UPDATE ON public.webhook_anomalies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Fonction pour résoudre / changer le statut d'une anomalie (admin)
CREATE OR REPLACE FUNCTION public.resolve_webhook_anomaly(
  _anomaly_id uuid,
  _new_status text,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _new_status NOT IN ('open', 'investigating', 'resolved', 'ignored') THEN
    RAISE EXCEPTION 'Invalid status: %', _new_status;
  END IF;

  UPDATE public.webhook_anomalies
  SET status = _new_status,
      resolution_note = COALESCE(_note, resolution_note),
      resolved_at = CASE WHEN _new_status IN ('resolved', 'ignored') THEN now() ELSE NULL END,
      resolved_by = CASE WHEN _new_status IN ('resolved', 'ignored') THEN _admin_id ELSE NULL END
  WHERE id = _anomaly_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Anomaly not found';
  END IF;

  RETURN jsonb_build_object('success', true, 'id', _anomaly_id, 'status', _new_status);
END;
$$;

-- 4. Mise à jour de log_audit_anomaly pour upsert dans webhook_anomalies
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
  _anomaly_id uuid;
  _severity text;
BEGIN
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF _kind NOT IN ('paid_no_premium', 'premium_no_log', 'already_active') THEN
    RAISE EXCEPTION 'Invalid anomaly kind: %', _kind;
  END IF;

  _dedup_key := COALESCE(_payment_id, _target_user_id::text, _kind);
  _severity := CASE WHEN _kind = 'already_active' THEN 'info' ELSE 'critical' END;

  -- Anti-spam : log support déjà émis dans la fenêtre ?
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
    -- Bump occurrences sur l'anomalie ouverte correspondante (sans rouvrir si résolue)
    UPDATE public.webhook_anomalies
    SET occurrences = occurrences + 1,
        last_seen_at = now()
    WHERE kind = _kind
      AND status IN ('open', 'investigating')
      AND (
        (_payment_id IS NOT NULL AND payment_id = _payment_id)
        OR (_payment_id IS NULL AND target_user_id = _target_user_id)
      );

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

  -- Génère ticket
  _ticket_id := 'AUDIT-' || upper(substr(_kind, 1, 3)) || '-'
                || upper(substr(COALESCE(_target_user_id::text, 'anon'), 1, 6))
                || '-' || upper(substr(md5(random()::text), 1, 4));

  -- Insert support_logs
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

  -- Upsert dans webhook_anomalies : si une entrée open/investigating existe pour ce kind+key, bump
  SELECT id INTO _anomaly_id
  FROM public.webhook_anomalies
  WHERE kind = _kind
    AND status IN ('open', 'investigating')
    AND (
      (_payment_id IS NOT NULL AND payment_id = _payment_id)
      OR (_payment_id IS NULL AND target_user_id = _target_user_id)
    )
  ORDER BY last_seen_at DESC
  LIMIT 1;

  IF _anomaly_id IS NOT NULL THEN
    UPDATE public.webhook_anomalies
    SET occurrences = occurrences + 1,
        last_seen_at = now(),
        snapshot = _payload,
        ticket_id = _ticket_id
    WHERE id = _anomaly_id;
  ELSE
    INSERT INTO public.webhook_anomalies (
      kind, severity, status, target_user_id, payment_id, message, snapshot, ticket_id
    ) VALUES (
      _kind,
      _severity,
      'open',
      _target_user_id,
      _payment_id,
      'Premium audit anomaly: ' || _kind,
      _payload,
      _ticket_id
    )
    RETURNING id INTO _anomaly_id;
  END IF;

  RETURN jsonb_build_object(
    'inserted', true,
    'ticket_id', _ticket_id,
    'anomaly_id', _anomaly_id,
    'dedup_key', _dedup_key,
    'window_minutes', _window_minutes
  );
END;
$$;