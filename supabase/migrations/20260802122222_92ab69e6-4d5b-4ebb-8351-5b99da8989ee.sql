CREATE OR REPLACE FUNCTION public.get_community_authors(_user_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _result jsonb;
BEGIN
  IF _me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.is_community_member(_me) AND NOT public.has_role(_me, 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF _user_ids IS NULL OR array_length(_user_ids, 1) IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  IF array_length(_user_ids, 1) > 200 THEN
    RAISE EXCEPTION 'Too many ids';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _result
  FROM (
    SELECT cm.user_id,
           cm.display_name,
           CASE WHEN ff.tier_key IS NULL OR ff.tier_key = 'standard' THEN NULL ELSE ff.tier_key END AS founding_tier
    FROM public.community_members cm
    LEFT JOIN public.founding_families ff ON ff.user_id = cm.user_id
    WHERE cm.user_id = ANY(_user_ids)
  ) t;

  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_community_authors(uuid[]) TO authenticated;