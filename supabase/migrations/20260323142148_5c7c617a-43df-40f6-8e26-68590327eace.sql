-- 1. Allow tenant members to read their own tenant's modules
CREATE POLICY "Tenant members can read own modules"
  ON public.tenant_modules FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT eu.tenant_id FROM public.establishment_users eu
      WHERE eu.user_id = auth.uid() AND eu.is_active = true AND eu.tenant_id IS NOT NULL
    )
    OR
    tenant_id IN (
      SELECT t.id FROM public.tenants t WHERE t.owner_user_id = auth.uid()
    )
  );

-- 2. Insert default modules for tenants that have none
INSERT INTO public.tenant_modules (tenant_id, module, is_active)
SELECT t.id, m.module, true
FROM public.tenants t
CROSS JOIN (VALUES ('pdv'), ('delivery'), ('financeiro'), ('avaliacoes')) AS m(module)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_modules tm WHERE tm.tenant_id = t.id
);