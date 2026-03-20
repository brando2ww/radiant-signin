

## Sistema de Super Admin com Multi-Tenancy

### Arquitetura Atual vs. Proposta

Hoje o sistema assume que quem se cadastra é o "proprietario" do estabelecimento. Não existe conceito de tenant nem super admin. A tabela `user_modules` controla módulos mas está com bypass hardcoded.

A proposta cria uma camada acima: **Super Admin** gerencia **Tenants (empresas)**, define quais módulos cada tenant tem, e cria o usuário administrador (proprietário) de cada tenant.

```text
Super Admin
  └── Tenant (Empresa A)
       ├── Módulos ativos: [pdv, delivery, financeiro]
       └── Usuários
            ├── Proprietário (admin do tenant)
            ├── Gerente
            ├── Garçom
            └── ...
  └── Tenant (Empresa B)
       ├── Módulos ativos: [pdv]
       └── Usuários
            └── Proprietário
```

### Migração SQL

1. **Tabela `tenants`** — representa cada empresa/estabelecimento
   - `id`, `name`, `document` (CNPJ/CPF), `owner_user_id` (o proprietário), `is_active`, `created_at`, `created_by` (super admin que criou)

2. **Tabela `tenant_modules`** — módulos habilitados por tenant
   - `id`, `tenant_id`, `module` (user_module enum), `is_active`, `expires_at`, `created_at`

3. **Tabela `super_admins`** — controle de quem é super admin (tabela separada, conforme boas práticas de segurança)
   - `id`, `user_id` (references auth.users), `created_at`
   - RLS: só super admins podem ler

4. **Função `is_super_admin()`** — SECURITY DEFINER para verificar se o usuário logado é super admin

5. **Adicionar `tenant_id`** na tabela `establishment_users` para vincular usuários ao tenant

6. **RLS policies** em `tenants`, `tenant_modules`, `super_admins` usando a função `is_super_admin()`

### Páginas e Componentes (Super Admin)

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/SuperAdmin.tsx` | Layout principal do painel super admin com sidebar/nav |
| `src/pages/super-admin/Tenants.tsx` | Lista de tenants com filtros, status, busca |
| `src/pages/super-admin/TenantForm.tsx` | Página para criar/editar tenant: nome, CNPJ, módulos ativos, criar usuário proprietário (email + senha) |
| `src/pages/super-admin/TenantDetail.tsx` | Detalhe do tenant: info, módulos, lista de usuários, ações |
| `src/components/super-admin/TenantCard.tsx` | Card do tenant na listagem |
| `src/components/super-admin/ModuleSelector.tsx` | Seletor de módulos (checkboxes) para definir quais funcionalidades o tenant terá |
| `src/hooks/use-super-admin.ts` | Hook para verificar se é super admin |
| `src/hooks/use-tenants.ts` | Hook CRUD de tenants |

### Modificações em Arquivos Existentes

| Arquivo | Mudança |
|---------|---------|
| `src/App.tsx` | Adicionar rota `/admin/*` protegida por `SuperAdminGuard` |
| `src/pages/Index.tsx` | Após login, verificar se é super admin → redirecionar para `/admin` em vez de `/pdv` |
| `src/components/ModuleGuard.tsx` | Remover bypass hardcoded; consultar `tenant_modules` do tenant do usuário logado |
| `src/hooks/use-user-modules.ts` | Alterar para consultar `tenant_modules` via tenant_id do usuário |

### Edge Function `create-tenant`

Necessária para criar tenant + usuário proprietário atomicamente (usando service role):
1. Recebe: `{ name, document, modules[], admin_email, admin_password, admin_name }`
2. Valida que o caller é super admin
3. Cria usuário no Auth com `admin.createUser()`
4. Insere na tabela `tenants` com `owner_user_id`
5. Insere módulos em `tenant_modules`
6. Insere na `establishment_users` com role `proprietario` e `tenant_id`

### Fluxo do Super Admin

1. Super admin faz login normal (mesma tela de login)
2. Sistema detecta que é super admin → redireciona para `/admin`
3. Na página `/admin/tenants` vê lista de empresas cadastradas
4. Clica "Novo Tenant" → preenche dados da empresa, seleciona módulos, cria usuário admin
5. O proprietário do tenant faz login e só vê os módulos habilitados pelo super admin

### Como Criar o Primeiro Super Admin

Será inserido diretamente no banco via SQL (não via UI), pois é uma operação única e de segurança:
```sql
INSERT INTO super_admins (user_id) VALUES ('<seu-user-id>');
```

### Arquivos Totais

| Arquivo | Ação |
|---------|------|
| Migração SQL | Criar tabelas `tenants`, `tenant_modules`, `super_admins` + RLS + função `is_super_admin` |
| `supabase/functions/create-tenant/index.ts` | Criar edge function |
| `src/pages/SuperAdmin.tsx` | Criar layout super admin |
| `src/pages/super-admin/Tenants.tsx` | Criar listagem de tenants |
| `src/pages/super-admin/TenantForm.tsx` | Criar formulário tenant + admin |
| `src/pages/super-admin/TenantDetail.tsx` | Criar detalhe do tenant |
| `src/components/super-admin/TenantCard.tsx` | Criar card |
| `src/components/super-admin/ModuleSelector.tsx` | Criar seletor de módulos |
| `src/hooks/use-super-admin.ts` | Criar hook |
| `src/hooks/use-tenants.ts` | Criar hook CRUD |
| `src/App.tsx` | Adicionar rotas `/admin/*` |
| `src/pages/Index.tsx` | Redirecionamento condicional |
| `src/components/ModuleGuard.tsx` | Integrar com tenant_modules |
| `src/hooks/use-user-modules.ts` | Consultar tenant_modules |

