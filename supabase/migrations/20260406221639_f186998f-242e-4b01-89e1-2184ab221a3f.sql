
-- user_badges: block client inserts
DROP POLICY IF EXISTS "Users can insert their own badges" ON public.user_badges;
CREATE POLICY "No client inserts on user_badges"
  ON public.user_badges FOR INSERT TO authenticated
  WITH CHECK (false);

-- user_progress: block client inserts and updates
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;
CREATE POLICY "No client inserts on user_progress"
  ON public.user_progress FOR INSERT TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_progress;
CREATE POLICY "No client updates on user_progress"
  ON public.user_progress FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);
