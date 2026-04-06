

## Adicionar redimensionamento/crop de imagem antes do upload

### Visao geral
Ao selecionar uma imagem (capa ou logo), abrir um dialog com ferramenta de crop/redimensionamento. O usuario ajusta a area desejada e so depois a imagem e enviada ao Supabase.

### Biblioteca
Instalar `react-image-crop` — leve, sem dependencias, suporta aspect ratio fixo.

### Arquivos

| Acao | Arquivo | O que |
|------|---------|-------|
| Criar | `src/components/ui/image-crop-dialog.tsx` | Dialog reutilizavel com canvas crop |
| Modificar | `src/components/delivery/PersonalizationTab.tsx` | Integrar dialog de crop no fluxo de upload |

### Fluxo

1. Usuario seleciona arquivo → abre `ImageCropDialog` com preview
2. Para **capa**: aspect ratio 3:1 (1200x400). Para **logo**: aspect ratio 1:1 (circular)
3. Usuario ajusta a area de crop arrastando/redimensionando
4. Clica "Confirmar" → canvas gera um `Blob` recortado → upload normal ao Supabase
5. Clica "Cancelar" → fecha sem fazer nada

### Detalhes tecnicos

**`ImageCropDialog`**:
- Props: `open`, `onOpenChange`, `imageSrc` (object URL), `aspectRatio`, `onCropComplete(blob: Blob)`
- Usa `ReactCrop` do `react-image-crop` para selecao visual
- Ao confirmar, desenha a area selecionada em um `<canvas>` offscreen e exporta como blob via `canvas.toBlob()`
- Aspect ratios: capa = `3/1`, logo = `1/1` (com `circularCrop`)

**`PersonalizationTab` mudancas**:
- Ao selecionar arquivo, cria object URL e abre o dialog de crop em vez de fazer upload direto
- State novo: `cropDialogOpen`, `cropImageSrc`, `cropField`, `cropAspect`
- Apos crop, converte blob em File e chama o `uploadFile` existente

