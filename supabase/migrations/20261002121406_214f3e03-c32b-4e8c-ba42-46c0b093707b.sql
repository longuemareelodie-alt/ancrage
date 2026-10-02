CREATE TABLE public.child_picto_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  picto_key text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, picto_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_picto_photos TO authenticated;
GRANT ALL ON public.child_picto_photos TO service_role;
ALTER TABLE public.child_picto_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages picto photos" ON public.child_picto_photos FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.family_medical_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));

CREATE POLICY "Child photos owner read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'child-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Child photos owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'child-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Child photos owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'child-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Child photos owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'child-photos' AND (storage.foldername(name))[1] = auth.uid()::text);