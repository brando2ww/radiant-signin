-- Function that returns child tenant IDs for the current user (as parent owner)
CREATE OR REPLACE FUNCTION public.get_user_child_tenant_ids()
RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id
  FROM public.tenants t
  WHERE t.parent_tenant_id IN (
    SELECT t2.id FROM public.tenants t2
    WHERE t2.owner_user_id = auth.uid()
  )
$$;

-- Policy: parent tenant owner can read child tenants
CREATE POLICY "Parent owners can read child tenants"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_child_tenant_ids()));