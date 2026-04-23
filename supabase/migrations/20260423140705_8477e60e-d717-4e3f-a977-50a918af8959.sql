-- 1. Cancelar comandas abertas
UPDATE public.pdv_comandas
SET status = 'cancelada', updated_at = now()
WHERE status = 'aberta';

-- 2. Cancelar orders abertos
UPDATE public.pdv_orders
SET status = 'cancelada', updated_at = now()
WHERE status = 'aberta';

-- 3. Liberar mesas
UPDATE public.pdv_tables
SET status = 'livre', current_order_id = NULL
WHERE status <> 'livre' OR current_order_id IS NOT NULL;

-- 4. Índice único parcial: 1 comanda "padrão" (sem customer_name) aberta por order
CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_comanda_per_order
ON public.pdv_comandas (order_id)
WHERE status = 'aberta' AND customer_name IS NULL AND order_id IS NOT NULL;