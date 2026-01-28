

## Plano: Corrigir Erros ao Cadastrar Insumos

### Problemas Identificados

1. **Form limpa dados ao dar erro**: No arquivo `IngredientDialog.tsx`, linha 195, o `form.reset()` é chamado **imediatamente após submit**, antes de saber se a operação foi bem-sucedida ou não
2. **Erro de código duplicado**: A constraint `pdv_ingredients_code_key` exige valores únicos. Quando o código é deixado vazio, ele envia string vazia `""`, e já existe um registro com código vazio no banco

---

### Solucao

#### 1. Mover `form.reset()` para Callback de Sucesso

**Arquivo:** `src/components/pdv/IngredientDialog.tsx`

Remover o `form.reset()` de dentro do `handleSubmit` e deixar o reset ser controlado apenas pelo `useEffect` quando o dialog abre/fecha.

**De (linha 182-196):**
```typescript
const handleSubmit = form.handleSubmit((data) => {
  const avgCost = data.unit_cost * (1 + data.loss_percentage / 100);
  const currentBalance = data.current_stock * avgCost;
  
  onSubmit({
    ...data,
    supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
    category: data.category || null,
    sector: data.sector || null,
    cost_center: data.cost_center || null,
    average_cost: avgCost,
    current_balance: currentBalance,
  });
  form.reset(); // ← PROBLEMA: reseta antes de saber se deu certo!
});
```

**Para:**
```typescript
const handleSubmit = form.handleSubmit((data) => {
  const avgCost = data.unit_cost * (1 + data.loss_percentage / 100);
  const currentBalance = data.current_stock * avgCost;
  
  onSubmit({
    ...data,
    supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
    category: data.category || null,
    sector: data.sector || null,
    cost_center: data.cost_center || null,
    average_cost: avgCost,
    current_balance: currentBalance,
  });
  // Removido form.reset() - agora o reset acontece quando o dialog fecha com sucesso
});
```

O form ja reseta corretamente via `useEffect` quando `open` muda (linha 124-180).

---

#### 2. Tratar Codigo Vazio como NULL

**Arquivo:** `src/components/pdv/IngredientDialog.tsx`

Converter string vazia para `null` antes de enviar ao banco:

```typescript
onSubmit({
  ...data,
  code: data.code?.trim() || null, // ← Converter vazio para null
  supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
  category: data.category || null,
  sector: data.sector || null,
  cost_center: data.cost_center || null,
  average_cost: avgCost,
  current_balance: currentBalance,
});
```

---

#### 3. Corrigir Constraint no Banco de Dados

A constraint `UNIQUE` no campo `code` nao permite multiplos valores `NULL` ou vazios. Precisamos usar uma constraint parcial que ignora valores nulos ou vazios.

**Migracao SQL:**

```sql
-- Primeiro, limpar codigos vazios existentes convertendo para NULL
UPDATE pdv_ingredients SET code = NULL WHERE code = '';

-- Remover a constraint atual
DROP INDEX IF EXISTS pdv_ingredients_code_key;

-- Criar constraint parcial que ignora valores nulos
CREATE UNIQUE INDEX pdv_ingredients_code_key 
ON pdv_ingredients (code, user_id) 
WHERE code IS NOT NULL AND code != '';
```

Isso permite:
- Multiplos insumos sem codigo (NULL)
- Codigos unicos POR usuario (user_id no indice)

---

### Resumo das Alteracoes

| Arquivo/Local | Alteracao |
|---------------|-----------|
| `IngredientDialog.tsx` linha 195 | Remover `form.reset()` prematuro |
| `IngredientDialog.tsx` linha 188 | Converter `code` vazio para `null` |
| Banco de Dados | Alterar constraint para permitir multiplos NULLs |

---

### Resultado Esperado

1. Quando ocorrer erro, os dados permanecem no formulario
2. Usuarios podem criar insumos sem codigo (sera null)
3. Codigos sao unicos apenas quando preenchidos e por usuario

