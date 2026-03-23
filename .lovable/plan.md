

## Fix: Tenants desapareceram — recursão infinita no RLS

### Causa raiz
A policy "Users can read parent tenant" faz `SELECT ... FROM tenants t` dentro de uma policy na própria tabela `tenants`. Isso causa recursão infinita no PostgreSQL, que bloqueia a query inteira — inclusive para super admins.

### Solução
1. Criar uma **security definer function** que busca o `parent_tenant_id` sem passar pelo RLS
2. Dropar a policy problemática
3. Recriar a policy usando a function segura

### Mudança

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Criar function `get_user_parent_tenant_ids()`, dropar policy recursiva, recriar sem recursão |

### SQL

```sql
-- Function que busca parent_tenant_ids sem RLS
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

-- Dropar policy recursiva
DROP POLICY IF EXISTS "Users can read parent tenant" ON public.tenants;

-- Recriar sem recursão
CREATE POLICY "Users can read parent tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_parent_tenant_ids()));
```

Isso elimina a recursão e restaura a listagem de tenants para super admins e todos os usuários.

