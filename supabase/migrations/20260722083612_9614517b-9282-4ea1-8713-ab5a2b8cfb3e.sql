DROP POLICY IF EXISTS "Anyone can insert quiz events" ON public.quiz_events;

CREATE POLICY "Anyone can insert quiz events"
ON public.quiz_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('result_view', 'pdf_download', 'cta_click')
  AND (score IS NULL OR (score >= 0 AND score <= 100))
  AND (max_score IS NULL OR (max_score > 0 AND max_score <= 100))
  AND (user_id IS NULL OR user_id = auth.uid())
);