

## Página de Clientes Centralizada

### Conceito

Nova página `/pdv/clientes` que unifica em uma única tela:

- **Clientes** — cadastrados manualmente (tabela `pdv_customers`) + vindos do delivery (`delivery_customers`)
- **Leads** — vindos das avaliações (`customer_evaluations`)

A página terá duas abas: **Clientes** e **Leads**, com busca, filtros e CRUD para clientes manuais.

### Fontes de dados

| Origem | Tabela | Dados principais |
|--------|--------|-----------------|
| PDV (manual) | `pdv_customers` | nome, phone, cpf, email, birth_date, total_spent, visit_count |
| Delivery | `delivery_customers` | phone, name, email, cpf, birth_date |
| Avaliações (leads) | `customer_evaluations` | customer_name, customer_whatsapp, customer_birth_date, nps_score |

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-pdv-customers.ts` | Expandir com CRUD completo (create, update, delete) + query de delivery_customers + query de leads (customer_evaluations agrupados) |
| `src/pages/pdv/Customers.tsx` | Nova página com abas Clientes / Leads |
| `src/components/pdv/CustomerCard.tsx` | Card de cliente com origem (PDV/Delivery), dados e ações |
| `src/components/pdv/CustomerDialog.tsx` | Dialog para criar/editar cliente manual |
| `src/components/pdv/CustomerFilters.tsx` | Busca + filtro por origem (PDV/Delivery/Todos) |
| `src/components/pdv/LeadCard.tsx` | Card de lead com NPS, WhatsApp, data |
| `src/pages/PDV.tsx` | Adicionar rota `/pdv/clientes` |
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar "Clientes" no menu Administrador |
| `src/hooks/use-user-role.ts` | Adicionar `/pdv/clientes` nas rotas de gerente |

### UI — Aba Clientes

```text
┌─────────────────────────────────────────────────────┐
│ Clientes                          [+ Novo Cliente]  │
│ Gerencie todos os clientes do estabelecimento       │
├─────────────────────────────────────────────────────┤
│ [Clientes]  [Leads]                                 │
├─────────────────────────────────────────────────────┤
│ 🔍 Buscar...     Origem: [Todos ▾]                  │
│ 15 clientes encontrados                             │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ João S.  │ │ Maria L. │ │ Pedro R. │             │
│ │ PDV      │ │ Delivery │ │ PDV      │             │
│ │ (54)...  │ │ (11)...  │ │ (21)...  │             │
│ │ R$1.250  │ │ 3 ped.   │ │ R$890    │             │
│ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

### UI — Aba Leads

```text
┌─────────────────────────────────────────────────────┐
│ [Clientes]  [Leads]                                 │
├─────────────────────────────────────────────────────┤
│ 🔍 Buscar...                                        │
│ 8 leads capturados via avaliações                   │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐    │
│ │ Ana Costa  │ (54) 99653-5731 │ NPS: 9 🟢    │    │
│ │ Última avaliação: 23/03/2026 │ 2 avaliações │    │
│ │                     [Converter em Cliente]   │    │
│ └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

"Converter em Cliente" cria um registro em `pdv_customers` com os dados do lead.

### Hook — Dados unificados

O hook `usePDVCustomers` será expandido para:
1. Buscar `pdv_customers` (com flag `source: 'pdv'`)
2. Buscar `delivery_customers` (com flag `source: 'delivery'`)
3. Deduplicar por telefone (prioriza PDV)
4. Buscar leads de `customer_evaluations` agrupados por `customer_whatsapp` (com contagem de avaliações e último NPS)
5. Mutations: `createCustomer`, `updateCustomer`, `deleteCustomer`, `convertLeadToCustomer`

### Navegação

- Menu Administrador: novo item "Clientes" com ícone `Users` (entre "Usuários" e "Avaliações")
- Rota: `/pdv/clientes`
- Acesso: proprietário + gerente

