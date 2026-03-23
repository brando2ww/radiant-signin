-- Security definer function to get parent tenant IDs without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_parent_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.parent_tenant_id
  FROM public.tenants t
  WHERE t.parent_tenant_id IS NOT NULL
    AND (
      t.owner_user_id = auth.uid()
      OR t.id IN (
        SELECT eu.tenant_id FROM public.establishment_users eu
        WHERE eu.user_id = auth.uid() AND eu.is_active = true
      )
    )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can read parent tenant" ON public.tenants;

-- Recreate without recursion
CREATE POLICY "Users can read parent tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_parent_tenant_ids()));