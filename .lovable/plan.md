# Cardápio público: agrupar por categoria e remover avaliações

## Por que o layout público não mudou
As mudanças anteriores foram só no painel administrativo (`/pdv/delivery/menu`). O cardápio que o cliente final vê (`/cardapio/:userId` → `src/pages/PublicMenu.tsx`) usa outros componentes (`PublicMenuHeader`, `CategoryNav`, `ProductList`) que continuam com o layout antigo: "⭐ Destaques" + "Cardápio" em grid plano, sem separação por categoria.

## O que será feito

### 1. Remover avaliações do header público
Em `PublicMenuHeader.tsx`, remover o bloco `⭐ 4.8 (234)` (que hoje é hardcoded) e o ícone `Star`. O resto do header (logo, nome, slogan, tempo de preparo, taxa, status aberto/fechado) permanece igual.

### 2. Cardápio agrupado por categoria
Reescrever `ProductList.tsx` para receber `categories` e `products` e renderizar:

```text
⭐ Destaques (se houver featured)
   [card] [card] [card]

Promoções Exclusiva do Dia          ← cabeçalho sticky por categoria
   [card] [card] [card]

Sushi Express
   [card] [card] [card]

Sushi Prime
   ...
```

Cada cabeçalho de categoria recebe `id="cat-<id>"` + `scroll-mt-32` para o scroll-spy do `CategoryNav` funcionar corretamente abaixo do header sticky.

### 3. CategoryNav vira navegação por âncoras
Em vez de filtrar produtos (que recarrega a lista), clicar numa categoria do `CategoryNav` vai rolar a página até a seção correspondente (`document.getElementById('cat-<id>')?.scrollIntoView`). O botão "Todos" rola pro topo do cardápio. Isso funciona melhor com listas longas e não esconde nada.

Opcional simples: destacar a categoria visível usando `IntersectionObserver` para sincronizar a aba ativa.

### 4. Buscar TODOS os produtos de uma vez
Em `PublicMenu.tsx`, remover o filtro `selectedCategory` da query `usePublicProducts` — passa a buscar todos os produtos do estabelecimento de uma vez. Performance é boa pois cardápios costumam ter dezenas, não milhares de itens, e o cliente já recebe a ordenação por `order_position`.

### 5. Respeitar a ordem definida no admin
Os produtos dentro de cada categoria já vêm ordenados por `order_position` (o hook `use-public-menu` ordena assim). As categorias também — então a reordenação que você fez no painel admin reflete aqui automaticamente.

## Arquivos afetados
- `src/components/public-menu/PublicMenuHeader.tsx` — remove estrela/avaliação.
- `src/components/public-menu/ProductList.tsx` — agrupa por categoria com cabeçalhos sticky.
- `src/components/public-menu/CategoryNav.tsx` — clique vira scroll para âncora.
- `src/pages/PublicMenu.tsx` — busca todos os produtos; passa `categories` para `ProductList`.

Sem mudança de banco. Sem novas dependências.
