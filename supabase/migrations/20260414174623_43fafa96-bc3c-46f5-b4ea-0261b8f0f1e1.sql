
ALTER TABLE public.product_expiry_tracking
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'outros',
  ADD COLUMN IF NOT EXISTS storage_location text,
  ADD COLUMN IF NOT EXISTS quantity numeric DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit text DEFAULT 'unidades',
  ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS temperature numeric,
  ADD COLUMN IF NOT EXISTS discard_reason text,
  ADD COLUMN IF NOT EXISTS discarded_quantity numeric,
  ADD COLUMN IF NOT EXISTS discarded_at timestamptz,
  ADD COLUMN IF NOT EXISTS origin text DEFAULT 'manual';
