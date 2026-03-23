-- Function to check if authenticated user is a staff member of the given owner
CREATE OR REPLACE FUNCTION public.is_establishment_member(owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM establishment_users
    WHERE user_id = auth.uid()
      AND establishment_owner_id = owner_id
      AND is_active = true
  )
$$;

-- pdv_tables: staff reads, owner manages
DROP POLICY IF EXISTS "Gestão de mesas" ON public.pdv_tables;
CREATE POLICY "Staff can view tables" ON public.pdv_tables
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));
CREATE POLICY "Owner can manage tables" ON public.pdv_tables
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- pdv_products: staff reads, owner manages
DROP POLICY IF EXISTS "Gestão de produtos PDV" ON public.pdv_products;
CREATE POLICY "Staff can view products" ON public.pdv_products
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));
CREATE POLICY "Owner can manage products" ON public.pdv_products
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- pdv_sectors: staff reads, owner manages
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios setores" ON public.pdv_sectors;
CREATE POLICY "Staff can view sectors" ON public.pdv_sectors
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id));
CREATE POLICY "Owner can manage sectors" ON public.pdv_sectors
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- pdv_comandas: staff needs full access (create/update comandas)
DROP POLICY IF EXISTS "Users can manage their own comandas" ON public.pdv_comandas;
CREATE POLICY "Staff can manage comandas" ON public.pdv_comandas
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));

-- pdv_comanda_items: staff needs full access
DROP POLICY IF EXISTS "Users can view items from their comandas" ON public.pdv_comanda_items;
DROP POLICY IF EXISTS "Users can insert items to their comandas" ON public.pdv_comanda_items;
DROP POLICY IF EXISTS "Users can update items from their comandas" ON public.pdv_comanda_items;
DROP POLICY IF EXISTS "Users can delete items from their comandas" ON public.pdv_comanda_items;
CREATE POLICY "Staff can view comanda items" ON public.pdv_comanda_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pdv_comandas
    WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
      AND (pdv_comandas.user_id = auth.uid() OR public.is_establishment_member(pdv_comandas.user_id))
  ));
CREATE POLICY "Staff can insert comanda items" ON public.pdv_comanda_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM pdv_comandas
    WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
      AND (pdv_comandas.user_id = auth.uid() OR public.is_establishment_member(pdv_comandas.user_id))
  ));
CREATE POLICY "Staff can update comanda items" ON public.pdv_comanda_items
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pdv_comandas
    WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
      AND (pdv_comandas.user_id = auth.uid() OR public.is_establishment_member(pdv_comandas.user_id))
  ));
CREATE POLICY "Staff can delete comanda items" ON public.pdv_comanda_items
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pdv_comandas
    WHERE pdv_comandas.id = pdv_comanda_items.comanda_id
      AND (pdv_comandas.user_id = auth.uid() OR public.is_establishment_member(pdv_comandas.user_id))
  ));

-- pdv_orders: staff needs full access (create orders)
DROP POLICY IF EXISTS "Gestão de pedidos PDV" ON public.pdv_orders;
CREATE POLICY "Staff can manage orders" ON public.pdv_orders
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.is_establishment_member(user_id))
  WITH CHECK (auth.uid() = user_id OR public.is_establishment_member(user_id));