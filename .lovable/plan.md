

## Melhorar Validação de Cupons: Lista + Busca por Nome/Telefone

### Situação atual
A página de Validação de Cupons só permite buscar pelo código exato do cupom. Não há lista de cupons disponíveis nem busca por cliente.

### Solução

**1. Hook `use-all-prize-wins.ts`** — Adicionar busca por nome/telefone
- Nova mutation `useSearchCouponsByCustomer` que busca em `campaign_prize_wins` usando `ilike` no `customer_name` ou `eq` no `customer_whatsapp` (com formatação)
- Retorna array de resultados

**2. Página `CouponsValidation.tsx`** — Expandir com 2 seções:

**Seção 1 (existente, melhorada): Buscar Cupom**
- Manter busca por código
- Adicionar segundo campo de busca por nome ou telefone do cliente
- Ao buscar por cliente, exibir lista de cupons encontrados (pode ter múltiplos)

**Seção 2 (nova): Lista de Cupons Disponíveis**
- Card abaixo da busca com tabela/lista de todos os cupons ativos (não resgatados, não expirados)
- Colunas: Código, Cliente, WhatsApp, Prêmio, Validade, Status, Ação (Resgatar)
- Filtro de status: Todos / Ativos / Resgatados / Expirados
- Usar `useAllPrizeWins` já existente (já traz todos os cupons com detalhes)
- Paginação ou scroll para listas grandes

### Fluxo
```text
┌─────────────────────────────────────────────┐
│  Validação de Cupons                        │
│                                             │
│  ┌─ Buscar Cupom ────────────────────────┐  │
│  │ [Código do cupom...        ] [Validar]│  │
│  │ [Nome ou telefone do cliente] [Buscar]│  │
│  │                                       │  │
│  │ (resultados da busca aqui)            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌─ Cupons Disponíveis ─────────────────┐   │
│  │ [Todos ▼] [🔍 Filtrar...]            │   │
│  │                                       │  │
│  │ Código  | Cliente | Prêmio | Status   │  │
│  │ ABC-123 | João    | Pizza  | Ativo  ▶ │  │
│  │ DEF-456 | Maria   | Refri  | Resgat.  │  │
│  │ ...                                   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Arquivos alterados
1. **`src/hooks/use-all-prize-wins.ts`** — Adicionar `useSearchCouponsByCustomer` (busca por nome/telefone via `ilike`/`or`)
2. **`src/pages/pdv/evaluations/coupons/CouponsValidation.tsx`** — Adicionar campo de busca por cliente, lista completa de cupons com filtros e ação de resgate inline

