

## Fix: Garçom não vê mesas e itens (problema de user_id)

### Problema

Todos os hooks de dados (mesas, produtos, comandas, pedidos, etc.) filtram por `user_id = auth.user.id`. Quando o garçom (juliano@demo.com.br) faz login, seu `user.id` é diferente do proprietário (demo@demo.com.br). Como mesas e produtos foram criados pelo proprietário, o garçom não vê nada.

### Solução

Criar um hook `useEstablishmentId` que resolve o "user_id efetivo" (o dono do estabelecimento):
- Se o usuário é proprietário → retorna `user.id`
- Se é funcionário (garçom, caixa, etc.) → busca `establishment_owner_id` da tabela `establishment_users`

Depois, substituir `user.id` por esse ID efetivo nos hooks que o garçom precisa acessar.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-establishment-id.ts` | **Criar** — Hook que consulta `establishment_users` para resolver o `establishment_owner_id` do usuário logado. Retorna `{ visibleUserId, isLoading }` |
| `src/hooks/use-pdv-tables.ts` | Substituir `user.id` por `visibleUserId` do novo hook nas queries de leitura |
| `src/hooks/use-pdv-products.ts` | Idem — usar `visibleUserId` na query de leitura |
| `src/hooks/use-pdv-comandas.ts` | Idem — usar `visibleUserId` nas queries de leitura |
| `src/hooks/use-pdv-orders.ts` | Idem — usar `visibleUserId` nas queries de leitura |
| `src/hooks/use-pdv-kitchen.ts` | Idem — usar `visibleUserId` na query de leitura |

### Hook `useEstablishmentId`

```typescript
// Busca establishment_owner_id se o usuário for funcionário
// Se não encontrar registro em establishment_users, assume que é o próprio dono
const { data } = useQuery({
  queryKey: ["establishment-id", user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from("establishment_users")
      .select("establishment_owner_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();
    return data?.establishment_owner_id || user.id;
  }
});
```

### Escopo

Apenas queries de **leitura** serão alteradas. Mutations de criação (inserir comanda, enviar para cozinha) continuam usando `user.id` — o RLS do Supabase precisa ser compatível, mas isso é um passo futuro. O foco agora é **visualização**.

