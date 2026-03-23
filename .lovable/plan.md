

## Fix: Dropdown de Integrações abrindo no canto

### Problema

O dropdown de "Integrações" está abrindo deslocado do trigger, provavelmente no canto esquerdo do menu ao invés de embaixo do botão. Isso acontece porque o Radix `NavigationMenu` internamente posiciona o conteúdo relativo à lista toda, não ao item individual.

### Solução

Forçar que o conteúdo do dropdown fique posicionado relativo ao `NavigationMenuItem` (que já tem `relative`), desabilitando a animação de motion do Radix que reposiciona o conteúdo e garantindo que o `NavigationMenuContent` use posicionamento absoluto correto em relação ao seu item pai.

### Mudança

**`src/components/pdv/PDVHeaderNav.tsx`**:
- Adicionar `forceMount` no `NavigationMenuContent` e controlar visibilidade manualmente, OU
- Remover as classes de motion/slide do content que interferem no posicionamento
- Adicionar `data-[motion=from-start]:!slide-in-from-left-0 data-[motion=from-end]:!slide-in-from-right-0` para neutralizar os slides que deslocam o dropdown

**Alternativa mais limpa** — Trocar o `NavigationMenu` do Radix por um simples `Popover` ou dropdown custom para a seção "Integrações" (1 item só), ou aplicar `style={{ position: 'absolute', top: '100%' }}` inline no content para sobrescrever o Radix.

A abordagem recomendada é adicionar classes que neutralizem o reposicionamento do Radix no `NavigationMenuContent`:

```tsx
<NavigationMenuContent
  className={cn(
    "!absolute !top-full mt-1.5 rounded-md border bg-popover text-popover-foreground shadow-lg",
    "data-[motion^=from-]:!animate-none data-[motion^=to-]:!animate-none",
    isRightAligned ? "right-0 left-auto" : "left-0"
  )}
>
```

Usar `!important` via `!` prefix do Tailwind para garantir que o posicionamento absoluto relativo ao item pai (que tem `relative`) seja respeitado, desabilitando as animações de slide do Radix que causam o deslocamento.

