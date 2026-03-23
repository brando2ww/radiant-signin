

## Fix: "Módulo não disponível" após RLS policies

### Causa raiz

Antes das novas RLS policies, o usuário João Farias (que não é `owner_user_id` do tenant) **não conseguia ler** a tabela `tenants`. Isso fazia `tenantId` retornar `null`, e o `hasModule()` retornava `true` para tudo (fallback de "sem tenant = libera tudo").

Agora com as novas policies, o hook `useUserModules` encontra o `tenantId` via `establishment_users`, mas a tabela `tenant_modules` provavelmente **não tem** o módulo "pdv" cadastrado para esse tenant — ou o usuário não tem RLS para ler `tenant_modules`.

### Solução

Duas correções necessárias:

**1. RLS em `tenant_modules`** — adicionar policy para que membros do tenant possam ler os módulos do seu tenant:

```sql
CREATE POLICY "Tenant members can read own modules"
  ON public.tenant_modules FOR SELECT TO authenticated
  USING (tenant_id IN (
    SELECT tenant_id FROM public.establishment_users
    WHERE user_id = auth.uid() AND is_active = true AND tenant_id IS NOT NULL
  ));
```

**2. Garantir que `tenant_modules` tem os módulos cadastrados** — verificar via query se o tenant do João tem módulos. Se não tem, a migration deve inserir módulos padrão para tenants existentes que não tenham nenhum.

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Criar policy de leitura em `tenant_modules` para establishment_users + inserir módulos padrão (pdv, delivery, financeiro, avaliacoes) para tenants que não tenham nenhum |

