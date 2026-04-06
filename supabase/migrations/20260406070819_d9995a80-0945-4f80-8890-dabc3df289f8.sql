
-- Create emotion_checkins table
CREATE TABLE public.emotion_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emotion TEXT NOT NULL,
  emotion_type TEXT NOT NULL DEFAULT 'negative',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emotion_checkins ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own checkins"
ON public.emotion_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
ON public.emotion_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
ON public.emotion_checkins FOR DELETE
USING (auth.uid() = user_id);

-- Add columns to profiles
ALTER TABLE public.profiles
ADD COLUMN last_emotion TEXT,
ADD COLUMN last_checkin_date DATE;
