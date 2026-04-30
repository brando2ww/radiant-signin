CREATE TABLE public.pdv_invoice_item_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplier_id UUID REFERENCES public.pdv_suppliers(id) ON DELETE CASCADE,
  supplier_cnpj TEXT,
  product_code TEXT,
  product_ean TEXT,
  ingredient_id UUID NOT NULL REFERENCES public.pdv_ingredients(id) ON DELETE CASCADE,
  times_used INT NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX pdv_invoice_item_links_unique
  ON public.pdv_invoice_item_links (user_id, COALESCE(supplier_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(product_code,''), COALESCE(product_ean,''));

CREATE INDEX pdv_invoice_item_links_lookup
  ON public.pdv_invoice_item_links (user_id, supplier_id);

ALTER TABLE public.pdv_invoice_item_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner read invoice item links"
  ON public.pdv_invoice_item_links FOR SELECT
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "owner insert invoice item links"
  ON public.pdv_invoice_item_links FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "owner update invoice item links"
  ON public.pdv_invoice_item_links FOR UPDATE
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));

CREATE POLICY "owner delete invoice item links"
  ON public.pdv_invoice_item_links FOR DELETE
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));