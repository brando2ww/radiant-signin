`.

<lov-plan>

## Logo 1,5× maior no header do garçom

### Causa

`src/components/garcom/GarcomHeader.tsx` usa `<Logo size="sm" />`, que aplica `h-8` (32px). 1,5× = 48px = `h-12`. O header é `h-14` (56px), então cabe sem ajuste.

### Mudança

Em `src/components/garcom/GarcomHeader.tsx` linha 11, sobrescrever a altura via classe com `!` (important) para vencer a `h-8` interna que o componente `Logo` aplica com `size="sm"`:

```tsx
<Logo size="sm" className="!h-12 shrink-0" />
```

### Validação

- Logo Velara passa a aparecer com ~48px no header (1,5× do tamanho atual).
- Textos "Olá, X" + título continuam alinhados à direita, sem quebra.
- Header com 56px de altura comporta o logo com folga.

