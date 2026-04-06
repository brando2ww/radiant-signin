

## Funil de Compra no Relatório do Delivery

### Problema
Atualmente não há rastreamento interno dos eventos do funil (visualização, carrinho, conversão). O hook `useMarketingTracking` envia dados apenas para Meta Pixel / Google Analytics, mas não persiste no banco.

### Solução

#### 1. Nova tabela: `delivery_funnel_events`
Criar via migration para registrar cada evento do funil:
- `id` (uuid, PK)
- `user_id` (uuid) — dono do estabelecimento
- `session_id` (text) — identificador anônimo do visitante (gerado no browser)
- `event_type` (text) — `page_view`, `add_to_cart`, `purchase`
- `metadata` (jsonb, nullable) — dados extras (produto, valor, etc.)
- `created_at` (timestamptz)

RLS: INSERT público (anon), SELECT apenas para o dono (`auth.uid() = user_id`).

#### 2. Registrar eventos no PublicMenu
Atualizar `src/pages/PublicMenu.tsx` e componentes do carrinho/checkout:
- Gerar `sessionId` com `crypto.randomUUID()` e guardar no `sessionStorage`
- Na abertura da página → inserir evento `page_view`
- Ao adicionar item ao carrinho → inserir evento `add_to_cart`
- Ao concluir pedido → inserir evento `purchase`
- Inserções via `supabase.from("delivery_funnel_events").insert(...)` (com `anon` key, sem auth necessário)

#### 3. Hook: `src/hooks/use-delivery-funnel.ts`
- Busca eventos agrupados por `event_type` no período selecionado
- Retorna contagens: `{ pageViews, addToCarts, purchases }` e taxas de conversão entre etapas

#### 4. Componente: `src/components/delivery/reports/PurchaseFunnel.tsx`
- Visualização em formato de funil com 3 etapas:
  - **Visualizações** (topo, mais largo)
  - **Adicionaram ao carrinho** (meio)
  - **Converteram** (base, mais estreito)
- Cada etapa mostra: quantidade absoluta, % em relação à etapa anterior, e % total
- Visual com barras decrescentes estilizadas em gradiente (tipo funil)
- Card com métricas: taxa de conversão geral (views → purchases), taxa carrinho → compra

#### 5. Integrar ao ReportsTab
Adicionar `<PurchaseFunnel>` no `src/components/delivery/ReportsTab.tsx` após os relatórios existentes, usando o mesmo filtro de período.

### Arquivos

| Ação | Arquivo |
|------|---------|
| Migration | `delivery_funnel_events` table + RLS |
| Modificar | `src/pages/PublicMenu.tsx` — registrar `page_view` |
| Modificar | `src/components/public-menu/ShoppingCart.tsx` — registrar `add_to_cart` |
| Modificar | `src/components/public-menu/checkout/OrderConfirmation.tsx` — registrar `purchase` |
| Criar | `src/hooks/use-delivery-funnel.ts` |
| Criar | `src/components/delivery/reports/PurchaseFunnel.tsx` |
| Modificar | `src/components/delivery/ReportsTab.tsx` — adicionar funil |

