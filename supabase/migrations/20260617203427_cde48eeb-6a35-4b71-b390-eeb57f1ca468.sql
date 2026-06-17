CREATE TABLE public.evolution_timelines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  before_text text NOT NULL DEFAULT '',
  storm_text text NOT NULL DEFAULT '',
  today_text text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evolution_timelines TO authenticated;
GRANT ALL ON public.evolution_timelines TO service_role;

ALTER TABLE public.evolution_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own timeline" ON public.evolution_timelines
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own timeline" ON public.evolution_timelines
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own timeline" ON public.evolution_timelines
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own timeline" ON public.evolution_timelines
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_evolution_timelines_updated_at
  BEFORE UPDATE ON public.evolution_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();