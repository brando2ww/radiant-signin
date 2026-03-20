

## Fix: "Maximum update depth exceeded" no Painel Super Admin

### Causa Raiz

O erro acontece pela composição de múltiplos `Slot` (Radix) aninhados: `SidebarMenuButton asChild` → `Tooltip` → `TooltipTrigger asChild` → `NavLink` (que internamente usa `RouterNavLink` com render function no `className`). Essa cadeia de refs compostos causa um loop infinito de `setState` via `setRef`.

### Solução

Remover o prop `tooltip` do `SidebarMenuButton` no `AdminSidebar.tsx`. Isso elimina a camada extra de `Tooltip` + `TooltipTrigger asChild` que causa o conflito de refs com o `NavLink`.

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/super-admin/AdminSidebar.tsx` | Remover `tooltip={item.title}` do `SidebarMenuButton` |

