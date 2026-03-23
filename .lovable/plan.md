

## Gamificação: Roleta de Prêmios nas Campanhas de Avaliação

### Fluxo Revisado — Roleta PRIMEIRO

```text
Cliente acessa link → Gira a Roleta → Preenche Avaliação → Recebe Cupom
```

O cliente é atraído pela roleta (engajamento), gira e descobre o prêmio. Para **liberar o cupom**, precisa preencher a avaliação. Isso aumenta a taxa de resposta.

```text
┌─────────────────────────────────┐
│  🎡 Gire e Ganhe!               │
│                                 │
│      [ROLETA ANIMADA]           │
│                                 │
│  [ Girar Roleta! ]              │
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│  🎊 Você ganhou: Sobremesa!     │
│                                 │
│  Para liberar seu cupom,        │
│  preencha a avaliação abaixo:   │
├─────────────────────────────────┤
│  📋 Seus Dados                   │
│  ⭐ Perguntas de Avaliação       │
│  📊 NPS                          │
│  [ Enviar e Liberar Cupom ]     │
└──────────┬──────────────────────┘
           ▼
┌─────────────────────────────────┐
│  🎉 Seu Cupom!                  │
│  CUPOM: ABC-1234                │
│  Válido até: 30/03/2026         │
│  Apresente no caixa             │
└─────────────────────────────────┘
```

Se a roleta estiver desativada, vai direto para o formulário (comportamento atual).

### Banco de Dados (migration)

**Coluna em `evaluation_campaigns`:**
- `roulette_enabled` boolean default false

**Tabela `campaign_prizes`:**
- id, campaign_id (FK), name, color (hex), probability (%), max_quantity (null=ilimitado), redeemed_count, coupon_validity_days, is_active, created_at

**Tabela `campaign_prize_wins`:**
- id, campaign_id, prize_id (FK), evaluation_id (FK, unique — 1 giro por avaliação), customer_name, customer_whatsapp, coupon_code (unique), coupon_expires_at, is_redeemed, redeemed_at, created_at

**RLS:** SELECT e INSERT público (roleta funciona sem auth). UPDATE/DELETE apenas owner autenticado.

### Admin — Nova aba "Roleta" na campanha

Dentro de `CampaignDetail`, nova aba com:
- Switch ativar/desativar roleta
- CRUD de prêmios (nome, cor, probabilidade %, quantidade, validade)
- Barra visual mostrando soma das % (deve = 100%)
- Preview miniatura da roleta

### Componente SpinWheel

- Roleta circular com `conic-gradient` baseada nas cores/probabilidades
- Prêmio sorteado antes da animação (distribuição acumulada de probabilidade)
- Animação: `transform: rotate()` com `transition 4s cubic-bezier` — 5+ voltas e desacelera
- Indicador triangular fixo no topo

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Criar tabelas, coluna roulette_enabled, RLS |
| `src/hooks/use-campaign-prizes.ts` | CRUD prêmios + hook público buscar prêmios + registrar vitória |
| `src/components/pdv/evaluations/CampaignRoulette.tsx` | Aba config roleta no admin |
| `src/components/pdv/evaluations/PrizeDialog.tsx` | Dialog adicionar/editar prêmio |
| `src/components/pdv/evaluations/RoulettePreview.tsx` | Preview visual da roleta |
| `src/components/public-evaluation/SpinWheel.tsx` | Roleta animada pública |
| `src/components/public-evaluation/PrizeResult.tsx` | Tela do cupom ganho |
| `src/components/pdv/evaluations/CampaignDetail.tsx` | Adicionar aba "Roleta" |
| `src/pages/PublicEvaluation.tsx` | Fluxo: roleta primeiro → formulário → cupom |
| `src/integrations/supabase/types.ts` | Atualizar tipos |

### Fluxo público detalhado

1. Página carrega → verifica `roulette_enabled` e busca prêmios ativos
2. Se roleta ativa: mostra tela da roleta com botão "Girar"
3. Ao girar: sorteia prêmio (client-side), anima roleta para o ângulo correto
4. Mostra prêmio ganho + mensagem "preencha para liberar"
5. Formulário de avaliação aparece abaixo (mesmo formulário atual)
6. Ao enviar avaliação: salva avaliação + salva `campaign_prize_wins` com cupom gerado
7. Mostra tela final com código do cupom e validade

