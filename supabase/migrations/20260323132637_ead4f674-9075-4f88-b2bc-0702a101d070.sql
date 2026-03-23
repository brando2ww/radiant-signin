
ALTER TABLE public.establishment_users
  ADD COLUMN IF NOT EXISTS discount_password text,
  ADD COLUMN IF NOT EXISTS max_discount_percent numeric DEFAULT 100;

ALTER TABLE public.pdv_cashier_movements
  ADD COLUMN IF NOT EXISTS discount_reason text,
  ADD COLUMN IF NOT EXISTS discount_authorized_by text;
