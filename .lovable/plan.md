

## Fix: Dropdown do NavigationMenu abre centralizado em vez de abaixo do item

### Problema
O `NavigationMenuViewport` (linha 80) usa `left-0 right-0 flex justify-center`, o que centraliza o dropdown no meio de toda a barra de navegação em vez de posicioná-lo abaixo do item clicado.

### Solução
Mudar o wrapper do viewport para `justify-start` e deixar o Radix UI posicionar o conteúdo naturalmente abaixo do trigger ativo. O Radix já calcula a posição horizontal via CSS custom properties internamente.

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/ui/navigation-menu.tsx` | Linha 80: trocar `justify-center` por `justify-start` no wrapper div do viewport |

### Detalhe técnico
```tsx
// De:
<div className={cn("absolute top-full left-0 right-0 flex justify-center")}>

// Para:
<div className={cn("absolute top-full left-0 flex justify-start")}>
```

Isso faz o dropdown abrir alinhado à esquerda do nav, e como cada `NavigationMenuContent` já usa `md:absolute` com `left-0 top-0`, o conteúdo aparecerá abaixo do item correspondente.

