

## Rolagem nos Itens da Cotação

O dialog já tem um `ScrollArea` geral, mas a lista de itens cresce indefinidamente sem limite de altura. Quando há muitos itens, o dialog inteiro estica e os botões de ação ficam fora da tela.

### Correção

Adicionar `max-h-[300px] overflow-y-auto` no container da lista de itens (linha 226, o `div.space-y-3` que envolve os cards dos itens). Isso garante que a lista de itens tenha rolagem própria quando ultrapassar 300px, mantendo o restante do formulário (prazo, mensagem, observações) sempre acessível.

### Arquivo

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/purchases/QuotationRequestDialog.tsx` | Linha 226: adicionar `max-h-[300px] overflow-y-auto` ao container dos itens |

