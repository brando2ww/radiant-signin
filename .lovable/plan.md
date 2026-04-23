

## Saldo Esperado no fechamento de caixa ignora os reforços

### Causa

No diálogo "Fechar Caixa" (`src/components/pdv/CloseCashierDialog.tsx`), o **Saldo Esperado** é calculado em dois lugares com a fórmula incompleta:

```
Saldo Esperado = Abertura + Vendas em dinheiro − Sangrias
```

Faltam os **Reforços**. Por isso, no print enviado, o usuário tem 3 reforços somando R$ 300, mas a tela mostra:

- Saldo Inicial: R$ 500,00
- Vendas em Dinheiro: R$ 0,00
- Sangrias: R$ 0,00
- **Saldo Esperado: R$ 500,00** ❌ (deveria ser R$ 800,00)
- Saldo Atual (rodapé): R$ 800,00 ✅

O rodapé (`Cashier.tsx`) já usa a fórmula correta `opening + cash + reforços − withdrawals`. O dialog precisa seguir o mesmo padrão.

Como o saldo informado fica zerado e o esperado é R$ 500, a diferença vira R$ −500 e dispara o bloqueio "Fechamento Bloqueado / divergência R$ 500".

### Correção

`src/components/pdv/CloseCashierDialog.tsx` — aplicar a fórmula central nos **dois lugares** onde `expectedBalance` é calculado:

```
Saldo Esperado = Abertura + Vendas em dinheiro (líquido de troco) + Reforços − Sangrias
```

1. **`printCashierReport` (linhas 138–144):** mover o cálculo de `totalReinforcements` para antes do `expectedBalance` e somá-lo:
   ```ts
   const totalReinforcements = movements
     .filter((m) => m.type === "reforco")
     .reduce((acc, m) => acc + m.amount, 0);
   const expectedBalance = openingBal + totalCash + totalReinforcements - totalWithdrawals;
   ```

2. **`CloseCashierDialog` componente (linhas 274–277):** calcular `totalReinforcements` a partir de `movements` (já recebido por props) e incluir na fórmula:
   ```ts
   const totalReinforcements = useMemo(
     () => movements.filter((m) => m.type === "reforco").reduce((a, m) => a + m.amount, 0),
     [movements]
   );
   const expectedBalance =
     (session?.opening_balance || 0) +
     (session?.total_cash || 0) +
     totalReinforcements -
     (session?.total_withdrawals || 0);
   ```

3. **Linha de Reforços no resumo do dialog:** verificar se a UI do diálogo já lista "Reforços" (o screenshot mostra apenas Saldo Inicial / Vendas / Sangrias / Saldo Esperado). Adicionar uma linha "Reforços: + R$ X,XX" entre "Vendas em PIX" e "Sangrias" para que o usuário visualize a parcela que compõe o Saldo Esperado. (Se já existir, reaproveitar.)

4. **Cuponário impresso (`printCashierReport`):** já lista "Reforços" na linha 212 com o valor certo; só ajustar a fórmula do `expectedBalance` (item 1) para o demonstrativo bater com a tela.

### Sobre "líquido de troco"

Hoje, o `total_cash` da sessão é incrementado em `registerSale` com o `amount` do pagamento em dinheiro. Como a regra que quero seguir é **líquido de troco** (ou seja, dinheiro efetivamente retido no caixa), preciso confirmar como está sendo registrado quando há troco no `PaymentDialog`. Vou checar isso na implementação:
- Se `registerSale` já recebe o valor líquido (recebido − troco), nada a fazer.
- Se está somando o valor bruto (ex.: R$ 100 recebido para uma conta de R$ 77, somando R$ 100 em vez de R$ 77 em `total_cash`), corrigir o ponto onde `paymentMethod === "dinheiro"` é tratado para somar apenas o valor da venda em dinheiro, não o recebido.

Esse ajuste é incluído na implementação se necessário, mantendo a fórmula central única.

### Validação

Cenário do screenshot (R$ 500 abertura + 3 reforços de R$ 100/200/0):
- Saldo Esperado deve mostrar **R$ 800,00** (igual ao rodapé "Saldo Atual").
- Informando R$ 800 no campo "Saldo Final em Dinheiro" → diferença R$ 0,00, sem bloqueio.
- Informando R$ 750 → diferença −R$ 50, risco baixo/médio conforme regras existentes, justificativa exigida.
- Demonstrativo impresso bate linha a linha com o dialog.
- Próxima venda em dinheiro: Saldo Esperado sobe pelo valor líquido (descontado o troco).

