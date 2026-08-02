CREATE TABLE public.family_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL,
  personal_note text,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX family_invitations_inviter_idx ON public.family_invitations (inviter_user_id, created_at DESC);
CREATE UNIQUE INDEX family_invitations_pending_unique
  ON public.family_invitations (inviter_user_id, lower(email))
  WHERE status = 'pending';

GRANT SELECT, INSERT, UPDATE ON public.family_invitations TO authenticated;
GRANT ALL ON public.family_invitations TO service_role;

ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own invitations"
  ON public.family_invitations FOR SELECT TO authenticated
  USING (inviter_user_id = auth.uid());

CREATE POLICY "Users create their own invitations"
  ON public.family_invitations FOR INSERT TO authenticated
  WITH CHECK (inviter_user_id = auth.uid());

CREATE POLICY "Users update their own invitations"
  ON public.family_invitations FOR UPDATE TO authenticated
  USING (inviter_user_id = auth.uid())
  WITH CHECK (inviter_user_id = auth.uid());

CREATE TRIGGER update_family_invitations_updated_at
  BEFORE UPDATE ON public.family_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation douce du rôle et de l'e-mail (trigger plutôt que CHECK)
CREATE OR REPLACE FUNCTION public.validate_family_invitation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.email := lower(trim(NEW.email));
  IF NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Adresse e-mail invalide';
  END IF;
  IF NEW.role NOT IN ('maman','papa','grand_parent','professionnel','autre_parent','proche','autre') THEN
    RAISE EXCEPTION 'Rôle invalide: %', NEW.role;
  END IF;
  IF NEW.status NOT IN ('pending','accepted','revoked','expired') THEN
    RAISE EXCEPTION 'Statut invalide: %', NEW.status;
  END IF;
  IF NEW.personal_note IS NOT NULL AND length(NEW.personal_note) > 500 THEN
    RAISE EXCEPTION 'Le petit mot est trop long';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_family_invitation_trigger
  BEFORE INSERT OR UPDATE ON public.family_invitations
  FOR EACH ROW EXECUTE FUNCTION public.validate_family_invitation();

-- Création d'une invitation : génère le lien unique, empêche les doublons et le spam
CREATE OR REPLACE FUNCTION public.create_family_invitation(
  _email text,
  _role text,
  _note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _clean_email text := lower(trim(coalesce(_email, '')));
  _own_email text;
  _recent integer;
  _token text := encode(gen_random_bytes(24), 'hex');
  _id uuid;
  _expires timestamptz;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(email) INTO _own_email FROM public.profiles WHERE user_id = _user_id;
  IF _own_email IS NOT NULL AND _own_email = _clean_email THEN
    RAISE EXCEPTION 'self_invite';
  END IF;

  SELECT count(*) INTO _recent
  FROM public.family_invitations
  WHERE inviter_user_id = _user_id
    AND created_at > now() - interval '24 hours';
  IF _recent >= 20 THEN
    RAISE EXCEPTION 'rate_limited';
  END IF;

  -- Une invitation en attente déjà envoyée à cette adresse est renouvelée
  UPDATE public.family_invitations
  SET status = 'revoked'
  WHERE inviter_user_id = _user_id
    AND lower(email) = _clean_email
    AND status = 'pending';

  INSERT INTO public.family_invitations (inviter_user_id, email, role, personal_note, token)
  VALUES (_user_id, _clean_email, _role, nullif(trim(coalesce(_note, '')), ''), _token)
  RETURNING id, expires_at INTO _id, _expires;

  RETURN jsonb_build_object(
    'id', _id,
    'email', _clean_email,
    'role', _role,
    'token', _token,
    'expires_at', _expires
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_family_invitation(text, text, text) TO authenticated;

-- Annulation d'une invitation en attente
CREATE OR REPLACE FUNCTION public.revoke_family_invitation(_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.family_invitations
  SET status = 'revoked'
  WHERE id = _id AND inviter_user_id = _user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation introuvable';
  END IF;

  RETURN jsonb_build_object('success', true, 'id', _id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_family_invitation(uuid) TO authenticated;

-- Lecture publique d'une invitation via son lien : jamais l'e-mail de l'invitante
CREATE OR REPLACE FUNCTION public.get_family_invitation_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inv public.family_invitations;
  _inviter_name text;
BEGIN
  SELECT * INTO _inv FROM public.family_invitations WHERE token = _token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT nullif(trim(first_name), '') INTO _inviter_name
  FROM public.profiles WHERE user_id = _inv.inviter_user_id;

  RETURN jsonb_build_object(
    'found', true,
    'role', _inv.role,
    'personal_note', _inv.personal_note,
    'inviter_first_name', _inviter_name,
    'invited_email', _inv.email,
    'status', CASE
      WHEN _inv.status = 'pending' AND _inv.expires_at < now() THEN 'expired'
      ELSE _inv.status
    END,
    'expires_at', _inv.expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_family_invitation_by_token(text) TO anon, authenticated;