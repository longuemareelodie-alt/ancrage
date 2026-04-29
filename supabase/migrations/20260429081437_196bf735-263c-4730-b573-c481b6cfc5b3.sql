CREATE OR REPLACE FUNCTION public.get_premium_audit()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _paid_no_premium jsonb;
  _premium_no_paid jsonb;
  _already_active jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- 1. Paid in log but profile NOT premium (or profile missing)
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _paid_no_premium
  FROM (
    SELECT DISTINCT ON (l.user_id)
      l.user_id,
      l.payment_id,
      l.amount,
      l.created_at AS paid_at,
      p.is_premium,
      p.email
    FROM public.premium_activation_log l
    LEFT JOIN public.profiles p ON p.user_id = l.user_id
    WHERE l.status = 'paid'
      AND (p.user_id IS NULL OR p.is_premium = false)
    ORDER BY l.user_id, l.created_at DESC
  ) t;

  -- 2. Profile premium but no 'paid' log entry
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _premium_no_paid
  FROM (
    SELECT
      p.user_id,
      p.email,
      p.plan_type,
      p.created_at AS profile_created_at,
      p.updated_at AS profile_updated_at
    FROM public.profiles p
    WHERE p.is_premium = true
      AND NOT EXISTS (
        SELECT 1 FROM public.premium_activation_log l
        WHERE l.user_id = p.user_id AND l.status = 'paid'
      )
    ORDER BY p.updated_at DESC
  ) t;

  -- 3. All already_active entries
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _already_active
  FROM (
    SELECT
      l.id,
      l.user_id,
      l.payment_id,
      l.amount,
      l.message,
      l.created_at,
      p.email
    FROM public.premium_activation_log l
    LEFT JOIN public.profiles p ON p.user_id = l.user_id
    WHERE l.status = 'already_active'
    ORDER BY l.created_at DESC
  ) t;

  RETURN jsonb_build_object(
    'paid_without_premium', _paid_no_premium,
    'premium_without_paid_log', _premium_no_paid,
    'already_active', _already_active,
    'generated_at', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_premium_audit() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_premium_audit() TO authenticated;