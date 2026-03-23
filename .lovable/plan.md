

## Painel de Gestão do Tenant (Super Admin)

### O que será feito
Expandir a página `TenantDetail.tsx` para permitir ao super admin gerenciar completamente um tenant: editar usuários, configurar módulos e autorizar integrações.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-tenants.ts` | Adicionar mutations: `updateTenantUser` (editar role, is_active, max_discount_percent, discount_password), `updateTenantModules` (ativar/desativar módulos), `updateTenantIntegrations` (salvar integrações autorizadas no tenant) |
| `src/pages/super-admin/TenantDetail.tsx` | Reescrever com seções expandidas: (1) Card de módulos com toggles editáveis, (2) Card de integrações autorizadas com checkboxes, (3) Card de usuários com ações de editar/ativar/desativar inline, (4) Dialog para editar usuário (role, desconto máximo, senha desconto, ativo) |
| `supabase migration` | Criar tabela `tenant_integrations` (tenant_id, integration_slug, is_active, created_at) para registrar quais integrações cada tenant pode usar |

### Detalhes

**1. Módulos editáveis** — Reutilizar `ModuleSelector` com toggle para ativar/desativar módulos do tenant. Salva via update em `tenant_modules`.

**2. Integrações autorizadas** — Nova tabela `tenant_integrations`:
```sql
CREATE TABLE public.tenant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  integration_slug text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, integration_slug)
);
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage tenant integrations"
  ON public.tenant_integrations FOR ALL TO authenticated
  USING (public.is_super_admin());
```
Lista de integrações: PagSeguro, Stone, Getnet, Rede, NF Automática, Goomer, WhatsApp, Delivery Próprio — checkboxes no card.

**3. Usuários expandidos** — Cada usuário mostra: nome, email, telefone, role, status, desconto máximo. Botões de ação:
- **Editar**: Dialog inline com campos role (select), max_discount_percent (input 0-100%), discount_password, is_active (switch)
- **Ativar/Desativar**: Toggle rápido

**4. Hook `use-tenants.ts`** — Adicionar:
- `updateTenantUser`: update em `establishment_users` por id
- `toggleTenantModule`: update `is_active` em `tenant_modules`
- `fetchTenantIntegrations` / `saveTenantIntegrations`: CRUD em `tenant_integrations`

### Layout do TenantDetail (atualizado)

```text
┌─────────────────────────────────────┐
│ ← Restaurante DEMO                 │
│   CNPJ · Ativo                      │
├─────────────────────────────────────┤
│ Módulos Habilitados        [Salvar] │
│ ☑ PDV  ☐ Delivery  ☐ Financeiro... │
├─────────────────────────────────────┤
│ Integrações Autorizadas    [Salvar] │
│ ☑ PagSeguro ☑ Stone ☐ Getnet ...   │
├─────────────────────────────────────┤
│ Usuários (2)                        │
│ ┌─────────────────────────────────┐ │
│ │ João · joao@email · Proprietário│ │
│ │ Desconto max: 100% · Ativo  [⋮]│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Informações                         │
│ Criado em: ...  Atualizado em: ...  │
└─────────────────────────────────────┘
```

