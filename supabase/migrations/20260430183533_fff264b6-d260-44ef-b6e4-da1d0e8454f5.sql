-- 1) Catálogo de taxas por forma de pagamento
CREATE TABLE public.pdv_payment_method_fees (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  method_key text NOT NULL,
  label text NOT NULL,
  fee_percentage numeric NOT NULL DEFAULT 0,
  fee_fixed numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pdv_payment_method_fees_user_method_unique UNIQUE (user_id, method_key)
);

CREATE INDEX idx_pdv_payment_method_fees_user ON public.pdv_payment_method_fees(user_id);

ALTER TABLE public.pdv_payment_method_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and members can view payment fees"
ON public.pdv_payment_method_fees
FOR SELECT
USING (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "Owners can insert payment fees"
ON public.pdv_payment_method_fees
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update payment fees"
ON public.pdv_payment_method_fees
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete payment fees"
ON public.pdv_payment_method_fees
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_pdv_payment_method_fees_updated_at
BEFORE UPDATE ON public.pdv_payment_method_fees
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2) Snapshot de taxa em pdv_payments
ALTER TABLE public.pdv_payments
  ADD COLUMN gross_amount numeric,
  ADD COLUMN fee_percentage_applied numeric NOT NULL DEFAULT 0,
  ADD COLUMN fee_fixed_applied numeric NOT NULL DEFAULT 0,
  ADD COLUMN fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN net_amount numeric;

UPDATE public.pdv_payments
SET gross_amount = amount,
    net_amount = amount
WHERE gross_amount IS NULL;

-- 3) Snapshot de taxa em pdv_financial_transactions
ALTER TABLE public.pdv_financial_transactions
  ADD COLUMN gross_amount numeric,
  ADD COLUMN fee_percentage_applied numeric NOT NULL DEFAULT 0,
  ADD COLUMN fee_fixed_applied numeric NOT NULL DEFAULT 0,
  ADD COLUMN fee_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN net_amount numeric;

UPDATE public.pdv_financial_transactions
SET gross_amount = amount,
    net_amount = amount
WHERE gross_amount IS NULL;