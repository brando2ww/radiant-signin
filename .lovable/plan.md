

## Plano de Contas Funcional

### Problema

A página é 100% estática — botões sem ação, contadores hardcoded em 0, sem CRUD. O hook só tem leitura, sem create/update/delete.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-pdv-chart-of-accounts.ts` | Adicionar mutations: `createAccount`, `updateAccount`, `deleteAccount` (soft delete) + seed da estrutura básica |
| `src/pages/pdv/financial/ChartOfAccounts.tsx` | Reescrever completo: conectar hook, CRUD funcional, árvore hierárquica, dialogs |

### Detalhes

**1. Hook — adicionar mutations**

- `createAccount({ code, name, account_type, parent_id? })` — insere nova conta
- `updateAccount({ id, code?, name? })` — atualiza conta
- `deleteAccount(id)` — soft delete (`is_active = false`)
- `seedBasicStructure()` — cria estrutura padrão:
  - Receitas: `1.01 Vendas Balcão`, `1.02 Vendas Delivery`, `1.03 Outras Receitas`
  - Despesas: `2.01 Aluguel`, `2.02 Energia`, `2.03 Água`, `2.04 Internet`, `2.05 Salários`, `2.06 Impostos`, `2.07 Marketing`, `2.08 Manutenção`, `2.09 Outras Despesas`
  - Custos: `3.01 Matéria-prima`, `3.02 Embalagens`, `3.03 Descartáveis`

**2. Página — funcionalidades**

- Contadores reais (conta por `account_type` do array retornado)
- Botão "Nova Conta" abre dialog com campos: Código, Nome, Tipo (Receita/Despesa/Custo), Conta pai (opcional, select das contas existentes)
- Árvore hierárquica agrupada por tipo, mostrando contas pai/filho com indentação
- Cada conta com botões editar (abre dialog preenchido) e excluir (AlertDialog de confirmação)
- Botão "Criar Estrutura Básica" chama `seedBasicStructure` e popula a árvore
- Busca/filtro por tipo de conta

