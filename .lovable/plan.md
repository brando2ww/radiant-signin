

## Remover funcionalidade de recorte de imagem

### O que fazer
Reverter a integração do dialog de crop no `PersonalizationTab.tsx`, voltando ao upload direto sem etapa de recorte.

### Mudanças

**`src/components/delivery/PersonalizationTab.tsx`**:
- Remover import do `ImageCropDialog`
- Remover estados de crop (`cropDialogOpen`, `cropImageSrc`, `cropField`, `cropAspect`)
- Alterar `handleFileSelect` para fazer upload direto (sem abrir dialog de crop)
- Remover `handleCropComplete`
- Remover o componente `<ImageCropDialog />` do JSX

O componente `ImageCropDialog` pode ser mantido no código caso seja útil futuramente em outros lugares, ou removido se preferir limpeza total.

