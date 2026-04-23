

## Bug: reforço aparenta criar uma sangria do mesmo valor

### Causa-raiz (confirmada no banco)

Em `src/hooks/use-pdv-cashier.ts`, a mutation `addMovement` (linhas 181–194) atualiza `total_withdrawals` para os **dois tipos** de movimento:

```ts
const newWithdrawals =
  type === "sangria"
    ? activeSession.total_withdrawals + amount   // ✅
    : activeSession.total_withdrawals - amount;  // ❌ reforço subtrai withdrawals
```

Verifiquei no banco: a tabela `pdv_cashier_movements` contém **apenas a linha de reforço** (não há sangria duplicada criada). O que acontece é:

- Reforço de R$ 200 → cria 1 linha `reforco` na tabela ✅
- Mas também faz `total_withdrawals -= 200` na sessão → fica `-200`
- O card "Sangrias" no rodapé exibe `total_withdrawals` cru → mostra **"−R$ 200,00"**, que parece uma sangria fantasma do mesmo valor do reforço
- Confirmado na sessão atual: `total_withdrawals = -300.00` após dois reforços (R$ 200 + R$ 100)
- Isso também infla o "Saldo Atual": a fórmula `opening + cash + reforços − withdrawals` vira `500 + 0 + 300 − (−300) = 1100`, contando o reforço duas vezes

### Correção

`src/hooks/use-pdv-cashier.ts`, dentro de `addMovement.mutationFn` (linhas 181–194):

- **Manter** o `INSERT` em `pdv_cashier_movements` para os dois tipos (histórico e contagem de reforços no front continuam funcionando).
- **Só atualizar `total_withdrawals` quando `type === "sangria"`.** Reforço não mexe em nenhum total da sessão; o `Cashier.tsx` já calcula `totalReinforcements` somando os movimentos.

```ts
if (type === "sangria") {
  await supabase
    .from("pdv_cashier_sessions")
    .update({ total_withdrawals: activeSession.total_withdrawals + amount })
    .eq("id", activeSession.id);
}
// reforço: nada a atualizar na sessão
```

### Migração de saneamento (sessões já corrompidas)

Sessões abertas que já tiveram reforços antes da correção têm `total_withdrawals` negativo. Vou incluir uma migração SQL única que recalcula o campo a partir das movimentações reais para todas as sessões (abertas e fechadas), mantendo a integridade do histórico:

```sql
UPDATE public.pdv_cashier_sessions s
SET total_withdrawals = COALESCE((
  SELECT SUM(amount)
  FROM public.pdv_cashier_movements m
  WHERE m.cashier_session_id = s.id
    AND m.type = 'sangria'
), 0);
```

Isso zera o `total_withdrawals` das sessões que só tiveram reforços e mantém o valor correto onde houve sangria real.

### Validação

- Sessão atual após a migração: card "Sangrias" mostra **R$ 0,00**, "Reforços" mostra **+R$ 300,00**, "Saldo Atual" = **R$ 800,00** (500 abertura + 300 reforços).
- Novo reforço de R$ 50 → só cria a linha em `pdv_cashier_movements`, nada em sangrias, saldo sobe para R$ 850.
- Sangria de R$ 100 → cria linha `sangria` e `total_withdrawals` vira 100, card "Sangrias" mostra **R$ 100,00**, saldo cai para R$ 750.

