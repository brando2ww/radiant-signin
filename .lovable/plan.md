
## Corrigir o clique em “Adicionar” que está salvando e fechando

### Causa identificada
O gerenciador de opções (`PDVProductOptionsManager`) está renderizado dentro do `<form>` principal do `ProductDialog`.

Em HTML, qualquer `<Button>` ou `<button>` dentro de um formulário, quando não recebe `type`, assume `type="submit"` por padrão. Por isso, ao clicar em **“Adicionar”** na aba de opções, o formulário do produto é submetido, o produto é salvo e o diálogo fecha.

### O que será ajustado
Vou transformar em `type="button"` todos os botões de ação interna da aba **Opções** que não devem enviar o formulário.

### Arquivos
- `src/components/pdv/PDVProductOptionsManager.tsx`
- Referência estrutural: `src/components/pdv/ProductDialog.tsx`

### Alterações previstas

#### 1. Botão “Adicionar” da nova opção
No topo do gerenciador:
- adicionar `type="button"` ao botão **Adicionar**

#### 2. Botão “+” para adicionar item dentro da opção
Na linha de inclusão de item:
- adicionar `type="button"` ao botão com ícone `Plus`

#### 3. Botões de excluir
Nos botões de lixeira:
- adicionar `type="button"` ao excluir opção
- adicionar `type="button"` ao excluir item

#### 4. Botões auxiliares de insumo
Nos controles que só manipulam o draft local:
- adicionar `type="button"` ao botão que abre o popover de vincular insumo
- adicionar `type="button"` ao botão de desvincular insumo

#### 5. Botões HTML puros dentro do popover
Na lista de insumos há um `<button>` nativo para selecionar o insumo:
- adicionar `type="button"` nesse elemento também

### Resultado esperado
Depois da correção:
- clicar em **Adicionar** não salvará mais o produto
- clicar em **+**, lixeira, vincular/desvincular insumo também não enviará o formulário
- o produto só será salvo pelos pontos corretos:
  - botão **Salvar** do `ProductDialog`
  - botão **Salvar alterações** da barra da aba de opções

### Detalhe técnico
A estrutura atual confirma isso:
- `ProductDialog.tsx` contém `<form onSubmit={handleSubmit}>`
- `PDVProductOptionsManager.tsx` está dentro desse formulário
- vários botões internos não possuem `type`, então hoje se comportam como submit involuntário

### Validação após implementar
Vou verificar estes fluxos:
1. clicar em **Adicionar opção**
2. clicar em **Adicionar item**
3. excluir opção/item
4. selecionar insumo no popover
5. confirmar que nada fecha ou salva automaticamente
6. confirmar que apenas **Salvar alterações** e **Salvar** persistem dados
