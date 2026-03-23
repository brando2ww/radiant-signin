

## Fix: RLS policies para Franquia funcionar no PDV

### Problema
João Farias não consegue ver dados da franquia porque as políticas RLS bloqueiam:
1. **`tenants`**: SELECT só permite `owner_user_id = auth.uid()` — não consegue ler o tenant pai (matriz)
2. **`shared_products`** e **`shared_table_layouts`**: só super admins podem acessar — franquias não conseguem ler/escrever
3. Resultado: hook retorna `tenantId` mas não consegue ler `parent_tenant_id`, então mostra "Sem conexão"

### Solução
Criar migration com novas RLS policies:

| Tabela | Nova Policy | Lógica |
|--------|-------------|--------|
| `tenants` | "Establishment users can read own tenant" | SELECT onde `id` está no `tenant_id` do `establishment_users` do user |
| `tenants` | "Users can read parent tenant" | SELECT onde `id` é o `parent_tenant_id` de um tenant que o user já pode ler |
| `shared_products` | "Tenant members can read shared products" | SELECT onde `target_tenant_id` é o tenant do user |
| `shared_table_layouts` | "Tenant members can read shared table layouts" | SELECT onde `target_tenant_id` é o tenant do user |

### Arquivo

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Adicionar 4 novas RLS policies permitindo leitura para membros do tenant |

### Detalhes das Policies

```sql
-- 1. Establishment users can read their own tenant
CREATE POLICY "Establishment users can read own tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (
    SELECT tenant_id FROM public.establishment_users
    WHERE user_id = auth.uid() AND is_active = true AND tenant_id IS NOT NULL
  ));

-- 2. Users can read parent tenant (for franchise)
CREATE POLICY "Users can read parent tenant"
  ON public.tenants FOR SELECT TO authenticated
  USING (id IN (
    SELECT parent_tenant_id FROM public.tenants
    WHERE owner_user_id = auth.uid() OR id IN (
      SELECT tenant_id FROM public.establishment_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  ));

-- 3-4. Tenant members can read shared data
CREATE POLICY "Tenant members can read shared products"
  ON public.shared_products FOR SELECT TO authenticated
  USING (target_tenant_id IN (...user's tenant...));

CREATE POLICY "Tenant members can read shared table layouts"
  ON public.shared_table_layouts FOR SELECT TO authenticated
  USING (target_tenant_id IN (...user's tenant...));
```

Isso permite que qualquer membro ativo de um tenant leia: seu próprio tenant, o tenant pai (matriz), e os registros de compartilhamento associados — sem expor dados de outros tenants.

