

## Plano: Gerar Código Automático para Insumos

### Problema Atual
O campo "Código" mostra placeholder "Auto-gerado", mas quando deixado vazio, envia `null` ao banco. O usuário espera que um código seja gerado automaticamente.

### Solução

Gerar código sequencial no formato `INS-XXXXX` (ex: `INS-00001`, `INS-00002`) quando o usuário não preencher.

**Arquivo:** `src/components/pdv/IngredientDialog.tsx`

#### Alterações:

1. **Criar função geradora de código** (antes do handleSubmit):

```typescript
const generateCode = async () => {
  // Buscar o maior código existente do usuário para gerar o próximo
  const { data } = await supabase
    .from("pdv_ingredients")
    .select("code")
    .eq("user_id", user?.id)
    .like("code", "INS-%")
    .order("code", { ascending: false })
    .limit(1);

  if (data && data.length > 0 && data[0].code) {
    const lastNumber = parseInt(data[0].code.replace("INS-", ""), 10);
    return `INS-${String(lastNumber + 1).padStart(5, "0")}`;
  }
  return "INS-00001";
};
```

2. **Modificar handleSubmit** para gerar código quando vazio:

```typescript
const handleSubmit = form.handleSubmit(async (data) => {
  const avgCost = data.unit_cost * (1 + data.loss_percentage / 100);
  const currentBalance = data.current_stock * avgCost;
  
  // Gerar código automático se não informado
  let code = data.code?.trim() || null;
  if (!code && !ingredient) { // Só gera para novos insumos
    code = await generateCode();
  }
  
  onSubmit({
    ...data,
    code,
    supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
    category: data.category || null,
    sector: data.sector || null,
    cost_center: data.cost_center || null,
    average_cost: avgCost,
    current_balance: currentBalance,
  });
});
```

3. **Adicionar imports necessários**:
- `supabase` do client
- `useAuth` para obter user

### Formato do Código

| Exemplo | Descrição |
|---------|-----------|
| `INS-00001` | Primeiro insumo |
| `INS-00002` | Segundo insumo |
| `INS-00123` | Insumo 123 |

### Comportamento

- **Campo preenchido**: Usa o código digitado pelo usuário
- **Campo vazio (novo)**: Gera código automático `INS-XXXXX`
- **Campo vazio (edição)**: Mantém null (não sobrescreve)
- **Placeholder**: Já mostra "Auto-gerado" (não precisa alterar)

