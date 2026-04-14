
CREATE TABLE public.pdv_product_compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  child_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 1,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_reference CHECK (parent_product_id != child_product_id),
  UNIQUE (parent_product_id, child_product_id)
);

ALTER TABLE public.pdv_product_compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own compositions"
  ON public.pdv_product_compositions FOR ALL TO authenticated
  USING (
    parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
    OR parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id IN (SELECT establishment_owner_id FROM public.establishment_users WHERE user_id = auth.uid() AND is_active = true))
  )
  WITH CHECK (
    parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
    OR parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id IN (SELECT establishment_owner_id FROM public.establishment_users WHERE user_id = auth.uid() AND is_active = true))
  );

ALTER TABLE public.pdv_products
  ADD COLUMN IF NOT EXISTS is_composite boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_deduction_mode text DEFAULT 'main';
