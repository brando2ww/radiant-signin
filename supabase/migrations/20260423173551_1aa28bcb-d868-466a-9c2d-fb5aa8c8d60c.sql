-- Reabrir Mesa 04 vinculando ao order da comanda TESTE (que está aberta)
UPDATE public.pdv_tables 
SET status = 'ocupada', 
    current_order_id = '5e2bb496-bfc9-4ce8-b5c0-4df76a97bd36',
    updated_at = now()
WHERE id = '64c11242-aba7-4c73-8a82-71284adc15db'
  AND current_order_id IS NULL;

-- Fechar orders órfãs (sem comanda aberta)
UPDATE public.pdv_orders 
SET status = 'fechada', updated_at = now()
WHERE id IN ('9562e911-2d0d-4f97-94cb-a038ffc70ecd', '9402e942-ffe1-4d26-9867-f114dce03df7')
  AND status = 'aberta';