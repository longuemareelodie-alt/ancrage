
CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Personnel',
  mime_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_documents TO authenticated;
GRANT ALL ON public.vault_documents TO service_role;
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vault documents" ON public.vault_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_vault_docs_user ON public.vault_documents(user_id, category);
CREATE TRIGGER update_vault_documents_updated_at BEFORE UPDATE ON public.vault_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vault_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_folders TO authenticated;
GRANT ALL ON public.vault_folders TO service_role;
ALTER TABLE public.vault_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vault folders" ON public.vault_folders
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Storage RLS: users can only access files under their own user_id/ prefix
CREATE POLICY "Users read own vault files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own vault files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own vault files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
