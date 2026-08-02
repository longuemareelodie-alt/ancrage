CREATE OR REPLACE FUNCTION public.has_family_read_access(_owner_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_invitations
    WHERE inviter_user_id = _owner_id
      AND accepted_by = _viewer_id
      AND status = 'accepted'
  )
$$;

CREATE POLICY "Shared read for accepted relatives"
ON public.family_medical_profiles FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.family_medical_events FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.family_medical_documents FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.family_vaccinations FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.child_contacts FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.medications FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));

CREATE POLICY "Shared read for accepted relatives"
ON public.appointments FOR SELECT TO authenticated
USING (public.has_family_read_access(user_id, auth.uid()));