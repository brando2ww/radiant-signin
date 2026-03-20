

## Mover botão "Novo" para o centro da tab bar

### Mudança
Reordenar os itens da bottom tab bar para que o FAB "Novo" fique no meio (posição 3 de 5 colunas), entre Comandas e Cozinha:

```text
Mesas  Comandas  [+Novo]  Cozinha  (vazio ou futuro)
```

Na verdade, com 3 tabs + 1 FAB, o layout ideal é centralizar o FAB entre as tabs:

```text
  Mesas   Comandas   (+)   Cozinha
```

### Implementação
Alterar `BottomTabBar.tsx`:
- Renderizar: tab Mesas → tab Comandas → botão Novo (FAB central) → tab Cozinha
- Manter `grid-cols-4` mas colocar o FAB na 3ª posição e Cozinha na 4ª

### Arquivo
| Arquivo | Ação |
|---------|------|
| `src/components/garcom/BottomTabBar.tsx` | Reordenar: Mesas, Comandas, FAB Novo, Cozinha |

