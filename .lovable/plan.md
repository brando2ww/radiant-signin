

## Fix: Dropdown posicionar abaixo de cada item individualmente

### Problema
O Radix `NavigationMenu` usa um **único Viewport compartilhado** posicionado no nível do `Root`. Todos os conteúdos dos menus são renderizados dentro desse viewport único, por isso ele sempre aparece na mesma posição (esquerda) independente de qual trigger foi clicado. Não é possível resolver isso apenas com CSS no viewport.

### Solução
Parar de usar o `NavigationMenuViewport` compartilhado e renderizar o conteúdo diretamente em cada `NavigationMenuItem` com posicionamento relativo. Cada item terá seu próprio dropdown posicionado abaixo do seu trigger.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar `position: relative` a cada `NavigationMenuItem` e `forceMount` + classes de posicionamento absoluto no `NavigationMenuContent` para que cada dropdown fique abaixo do seu trigger |
| `src/components/ui/navigation-menu.tsx` | Remover o `<NavigationMenuViewport />` de dentro do `NavigationMenu` Root, já que o conteúdo será renderizado inline em cada item |

### Detalhes técnicos

**navigation-menu.tsx**: Remover a linha `<NavigationMenuViewport />` do componente `NavigationMenu` Root (linha ~21).

**PDVHeaderNav.tsx**: Em cada `NavigationMenuItem`, adicionar `className="relative"` e no `NavigationMenuContent` usar classes para posicionamento absoluto direto:
```tsx
<NavigationMenuItem key={section.title} className="relative">
  <NavigationMenuTrigger>...</NavigationMenuTrigger>
  <NavigationMenuContent className="absolute left-0 top-full mt-1.5 rounded-md border bg-popover shadow-lg">
    ...
  </NavigationMenuContent>
</NavigationMenuItem>
```

Para os itens à direita (Financeiro, Integrações), usar `left-auto right-0` para que o dropdown não saia da tela.

