

## Problema

Ao clicar em "Buscar produto para adicionar..." dentro da aba Composição, nada parece acontecer (ou o dialog fecha) — sub-produto não é adicionado.

## Causa

Em `src/components/pdv/ProductCompositionManager.tsx`, todos os `<Button>` estão dentro do `<form>` do `ProductDialog` mas **sem `type="button"`**. Em HTML, o tipo padrão de `<button>` dentro de form é `submit`. Então:

- Clicar no botão "Buscar produto para adicionar..." dispara o submit do formulário pai → salva o produto, reseta o form e fecha o dialog **antes** do popover sequer abrir.
- O mesmo vale para o botão da lixeira (remover sub-produto).
- Pressionar Enter no input de quantidade também dispara submit.

Resultado: parece que "nada acontece" — na verdade o dialog fecha imediatamente.

## Solução

### Arquivo: `src/components/pdv/ProductCompositionManager.tsx`

Adicionar `type="button"` em todos os `<Button>` do componente:

1. Botão `PopoverTrigger` "Buscar produto para adicionar..." (linha ~114)
2. Botão da lixeira `Trash2` que remove sub-produto (dentro do `compositions.map`)
3. Qualquer outro `<Button>` no arquivo

Também garantir que o `<Input type="number">` da quantidade não dispare submit ao Enter — adicionar `onKeyDown` que faz `e.preventDefault()` em Enter, ou simplesmente confiar que sem botões submit o Enter não terá efeito (porém, com input numérico isolado, Enter pode ainda submeter; melhor prevenir explicitamente).

### Comportamento resultante

- Clicar em "Buscar produto..." → abre o popover normalmente.
- Selecionar produto na lista → chama `addComposition` (já persistido direto na tabela `pdv_product_compositions`) e fecha só o popover. Dialog do produto continua aberto.
- Clicar lixeira → remove sub-produto sem fechar o dialog.
- Editar quantidade → atualiza sem submeter.

## Arquivo

- `src/components/pdv/ProductCompositionManager.tsx` — único arquivo alterado.

