## Resumo

Quatro melhorias na área de Produtos do Delivery + baixa automática de estoque em **todas** as vendas (PDV/comandas/mesas, balcão, garçom e delivery):

1. **Duplicar produto** → também replica opções, itens das opções e fichas técnicas (insumos).
2. **Importar opções** já cadastradas em outro produto.
3. **Corrigir disponibilidade por dia da semana** no cardápio público.
4. **Baixa automática de estoque em toda venda** — produto principal + sub-produtos das opções (ex.: adicional de temaki consumindo alga, arroz, salmão, vinagre, açúcar, gergelim, cebolinha).

---

## 1) Replicar item com as opções

**Hoje:** `handleDuplicate` em `src/components/delivery/ProductList.tsx` cria só a linha em `delivery_products`. Opções, itens e receitas ficam de fora.

**Solução:** novo hook `useDuplicateProduct` em `src/hooks/use-delivery-products.ts` que:
1. Insere o novo `delivery_products` com `(cópia)` no nome.
2. Replica `delivery_product_recipes` (ficha técnica do produto).
3. Para cada `delivery_product_options` do original:
   - Cria a nova opção no produto novo.
   - Replica `delivery_product_option_items` mantendo nome, preço, ordem, disponibilidade.
   - Replica `delivery_option_item_recipes` usando o mapa `oldItemId → newItemId` para preservar o vínculo com os mesmos `pdv_ingredients`.
4. Invalida `delivery-products`, `product-options` e `delivery-option-recipes`.

`ProductList.tsx` passa a chamar esse novo hook.

## 2) Importar opções de outro produto

- Botão "Importar opções" em `src/components/delivery/ProductOptionsManager.tsx`, ao lado de "Nova Opção".
- Novo `ImportOptionsDialog.tsx`:
  - Lista os outros produtos do usuário (`useDeliveryProducts()`).
  - Ao escolher um, mostra suas opções (`useProductOptions(otherProductId)`) com checkbox.
  - Botão "Importar selecionadas" chama `useImportProductOptions({ targetProductId, sourceOptionIds })` que clona cada opção (mesma lógica do passo 1.3, preservando receitas dos itens).
- Toast com quantas opções foram importadas; invalida `product-options` do destino.

## 3) Corrigir disponibilidade por dia da semana

**Diagnóstico:** `delivery_products.available_days` (jsonb) já existe e é salva. O cardápio público (`src/hooks/use-public-menu.ts → usePublicProducts`) **não seleciona nem filtra** por esse campo.

**Solução:**
- Adicionar `available_days` ao `select` e ao tipo `PublicProduct`.
- Filtrar no client após a query:
  ```ts
  const today = new Date().getDay();
  return data.filter(p => !p.available_days?.length || p.available_days.includes(today));
  ```
- Em `src/components/delivery/ProductList.tsx` (admin), exibir badge "Indisponível hoje" quando `available_days` não inclui o dia atual (apenas visual; admin continua enxergando o produto).

## 4) Baixa automática de estoque em TODAS as vendas

**Diagnóstico atual:**
- A função SQL `consume_ingredients_for_comanda_items(p_item_ids uuid[])` **já existe** e cobre receitas do produto principal + receitas dos itens de opção, com idempotência via `pdv_stock_movements.comanda_item_id`.
- **Ela nunca é chamada** pelo frontend — por isso nada baixa estoque hoje, em nenhum canal.
- Delivery não usa `pdv_comanda_items`, então precisa de função própria.

### 4.1 PDV / Comanda / Mesa / Garçom / Balcão

Disparar a baixa quando os itens são efetivamente **pagos** (não na criação, para não baixar item cancelado).

**Local:** `src/hooks/use-pdv-payments.ts`, dentro do mutation que registra pagamento parcial/total (passo 2 — após atualizar `paid_quantity`):

```ts
const fullyPaidIds = partialItems
  .filter(p => {
    const cur = currentItems.find(i => i.id === p.itemId);
    if (!cur) return false;
    const newPaid = Math.min(cur.quantity, (cur.paid_quantity || 0) + p.quantityPaid);
    return newPaid >= cur.quantity; // só consome quando o item ficou 100% pago
  })
  .map(p => p.itemId);

if (fullyPaidIds.length > 0) {
  await supabase.rpc("consume_ingredients_for_comanda_items", { p_item_ids: fullyPaidIds });
}
```

A idempotência da função (via `pdv_stock_movements.comanda_item_id`) garante que pagamentos parciais sucessivos não causam baixa duplicada.

**Cobre automaticamente:** comanda de mesa, comanda de garçom (`/garcom`), balcão e qualquer outro fluxo que finalize pagamento via `register-partial-payment` — porque todos passam por esse mutation.

**Consumo interno (cortesia/funcionário):** em `src/hooks/use-pdv-employee-consumption.ts`, ao confirmar o consumo, chamar a mesma RPC para os `comanda_item_id` envolvidos.

### 4.2 Delivery

Delivery grava em `delivery_order_items` / `delivery_order_item_options` — estrutura paralela.

**Migration:**
```sql
-- Linkar a opção escolhida ao item do catálogo (hoje só temos texto)
ALTER TABLE public.delivery_order_item_options
  ADD COLUMN option_item_id uuid REFERENCES public.delivery_product_option_items(id);

-- Função análoga à de comanda, idempotente via pdv_stock_movements.order_item_id
CREATE OR REPLACE FUNCTION public.consume_ingredients_for_delivery_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.delivery_orders WHERE id = p_order_id;
  IF v_owner IS NULL THEN RETURN; END IF;

  -- monta consumo: produto principal + opções escolhidas
  -- agrega por (order_item_id, ingredient_id), exclui o que já tem movimento
  -- atualiza pdv_ingredients.current_stock e insere pdv_stock_movements
  --   (type='saida_venda', reason='Venda via delivery', created_by=v_owner, order_item_id=...)
END;
$$;
```

**Frontend:**
- `src/hooks/use-delivery-customers.ts → useCreateOrder`: incluir `option_item_id: option.itemId` no insert de `delivery_order_item_options` (o cart já carrega `itemId` em `selectedOptions`; só falta propagar — pequeno ajuste em `OrderConfirmation.tsx`).
- `src/hooks/use-delivery-orders.ts → useUpdateOrderStatus`: ao mudar para `confirmed`, chamar `supabase.rpc("consume_ingredients_for_delivery_order", { p_order_id: id })`. Idempotência garante segurança em retentativas.

## Detalhes técnicos

### Arquivos modificados
- `src/hooks/use-delivery-products.ts` — `useDuplicateProduct`.
- `src/hooks/use-product-options.ts` — `useImportProductOptions`.
- `src/hooks/use-public-menu.ts` — selecionar e filtrar `available_days`.
- `src/hooks/use-pdv-payments.ts` — chamar `consume_ingredients_for_comanda_items` após pagamento.
- `src/hooks/use-pdv-employee-consumption.ts` — idem para consumo interno.
- `src/hooks/use-delivery-customers.ts` — gravar `option_item_id` no pedido.
- `src/hooks/use-delivery-orders.ts` — chamar RPC ao confirmar pedido.
- `src/components/delivery/ProductList.tsx` — usar `useDuplicateProduct` + badge "Indisponível hoje".
- `src/components/delivery/ProductOptionsManager.tsx` — botão "Importar opções".
- `src/components/delivery/ImportOptionsDialog.tsx` — novo.
- `src/components/public-menu/checkout/OrderConfirmation.tsx` — incluir `itemId` no payload das opções.

### Migration SQL
- `ALTER TABLE delivery_order_item_options ADD COLUMN option_item_id uuid REFERENCES delivery_product_option_items(id);`
- `CREATE OR REPLACE FUNCTION public.consume_ingredients_for_delivery_order(p_order_id uuid) ...` (SECURITY DEFINER, idempotente via `pdv_stock_movements.order_item_id`).

### Fora do escopo
- Reverter baixa de estoque em pedido cancelado após confirmação (futuro: `revert_ingredients_for_*`).
- Bloquear venda quando estoque ficar negativo (manter como aviso/relatório por ora — função já permite negativo).
- Alerta de estoque insuficiente no checkout público.
