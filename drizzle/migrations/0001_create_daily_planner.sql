CREATE TABLE public.daily_planner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day date NOT NULL,
  priorities jsonb NOT NULL DEFAULT '[]'::jsonb,
  mood text,
  intensity smallint CHECK (intensity BETWEEN 1 AND 5),
  meal_lunch text,
  meal_dinner text,
  note text,
  light_day boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_planner TO authenticated;
GRANT ALL ON public.daily_planner TO service_role;
ALTER TABLE public.daily_planner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planner select" ON public.daily_planner FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own planner insert" ON public.daily_planner FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own planner update" ON public.daily_planner FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own planner delete" ON public.daily_planner FOR DELETE TO authenticated USING (auth.uid() = user_id);