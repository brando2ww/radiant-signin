

## Corrigir borda inferior cortada do input

A linha azul aparecendo embaixo do input é o `focus-visible:ring` do `<Input>` sendo cortado pelo container que tem `overflow-y-auto`. O ring vaza além do conteúdo do scroll, então o navegador clipa a parte de baixo (e laterais).

### Mudança em `src/pages/garcom/GarcomMesaDetalhe.tsx`

No container dos inputs (linha 320), trocar:
```tsx
<div className="space-y-3 max-h-[50vh] overflow-y-auto px-1 -mx-1">
```
por:
```tsx
<div className="space-y-3 max-h-[40vh] overflow-y-auto px-2 -mx-2 py-1">
```

- `px-2 -mx-2` aumenta o padding lateral para o ring de foco caber sem clipping.
- `py-1` adiciona padding vertical para o ring caber em cima/embaixo.
- `max-h-[40vh]` reduz a altura para evitar conflito com teclado virtual no mobile.

### Validação

- Foco no input não mostra mais traço azul cortado embaixo — o anel de foco aparece completo.
- Adicionar 5+ comandas → scroll funciona normalmente sem cortar a borda.

