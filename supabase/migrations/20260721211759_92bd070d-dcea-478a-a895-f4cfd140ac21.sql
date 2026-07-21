
ALTER TABLE public.agenda_events ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
ALTER TABLE public.todo_items ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reminders_enabled boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_agenda_reminder ON public.agenda_events(event_date) WHERE reminder_sent_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_todo_reminder ON public.todo_items(due_date) WHERE reminder_sent_at IS NULL AND done = false;
