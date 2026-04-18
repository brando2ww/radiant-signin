

## Problema

Ao adicionar sub-produto: `Could not embed because more than one relationship was found for 'pdv_product_compositions' and 'pdv_products'`.

## Causa

A tabela `pdv_product_compositions` tem 2 FKs para `pdv_products` (`parent_product_id` e `child_product_id`). No `useProductCompositions` (`src/hooks/use-pdv-compositions.ts`), os selects usam embed ambíguo:

```ts
.select("*, child_product:pdv_products(*)")
```

PostgREST não sabe qual FK seguir → erro.

## Solução

### Arquivo: `src/hooks/use-pdv-compositions.ts`

Trocar embeds para nomear a FK explicitamente:

```ts
.select("*, child_product:pdv_products!pdv_product_compositions_child_product_id_fkey(*)")
```

Locais a alterar:
1. `useQuery` linha 27 — select da listagem
2. `addComposition.mutationFn` linha 66 — select após insert

Sem mudanças em schema, UI ou outros arquivos.

## Arquivo
- `src/hooks/use-pdv-compositions.ts`

