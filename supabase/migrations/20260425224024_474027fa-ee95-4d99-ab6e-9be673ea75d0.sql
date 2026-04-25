-- 1. Atualiza a CHECK constraint para aceitar os novos métodos de pagamento
ALTER TABLE public.pdv_cashier_movements
  DROP CONSTRAINT IF EXISTS pdv_cashier_movements_payment_method_check;

ALTER TABLE public.pdv_cashier_movements
  ADD CONSTRAINT pdv_cashier_movements_payment_method_check
  CHECK (payment_method IS NULL OR payment_method = ANY (ARRAY[
    'dinheiro'::text,
    'credito'::text,
    'debito'::text,
    'cartao'::text,        -- mantido por compatibilidade durante a migração
    'pix'::text,
    'vale_refeicao'::text
  ]));

-- 2. Backfill: vendas legadas registradas como "cartao" agora viram "credito"
UPDATE public.pdv_cashier_movements
SET payment_method = 'credito'
WHERE payment_method = 'cartao';

-- 3. Sessões de caixa: copiar total_card para total_credit quando este estiver zerado
UPDATE public.pdv_cashier_sessions
SET total_credit = total_card
WHERE COALESCE(total_credit, 0) = 0
  AND COALESCE(total_card, 0) > 0;