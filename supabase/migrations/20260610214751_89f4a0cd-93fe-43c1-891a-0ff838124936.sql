
-- 1. medication_reminder_log: explicit block for client writes (service role bypasses RLS)
CREATE POLICY "Block client inserts on medication_reminder_log"
  ON public.medication_reminder_log
  FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Block client updates on medication_reminder_log"
  ON public.medication_reminder_log
  FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Block client deletes on medication_reminder_log"
  ON public.medication_reminder_log
  FOR DELETE TO authenticated, anon
  USING (false);

-- 2. family-medical-docs storage bucket: owner-scoped UPDATE policy
CREATE POLICY "Users can update their own family medical docs"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'family-medical-docs'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'family-medical-docs'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );
