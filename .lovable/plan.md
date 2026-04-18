

## Problema
Ao clicar em "Novo Produto" depois de editar um produto, o formulário aparece com os dados do produto editado anteriormente. Deveria abrir limpo.

## Causa
Em `src/pages/pdv/Products.tsx`, o `handleCreate` faz `setSelectedProduct(null)` e `setDialogOpen(true)`, mas o `ProductDialog` usa `react-hook-form` com `defaultValues` derivados do `product` prop. O `reset` do form provavelmente só dispara quando `product` muda de objeto para objeto (não de objeto → null), ou o `useEffect` que reseta não trata o caso `null` corretamente.

Preciso confirmar lendo `ProductDialog.tsx` para ver exatamente como o reset está feito hoje.

## Plano

1. **Ler `src/components/pdv/ProductDialog.tsx`** para identificar o `useEffect`/`reset` e ajustar para que, quando `product` for `null/undefined` E o dialog abrir, o form seja resetado para os valores default vazios (não apenas quando há um produto novo).

2. **Correção típica esperada**: garantir que o `useEffect` que sincroniza `product → form.reset(...)` também rode quando `product` vira `null` (chamando `form.reset(defaultValues)` com objeto vazio/padrão), e que dependa de `[product, open]` para limpar sempre que reabrir em modo "novo".

3. Limpar também estados auxiliares (imagem, modo Simples Nacional, etc.) no mesmo efeito quando `product` for `null`.

## Arquivo
- `src/components/pdv/ProductDialog.tsx` — ajustar lógica de reset.

Sem mudanças em schema, hooks ou outras telas. Risco mínimo.

