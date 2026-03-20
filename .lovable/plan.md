

## Redesign do Painel Super Admin com Sidebar

### Situação Atual
O painel super admin usa um layout simples com header e conteúdo centralizado. Só tem a seção de Tenants.

### Proposta
Transformar em um painel administrativo completo com **sidebar fixa**, **dashboard com métricas**, e seções organizadas.

### Estrutura da Sidebar

```text
┌─────────────────┐
│  Velaro Admin    │
├─────────────────┤
│  Dashboard       │
│  Tenants         │
│  Planos          │
│                  │
│ ──────────────── │
│  SA (avatar)     │
│  Sair            │
└─────────────────┘
```

### Páginas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | Dashboard | Cards com total de tenants, tenants ativos, total de usuários, módulos mais usados |
| `/admin/tenants` | Tenants | Lista existente (já pronta) |
| `/admin/tenants/novo` | TenantForm | Formulário existente (já pronto) |
| `/admin/tenants/:id` | TenantDetail | Detalhe existente (já pronto) |
| `/admin/planos` | Plans | Gerenciar planos disponíveis (visualização dos planos de `data/plans.ts`) |

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/ui/sidebar.tsx` | **Criar** — componente Shadcn Sidebar |
| `src/components/NavLink.tsx` | **Criar** — NavLink com activeClassName |
| `src/components/super-admin/AdminSidebar.tsx` | **Criar** — Sidebar com itens: Dashboard, Tenants, Planos + logout |
| `src/pages/SuperAdmin.tsx` | **Reescrever** — Usar SidebarProvider + AdminSidebar + content area (remover header atual) |
| `src/pages/super-admin/AdminDashboard.tsx` | **Criar** — Dashboard com métricas: total tenants, ativos, total usuários, módulos mais usados |
| `src/pages/super-admin/Plans.tsx` | **Criar** — Visualização dos planos do sistema |

### Dashboard (métricas)
- Total de Tenants
- Tenants Ativos
- Total de Usuários (soma de establishment_users)
- Módulos mais habilitados (contagem por módulo em tenant_modules)

### Layout
```text
┌──────────┬────────────────────────────┐
│          │  Header (trigger + título) │
│ Sidebar  ├────────────────────────────┤
│          │                            │
│          │  Conteúdo da página        │
│          │                            │
└──────────┴────────────────────────────┘
```

