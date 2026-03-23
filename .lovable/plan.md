

## Fix: Abrir PaymentDialog ao fechar pedido no Balcão

### Problema
Ao clicar "Fechar Pedido" no Balcão, o `OrderDetailsDialog` chama `closeOrder(id)` diretamente, que apenas fecha o pedido no banco sem registrar pagamento. Não existe `PaymentDialog` na página Balcão.

### Solução
Interceptar o "Fechar Pedido" para abrir o `PaymentDialog` antes de finalizar, igual ao fluxo do Caixa.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/Balcao.tsx` | Importar `PaymentDialog` e `usePDVComandas`. Ao clicar "Fechar Pedido", em vez de chamar `closeOrder` diretamente, abrir o `PaymentDialog` com os dados do pedido. Após pagamento confirmado, fechar o pedido |

### Fluxo corrigido
1. Usuário clica "Fechar Pedido" no `OrderDetailsDialog`
2. `handleCloseOrder` fecha o dialog de detalhes e abre o `PaymentDialog` com o pedido selecionado
3. Usuário escolhe método de pagamento e confirma
4. `PaymentDialog` registra o pagamento via `usePDVPayments`
5. Pedido é finalizado

### Detalhes
- O `PaymentDialog` aceita `comanda` ou `table` — como o Balcão trabalha com orders diretos (sem comanda), vou criar uma comanda virtual (objeto compatível) a partir do order para alimentar o dialog
- Itens do pedido serão mapeados para o formato de `ComandaItem` esperado pelo `PaymentDialog`
- O `closeOrder` será chamado após o pagamento ser registrado com sucesso (no `onSuccess` do PaymentDialog)

