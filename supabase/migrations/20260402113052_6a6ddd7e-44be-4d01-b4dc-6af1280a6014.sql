
-- Table: delivery_product_recipes
CREATE TABLE public.delivery_product_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.delivery_products(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_product_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select delivery_product_recipes"
  ON public.delivery_product_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_products dp
      WHERE dp.id = product_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can insert delivery_product_recipes"
  ON public.delivery_product_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.delivery_products dp
      WHERE dp.id = product_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can update delivery_product_recipes"
  ON public.delivery_product_recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_products dp
      WHERE dp.id = product_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can delete delivery_product_recipes"
  ON public.delivery_product_recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_products dp
      WHERE dp.id = product_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

-- Table: delivery_option_item_recipes
CREATE TABLE public.delivery_option_item_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_item_id UUID NOT NULL REFERENCES public.delivery_product_option_items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_option_item_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can select delivery_option_item_recipes"
  ON public.delivery_option_item_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_product_option_items oi
      JOIN public.delivery_product_options o ON o.id = oi.option_id
      JOIN public.delivery_products dp ON dp.id = o.product_id
      WHERE oi.id = option_item_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can insert delivery_option_item_recipes"
  ON public.delivery_option_item_recipes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.delivery_product_option_items oi
      JOIN public.delivery_product_options o ON o.id = oi.option_id
      JOIN public.delivery_products dp ON dp.id = o.product_id
      WHERE oi.id = option_item_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can update delivery_option_item_recipes"
  ON public.delivery_option_item_recipes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_product_option_items oi
      JOIN public.delivery_product_options o ON o.id = oi.option_id
      JOIN public.delivery_products dp ON dp.id = o.product_id
      WHERE oi.id = option_item_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );

CREATE POLICY "Owner can delete delivery_option_item_recipes"
  ON public.delivery_option_item_recipes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.delivery_product_option_items oi
      JOIN public.delivery_product_options o ON o.id = oi.option_id
      JOIN public.delivery_products dp ON dp.id = o.product_id
      WHERE oi.id = option_item_id
        AND (dp.user_id = auth.uid() OR public.is_establishment_member(dp.user_id))
    )
  );
