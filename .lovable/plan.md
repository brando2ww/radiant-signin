

## Fix: RLS policy para tenant matriz ler seus filhos

### Causa raiz

João Farias é owner do "Restaurante DEMO" (matriz). Quando o hook busca `childTenants` com `SELECT * FROM tenants WHERE parent_tenant_id = tenantId`, o RLS bloqueia porque nenhuma policy permite ao owner da matriz ler os tenants filhos.

Policies atuais na tabela `tenants`:
- "Tenant owner can read own tenant" — só o próprio tenant
- "Users can read parent tenant" — só o tenant pai (direção inversa)
- "Establishment users can read own tenant" — só tenants onde é membro
- "Super admins full access" — só super admins

Falta: **owner da matriz pode ler filhos**.

### Solução

Criar uma **security definer function** (para evitar recursão RLS) e uma nova policy.

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Criar function `get_user_child_tenant_ids()` + policy "Parent owners can read child tenants" |

### SQL

```sql
-- Function que retorna IDs dos tenants filhos do usuário atual
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

-- Policy: owner da matriz pode ler tenants filhos
CREATE POLICY "Parent owners can read child tenants"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_child_tenant_ids()));
```

Isso permite que João (owner de Restaurante DEMO) leia "Koten Sushi" (que tem `parent_tenant_id` apontando para o tenant dele), desbloqueando a query `childTenants` no hook e mostrando a view de matriz.

Também preciso registrar a nova function no `types.ts` do Supabase.

