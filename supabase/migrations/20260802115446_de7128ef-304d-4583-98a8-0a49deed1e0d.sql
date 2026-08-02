CREATE TABLE public.founding_families (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  position integer NOT NULL,
  tier_key text NOT NULL,
  price_cents integer NOT NULL,
  payment_id text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX founding_families_position_key ON public.founding_families(position);

GRANT SELECT ON public.founding_families TO authenticated;
GRANT ALL ON public.founding_families TO service_role;

ALTER TABLE public.founding_families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own founding row"
  ON public.founding_families FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_founding_families_updated_at
  BEFORE UPDATE ON public.founding_families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tarif du moment : lisible par tout le monde (page de vente)
CREATE OR REPLACE FUNCTION public.get_founding_offer()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _taken integer;
  _tier text;
  _price integer;
  _tier_end integer;
BEGIN
  SELECT count(*) INTO _taken FROM public.founding_families;

  IF _taken < 5 THEN
    _tier := 'fondatrice'; _price := 2900; _tier_end := 5;
  ELSIF _taken < 15 THEN
    _tier := 'pionniere'; _price := 4900; _tier_end := 15;
  ELSIF _taken < 35 THEN
    _tier := 'premiere'; _price := 6900; _tier_end := 35;
  ELSIF _taken < 55 THEN
    _tier := 'suivante'; _price := 7900; _tier_end := 55;
  ELSE
    _tier := 'standard'; _price := 9700; _tier_end := NULL;
  END IF;

  RETURN jsonb_build_object(
    'tier_key', _tier,
    'price_cents', _price,
    'families_joined', _taken,
    'remaining_at_this_price', CASE WHEN _tier_end IS NULL THEN NULL ELSE _tier_end - _taken END,
    'is_limited', _tier_end IS NOT NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_founding_offer() TO anon, authenticated, service_role;

-- Attribution automatique après un paiement réellement validé (système uniquement)
CREATE OR REPLACE FUNCTION public.claim_founding_slot(_user_id uuid, _payment_id text, _paid_cents integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing public.founding_families;
  _taken integer;
  _pos integer;
  _tier text;
  _price integer;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role'
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  SELECT * INTO _existing FROM public.founding_families WHERE user_id = _user_id;
  IF _existing.user_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'created', false,
      'tier_key', _existing.tier_key,
      'position', _existing.position,
      'price_cents', _existing.price_cents
    );
  END IF;

  -- Sérialise l'attribution des places
  PERFORM pg_advisory_xact_lock(7700000000000042);

  SELECT count(*) INTO _taken FROM public.founding_families;
  _pos := _taken + 1;

  IF _taken < 5 THEN
    _tier := 'fondatrice'; _price := 2900;
  ELSIF _taken < 15 THEN
    _tier := 'pionniere'; _price := 4900;
  ELSIF _taken < 35 THEN
    _tier := 'premiere'; _price := 6900;
  ELSIF _taken < 55 THEN
    _tier := 'suivante'; _price := 7900;
  ELSE
    _tier := 'standard'; _price := 9700;
  END IF;

  INSERT INTO public.founding_families (user_id, position, tier_key, price_cents, payment_id)
  VALUES (_user_id, _pos, _tier, COALESCE(_paid_cents, _price), _payment_id);

  IF _tier <> 'standard' THEN
    INSERT INTO public.user_badges (user_id, badge_key)
    VALUES (_user_id, 'famille_' || _tier)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'created', true,
    'tier_key', _tier,
    'position', _pos,
    'price_cents', COALESCE(_paid_cents, _price)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_founding_slot(uuid, text, integer) TO service_role;

-- Badge + date d'arrivée + tarif obtenu, pour le profil
CREATE OR REPLACE FUNCTION public.get_my_founding_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.founding_families;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _row FROM public.founding_families WHERE user_id = auth.uid();
  IF _row.user_id IS NULL THEN
    RETURN jsonb_build_object('is_founding', false);
  END IF;

  RETURN jsonb_build_object(
    'is_founding', _row.tier_key <> 'standard',
    'tier_key', _row.tier_key,
    'position', _row.position,
    'price_cents', _row.price_cents,
    'joined_at', _row.joined_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_founding_status() TO authenticated, service_role;