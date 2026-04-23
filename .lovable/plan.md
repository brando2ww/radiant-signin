

## Complemento: múltiplas comandas na mesma mesa — fila do caixa, agrupamento e split por pessoa

### Estado atual (já implementado)

- Status `aguardando_pagamento` e `em_cobranca` já existem em `pdv_comandas`.
- `closeComanda` no garçom envia para `aguardando_pagamento` sem liberar a mesa.
- `registerPayment` em `usePDVPayments` libera a mesa apenas quando não há mais comandas `aberta`/`aguardando_pagamento`/`em_cobranca` no mesmo `order_id`.
- `getPendingPaymentComandas()` retorna a fila do caixa.
- `ChargeSelectionDialog` tem o estado `tab="pendentes"` mas a `TabsList` só renderiza `comandas` e `mesas` — a aba "Aguardando cobrança" não aparece.

### O que falta — plano

#### 1. Aba "Aguardando cobrança" no caixa, com agrupamento por mesa

`src/components/pdv/cashier/ChargeSelectionDialog.tsx`:

- TabsList com 3 colunas: **Aguardando** (default), Comandas, Mesas. Badge com contador de pendentes em destaque (cor laranja se > 0).
- Conteúdo da aba "Aguardando":
  - Listar `pendingComandas` agrupadas por `order_id` (grupo "mesa") + um grupo "Avulsas" (sem `order_id`).
  - Cada grupo de mesa: cabeçalho com `formatTableLabel(table.table_number)`, badge `N comandas`, total agregado e botão **"Cobrar tudo desta mesa"** (abre `PaymentDialog` em modo split-por-comanda, ver seção 3).
  - Dentro do grupo, um card por comanda nominal mostrando: nome (`customer_name`), nº de itens, total, "Aguardando há X min" (calculado de `closed_by_waiter_at ?? updated_at`), badge laranja "Aguardando" ou azul "Em cobrança".
  - Borda colorida única por mesa (hash do `order_id` → 1 entre 6 cores) para identificação visual mesmo se grupos forem reordenados.
  - Cards com `aria-busy` e opacidade reduzida quando status `em_cobranca` (sinal de "outro caixa está cobrando"), mas continuam clicáveis (caso queiram retomar).
  - Ordenação dentro do grupo: mais antigas primeiro (`closed_by_waiter_at` ascendente).
  - Ordenação dos grupos: pelo card mais antigo de cada um.
- Comportamento de clique:
  - Card individual → `onSelectComanda(comanda, items)` (caixa cobra só essa pessoa).
  - "Cobrar tudo desta mesa" → novo handler `onSelectTablePending(table, comandas, items)` que dispara `PaymentDialog` em modo agrupado.

#### 2. Status "em_cobranca" ao abrir PaymentDialog

`src/components/pdv/cashier/PaymentDialog.tsx`:

- Ao abrir (`useEffect [open]`), se `comanda?.status === "aguardando_pagamento"` (ou alguma de `tableComandas` estiver), fazer UPDATE `status=em_cobranca` para os IDs envolvidos. Guardar a lista `lockedIds` em ref.
- Ao fechar SEM pagar (`onOpenChange(false)` antes de `showSuccess`), reverter `lockedIds` de `em_cobranca` → `aguardando_pagamento` (apenas se ainda estiverem em `em_cobranca`).
- Ao pagar com sucesso (`registerPayment`/`registerTablePayment`), o próprio mutation já transiciona para `fechada` (já filtra `["aberta","aguardando_pagamento","em_cobranca"]`). Não precisa reverter.
- Filtro `.in("status", […])` já permite cobrar comandas em `em_cobranca`, então não há regressão.
- Race entre dois caixas: se o segundo abrir e o UPDATE retornar 0 linhas (porque o primeiro já está cobrando aquele subconjunto), exibir toast "Outro operador já está cobrando esta comanda" e fechar o dialog.

#### 3. Modo split-por-pessoa (cobrar tudo da mesa)

`PaymentDialog`:

- Nova prop opcional `splitByComanda?: boolean` (true quando vem de "Cobrar tudo desta mesa" com 2+ comandas).
- Quando ativa, painel de resumo lista cada comanda nominal: `Eduardo — R$ 67,00`, `João — R$ 45,00`, total geral abaixo.
- Substitui o split atual (livre, por valor) por **split-por-comanda**: uma linha de pagamento pré-criada por comanda, valor fixo e travado igual ao subtotal daquela comanda. Cada linha permite escolher método (dinheiro/cartão/PIX) e parcelas independentes. Pode adicionar mais linhas se precisar quebrar uma comanda em formas diferentes.
- Ao confirmar:
  - Para cada linha, chamar `registerPayment` com a `comandaId` correspondente e o método/valor da linha.
  - Sequencial (await em ordem) para garantir que apenas a última feche a mesa via `usePDVPayments` (que já checa pendências restantes).
  - Em caso de erro no meio, abortar e mostrar quais foram pagas e quais não.
- Se o usuário desativar `splitByComanda`, cai no fluxo atual (uma forma só, valor total).

#### 4. Resumo "X/Y pagas" no garçom

`src/pages/garcom/GarcomMesaDetalhe.tsx`:

- No header da mesa, abaixo do status, mostrar contador: `2 abertas · 1 aguardando caixa · 0 pagas` (ocultar zeros). Quando todas em `aguardando_pagamento`/`em_cobranca`/`fechada`, exibir "Mesa liberando..." e quando o realtime atualizar para `livre`, navegar de volta para a lista.
- Cada card de comanda já mostra o badge — adicionar "Sendo cobrada agora" para `em_cobranca` (texto + bullet azul).

`src/components/garcom/MesaCard.tsx`:

- Aceitar nova prop opcional `pendingCount?: number` (comandas em `aguardando_pagamento`/`em_cobranca`).
- Quando `> 0` e mesa ocupada, exibir um pequeno bullet laranja no canto superior esquerdo do card (oposto ao bullet de status), separado.

`src/pages/garcom/GarcomMesas.tsx`:

- Calcular `pendingCount` por mesa via `usePDVComandas` (filtrar por `order_id` da mesa) e passar pro card.

#### 5. Indicador visual no Salão (PDV)

`src/components/pdv/TableCard.tsx`:

- Receber `pendingPaymentCount?: number` (calculado em `Salon.tsx` com `getPendingPaymentComandas` filtrado por `order_id` da mesa).
- Quando `> 0`, exibir um badge laranja pequeno no canto superior esquerdo: `⏱ N` (lucide `Clock`), tooltip "N comanda(s) aguardando cobrança".

`src/pages/pdv/Salon.tsx`:

- Passar `pendingPaymentCount` para `TableCard`/`SortableTableCard`.

#### 6. Detalhes técnicos

- **Sem migração de banco**: enum não usado (coluna `status` é `text`); `closed_by_waiter_at` já existe.
- **Helpers novos em `usePDVComandas`**:
  - `getPendingComandasByOrderId(orderId)` → para o garçom.
  - `markAsCharging(ids: string[])` e `releaseFromCharging(ids: string[])` → mutations usadas pelo `PaymentDialog` para o lock `em_cobranca` (UPDATE com `.in("status", ["aguardando_pagamento"])` no lock e `.in("status", ["em_cobranca"])` no release; retorna o nº de linhas afetadas para detectar conflito).
- **Realtime**: `use-pdv-comandas-realtime` já invalida `pdv-comandas` em qualquer UPDATE → o garçom verá `em_cobranca` automaticamente; o caixa verá nova comanda na fila automaticamente. Sem mudanças aqui.
- **Cores do agrupamento**: array `["border-blue-500","border-emerald-500","border-amber-500","border-pink-500","border-violet-500","border-cyan-500"]`, índice = `hashOrderId % 6`. Função pura, deterministic.
- **Race do close-by-waiter já protegido** pelo filtro `.eq("status","aberta")` no `closeComanda`.

### Validação

- Mesa 5 com comandas Eduardo + João abertas. Garçom fecha a do João → vai para fila do caixa, mesa continua ocupada, badge laranja no card da mesa (no Salão e no garçom), header "1 aberta · 1 aguardando caixa".
- Caixa abre o dialog "Cobrar (F5)" → vê aba "Aguardando" com grupo "Mesa 05" (1 comanda) com borda azul e card "João — R$ 45 — aguardando há 2min". Clica → vira `em_cobranca` no banco. No garçom o card de João muda para badge azul "Sendo cobrada no caixa".
- Operador cancela o dialog → comanda volta para `aguardando_pagamento`, no garçom volta o badge laranja.
- Operador finaliza pagamento PIX. Mesa continua ocupada (Eduardo ainda aberto). Badge laranja some.
- Eduardo pede a conta. Garçom fecha. Aparece no caixa. Operador clica "Cobrar tudo desta mesa" (com ambas pagas/abertas, só mostra Eduardo). Cobra. Mesa libera, garçom vê "Mesa liberando..." e cai pra livre via realtime.
- Cenário split: Mesa 5 com Eduardo (R$67) + João (R$45) ambos aguardando. Operador clica "Cobrar tudo da mesa" → dialog em modo split-por-comanda mostra duas linhas, total R$112. Define João=débito, Eduardo=PIX. Confirma → 2 inserts de pagamento, mesa libera, ambos viram `fechada`.
- Race: dois caixas abrem a mesma comanda no mesmo segundo. O segundo recebe toast "Outro operador já está cobrando esta comanda" e o dialog fecha.

