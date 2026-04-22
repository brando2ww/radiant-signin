

## Opções com insumo opcional + baixa de estoque ao enviar para cozinha + impressão das opções na comanda

### Resumo

1. Na aba **Opções** do produto, cada item poderá (opcionalmente) ser vinculado a um **insumo** (`pdv_ingredients`) com **quantidade consumida**. Itens sem insumo continuam funcionando como hoje (apenas texto/preço).
2. Ao **garçom enviar para a cozinha**, o sistema **baixa do estoque** os insumos dos itens de opção que foram escolhidos (e também das receitas dos próprios produtos, se já existirem em `pdv_product_recipes`).
3. O **garçom mobile** passa a ver os seletores de opções antes de adicionar o item, e as opções escolhidas são gravadas no campo `modifiers` do item da comanda — assim aparecem no ticket impresso da cozinha.

---

### Mudanças por arquivo

**Banco**

- Nova tabela `pdv_option_item_recipes` (espelho do `delivery_option_item_recipes`):
  - `id uuid pk`, `option_item_id uuid fk → pdv_product_option_items(id) on delete cascade`, `ingredient_id uuid fk → pdv_ingredients(id)`, `quantity numeric not null default 1`, `unit text not null default 'un'`, `created_at timestamptz default now()`.
  - RLS: leitura/escrita por `is_establishment_member(...)` via dono do produto-pai (mesmo padrão de `pdv_product_recipes`).
- Nova tabela `pdv_stock_movements` para auditoria (opcional mas recomendado):
  - `id`, `user_id`, `ingredient_id`, `quantity` (negativo = saída), `reason text` (`'venda_comanda'`, `'ajuste_manual'`...), `reference_type text`, `reference_id uuid`, `created_at`.
- Função SQL `consume_ingredients_for_comanda_items(p_item_ids uuid[])`:
  - Para cada `pdv_comanda_items.id` recebido, soma `quantity * recipe.quantity` por `ingredient_id`, considerando: receita do produto principal (`pdv_product_recipes`) **e** receitas dos itens de opção escolhidos (lidos do `modifiers` jsonb).
  - Faz `UPDATE pdv_ingredients SET current_stock = current_stock - X` em uma transação, registra cada saída em `pdv_stock_movements`.
  - `SECURITY DEFINER` + `set search_path=public`. Não bloqueia se estoque ficar negativo (somente avisa via toast no client se algum insumo cair abaixo de zero — opcional).

**Edição de Opções (PDV)**

- `src/components/pdv/PDVProductOptionsManager.tsx`: para cada item de opção, adicionar bloco compacto (visível ao expandir):
  - Popover "Vincular insumo" (busca em `pdv_ingredients` do dono) — substitui semanticamente o atual "Vincular produto" (que será removido nesta tela).
  - Input numérico "Quantidade consumida" + selo da unidade do insumo (`un`, `kg`, `g`, `ml`...).
  - Botão "Desvincular insumo".
  - Estado entra no mesmo `draft` já existente — salvamento em lote no botão "Salvar alterações" via novo hook.
- Novo hook `src/hooks/use-pdv-option-recipes.ts` (espelho de `useDeliveryOptionRecipes`): `addIngredient`, `updateQuantity`, `removeIngredient` em `pdv_option_item_recipes`.
- `src/components/pdv/ProductOptionSelector.tsx` e `usePDVProductOptionsForOrder`: incluir `recipes` (id do insumo + qty) em cada item retornado, para que o `modifiers` salvo na comanda já carregue o que será baixado.

**Garçom (mobile)**

- `src/pages/garcom/GarcomAdicionarItem.tsx`:
  - Buscar `usePDVProductOptionsForOrder(selectedProduct.id)` quando um produto é selecionado.
  - Se houver opções, abrir uma etapa "Opções" (reutilizar `ProductOptionSelector`) antes do passo de quantidade.
  - Ao adicionar, enviar `modifiers` (snapshot das opções com `option_id`, `option_name`, lista de `{item_id, item_name, price_adjustment, recipes: [{ingredient_id, quantity}]}`) e `notes` formatado para humanos. Atualizar `addItem` em `usePDVComandas` para aceitar `modifiers` e `unitPrice` ajustado pelos adicionais.
- `usePDVComandas.addItemMutation`: gravar `modifiers` no insert (campo já existe na tabela).

**Envio para cozinha + baixa de estoque**

- `usePDVComandas.sendToKitchenMutation`: após o `update sent_to_kitchen_at` e a criação dos jobs de impressão, chamar `supabase.rpc('consume_ingredients_for_comanda_items', { p_item_ids: allIds })`. Toast de sucesso/erro consolidado. Invalidar `['pdv-ingredients']`.
- Mesma chamada deve ser disparada em `useBalcao`/contexto de balcão quando o pedido é fechado direto (kitchen_status = entregue) — ajuste paralelo em `src/hooks/use-pdv-orders.ts` (ponto de fechamento do pedido balcão).

**Impressão (ticket de cozinha já existente)**

- A view `vw_print_bridge_comanda_items` já expõe `modifiers`. Confirmar no `print-bridge/server.js` (formatador ESC/POS) que `modifiers` são impressos abaixo do nome do produto. Se não for o caso, ajustar formatador para listar:
  ```
  PRODUTO  x2
    + Tamanho: Grande
    + Adicionais: Bacon, Queijo extra
    Obs: sem cebola
  ```

---

### Detalhes técnicos relevantes

- **Não-quebrar dados antigos**: itens de opção sem `pdv_option_item_recipes` simplesmente não baixam nada — comportamento atual preservado.
- **`linked_product_id` em `pdv_product_option_items`**: mantido no schema para não quebrar deliveries/integrações, mas escondido da nova UI de opções do PDV (foco em insumos).
- **`modifiers` jsonb**: estrutura padronizada como `{ "options": [{ "option_id", "option_name", "items": [{ "item_id", "item_name", "price_adjustment", "recipes": [{ "ingredient_id", "quantity" }] }] }] }`.
- **Consumo idempotente**: `consume_ingredients_for_comanda_items` só consome itens que ainda não tenham linha em `pdv_stock_movements` com `reference_type='comanda_item'` e `reference_id=item.id`. Reenviar o mesmo item para cozinha não baixa duas vezes.
- **CMV**: o cálculo já existente em `usePDVRecipes` continua válido para o produto-pai; opcionalmente, o CMV total exibido pode somar `useDeliveryOptionRecipes` adaptado para PDV (fora do escopo deste passo).

### Arquivos afetados

- Novo: `supabase/migrations/<ts>_pdv_option_item_recipes.sql` (tabela, RLS, função `consume_ingredients_for_comanda_items`, tabela `pdv_stock_movements`).
- Novo: `src/hooks/use-pdv-option-recipes.ts`.
- Editado: `src/components/pdv/PDVProductOptionsManager.tsx` (UI de vínculo a insumo + quantidade dentro do draft).
- Editado: `src/hooks/use-pdv-product-options.ts` (incluir `recipes` no retorno; expor reload).
- Editado: `src/components/pdv/ProductOptionSelector.tsx` (propagar `recipes` no `SelectedOption`).
- Editado: `src/components/pdv/AddItemDialog.tsx` e `src/components/pdv/ComandaAddItemDialog.tsx` (gravar `modifiers` estruturado).
- Editado: `src/pages/garcom/GarcomAdicionarItem.tsx` (passo de opções antes da quantidade; envio de `modifiers`).
- Editado: `src/hooks/use-pdv-comandas.ts` (`addItemMutation` aceita `modifiers`; `sendToKitchenMutation` chama RPC de baixa).
- Editado: `src/hooks/use-pdv-orders.ts` (chamar RPC quando pedido balcão for fechado).
- Editado: `print-bridge/server.js` (renderizar `modifiers` no cupom da cozinha, se ainda não renderiza).

