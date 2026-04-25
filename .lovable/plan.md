## Corrigir contador "Mesa tem mais N comanda(s)"

**Bug confirmado no banco:** a Mesa 03 tem apenas 1 comanda aberta, mas o card mostra "Mesa tem mais 1 comanda".

**Causa:** em `SalonQueuePanel.tsx`, `openCountByOrderId` conta todas as comandas abertas/em_cobrança do `order_id`, inclusive a do próprio card. Para `siblings` (irmãs), deve-se subtrair 1.

### Mudança

**`src/components/pdv/cashier/SalonQueuePanel.tsx`** (linhas ~307-310)

Trocar:
```ts
const siblings = c.order_id
  ? openCountByOrderId.get(c.order_id) ?? 0
  : 0;
```
por:
```ts
const siblings = c.order_id
  ? Math.max(0, (openCountByOrderId.get(c.order_id) ?? 0) - 1)
  : 0;
```

Assim o aviso "Mesa tem mais N comanda(s)" só aparece quando realmente existem outras comandas além da exibida no card.