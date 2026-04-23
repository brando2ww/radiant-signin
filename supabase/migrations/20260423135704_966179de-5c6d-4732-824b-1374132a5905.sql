UPDATE public.pdv_tables t
SET status = 'livre', current_order_id = NULL
WHERE is_active = true
  AND status <> 'livre'
  AND NOT EXISTS (
    SELECT 1 FROM public.pdv_comandas c
    WHERE c.order_id = t.current_order_id AND c.status = 'aberta'
  );