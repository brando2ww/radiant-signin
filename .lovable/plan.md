

## Plano: preencher automaticamente o valor restante ao adicionar forma de pagamento dividido

### Problema
Ao dividir o pagamento, cada nova forma é adicionada com o campo de valor vazio. O operador precisa calcular mentalmente (ou na calculadora) quanto falta para completar o total.

### Solução
Ao adicionar uma nova forma de pagamento (`addSplitPayment`), preencher automaticamente o campo `amount` com o valor restante (`splitRemaining`). Assim o operador só precisa ajustar se quiser um valor diferente.

### Implementação

**Arquivo: `src/components/pdv/cashier/PaymentDialog.tsx`**

Alterar a função `addSplitPayment` (linha ~192) para calcular o restante e pré-preencher:

```typescript
const addSplitPayment = () => {
  const remaining = total - splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  setSplitPayments([
    ...splitPayments,
    {
      id: crypto.randomUUID(),
      method: "dinheiro",
      amount: remaining > 0 ? remaining.toFixed(2) : "",
      installments: "1",
    },
  ]);
};
```

### Arquivos
- **Editado:** `src/components/pdv/cashier/PaymentDialog.tsx` (1 ponto: `addSplitPayment`)

