

## Remover prefixo "M" duplicado nos cards de mesa

### Causa

`TableCard` (grade do Salão) e `DraggableMapTable` (mapa do Salão) renderizam o número da mesa com `M{table.table_number}` hardcoded. Como o `table_number` no banco já vem como `"Mesa 04"`, o resultado é `MMesa 04`. Quando vier apenas `"5"`, mostra `M5` (também fora do padrão usado no resto do app, que é `Mesa 5`).

A util `formatTableLabel(value)` em `src/utils/formatTableNumber.ts` já existe e trata os dois casos: retorna `"Mesa 04"` se já tem prefixo, ou `"Mesa 5"` se não tem.

### Mudança

**`src/components/pdv/TableCard.tsx`**
- Importar `formatTableLabel`.
- Linha 178: trocar `M{table.table_number}` por `{formatTableLabel(table.table_number)}`.
- Reduzir levemente o `text-lg font-bold` para `text-sm font-bold leading-tight px-1 text-center` (acomoda "Mesa 04" sem estourar o quadrado da mesa).

**`src/components/pdv/salon/DraggableMapTable.tsx`**
- Importar `formatTableLabel`.
- `getTableLabel()` (linhas 143-148):
  - Mesa simples → `formatTableLabel(table.table_number)`.
  - Mesa unida → `${formatTableLabel(table.table_number)} + ${formatTableLabel(mergedTable.table_number)}` (mesmo padrão, só junta com " + ").
- Linha 126 (toast de seleção para união): trocar `Mesa M${table.table_number}` por `${formatTableLabel(table.table_number)}` (atualmente sairia "Mesa MMesa 04").

**`src/pages/garcom/GarcomMesas.tsx`**
- Passar `tableNumber={formatTableLabel(table.table_number)}` em vez do valor cru, garantindo consistência com o resto do app.

### Validação

- Salão (`/pdv/salao`): grade mostra `Mesa 04`, `Mesa 03`, etc., sem `MM`.
- Mapa do Salão: mesmo padrão; mesas unidas aparecem como `Mesa 04 + Mesa 05`.
- Toast ao selecionar mesa para união mostra `Mesa 04 selecionada...`.
- Garçom (`/garcom`): nada visualmente diferente (já mostrava certo), mas agora robusto se vier número cru.
- Texto cabe sem estourar nos cards de mesa de capacidade pequena.

