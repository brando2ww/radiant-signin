

## Fix: Clique nos insumos não funciona no dialog de opções

### Causa raiz

O `Popover` (com `Command` dentro) está dentro de um `Dialog`. O Radix Dialog é modal por padrão e captura o foco, impedindo que cliques no Popover (que também é portal) funcionem corretamente. Esse é um padrão já documentado no projeto.

### Correção — 1 arquivo

**`src/components/delivery/ProductOptionDialog.tsx`**

Adicionar `modal={false}` ao `Popover` (linha 299) para evitar conflito de foco com o Dialog pai:

```tsx
<Popover
  modal={false}
  open={openPopoverIndex === index}
  onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
>
```

Essa é a mesma solução já aplicada em outros locais do projeto (ex: `IngredientLinker`, `IngredientDialog`).

