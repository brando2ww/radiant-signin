
-- PDV Product Options table (mirrors delivery_product_options)
CREATE TABLE public.pdv_product_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pdv_product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pdv product options"
  ON public.pdv_product_options
  FOR ALL
  USING (
    product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
  )
  WITH CHECK (
    product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
  );

-- PDV Product Option Items table (mirrors delivery_product_option_items)
CREATE TABLE public.pdv_product_option_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID NOT NULL REFERENCES public.pdv_product_options(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pdv_product_option_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pdv product option items"
  ON public.pdv_product_option_items
  FOR ALL
  USING (
    option_id IN (
      SELECT po.id FROM public.pdv_product_options po
      JOIN public.pdv_products p ON p.id = po.product_id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    option_id IN (
      SELECT po.id FROM public.pdv_product_options po
      JOIN public.pdv_products p ON p.id = po.product_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add available_days to pdv_products and delivery_products
ALTER TABLE public.pdv_products ADD COLUMN IF NOT EXISTS available_days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.delivery_products ADD COLUMN IF NOT EXISTS available_days JSONB DEFAULT '[]'::jsonb;
