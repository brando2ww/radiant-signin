

## Etapa 6 — Cupons com Dados Reais (5 sub-páginas)

### Fonte de dados
- **Hook novo**: `useAllPrizeWins()` — busca todos os `campaign_prize_wins` do usuário (join com campaigns para filtrar por user_id)
- **Hooks existentes**: `useEvaluationCampaigns()` para listar campanhas, `useCampaignPrizes(campaignId)` para prêmios por campanha
- **Validação**: query direta no Supabase por `coupon_code`

### Páginas

**1. CouponsPanel.tsx — Painel de KPIs**
- KPI cards: Total emitidos, Resgatados, Expirados, Taxa de resgate (%)
- Gráfico: Cupons emitidos por mês (BarChart, últimos 6 meses)
- Gráfico: Status dos cupons (PieChart: ativos/resgatados/expirados)

**2. CouponsManagement.tsx — Gestão / Tabela**
- Busca por código ou nome do cliente
- Filtro por campanha (Select com campanhas do usuário)
- Tabela: Código, Cliente, WhatsApp, Prêmio, Campanha, Status (badge), Data, Validade
- Status badge: Ativo (verde), Resgatado (azul), Expirado (vermelho)
- Paginação (10 por página)

**3. CouponsValidation.tsx — Validação Manual**
- Input para digitar código do cupom
- Botão "Validar" que busca o cupom no banco
- Exibe resultado: dados do cupom, status, cliente, validade
- Botão "Resgatar" que marca `is_redeemed = true` e `redeemed_at = now()`
- Feedback visual de sucesso/erro

**4. CouponsDraw.tsx — Sorteio / Histórico de Spins**
- Tabela de todos os prize_wins ordenados por data (desc)
- Colunas: Data, Cliente, WhatsApp, Prêmio, Campanha, Código do cupom
- Filtro por campanha
- Sem paginação complexa, apenas scroll

**5. CouponsRoulettes.tsx — Visão Consolidada das Roletas**
- Lista todas as campanhas com roleta habilitada
- Para cada campanha: card com nome, lista de prêmios, probabilidades, qtd resgatada/máxima
- Reutiliza visual do `RoulettePreview` existente
- Mostra status (ativa/inativa) de cada campanha

### Novo hook necessário
```typescript
// useAllPrizeWins() — busca prize_wins de todas as campanhas do usuário
// Faz join: campaign_prize_wins -> evaluation_campaigns (filtra user_id)
// Retorna CampaignPrizeWin[] com campo extra prize_name e campaign_name
```

### Detalhes técnicos
- Criar `src/hooks/use-all-prize-wins.ts` com hook global de prize wins
- Mutation para resgatar cupom: `update campaign_prize_wins set is_redeemed=true, redeemed_at=now() where coupon_code=X`
- Recharts para gráficos (BarChart, PieChart)
- Reutilizar `RoulettePreview` componente existente para a página de Roletas
- `date-fns` para verificar expiração (`isBefore(coupon_expires_at, now)`)

### Arquivos
- **Criar**: `src/hooks/use-all-prize-wins.ts`
- **Editar**: `src/pages/pdv/evaluations/coupons/CouponsPanel.tsx`
- **Editar**: `src/pages/pdv/evaluations/coupons/CouponsManagement.tsx`
- **Editar**: `src/pages/pdv/evaluations/coupons/CouponsValidation.tsx`
- **Editar**: `src/pages/pdv/evaluations/coupons/CouponsDraw.tsx`
- **Editar**: `src/pages/pdv/evaluations/coupons/CouponsRoulettes.tsx`

