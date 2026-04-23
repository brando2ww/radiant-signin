

## Fluxo completo: garçom fecha → caixa cobra → mesa libera

### Causa-raiz

Hoje o `closeComanda` do garçom faz duas coisas erradas para esse fluxo:
1. Marca a comanda como `fechada` — mesmo status usado pelo caixa após cobrar.
2. Já libera a mesa imediatamente, sem passar pelo caixa.

Como a Frente de Caixa filtra apenas `status = 'aberta'` (em `getStandaloneComandas` e em `getComandasForTable` no `ChargeSelectionDialog`), comandas fechadas pelo garçom **desaparecem** em vez de virar fila de cobrança. Não há realtime entre os módulos.

### Mudança no banco

Adicionar novo valor ao enum `comanda_status`: `aguardando_pagamento`, e na coluna `pdv_orders.status` o valor `aguardando_pagamento`. Também adicionar coluna opcional `closed_by_waiter_at timestamptz` em `pdv_comandas` para ordenar a fila por tempo de espera real (não por `updated_at`, que muda quando o caixa abre).

```sql
alter type comanda_status add value 'aguardando_pagamento';
alter table pdv_comandas
  add column closed_by_waiter_at timestamptz;
```

(Status `fechada` continua significando "paga e finalizada".)

### Fluxo no garçom

Em `src/hooks/use-pdv-comandas.ts`, `closeComandaMutation`:
- Mudar status para `aguardando_pagamento` (não `fechada`).
- Setar `closed_by_waiter_at = now()`.
- **Remover** o bloco que fecha a `order` e libera a mesa (linhas 191-214). Quem libera a mesa agora é o caixa.
- Toast: "Comanda enviada para o caixa".

Em `GarcomMesaDetalhe.tsx` (linha 41-45) e `GarcomComandaDetalhe.tsx` (linha 25):
- Incluir `aguardando_pagamento` nas comandas exibidas na mesa (para o garçom ver o badge).
- Em `GarcomComandaDetalhe`, se a comanda estiver `aguardando_pagamento`:
  - Esconder os botões "Item", "Cozinha" e "Fechar".
  - Mostrar badge laranja "Aguardando caixa" no header.
  - Bloquear `addItem` no hook se a comanda não estiver `aberta` (toast: "Esta comanda já foi fechada e enviada para o caixa").
- Na lista de comandas da mesa (`GarcomMesaDetalhe`), cada card de comanda mostra badge de status: verde "Aberta" / laranja "Aguardando caixa" / azul "Em cobrança".

Em `GarcomComandas.tsx` (linha 18): incluir `aguardando_pagamento` em "abertas" ou criar aba "Aguardando caixa".

Em `MesaCard` (lista de mesas): mesa continua "ocupada" enquanto houver qualquer comanda `aberta` ou `aguardando_pagamento`. Adicionar um pequeno indicador (ponto laranja) quando há ao menos uma comanda aguardando cobrança.

### Fluxo na Frente de Caixa

Em `src/components/pdv/cashier/ChargeSelectionDialog.tsx`:
- Renomear para "Cobranças do Salão" e adicionar **uma nova aba "Aguardando cobrança"** como aba padrão. Manter "Comandas" (avulsas) e "Mesas" (ocupadas com comandas abertas pelo caixa).
- A aba "Aguardando cobrança" lista TODAS as comandas com `status = 'aguardando_pagamento'` (avulsas e de mesa juntas, mais relevantes para o operador).
- Cada card mostra:
  - Mesa (se `order_id`) ou "Avulsa".
  - Nome da comanda nominal.
  - Resumo dos itens (até 3 + "+N itens").
  - Total em destaque.
  - "Aguardando há X min" calculado de `closed_by_waiter_at`.
  - Badge laranja "Aguardando cobrança".
- Ordenação padrão: tempo de espera (mais antiga primeiro). O seletor de ordenação atual é mantido.
- Animação `pulse` curta (2s) na primeira renderização de uma comanda recém-chegada (detectado por diff entre renders).
- No header da Frente de Caixa: badge contador com o total de comandas aguardando — esse contador também é exibido permanentemente no botão "Cobrar (F5)" da sidebar.

Em `src/hooks/use-pdv-comandas.ts`: novo helper `getPendingPaymentComandas()` que retorna comandas com `status = 'aguardando_pagamento'`.

### Cobrança e liberação da mesa

Em `src/hooks/use-pdv-payments.ts`:
- `registerPayment` e `registerTablePayment` hoje filtram `.eq("status", "aberta")`. Trocar para `.in("status", ["aberta", "aguardando_pagamento"])` para aceitar comandas vindas do garçom.
- Após registrar pagamento, se a comanda tinha `order_id`:
  - Verificar se ainda existem comandas com status `aberta` ou `aguardando_pagamento` no mesmo `order_id`.
  - Se nenhuma → fechar a `order` (`status='fechada'`) e liberar a mesa (`status='livre'`, `current_order_id=null`).
  - Se ainda houver → mesa permanece ocupada.
- Status final da comanda paga: continua sendo `fechada`.

`PaymentDialog` não muda — já recebe `comanda` e `items` prontos.

### Realtime entre módulos

Criar um hook compartilhado `src/hooks/use-pdv-comandas-realtime.ts` que assina mudanças em `pdv_comandas`, `pdv_comanda_items`, `pdv_orders` e `pdv_tables` filtradas por `user_id = visibleUserId`, e invalida as queries relevantes. Padrão idêntico ao `use-delivery-orders.ts` (já existente).

Esse hook é chamado em:
- `Garcom.tsx` (layout do garçom) — para mesa virar livre sem reload.
- `Cashier.tsx` (já em `/pdv/caixa`) — para nova comanda aparecer na fila instantaneamente.
- `Salon.tsx` — para refletir mudanças de status.

### Estado opcional "em cobrança"

Para sinalizar ao garçom que o caixa já está cobrando (evita duplicidade quando dois operadores agem simultaneamente):
- Quando o `PaymentDialog` abre, marcar a comanda como `em_cobranca` (novo valor de enum). Quando fecha sem pagar, voltar para `aguardando_pagamento`. Quando paga, vira `fechada`.
- No garçom, badge azul "Sendo cobrada no caixa" para esse status; itens bloqueados.

```sql
alter type comanda_status add value 'em_cobranca';
```

### Detalhes técnicos

- **Enum Postgres**: `ALTER TYPE ... ADD VALUE` precisa rodar fora de transação. A migração trata isso via `BEGIN`/`COMMIT` separado por valor.
- **Tipos TS**: `ComandaStatus` em `use-pdv-comandas.ts` passa a ser `"aberta" | "aguardando_pagamento" | "em_cobranca" | "fechada" | "cancelada"`. Os tipos gerados de Supabase (`src/integrations/supabase/types.ts`) refletem isso automaticamente.
- **Ordenação por espera**: `closed_by_waiter_at` é populado no `closeComanda` do garçom; fallback para `updated_at` se nulo (comandas legadas).
- **Bloqueio de adição de item**: `addItemMutation` checa o status atual da comanda no banco antes de inserir e retorna erro com mensagem específica.
- **Liberação da mesa**: feita no `usePDVPayments`, não em trigger SQL — mantém a lógica visível no front e evita estados intermediários inconsistentes.
- **Compatibilidade**: comandas existentes em `fechada` continuam significando "paga". Nada a migrar.

### Validação

- Garçom abre Mesa 5, cria comanda "Eduardo", adiciona 3 itens, envia cozinha, clica "Fechar". Toast: "Comanda enviada para o caixa". Comanda permanece visível na mesa com badge laranja "Aguardando caixa". Mesa continua ocupada na grade.
- Operador na Frente de Caixa vê, em até 1s e sem reload, a comanda na aba "Aguardando cobrança", com Mesa 5, nome Eduardo, itens, total, "Aguardando há 0 min".
- Operador clica → `PaymentDialog` abre. No garçom, comanda muda para badge azul "Sendo cobrada no caixa" em tempo real.
- Operador finaliza pagamento PIX → comanda some da fila do caixa. No garçom, mesa volta a "livre" sem reload (se era a última comanda).
- Cenário de mesa com 2 comandas nominais: cada uma é fechada/cobrada individualmente; mesa só libera quando ambas estão pagas.
- Garçom tenta adicionar item em comanda `aguardando_pagamento` → erro "Esta comanda já foi fechada e enviada para o caixa".
- Tentativa de cobrança duplicada (dois caixas): segunda mutation falha porque o status já é `fechada` (filtro `.in(["aberta","aguardando_pagamento"])` não casa).

