-- 1) Vincular o item da opção do catálogo ao registro do pedido (para rastrear receita)
ALTER TABLE public.delivery_order_item_options
  ADD COLUMN IF NOT EXISTS option_item_id uuid REFERENCES public.delivery_product_option_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_delivery_order_item_options_option_item_id
  ON public.delivery_order_item_options(option_item_id);

-- 2) Função para consumir insumos a partir de um pedido de delivery
CREATE OR REPLACE FUNCTION public.consume_ingredients_for_delivery_order(p_order_id uuid)
RETURNS TABLE(out_ingredient_id uuid, out_total_consumed numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_owner uuid;
BEGIN
  IF p_order_id IS NULL THEN
    RETURN;
  END IF;

  SELECT user_id INTO v_owner
  FROM public.delivery_orders
  WHERE id = p_order_id;

  IF v_owner IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS tmp_delivery_consumption (
    order_item_id uuid,
    ingredient_id uuid,
    qty_consumed numeric
  ) ON COMMIT DROP;
  TRUNCATE tmp_delivery_consumption;

  WITH src_items AS (
    SELECT oi.id AS order_item_id,
           oi.product_id,
           oi.quantity::numeric AS qty
    FROM public.delivery_order_items oi
    WHERE oi.order_id = p_order_id
  ),
  main_recipe AS (
    SELECT s.order_item_id,
           pr.ingredient_id,
           (pr.quantity::numeric * s.qty) AS qty_consumed
    FROM src_items s
    JOIN public.delivery_product_recipes pr ON pr.product_id = s.product_id
  ),
  option_recipe AS (
    SELECT s.order_item_id,
           oir.ingredient_id,
           (oir.quantity::numeric * s.qty) AS qty_consumed
    FROM src_items s
    JOIN public.delivery_order_item_options oio ON oio.order_item_id = s.order_item_id
    JOIN public.delivery_option_item_recipes oir ON oir.option_item_id = oio.option_item_id
    WHERE oio.option_item_id IS NOT NULL
  ),
  unioned AS (
    SELECT * FROM main_recipe
    UNION ALL
    SELECT * FROM option_recipe
  )
  INSERT INTO tmp_delivery_consumption (order_item_id, ingredient_id, qty_consumed)
  SELECT u.order_item_id, u.ingredient_id, SUM(u.qty_consumed)
  FROM unioned u
  GROUP BY u.order_item_id, u.ingredient_id
  HAVING SUM(u.qty_consumed) > 0;

  -- Idempotência: descarta linhas já registradas (mesmo order_item + ingredient)
  DELETE FROM tmp_delivery_consumption tc
  USING public.pdv_stock_movements sm
  WHERE sm.order_item_id = tc.order_item_id
    AND sm.ingredient_id = tc.ingredient_id;

  IF NOT EXISTS (SELECT 1 FROM tmp_delivery_consumption) THEN
    RETURN;
  END IF;

  -- Baixa estoque
  UPDATE public.pdv_ingredients ing
  SET current_stock = COALESCE(ing.current_stock, 0) - agg.qty_consumed
  FROM (
    SELECT tc.ingredient_id, SUM(tc.qty_consumed) AS qty_consumed
    FROM tmp_delivery_consumption tc
    GROUP BY tc.ingredient_id
  ) agg
  WHERE ing.id = agg.ingredient_id;

  -- Registra movimentos
  INSERT INTO public.pdv_stock_movements (ingredient_id, type, quantity, reason, created_by, order_item_id)
  SELECT tc.ingredient_id, 'saida_venda'::pdv_stock_movement_type, tc.qty_consumed,
         'Venda via delivery', v_owner, tc.order_item_id
  FROM tmp_delivery_consumption tc;

  RETURN QUERY
  SELECT tc.ingredient_id, SUM(tc.qty_consumed)::numeric
  FROM tmp_delivery_consumption tc
  GROUP BY tc.ingredient_id;
END;
$function$;