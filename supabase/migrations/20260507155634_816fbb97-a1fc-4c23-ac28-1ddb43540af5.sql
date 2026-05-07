
-- =========================================================
-- LSF progress
-- =========================================================
CREATE TABLE public.lsf_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sign_key text NOT NULL,
  learned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sign_key)
);
ALTER TABLE public.lsf_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own lsf progress" ON public.lsf_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lsf progress" ON public.lsf_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own lsf progress" ON public.lsf_progress
  FOR DELETE USING (auth.uid() = user_id);

-- =========================================================
-- Private journal
-- =========================================================
CREATE TABLE public.private_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'free',
  prompt_key text,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.private_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own journal" ON public.private_journal_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journal" ON public.private_journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own journal" ON public.private_journal_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own journal" ON public.private_journal_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_private_journal_entries_updated_at
  BEFORE UPDATE ON public.private_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_private_journal_user_created ON public.private_journal_entries (user_id, created_at DESC);

-- =========================================================
-- Community members
-- =========================================================
CREATE TABLE public.community_members (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view all members display"
  ON public.community_members FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.community_members m WHERE m.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "User joins community"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User updates own member"
  ON public.community_members FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User leaves community"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

-- Helper to test membership without recursion
CREATE OR REPLACE FUNCTION public.is_community_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_members WHERE user_id = _user_id)
$$;

-- =========================================================
-- Community threads
-- =========================================================
CREATE TABLE public.community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view active threads"
  ON public.community_threads FOR SELECT
  USING (
    is_active = true AND public.is_community_member(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins manage threads"
  ON public.community_threads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Community posts
-- =========================================================
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES public.community_threads(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'thread_post',
  parent_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view approved or own posts"
  ON public.community_posts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (
      public.is_community_member(auth.uid())
      AND (status = 'approved' OR author_id = auth.uid())
    )
  );
CREATE POLICY "Members insert own pending posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (
    public.is_community_member(auth.uid())
    AND author_id = auth.uid()
    AND status = 'pending'
  );
CREATE POLICY "Admins update post status"
  ON public.community_posts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Author deletes own pending"
  ON public.community_posts FOR DELETE
  USING (
    (author_id = auth.uid() AND status = 'pending')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_community_posts_thread ON public.community_posts (thread_id, created_at DESC);
CREATE INDEX idx_community_posts_status ON public.community_posts (status, created_at DESC);
CREATE INDEX idx_community_posts_author ON public.community_posts (author_id, created_at DESC);

-- =========================================================
-- Community reports
-- =========================================================
CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members report posts"
  ON public.community_reports FOR INSERT
  WITH CHECK (
    public.is_community_member(auth.uid())
    AND reporter_id = auth.uid()
  );
CREATE POLICY "Admins view reports"
  ON public.community_reports FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins resolve reports"
  ON public.community_reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Seed initial threads
-- =========================================================
INSERT INTO public.community_threads (slug, title, description) VALUES
  ('lsf-premiers-signes', 'LSF & premiers signes', 'Partagez vos progrès, vos questions et vos premiers signes en LSF avec votre enfant.'),
  ('mon-enfant-tsa', 'Mon enfant TSA', 'Échanges entre parents d''enfants sur le spectre autistique : routines, accompagnement, ressources.'),
  ('regard-des-autres', 'Gérer le regard des autres', 'Comment composer avec les remarques, jugements et incompréhensions au quotidien.'),
  ('victoires-du-jour', 'Nos victoires du jour', 'Petites et grandes réussites du quotidien, à célébrer ensemble.')
ON CONFLICT (slug) DO NOTHING;
