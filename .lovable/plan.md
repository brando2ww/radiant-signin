
## Tornar botão "Adicionar Opção" sempre ativo

### O que mudará
No gerenciador de Opções de Produto (PDV), o botão **"Adicionar"** ao lado do campo "Nome da opção" hoje fica desabilitado quando o campo está vazio. Vou removê-lo dessa restrição para que o botão fique **sempre clicável**.

### Comportamento ao clicar com campo vazio
Para evitar a criação de opções sem nome, ao clicar com o campo vazio o sistema irá exibir um aviso (toast) pedindo o preenchimento do nome — em vez de simplesmente não responder como hoje.

### Detalhes técnicos
- Arquivo: `src/components/pdv/PDVProductOptionsManager.tsx` (linha 288)
- Remover o atributo `disabled={!newOptionName.trim()}` do `<Button>`.
- Ajustar a função `handleAddOption` para, quando `newOptionName.trim()` estiver vazio, disparar um `toast` de aviso ("Informe o nome da opção") e retornar — preservando a validação, mas movendo-a do estado visual do botão para o handler.

Nenhuma outra tela ou comportamento é afetado.
