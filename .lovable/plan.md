

## Fix: Página de Centros de Custo operacional

### Problemas

1. Botão "Novo Centro de Custo" sem `onClick` — não abre dialog
2. Sem funcionalidade de editar/excluir centros de custo
3. Hook não tem mutations de update/delete

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-pdv-cost-centers.ts` | Adicionar mutations `updateCostCenter` e `deleteCostCenter` (soft delete via `is_active = false`) |
| `src/pages/pdv/financial/CostCenters.tsx` | Conectar botão "Novo" ao `CostCenterQuickDialog`; adicionar botões editar/excluir em cada centro; dialog de confirmação para excluir; dialog de edição |

### Detalhes

**Hook** — adicionar:
- `updateCostCenter(id, name)` — atualiza nome
- `deleteCostCenter(id)` — soft delete (`is_active = false`)

**Página** — adicionar:
- State `dialogOpen` + `CostCenterQuickDialog` conectado ao `createCostCenter`
- Botões `Pencil` e `Trash2` em cada centro de custo
- Dialog de edição (reutilizar `CostCenterQuickDialog` com valor inicial)
- `AlertDialog` para confirmar exclusão

