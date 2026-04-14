

# Composicao de Produtos (Sub-Produtos) no Velara PDV

Adicionar sistema de composicao onde um produto pode ser montado a partir de outros produtos ja cadastrados, com controle de quantidade, custo, margem e opcao de baixa de estoque.

## Mudancas no banco de dados

### Migration 1: Tabela `pdv_product_compositions`

```sql
CREATE TABLE public.pdv_product_compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  child_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 1,
  order_position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_reference CHECK (parent_product_id != child_product_id),
  UNIQUE (parent_product_id, child_product_id)
);

ALTER TABLE public.pdv_product_compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own compositions"
  ON public.pdv_product_compositions FOR ALL TO authenticated
  USING (
    parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
    OR parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id IN (SELECT establishment_owner_id FROM public.establishment_users WHERE user_id = auth.uid() AND is_active = true))
  )
  WITH CHECK (
    parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id = auth.uid())
    OR parent_product_id IN (SELECT id FROM public.pdv_products WHERE user_id IN (SELECT establishment_owner_id FROM public.establishment_users WHERE user_id = auth.uid() AND is_active = true))
  );
```

### Migration 2: Colunas de controle no `pdv_products`

```sql
ALTER TABLE public.pdv_products
  ADD COLUMN IF NOT EXISTS is_composite boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_deduction_mode text DEFAULT 'main';
```

- `is_composite`: flag para identificar produtos compostos
- `stock_deduction_mode`: `'main'` (baixa do produto principal) ou `'components'` (baixa dos sub-produtos)

## Arquivos novos

### 1. `src/hooks/use-pdv-compositions.ts`

Hook de CRUD para composicoes:
- `useProductCompositions(productId)`: fetch com join em `pdv_products` para dados do child
- `useAddComposition()`: insert com validacao anti-circular
- `useUpdateCompositionQuantity()`: update quantidade
- `useRemoveComposition()`: delete
- `useReorderCompositions()`: update order_position em batch
- `calculateCompositionCost(compositions)`: soma de quantity * price_salon de cada child

### 2. `src/components/pdv/ProductCompositionManager.tsx`

Componente principal da aba "Composicao" no ProductDialog:
- Toggle "Este produto e composto por outros produtos"
- Campo de busca com Command/Popover para selecionar produtos existentes
- Lista de sub-produtos com: nome, SKU/EAN, quantidade editavel, unidade, preco unitario (readonly), custo parcial
- Botao remover por item
- Icone de aviso em sub-produtos que tambem sao compostos (cascata)
- Validacao: impedir auto-referencia
- Totalizador: custo total da composicao, preco de venda, margem estimada
- Toggle de modo de baixa de estoque: "produto principal" ou "sub-produtos"
- Aviso fiscal informativo

## Arquivos editados

### 3. `src/hooks/use-pdv-products.ts`

- Adicionar `is_composite` e `stock_deduction_mode` ao interface `PDVProduct`

### 4. `src/components/pdv/ProductDialog.tsx`

- Adicionar aba "Composicao" no TabsList (6 abas total)
- Desabilitada ate o produto ser salvo (mesmo padrao de Opcoes/Receita)
- Renderiza `<ProductCompositionManager productId={product.id} productPrice={currentPrice} />`
- Incluir `is_composite` e `stock_deduction_mode` no form defaults e reset

### 5. `src/components/pdv/ProductCard.tsx`

- Se `product.is_composite`, exibir badge "Composto" com icone
- Tooltip no hover com lista resumida dos sub-produtos (usa `useProductCompositions`)

## Resumo tecnico

- **1 migration** (1 tabela nova + 2 colunas em pdv_products)
- **2 arquivos novos** (hook + componente de composicao)
- **3 arquivos editados** (ProductDialog, ProductCard, use-pdv-products)
- **0 dependencias novas**

