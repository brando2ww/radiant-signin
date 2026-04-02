

## Próximo Passo: Hooks + UI para Fichas Técnicas Delivery

A migration já foi criada. Agora precisamos implementar os hooks e componentes de UI. Vou dividir em 3 etapas sequenciais:

### Etapa 1 — Hooks de receitas (2 novos arquivos)

**`src/hooks/use-delivery-recipes.ts`**
- Mesmo padrão do `use-pdv-recipes.ts`, mas consultando `delivery_product_recipes`
- Funções: `addIngredient`, `updateQuantity`, `removeIngredient`, `calculateCMV`, `calculateMargin`
- Query key: `["delivery-recipes", productId]`

**`src/hooks/use-delivery-option-recipes.ts`**
- Mesmo padrão, mas consultando `delivery_option_item_recipes`
- Query key: `["delivery-option-recipes", optionItemId]`

### Etapa 2 — UI do ProductDialog (1 novo + 1 modificado)

**`src/components/delivery/DeliveryRecipeManager.tsx`** (novo)
- Componente idêntico ao `ProductRecipeManager` do PDV, mas usando `useDeliveryRecipes` em vez de `usePDVRecipes`
- Props: `productId`, `productPrice`
- Exibe cards de CMV/preço/margem + tabela de insumos + formulário de adição

**`src/components/delivery/ProductDialog.tsx`** (modificado)
- Adicionar terceira aba "Ficha Técnica" no TabsList (grid-cols-2 → grid-cols-3)
- Aba desabilitada quando produto ainda não foi salvo (igual à aba Opções)
- Conteúdo: `<DeliveryRecipeManager productId={product.id} productPrice={product.base_price} />`

### Etapa 3 — Receitas nos adicionais + CMV (3 modificados)

**`src/components/delivery/ProductOptionDialog.tsx`**
- Para cada item da opção, adicionar seção colapsável "Receita do item" com mini-gerenciador de insumos usando `useDeliveryOptionRecipes`

**`src/components/delivery/ProductOptionsManager.tsx`**
- Exibir badge de CMV em cada option item que tem receita vinculada (consulta `delivery_option_item_recipes`)

**`src/hooks/use-pdv-cmv.ts`** e **`src/hooks/use-pdv-dre.ts`**
- Incluir pedidos delivery no cálculo de CMV, somando custo dos ingredientes do produto base + adicionais selecionados via as novas tabelas de receita

### Ordem de implementação

Vou começar pela **Etapa 1 + Etapa 2** (hooks + aba Ficha Técnica no ProductDialog), pois é o que entrega valor imediato — o usuário poderá cadastrar receitas nos produtos delivery. A Etapa 3 (adicionais + CMV) vem logo em seguida.

