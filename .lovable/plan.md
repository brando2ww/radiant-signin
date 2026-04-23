

## Corrigir prefixo duplicado "Mesa Mesa 04"

### Causa

A coluna `pdv_tables.table_number` armazena valores inconsistentes — alguns só com número (`"4"`, `"5"`), outros já com o prefixo (`"Mesa 04"`, `"mesa 02"`). Em todas as telas, o front renderiza ``Mesa ${table.table_number}``, gerando "Mesa Mesa 04" para os que já vêm prefixados.

### Solução: helper de formatação único

Criar `src/utils/formatTableNumber.ts` exportando `formatTableLabel(tableNumber)`:
- Se vazio → `"Mesa"`.
- Se começa com `"mesa"` (case-insensitive) → normaliza para `"Mesa <resto>"`.
- Caso contrário → `"Mesa <valor>"`.

Substituir em todos os lugares onde aparece `` `Mesa ${X.table_number}` ``:

- `src/pages/garcom/GarcomMesaDetalhe.tsx` — header (linha 245), título do dialog "Abrir Mesa ..." (linha 350), e qualquer outro `Mesa {table.table_number}` no arquivo (label de comanda na linha ~249 e textos de cards).
- `src/pages/garcom/GarcomComandaDetalhe.tsx` — chip "Mesa X" (linha 73).
- `src/pages/garcom/GarcomComandas.tsx` — `Mesa ${t.table_number}` no subtítulo da lista.
- `src/components/pdv/TableDetailsDialog.tsx` — DialogTitle (linha 92) e AlertDialogDescription (linha 231).
- `src/components/pdv/ComandaDialog.tsx` — `- Mesa {tableNumber}` (linha 67).
- `src/components/pdv/cashier/ChargeSelectionDialog.tsx` — linha 398.
- `src/pages/pdv/FranchiseImport.tsx` — linhas 227 e 494.
- `src/components/super-admin/FranchiseSection.tsx` — linha 345.

Em todos: trocar ``Mesa ${x.table_number}`` por `{formatTableLabel(x.table_number)}` (e o "Abrir Mesa X" para `Abrir {formatTableLabel(table.table_number)}`).

### Validação

- Mesa cuja `table_number = "Mesa 04"` → exibe **"Mesa 04"**.
- Mesa cuja `table_number = "mesa 02"` → exibe **"Mesa 02"** (case normalizado).
- Mesa cuja `table_number = "5"` → exibe **"Mesa 5"**.
- Header da gestão da mesa, dialog de abertura, chip na comanda, lista de comandas, dialogs do PDV — todos consistentes, sem "Mesa Mesa".
- Não altera dados no banco — só corrige a exibição. Cadastrar novas mesas continua aceitando qualquer formato; o helper normaliza.

