

## Fichas Técnicas para Delivery: Receitas + Estoque + CMV

### Problema atual
- `delivery_products` e `delivery_product_option_items` não têm vínculo com insumos (`pdv_ingredients`)
- Pedidos delivery não descontam estoque nem entram no cálculo de CMV
- O sistema de receitas (`pdv_product_recipes`) só atende produtos do PDV

### Solução proposta

Criar tabelas de receita dedicadas para delivery (produto base e adicionais), reutilizando os mesmos insumos (`pdv_ingredients`) do estoque.

### Novas tabelas (2 migrations)

**`delivery_product_recipes`** — receita do produto delivery
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| product_id | uuid FK → delivery_products | Produto delivery |
| ingredient_id | uuid FK → pdv_ingredients | Insumo |
| quantity | numeric | Quantidade usada |
| unit | text | Unidade |
| created_at | timestamptz | |

**`delivery_option_item_recipes`** — receita de cada adicional
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| option_item_id | uuid FK → delivery_product_option_items | Item da opção |
| ingredient_id | uuid FK → pdv_ingredients | Insumo |
| quantity | numeric | Quantidade usada |
| unit | text | Unidade |
| created_at | timestamptz | |

Ambas com RLS (user via join com produto/opção) e policies de select/insert/update/delete.

### Novos arquivos

1. **`src/hooks/use-delivery-recipes.ts`** — Hook com queries e mutations para gerenciar receitas de produtos delivery (mesmo padrão do `use-pdv-recipes.ts`)

2. **`src/hooks/use-delivery-option-recipes.ts`** — Hook para receitas dos adicionais (option items)

### Arquivos modificados

3. **`src/components/delivery/ProductDialog.tsx`** — Adicionar aba "Receita" (igual ao PDV) usando um `DeliveryRecipeManager` que lista insumos, quantidades e calcula CMV do produto

4. **`src/components/delivery/ProductOptionDialog.tsx`** — Para cada item da opção, adicionar botão/seção para vincular insumos (ex: "Salmão" consome 150g de salmão do estoque)

5. **`src/hooks/use-pdv-cmv.ts`** — Incluir pedidos delivery (`delivery_orders` + `delivery_order_items`) no cálculo de CMV, somando custo de ingredientes do produto base + adicionais selecionados

6. **`src/hooks/use-pdv-dre.ts`** — Já inclui `delivery_orders` na receita, mas precisa incluir o CMV dos delivery orders (atualmente só calcula CMV de `pdv_order_items`)

7. **`src/components/delivery/ProductOptionsManager.tsx`** — Exibir badge de CMV em cada option item que tem receita vinculada

### Fluxo de uso

```text
Delivery → Cardápio → Editar "Monte Seu Poke"
  └─ Aba Receita (NOVA)
       ├─ Arroz (200g) = R$ 0,80
       ├─ Alga nori (1un) = R$ 0,50
       └─ CMV base: R$ 1,30

  └─ Aba Opções e Complementos
       └─ Etapa 01 → Salmão
            └─ Receita: Salmão (150g) = R$ 4,50
       └─ Etapa 01 → Atum
            └─ Receita: Atum (150g) = R$ 3,80

Pedido chega → CMV = base (R$ 1,30) + salmão (R$ 4,50) = R$ 5,80
            → Estoque: -200g arroz, -1 nori, -150g salmão
```

### Impacto no estoque

O desconto de estoque será calculado mas **não implementado automaticamente nesta fase** — apenas o CMV será computado. O desconto automático de estoque ao fechar pedido delivery pode ser uma segunda etapa, pois requer lógica de baixa similar à do PDV (que hoje também é manual via receitas).

