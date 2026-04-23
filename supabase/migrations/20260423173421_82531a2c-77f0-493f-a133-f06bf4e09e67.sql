-- 1. Permitir staff atualizar mesas
CREATE POLICY "Staff can update tables"
  ON public.pdv_tables
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));