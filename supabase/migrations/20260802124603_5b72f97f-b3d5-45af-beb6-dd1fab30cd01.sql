CREATE TABLE public.notification_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_reminders BOOLEAN NOT NULL DEFAULT true,
  emotion_reminders BOOLEAN NOT NULL DEFAULT true,
  morning_time TIME NOT NULL DEFAULT '08:30',
  evening_time TIME NOT NULL DEFAULT '20:30',
  quiet_start TIME NOT NULL DEFAULT '21:30',
  quiet_end TIME NOT NULL DEFAULT '07:30',
  timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
  max_per_day SMALLINT NOT NULL DEFAULT 2,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  sent_today SMALLINT NOT NULL DEFAULT 0,
  sent_today_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own notification preferences"
ON public.notification_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.validate_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.max_per_day < 0 OR NEW.max_per_day > 4 THEN
    RAISE EXCEPTION 'max_per_day must be between 0 and 4';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_notification_preferences_trigger
BEFORE INSERT OR UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.validate_notification_preferences();