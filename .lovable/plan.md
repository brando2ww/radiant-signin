

## Plano: Corrigir Exibição de Fornecedores Vinculados na Cotação

### Problema Identificado

O sistema possui duas formas de vincular fornecedores a ingredientes:

1. **Vínculo direto**: Campo `supplier_id` na tabela `pdv_ingredients` (forma antiga/simples)
2. **Vínculo múltiplo**: Tabela `pdv_ingredient_suppliers` (forma nova para múltiplos fornecedores)

O componente `QuotationItemSuppliers` busca apenas na tabela de vínculo múltiplo, ignorando o fornecedor vinculado diretamente no ingrediente.

### Dados Atuais no Banco

| Ingrediente | supplier_id (direto) | pdv_ingredient_suppliers |
|-------------|---------------------|--------------------------|
| SALMÃO 2K | CARLOS EDUARDO... | (vazio) |

### Solução

Modificar o componente `QuotationItemSuppliers` para também considerar o fornecedor vinculado diretamente ao ingrediente (`supplier_id`).

---

### Alterações Técnicas

**Arquivo:** `src/components/pdv/purchases/QuotationItemSuppliers.tsx`

1. **Buscar dados do ingrediente incluindo o fornecedor direto**:
   - Fazer uma query adicional para buscar o `supplier_id` do ingrediente
   - Ou receber o ingrediente como prop (já temos o `ingredientId`)

2. **Combinar fornecedores de ambas as fontes**:
   - Fornecedores da tabela `pdv_ingredient_suppliers`
   - Fornecedor do campo `supplier_id` de `pdv_ingredients`
   - Evitar duplicatas (mesmo fornecedor nas duas fontes)

3. **Marcar o fornecedor direto como "Principal"**:
   - Exibir badge indicando que é o fornecedor principal do ingrediente

---

### Implementação

Modificar o componente para:

```typescript
// Buscar o ingrediente com seu fornecedor direto
const { data: ingredientData } = useQuery({
  queryKey: ['ingredient-direct-supplier', ingredientId],
  queryFn: async () => {
    const { data } = await supabase
      .from('pdv_ingredients')
      .select(`
        id,
        supplier_id,
        supplier:pdv_suppliers(id, name, phone, email, contact_name)
      `)
      .eq('id', ingredientId)
      .single();
    return data;
  },
  enabled: !!ingredientId,
});

// Combinar fornecedores (direto + múltiplos)
const allSuppliers = useMemo(() => {
  const result = [];
  
  // Adicionar fornecedor direto do ingrediente
  if (ingredientData?.supplier) {
    result.push({
      id: `direct-${ingredientData.supplier.id}`,
      supplier_id: ingredientData.supplier.id,
      supplier: ingredientData.supplier,
      is_preferred: true, // fornecedor principal
      is_direct: true,    // flag para identificar
    });
  }
  
  // Adicionar fornecedores da tabela de vínculo múltiplo
  ingredientSuppliers.forEach(is => {
    // Evitar duplicata
    if (!result.some(r => r.supplier_id === is.supplier_id)) {
      result.push({
        ...is,
        is_direct: false,
      });
    }
  });
  
  return result;
}, [ingredientData, ingredientSuppliers]);
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/pdv/purchases/QuotationItemSuppliers.tsx` | Adicionar busca do fornecedor direto e combinar com múltiplos |

---

### Resultado Esperado

Ao selecionar "SALMÃO 2K" na cotação, o sistema exibirá:

```
Fornecedores:
☑ CARLOS EDUARDO MALHEIROS BENVINDA (54) 99223-2827  [Principal]
```

Em vez de:

```
⚠️ Nenhum fornecedor vinculado a este ingrediente
```

