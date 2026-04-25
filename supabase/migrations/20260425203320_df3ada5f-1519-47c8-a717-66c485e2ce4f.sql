ALTER TABLE public.pdv_settings
  ADD COLUMN IF NOT EXISTS require_discount_reason boolean NOT NULL DEFAULT false;