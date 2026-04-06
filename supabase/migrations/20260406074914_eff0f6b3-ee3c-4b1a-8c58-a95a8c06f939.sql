
-- Add streak columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0;

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
