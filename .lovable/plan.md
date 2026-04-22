

## Botão de insumo no formulário de novo item + autopreenchimento do nome

### Por que o botão não aparecia
O ícone de buscar insumo só existia **dentro de cada item já criado**. Como a opção "BASE ALCÓLICA" foi recém-criada e ainda não tinha itens, não havia onde clicar.

### O que muda

No rodapé de cada opção (a linha que hoje tem **Nome do item**, **R$**, **+**), passa a aparecer também o **botão de buscar insumo** (ícone de caixas). Comportamento:

1. Clicar no ícone abre o popover de busca (mesmo componente já existente)
2. Ao **selecionar um insumo**, automaticamente:
   - o campo **Nome do item** é preenchido com o nome do insumo
   - o popover fecha
   - o ícone fica em destaque (variante `secondary`) sinalizando que há insumo pré-vinculado
   - aparece um pequeno **X** ao lado para limpar a seleção (volta ao estado neutro, mas **não apaga o nome** já digitado — usuário pode editar)
3. Ao clicar em **+** (ou Enter no campo), o item é criado já com o insumo vinculado em `recipes` (quantidade 1, unidade do insumo)
4. Após criar o item, os três campos (nome, preço, insumo selecionado) são limpos
5. Se o usuário não clicar em **+**, nada é salvo — segue o padrão de rascunho local

### Sobre o autopreenchimento
- Se o campo **Nome do item** estiver vazio no momento da seleção: preenche com o nome do insumo
- Se já tiver texto digitado: **sobrescreve** com o nome do insumo (comportamento que você pediu: "ao selecionar autopreencher o nome do item")
- O campo continua editável depois — o usuário pode renomear sem perder o vínculo

### Persistência
Sem mudança no `handleSave`: a Fase 5 já chama `upsertRecipe` para itens novos com `recipes` populado. O vínculo será salvo no clique em **Salvar alterações**.

### Detalhes técnicos
Arquivo único: `src/components/pdv/PDVProductOptionsManager.tsx`

- Novos estados locais:
  - `newItemIngredients: Record<string, { id: string; name: string; unit: string } | null>`
  - `newItemPopoverOpen: string | null` (separado de `ingredientPopoverOpen` para não colidir com os itens já existentes)
- No bloco `<div className="flex gap-2 pt-2 border-t">` adicionar, antes do botão "+":
  - `Popover` com `PopoverTrigger` `<Button type="button" variant={selected ? "secondary" : "ghost"} size="icon">` com ícone `Boxes`
  - Reusar `filteredIngredients` e `ingredientSearch`
  - `onSelect` do insumo: setar `newItemIngredients[optionId]` e `newItemNames[optionId] = ing.name`
  - `<Button type="button" size="icon">` com ícone `X` quando há seleção, para limpar apenas `newItemIngredients[optionId]`
- Atualizar `handleAddItem(optionId)`:
  - Se `newItemIngredients[optionId]` existir, montar `recipes: [{ id: 'tmp-…', ingredient_id, quantity: 1, unit, ingredient_name, ingredient_unit }]`
  - Limpar `newItemIngredients[optionId]` junto com nome e preço após adicionar
- Todos os novos `<Button>` com `type="button"` (mantém a correção contra submit involuntário do form pai)

### Fora de escopo
- Múltiplos insumos por item
- Edição da quantidade no formulário de novo item (continua 1 por padrão, ajustável depois na linha do item)
- Reordenação

