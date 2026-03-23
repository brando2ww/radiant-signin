
-- 1. Establishment users can read their own tenant
CREATE POLICY "Establishment users can read own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (
    SELECT tenant_id FROM public.establishment_users
    WHERE user_id = auth.uid() AND is_active = true AND tenant_id IS NOT NULL
  ));

-- 2. Users can read parent tenant (for franchise hierarchy)
CREATE POLICY "Users can read parent tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (
    SELECT t.parent_tenant_id FROM public.tenants t
    WHERE t.parent_tenant_id IS NOT NULL
      AND (t.owner_user_id = auth.uid() OR t.id IN (
        SELECT eu.tenant_id FROM public.establishment_users eu
        WHERE eu.user_id = auth.uid() AND eu.is_active = true
      ))
  ));

-- 3. Tenant members can read shared products for their tenant
CREATE POLICY "Tenant members can read shared products"
  ON public.shared_products FOR SELECT TO authenticated
  USING (target_tenant_id IN (
    SELECT tenant_id FROM public.establishment_users
    WHERE user_id = auth.uid() AND is_active = true AND tenant_id IS NOT NULL
  ));

-- 4. Tenant members can read shared table layouts for their tenant
CREATE POLICY "Tenant members can read shared table layouts"
  ON public.shared_table_layouts FOR SELECT TO authenticated
  USING (target_tenant_id IN (
    SELECT tenant_id FROM public.establishment_users
    WHERE user_id = auth.uid() AND is_active = true AND tenant_id IS NOT NULL
  ));
