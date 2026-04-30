## Objetivo

Implementar troca de mesa, transferências de consumo entre mesas/comandas (todas as direções), pagamento parcial por item **executado exclusivamente pelo caixa**, fluxo "garçom encerra atendimento → caixa cobra", permissões granulares por perfil e auditoria — disponíveis no Salão, Mesas, Comandas, Caixa e Garçom (mobile/PWA), com sincronização realtime.

## Regra central de pagamento (NOVA)

- **Garçom nunca cobra**, nem total nem parcial. Garçom apenas:
  1. Lança itens.
  2. **Encerra o atendimento** da mesa/comanda (ação "Pedir conta / Encerrar"), opcionalmente marcando os itens que devem ser cobrados juntos (separação de conta).
- **Caixa é o único** que executa pagamento (total ou parcial).
- **A comanda/mesa só desaparece da tela quando o caixa finaliza o pagamento integral.** Encerrar pelo garçom apenas muda o status para `aguardando_pagamento` e envia para a fila do caixa — segue visível para todos com status claro.

## O que já existe (reuso)

- `transferItems` (em `use-pdv-comandas.ts`) move itens entre comandas via update do `comanda_id`.
- `TransferItemsDialog` em `src/components/pdv/transfer/`, usado em `Salon.tsx`, `Comandas.tsx` e `GarcomComandaDetalhe.tsx`.
- `PaymentDialog` (caixa) já suporta modo "Por produto" (parcial) com `paid_quantity` e lock atômico via `pdv_lock_comanda_items`.
- `pdv_orders.status` já tem `pendente_pagamento` / `aguardando_pagamento` e o fluxo "fechar mesa → PaymentDialog" já existe (memória `comandas-system`).
- `usePDVComandasRealtime` já invalida caches de mesas/comandas/orders.
- `establishment_users.role` + `useUserRole` controlam rotas; faltam permissões granulares por ação.

## Banco de dados (migration)

1. **Enum `pdv_permission_action`** e tabela `pdv_action_permissions` (config por owner × role × action):
   - Ações: `change_table`, `transfer_table_to_table`, `transfer_comanda_to_comanda`, `transfer_table_to_comanda`, `transfer_comanda_to_table`, `close_attendance` (encerrar atendimento), `cancel_item`, `cancel_paid_item`, `apply_discount`, `remove_service_fee`, `view_history`, `process_payment` (somente caixa/gerente/proprietário por padrão), `refund_payment`.
   - **`process_payment` nunca habilita para `garcom`** (constraint na função de defaults).
   - RLS: select para membros do estabelecimento; update apenas owner/gerente.
   - Função `has_pdv_action(_user_id, _action) returns boolean` (security definer): resolve owner via `establishment_users`, lê a linha por role, com defaults seguros.

2. **`pdv_action_audit_log`**: `actor_user_id`, `actor_role`, `action`, `source_type/id`, `target_type/id`, `payload jsonb`, `reason`, `created_at`. RLS de leitura para membros; insert via `log_pdv_action(...)` (security definer).

3. **Estados de comanda/order** (sem mudar tipos, só convenção + colunas auxiliares):
   - `pdv_comandas`: adicionar `closed_by_user_id uuid`, `closed_at timestamptz`, `close_reason text`. Status `aguardando_pagamento` já existe.
   - `pdv_orders`: adicionar `closed_by_user_id`, `closed_at`, `service_fee_paid numeric default 0` (controla taxa já cobrada para não duplicar no fechamento).
   - Garçom encerrar = setar `status='aguardando_pagamento'`, registrar `closed_by_user_id/closed_at`, **sem liberar a mesa** e **sem remover da listagem**. Caixa finaliza pagamento → aí sim libera mesa/order conforme fluxo atual.

4. **RPC `pdv_close_attendance(p_comanda_id uuid, p_close_whole_table boolean, p_reason text)`** (security definer):
   - Valida permissão `close_attendance` e que a comanda tem itens.
   - Marca a comanda `status='aguardando_pagamento'` + autoria. Se `p_close_whole_table=true`, faz o mesmo em todas as comandas do `order_id` e marca o order como `pendente_pagamento`.
   - Insere log de auditoria.
   - **Não toca `pdv_tables.status` nem libera mesa.**

5. **RPC `pdv_change_table(p_source_table_id, p_target_table_id, p_reason)`** (security definer, transactional):
   - Valida mesmo owner, source ocupada, target livre, permissão `change_table`.
   - Move `current_order_id` para target, atualiza `pdv_orders.table_id`, libera source. Mantém comandas/itens. Loga.

6. **RPC `pdv_transfer_items(p_item_ids, p_target_kind, p_target_id, p_qty_map jsonb, p_reason)`** (security definer, atômica) — substitui o update direto atual:
   - `p_target_kind`: `comanda` ou `table` (se table, usa/abre `pdv_orders` e a comanda alvo).
   - Bloqueia transferência de itens com `paid_quantity >= quantity`, `status='cancelado'` ou `charging_session_id` ativo.
   - Suporta **transferência parcial por quantidade** (`p_qty_map`: `{item_id: qty}`): se `qty < restante`, faz split (cria item-irmão com `qty`, ajusta o original; preserva `unit_price`, `modifiers`, `notes`, `created_by`, descontos).
   - Recalcula subtotais via trigger existente. Loga.

7. **RPC `pdv_split_comanda_item(p_item_id, p_qty)`**: helper para o split (usado também pelo modo parcial do caixa quando o cliente quer pagar fração).

## Backend (edge functions)

Nenhuma necessária — toda lógica fica em RPCs no banco. O processamento de pagamento parcial já está no `use-pdv-payments` (somente o caixa o aciona).

## Frontend

### Hooks novos
- `src/hooks/use-pdv-permissions.ts`: query da tabela + helper `can(action)` com defaults espelhados.
- `src/hooks/use-pdv-action-audit.ts`: lista por mesa/comanda, paginado.
- `src/hooks/use-pdv-table-change.ts`: chama RPC `pdv_change_table`.
- `src/hooks/use-pdv-close-attendance.ts`: chama RPC `pdv_close_attendance`.
- Atualizar `use-pdv-comandas.ts`: trocar `transferItems` para a nova RPC com suporte a destino mesa e qty parcial.

### Componentes novos (`src/components/pdv/operations/`)
- `ChangeTableDialog.tsx`: lista mesas livres + motivo. RPC `pdv_change_table`.
- `TransferItemsDialog.tsx` (refator do existente): slider de quantidade por item, tabs Mesa/Comanda no destino, busca por número/nome/cliente, suporta origem mesa (todas as comandas).
- `CloseAttendanceDialog.tsx`: confirmação "Encerrar atendimento" — opção "Encerrar mesa inteira" ou apenas a comanda; mensagem clara: "Aguardará cobrança no caixa. A mesa não será liberada até o pagamento."
- `OperationHistoryDialog.tsx`: histórico/auditoria da mesa/comanda.
- `ActionMenu.tsx` (3-dot): "Trocar mesa", "Transferir consumo", "Encerrar atendimento", "Ver histórico" — todas gated por `usePDVPermissions`. **Não há ação de pagar fora do caixa.**

### Configuração (Admin)
- `src/components/pdv/settings/PermissionsTab.tsx`: matriz roles × ações (`allowed`, `requires_reason`). `process_payment` aparece desabilitada/locked para `garcom` (UI proíbe marcar). Item de menu "Permissões" em `PDVHeaderNav.tsx` para `proprietario`/`gerente`.

### Integração na UI

- **`TableDetailsDialog.tsx`**: substituir bloco de botões por `ActionMenu`. Para garçom/gerente, "Encerrar atendimento" substitui qualquer ação de cobrar. Status visível: Ocupada / Aguardando pagamento.
- **`ComandaDetailsDialog.tsx`**: mesmo, com Encerrar atendimento, Transferir consumo, Histórico, Trocar de mesa.
- **`Cashier.tsx` + `SalonQueuePanel.tsx`**: a fila do caixa **inclui** mesas/comandas com `aguardando_pagamento` em destaque (badge "Aguardando cobrança • Encerrado por <garçom>"). Só essa tela permite abrir `PaymentDialog` (full ou parcial).
- **`Salon.tsx`**: mesas com comanda em `aguardando_pagamento` ficam visíveis com badge específico, **continuam ocupando a mesa** até o caixa finalizar.
- **Garçom mobile** (`GarcomMesaDetalhe.tsx`, `GarcomComandaDetalhe.tsx`):
  - Botões grandes: "Trocar mesa", "Transferir consumo", "Encerrar atendimento", "Histórico". **Nenhum botão de pagamento.**
  - Após "Encerrar atendimento", a comanda fica visível em modo somente leitura com selo "Aguardando pagamento no caixa". Garçom não pode lançar mais itens nessa comanda (validação no banco também: trigger ou check em RPC de adicionar item).
  - `BottomTabBar.tsx`: aba "Encerradas" lista comandas que o garçom encerrou e ainda aguardam o caixa, para acompanhamento.

### UX e regras
- Itens visualmente segmentados em **Pendentes / Pagos / Cancelados**.
- Card-resumo financeiro fixo: Total, Pago, Restante, Taxa de serviço, Descontos.
- Itens pagos: trava transferência/edição/cancelamento (UI + validação no banco). Estorno apenas com `refund_payment`.
- Taxa/desconto proporcional via `src/lib/financial/proration.ts` (`prorateServiceFee`, `prorateDiscount`) — usados pelo `PaymentDialog` no caixa.
- Datas/valores via `formatBRL` e `date-fns/locale ptBR`.

## Permissões padrão

```
proprietario / gerente: tudo true
caixa: change_table, transfer_*, process_payment, refund_payment, cancel_paid_item, remove_service_fee, apply_discount, view_history = true
garcom: change_table, transfer_*, close_attendance, cancel_item (próprio, não pago), view_history = true
        process_payment, refund_payment, cancel_paid_item, remove_service_fee = FALSE (locked na UI)
```

## Auditoria

Toda ação chama `log_pdv_action(...)`. Telas de Histórico em mesa/comanda; página global `/pdv/auditoria-operacional` filtrável por usuário/data/ação, gated por `view_history`.

## Realtime

`usePDVComandasRealtime`: adicionar listener para mudanças em `pdv_comandas.status` e `pdv_orders.status` para que a tela do caixa receba imediatamente comandas encerradas pelo garçom, e o garçom veja sumir da listagem assim que o caixa finaliza o pagamento. Listener para `pdv_action_audit_log` para histórico aberto.

## Arquivos

Criar:
- `supabase/migrations/<ts>_pdv_operations.sql` (enum, tabelas, RLS, RPCs `pdv_change_table`, `pdv_transfer_items`, `pdv_split_comanda_item`, `pdv_close_attendance`, `has_pdv_action`, `log_pdv_action`).
- `src/hooks/use-pdv-permissions.ts`, `use-pdv-action-audit.ts`, `use-pdv-table-change.ts`, `use-pdv-close-attendance.ts`.
- `src/lib/financial/proration.ts`.
- `src/components/pdv/operations/ChangeTableDialog.tsx`, `TransferItemsDialog.tsx` (novo, substitui o de `transfer/`), `CloseAttendanceDialog.tsx`, `OperationHistoryDialog.tsx`, `ActionMenu.tsx`.
- `src/components/pdv/settings/PermissionsTab.tsx`.
- `src/pages/garcom/GarcomEncerradas.tsx` (+ rota).

Editar:
- `src/hooks/use-pdv-comandas.ts` (RPC `pdv_transfer_items` + bloqueio de adicionar item se `aguardando_pagamento`).
- `src/hooks/use-pdv-comandas-realtime.ts` (listeners adicionais).
- `src/components/pdv/TableDetailsDialog.tsx`, `ComandaDetailsDialog.tsx` (ActionMenu, sem botão de pagar).
- `src/components/pdv/cashier/PaymentDialog.tsx` (nada a remover; pode ler `service_fee_paid` para evitar duplicar taxa).
- `src/components/pdv/cashier/SalonQueuePanel.tsx` / `Cashier.tsx` (destaque para `aguardando_pagamento` com origem garçom).
- `src/pages/pdv/Salon.tsx`, `Comandas.tsx`, `Settings.tsx`.
- `src/pages/garcom/GarcomMesaDetalhe.tsx`, `GarcomComandaDetalhe.tsx`, `Garcom.tsx`, `src/components/garcom/BottomTabBar.tsx`.
- `src/hooks/use-user-role.ts` (rota auditoria).

## Critérios de aceite

- Garçom **nunca** processa pagamento. Botões de cobrar não existem fora do Caixa.
- Garçom encerra atendimento → comanda/mesa fica `aguardando_pagamento` e **continua visível** para o caixa.
- Mesa só é liberada / comanda só some quando o **caixa** finaliza o pagamento integral.
- Pagamento parcial por item/qty disponível **apenas no caixa**, com taxa/desconto proporcionais e sem duplicar valores no fechamento.
- Troca de mesa e transferências (mesa↔mesa, comanda↔comanda, mesa↔comanda) funcionam e respeitam permissões.
- Itens pagos protegidos contra transferência/edição/cancelamento.
- Toda ação registrada em auditoria.
- Sincronização realtime entre garçom, salão e caixa.

Aprove para implementar.