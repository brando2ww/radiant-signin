
ALTER TABLE public.pdv_stock_movements
  ADD COLUMN IF NOT EXISTS comanda_item_id UUID REFERENCES public.pdv_comanda_items(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_stock_movements_comanda_item
  ON public.pdv_stock_movements(comanda_item_id, ingredient_id)
  WHERE comanda_item_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.consume_ingredients_for_comanda_items(p_item_ids UUID[])
RETURNS TABLE(out_ingredient_id UUID, out_total_consumed NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
BEGIN
  IF p_item_ids IS NULL OR array_length(p_item_ids, 1) IS NULL THEN
    RETURN;
  END IF;

  CREATE TEMP TABLE IF NOT EXISTS tmp_consumption (
    item_id UUID,
    ingredient_id UUID,
    qty_consumed NUMERIC
  ) ON COMMIT DROP;
  TRUNCATE tmp_consumption;

  WITH src_items AS (
    SELECT ci.id AS item_id,
           ci.product_id,
           ci.quantity::numeric AS qty,
           ci.modifiers
    FROM public.pdv_comanda_items ci
    WHERE ci.id = ANY(p_item_ids)
  ),
  main_recipe AS (
    SELECT s.item_id, pr.ingredient_id, (pr.quantity::numeric * s.qty) AS qty_consumed
    FROM src_items s
    JOIN public.pdv_product_recipes pr ON pr.product_id = s.product_id
  ),
  option_items_chosen AS (
    SELECT s.item_id,
           s.qty,
           (oi->>'item_id')::uuid AS option_item_id,
           COALESCE((oi->>'quantity')::numeric, 1) AS chosen_qty
    FROM src_items s,
         LATERAL jsonb_array_elements(COALESCE(s.modifiers->'options', '[]'::jsonb)) opt,
         LATERAL jsonb_array_elements(COALESCE(opt->'items', '[]'::jsonb)) oi
    WHERE s.modifiers IS NOT NULL
  ),
  option_recipe AS (
    SELECT oic.item_id, oir.ingredient_id, (oir.quantity::numeric * oic.chosen_qty * oic.qty) AS qty_consumed
    FROM option_items_chosen oic
    JOIN public.pdv_option_item_recipes oir ON oir.option_item_id = oic.option_item_id
  ),
  unioned AS (
    SELECT * FROM main_recipe
    UNION ALL
    SELECT * FROM option_recipe
  )
  INSERT INTO tmp_consumption (item_id, ingredient_id, qty_consumed)
  SELECT u.item_id, u.ingredient_id, SUM(u.qty_consumed)
  FROM unioned u
  GROUP BY u.item_id, u.ingredient_id
  HAVING SUM(u.qty_consumed) > 0;

  -- Idempotência: descarta linhas já registradas
  DELETE FROM tmp_consumption tc
  USING public.pdv_stock_movements sm
  WHERE sm.comanda_item_id = tc.item_id
    AND sm.ingredient_id = tc.ingredient_id;

  IF NOT EXISTS (SELECT 1 FROM tmp_consumption) THEN
    RETURN;
  END IF;

  -- Determina dono (a partir do produto-pai de qualquer item)
  SELECT p.user_id INTO v_owner
  FROM public.pdv_comanda_items ci
  JOIN public.pdv_products p ON p.id = ci.product_id
  WHERE ci.id = ANY(p_item_ids)
  LIMIT 1;

  IF v_owner IS NULL THEN
    RETURN;
  END IF;

  -- Baixa estoque
  UPDATE public.pdv_ingredients ing
  SET current_stock = COALESCE(ing.current_stock, 0) - agg.qty_consumed
  FROM (
    SELECT tc.ingredient_id, SUM(tc.qty_consumed) AS qty_consumed
    FROM tmp_consumption tc
    GROUP BY tc.ingredient_id
  ) agg
  WHERE ing.id = agg.ingredient_id;

  -- Registra movimentos
  INSERT INTO public.pdv_stock_movements (ingredient_id, type, quantity, reason, created_by, comanda_item_id)
  SELECT tc.ingredient_id, 'saida_venda'::pdv_stock_movement_type, tc.qty_consumed, 'Venda via comanda', v_owner, tc.item_id
  FROM tmp_consumption tc;

  RETURN QUERY
  SELECT tc.ingredient_id, SUM(tc.qty_consumed)::numeric
  FROM tmp_consumption tc
  GROUP BY tc.ingredient_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_ingredients_for_comanda_items(UUID[]) TO authenticated;
