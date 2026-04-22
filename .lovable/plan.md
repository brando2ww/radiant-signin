

## Opções de produto não aparecem para o garçom

### Causa
As tabelas `pdv_product_options` e `pdv_product_option_items` têm RLS apenas para o dono (`p.user_id = auth.uid()`). Quando o garçom (Gabriel) abre um produto na tela `Adicionar Item`, o Supabase bloqueia a leitura das opções do produto do dono (Ederson) e o app mostra apenas Quantidade + Observações, sem os modificadores cadastrados.

A consulta no código (`usePDVProductOptionsForOrder`) está correta — o problema é só a regra do banco.

### Solução

#### 1. Migration de RLS (Supabase)
Adicionar policies de SELECT para staff (vinculado via `is_establishment_member`) nas tabelas:

- `public.pdv_product_options` — staff pode ver opções de produtos cujo dono é o estabelecimento ao qual pertence.
- `public.pdv_product_option_items` — staff pode ver itens das opções desses produtos (respeitando o vínculo via produto pai).

A policy de `pdv_option_item_recipes` para staff já existe, então não precisa mexer.  
As policies do dono continuam intactas.

```sql
-- Esboço
CREATE POLICY "Staff can view product options"
  ON public.pdv_product_options FOR SELECT TO authenticated
  USING (product_id IN (
    SELECT id FROM pdv_products
    WHERE user_id = auth.uid() OR is_establishment_member(user_id)
  ));

CREATE POLICY "Staff can view product option items"
  ON public.pdv_product_option_items FOR SELECT TO authenticated
  USING (option_id IN (
    SELECT po.id FROM pdv_product_options po
    JOIN pdv_products p ON p.id = po.product_id
    WHERE p.user_id = auth.uid() OR is_establishment_member(p.user_id)
  ));
```

#### 2. Sem mudanças de código frontend
O hook e a tela já tratam o fluxo: assim que as opções voltarem populadas, o `MobileProductOptionSelector` será exibido antes da tela de quantidade.

### Validação
1. Logar como dono e cadastrar um produto com opções (ex: "Caipira Cremosa" com modificadores).
2. Logar como garçom (Gabriel).
3. Abrir uma comanda, tocar em "Adicionar Item", selecionar o produto.
4. Deve aparecer primeiro a tela de seleção de opções, e só depois Quantidade/Observações.
5. Confirmar que o item entra na comanda com as opções escolhidas registradas nas observações.

### Fora de escopo
- Permitir staff editar/criar opções (continua restrito ao dono).
- Mexer em policies de outras tabelas operacionais.

