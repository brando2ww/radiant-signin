-- Remove from wrong table
ALTER TABLE public.business_settings DROP COLUMN IF EXISTS nfe_csc_id;
ALTER TABLE public.business_settings DROP COLUMN IF EXISTS nfe_csc_token;

-- Add to correct table
ALTER TABLE public.pdv_settings
  ADD COLUMN IF NOT EXISTS nfe_csc_id text,
  ADD COLUMN IF NOT EXISTS nfe_csc_token text;