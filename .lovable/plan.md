# Melhorias no Cardápio do Delivery

Atualmente o cardápio (`/pdv/delivery/menu`) já possui os campos `order_position` e `is_featured` no banco, mas a interface não permite usá-los. Os ícones de "arrastar" (GripVertical) são apenas decorativos. Vou implementar as ações que faltam.

## O que será feito

### 1. Reordenar categorias (subir/descer)
Em `CategoryList.tsx`, transformar o ícone GripVertical em drag handle funcional usando `@dnd-kit/core` + `@dnd-kit/sortable` (já comum no stack). Como fallback acessível, adicionar dois botões pequenos (▲/▼) no menu de ações de cada categoria para mover uma posição.

Ao soltar/clicar, persistir o novo `order_position` em `delivery_categories` via update em lote (uma linha por categoria afetada).

### 2. Reordenar produtos dentro da categoria
Mesmo padrão em `ProductList.tsx`: lista sortable quando uma categoria está selecionada (na visão "Todas as categorias" o reordenar fica desabilitado, pois posições são por categoria). Persistir `order_position` em `delivery_products`.

Adicionar também as ações "Mover para cima" / "Mover para baixo" no `DropdownMenu` já existente, ao lado de Editar/Duplicar.

### 3. Destaque (★)
Adicionar item "Destacar" / "Remover destaque" no `DropdownMenu` do produto, alternando `is_featured` via `useUpdateProduct`. O ícone de estrela amarela já é exibido — só falta a ação para ligar/desligar. Sem mudança de schema.

### 4. Melhor divisão do cardápio (visual)
Reestruturar `MenuTab.tsx` para ficar agrupado por categoria em vez do layout atual de 1/3 + 2/3:

```text
┌─────────────────────────────────────────────┐
│ [Nova Categoria] [Novo Produto]   [filtro]  │
├─────────────────────────────────────────────┤
│ ▼ Entradas (4)            [editar] [+ item] │
│   ┌──────┬──────┬──────┐                    │
│   │ card │ card │ card │   ← grid 2-3 col   │
│   └──────┴──────┴──────┘                    │
│ ▼ Pratos principais (8)   [editar] [+ item] │
│   ...                                       │
│ ▼ Bebidas (5)             [editar] [+ item] │
└─────────────────────────────────────────────┘
```

- Cada categoria vira uma seção colapsável (`Accordion` do shadcn) com contador, botão de editar a categoria e botão "+ Adicionar produto" que abre o `ProductDialog` já com aquela categoria pré-selecionada.
- Produtos em destaque aparecem com borda/realce sutil dentro da própria categoria (mantendo o ⭐ atual).
- Manter um filtro/busca rápido no topo (input + select de categoria) para quem prefere a visão antiga focada.
- Cores: usar tokens do design system (bg-card, border, text-foreground), sem cores customizadas.

### 5. Polimentos relacionados
- Novos produtos passam a receber `order_position = max(order_position) + 1` da categoria (hoje fica zerado).
- Após reordenar, invalidar as queries `delivery-categories` / `delivery-products` para refletir imediatamente, tanto no painel admin quanto no cardápio público (`use-public-menu`).

## Detalhes técnicos

- Dependência nova: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- Hooks afetados: `use-delivery-categories.ts` e `use-delivery-products.ts` ganham `useReorderCategories` / `useReorderProducts` que recebem `Array<{id, order_position}>` e fazem `upsert` em lote.
- Componentes afetados: `MenuTab.tsx` (refatoração de layout), `CategoryList.tsx` (sortable + ações), `ProductList.tsx` (sortable + toggle destaque + reorder no menu).
- Sem migração de banco — colunas `order_position` e `is_featured` já existem.
- O cardápio público (`PublicMenu` / `use-public-menu`) já ordena por `order_position`, então as mudanças refletem automaticamente para o cliente final.
