
-- Agenda
CREATE TABLE public.agenda_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  category TEXT DEFAULT 'perso',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_events TO authenticated;
GRANT ALL ON public.agenda_events TO service_role;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own agenda" ON public.agenda_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER agenda_events_updated BEFORE UPDATE ON public.agenda_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_agenda_user_date ON public.agenda_events(user_id, event_date);

-- Todo
CREATE TABLE public.todo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  priority TEXT DEFAULT 'normal',
  due_date DATE,
  category TEXT DEFAULT 'perso',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todo_items TO authenticated;
GRANT ALL ON public.todo_items TO service_role;
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own todos" ON public.todo_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER todo_items_updated BEFORE UPDATE ON public.todo_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Courses
CREATE TABLE public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'autre',
  checked BOOLEAN NOT NULL DEFAULT false,
  list_name TEXT DEFAULT 'Ma liste',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shopping_items TO authenticated;
GRANT ALL ON public.shopping_items TO service_role;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shopping" ON public.shopping_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER shopping_items_updated BEFORE UPDATE ON public.shopping_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notes
CREATE TABLE public.organisation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  content TEXT NOT NULL DEFAULT '',
  color TEXT DEFAULT 'ivoire',
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organisation_notes TO authenticated;
GRANT ALL ON public.organisation_notes TO service_role;
ALTER TABLE public.organisation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own org notes" ON public.organisation_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER organisation_notes_updated BEFORE UPDATE ON public.organisation_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
