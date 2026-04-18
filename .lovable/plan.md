

## Problema

No popover de busca de sub-produto (`ProductCompositionManager.tsx`), clicar no item da lista não adiciona — só funciona ao apertar Enter. Causa: o `CommandItem` do `cmdk` dispara `onSelect` no Enter; o clique do mouse precisa ser explicitamente tratado via `onMouseDown`/`onClick`, ou o item precisa estar configurado para que o `cmdk` aceite cliques.

## Causa provável

O `CommandItem` filtra por `value` (texto) e o `onSelect` recebe esse valor. Se o `value` não bate com o filtro do `CommandInput`, o item fica "desabilitado" silenciosamente para clique. Além disso, o handler atual provavelmente está em `onSelect` apenas, e o clique pode estar sendo intercetado pelo fechamento do popover antes do `onSelect` disparar.

## Solução

### Arquivo: `src/components/pdv/ProductCompositionManager.tsx`

Adicionar handler `onMouseDown` (que dispara antes do blur/fechamento do popover) no `CommandItem`, garantindo que o clique chame `handleAddProduct(product.id)` e feche o popover:

```tsx
<CommandItem
  key={product.id}
  value={product.name}
  onSelect={() => {
    handleAddProduct(product.id);
    setOpen(false);
  }}
  onMouseDown={(e) => {
    e.preventDefault();
    handleAddProduct(product.id);
    setOpen(false);
  }}
>
  ...
</CommandItem>
```

O `e.preventDefault()` no `onMouseDown` evita que o popover roube o foco antes do clique completar.

## Arquivo
- `src/components/pdv/ProductCompositionManager.tsx` — único arquivo alterado.

