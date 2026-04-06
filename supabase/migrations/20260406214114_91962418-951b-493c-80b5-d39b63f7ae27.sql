ALTER TABLE public.customer_evaluations
  ADD COLUMN source text NOT NULL DEFAULT 'manual',
  ADD COLUMN external_id text;

CREATE UNIQUE INDEX idx_customer_evaluations_external_id
  ON public.customer_evaluations (external_id)
  WHERE external_id IS NOT NULL;