CREATE TABLE public.habits (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, name text NOT NULL, icon text NOT NULL DEFAULT '🌿', archived boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated; GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habits" ON public.habits FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER habits_upd BEFORE UPDATE ON public.habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.habit_checks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE, day date NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(habit_id, day));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_checks TO authenticated; GRANT ALL ON public.habit_checks TO service_role;
ALTER TABLE public.habit_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habit checks" ON public.habit_checks FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE TABLE public.business_contacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, kind text NOT NULL DEFAULT 'prospect', first_name text NOT NULL, last_name text, instagram text, tiktok text, email text, source text, stage text NOT NULL DEFAULT 'nouveau', pipeline_model text NOT NULL DEFAULT 'classique', status text, offer text, first_contact_date date DEFAULT current_date, last_exchange_date date, next_action text, followup_date date, personal_goal text, notes text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_contacts TO authenticated; GRANT ALL ON public.business_contacts TO service_role;
ALTER TABLE public.business_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own business contacts" ON public.business_contacts FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER bc_upd BEFORE UPDATE ON public.business_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX bc_user_followup ON public.business_contacts(user_id, followup_date);

CREATE TABLE public.business_interactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, contact_id uuid REFERENCES public.business_contacts(id) ON DELETE SET NULL, type text NOT NULL, amount_cents integer, happened_on date NOT NULL DEFAULT current_date, note text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_interactions TO authenticated; GRANT ALL ON public.business_interactions TO service_role;
ALTER TABLE public.business_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own business interactions" ON public.business_interactions FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

ALTER TABLE public.personal_goals ADD COLUMN IF NOT EXISTS why text, ADD COLUMN IF NOT EXISTS steps jsonb NOT NULL DEFAULT '[]'::jsonb;