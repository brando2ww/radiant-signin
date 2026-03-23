

## Fix: Balcão requer caixa aberto + usar preço correto de balcão

### Problema 1: Criar pedido no balcão sem caixa aberto
O botão "Novo Pedido" no Balcão funciona sem verificar se o caixa está aberto. Deve bloquear e mostrar toast/alerta pedindo para abrir o caixa primeiro (mesmo comportamento do Salão).

### Problema 2: Preço de salão sendo usado no balcão
O `AddItemDialog` usa `selectedProduct.price_salon` hardcoded (linhas 54, 99, 115, 165). Quando o pedido é do balcão, deveria usar `price_balcao` (se existir) em vez de `price_salon`.

### Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/pdv/Balcao.tsx` | Importar `usePDVCashier`, verificar `activeSession` antes de permitir criar pedido. Se caixa fechado, mostrar toast de erro |
| `src/components/pdv/AddItemDialog.tsx` | Adicionar prop `source` (opcional, default "salon"). Quando `source === "balcao"`, usar `price_balcao ?? price_salon` em vez de `price_salon` nas linhas 54, 99, 115, 165 |
| `src/components/pdv/OrderDetailsDialog.tsx` | Passar `source={order?.source}` para o `AddItemDialog` |

### Detalhes

**Balcao.tsx** - guard de caixa:
```tsx
const { activeSession } = usePDVCashier();

const handleNewOrder = () => {
  if (!activeSession) {
    toast.error("Abra o caixa antes de criar pedidos no balcão");
    return;
  }
  setNewOrderOpen(true);
};
```

**AddItemDialog.tsx** - preço por source:
```tsx
// Nova prop
interface AddItemDialogProps {
  source?: string; // "balcao" | "salon" | "delivery"
  // ...existing
}

// Helper para pegar preço correto
const getPrice = (product: any) => {
  if (source === "balcao") return product.price_balcao ?? product.price_salon;
  if (source === "delivery") return product.price_delivery ?? product.price_salon;
  return product.price_salon;
};
```

Substituir todas as referências a `price_salon` por `getPrice(product)`.

