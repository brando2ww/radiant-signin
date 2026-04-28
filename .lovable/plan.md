## Problemas identificados

Olhando a captura de tela e o código atual em `src/components/public-menu/`, há dois bugs visuais/comportamentais:

### 1. Header da categoria "flutuando" no meio da página
Em `ProductList.tsx`, cada categoria tem um header com `sticky top-[7.5rem]`. Como a `CategoryNav` (barra "Todos / Sushi Express / ...") usa `sticky top-0` e tem altura ~72px, o valor `7.5rem` (120px) deixa um espaço vazio entre as duas barras. Resultado: o título "Sushi Express" gruda no meio da página, com fundo `bg-background/95 backdrop-blur` parcialmente transparente sobrepondo as imagens dos produtos abaixo — exatamente o efeito esquisito da screenshot.

### 2. Scroll-spy não atualiza a categoria ativa no topo
Em `CategoryNav.tsx`, o `IntersectionObserver` observa o elemento `<section id="cat-XYZ">` inteiro. Como cada `<section>` é alta (várias linhas de produtos), a section anterior continua "intersectando" enquanto o usuário rola pela próxima — e o `rootMargin: "-140px 0px -60% 0px"` combinado com a ordenação por `boundingClientRect.top` acaba mantendo a categoria errada selecionada. Por isso "Todos" continua marcado ao descer.

Além disso, o sticky header **interno** de cada section (item 1) impede o `IntersectionObserver` de detectar a saída da section corretamente, porque o próprio header fica grudado dentro do viewport.

---

## Plano de correção

### A. Eliminar o header sticky duplicado dentro de cada categoria
Em `src/components/public-menu/ProductList.tsx`:
- Remover o `<div className="sticky top-[7.5rem] ...">` ao redor do título da categoria.
- Manter o título como header normal (não-sticky), com bom espaçamento e separador, logo acima do grid de produtos.
- A única barra "sticky" da página passa a ser a `CategoryNav` no topo — que já mostra qual categoria está ativa, então não há perda de contexto.

Isso elimina o efeito "flutuando no meio da tela" e devolve a clareza visual.

### B. Corrigir o scroll-spy para atualizar em tempo real
Em `src/components/public-menu/CategoryNav.tsx`:
- Trocar a lógica baseada em `IntersectionObserver` da section inteira por uma abordagem que detecta qual **título de categoria** acabou de cruzar a linha logo abaixo da `CategoryNav`.
- Adicionar um marcador leve (`<span data-cat-anchor={id}>`) imediatamente antes de cada título em `ProductList.tsx`, e observar esses marcadores com:
  - `rootMargin: "-${navHeight + 8}px 0px -75% 0px"` para que apenas o marcador que cruza a faixa logo abaixo da navbar conte como "ativo".
  - Tracking adicional via `scroll` event (throttled com `requestAnimationFrame`) como fallback, escolhendo o último marcador cujo `getBoundingClientRect().top <= navHeight + 8`.
- Calcular dinamicamente a altura real da `CategoryNav` via `ref` em vez de chutar `140px`.
- Quando o usuário está acima da primeira categoria, marcar "Todos" como ativo; ao chegar na primeira categoria, ela vira ativa imediatamente.

### C. Ajustar `scroll-mt` para alinhar com a nova altura da navbar
Em `ProductList.tsx`, trocar `scroll-mt-32` pelas categorias por um valor consistente com a altura real da `CategoryNav` (ex.: `scroll-mt-24`) para que o `scrollIntoView` ao clicar num botão da nav posicione o título da categoria logo abaixo da barra, sem ficar escondido.

---

## Detalhes técnicos

**Arquivos a editar:**
- `src/components/public-menu/ProductList.tsx` — remover sticky interno; adicionar `<span data-cat-anchor>` antes de cada `<h2>`; ajustar `scroll-mt`.
- `src/components/public-menu/CategoryNav.tsx` — reescrever lógica do scroll-spy usando os anchors + medição dinâmica da altura da nav; usar ref para o container da nav.

**Sem alteração:** `PublicMenu.tsx` continua envolvendo `CategoryNav` num `sticky top-0 z-30` — esse é o único elemento sticky da página depois desta mudança.

**Comportamento esperado após o fix:**
- A barra de categorias no topo permanece fixa enquanto o usuário rola.
- Os títulos "Sushi Express", "Sushi Prime", etc. aparecem como cabeçalhos normais entre os blocos de produtos (não flutuam mais sobre as imagens).
- À medida que o usuário desce, o botão correspondente na barra do topo acende automaticamente em tempo real.
- Clicar num botão da barra rola até a categoria com o título visível logo abaixo da barra.
