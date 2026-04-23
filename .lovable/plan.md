

## Habilitar arrastar com mouse/touch nas categorias do garçom

A barra de categorias na tela `/garcom/itens` rola via `overflow-x-auto`, mas com a scrollbar oculta e sem suporte a arrastar com o mouse, no desktop fica praticamente impossível navegar entre categorias. Touch funciona, mas mouse não.

### Mudança

**`src/components/garcom/ProductCategoryNav.tsx`**

Adicionar interação de **drag-to-scroll** no container horizontal:

1. Capturar `pointerdown` para registrar posição inicial e `scrollLeft`.
2. Em `pointermove` (com botão pressionado), atualizar `scrollLeft` proporcional ao deslocamento do ponteiro.
3. Em `pointerup` / `pointerleave`, encerrar o arrasto.
4. Se o usuário arrastou mais que ~4px, bloquear o `click` subsequente nos chips (via `onClickCapture`) para não disparar seleção de categoria acidental ao final do arrasto.
5. Adicionar suporte a `wheel`: se a roda vertical do mouse for usada sobre a faixa, converter em scroll horizontal.
6. Cursor: `cursor-grab` no estado normal, `cursor-grabbing` durante o arrasto. Adicionar `select-none` para não selecionar texto enquanto arrasta.

### Comportamento resultante

- **Desktop**: clique-segure-arraste lateralmente para rolar entre Todos / A la carte / Bebidas / Drinks. Roda do mouse vertical também rola lateralmente.
- **Mobile**: arrasto com dedo continua funcionando (já funcionava nativamente).
- Clique simples num chip continua selecionando a categoria.
- Scrollbar permanece oculta (já está globalmente em `index.css`).

### Validação

- Em `/garcom/itens` no desktop: clicar e arrastar a faixa de categorias rola horizontalmente.
- Soltar sobre um chip após arrastar **não** seleciona ele (evita falso clique).
- Clique curto sobre "Bebidas" muda a categoria normalmente.
- Em 390×844 (mobile), o swipe de toque continua rolando.

