ALTER TABLE public.todo_items ADD COLUMN IF NOT EXISTS situation_id uuid REFERENCES public.child_situations(id) ON DELETE SET NULL;
ALTER TABLE public.child_situation_observations ADD COLUMN IF NOT EXISTS comm_snapshot jsonb;

CREATE TABLE public.child_comm_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL REFERENCES public.family_medical_profiles(id) ON DELETE CASCADE,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.child_comm_history TO authenticated;
GRANT ALL ON public.child_comm_history TO service_role;
ALTER TABLE public.child_comm_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own comm history" ON public.child_comm_history FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.family_medical_profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
CREATE INDEX ON public.child_comm_history(profile_id, created_at);