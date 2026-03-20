

## Melhorar Modal de Usuário + Campo de Senha

### Mudanças

#### 1. `src/components/pdv/users/UserDialog.tsx`
Redesenhar o modal com layout mais polido e adicionar campo de senha:

- **Layout em duas colunas** (desktop): dados pessoais à esquerda, seleção de role à direita
- **Campos de dados pessoais**: Nome (required), E-mail (required ao criar), Telefone
- **Campo de Senha** (apenas ao criar novo usuário, não ao editar): campo de senha com toggle de visibilidade (eye icon), mínimo 6 caracteres
- **Campo Confirmar Senha**: validação de match
- **Seleção de role**: cards mais compactos com ícone colorido do role + nome + descrição curta
- **Seção de permissões**: colapsável ou em accordion, mostrando as permissões do role selecionado
- **Validação**: email obrigatório ao criar, senha obrigatória ao criar com mínimo 6 chars, confirmação de senha deve conferir

#### 2. `src/hooks/use-pdv-users.ts`
- Atualizar `createUser` para aceitar `password` no payload
- Usar `supabase.auth.signUp()` para criar o usuário real no Supabase Auth com email + senha
- Após signup, usar o `user.id` retornado para inserir na `establishment_users` (substituindo o placeholder `user.id`)

#### 3. `src/pages/pdv/Users.tsx`
- Passar `password` no `onSave` data type

### Interface Atualizada do onSave

```typescript
onSave: (data: {
  display_name: string;
  email: string;
  phone: string;
  role: string;
  password?: string; // apenas ao criar
}) => void;
```

### Fluxo de Criação

1. Proprietário preenche nome, email, telefone, senha, role
2. `supabase.auth.signUp({ email, password, options: { data: { full_name } } })` cria o usuário no Auth
3. Insere na `establishment_users` com o `user_id` real retornado pelo signup
4. Toast de sucesso

### Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/users/UserDialog.tsx` | Redesign completo: 2 colunas, campo senha + confirmar senha com toggle, validação, ícones nos roles |
| `src/hooks/use-pdv-users.ts` | createUser usa `supabase.auth.signUp` + insere na establishment_users com user_id real |
| `src/pages/pdv/Users.tsx` | Tipagem atualizada para incluir password |

