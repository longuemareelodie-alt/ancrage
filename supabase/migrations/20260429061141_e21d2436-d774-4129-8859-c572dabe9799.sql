CREATE TABLE public.speech_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  text_key TEXT NOT NULL,
  sentence INTEGER NOT NULL DEFAULT 0,
  elapsed REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  lang TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, text_key)
);

CREATE INDEX idx_speech_progress_user_updated
  ON public.speech_progress (user_id, updated_at DESC);

ALTER TABLE public.speech_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own speech progress"
ON public.speech_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own speech progress"
ON public.speech_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own speech progress"
ON public.speech_progress FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own speech progress"
ON public.speech_progress FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_speech_progress_updated_at
BEFORE UPDATE ON public.speech_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();