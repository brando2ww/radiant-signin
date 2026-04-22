

## Definir senha na edição + excluir usuários

### O que existe hoje
- **Criar usuário**: já pede e-mail + senha (form em `UserForm.tsx`, edge function `create-establishment-user` cria a conta no `auth.users` e o vínculo em `establishment_users`).
- **Editar usuário**: o e-mail é bloqueado (correto — chave do auth) e **a senha não pode ser alterada**.
- **"Excluir"**: hoje só existe **Desativar/Reativar** (toggle de `is_active`) — não há exclusão definitiva nem do vínculo nem da conta de auth.

### O que muda

**1. Permitir o admin definir/alterar a senha de acesso na edição**

- `UserForm.tsx` (modo edição): mostrar uma seção **"Redefinir senha de acesso"** (opcional, aberta sob demanda):
  - Campos: `Nova senha` + `Confirmar nova senha` (mín. 6 caracteres).
  - Se ambos vazios → não muda a senha. Se preenchidos → manda para a edge function.
  - Validação inline igual ao fluxo de criação ("As senhas não conferem").
- `usePDVUsers.updateUser`: aceitar `password?: string` opcional. Quando vier, chamar uma edge function (não dá pra mudar senha pelo client) em vez do `update` direto.

**2. Edge function `update-establishment-user` (nova)**

- Recebe: `establishment_user_id`, `display_name`, `phone`, `role`, `discount_password`, `max_discount_percent`, `password?`.
- Valida que o caller é o `establishment_owner_id` desse vínculo (segurança — admin só mexe em quem é dele).
- Atualiza a linha em `establishment_users` (campos editáveis).
- Se `password` veio: `adminClient.auth.admin.updateUserById(user_id, { password })`.

**3. Edge function `delete-establishment-user` (nova) + UI de exclusão**

- Recebe: `establishment_user_id`.
- Valida que o caller é o `establishment_owner_id` do vínculo.
- Bloqueia exclusão do próprio caller (admin não pode se auto-excluir).
- Apaga a linha em `establishment_users` (remove o vínculo / acesso ao estabelecimento).
- Apaga a conta em `auth.users` via `adminClient.auth.admin.deleteUser(user_id)` (cascata limpa profile via FK existente).
- `usePDVUsers`: novo `mutation deleteUser` que invoca essa função.
- `UserCard.tsx`: novo item "Excluir" no menu, em vermelho (`text-destructive`), com `<AlertDialog>` de confirmação ("Esta ação é permanente. O usuário perderá acesso e os dados de vínculo serão apagados. Histórico de vendas/comandas é preservado.").
- `Users.tsx` / `UserForm.tsx`: passar `onDelete` para o card e botão "Excluir usuário" também no rodapé do form de edição.

### Segurança
- Ambas as edge functions validam o JWT, identificam o caller, e checam que `establishment_users.establishment_owner_id === caller.id` antes de qualquer mudança. Service role só é usada após essa checagem.
- Bloqueio explícito: caller não pode excluir/alterar a si mesmo via essas funções (continua existindo via auto-cadastro do tenant).
- Toggle desativar/reativar continua existindo (caso o admin queira só pausar acesso sem perder o vínculo).

### Fora de escopo
- Auditoria/log de quem alterou/excluiu (pode entrar em iteração futura).
- Forçar logout imediato de sessões já ativas do usuário cuja senha foi trocada (Supabase invalida o token na próxima renovação naturalmente).
- Mexer em comandas/vendas históricas geradas pelo usuário excluído — ficam com `created_by` apontando para um id que não existe mais (sem quebrar a UI, pois usamos display_name salvo nos registros).

