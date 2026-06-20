
-- 1. AMBASSADOR PROFILES
CREATE TABLE public.ambassador_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  current_tier text NOT NULL DEFAULT 'graine' CHECK (current_tier IN ('graine','fleur','fondatrice')),
  validated_referrals_count integer NOT NULL DEFAULT 0,
  iban_encrypted text,
  iban_holder_name text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.ambassador_profiles TO authenticated;
GRANT ALL ON public.ambassador_profiles TO service_role;

ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadrices peuvent voir leur propre profil"
  ON public.ambassador_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Ambassadrices peuvent mettre à jour leur IBAN"
  ON public.ambassador_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin voit toutes les ambassadrices"
  ON public.ambassador_profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin peut tout modifier"
  ON public.ambassador_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ambassador_profiles_updated_at
  BEFORE UPDATE ON public.ambassador_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ambassador_profiles_referral_code ON public.ambassador_profiles(referral_code);

-- Protection : interdit le downgrade de tier ou la modif du code referral côté client
CREATE OR REPLACE FUNCTION public.protect_ambassador_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier_order jsonb := '{"graine":0,"fleur":1,"fondatrice":2}'::jsonb;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    -- Bloque modif des champs sensibles côté client
    NEW.referral_code := OLD.referral_code;
    NEW.current_tier := OLD.current_tier;
    NEW.validated_referrals_count := OLD.validated_referrals_count;
    NEW.joined_at := OLD.joined_at;
  ELSE
    -- Côté service_role : empêche tout retour en arrière de tier
    IF (_tier_order->>NEW.current_tier)::int < (_tier_order->>OLD.current_tier)::int THEN
      NEW.current_tier := OLD.current_tier;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_ambassador_profile_trigger
  BEFORE UPDATE ON public.ambassador_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_ambassador_profile();


-- 2. AMBASSADOR REFERRALS (les mamans recommandées + commissions)
CREATE TABLE public.ambassador_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code_used text NOT NULL,
  payment_id text NOT NULL UNIQUE,
  amount_paid_cents integer NOT NULL CHECK (amount_paid_cents >= 0),
  commission_rate numeric(4,3) NOT NULL CHECK (commission_rate BETWEEN 0 AND 1),
  commission_cents integer NOT NULL CHECK (commission_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','validated','paid','refunded','cancelled')),
  validated_at timestamptz,
  paid_at timestamptz,
  payout_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ambassador_referrals TO authenticated;
GRANT ALL ON public.ambassador_referrals TO service_role;

ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadrices voient leurs propres recommandations"
  ON public.ambassador_referrals FOR SELECT
  USING (auth.uid() = ambassador_user_id);

CREATE POLICY "Admin voit toutes les recommandations"
  ON public.ambassador_referrals FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin peut modifier les recommandations"
  ON public.ambassador_referrals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ambassador_referrals_updated_at
  BEFORE UPDATE ON public.ambassador_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ambassador_referrals_ambassador ON public.ambassador_referrals(ambassador_user_id, status);
CREATE INDEX idx_ambassador_referrals_pending_validation ON public.ambassador_referrals(status, created_at) WHERE status = 'pending';


-- 3. AMBASSADOR PAYOUTS (virements groupés mensuels)
CREATE TABLE public.ambassador_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  referral_count integer NOT NULL DEFAULT 0,
  sepa_batch_id text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','failed','cancelled')),
  scheduled_for date,
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ambassador_payouts TO authenticated;
GRANT ALL ON public.ambassador_payouts TO service_role;

ALTER TABLE public.ambassador_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadrices voient leurs propres versements"
  ON public.ambassador_payouts FOR SELECT
  USING (auth.uid() = ambassador_user_id);

CREATE POLICY "Admin voit tous les versements"
  ON public.ambassador_payouts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin gère les versements"
  ON public.ambassador_payouts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_ambassador_payouts_updated_at
  BEFORE UPDATE ON public.ambassador_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ambassador_payouts_ambassador ON public.ambassador_payouts(ambassador_user_id, status);


-- 4. FONCTIONS UTILITAIRES

-- Génère un code referral unique format ECL-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _exists boolean;
BEGIN
  LOOP
    _code := 'ECL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.ambassador_profiles WHERE referral_code = _code) INTO _exists;
    EXIT WHEN NOT _exists;
  END LOOP;
  RETURN _code;
END;
$$;

-- Crée le profil ambassadrice d'une utilisatrice premium (idempotent)
CREATE OR REPLACE FUNCTION public.ensure_ambassador_profile(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _is_premium boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  -- Vérifie que l'utilisatrice est bien premium
  SELECT is_premium INTO _is_premium FROM public.profiles WHERE user_id = _user_id;
  IF NOT COALESCE(_is_premium, false) THEN
    RAISE EXCEPTION 'User is not premium';
  END IF;

  -- Récupère ou crée
  SELECT referral_code INTO _code FROM public.ambassador_profiles WHERE user_id = _user_id;
  IF _code IS NULL THEN
    INSERT INTO public.ambassador_profiles (user_id, referral_code)
    VALUES (_user_id, public.generate_referral_code())
    RETURNING referral_code INTO _code;
  END IF;

  RETURN _code;
END;
$$;

-- Tableau de bord "Mon Impact"
CREATE OR REPLACE FUNCTION public.get_my_ambassador_impact()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _profile public.ambassador_profiles;
  _validated_count integer;
  _total_earned_cents integer;
  _pending_cents integer;
  _next_tier text;
  _next_threshold integer;
  _current_rate numeric;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _profile FROM public.ambassador_profiles WHERE user_id = _user_id;
  IF _profile.user_id IS NULL THEN
    RETURN jsonb_build_object('is_ambassador', false);
  END IF;

  SELECT count(*) INTO _validated_count
    FROM public.ambassador_referrals
    WHERE ambassador_user_id = _user_id AND status IN ('validated','paid');

  SELECT COALESCE(sum(commission_cents), 0) INTO _total_earned_cents
    FROM public.ambassador_referrals
    WHERE ambassador_user_id = _user_id AND status IN ('validated','paid');

  SELECT COALESCE(sum(commission_cents), 0) INTO _pending_cents
    FROM public.ambassador_referrals
    WHERE ambassador_user_id = _user_id AND status = 'pending';

  -- Cercle et taux
  _current_rate := CASE _profile.current_tier
    WHEN 'graine' THEN 0.20
    WHEN 'fleur' THEN 0.25
    WHEN 'fondatrice' THEN 0.30
  END;

  _next_tier := CASE _profile.current_tier
    WHEN 'graine' THEN 'fleur'
    WHEN 'fleur' THEN 'fondatrice'
    ELSE NULL
  END;

  _next_threshold := CASE _profile.current_tier
    WHEN 'graine' THEN 5
    WHEN 'fleur' THEN 15
    ELSE NULL
  END;

  RETURN jsonb_build_object(
    'is_ambassador', true,
    'referral_code', _profile.referral_code,
    'current_tier', _profile.current_tier,
    'current_rate', _current_rate,
    'mamans_accompagnees', _validated_count,
    'total_earned_cents', _total_earned_cents,
    'pending_cents', _pending_cents,
    'next_tier', _next_tier,
    'next_threshold', _next_threshold,
    'has_iban', _profile.iban_encrypted IS NOT NULL,
    'joined_at', _profile.joined_at
  );
END;
$$;

-- Valide une commission après J+14 et fait progresser le cercle si besoin
CREATE OR REPLACE FUNCTION public.validate_pending_referrals(_older_than_days integer DEFAULT 14)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _validated_count integer := 0;
  _tier_updates integer := 0;
  _rec record;
  _new_count integer;
  _new_tier text;
BEGIN
  -- Restreint à service_role ou admin
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- Valide les pending suffisamment vieux
  WITH upd AS (
    UPDATE public.ambassador_referrals
    SET status = 'validated', validated_at = now()
    WHERE status = 'pending'
      AND created_at < now() - make_interval(days => _older_than_days)
    RETURNING ambassador_user_id
  )
  SELECT count(*) INTO _validated_count FROM upd;

  -- Pour chaque ambassadrice concernée, recalcule cercle
  FOR _rec IN
    SELECT DISTINCT ambassador_user_id
    FROM public.ambassador_referrals
    WHERE status IN ('validated','paid')
  LOOP
    SELECT count(*) INTO _new_count
      FROM public.ambassador_referrals
      WHERE ambassador_user_id = _rec.ambassador_user_id AND status IN ('validated','paid');

    _new_tier := CASE
      WHEN _new_count >= 15 THEN 'fondatrice'
      WHEN _new_count >= 5 THEN 'fleur'
      ELSE 'graine'
    END;

    UPDATE public.ambassador_profiles
    SET validated_referrals_count = _new_count,
        current_tier = _new_tier
    WHERE user_id = _rec.ambassador_user_id
      AND (validated_referrals_count <> _new_count OR current_tier <> _new_tier);

    IF FOUND THEN _tier_updates := _tier_updates + 1; END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'validated', _validated_count,
    'tier_updates', _tier_updates,
    'ran_at', now()
  );
END;
$$;
