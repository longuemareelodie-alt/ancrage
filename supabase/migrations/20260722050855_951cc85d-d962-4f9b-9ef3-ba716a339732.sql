
ALTER TABLE public.family_medical_documents
  ADD COLUMN IF NOT EXISTS doc_type text NOT NULL DEFAULT 'autre',
  ADD COLUMN IF NOT EXISTS issued_date date,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS doctor_name text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_fmd_profile_expiry
  ON public.family_medical_documents(profile_id, expiry_date);
