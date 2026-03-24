

## Fix: Fornecedor não selecionável + Tela congelada ao fechar modal

### Problemas

1. **Popover de fornecedor não funciona** — O `Popover` dentro do `MultiSupplierSelector` é renderizado dentro do `DialogContent`, que tem seu próprio portal. O `PopoverContent` precisa de `portal={false}` ou `forceMount` para não ficar atrás do overlay do dialog.

2. **Tela congela ao fechar** — Os sub-dialogs (`SupplierDialog`, `CategoryQuickDialog`, etc.) são renderizados fora do `<Dialog>` principal como fragmentos irmãos. Quando o dialog principal fecha com `onOpenChange(false)`, o estado dos sub-dialogs pode ficar preso (ainda `true`), mantendo overlays invisíveis que bloqueiam clicks. Precisamos resetar todos os sub-dialogs ao fechar o principal.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/IngredientDialog.tsx` | 1. Adicionar `modal={false}` no `Popover` do `MultiSupplierSelector` para que funcione dentro do Dialog<br>2. Resetar estados dos sub-dialogs quando o dialog principal fecha<br>3. Garantir que o `onOpenChange` do dialog principal feche tudo |

### Detalhes

**1. Popover do fornecedor**

No componente `MultiSupplierSelector`, o `PopoverContent` precisa renderizar no mesmo container do Dialog, não em um portal separado. Solução: adicionar a prop que evita o portal no Popover, ou usar `sideOffset` e `z-index` alto.

**2. Reset dos sub-dialogs**

Criar um handler para o `onOpenChange` do Dialog principal que, ao fechar (`false`), reseta todos os sub-dialog states:

```typescript
const handleMainDialogChange = (isOpen: boolean) => {
  if (!isOpen) {
    setCategoryDialogOpen(false);
    setSectorDialogOpen(false);
    setCostCenterDialogOpen(false);
    setSupplierDialogOpen(false);
  }
  onOpenChange(isOpen);
};
```

E usar `handleMainDialogChange` no `<Dialog open={open} onOpenChange={handleMainDialogChange}>`.

