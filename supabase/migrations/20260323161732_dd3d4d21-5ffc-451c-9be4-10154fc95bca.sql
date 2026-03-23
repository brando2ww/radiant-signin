ALTER TABLE public.pdv_settings
  ADD COLUMN IF NOT EXISTS nfe_auto_import_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS nfe_auto_import_cnpj TEXT;