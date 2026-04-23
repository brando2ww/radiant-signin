

## Toasts compactos e no topo da página

### Causa

Em `src/components/ui/sonner.tsx`, o `<Sonner />` é renderizado sem `position` (default `bottom-right`) e sem limites de tamanho — em mobile ele expande quase 100% da largura e fica embaixo.

### Mudança

Em `src/components/ui/sonner.tsx`, ajustar o `<Sonner />`:

- `position="top-center"` — toasts aparecem no topo.
- `expand={false}` e `richColors={false}` — visual mais discreto.
- `duration={2500}` — desaparece rápido.
- Em `toastOptions.classNames.toast`: adicionar `min-h-0 py-2 px-3 text-sm w-auto max-w-[90vw] mx-auto rounded-lg` para um toast pequeno, com largura ajustada ao conteúdo (não ocupa a tela toda).
- Em `toastOptions.classNames.description`: `text-xs` para descrição compacta.

```tsx
<Sonner
  theme={theme as ToasterProps["theme"]}
  className="toaster group"
  position="top-center"
  expand={false}
  duration={2500}
  toastOptions={{
    classNames: {
      toast:
        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg min-h-0 py-2 px-3 text-sm w-auto max-w-[90vw] mx-auto rounded-lg",
      description: "group-[.toast]:text-muted-foreground text-xs",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
    },
  }}
  {...props}
/>
```

### Validação

- Adicionar item à comanda em `/garcom/comanda/:id/adicionar` → toast "Item adicionado!" aparece no topo, pequeno, com largura ajustada ao texto, e some em ~2,5s.
- Criar comanda nova / sucesso/erro em outras telas → mesmo comportamento (topo, compacto).
- Mobile (390px) e desktop: toast nunca ocupa a tela toda; fica centralizado no topo.

