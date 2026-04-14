

# Fix: Sidebar cortada pelo header

O sidebar usa `position: fixed; inset-y: 0` (do componente shadcn), o que faz ele começar no topo da viewport, ficando atrás do header sticky de 56px.

## Solução

Ajustar o `ChecklistsSidebar` para que o sidebar comece abaixo do header, adicionando `top-14` (3.5rem) e reduzindo a altura para `h-[calc(100svh-3.5rem)]` ao invés de `h-svh`.

### Arquivo editado: `src/components/pdv/checklists/ChecklistsSidebar.tsx`

Adicionar className customizada no `<Sidebar>` para sobrescrever o posicionamento fixo:

```
className="border-r [&>div:nth-child(2)]:top-14 [&>div:nth-child(2)]:h-[calc(100svh-3.5rem)] [&>div:first-child]:h-[calc(100svh-3.5rem)]"
```

Isso usa seletores CSS para:
- O spacer div (primeiro filho): reduzir altura
- O div fixo (segundo filho): mover para baixo do header e reduzir altura

**1 arquivo editado, 0 novos**

