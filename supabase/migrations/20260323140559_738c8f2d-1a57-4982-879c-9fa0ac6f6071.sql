
-- 1. Add parent_tenant_id to tenants for franchise hierarchy
ALTER TABLE public.tenants
  ADD COLUMN parent_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 2. Shared products table
CREATE TABLE public.shared_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  cloned_product_id uuid REFERENCES public.pdv_products(id) ON DELETE SET NULL,
  sync_enabled boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_product_id, target_tenant_id)
);

ALTER TABLE public.shared_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage shared products"
  ON public.shared_products FOR ALL TO authenticated
  USING (public.is_super_admin());

-- 3. Shared table layouts
CREATE TABLE public.shared_table_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source_table_id uuid NOT NULL REFERENCES public.pdv_tables(id) ON DELETE CASCADE,
  cloned_table_id uuid REFERENCES public.pdv_tables(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_table_id, target_tenant_id)
);

ALTER TABLE public.shared_table_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage shared table layouts"
  ON public.shared_table_layouts FOR ALL TO authenticated
  USING (public.is_super_admin());
