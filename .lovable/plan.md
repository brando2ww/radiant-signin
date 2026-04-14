

# Vincular Sub-Produtos ao Estoque via Produtos Completos

## Conceito

Hoje os "option items" (sub-produtos) sao registros simples com `name` e `price_adjustment` na tabela `pdv_product_option_items`. A proposta e transformar cada sub-produto em um **produto completo** (`pdv_products`), que ja tem dados fiscais (NCM, CFOP, ICMS, etc.), impressora (`printer_station`), ficha tecnica (recipes/ingredientes), e preco proprio.

A tabela `pdv_product_option_items` ganha uma coluna `linked_product_id` que referencia `pdv_products`. Quando preenchida, o sistema usa os dados do produto vinculado (fiscal, impressora, preco) em vez dos campos locais.

## Mudancas no banco de dados

### Migration: Nova coluna em `pdv_product_option_items`

```sql
ALTER TABLE public.pdv_product_option_items
  ADD COLUMN IF NOT EXISTS linked_product_id uuid REFERENCES pdv_products(id) ON DELETE SET NULL;
```

Uma unica coluna opcional. Quando `linked_product_id` esta preenchido:
- O `price_adjustment` pode ser ignorado (usa o preco do produto vinculado)
- O fiscal e impressora vem do produto vinculado
- O estoque e gerido via a ficha tecnica do produto vinculado

## Arquivos editados

### 1. `src/hooks/use-pdv-product-options.ts`

- Expandir `PDVProductOptionItem` com `linked_product_id?: string` e `linked_product?: PDVProduct`
- No fetch, fazer join: `.select("*, linked_product:pdv_products(*)")` para trazer dados do produto vinculado
- Expandir `createItem` e `updateItem` para aceitar `linked_product_id`

### 2. `src/components/pdv/PDVProductOptionsManager.tsx`

- Adicionar busca de produtos do usuario (`usePDVProducts`)
- Em cada item de opcao, mostrar botao "Vincular Produto" que abre um Popover/Command com busca nos produtos existentes
- Quando vinculado, exibir: nome do produto, impressora, dados fiscais resumidos (NCM, CFOP)
- Botao "Desvincular" para remover a referencia
- Manter opcao de item sem vinculo (comportamento atual como fallback)
- Ao criar novo item, opcao de "Criar produto e vincular" que abre o ProductDialog

### 3. `src/components/pdv/ProductOptionSelector.tsx`

- Quando um item tem `linked_product`, exibir informacoes adicionais (impressora, preco proprio)
- O `price_adjustment` passa a ser o preco do produto vinculado quando disponivel

### 4. `src/components/pdv/AddItemDialog.tsx` e `src/components/pdv/ComandaAddItemDialog.tsx`

- Ao montar o item do pedido, se o option item tem `linked_product`, incluir o `printer_station` do produto vinculado nos dados enviados para a cozinha
- Garantir que o preco correto (do produto vinculado) seja usado no calculo

## Fluxo do usuario

1. Gestor cria produto "Hamburguer" com opcao "Adicionais"
2. Nos itens da opcao, clica "Vincular Produto"
3. Busca e seleciona "Bacon Extra" (que ja e um produto com NCM, impressora "Cozinha", ficha tecnica com ingredientes)
4. O "Bacon Extra" aparece como sub-produto vinculado — com estoque, fiscal e roteamento de impressora proprios
5. Na venda, ao selecionar "Bacon Extra" como adicional do Hamburguer, o sistema sabe qual impressora enviar e desconta do estoque

## Resumo tecnico

- **1 migration** (1 coluna nova em `pdv_product_option_items`)
- **0 arquivos novos**
- **4-5 arquivos editados** (hook de options, manager, selector, dialogs de adicionar item)
- **0 dependencias novas**

