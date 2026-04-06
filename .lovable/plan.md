

## Vincular Itens de Opção a Insumos do Estoque

### Contexto
Hoje os itens de opção (adicionais) são criados com nome livre. A tabela `delivery_option_item_recipes` já existe e conecta option items a `pdv_ingredients`, mas o dialog de criação não oferece essa vinculação. Quando um pedido sai com um adicional, o sistema não sabe qual insumo baixar.

### Solução
Adicionar um seletor de ingrediente (combobox com busca) em cada item da opção no `ProductOptionDialog`. Ao selecionar um ingrediente, o nome e custo são preenchidos automaticamente. Após salvar, criar os registros em `delivery_option_item_recipes`.

### Mudanças

**1. `src/components/delivery/ProductOptionDialog.tsx`**
- Importar `usePDVIngredients` para listar ingredientes disponíveis
- Adicionar campo `ingredient_id` e `quantity` ao estado de cada item
- Renderizar um Combobox (Popover + Command) para buscar/selecionar ingrediente
- Ao selecionar ingrediente: auto-preencher `name` com nome do ingrediente
- Adicionar campo de quantidade do insumo por item
- Passar `ingredient_id` e `quantity` no `onSave`

**2. `src/hooks/use-product-options.ts`**
- No `useCreateProductOption`, após inserir items, criar registros em `delivery_option_item_recipes` para items que têm `ingredient_id`
- No `useUpdateProductOption` (ou criar mutation dedicada), sincronizar recipes ao editar

**3. `src/components/delivery/ProductOptionCard.tsx`**
- Exibir badge "Vinculado ao estoque" nos items que têm receita associada
- Mostrar nome do ingrediente e quantidade vinculada

### Fluxo do usuário

```text
[Nova Opção] → "Adicionais"
  Item 1: [🔍 Buscar ingrediente...] → "Bacon" (auto-preenche nome)
           Qtd insumo: 0.050 kg | Preço adicional: R$ 5,00
  Item 2: [🔍 Buscar ingrediente...] → "Queijo Cheddar"
           Qtd insumo: 0.030 kg | Preço adicional: R$ 3,00
[Criar Opção] → Salva items + cria recipes no estoque
```

### Resultado
Ao processar um pedido com adicional "Bacon", o sistema já terá o vínculo `option_item → ingredient (0.050 kg)` para dar baixa no estoque automaticamente.

