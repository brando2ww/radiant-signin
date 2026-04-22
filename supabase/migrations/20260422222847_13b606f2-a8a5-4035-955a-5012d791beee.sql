-- Allow staff (linked via is_establishment_member) to view product options of their establishment owner

CREATE POLICY "Staff can view product options"
  ON public.pdv_product_options
  FOR SELECT
  TO authenticated
  USING (
    product_id IN (
      SELECT id FROM public.pdv_products
      WHERE public.is_establishment_member(user_id)
    )
  );

CREATE POLICY "Staff can view product option items"
  ON public.pdv_product_option_items
  FOR SELECT
  TO authenticated
  USING (
    option_id IN (
      SELECT po.id
      FROM public.pdv_product_options po
      JOIN public.pdv_products p ON p.id = po.product_id
      WHERE public.is_establishment_member(p.user_id)
    )
  );