

## Reimprimir Demonstrativo do Último Caixa Fechado

### Problema
Quando o usuário fecha a tela de impressão sem imprimir, não há como reimprimir o demonstrativo. A função `printCashierReport` só é chamada no momento do fechamento.

### Solução

Adicionar um botão "Reimprimir Último Caixa" na sidebar de ações quando o caixa está fechado, que busca a última sessão fechada do banco e reimprimi o demonstrativo.

### Mudanças

#### 1. `src/hooks/use-pdv-cashier.ts`
- Adicionar query `lastClosedSession` que busca a última sessão com `closed_at IS NOT NULL` do usuário, ordenada por `closed_at DESC`, com `maybeSingle()`
- Adicionar query `lastClosedMovements` que busca as movimentações dessa sessão
- Retornar `lastClosedSession` e `lastClosedMovements` no hook

#### 2. `src/components/pdv/CloseCashierDialog.tsx`
- Extrair a função `printCashierReport` para ser exportada separadamente (como função pura que recebe session, movements, closingBalance, notes, riskLevel) — permitindo reuso fora do dialog

#### 3. `src/pages/pdv/Cashier.tsx`
- Importar `printCashierReport` exportada
- Usar `lastClosedSession` e `lastClosedMovements` do hook
- Criar função `handleReprintLastCashier` que chama `printCashierReport` com os dados da última sessão
- Passar `onReprintLast` para o sidebar

#### 4. `src/components/pdv/cashier/CashierActionsSidebar.tsx`
- Adicionar prop `onReprintLast?: () => void`
- Quando o caixa está fechado e `onReprintLast` existe, mostrar botão "Reimprimir Último Caixa" com ícone `Printer`

#### 5. `src/hooks/use-whatsapp-connection.ts` (fix build error)
- Substituir `NodeJS.Timeout` por `ReturnType<typeof setTimeout>` nas linhas 49-50

### Fluxo
```text
Caixa fechado → Sidebar mostra "Reimprimir Último Caixa"
  → Clique → busca última sessão + movimentações do banco
  → Chama printCashierReport com os dados
  → Abre janela de impressão
```

