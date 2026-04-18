

## Problema
Ao ativar o toggle "Produto Composto" dentro da aba Composição, o produto é salvo automaticamente e o dialog fecha. O mesmo acontece ao mudar "Baixa de estoque". Deveria mudar apenas o estado local do formulário e só persistir quando o usuário clicar em "Salvar".

## Causa
Em `src/components/pdv/ProductDialog.tsx` (linhas 705-710), os handlers `onCompositeChange` e `onStockDeductionModeChange` chamam `onSubmit({ ...form.getValues(), is_composite: value })`, o que aciona o submit completo (salva no banco + reseta form + fecha dialog).

Os sub-produtos em si (`addComposition`) já são persistidos diretamente em `pdv_product_compositions` via mutation no hook — isso está correto e não fecha o dialog. O problema é só o toggle e o select.

## Solução

### Arquivo: `src/components/pdv/ProductDialog.tsx`

1. Adicionar os campos `is_composite` e `stock_deduction_mode` aos `defaultValues` do `useForm` e ao `form.reset(...)` que sincroniza com o `product` (no `useEffect`).
2. Trocar os handlers da aba Composição para apenas atualizar o form local:
   ```tsx
   <ProductCompositionManager
     productId={product.id}
     productPrice={currentPrice}
     isComposite={form.watch("is_composite")}
     stockDeductionMode={form.watch("stock_deduction_mode")}
     onCompositeChange={(value) => form.setValue("is_composite", value, { shouldDirty: true })}
     onStockDeductionModeChange={(value) => form.setValue("stock_deduction_mode", value, { shouldDirty: true })}
   />
   ```
3. Garantir que o `handleSubmit` (linha 249) já passe `is_composite` e `stock_deduction_mode` para `onSubmit` — como esses campos passam a fazer parte do form via `defaultValues`, o `form.handleSubmit(data => onSubmit(data))` já enviará automaticamente.

### Comportamento resultante
- Toggle "Produto Composto" → muda só visualmente; aba Composição abre/fecha; nada é salvo.
- Adicionar/remover sub-produtos → continua persistindo direto em `pdv_product_compositions` (essa tabela é independente; faz sentido salvar imediatamente para não perder o trabalho).
- "Baixa de estoque" → muda só localmente.
- Só ao clicar "Salvar" os campos `is_composite` e `stock_deduction_mode` vão para `pdv_products`.

## Arquivo
- `src/components/pdv/ProductDialog.tsx` — único arquivo alterado.

