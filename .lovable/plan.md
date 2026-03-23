

## Substituir ícone "V" pelo logo Velara no Admin Sidebar

### O que será feito
Remover o bloco com o quadrado "V" + texto "Velaro Admin" no header do sidebar e substituir pelo componente `Logo` já existente (`src/components/ui/logo.tsx`).

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/super-admin/AdminSidebar.tsx` | Importar `Logo` e substituir o header: quando expandido mostra logo full size "sm", quando colapsado mostra logo icon size "sm" |

### Detalhes

Substituir linhas 41-49:
```tsx
<SidebarHeader className="px-4 py-5">
  <Logo size="sm" className={collapsed ? "h-8 w-8 object-contain" : ""} />
</SidebarHeader>
```

