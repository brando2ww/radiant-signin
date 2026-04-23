

## Editar pedido no PaymentDialog: remover e adicionar itens

Permitir que o caixa corrija lançamentos do garçom diretamente no dialog de pagamento — removendo itens e adicionando produtos avulsos quando a cobrança envolve uma única comanda. Os totais recalculam automaticamente via invalidação das queries existentes.

### Mudanças

**1. `src/components/pdv/cashier/PaymentDialog.tsx`** — núcleo da feature

Imports adicionais: `Trash2`, `Search` de `lucide-react`, `AlertDialog*` de `@/components/ui/alert-dialog`, `Tooltip*` de `@/components/ui/tooltip`. Expandir o destructuring de `usePDVComandas` para incluir `removeItem`, `addItem` e seus `isPending`. Importar `usePDVProducts` para a busca.

**Remover item (linhas 568–579 do resumo)**

- Cada linha do `displayItems.map` ganha um `Button variant="ghost" size="icon"` (`h-7 w-7`, ícone `Trash2 h-4 w-4 text-destructive`) à direita do valor.
- Habilitação por `kitchen_status`:
  - `pendente` ou `preparando` → habilitado.
  - `pronto`, `entregue` ou `cancelado` → desabilitado, envolto em `Tooltip` com texto "Item já preparado pela cozinha — não pode ser removido".
- Estado local `itemToRemove: ComandaItem | null`. Clique abre `AlertDialog`:
  - Título: "Remover item?"
  - Descrição: "{quantity}x {product_name} — {formatCurrency(subtotal)} será removido da conta. Esta ação não pode ser desfeita."
  - Ação destrutiva "Remover" → `removeItem(itemToRemove.id)`; `isRemovingItem` desabilita o botão e mostra `Loader2`.
- Animação de saída: envolver cada linha em `motion.div` (framer-motion já importado) com `AnimatePresence`, `exit={{ opacity: 0, height: 0, marginTop: 0 }}` e `layout` para deslizar suavemente.

**Adicionar item**

- Logo abaixo do `ScrollArea` da lista, dentro do mesmo `Card`:
  - Se `isTablePayment && tableComandas.length > 1` → hint discreto: `<p className="text-xs text-muted-foreground italic">Para adicionar itens, acesse a comanda específica.</p>`.
  - Caso contrário → `Button variant="outline" size="sm"` com ícone `Plus` "Adicionar item".
- Estado `addItemDialogOpen: boolean`. Ao clicar abre um `Dialog` secundário "Adicionar item à comanda":
  - Input de busca (ícone `Search`) com filtro client-side por nome/SKU sobre `pdv_products` ativos via `usePDVProducts`.
  - `ScrollArea h-[300px]` listando produtos: nome, preço (formatBRL), botão de selecionar.
  - Após seleção: campo numérico "Quantidade" (default 1, min 1), `Textarea` opcional "Observações", botão "Adicionar" (com `isAddingItem` para loading).
- Ao confirmar chama `addItem` com `comanda_id` = `comanda?.id ?? tableComandas[0].id`, `product_id`, `product_name`, `quantity`, `unit_price`, `notes`. **Sem manipulação de `kitchen_status`** — o hook usa o default existente.
- Sucesso: fecha o dialog secundário, reseta estado, toast já vem do hook.

**Recálculo automático**

- Nenhum cálculo manual: `comanda.subtotal` (DB-side) e `tableComandas` são reidratados pela invalidação de `pdv-comanda-items` e `pdv-comandas` que as mutations já fazem. `discountAmount`, `serviceFeeAmount` e `total` recomputam no próximo render.
- Para feedback de "fade" no total final, envolver o bloco do total em `motion.div` com `key={total}` para reanimar suavemente quando o valor muda.

**2. `src/hooks/use-pdv-comandas.ts`** — exposições

- Expor `isAddingItem` e `isRemovingItem` (via `.isPending` das mutations existentes) no retorno do hook, para feedback de loading nos botões.

### Comportamento e bordas

- Lock `em_cobranca` permanece intacto: as mutations atuam em `pdv_comanda_items`, não em `pdv_comandas`.
- Cancelar o PaymentDialog após editar mantém as alterações persistidas; o `useEffect` de cleanup libera o lock e a comanda volta a `aguardando_pagamento`.
- Comanda esvaziada (subtotal R$ 0,00): dialog continua aberto, caixa decide.
- Mesa com múltiplas comandas: remoção funciona em qualquer item; adição fica oculta com hint visível.

### Validação

- Cobrar comanda com 5 itens (todos `pendente`): clicar lixeira em "1x Batata frita" → AlertDialog → confirmar → linha desliza para fora, subtotal/taxa 10%/total recalculam, toast "Item removido!".
- Item com `kitchen_status="entregue"`: lixeira desabilitada, tooltip aparece no hover.
- Clicar "Adicionar item" → buscar "Coca" → quantidade 2 → confirmar → linha aparece, subtotal sobe, taxa recalcula, toast "Item adicionado!".
- Cobrança de mesa com 2+ comandas: lixeira funciona em todos itens; botão "Adicionar" oculto, hint visível.
- Cancelar PaymentDialog após remover/adicionar: alterações persistem no banco; comanda volta para `aguardando_pagamento`; lock liberado.
- Desconto e taxa de serviço configurados antes da edição: ao remover item, ambos recalculam sobre o novo subtotal sem reentrada manual.

