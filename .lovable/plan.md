

## Fix: Taxa de serviço sempre ligada + senha para ambos tipos de desconto

### Problema 1: Taxa de serviço começa desligada
Na linha 169 do `PaymentDialog.tsx`, o `useEffect` de reset seta `setServiceFeeEnabled(false)`. Deveria ser `true`.

### Problema 2: Senha de desconto para % e valor
O código atual já mostra a senha quando `hasDiscount > 0` (ambos os tipos). Porém, ao trocar entre % e $, o `discountValue` é mantido mas a autorização é resetada corretamente. Vou garantir que o fluxo funcione sem falhas para ambos os tipos, incluindo recalcular o limite quando o tipo muda.

### Arquivo

| Arquivo | Acao |
|---------|------|
| `src/components/pdv/cashier/PaymentDialog.tsx` | Linha 169: mudar `setServiceFeeEnabled(false)` para `setServiceFeeEnabled(true)`. Garantir que ao trocar `discountType` (linhas 357/369) o `discountAuthorized` seja resetado para forçar revalidação com o novo tipo |

### Detalhe

```tsx
// Linha 169 — fix taxa de serviço
setServiceFeeEnabled(true);  // era false

// Nos botões de troca de tipo (linhas 357, 369) — adicionar reset de autorização
onClick={() => {
  setDiscountType("percent"); // ou "value"
  setDiscountAuthorized(false);
  setDiscountAuthorizedBy("");
  setDiscountPassword("");
}}
```

Isso garante que ao trocar o tipo de desconto, a senha precisa ser redigitada (pois o limite em % pode ser diferente do valor absoluto equivalente).

