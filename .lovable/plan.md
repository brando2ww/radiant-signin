## Transferência de itens entre comandas e mesas

Permitir mover um ou vários itens lançados na comanda errada para outra comanda (avulsa ou de outra mesa), preservando produto, quantidade, observações e `kitchen_status`. A operação é atômica, registrada em log e atualiza os subtotais imediatamente.

### Estado atual

- `usePDVComandas` já expõe `transferItem` (atualiza só `comanda_id` de um item). Vamos substituir por uma versão robusta que aceita múltiplos itens, valida regras e registra log.
- `ComandaDetailsDialog` já tem botão "Transferir" mas o handler nunca foi ligado (Salon e Comandas passam `onTransferItem` indefinido).
- Garçom (`GarcomComandaDetalhe`) ainda não tem ação de transferir.
- `PaymentDialog` (caixa) lista itens com botão de remover — vamos adicionar botão de transferir ao lado, exceto quando a comanda está `em_cobranca` (regra do enunciado).

### Arquivos novos

**`src/components/pdv/transfer/TransferItemsDialog.tsx`** — Dialog/Drawer responsivo (`useIsMobile`) com 3 passos internos:

1. **Itens selecionados** (resumo): cards mostrando `quantidade × nome` e `formatBRL(subtotal)`. Quando entrar pelo fluxo de seleção múltipla, lista todos os itens; quando entrar por um item só, mostra apenas ele.
2. **Destino**:
   - Campo de busca (filtra por número de mesa e nome de comanda).
   - Lista de mesas ocupadas: card por mesa com `formatTableLabel`, contagem de comandas e nomes (ex: "Mesa 3 — Eduardo, João"). Mesa atual é excluída visualmente.
   - Seção "Comandas avulsas" (sem `order_id`, status `aberta`).
   - Comandas com status `em_cobranca` ou `aguardando_pagamento` aparecem desabilitadas com tooltip "Comanda em cobrança".
   - Mesa com 2+ comandas expande em sub-cards para o usuário escolher uma especificamente.
3. **Confirmação**: resumo "De Mesa X — Comanda Y" → "Para Mesa Z — Comanda W", lista de itens, e impacto financeiro `Subtotal origem reduz formatBRL(total) / Subtotal destino aumenta formatBRL(total)`. Botões "Confirmar transferência" / "Voltar".

Aviso superior amarelo quando algum item tem `kitchen_status` = `pronto`/`entregue`: "Este item já foi preparado. Mover não desfaz o preparo na cozinha."

**`src/hooks/use-transfer-items.ts`** (ou expandir em `use-pdv-comandas.ts`) — substitui `transferItemMutation`:

```ts
mutationFn: async ({ itemIds, targetComandaId, sourceComandaId }: {
  itemIds: string[]; targetComandaId: string; sourceComandaId: string;
}) => {
  // 1. Buscar comanda destino e validar status != em_cobranca/aguardando_pagamento
  const { data: target } = await supabase
    .from("pdv_comandas").select("id,status").eq("id", targetComandaId).single();
  if (!target || ["em_cobranca","aguardando_pagamento","fechada","cancelada"].includes(target.status))
    throw new Error("Comanda destino não está disponível");
  if (targetComandaId === sourceComandaId) throw new Error("Origem e destino iguais");

  // 2. Update em batch (atômico via .in())
  const { error } = await supabase.from("pdv_comanda_items")
    .update({ comanda_id: targetComandaId })
    .in("id", itemIds);
  if (error) throw error;

  // 3. Log via logActivityDirect
  await logActivityDirect(user.id, "update", "transaction", targetComandaId, {
    action: "comanda_item_transfer",
    source_comanda_id: sourceComandaId,
    target_comanda_id: targetComandaId,
    item_ids: itemIds,
  });
}
```

Trigger SQL `update_comanda_subtotal` já recalcula subtotais de origem e destino automaticamente em UPDATE — sem migração necessária.

### Arquivos modificados

**`src/pages/pdv/Salon.tsx`** e **`src/pages/pdv/Comandas.tsx`**:
- Adicionar estado `transferState: { itemIds: string[]; sourceComandaId: string } | null`.
- Passar `onTransferItem={(itemId) => setTransferState({ itemIds: [itemId], sourceComandaId: selectedComanda.id })}` para `ComandaDetailsDialog`.
- Renderizar `<TransferItemsDialog>` controlado por `transferState`.

**`src/components/pdv/ComandaDetailsDialog.tsx`**:
- Adicionar modo de seleção múltipla: ícone "checkbox" no header que ativa checkboxes em cada linha. Botão flutuante "Mover N itens" aparece quando há seleção e chama uma nova prop `onTransferMultiple(itemIds: string[])`.
- Manter botão individual de transferir já existente.
- Ocultar/desabilitar transferir quando `comanda.status === "em_cobranca"`.

**`src/pages/garcom/GarcomComandaDetalhe.tsx`**:
- Adicionar ícone `ArrowRightLeft` em cada `ComandaItemCard` (nova prop `onTransfer?`) que abre `TransferItemsDialog`.
- Modo de seleção múltipla com long-press ou botão "Selecionar" no header → checkboxes + botão "Mover (N)" no bottom bar.

**`src/components/garcom/ComandaItemCard.tsx`**:
- Nova prop `onTransfer?: () => void`. Adiciona botão `ArrowRightLeft` ao lado do `onRemove` existente.
- Nova prop opcional `selectMode?: boolean` + `selected?: boolean` + `onToggleSelect?: () => void` para renderizar checkbox.

**`src/components/pdv/cashier/PaymentDialog.tsx`** (linhas 680-720):
- Ao lado do botão `Trash2`, adicionar botão `ArrowRightLeft` (mesmo padrão `canRemove` — habilitado só quando `comanda.status !== "em_cobranca"` da origem; aqui já está sendo cobrada, então o botão fica desabilitado com tooltip "Comanda em cobrança — transferência não permitida"). Se a regra for permitir transferir antes de iniciar a cobrança, isso fica fora do PaymentDialog. **Decisão**: no PaymentDialog não permitir transferir (comanda já está sendo cobrada). Ao invés disso, manter ação de transferir apenas em Salon/Comandas/Garçom (antes do envio para o caixa).

### Regras de negócio aplicadas

| Regra | Implementação |
|---|---|
| Origem ≠ destino | Validação no mutation + filtro visual na lista |
| Comanda destino em cobrança/fechada/cancelada | Bloqueada visualmente + erro no servidor |
| Comanda origem em cobrança | Botão "Transferir" desabilitado |
| `kitchen_status` preservado | Update só altera `comanda_id` |
| Atomicidade | Update único com `.in("id", itemIds)` |
| Subtotais recalculam | Trigger `update_comanda_subtotal` (já existe) |
| Log auditoria | `logActivityDirect` com action `comanda_item_transfer` |
| Toast | "N item(s) movido(s) de Mesa X para Mesa Y" |
| Comanda origem fica vazia | Permanece `aberta` (não fechamos automaticamente) |

### Permissões

Para v1, qualquer usuário autenticado com acesso à comanda pode transferir (RLS atual já restringe). O enunciado pede "garçom responsável pela mesa, líder ou gestor" — porém não há campo `assigned_waiter_id` em `pdv_orders`. Se quiser restringir por role, adicionar guard com `useUserRole`: bloquear `caixa` (que opera o PaymentDialog) e permitir `garcom`, `gerente`, `proprietario`. Confirmação: aplicaremos esse guard simples no botão de transferir.

### Validação manual

1. Garçom: comanda da Mesa 3 → toca em item → "Transferir" → seleciona Mesa 5 (com 2 comandas) → escolhe a comanda do João → confirma → item some da origem, aparece no destino, totais recalculam, toast.
2. Selecionar 3 itens via checkbox → "Mover 3" → escolhe comanda avulsa → confirmação mostra os 3 itens e o total → confirma → tudo movido.
3. Tentar transferir para a própria comanda: opção não aparece na lista.
4. Tentar transferir para comanda em cobrança: card aparece desabilitado com tooltip.
5. Item com `kitchen_status="pronto"`: dialog mostra aviso amarelo, mas permite mover.
6. Transferir item de comanda `em_cobranca`: botão desabilitado.
7. Auditoria: gestor abre tela de logs e vê entrada `comanda_item_transfer` com IDs.
