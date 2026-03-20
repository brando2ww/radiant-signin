

## Adicionar Super Admin (adm@adm.com.br)

### Situação
O usuário `adm@adm.com.br` **não existe** no sistema ainda. Preciso criar o usuário no Auth e depois inserir na tabela `super_admins`.

### Solução

#### 1. Criar Edge Function `create-super-admin`
Uma edge function que usa a **service role key** para:
1. Criar o usuário no Auth (`admin.createUser`) com email `adm@adm.com.br` e senha `102030`
2. Inserir o `user_id` na tabela `super_admins`

Essa function será chamada uma única vez (ou por outro super admin no futuro).

#### Alternativa mais simples
Como é uma operação única, posso usar a edge function `create-establishment-user` existente como referência e criar o usuário diretamente via uma edge function temporária — ou melhor, usar o **SQL Editor do Supabase** para o insert após criar o usuário.

### Plano Final

| Passo | Ação |
|-------|------|
| 1 | Criar edge function `create-super-admin/index.ts` que aceita `{ email, password, name }` e cria o usuário + insere em `super_admins`. Protegida para ser chamada apenas se não existir nenhum super admin (bootstrap) ou por um super admin existente |
| 2 | Chamar a function via curl/test para criar o usuário `adm@adm.com.br` com senha `102030` |

### Arquivo

| Arquivo | Ação |
|---------|------|
| `supabase/functions/create-super-admin/index.ts` | **Criar** — edge function bootstrap para criar super admin |

A function verificará: se não existe nenhum super admin no banco, permite a criação sem autenticação (bootstrap). Se já existir algum, exige que o caller seja super admin.

