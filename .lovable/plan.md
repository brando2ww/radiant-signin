## Ajuste

Hoje, ao tocar em "Enviar para cozinha" na tela de conferência da comanda, o rascunho é enviado e o garçom permanece na tela da comanda. O comportamento desejado é que, após o envio bem-sucedido, o garçom seja redirecionado de volta para a tela de mesas.

## Mudança

**Arquivo:** `src/pages/garcom/GarcomComandaDetalhe.tsx`

No handler `handleFlushDraft`, após `draft.clear(id)` e `toast.success(...)`, adicionar:

```ts
navigate("/garcom");
```

Isso garante que, ao confirmar o envio do pedido, o garçom retorna imediatamente para a listagem de mesas (`/garcom`), pronto para atender outra mesa. Em caso de erro, permanece na tela atual para nova tentativa.

Nenhuma outra tela é alterada — o fluxo do `GarcomMesaDetalhe` (que já navega para `/garcom` após flush) continua igual.