

## Página de Detalhe do Cliente

### Conceito

Ao clicar em um cliente na listagem, o usuário navega para `/pdv/clientes/:id` onde vê os dados completos do cliente com possibilidade de edição inline, além de uma timeline de pedidos (PDV + Delivery).

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/CustomerDetail.tsx` | **Nova página** — perfil do cliente + timeline de pedidos |
| `src/hooks/use-pdv-customers.ts` | Adicionar hook `useCustomerOrders` que busca pedidos de `pdv_orders` e `delivery_orders` pelo `customer_id` |
| `src/components/pdv/CustomerCard.tsx` | Tornar o card clicável (navega para `/pdv/clientes/:id`) |
| `src/pages/PDV.tsx` | Adicionar rota `/pdv/clientes/:id` |

### Layout da página de detalhe

```text
┌─────────────────────────────────────────────────────┐
│ ← Voltar    Cliente: João Silva          [Editar]   │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────┐ │
│ │ Dados do Cliente    │ │ Resumo                  │ │
│ │ Nome: João Silva    │ │ Total gasto: R$ 1.250   │ │
│ │ Tel: (54) 99653...  │ │ Visitas: 12             │ │
│ │ CPF: 000.000.000-00 │ │ Última visita: 23/03    │ │
│ │ Email: joao@...     │ │ Origem: PDV             │ │
│ │ Nasc: 15/05/1990    │ │ Cliente desde: Jan/2026 │ │
│ │ Obs: Cliente VIP    │ │                         │ │
│ └─────────────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────────────┤
│ Histórico de Pedidos                                │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📦 Pedido #142 — 23/03/2026 — R$ 85,00        │ │
│ │    Status: Finalizado │ Origem: PDV             │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ 🛵 Pedido #089 — 20/03/2026 — R$ 62,50        │ │
│ │    Status: Entregue │ Origem: Delivery          │ │
│ ├─────────────────────────────────────────────────┤ │
│ │ 📦 Pedido #071 — 15/03/2026 — R$ 120,00       │ │
│ │    Status: Finalizado │ Origem: PDV             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Detalhes técnicos

**Hook `useCustomerOrders(customerId, source)`**:
- Se `source === "pdv"`: busca `pdv_orders` com `customer_id = id`
- Se `source === "delivery"`: busca `delivery_orders` com `customer_id = id`
- Retorna lista unificada ordenada por data descendente

**CustomerDetail page**:
- `useParams<{ id: string }>()` para pegar o ID
- `usePDVCustomers()` para encontrar o cliente na lista unificada
- Botão "Editar" abre `CustomerDialog` (já existente) para clientes PDV
- Clientes delivery mostram dados como read-only
- Cards de resumo: total gasto, visitas, última visita, origem, data de cadastro
- Timeline de pedidos com ícones distintos para PDV vs Delivery

**CustomerCard** — adicionar `onClick` com `useNavigate` para `/pdv/clientes/${customer.id}?source=${customer.source}`

**Rota** — adicionar em PDV.tsx: `<Route path="clientes/:id" element={<CustomerDetail />} />`

