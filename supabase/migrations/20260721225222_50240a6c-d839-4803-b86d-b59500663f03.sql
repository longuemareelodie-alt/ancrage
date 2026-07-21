
-- Extend vault_documents with premium fields
ALTER TABLE public.vault_documents
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS idx_vault_documents_favorite ON public.vault_documents(user_id, is_favorite) WHERE is_favorite;
CREATE INDEX IF NOT EXISTS idx_vault_documents_expiry ON public.vault_documents(user_id, expiry_date) WHERE expiry_date IS NOT NULL;

-- Secure notes for sensitive financial data (IBAN, card refs, contract numbers, PIN reminders...)
CREATE TABLE IF NOT EXISTS public.vault_secure_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Autre',
  content text NOT NULL,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_secure_notes TO authenticated;
GRANT ALL ON public.vault_secure_notes TO service_role;

ALTER TABLE public.vault_secure_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own secure notes"
  ON public.vault_secure_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_vault_secure_notes_user ON public.vault_secure_notes(user_id, created_at DESC);

CREATE TRIGGER trg_update_vault_secure_notes_updated_at
  BEFORE UPDATE ON public.vault_secure_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
