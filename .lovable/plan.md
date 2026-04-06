

## Compartilhar Produto PDV com Delivery

### Resumo
Adicionar um botão "Delivery" no card de cada produto PDV. Ao clicar, abre um dialog para selecionar a categoria do delivery. O produto é então copiado para a tabela `delivery_products` com os dados mapeados. Um badge visual indica quais produtos já foram compartilhados.

### Rastreamento do vínculo
Criar uma coluna `source_pdv_product_id` na tabela `delivery_products` para rastrear a origem. Isso permite:
- Mostrar badge "No Delivery" nos produtos já compartilhados
- Evitar duplicatas
- Futuramente sincronizar alterações

### Migration SQL
```sql
ALTER TABLE delivery_products 
ADD COLUMN source_pdv_product_id uuid REFERENCES pdv_products(id) ON DELETE SET NULL;
```

### Arquivos a modificar/criar

1. **`src/hooks/use-share-to-delivery.ts`** (novo)
   - Hook com mutation para copiar produto PDV → delivery_products
   - Mapeia campos: `name`, `description`, `image_url`, `preparation_time`, `serves`, `price_delivery` (ou `price_salon`) → `base_price`
   - Query para verificar quais produtos PDV já têm vínculo (busca `source_pdv_product_id`)

2. **`src/components/pdv/ShareToDeliveryDialog.tsx`** (novo)
   - Dialog com select de categorias do delivery (`useDeliveryCategories`)
   - Campo de preço pré-preenchido (editável)
   - Botão confirmar que executa a mutation

3. **`src/components/pdv/ProductCard.tsx`**
   - Adicionar badge "Delivery" (verde) quando o produto já está compartilhado
   - Adicionar item "Enviar para Delivery" no dropdown menu
   - Ao clicar, abre o `ShareToDeliveryDialog`

4. **`src/pages/pdv/Products.tsx`**
   - Passar dados de vínculo (set de IDs compartilhados) para os cards

### Fluxo do usuário
1. Usuário vê produto no PDV → clica no menu "⋮" → "Enviar para Delivery"
2. Abre dialog com: nome do produto (readonly), seletor de categoria, preço (editável)
3. Confirma → produto aparece na listagem do delivery
4. Badge "Delivery" aparece no card do produto PDV

### Mapeamento de campos
| PDV | Delivery |
|-----|----------|
| name | name |
| description | description |
| image_url | image_url |
| price_delivery ou price_salon | base_price |
| preparation_time | preparation_time |
| serves | serves |
| — | category_id (selecionado) |
| id | source_pdv_product_id |

