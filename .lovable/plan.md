## Alterar fórmula do "Saldo Atual" do caixa

O saldo passa a refletir **todas as vendas cobradas**, independentemente da forma de pagamento.

### Mudança

**`src/pages/pdv/Cashier.tsx`** (linha 171)

Trocar:
```ts
const currentBalance = openingBalance + totalCash + totalReinforcements - totalWithdrawals;
```
por:
```ts
const currentBalance = openingBalance + totalSales + totalReinforcements - totalWithdrawals;
```

### Resultado para a sessão atual
- Abertura R$ 458,25 + Vendas R$ 239,00 + Reforços R$ 0 − Sangrias R$ 0 = **R$ 697,25**

### Observação
Isso muda o significado do indicador: ele deixa de representar apenas o dinheiro físico na gaveta e passa a representar o saldo total movimentado pelo caixa (gaveta + recebimentos eletrônicos). O fechamento de caixa e a comparação esperado vs informado continuarão funcionando, pois usam os totais por método de pagamento.