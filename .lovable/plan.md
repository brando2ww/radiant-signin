

## Fix: Logo amassado no sidebar colapsado

### Problema
Quando o sidebar colapsa, a classe `h-8 w-8` força o logo num quadrado, distorcendo a imagem.

### Solução
Remover `w-8` do estado colapsado. Manter apenas `h-8 object-contain` para que a largura se ajuste proporcionalmente.

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/super-admin/AdminSidebar.tsx` | Linha 43: mudar `h-8 w-8 object-contain` para `h-8 object-contain` |

