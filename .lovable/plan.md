

## Fix: Plano de Contas - check constraint violation

### Problema

O banco de dados tem um check constraint que aceita apenas valores em inglês: `revenue`, `expense`, `cost`, `asset`, `liability`. O código usa valores em português (`receita`, `despesa`, `custo`), causando o erro ao inserir.

### Solução

Mapear os valores internos para inglês (compatível com o DB) e manter os labels em português na UI.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/financial/ChartOfAccounts.tsx` | Trocar valores de `ACCOUNT_TYPES` para `revenue`, `expense`, `cost`. Atualizar `emptyForm`, `countByType`, `expandedTypes` |
| `src/hooks/use-pdv-chart-of-accounts.ts` | Trocar valores do seed para `revenue`, `expense`, `cost` |

Valores mapeados:
- `receita` → `revenue` (label: "Receita")
- `despesa` → `expense` (label: "Despesa")  
- `custo` → `cost` (label: "Custo (CMV)")

