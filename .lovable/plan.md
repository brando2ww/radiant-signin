
## Múltiplos Fornecedores por Insumo

### Situação Atual

O formulário de insumo tem um campo `supplier_id` (Select simples = 1 fornecedor apenas). A tabela `pdv_ingredient_suppliers` já existe no banco e suporta N:N, mas não está sendo usada no formulário de cadastro — apenas no módulo de cotações.

### O Que Vai Mudar

Substituir o Select simples de fornecedor por um seletor múltiplo que:
- Permite adicionar vários fornecedores ao insumo
- Marca um deles como "preferencial" (que será usado como `supplier_id` no campo principal)
- Na criação de novo insumo: salva os vínculos em `pdv_ingredient_suppliers` após o INSERT
- Na edição: carrega os vínculos existentes e permite adicionar/remover

---

### Mudanças Técnicas

#### 1. `src/components/pdv/IngredientDialog.tsx`

Substituir o `FormField` do `supplier_id` (linhas 370–407) por um novo componente de seleção múltipla:

- Estado local `selectedSuppliers: string[]` e `preferredSupplierId: string | null`
- UI: lista dos fornecedores já vinculados com badge "Preferencial" e botão de estrela para definir preferido
- Botão "+" abre o dropdown para adicionar mais fornecedores
- Botão de remoção por fornecedor
- O `supplier_id` principal do formulário é atualizado automaticamente conforme o preferencial
- Ao carregar para edição, buscar os vínculos existentes via `usePDVIngredientSuppliers(ingredient?.id)`

#### 2. `src/pages/pdv/Stock.tsx`

Atualizar `handleSubmit` para após salvar o insumo (create ou update), sincronizar os vínculos da tabela `pdv_ingredient_suppliers`:

```typescript
// No handleCreate: após createIngredient retornar o novo ID
// → inserir links em pdv_ingredient_suppliers para cada supplier selecionado
// No handleUpdate: diff entre vínculos atuais e novos → inserir novos, remover removidos
```

Como o hook `createIngredient` atual não retorna o ID diretamente via callback, vamos ajustar o fluxo: o `IngredientDialog` vai gerenciar os vínculos internamente, recebendo um callback `onAfterSave(ingredientId)` ou usando o `usePDVIngredientSuppliers.createLink` diretamente dentro do `handleSubmit` do dialog.

#### Abordagem de implementação (mais limpa)

Manter tudo dentro do `IngredientDialog`:

1. Adicionar estado local: `selectedSupplierIds: string[]`, `preferredSupplierId: string | null`
2. Ao abrir em modo edição: popular esses estados com os dados de `usePDVIngredientSuppliers(ingredient?.id)`
3. No `onSubmit` recebido pelo dialog: o `Stock.tsx` já recebe os dados e salva — mas para os vínculos precisamos do `ingredientId` após o save
4. **Melhor abordagem**: mover a lógica de save para dentro do `IngredientDialog` usando `useCreateIngredient`/`useUpdateIngredient` diretamente, chamando `createLink`/`deleteLink` após o save principal

Isso requer que o `IngredientDialog` assuma o controle do submit internamente em vez de delegar para o pai via `onSubmit` prop.

#### Plano de execução simplificado

- **`IngredientDialog.tsx`**: Adicionar estado `selectedSupplierIds[]` e `preferredSupplierId`. Substituir o Select por um componente de multi-seleção com badges. Ao submeter, incluir `additionalSupplierIds` e `preferredSupplierId` nos dados passados ao `onSubmit`.

- **`Stock.tsx`**: No `handleSubmit`, após `createIngredient`/`updateIngredient` retornar com sucesso (via `onSuccess` que recebe o novo ingrediente), iterar sobre `additionalSupplierIds` e chamar `createLink` para cada um. Para edição, comparar com os vínculos existentes e só adicionar/remover o delta.

- Manter `supplier_id` no banco apontando para o fornecedor preferencial (retrocompatibilidade com cotações e receitas que usam `supplier_id`).

---

### UI do Novo Campo Fornecedores

```
Fornecedores
┌─────────────────────────────────────────────┐
│ ★ IZOTOPE TECNOLOGIA COMERCIAL   [Principal] [×] │
│ ☆ DISTRIBUIDORA ALFA                         [×] │
└─────────────────────────────────────────────┘
[+ Adicionar fornecedor ▼]   [+ Novo fornecedor]
```

- ★ estrela preenchida = fornecedor preferencial (clique troca)
- `[×]` remove o vínculo
- Dropdown para adicionar mostra apenas fornecedores ainda não vinculados

---

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/IngredientDialog.tsx` | Substituir Select simples por seletor multi-fornecedor com estado local, badge preferencial e botão de remoção |
| `src/pages/pdv/Stock.tsx` | Atualizar `handleSubmit` para sincronizar `pdv_ingredient_suppliers` após criar/editar insumo |
