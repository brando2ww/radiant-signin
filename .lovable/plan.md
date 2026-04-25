# Corrigir venda no cartão que não aparece no rodapé

## Diagnóstico

A venda de **R$ 239,00 (Mesa #f732877f)** foi registrada como `payment_method = "cartao"` (método legado), antes da nova lógica entrar em produção. Na sessão atual de caixa o estado está assim:

```
total_sales   = 239,00   ← aparece em "Total Vendas" ✅
total_card    = 239,00   ← coluna legada, ninguém lê mais
total_credit  =   0,00   ← rodapé mostra R$ 0,00 ❌
total_debit   =   0,00   ← rodapé mostra R$ 0,00 ❌
```

O novo `CashierSummaryFooter` lê apenas `total_credit` e `total_debit`, então a venda existe contabilmente mas não aparece em nenhum dos dois quadros de cartão.

A causa: o movimento foi criado **antes** da migration que separou Crédito/Débito. Vendas novas já entram corretas (o `PaymentDialog` distingue Crédito x Débito e `normalizeMethod` mantém o resto consistente).

## Correção

Como não temos como saber se a venda original foi Crédito ou Débito (o operador não escolheu na época), vamos tratar o legado como **Crédito** por padrão — é o mais comum e o critério mais seguro para conferência no fechamento.

### 1. Migration de backfill (one-shot)

Para todos os movimentos antigos com `payment_method = 'cartao'`:

- Atualizar `pdv_cashier_movements.payment_method` de `'cartao'` para `'credito'`.
- Em cada `pdv_cashier_sessions` impactada, mover o valor de `total_card` para `total_credit` quando `total_credit = 0` (evita duplicar caso já tenha havido conciliação manual).

Resultado esperado para a sessão atual:
```
total_credit = 239,00   ✅
total_card   = 239,00   (mantido como espelho legado)
```

### 2. Salvaguarda no rodapé (defesa em profundidade)

Em `src/pages/pdv/Cashier.tsx`, ao montar os totais para o `CashierSummaryFooter`:

- Se `totalCredit + totalDebit === 0` **e** `totalCard > 0`, exibir o valor de `totalCard` na linha de **Crédito** (fallback puramente visual).

Isso garante que qualquer outra sessão antiga ou caso de borda não fique com a coluna em branco mesmo se a migration falhar para algum registro.

### 3. Sem mudanças no fluxo novo

O `PaymentDialog` já registra corretamente `credito` ou `debito` conforme o `cardType` escolhido. Nada a ajustar lá.

## Arquivos afetados

- **Nova migration**: `supabase/migrations/<timestamp>_backfill_cartao_to_credito.sql`
- `src/pages/pdv/Cashier.tsx` — fallback `totalCard → totalCredit` na composição das props do footer

## Verificação após implementação

1. Recarregar `/pdv/caixa` e conferir que a linha **Crédito** mostra **R$ 239,00**.
2. **Total Vendas** continua **R$ 239,00** (não duplica).
3. **Saldo da Gaveta** continua **R$ 458,25** (cartão não soma na gaveta).
4. Fazer uma nova venda em Débito e validar que cai em **Débito**, não em Crédito.
