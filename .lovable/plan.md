

## Fix: Recorte de imagem produzindo resultado errado

### Problema raiz
Dois bugs no `ImageCropDialog`:

1. **Estado persistente entre aberturas**: `crop` e `completedCrop` não resetam quando o dialog abre com nova imagem. Valores do crop anterior podem ser usados no novo.
2. **`completedCrop` nunca definido no load inicial**: O `onImageLoad` seta o `crop` (em %) mas nunca dispara `onComplete`, então `completedCrop` (PixelCrop) fica `undefined` até o usuário arrastar manualmente. Quando o usuário arrasta minimamente, o pixel crop pode não corresponder ao visual.

### Correção em `src/components/ui/image-crop-dialog.tsx`

1. **Resetar estado quando o dialog abre ou `imageSrc` muda**: Adicionar `useEffect` que limpa `crop`, `completedCrop` quando `open` muda para `true` ou `imageSrc` muda.

2. **Capturar PixelCrop no `onImageLoad`**: Após calcular o crop inicial com `centerAspectCrop`, converter manualmente para pixel coordinates usando as dimensões renderizadas da imagem e setar `completedCrop` imediatamente — assim o botão "Confirmar" já funciona sem o usuário precisar arrastar.

3. **Usar `useCallback` corretamente**: Garantir que o `handleConfirm` sempre use o `completedCrop` mais recente.

### Mudança resumida

```typescript
// Reset on open/image change
useEffect(() => {
  if (open) {
    setCrop(undefined);
    setCompletedCrop(undefined);
  }
}, [open, imageSrc]);

// On image load: set both crop AND completedCrop
const onImageLoad = useCallback((e) => {
  const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
  const percentCrop = centerAspectCrop(naturalWidth, naturalHeight, aspectRatio);
  setCrop(percentCrop);
  
  // Convert % crop to pixel crop for completedCrop
  const pixelCrop: PixelCrop = {
    unit: "px",
    x: (percentCrop.x / 100) * width,
    y: (percentCrop.y / 100) * height,
    width: (percentCrop.width / 100) * width,
    height: (percentCrop.height / 100) * height,
  };
  setCompletedCrop(pixelCrop);
}, [aspectRatio]);
```

Apenas 1 arquivo modificado: `src/components/ui/image-crop-dialog.tsx`.

