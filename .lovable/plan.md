## Mudança estrutural — fluxo de fechamento

O garçom deixa de fechar comandas. Toda comanda com itens enviados à cozinha aparece automaticamente no caixa, em tempo real. O caixa cobra; ao confirmar pagamento, a comanda some do garçom e (quando for a última da mesa) a mesa libera.

## Como o sistema fica

```text
Antes:
  Garçom envia itens → adiciona mais → toca "Fechar" → vai p/ caixa
  Status: aberta → aguardando_pagamento → em_cobranca → fechada

Depois:
  Garçom envia itens → continua adicionando livremente
                    ↘ caixa já vê em tempo real
  Caixa cobra → em_cobranca → fechada (mesa libera se for a última)
  Status: aberta → em_cobranca → fechada
```

O status `aguardando_pagamento` deixa de existir como ação do garçom. A fila do caixa passa a mostrar **toda comanda `aberta` com pelo menos um item enviado à cozinha**.

## Mudanças no app do garçom

### `src/pages/garcom/GarcomComandaDetalhe.tsx`
- Remover o botão "Fechar" do rodapé.
- Quando não há rascunho, o rodapé mostra apenas "Adicionar item" em largura total.
- Remover `closeComanda` do hook desestruturado.
- Remover badges/banners de "Aguardando caixa" — substituir por badge "Em cobrança" apenas quando `status === "em_cobranca"`.
- Bloquear adição de itens quando `status === "em_cobranca"` exibindo aviso: "Esta comanda está sendo cobrada no caixa".

### `src/pages/garcom/GarcomMesaDetalhe.tsx`
- Remover badge "Aguardando caixa" (status não vai mais existir do lado do garçom).
- Filtro `tableComandas` passa a mostrar apenas `aberta` e `em_cobranca` (drop `aguardando_pagamento`).

### `src/pages/garcom/GarcomComandas.tsx`
- Mesmo ajuste de filtro: lista comandas `aberta` e `em_cobranca`.

### `src/components/pdv/cashier/SalonQueuePanel.tsx` e helpers
- Função `getPendingPaymentComandas()` em `use-pdv-comandas.ts` passa a retornar comandas `aberta` (com pelo menos 1 item enviado à cozinha) **ou** `em_cobranca`.
- Critério "tem item enviado": existe pelo menos um `pdv_comanda_items` da comanda com `sent_to_kitchen_at IS NOT NULL` e não-filho de composição.
- Comandas vazias (sem envio) não aparecem na fila.

### `src/hooks/use-pdv-comandas.ts`
- `markAsChargingMutation`: aceitar transição `aberta → em_cobranca` (hoje só aceita `aguardando_pagamento → em_cobranca`).
- `releaseFromChargingMutation`: ao liberar (caixa cancelou cobrança), voltar para `aberta` (não mais `aguardando_pagamento`).
- `returnToWaiterMutation`: passa a aceitar apenas `em_cobranca → aberta` com motivo. Botão "Devolver ao garçom" só aparece quando o caixa abriu cobrança e quer cancelar.
- Manter `closeComandaMutation` no código mas remover qualquer chamada do app do garçom — fica disponível para o caixa marcar manualmente como fechada se necessário.

## Mudanças no caixa

### Painel "Salão" (`SalonQueuePanel`)
- Lista todas as comandas `aberta` (com itens enviados) + `em_cobranca`.
- Badge:
  - "Aberta" (verde) — comanda viva, garçom ainda pode adicionar
  - "Em cobrança" (azul) — caixa já abriu o pagamento
- Total da comanda atualiza em tempo real conforme o garçom envia novos itens (já existe via realtime + invalidate).
- Botão "Devolver ao garçom" só aparece em status `em_cobranca`.

### `ChargeSelectionDialog`
- Aba "Mesas": passa a considerar mesas com qualquer comanda `aberta` ou `em_cobranca`. Hoje filtra só `aberta` (ok, mantém).
- Sem mais separação visual entre "vinda do garçom" e "aberta no caixa" — toda comanda aberta com itens é cobrável.

### `PaymentDialog` / fluxo de pagamento
- Ao iniciar cobrança: chama `markAsCharging` (`aberta → em_cobranca`). Isso já bloqueia o garçom de adicionar (regra adicionada acima).
- Ao confirmar pagamento: comanda vira `fechada`; itens consumidos baixam estoque (já implementado); se for a única `aberta`/`em_cobranca` do `order_id`, liberar mesa (`status: livre`, `current_order_id: null`). Já existe lógica parecida em `Salon.tsx` e no fluxo de pagamento — verificar e padronizar para também valer quando a origem é o garçom.
- Ao cancelar pagamento (fechar dialog sem concluir): `releaseFromCharging` devolve para `aberta`, garçom volta a poder editar.

## Sincronização realtime

Já implementado em `use-pdv-comandas-realtime.ts` — qualquer mudança em `pdv_comandas` ou `pdv_comanda_items` dispara invalidação de cache em ambos os apps. Nenhum trabalho novo necessário aqui, apenas confirmar que o painel do caixa reage à inserção de itens (sim — já invalida `pdv-comandas` e `pdv-comanda-items`).

## Limpeza

- `closed_by_waiter_at` deixa de ser preenchido pelo garçom (campo continua na tabela, sem migration). Onde ele era usado para ordenar a fila do caixa, passar a usar `created_at` da comanda como fallback.
- Texto "aguardando caixa", "Comanda enviada para o caixa", e mensagens análogas saem do garçom.
- `closeComandaMutation` e o helper `getPendingComandasByOrderId` continuam exportados (uso interno do caixa), mas perdem qualquer chamada vinda do app do garçom.

## Fora do escopo (ficam para depois)

- Alerta ao gestor para mesas esquecidas (configurável). Anotar como melhoria futura.
- Migration para remover o status `aguardando_pagamento` do enum — manter por compatibilidade com comandas históricas. Apenas paramos de criar novas nesse status.