

## Itens não somem/aparecem no PaymentDialog sem reload

### Causa

O `PaymentDialog` usa as props `items` / `tableItems` / `comanda.subtotal` como **snapshots** que o parent (`Cashier.tsx`, `Salon.tsx`, `Balcao.tsx`) gravou em estado no momento de abrir o dialog. Quando `removeItem`/`addItem` invalida as queries, o React Query refaz o fetch — mas essas props não são reatribuídas até o usuário fechar e reabrir o dialog. Resultado: a lista visual não muda, e o subtotal/taxa/total continuam refletindo o estado antigo.

### Correção em `src/components/pdv/cashier/PaymentDialog.tsx`

Derivar `displayItems` e `subtotal` da fonte **viva** (`comandas` e `comandaItems` do `usePDVComandas`), caindo de volta para as props apenas quando a fonte viva ainda não tem o registro (compatível com `Balcao.tsx`, que monta uma "comanda virtual" sem id real no banco).

**1. Expandir o destructuring do hook** para incluir `comandaItems`:

```tsx
const {
  markAsCharging,
  releaseFromCharging,
  removeItem, isRemovingItem,
  addItem, isAddingItem,
  comandaItems: liveComandaItems,
} = usePDVComandas();
```

**2. Substituir `displayItems` e `subtotal`** pela versão derivada da fonte viva, com fallback para as props (Balcão usa comanda virtual):

```tsx
const liveItemsForPayment = isTablePayment
  ? liveComandaItems.filter((it) => tableComandas.some((c) => c.id === it.comanda_id))
  : comanda
    ? liveComandaItems.filter((it) => it.comanda_id === comanda.id)
    : [];

const displayItems = liveItemsForPayment.length > 0
  ? liveItemsForPayment
  : (isTablePayment ? tableItems : items);

const liveSubtotal = displayItems.reduce((sum, it) => sum + Number(it.subtotal || 0), 0);
const subtotal = liveItemsForPayment.length > 0
  ? liveSubtotal
  : (isTablePayment
      ? tableComandas.reduce((sum, c) => sum + c.subtotal, 0)
      : (comanda?.subtotal || 0));
```

`discountAmount`, `serviceFeeAmount`, `total`, `changeAmount`, `splitRemaining` já dependem de `subtotal` — recalculam sozinhos.

### Por que funciona

- `removeItem` e `addItem` invalidam `pdv-comanda-items` e `pdv-comandas`. O `PaymentDialog` agora consome essa query diretamente (mesma instância no cache do React Query), então o re-render é imediato — sem reload, sem fechar/reabrir o dialog.
- `Balcao.tsx` usa "comanda virtual" derivada de `pdv_orders` (não existe em `pdv_comandas`); o fallback para a prop `items` mantém o comportamento atual ali.
- `AnimatePresence` continua animando entrada/saída suavemente.

### Validação

- Comanda real (Cashier/Salon): clicar lixeira → confirmar → linha some imediatamente, subtotal/taxa/total recalculam, dialog permanece aberto.
- "Adicionar item" → confirmar → nova linha aparece imediatamente, totais sobem.
- Mesa com múltiplas comandas: remover item de qualquer comanda atualiza lista e total em tempo real.
- Balcão: pagamento direto inalterado (fallback).

