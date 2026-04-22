UPDATE public.pdv_comandas
SET status = 'cancelada',
    notes = COALESCE(notes || ' | ', '') || 'Cancelada automaticamente: comanda de mesa órfã (sem order_id).',
    updated_at = now()
WHERE status = 'aberta'
  AND order_id IS NULL
  AND customer_name LIKE 'Mesa %';