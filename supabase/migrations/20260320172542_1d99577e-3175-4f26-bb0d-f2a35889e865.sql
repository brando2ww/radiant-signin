
-- 1. Add tenant_id column to establishment_users first (no FK yet)
ALTER TABLE public.establishment_users ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- 2. Table super_admins
CREATE TABLE public.super_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Table tenants
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document text,
  owner_user_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- 4. Table tenant_modules
CREATE TABLE public.tenant_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  module text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, module)
);

-- 5. FK on establishment_users
ALTER TABLE public.establishment_users
  ADD CONSTRAINT establishment_users_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;

-- 6. Function is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE user_id = auth.uid()
  )
$$;

-- 7. RLS super_admins
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins can read super_admins"
  ON public.super_admins FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- 8. RLS tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins full access tenants"
  ON public.tenants FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
CREATE POLICY "Tenant owner can read own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

-- 9. RLS tenant_modules
ALTER TABLE public.tenant_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins full access tenant_modules"
  ON public.tenant_modules FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
CREATE POLICY "Tenant users can read own modules"
  ON public.tenant_modules FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT t.id FROM public.tenants t WHERE t.owner_user_id = auth.uid())
    OR
    tenant_id IN (SELECT eu.tenant_id FROM public.establishment_users eu WHERE eu.user_id = auth.uid() AND eu.is_active = true AND eu.tenant_id IS NOT NULL)
  );

-- 10. Trigger
CREATE TRIGGER handle_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
