## Objetivo

1. Permitir, dentro de **Opções do Produto** no PDV, dois tipos de item:
   - **Insumo** (já existe): item ligado a um `pdv_ingredient` via receita.
   - **Produto** (novo): item ligado a um `pdv_product` cadastrado, usado como adicional/upsell. Ao selecionar esta opção em uma comanda, o produto vinculado é considerado para estoque, fiscal e roteamento de cozinha.
2. Quando o produto PDV estiver **vinculado ao delivery** (`shared_products` / `delivery_products.source_pdv_product_id`), **toda alteração** feita no cadastro PDV (campos básicos, preços, imagem, disponibilidade, **opções e itens de opção**) deve refletir automaticamente no cardápio do delivery.

---

## Parte 1 — Opções do produto: dois tipos de item

### Banco de dados
A coluna `pdv_product_option_items.linked_product_id` já existe. Adicionar:
- `item_kind text` em `pdv_product_option_items` com valores `'ingredient' | 'product'` (default `'ingredient'`).
- Constraint: `item_kind = 'product'` exige `linked_product_id NOT NULL`; `item_kind = 'ingredient'` permite receita via `pdv_option_item_recipes`.
- Trigger: ao consumir uma opção do tipo `product` em comanda, debitar estoque do produto vinculado (reaproveitar lógica de composição/recipes já existente do produto-alvo).

### UI — `PDVProductOptionsManager.tsx`
No bloco "novo item" e nos itens existentes, exibir um seletor de tipo:
- **Insumo**: mantém Popover atual com busca em `pdv_ingredients` + quantidade da receita.
- **Produto**: novo Popover com busca em `pdv_products` (mesmo tenant). Ao selecionar:
  - preenche `name` com o nome do produto,
  - sugere `price_adjustment` igual ao `price_salon` do produto (editável),
  - mostra badge "Produto vinculado: X" com botão de remover.
- Badge visual no card do item indicando o tipo (Insumo / Produto).

### Hook
Estender `usePDVProductOptions` (createItem/updateItem) para aceitar `item_kind` e `linked_product_id`.

### Pedido (consumo)
- `AddItemDialog` / `ProductOptionSelector`: já lê `linked_product` via join — manter UI igual.
- Backend de baixa de estoque (`pdv_comanda_items` triggers / RPC de comanda): se item da opção for `kind='product'`, descontar receita do `linked_product_id` em vez do recipe do option_item.

---

## Parte 2 — Sincronização PDV → Delivery

### Modelo de espelhamento
Estender as tabelas do delivery para rastrear origem PDV:
- `delivery_product_options.source_pdv_option_id uuid` (nullable, unique por `user_id`).
- `delivery_product_option_items.source_pdv_option_item_id uuid` (nullable, unique por `user_id`).
- `delivery_product_option_items.linked_product_id uuid` referenciando `delivery_products(id)` para o caso "Produto" (resolvido via `shared_products` ou clone automático no delivery).

### Trigger de sincronização (Postgres)
Criar triggers `AFTER INSERT/UPDATE/DELETE` em:
- `pdv_products` → atualiza o `delivery_products` correspondente (via `source_pdv_product_id`) com nome, descrição, imagem, `is_available`, `preparation_time`, `serves`, e `base_price = price_delivery ?? price_salon`.
- `pdv_product_options` → upsert/delete em `delivery_product_options` (mapeando por `source_pdv_option_id`); cria a opção no produto delivery espelho se ainda não existir.
- `pdv_product_option_items` → upsert/delete em `delivery_product_option_items`; quando `item_kind='product'`, garante que o `linked_product_id` (PDV) também esteja compartilhado para o delivery (clone preguiçoso) e grava a referência espelhada.

Cada trigger checa se `EXISTS (SELECT 1 FROM delivery_products WHERE source_pdv_product_id = NEW.product_id AND user_id = NEW.user_id_via_lookup)` antes de propagar — assim, produtos não compartilhados não geram efeito colateral.

### Frontend
- Em `useShareToDelivery`: ao compartilhar pela primeira vez, popular também `delivery_product_options` + items a partir das opções existentes do produto PDV (chamada de uma RPC `delivery_clone_options_from_pdv(p_pdv_product_id)`).
- `ShareToDeliveryDialog`: exibir aviso "As alterações futuras no PDV serão refletidas automaticamente no delivery."
- Em `Delivery / Personalization` e `delivery_products` UI: badge "Sincronizado do PDV" e bloqueio de edição manual dos campos espelhados (com botão "Desvincular" que apaga `source_pdv_product_id`).

### Conflito / desvinculação
- Coluna `delivery_products.sync_enabled boolean default true`. Toggle por produto na tela do delivery.
- Quando `sync_enabled = false`, triggers ignoram esse produto.

---

## Detalhes técnicos

### Migrations
1. `ALTER TABLE pdv_product_option_items ADD COLUMN item_kind text NOT NULL DEFAULT 'ingredient' CHECK (item_kind IN ('ingredient','product'))`.
2. CHECK: `(item_kind = 'product' AND linked_product_id IS NOT NULL) OR item_kind = 'ingredient'`.
3. `ALTER TABLE delivery_product_options ADD COLUMN source_pdv_option_id uuid` + índice único `(user_id, source_pdv_option_id)`.
4. `ALTER TABLE delivery_product_option_items ADD COLUMN source_pdv_option_item_id uuid, ADD COLUMN linked_product_id uuid REFERENCES delivery_products(id), ADD COLUMN item_kind text DEFAULT 'ingredient'`.
5. `ALTER TABLE delivery_products ADD COLUMN sync_enabled boolean DEFAULT true`.
6. Functions + triggers de sincronização (PL/pgSQL) com `SECURITY DEFINER` e `search_path=public`.
7. RPC `delivery_clone_options_from_pdv(uuid)` — cria opções/itens espelhados na primeira partilha.

### Arquivos frontend a editar
- `src/hooks/use-pdv-product-options.ts` — aceitar `item_kind`, `linked_product_id`, retornar `linked_product` (já há join).
- `src/components/pdv/PDVProductOptionsManager.tsx` — novo seletor "Tipo do item" (Insumo / Produto) com Popover de busca em produtos.
- `src/hooks/use-share-to-delivery.ts` — após insert, chamar RPC `delivery_clone_options_from_pdv`.
- `src/components/pdv/ShareToDeliveryDialog.tsx` — texto sobre auto-sync.
- `src/components/delivery/...` — badge "Sincronizado do PDV" + toggle `sync_enabled`.
- `src/integrations/supabase/types.ts` — regenerado.

### Compatibilidade
- Itens de opção existentes mantêm `item_kind='ingredient'` (default).
- `delivery_products` já compartilhados serão sincronizados retroativamente em uma migração one-shot que copia opções do PDV-origem para o delivery espelho.

---

## Critérios de aceitação
- Em **Opções**, o usuário escolhe entre "Insumo" e "Produto" para cada item; ambos coexistem na mesma opção.
- Adicionar uma opção do tipo "Produto" em uma comanda baixa o estoque do produto vinculado (não duplica baixa).
- Editar nome/preço/imagem/disponibilidade de um produto PDV compartilhado atualiza imediatamente o `delivery_products` correspondente.
- Adicionar/editar/remover opções e itens de opção no PDV propaga para o delivery em segundos.
- Produto delivery compartilhado mostra badge e bloqueia edição manual; toggle "Sincronizar com PDV" permite desligar.
- Auditoria: nenhuma propagação ocorre em produtos com `sync_enabled=false` ou sem `source_pdv_product_id`.

Aprove para implementar.
