

## Plano: impedir fechamento do caixa com comandas abertas

### Regra
Ao clicar em "Fechar Caixa" (F4), o sistema deve verificar se existem comandas com `status === "aberta"`. Se houver, exibir um `toast.error` informando quantas comandas estão abertas e **não abrir** o dialog de fechamento.

### Implementação

**Arquivo: `src/pages/pdv/Cashier.tsx`**

1. No handler do botão "Fechar Caixa" (que hoje faz `setCloseDialog(true)`), adicionar verificação antes de abrir o dialog:
   - Filtrar `comandas` com `status === "aberta"`
   - Se houver comandas abertas: `toast.error("Existem X comanda(s) aberta(s). Feche ou cancele todas antes de encerrar o caixa.")`; não abrir o dialog
   - Se não houver: abrir normalmente

2. Aplicar a mesma verificação no atalho `F4` (dentro do `useEffect` de keyboard shortcuts), que também chama `setCloseDialog(true)`.

### Arquivos
- **Editado:** `src/pages/pdv/Cashier.tsx` (2 pontos: handler do sidebar e atalho F4)

