-- Add column to track when waiter closed the comanda (for FIFO ordering in cashier queue)
ALTER TABLE public.pdv_comandas
  ADD COLUMN IF NOT EXISTS closed_by_waiter_at timestamptz;

-- Index to speed up cashier-pending queries
CREATE INDEX IF NOT EXISTS idx_pdv_comandas_status_user
  ON public.pdv_comandas (user_id, status);