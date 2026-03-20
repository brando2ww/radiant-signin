

## Fix: Dropdown do "Integrações" aparecendo no lado errado

### Problema
O `NavigationMenuViewport` usa `left-0` fixo (linha 80), então o dropdown sempre abre alinhado à esquerda do container do `NavigationMenu`. Como "Integrações" é o último item da barra, o popup aparece deslocado para a esquerda em vez de abrir abaixo do item.

### Solução
Mudar o posicionamento do viewport de `left-0` para `right-0` não resolveria para os outros menus. A solução correta é trocar de `left-0` para usar posicionamento dinâmico que se adapte. No Radix NavigationMenu, o viewport é único e compartilhado — ele sempre renderiza na mesma posição.

A abordagem mais simples: trocar `left-0` por `left-0 right-0` (centralizar) ou usar `end-0` para alinhar à direita. Mas como isso afeta TODOS os menus, a melhor solução é remover o `left-0` fixo e deixar o viewport se posicionar relativo ao container inteiro, centralizando-o.

**Mudança**: No `NavigationMenuViewport`, trocar `left-0` por `left-auto right-0` para que o dropdown se alinhe à direita (já que o nav está no header à direita). Porém, para não quebrar os outros menus, a melhor abordagem é usar `left-0 w-full` no container do viewport, fazendo o dropdown se posicionar corretamente.

Na verdade, a solução mais limpa: mudar o `div` wrapper do viewport de `absolute left-0` para `absolute left-0 right-0` e centralizar, permitindo que o conteúdo flua naturalmente.

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/ui/navigation-menu.tsx` | Linha 80: trocar `left-0 top-full flex justify-center` para `absolute top-full left-0 right-0 flex justify-center` — isso centraliza o viewport sobre toda a largura do nav, fazendo o dropdown aparecer abaixo do item correto |

