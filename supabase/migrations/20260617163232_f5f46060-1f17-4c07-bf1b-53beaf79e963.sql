CREATE TABLE public.transformation_portraits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  overcome text NOT NULL,
  developing text NOT NULL,
  new_strengths text NOT NULL,
  becoming text NOT NULL,
  entry_count integer NOT NULL DEFAULT 0,
  generation_mode text NOT NULL DEFAULT 'manual' CHECK (generation_mode IN ('manual','auto')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, year, month)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transformation_portraits TO authenticated;
GRANT ALL ON public.transformation_portraits TO service_role;

ALTER TABLE public.transformation_portraits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own portraits"
  ON public.transformation_portraits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own portraits"
  ON public.transformation_portraits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own portraits"
  ON public.transformation_portraits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own portraits"
  ON public.transformation_portraits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_transformation_portraits_updated_at
  BEFORE UPDATE ON public.transformation_portraits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_transformation_portraits_user_date
  ON public.transformation_portraits (user_id, year DESC, month DESC);