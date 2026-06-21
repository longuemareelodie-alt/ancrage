-- 1) Table d'acceptations du contrat d'affiliation
CREATE TABLE public.ambassador_contract_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_version text NOT NULL,
  full_name text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  contract_text_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ambassador_contract_acceptances TO authenticated;
GRANT ALL ON public.ambassador_contract_acceptances TO service_role;

ALTER TABLE public.ambassador_contract_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own contract acceptances"
ON public.ambassador_contract_acceptances FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own contract acceptances"
ON public.ambassador_contract_acceptances FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all contract acceptances"
ON public.ambassador_contract_acceptances FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_aca_user_accepted ON public.ambassador_contract_acceptances(user_id, accepted_at DESC);

-- 2) RPC : accepter le contrat + activer le profil ambassadrice
CREATE OR REPLACE FUNCTION public.accept_ambassador_contract(
  _full_name text,
  _contract_version text,
  _contract_hash text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _is_premium boolean;
  _code text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN
    RAISE EXCEPTION 'Full name required';
  END IF;
  IF _contract_version IS NULL OR length(trim(_contract_version)) = 0 THEN
    RAISE EXCEPTION 'Contract version required';
  END IF;

  SELECT is_premium INTO _is_premium FROM public.profiles WHERE user_id = _user_id;
  IF NOT COALESCE(_is_premium, false) THEN
    RAISE EXCEPTION 'User is not premium';
  END IF;

  INSERT INTO public.ambassador_contract_acceptances (
    user_id, contract_version, full_name, contract_text_hash, user_agent
  ) VALUES (
    _user_id, trim(_contract_version), trim(_full_name), _contract_hash, _user_agent
  );

  SELECT referral_code INTO _code FROM public.ambassador_profiles WHERE user_id = _user_id;
  IF _code IS NULL THEN
    INSERT INTO public.ambassador_profiles (user_id, referral_code)
    VALUES (_user_id, public.generate_referral_code())
    RETURNING referral_code INTO _code;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'referral_code', _code,
    'contract_version', trim(_contract_version)
  );
END;
$$;

-- 3) RPC : récupérer le statut du contrat
CREATE OR REPLACE FUNCTION public.get_my_contract_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _v text;
  _at timestamptz;
  _name text;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT contract_version, accepted_at, full_name
    INTO _v, _at, _name
  FROM public.ambassador_contract_acceptances
  WHERE user_id = _user_id
  ORDER BY accepted_at DESC
  LIMIT 1;

  IF _v IS NULL THEN
    RETURN jsonb_build_object('accepted', false);
  END IF;

  RETURN jsonb_build_object(
    'accepted', true,
    'version', _v,
    'accepted_at', _at,
    'full_name', _name
  );
END;
$$;

-- 4) Enrichir get_batch_recipients_admin avec le referral_code
CREATE OR REPLACE FUNCTION public.get_batch_recipients_admin(_batch_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND
     current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _result
  FROM (
    SELECT pa.ambassador_user_id,
           p.email,
           p.first_name,
           pa.amount_cents,
           pa.iban_last4,
           ap.referral_code,
           pa.created_at AS payout_created_at
    FROM public.ambassador_payouts pa
    LEFT JOIN public.profiles p ON p.user_id = pa.ambassador_user_id
    LEFT JOIN public.ambassador_profiles ap ON ap.user_id = pa.ambassador_user_id
    WHERE pa.sepa_batch_id = _batch_id AND pa.status = 'paid'
  ) t;
  RETURN _result;
END;
$$;