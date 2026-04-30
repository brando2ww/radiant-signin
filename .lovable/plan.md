## Problema

Ao clicar em "Remover" em um item do **Resumo do Pedido** (PaymentDialog), o item é deletado no banco e o toast "Item removido!" aparece, mas a linha continua visível na lista até a página ser recarregada.

## Causa raiz

Em `src/components/pdv/cashier/PaymentDialog.tsx` (linhas 216-226), `displayItems` é montado assim:

```ts
const liveItemsForPayment = liveComandaItems.filter(...);
const displayItems = liveItemsForPayment.length > 0
  ? liveItemsForPayment
  : (isTablePayment ? tableItems : items);   // <- snapshot vindo via props
```

A query `["pdv-comanda-items", visibleUserId, activeComandaIdsKey]` em `use-pdv-comandas.ts` é invalidada após o `removeItem`, **mas seu `queryKey` depende de `activeComandaIdsKey`** — uma string derivada de `comandas` filtradas por status. Quando o item é deletado:

1. A invalidate dispara refetch das duas queries.
2. `pdv-comandas` retorna primeiro e atualiza `subtotal` da comanda — em alguns cenários (ex: comanda fica em `aguardando_pagamento`/`em_cobranca` durante o PaymentDialog) `activeComandaIds` continua igual, então o cache antigo de items é reusado momentaneamente.
3. O `select * from pdv_comanda_items` é refeito, mas o React render entre invalidate e response usa o array antigo, e o item permanece visível porque o componente não tem nenhum estado local que force re-mount/animação de saída do item recém-removido.
4. Pior: para **Balcão** (comanda virtual sem registro real), `liveItemsForPayment.length === 0` e o fallback usa `items` recebido por props — esse array nunca é atualizado, então o item nunca some.

Adicionalmente, `removeItem` é chamado sem `await` e o `AlertDialog` fecha imediatamente (`setItemToRemove(null)`), então a UI volta ao Resumo antes do refetch chegar — sem otimismo, o usuário vê o item ainda lá.

## Correção

Aplicar **atualização otimista** no `removeItemMutation` (cache-first) para que o item suma instantaneamente do `displayItems`, mantendo o refetch em segundo plano apenas como reconciliação. E garantir que o fallback do PaymentDialog também respeite a remoção otimista quando `liveItemsForPayment` estiver vazio (Balcão).

### 1. `src/hooks/use-pdv-comandas.ts` — `removeItemMutation`

Trocar para `onMutate` otimista que remove o item de **todas** as queries `["pdv-comanda-items", ...]` no cache, com rollback em erro:

```ts
const removeItemMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase.from("pdv_comanda_items").delete().eq("id", id);
    if (error) throw error;
  },
  onMutate: async (id: string) => {
    await queryClient.cancelQueries({ queryKey: ["pdv-comanda-items"] });
    const snapshots = queryClient.getQueriesData<ComandaItem[]>({ queryKey: ["pdv-comanda-items"] });
    snapshots.forEach(([key, data]) => {
      if (Array.isArray(data)) {
        queryClient.setQueryData(key, data.filter((it) => it.id !== id));
      }
    });
    return { snapshots };
  },
  onError: (error, _id, ctx) => {
    ctx?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    toast.error("Erro ao remover item: " + error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["pdv-comanda-items"] });
    queryClient.invalidateQueries({ queryKey: ["pdv-comandas"] });
  },
  onSuccess: () => toast.success("Item removido!"),
});
```

### 2. `src/components/pdv/cashier/PaymentDialog.tsx` — fallback do Balcão

Manter um `Set<string>` local de IDs removidos otimisticamente e filtrá-los do `displayItems` mesmo no caminho fallback (para o caso Balcão onde `items` vem por props):

```ts
const [optimisticallyRemoved, setOptimisticallyRemoved] = useState<Set<string>>(new Set());

const displayItems = (liveItemsForPayment.length > 0
  ? liveItemsForPayment
  : (isTablePayment ? tableItems : items)
).filter((it) => !optimisticallyRemoved.has(it.id));

// no AlertDialog action:
onClick={(e) => {
  e.preventDefault();
  if (!itemToRemove) return;
  setOptimisticallyRemoved((s) => new Set(s).add(itemToRemove.id));
  removeItem(itemToRemove.id);
  setItemToRemove(null);
}}
```

Resetar `optimisticallyRemoved` quando o dialog fechar (`open === false`) para evitar vazamento entre aberturas.

### 3. Verificar recálculo de totais

Como `liveSubtotal`, `fullSubtotal`, `selectableItems`, `previewAmount` e `computedDiscountAmount` derivam de `displayItems`, todos recalculam automaticamente após a remoção otimista. Nenhuma mudança extra necessária.

## Arquivos editados

- `src/hooks/use-pdv-comandas.ts` — `removeItemMutation` com update otimista + rollback.
- `src/components/pdv/cashier/PaymentDialog.tsx` — set local `optimisticallyRemoved`, filtro em `displayItems`, reset no `onOpenChange`.

## Resultado esperado

Clicar em "Remover" → item desaparece da lista instantaneamente (com a animação `AnimatePresence` já existente), totais e desconto recalculam na hora, sem necessidade de F5. Em caso de erro do servidor, o item reaparece e um toast de erro é exibido.