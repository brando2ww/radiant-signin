## Problema

No diálogo de cobrança (`src/components/pdv/cashier/PaymentDialog.tsx`), ao clicar em **Confirmar** na etapa de autorização do desconto, o sistema mostra o toast "Desconto aplicado", porém grava o valor como **R$ 0,00** — efetivamente sem desconto algum.

## Causa raiz

A variável `previewAmount` (linha 274) só calcula o valor do desconto enquanto `discountStage === "typing"`:

```ts
const previewAmount = discountStage === "typing"
  ? (discountTypeChosen === "percent" ? (subtotal * pct) / 100 : valor)
  : 0;
```

Mas o fluxo é:
1. Operador digita o valor (`stage = "typing"`).
2. Clica em **"Aplicar desconto"** → `setDiscountStage("confirming")` (linha 1174).
3. Na tela de confirmação digita motivo + senha + clica **"Confirmar"** (linha 1334).
4. Nesse momento, `stage === "confirming"` → `previewAmount === 0` → `setAppliedDiscount({ amount: 0, ... })`.

Resultado: o desconto fica zerado independentemente do que foi digitado.

## Correção

Calcular o valor do desconto a partir de `discountValue` + `discountTypeChosen` no momento do `onClick` do botão Confirmar, sem depender de `previewAmount`. O mais limpo é extrair o cálculo em uma função/`useMemo`:

```ts
const computedDiscountAmount = (() => {
  const v = parseFloat(discountValue) || 0;
  if (v <= 0) return 0;
  return discountTypeChosen === "percent"
    ? (subtotal * v) / 100
    : v;
})();
```

E então:
- Substituir `previewAmount` (usado em UI da etapa "typing") para reusar `computedDiscountAmount` quando `stage === "typing"`.
- No `onClick` do Confirmar (linha 1334), usar `computedDiscountAmount` em vez de `previewAmount`.
- Manter a checagem `previewExceedsSubtotal` baseada em `computedDiscountAmount`.

## Arquivos alterados

- `src/components/pdv/cashier/PaymentDialog.tsx` — extrair cálculo do valor do desconto e usar no handler "Confirmar" para que o `appliedDiscount.amount` reflita o valor digitado em qualquer estágio.

## Validação após implementação

1. Abrir cobrança de uma comanda com subtotal conhecido (ex.: R$ 100).
2. Aplicar desconto de 10% → confirmar → total deve cair para R$ 90 (ou R$ 99 com taxa).
3. Aplicar desconto fixo de R$ 15 → confirmar → total deve refletir o abate.
4. Verificar no caixa/movimento que o `amount` gravado é o valor com desconto.
