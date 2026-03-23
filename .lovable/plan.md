

## Fix: Garçom não vê mesas nem produtos — RLS bloqueando staff

### Diagnóstico

Todas as tabelas PDV (`pdv_tables`, `pdv_products`, `pdv_orders`, `pdv_comandas`, `pdv_comanda_items`, `pdv_sectors`) têm RLS policies que verificam apenas `auth.uid() = user_id`. 

O hook `useEstablishmentId` resolve o `visibleUserId` (ID do dono) corretamente no frontend, mas o **banco de dados bloqueia** a query porque o `auth.uid()` do garçom é diferente do `user_id` do dono.

### Solução

Criar uma **function SQL `is_establishment_member`** que verifica se o usuário autenticado é membro ativo do estabelecimento de um dado owner. Depois, atualizar as RLS policies das tabelas afetadas para permitir acesso tanto ao dono quanto aos seus staff members.

### Mudanças

**1. Migration SQL** — nova function + policies atualizadas:

```sql
-- Function para verificar se o usuário é membro do estabelecimento
CREATE OR REPLACE FUNCTION public.is_establishment_member(owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM establishment_users
    WHERE user_id = auth.uid()
      AND establishment_owner_id = owner_id
      AND is_active = true
  )
$$;
```

**2. Atualizar RLS policies** nas seguintes tabelas para usar `OR is_establishment_member(user_id)`:

| Tabela | Policy atual | Nova condição |
|--------|-------------|---------------|
| `pdv_tables` | `auth.uid() = user_id` | `auth.uid() = user_id OR is_establishment_member(user_id)` |
| `pdv_products` | `auth.uid() = user_id` | `auth.uid() = user_id OR is_establishment_member(user_id)` |
| `pdv_orders` | `auth.uid() = user_id` | `auth.uid() = user_id OR is_establishment_member(user_id)` |
| `pdv_comandas` | `auth.uid() = user_id` | `auth.uid() = user_id OR is_establishment_member(user_id)` |
| `pdv_comanda_items` | Joins com `pdv_comandas` | Mesma lógica (herda via join) |
| `pdv_sectors` | `auth.uid() = user_id` | `auth.uid() = user_id OR is_establishment_member(user_id)` |

Para tabelas com policy `ALL`, será necessário separar em SELECT (leitura ampla) e INSERT/UPDATE/DELETE (restrito ao dono) para que staff possa **ler** mas não **criar/deletar** recursos indevidamente — ou manter `ALL` se o garçom precisa criar comandas/pedidos.

**3. Nenhuma mudança no frontend** — os hooks já usam `visibleUserId` corretamente.

### Segurança

- `SECURITY DEFINER` na function evita recursão de RLS ao consultar `establishment_users`
- Staff só pode acessar dados do owner ao qual está vinculado (multi-tenant seguro)
- Staff com role `garcom` pode criar comandas e comanda_items (necessário para o fluxo)

