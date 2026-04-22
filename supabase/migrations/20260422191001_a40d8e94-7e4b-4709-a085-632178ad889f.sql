
CREATE TABLE IF NOT EXISTS public.pdv_option_item_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_item_id UUID NOT NULL REFERENCES public.pdv_product_option_items(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'un',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pdv_option_item_recipes_unique UNIQUE (option_item_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_option_item_recipes_item ON public.pdv_option_item_recipes(option_item_id);
CREATE INDEX IF NOT EXISTS idx_option_item_recipes_ingredient ON public.pdv_option_item_recipes(ingredient_id);

ALTER TABLE public.pdv_option_item_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages option recipes"
ON public.pdv_option_item_recipes
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.pdv_product_option_items it
    JOIN public.pdv_product_options opt ON opt.id = it.option_id
    JOIN public.pdv_products p ON p.id = opt.product_id
    WHERE it.id = pdv_option_item_recipes.option_item_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pdv_product_option_items it
    JOIN public.pdv_product_options opt ON opt.id = it.option_id
    JOIN public.pdv_products p ON p.id = opt.product_id
    WHERE it.id = pdv_option_item_recipes.option_item_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Staff manages option recipes"
ON public.pdv_option_item_recipes
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.pdv_product_option_items it
    JOIN public.pdv_product_options opt ON opt.id = it.option_id
    JOIN public.pdv_products p ON p.id = opt.product_id
    WHERE it.id = pdv_option_item_recipes.option_item_id
      AND public.is_establishment_member(p.user_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.pdv_product_option_items it
    JOIN public.pdv_product_options opt ON opt.id = it.option_id
    JOIN public.pdv_products p ON p.id = opt.product_id
    WHERE it.id = pdv_option_item_recipes.option_item_id
      AND public.is_establishment_member(p.user_id)
  )
);
