

## Validação de Capacidade nas Comandas e Total da Mesa por Comandas

### Mudanças

**1. Total da mesa = soma das comandas**

Atualmente o `orderTotal` vem de `order.total` (que fica R$ 0.00). Mudar para somar os subtotais de todas as comandas abertas da mesa.

- Em `Salon.tsx`: calcular `orderTotal` como soma dos subtotais das comandas da mesa em vez de usar `order.total`
- Em `TableDetailsDialog.tsx`: sem mudança necessária (já recebe `orderTotal` como prop)

**2. Validação de capacidade ao criar comanda**

Ao clicar "Nova" comanda dentro de uma mesa, verificar se o total de `person_number` das comandas existentes já atingiu a capacidade da mesa. Se exceder, mostrar um AlertDialog de confirmação antes de abrir o ComandaDialog.

- Em `Salon.tsx`: no `handleOpenTableComandaDialog`, calcular pessoas alocadas vs capacidade. Se exceder, mostrar popup de confirmação antes de prosseguir.
- Novo state: `capacityWarningOpen` e `pendingComandaData` para controlar o fluxo de confirmação.

**3. ComandaDialog: person_number padrão e validação**

Quando a comanda é criada dentro de uma mesa, o campo "Número de Pessoas" deve aparecer sempre (não apenas quando tem `orderId`). O padrão deve ser 1.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/Salon.tsx` | Calcular `orderTotal` pela soma das comandas. Adicionar lógica de validação de capacidade com AlertDialog de confirmação |
| `src/components/pdv/ComandaDialog.tsx` | Mostrar campo "Número de Pessoas" sempre que for comanda de mesa (com `tableNumber`). Default 1 |
| `src/components/pdv/TableDetailsDialog.tsx` | Nenhuma mudança estrutural necessária |

### Fluxo de validação

```text
Usuário clica "+ Nova" comanda na mesa (cap. 6)
→ Comandas existentes: Pessoa 1 (2 pessoas) + Pessoa 2 (3 pessoas) = 5 alocadas
→ Nova comanda com 2 pessoas → total seria 7 > 6
→ AlertDialog: "A mesa tem capacidade para 6 pessoas e já possui 5 alocadas. Deseja continuar mesmo assim?"
→ Sim → cria comanda normalmente
→ Não → cancela
```

A validação acontece ao **submeter** o ComandaDialog (não ao abrir), pois o número de pessoas é definido no formulário.

### Detalhe técnico

No `Salon.tsx`, o `orderTotal` passará a ser:
```typescript
const tableComandas = getTableComandas(selectedTableForDetails.current_order_id);
const comandasTotal = tableComandas.reduce((sum, c) => sum + c.subtotal, 0);
// Passar comandasTotal como orderTotal
```

A validação de capacidade será feita no `handleCreateComanda`:
```typescript
// Antes de criar, verificar capacidade
const existingPersons = tableComandas.reduce((sum, c) => sum + (c.person_number || 1), 0);
const newPersons = data.personNumber || 1;
if (existingPersons + newPersons > table.capacity) {
  // Mostrar AlertDialog de confirmação
}
```

