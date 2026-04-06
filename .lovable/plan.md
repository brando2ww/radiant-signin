

## Sistema de Fidelidade e Gamificação para Delivery

### Visão geral
Criar um programa de pontos integrado ao delivery onde clientes acumulam pontos a cada compra e podem trocar por cashback ou prêmios. O admin configura as regras e acompanha tudo em uma página dedicada.

### Como funciona

**Para o cliente (cardápio público):**
- A cada pedido entregue, ganha pontos (ex: R$1 = 1 ponto, configurável)
- Ao fazer checkout, vê seu saldo de pontos e pode resgatar
- Pode trocar pontos por desconto (cashback) no pedido ou por prêmios cadastrados pelo dono

**Para o admin (painel delivery):**
- Nova página `/pdv/delivery/fidelidade` com 4 seções:
  1. **Configuração**: taxa de conversão (R$/ponto), valor mínimo de resgate, ativar/desativar
  2. **Prêmios**: cadastrar prêmios resgatáveis com custo em pontos (ex: "Sobremesa grátis" = 50 pts)
  3. **Ranking de clientes**: lista dos clientes com mais pontos, total gasto, resgates
  4. **Histórico de resgates**: log de todos os resgates feitos

### Banco de dados (3 tabelas novas)

**`delivery_loyalty_settings`** — configuração por estabelecimento
- `id`, `user_id` (dono), `points_per_real` (default 1), `min_points_redeem` (default 50), `cashback_value_per_point` (default 0.10), `is_active` (default true), `created_at`, `updated_at`
- RLS: owner read/write

**`delivery_loyalty_points`** — saldo e histórico de movimentação
- `id`, `user_id` (dono do estabelecimento), `customer_id` (FK delivery_customers), `points` (int, positivo=ganho, negativo=resgate), `type` (`earn` | `redeem`), `reference_id` (order_id ou prize_id), `description`, `created_at`
- RLS: INSERT público (anon — para registrar ganho no checkout), SELECT para o dono

**`delivery_loyalty_prizes`** — prêmios resgatáveis
- `id`, `user_id`, `name`, `description`, `points_cost`, `image_url`, `is_active`, `max_quantity`, `redeemed_count`, `created_at`
- RLS: owner CRUD, anon SELECT (para exibir no cardápio)

### Arquivos a criar/modificar

| Ação | Arquivo | O quê |
|------|---------|-------|
| Migration | SQL | 3 tabelas + RLS policies |
| Criar | `src/pages/pdv/delivery/Loyalty.tsx` | Página admin com tabs |
| Criar | `src/hooks/use-delivery-loyalty.ts` | CRUD settings, prizes, points, ranking |
| Criar | `src/components/delivery/loyalty/LoyaltySettings.tsx` | Config do programa |
| Criar | `src/components/delivery/loyalty/LoyaltyPrizes.tsx` | CRUD de prêmios |
| Criar | `src/components/delivery/loyalty/LoyaltyPrizeDialog.tsx` | Dialog criar/editar prêmio |
| Criar | `src/components/delivery/loyalty/CustomerRanking.tsx` | Tabela ranking clientes |
| Criar | `src/components/delivery/loyalty/RedemptionHistory.tsx` | Histórico de resgates |
| Criar | `src/components/public-menu/LoyaltyBanner.tsx` | Banner de pontos no cardápio público |
| Criar | `src/components/public-menu/LoyaltyRedeemSheet.tsx` | Sheet para resgatar pontos/prêmios no checkout |
| Modificar | `src/pages/PDV.tsx` | Adicionar rota `delivery/fidelidade` |
| Modificar | `src/components/pdv/PDVHeaderNav.tsx` | Adicionar link "Fidelidade" no menu Delivery |
| Modificar | `src/components/public-menu/checkout/OrderConfirmation.tsx` | Registrar ganho de pontos + opção de resgatar |
| Modificar | `src/pages/PublicMenu.tsx` | Carregar saldo de pontos do cliente |

### Detalhes técnicos

- Pontos são ganhos automaticamente após pedido com status `delivered` (registrado no checkout com type `earn`)
- Resgate de cashback: cliente escolhe quantos pontos usar → desconto aplicado ao total
- Resgate de prêmio: cliente troca pontos por prêmio → registrado como `redeem` negativo
- O saldo é calculado com `SUM(points) WHERE customer_id = X AND user_id = Y`
- Identificação do cliente: pelo `customer_id` já existente (vinculado ao telefone)

