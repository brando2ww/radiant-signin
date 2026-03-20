

## Fix: Garçom Vê Tudo — RLS Bloqueando Consulta de Role

### Causa Raiz

A política RLS da tabela `establishment_users` só permite SELECT quando `establishment_owner_id = auth.uid()`. Quando o garçom faz login, seu `auth.uid()` é o `user_id` (não o `establishment_owner_id`), então a query retorna zero linhas. O hook interpreta isso como "não tem registro → é proprietário" e dá acesso total.

### Solução

Adicionar uma nova política RLS que permite usuários lerem **seu próprio registro** na tabela `establishment_users`.

### Migração SQL

```sql
CREATE POLICY "Users can view their own record"
ON public.establishment_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

Isso permite que o garçom (ou qualquer role) consulte seu próprio registro para descobrir seu papel, sem dar acesso aos registros de outros usuários.

### Arquivos

| Arquivo | Ação |
|---------|------|
| Nova migração SQL | Adicionar policy `user_id = auth.uid()` para SELECT em `establishment_users` |

Nenhuma mudança no código TypeScript é necessária — o hook `use-user-role.ts` já faz a query correta, só falta a permissão RLS para o próprio usuário ler seu registro.

