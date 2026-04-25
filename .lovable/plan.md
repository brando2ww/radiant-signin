## Remover ação "Devolver ao garçom" do painel Salão

Como o garçom não fecha mais comandas, devolvê-las deixa de fazer sentido — o caixa deve apenas cobrar.

### Mudanças

**`src/components/pdv/cashier/SalonQueueCard.tsx`**
- Remover botão "Devolver ao garçom" (ícone `Undo2`) e o `AlertDialog` de motivo.
- Remover props `onReturnToWaiter` e `isReturning`, estados `returnDialog`/`returnReason` e o handler `handleConfirmReturn`.
- Remover imports não usados: `AlertDialog*`, `Textarea`, `Undo2`.

**`src/components/pdv/cashier/SalonQueuePanel.tsx`**
- Remover props `onReturnToWaiter` e `isReturning` do `<SalonQueueCard>`.
- Remover destructuring de `returnToWaiter` e `isReturningToWaiter` do hook.

A mutation `returnToWaiter` em `use-pdv-comandas.ts` permanece exportada por enquanto (não há outros consumidores; pode ser limpa em outro passo se desejado).