CREATE TABLE public.child_emotion_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  age_band text not null,
  emotion text not null,
  intensity integer,
  body_location text,
  observed_signs text[],
  note text,
  is_crisis boolean not null default false,
  needs_parent boolean not null default false,
  created_at timestamptz not null default now()
);

ALTER TABLE public.child_emotion_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own child emotion entries"
  ON public.child_emotion_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own child emotion entries"
  ON public.child_emotion_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own child emotion entries"
  ON public.child_emotion_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own child emotion entries"
  ON public.child_emotion_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_child_emotion_entries_user_created
  ON public.child_emotion_entries (user_id, created_at desc);