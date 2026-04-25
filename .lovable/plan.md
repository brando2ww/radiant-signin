## Separar Saldo da Gaveta e Total de Vendas + conferência por forma de pagamento

Reorganizar caixa para tratar dois conceitos independentes: **dinheiro físico** (gaveta) e **total recebido por forma**, com fechamento que confere cada máquina/extrato separadamente.

---

### 1. Banco de dados (migração)

Adicionar colunas a `pdv_cashier_sessions`:
- `total_credit numeric default 0` — vendas em cartão de crédito
- `total_debit numeric default 0` — vendas em cartão de débito
- `total_voucher numeric default 0` — vendas em vale-refeição
- `total_change numeric default 0` — troco entregue (para calcular dinheiro líquido)
- `declared_cash numeric` — dinheiro contado na gaveta no fechamento
- `declared_credit numeric` — total declarado pelo operador (máquina crédito)
- `declared_debit numeric` — total declarado pelo operador (máquina débito)
- `declared_pix numeric` — total declarado conforme extrato PIX
- `declared_voucher numeric` — total declarado pela máquina VR
- `cash_difference numeric` — diferença gaveta (mantida; renomear conceitualmente sem renomear coluna `balance_difference`; usar nova coluna)
- `credit_difference / debit_difference / pix_difference / voucher_difference numeric`
- `differences_justified jsonb` — `{ cash?: string, credit?: string, debit?: string, pix?: string, voucher?: string }`

Coluna `total_card` existente: passa a representar a soma de crédito+débito (mantida por compatibilidade; será populada por trigger ou em código).

---

### 2. Tipos de forma de pagamento

**Em `use-pdv-payments.ts`:** ampliar `PaymentMethod`:
```ts
export type PaymentMethod = "dinheiro" | "credito" | "debito" | "pix" | "vale_refeicao";
```
Manter retrocompat: aceitar `"cartao"` na entrada, mapeando para `credito` por padrão (hoje o `PaymentDialog` já distingue `cardType: "credito" | "debito"` — passar o método correto direto).

**No `PaymentDialog`:** ao confirmar pagamento, mapear:
- método `cartao` + `cardType=credito` → `"credito"`
- método `cartao` + `cardType=debito` → `"debito"`
- novo botão "VR" → `"vale_refeicao"`

**Atualização da sessão** em `registerPayment` / `registerTablePayment` / `registerPartialPayment`:
```ts
total_sales += amount
if dinheiro:        total_cash += amount;     total_change += changeAmount
if credito:         total_credit += amount;   total_card += amount
if debito:          total_debit += amount;    total_card += amount
if pix:             total_pix += amount
if vale_refeicao:   total_voucher += amount
```

`total_cash` = bruto recebido em dinheiro. `total_change` = troco entregue. **Dinheiro líquido = total_cash − total_change**.

---

### 3. Rodapé do caixa (`CashierSummaryFooter.tsx`)

Substituir o grid atual por **dois blocos visualmente separados**:

**Bloco 1 — Gaveta (à esquerda)**
- Abertura
- Dinheiro (líquido) = `total_cash − total_change`
- Reforços (+)
- Sangrias (−)
- **Saldo Atual da Gaveta** = `Abertura + Dinheiro líquido + Reforços − Sangrias` (destaque)

**Bloco 2 — Vendas por forma (à direita, informativo)**
- Crédito
- Débito
- PIX
- Vale-refeição
- Dinheiro (bruto)
- **Total Vendas** = soma de tudo (destaque secundário)

Layout: dois `Card` lado a lado em desktop, empilhados em mobile. Ícones e cores diferentes para deixar claro que são conceitos distintos.

`Cashier.tsx` (linha ~171) recalcula:
```ts
const netCash = totalCash - totalChange;
const drawerBalance = openingBalance + netCash + totalReinforcements - totalWithdrawals;
```
Passa `drawerBalance` (gaveta) e `totalSales` (vendas) ao footer como dois números distintos.

---

### 4. Diálogo de fechamento (`CloseCashierDialog.tsx`)

Reescrever em duas seções:

**Grupo 1 — Contagem da gaveta**
- Mostra: Abertura, Dinheiro líquido, Reforços, Sangrias, **Saldo Esperado da Gaveta**
- Input: "Dinheiro contado na gaveta" (`declared_cash`)
- Diferença: contado − esperado, com badge (sobra/falta) e classificação de risco (mantém escala atual: ok/baixa/média/alta/crítica)

**Grupo 2 — Conferência por forma de pagamento**
Para cada forma com `total_x > 0`, exibir um card com:
- Esperado (do sistema)
- Input: "Conforme máquina/extrato" (`declared_x`)
- Diferença com badge ✓ conferido / ⚠ divergência

Formas: Crédito, Débito, PIX, Vale-refeição. Dinheiro fica no Grupo 1.

**Justificativas**
Para cada divergência (gaveta ou qualquer forma) ≠ 0, exigir campo de justificativa específico (mín 30 caracteres). Salvar em `differences_justified` (jsonb).

**Resumo final (rodapé do diálogo)**
- Total geral de vendas do turno
- Saldo da gaveta esperado vs contado
- Linha por forma com status: ✓ conferido / ⚠ divergência justificada / ✗ pendente
- Botão "Confirmar Fechamento" só habilita quando: gaveta OK ou justificada, e todas as formas com divergência têm justificativa.

---

### 5. Hook `use-pdv-cashier.ts` — `closeCashier`

Receber novos campos:
```ts
{
  sessionId,
  declaredCash, declaredCredit, declaredDebit, declaredPix, declaredVoucher,
  justifications: { cash?, credit?, debit?, pix?, voucher? },
  riskLevel,
}
```
Calcular diferenças em colunas próprias e atualizar a sessão. Manter `closing_balance / expected_balance / balance_difference` populados (gaveta) por compatibilidade com relatórios atuais.

---

### 6. Recibo de fechamento (`printCashierReport`)

Atualizar HTML para incluir a tabela de conferência por forma (esperado / declarado / diferença / status) e separar visualmente "RESUMO DA GAVETA" de "VENDAS POR FORMA".

---

### 7. Pontos colaterais

- `CashMovementsList.tsx` e `pdv_cashier_movements.payment_method`: aceitar os novos valores `credito`, `debito`, `vale_refeicao` na exibição.
- `use-pdv-reports.ts` e `CashierStatement.tsx`: agrupar por forma usando os novos campos quando presentes; manter fallback para sessões antigas.
- Campo `total_change`: registrar a cada pagamento em dinheiro com troco; valor sempre subtraído da gaveta.

---

### Fora do escopo (não muda)

- Lógica de aceitar/recusar pagamento, NFC-e e descontos permanece igual.
- Comandas e fluxo do garçom permanecem iguais.
- Sessões antigas (sem novos campos) continuam abrindo/fechando — apenas não terão a conferência detalhada por forma.