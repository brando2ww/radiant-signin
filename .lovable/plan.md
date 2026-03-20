

## Fix: RLS Error ao Criar Usuário

### Causa Raiz

Quando `supabase.auth.signUp()` é chamado no client, ele **troca a sessão** para o novo usuário. Na sequência, ao inserir na `establishment_users`, o `auth.uid()` já é o ID do **novo usuário**, não do proprietário. A policy exige `establishment_owner_id = auth.uid()`, causando a violação de RLS.

### Solução

Criar uma **Edge Function** `create-establishment-user` que usa a **service role key** para:
1. Criar o usuário no Auth (sem trocar a sessão do client)
2. Inserir na `establishment_users` com o owner_id correto

### Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/create-establishment-user/index.ts` | **Criar** - Edge function que recebe dados do usuário + owner_id do token JWT, cria no Auth com admin API e insere na establishment_users |
| `src/hooks/use-pdv-users.ts` | **Modificar** - Substituir `supabase.auth.signUp()` + insert por chamada à edge function |

### Fluxo

1. Client chama edge function com `{ display_name, email, phone, role, password }`
2. Edge function valida o JWT do proprietário (auth header)
3. Usa `supabase.auth.admin.createUser()` (service role) para criar sem trocar sessão
4. Insere na `establishment_users` com `establishment_owner_id` = uid do JWT
5. Retorna sucesso ao client

### Edge Function (resumo)

```typescript
// Valida JWT → extrai owner_id
// admin.createUser({ email, password, email_confirm: true })
// Insert establishment_users com owner_id do JWT
```

