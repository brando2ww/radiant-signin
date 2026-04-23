

## Mostrar a mesa na comanda + garantir que mesa fica ocupada

### Estado atual

- A mesa é marcada `ocupada` corretamente quando o garçom abre a mesa via dialog (já implementado).
- Porém, na tela da comanda (`/garcom/comanda/:id`), não há nenhuma referência à mesa de origem — o garçom não sabe se está atendendo uma comanda de mesa ou avulsa.
- Na lista geral de comandas (`/garcom/comandas`), também não aparece a mesa.

### Mudanças

**1. `src/pages/garcom/GarcomComandaDetalhe.tsx` — mostrar a mesa no header**

- Importar `usePDVTables`.
- Resolver `tableOfComanda = tables.find(t => t.current_order_id === comanda.order_id)` (somente quando `comanda.order_id` existe).
- No header, abaixo do `comanda_number`, exibir um badge/linha:
  - Se houver mesa: `Mesa {table.table_number}` (com ícone `Table` ou `Utensils` do lucide-react), tocável → navega para `/garcom/mesa/{table.id}`.
  - Se não houver: `Comanda avulsa` em texto secundário.
- Layout: `comanda_number` à esquerda na linha pequena, e a indicação da mesa em chip ao lado (ou logo abaixo) com `text-xs` e cor primária quando clicável.

**2. `src/pages/garcom/GarcomComandas.tsx` — mostrar mesa na lista**

- Importar `usePDVTables` e mapear `order_id → table_number`.
- No subtítulo de cada card, junto com itens/total, prefixar com `Mesa X · ` quando a comanda pertencer a uma mesa, ou `Avulsa · ` quando não.

**3. Garantir mesa ocupada quando criar comanda nominal extra (`splitOpen`) — verificação defensiva**

No `handleCreateNominal` em `GarcomMesaDetalhe.tsx`, se por algum motivo a mesa não estiver `ocupada` (caso de borda), atualizar para `ocupada` antes de criar a nova comanda. Já há um `current_order_id` exigido no fluxo, então o caso é raro, mas garantimos consistência.

**4. Liberar mesa ao fechar a última comanda (já era esperado, vou verificar)**

- Confirmar via leitura do `closeComandaMutation` em `use-pdv-comandas.ts` se a mesa volta para `livre` quando todas as comandas da mesma `order_id` são fechadas. Se não estiver implementado, adicionar lógica:
  - Após fechar uma comanda com `order_id`, contar quantas comandas `aberta` ainda existem para esse `order_id`. Se for 0: marcar `pdv_orders.status = 'fechada'` e `pdv_tables.status = 'livre'`, `current_order_id = null` para a mesa correspondente.

### Validação

- Abrir Mesa 04 com comandas "João" e "Maria" → mesa fica ocupada (✓ já funciona).
- Tocar em "João" → tela da comanda mostra no header: nome "João", número "20260423-038", e logo abaixo um chip clicável **"Mesa 04"** com ícone.
- Tocar no chip "Mesa 04" → volta para `/garcom/mesa/{id}` mostrando ambas as comandas.
- Em `/garcom/comandas`, cada item da lista mostra `"Mesa 04 · 0 itens · R$ 0,00"`.
- Comanda avulsa (sem mesa) → header mostra "Comanda avulsa", lista mostra "Avulsa · ...".
- Fechar a última comanda da mesa → mesa volta para `livre` no `/garcom`.

